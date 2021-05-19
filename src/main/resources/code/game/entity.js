import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import QuaternionClass from '../utility/quaternion.js';
import MeshClass from '../mesh/mesh.js';
import ModelClass from '../model/model.js';
import ModelEntityAlterClass from '../model/model_entity_alter.js';
import EffectClass from '../game/effect.js';
import CollisionClass from '../collision/collisions.js';

export default class EntityClass
{
    constructor(core,name,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        this.MODEL_ROTATION_ORDER_XYZ=0;
        this.MODEL_ROTATION_ORDER_XZY=1;
        
        this.MODEL_ROTATION_ORDER_LIST=['XYZ','XZY'];
        
        this.core=core;
        this.json=null;
        
        this.name=name;
        this.modelName=null;
        this.frameRate=30;
        this.rotationOrder=this.MODEL_ROTATION_ORDER_XYZ;
        this.radius=1;
        this.height=1;
        this.scale=new PointClass(1,1,1);
        this.modelHideMeshes=null;
        
        this.maxBumpCount=2;
        this.floorRiseHeight=2000;                  // heights we can move up or down on a slanted triangle
        this.collisionSpokeCount=48;                // how many ray spokes we check collisions across x/z
        this.collisionHeightSegmentCount=4;         // how many segements we check collisions across the height
        this.collisionHeightMargin=10;              // sometimes wall segments can extend a couple pixels off of floors or ceilings, so this slop fixes getting stuck on edges
        this.canBeClimbed=false;                    // if this object can be bumped/climbed over
        
        this.position=position.copy();
        this.angle=angle.copy();
        this.data=data;
        this.mapSpawn=mapSpawn;
        this.spawnedBy=spawnedBy;
        this.heldBy=heldBy;
        this.show=show;
        
        this.isPlayer=false;
        this.isRemote=false;
        this.isBot=false;
        
        this.originalPosition=this.position.copy();
        this.originalAngle=this.angle.copy();
        this.originalScale=this.scale.copy();
        
        this.markDelete=false;
        
        this.model=null;
        this.modelEntityAlter=null;
        
        this.eyeOffset=0;
        this.weight=0;

        this.remoteId=-1;       // the network ID
        
        this.gravity=this.core.game.map.gravityMinValue;
        
        this.passThrough=false;
        this.touchEntity=null;
        this.hitEntity=null;
        this.hitPoint=new PointClass(0,0,0);
        
        this.currentCube=null;
        
        this.collideWallMeshIdx=-1;
        this.collideWallTrigIdx=-1;         
        this.slideWallMeshIdx=-1;
        this.slideWallTrigIdx=-1;
        this.collideCeilingMeshIdx=-1;
        this.standOnMeshIdx=-1;
        this.standOnTrigIdx=-1;
        this.standOnEntity=null;
        this.hitHeadOnEntity=null;
        
        this.damageTintStartTick=-1;

        this.checkMovePnt=new PointClass(0,0,0);

        this.collision=new CollisionClass(core);
        
            // remotes
            
        this.remoteId=null;
        
        this.hadRemoteUpdate=false;
        this.remotePositionChange=new PointClass(0,0,0);
        this.remoteAngleChange=new PointClass(0,0,0);
        this.remoteScaleChange=new PointClass(0,0,0);
        
        // no seal, as this object is extended
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
        let meshName;
    
            // setup
            
        if (this.modelName!==null) {
        
                // cached shared model
                
            this.model=this.core.game.map.modelList.get(this.modelName);
            if (this.model===undefined) {
                console.log('model '+this.modelName+' does not exist, needs to be defined in a entity in the map');
                return(false);
            }

                // this entities person model animation/altering data

            this.modelEntityAlter=new ModelEntityAlterClass(this.core,this);
            this.modelEntityAlter.initialize();

            this.modelEntityAlter.frameRate=this.frameRate;
            this.modelEntityAlter.rotationOrder=this.rotationOrder;

            if (this.modelHideMeshes!=null) {
                for (meshName of this.modelHideMeshes) {
                    this.modelEntityAlter.show(meshName,false);
                }
            }
        }
            
        this.originalScale.setFromPoint(this.scale);
        
            // the collision
            
        this.collision.initialize(this);
        
        return(true);
    }
    
    release()
    {
        this.collision.release();
        if (this.modelEntityAlter!==null) this.modelEntityAlter.release();
    }
    
        //
        // timestamps
        //
        
    getTimestamp()
    {
        return(this.core.game.timestamp);
    }
    
    getPeriodicCos(millisecondPeriod,amplitude)
    {
        return(this.core.game.getPeriodicCos(millisecondPeriod,amplitude));
    }
    
    getPeriodicSin(millisecondPeriod,amplitude)
    {
        return(this.core.game.getPeriodicSin(millisecondPeriod,amplitude));
    }
    
    getPeriodicLinear(millisecondPeriod,amplitude)
    {
        return(this.core.game.getPeriodicLinear(millisecondPeriod,amplitude));
    }

    
        //
        // entity utilities
        //
        
    addEntity(typeName,name,position,angle,data,spawnedBy,heldBy,show)
    {
        return(this.core.game.map.entityList.addDynamic(typeName,name,position,angle,data,spawnedBy,heldBy,show));
    }
    
    removeEntity(entity)
    {
        entity.markDelete=true;
    }
    
    holdEntity(entity)
    {
        entity.heldBy=this;
    }
    
    findHeldEntityByName(name)
    {
        return(this.core.game.map.entityList.findHold(this,name));
    }
    
    getPlayer()
    {
        return(this.core.game.map.entityList.getPlayer());
    }
    
    getEntityList()
    {
        return(this.core.game.map.entityList.entities);
    }
        
    isEntityInRange(entity,dist)
    {
        return(entity.position.distance(this.position)<dist);
    }
    
    angleYToEntity(entity)
    {
        return(this.position.angleYTo(entity.position));
    }
    
    turnYTowardsEntity(entity,turnSpeed)
    {
        return(this.angle.turnYTowards(this.position.angleYTo(entity.position),turnSpeed));
    }
    
    damageEntityForRadius(hitEntity,centerPosition,maxDistance,maxDamage)
    {
        let entity,dist,damage;

        for (entity of this.core.game.map.entityList.entities) {
            if (!entity.show) continue;
            
            dist=centerPosition.distance(entity.position);
            if (dist>maxDistance) continue;
            
            damage=Math.trunc((1.0-(dist/maxDistance))*maxDamage);
            entity.damage(hitEntity,damage,centerPosition);
        }
    }
    
    findClosestWithMaxAngle(position,angle,namePrefix,skipEntity,maxAngle,maxDistance)
    {
        return(this.core.game.map.entityList.findClosestWithMaxAngle(position,angle,namePrefix,skipEntity,maxAngle,maxDistance));
    }
    
    inFreezeAI()
    {
        return(this.core.game.freezeAI);
    }
    
    inFreezePlayer()
    {
        return(this.core.game.freezePlayer);
    }
    
        //
        // effect utilities
        //
        
    addEffect(spawnedByEntity,effectName,position,data,show)
    {
        return(this.core.game.map.effectList.add(spawnedByEntity,effectName,position,data,false,show));
    }
    
        //
        // game and map utilities
        //
    
    getGameName()
    {
        return(this.core.game.currentGameName);
    }
    
    getMapName()
    {
        return(this.core.game.currentMapName);
    }
    
    getMapGravityMinValue()
    {
        return(this.core.game.map.gravityMinValue);    
    }
    
    getLiquidForIndex(liquidIdx)
    {
        return(this.core.game.map.liquidList.liquids[liquidIdx]);
    }
    
    getLiquidForPoint(pnt)
    {
        return(this.core.game.map.liquidList.getLiquidForPoint(pnt));
    }
    
    getLiquidForEyePoint(pnt,eyeOffset)
    {
        return(this.core.game.map.liquidList.getLiquidForEyePoint(pnt,eyeOffset));
    }
    
        //
        // node, spots and path utilities
        //
        
    hasSpawnNodes()
    {
        return(this.core.game.map.path.spawnNodes.length!==0);
    }
    
    hasKeyNodes()
    {
        return(this.core.game.map.path.keyNodes.length!==0);
    }

    getRandomKeyNodeIndex()
    {
        return(this.core.game.map.path.getRandomKeyNodeIndex());
    }
    
    findKeyNodeIndex(key)
    {
        return(this.core.game.map.path.findKeyNodeIndex(key));
    }
    
    getNodeKey(nodeIdx)
    {
        return(this.core.game.map.path.getNodeKey(nodeIdx));
    }
    
    getNodeData(nodeIdx)
    {
        return(this.core.game.map.path.getNodeData(nodeIdx));
    }
    
    getNodePosition(nodeIdx)
    {
        return(this.core.game.map.path.getNodePosition(nodeIdx));
    }
    
    getYAngleBetweenNodes(fromNodeIdx,toNodeIdx)
    {
        return(this.core.game.map.path.getYAngleBetweenNodes(fromNodeIdx,toNodeIdx));
    }
    
    findNearestPathNode(maxDistance)
    {
        let n,d,dist;
        let nodeIdx;
        let nodes=this.core.game.map.path.nodes;
        let nNode=nodes.length;
        
        nodeIdx=-1;
        dist=maxDistance;
        
        for (n=0;n!==nNode;n++) {
            d=nodes[n].position.distance(this.position);
            if ((d<dist) || (dist===-1)) {
                dist=d;
                nodeIdx=n;
            }
        }

        return(nodeIdx);
    }
    
    findNearestPathNodeWithinYAngleSweep(maxDistance,yMin,yMax)
    {
        let n,y,d,dist;
        let nodeIdx,pos;
        let nodes=this.core.game.map.path.nodes;
        let nNode=nodes.length;
        
        nodeIdx=-1;
        dist=maxDistance;
        
        for (n=0;n!==nNode;n++) {
            pos=nodes[n].position;
            
                // within the sweep
                
            y=this.position.angleYTo(pos);
            if (yMin<yMax) {
                if ((y<yMin) || (y>yMax)) continue;
            }
            else {
                if ((y<yMax) && (y>yMin)) continue;
            }
            
                // next check is the distance
                
            d=pos.distance(this.position);
            if ((d<dist) || (dist===-1)) {
                dist=d;
                nodeIdx=n;
            }
        }

        return(nodeIdx);
    }
    
    hitPathNode(nodeIdx,slopDistance)
    {
        return(this.core.game.map.path.nodes[nodeIdx].position.distance(this.position)<slopDistance);
    }
    
    nextNodeInPath(fromNodeIdx,toNodeIdx)
    {
        return(this.core.game.map.path.nodes[fromNodeIdx].pathHints[toNodeIdx]);
    }
    
    nextNodeTowardsEntity(fromNodeIdx,entity)
    {
        let n,linkNode,nextNodeIdx;
        let dist,currentDist;
        let nodes=this.core.game.map.path.nodes;
        let node=nodes[fromNodeIdx];
        
        nextNodeIdx=-1;
        currentDist=0;
        
        for (n=0;n!==node.links.length;n++) {
            linkNode=nodes[node.links[n]];
            
            dist=linkNode.position.distance(entity.position);
            if ((n===0) || (dist<currentDist)) {
                currentDist=dist;
                nextNodeIdx=node.links[n];
            }
        }
        
        return(nextNodeIdx);
    }
    
    moveToNode(nodeIdx)
    {
        this.position.setFromPoint(this.core.game.map.path.nodes[nodeIdx].position);
    }
    
    moveToRandomSpawnNode(avoidTelefrag)
    {
        let node;
        let idx,origIdx,hitEntity;
        let nodes=this.core.game.map.path.nodes;
        let spawnNodes=this.core.game.map.path.spawnNodes;
        
            // sanity check
            
        if (spawnNodes.length===0) {
            console.info('there are no spawn nodes - please add some nodes with the spawn flag set to true');
            return;
        }
        
            // random node
            
        idx=Math.trunc(spawnNodes.length*Math.random());

            // check for collisions
            
        origIdx=idx;
        
        while (true) {
            node=nodes[spawnNodes[idx]];
            
                // set the position
                
            this.position.setFromPoint(node.position);
            
            this.angle.setFromValues(0,0,0);
            if (node.links.length>0) this.angle.y=this.position.angleYTo(nodes[node.links[0]].position);
            
                // check for hitting other entities
                
            hitEntity=this.collision.checkEntityCollision(this);
            if (hitEntity===null) return;
            
                // telefrag
                
            if (!avoidTelefrag) {
                hitEntity.telefrag(this);
                return;
            }
            
                // find a different spot
                
            idx++;
            if (idx>=spawnNodes.length) idx=0;
            
            if (idx===origIdx) return;      // ran out of spots, nothing we can do
        }
    }
    
    moveToRandomNode(addPnt,randomOffsetPnt)
    {
        let node;
        let nodes=this.core.game.map.path.nodes;
        
        node=nodes[Math.trunc(nodes.length*Math.random())];
        
        this.position.setFromPoint(node.position);
        this.position.addPoint(addPnt);
        
        this.position.x+=(((Math.random()*2.0)-1.0)*randomOffsetPnt.x);
        this.position.y+=(((Math.random()*2.0)-1.0)*randomOffsetPnt.y);
        this.position.z+=(((Math.random()*2.0)-1.0)*randomOffsetPnt.z);
    }
        
    turnYTowardsNode(nodeIdx,turnSpeed)
    {
        return(this.angle.turnYTowards(this.position.angleYTo(this.core.game.map.path.nodes[nodeIdx].position),turnSpeed));
    }
    
    getTurnYTowardsNode(nodeIdx)
    {
        return(this.angle.getTurnYTowards(this.position.angleYTo(this.core.game.map.path.nodes[nodeIdx].position)));
    }
    
    getVectorToNode(nodeIdx,pnt)
    {
        pnt.setFromSubPoint(this.core.game.map.path.nodes[nodeIdx].position,this.position);
    }
    
    checkPathPerpendicularXZCollision(nodeIdx,line,hitPnt)
    {
        return(this.core.game.map.path.checkPerpendicularXZCollision(nodeIdx,line,hitPnt));
    }
    
    translatePathPerpendicularXZHitToOtherPerpendicularXZHit(hitNodeIdx,hitPnt,otherNodeIdx,otherHitPnt)
    {
        return(this.core.game.map.path.translatePerpendicularXZHitToOtherPerpendicularXZHit(hitNodeIdx,hitPnt,otherNodeIdx,otherHitPnt));
    }
    
    getRandomUnusedSpotAndMark()
    {
        return(this.core.game.map.spotList.getRandomUnusedSpotAndMark());
    }
    
        //
        // cube utilities
        //
        
    findCubeContainingEntity()
    {
        return(this.core.game.map.cubeList.findCubeContainingEntity(this));
    }
    
        //
        // move utilities
        //
    
    moveInMapXZ(movePnt,bump,slide)
    {
        let slideSpeed;
        
            // clear collisions
            
        this.touchEntity=null;
        this.collideWallMeshIdx=-1;
        this.slideWallMeshIdx=-1;
        
            // if no movement, then skip
        
        if ((movePnt.x===0) && (movePnt.z===0)) return;
        
            // run the collision which returns
            // false if no hit (and adds a possible bump
            // value to movePnt)
        
        this.checkMovePnt.setFromValues(movePnt.x,0,movePnt.z);
        
        if (!this.collision.moveEntityInMap(this,this.checkMovePnt,bump)) {
            this.position.addPointTrunc(this.checkMovePnt);
            return;
        }
        
            // try to slide
      
        if (slide) {
            this.slideWallMeshIdx=this.collideWallMeshIdx;
            this.slideWallTrigIdx=this.collideWallTrigIdx;
            
            slideSpeed=Math.trunc(Math.sqrt((movePnt.x*movePnt.x)+(movePnt.z*movePnt.z)));
            
            this.checkMovePnt.setFromValues((Math.sign(movePnt.x)*slideSpeed),0.0,0.0);

            if (!this.collision.moveEntityInMap(this,this.checkMovePnt,false)) {
                this.position.addPointTrunc(this.checkMovePnt);
                return;
            }

            this.checkMovePnt.setFromValues(0.0,0.0,(Math.sign(movePnt.z)*slideSpeed));

            if (!this.collision.moveEntityInMap(this,this.checkMovePnt,false)) {
                this.position.addPointTrunc(this.checkMovePnt);
                return;
            }
            
            this.slideWallMeshIdx=-1;       // was a collision after all
        }
    }
    
    moveInMapY(movePnt,gravityFactor,noGravity)
    {
        let yAdd,fallY,riseY,maxValue;
        let map=this.core.game.map;
        
            // clear collisions
            
        this.collideCeilingMeshIdx=-1;
        this.standOnMeshIdx=-1;
        
            // get the initial y movement
            
        yAdd=movePnt.y;
          
            // add in gravity
            
        if (noGravity) {
            this.gravity=map.gravityMinValue;
        }
        else {
                // if there is upwards movement (usually a jump or push)
                // then reduce it by the current gravity acceleration
  
            if (movePnt.y>0) {
                movePnt.y-=((this.weight*map.gravityAcceleration)*gravityFactor);
                if (movePnt.y<=0) {
                    this.gravity=-movePnt.y;
                    movePnt.y=0;
                }
                else {
                    this.gravity=map.gravityMinValue;
                }
            }
            
                // otherwise run the gravity and
                // add it into the movement

            else {
                this.gravity+=((this.weight*map.gravityAcceleration)*gravityFactor);
                
                maxValue=map.gravityMaxValue*gravityFactor;
                if (this.gravity>maxValue) this.gravity=maxValue;
            
                yAdd-=this.gravity;
            }
        }
        
            // moving down
            
        if (yAdd<=0) {
            this.collideCeilingMeshIdx=-1;                         // no ceiling collisions if going down
            this.hitHeadOnEntity=null;

            fallY=this.collision.fallEntityInMap(this,yAdd);
            this.position.addValuesTrunc(0,fallY,0);
        
            if (fallY>=0) {
                this.gravity=map.gravityMinValue;                  // if we are rising or stopped by a floor, restart gravity
                return(movePnt.y);
            }
        }
        
            // moving up
            
        else {
            this.standOnMeshIdx=-1;                                 // no standing if going up
            this.standOnEntity=null;
            
            riseY=this.collision.riseEntityInMap(this,yAdd);
            this.position.addValuesTrunc(0,riseY,0);
            
            if (Math.trunc(riseY)<Math.trunc(yAdd)) return(0);      // if we can't get as high as we want, then clear any movement
        }
        
        return(movePnt.y);
    }
    
    simpleMoveEntityInMap(movePnt)
    {
        if (this.collision.simpleMoveEntityInMap(this,movePnt)) return(true);
        
        this.position.addPointTrunc(movePnt);
        return(false);
    }
    
        //
        // pushing
        //
        
    meshPush(mesh,movePnt,rotateAng)
    {
        let lft,rgt,top,bot;
        
            // lifting
            
        if (movePnt.y<0) {
            if (this.standOnMeshIdx!==-1) {
                if (this.core.game.map.meshList.meshes[this.standOnMeshIdx]===mesh) {
                    if (this.position.y<=mesh.yBound.min) {
                        this.position.y=Math.trunc(mesh.yBound.min)+1;
                    }
                }
            }
        }
        
            // shoving out of way

        if ((movePnt.x===0) && (movePnt.z===0) && (rotateAng.y===0)) return;
        
            // are we within the bounds
            
        lft=this.position.x-this.radius;
        rgt=this.position.x+this.radius;
        top=this.position.z-this.radius;
        bot=this.position.z+this.radius;
        
        if ((lft>=mesh.xBound.max) || (rgt<=mesh.xBound.min)) return;
        if ((top>=mesh.zBound.max) || (bot<=mesh.zBound.min)) return;
       
            // shove them to rough bounds of object
            // if a part is within the bounds, then push
            // out the smallest way
            
        if (((lft>mesh.xBound.min) && (lft<mesh.xBound.max)) || ((rgt>mesh.xBound.min) && (rgt<mesh.xBound.max))) {
            if (Math.abs(this.position.x-(mesh.xBound.max+this.radius))<Math.abs(this.position.x-(mesh.xBound.min-this.radius))) {
                this.position.x=mesh.xBound.max+this.radius;
            }
            else {
                this.position.x=mesh.xBound.min-this.radius;
            }
        }
            
        if (((top>mesh.zBound.min) && (top<mesh.zBound.max)) || ((bot>mesh.zBound.min) && (bot<mesh.zBound.max))) {
            if (Math.abs(this.position.z-(mesh.zBound.max+this.radius))<Math.abs(this.position.z-(mesh.zBound.min-this.radius))) {
                this.position.z=mesh.zBound.max+this.radius;
            }
            else {
                this.position.z=mesh.zBound.min-this.radius;
            }
        }
    }
    
    entityPush(entity,movePnt)
    {
        return(false);
    }
    
        //
        // movement utilities
        //
        
    floorBounce(motion,bounceFactor)
    {
        motion.y=-((motion.y+this.gravity)*bounceFactor);
        this.gravity=this.core.game.map.gravityMinValue;
        
        if (Math.abs(motion.y)<this.weight) motion.y=0;
    }
    
    wallReflect(motion)
    {
        let sn,cs,x,z,rang,normal;
        let collisionTrig;
        
            // get the normal
            
        collisionTrig=this.core.game.map.meshList.meshes[this.collideWallMeshIdx].collisionWallTrigs[this.collideWallTrigIdx];
        normal=collisionTrig.normal;
        
            // get the angle between the normal and
            // the reversed hit vector (so they both can start
            // at the same point)
            
        motion.x=-motion.x;
        motion.z=-motion.z;
            
        rang=Math.atan2(normal.z,normal.x)-Math.atan2(motion.z,motion.x);
        
            // now rotate double the angle from the normal
            // to get the reflection motion
            // note this is based on positive x/counter-clockwise
            // which is different from out regular rotations
        
        rang=-(rang*2.0);
        sn=Math.sin(rang);
        cs=Math.cos(rang);
        
        x=(motion.z*sn)+(motion.x*cs);   // this is based on the positive X, because atan2 is angle from positive x, counter-clockwise
        z=(motion.z*cs)-(motion.x*sn);
        
        motion.x=x;
        motion.z=z;
    }
    
        //
        // collision utilities
        //
        
    rayCollision(pnt,vector,hitPnt)
    {
        return(this.collision.rayCollision(this,pnt,vector,hitPnt));
    }
    
    getRigidBodyAngle(rigidAngle,maxDrop,maxAngle)
    {
        return(this.collision.getRigidBodyAngle(this,rigidAngle,maxDrop,maxAngle));
    }
    
        //
        // position information
        //
        
    getInLiquidIndex()
    {
        return(this.core.game.map.liquidList.getLiquidForPoint(this.position));
    }
    
    getUnderLiquidIndex()
    {
        return(this.core.game.map.liquidList.getLiquidForEyePoint(this.position,this.eyeOffset));
    }
    
    isStandingOnFloor()
    {
        return(this.standOnMeshIdx!==-1);
    }
    
    isHitCeiling()
    {
        return(this.collideCeilingMeshIdx!==-1);
    }
    
    isAnyCollision()
    {
        if (this.touchEntity!==null) return(true);
        if (this.collideWallMeshIdx!==-1) return(true);
        if (this.collideCeilingMeshIdx!==-1) return(true);
        if (this.standOnMeshIdx!==-1) return(true);
        
        return(false);
    }
    
        //
        // animations
        //
        
    startAnimation(animation)
    {
        this.modelEntityAlter.startAnimationChunkInFrames(animation);
    }
    
    queueAnimation(animation)
    {
        this.modelEntityAlter.queueAnimationChunkInFrames(animation);
    }
    
    queueAnimationStop()
    {
        this.modelEntityAlter.queueAnimationStop();
    }
    
    isAnimationQueued()
    {
        return(this.modelEntityAlter.isAnimationQueued());
    }
    
    interuptAnimation(animation)
    {
        this.modelEntityAlter.interuptAnimationChunkInFrames(animation);
    }
    
    continueAnimation(animation)
    {
        this.modelEntityAlter.continueAnimationChunkInFrames(animation);
    }
    
    getAnimationTickCount(animation)
    {
        return(this.modelEntityAlter.getAnimationTickCount(animation));
    }
    
    getAnimationFinishTimestampFromFrame(frame,animation)
    {
        return(this.modelEntityAlter.getAnimationFinishTimestampFromFrame(frame,animation));
    }
    
        //
        // models
        //
        
    setModelDrawAttributes(position,angle,scale,inCameraSpace)
    {
        this.modelEntityAlter.position.setFromPoint(position);
        this.modelEntityAlter.angle.setFromPoint(angle);
        this.modelEntityAlter.scale.setFromPoint(scale);
        this.modelEntityAlter.inCameraSpace=inCameraSpace;
    }
    
    boundBoxInFrustum()
    {
        return(this.modelEntityAlter.boundBoxInFrustum());
    }
    
        //
        // camera
        //
        
    cameraGotoFirstPerson()
    {
        this.core.game.camera.gotoFirstPerson();
    }
    
    cameraIsFirstPerson()
    {
        return(this.core.game.camera.isFirstPerson());
    }
    
    cameraGotoThirdPerson(distance,angle)
    {
        this.core.game.camera.gotoThirdPerson(distance,angle);
    }
    
    cameraGotoTopDown(distance)
    {
        this.core.game.camera.gotoTopDown(distance);
    }
    
    cameraGotoPlatform(distance,cameraYUpMoveFactor,cameraYDownMoveFactor)
    {
        this.core.game.camera.gotoPlatform(distance,cameraYUpMoveFactor,cameraYDownMoveFactor);
    }
    
    cameraSetPlatformYOffset(offset)
    {
        this.core.game.camera.setPlatformYOffset(offset);
    }
    
        //
        // sounds
        //
    
    playSound(sound)
    {
        return(this.core.audio.soundStartGameFromList(this.core.game.map.soundList,this.position,sound));
    }
    
    playSoundAtPosition(position,sound)
    {
        return(this.core.audio.soundStartGameFromList(this.core.game.map.soundList,position,sound));
    }
    
    stopSound(soundPlayIdx)
    {
        this.core.audio.soundStop(soundPlayIdx);
    }
    
    changeSoundRate(soundPlayIdx,rate)
    {
        this.core.audio.soundChangeRate(soundPlayIdx,rate);
    }
    
    getSoundMillisecondDuration(sound)
    {
        return(this.core.game.map.soundList.getMillisecondDurationJson(sound));
    }
    
    musicSetRate(rate)
    {
        this.core.audio.musicSetRate(rate);
    }
    
        //
        // meshes
        //
        
    showMesh(meshName,show)
    {
        this.modelEntityAlter.show(meshName,show);
    }
    
        //
        // input
        //
        
    getSetup()
    {
        return(this.core.setup);
    }
    
    isKeyDown(key)
    {
        return(this.core.input.isKeyDown(key));
    }
    
    isKeyDownAndClear(key)
    {
        return(this.core.input.isKeyDownAndClear(key));
    }
    
    isMouseButtonDown(buttonIdx)
    {
        return(this.core.input.mouseButtonFlags[buttonIdx]);
    }
    
    getMouseMoveX()
    {
        return(this.core.input.getMouseMoveX());
    }
    
    getMouseMoveY()
    {
        return(this.core.input.getMouseMoveY());
    }
    
    mouseWheelRead()
    {
        return(this.core.input.mouseWheelRead());
    }
    
    hasTouch()
    {
        return(this.core.input.hasTouch);
    }
    
    isTouchStickLeftClick()
    {
        return(this.core.game.overlay.isTouchStickLeftClick());
    }
    
    isTouchStickRightClick()
    {
        return(this.core.game.overlay.isTouchStickRightClick());
    }
    
    getTouchStickLeftX()
    {
        return(this.core.game.overlay.getTouchSwipeLeftX());
    }
    
    getTouchStickLeftY()
    {
        return(this.core.game.overlay.getTouchSwipeLeftY());
    }
    
    getTouchStickRightX()
    {
        return(this.core.game.overlay.getTouchSwipeRightX());
    }
    
    getTouchStickRightY()
    {
        return(this.core.game.overlay.getTouchSwipeRightY());
    }
    
    getTouchSwipeLeftX()
    {
        return(this.core.game.overlay.getTouchSwipeLeftX());
    }
    
    getTouchSwipeLeftY()
    {
        return(this.core.game.overlay.getTouchSwipeLeftY());
    }
    
    getTouchSwipeRightX()
    {
        return(this.core.game.overlay.getTouchSwipeRightX());
    }
    
    getTouchSwipeRightY()
    {
        return(this.core.game.overlay.getTouchSwipeRightY());
    }
    
    isTouchStickLeftOn()
    {
        return(this.core.game.overlay.isTouchStickLeftOn());
    }
    
    isTouchStickLeftDown()
    {
        return(this.core.game.overlay.isTouchStickLeftDown());
    }
    
    isTouchStickRightOn()
    {
        return(this.core.game.overlay.isTouchStickRightOn());
    }
    
    isTouchStickRightDown()
    {
        return(this.core.game.overlay.isTouchStickRightDown());
    }
    
        //
        // triggers
        //
        
    setTrigger(name)
    {
        this.core.game.setTrigger(name);
    }
    
    checkTrigger(name)
    {
        return(this.core.game.checkTrigger(name));
    }
    
        //
        // overlays
        //
     
    showElement(id,show)
    {
        this.core.game.overlay.showElement(id,show);
    }
    
    pulseElement(id,tick,expand)
    {
        this.core.game.overlay.pulseElement(id,tick,expand);
    }
    
    updateText(id,str)
    {
        this.core.game.overlay.updateText(id,str);
    }
    
    setCount(id,count)
    {
        this.core.game.overlay.setCount(id,count);
    }
    
    setDial(id,value)
    {
        this.core.game.overlay.setDial(id,value);
    }
    
    hitFlashLeft(tick)
    {
        this.core.game.overlay.hitOverlay.flash(this.core.game.overlay.hitOverlay.SIDE_LEFT,tick);
    }
    
    hitFlashRight(tick)
    {
        this.core.game.overlay.hitOverlay.flash(this.core.game.overlay.hitOverlay.SIDE_RIGHT,tick);
    }
    
    hitFlashTop(tick)
    {
        this.core.game.overlay.hitOverlay.flash(this.core.game.overlay.hitOverlay.SIDE_TOP,tick);
    }
    
    hitFlashBottom(tick)
    {
        this.core.game.overlay.hitOverlay.flash(this.core.game.overlay.hitOverlay.SIDE_BOTTOM,tick);
    }
    
    hitFlashAll(tick)
    {
        this.core.game.overlay.hitOverlay.flash(this.core.game.overlay.hitOverlay.SIDE_ALL,tick);
    }
    
    multiplayerAddScore(fromEntity,entity,isTelefrag)
    {
        this.core.game.overlay.multiplayerAddScore(fromEntity,entity,isTelefrag);
    }
    
    multiplayerShowScores(show)
    {
        this.core.game.overlay.multiplayerShowScores(show);
    }
    
        //
        // networking utilities
        //
    
    isMultiplayerGame()
    {
        return(this.core.game.multiplayerMode!==this.core.game.MULTIPLAYER_MODE_NONE);
    }
    
    getMultiplayerRespawnWaitTick()
    {
        return(this.core.setup.multiplayerRespawnTime*1000);
    }
    
    sendCustomNetworkMessage(intParam0,intParam1,intParam2,floatParam0,floatParam1,floatParam2,stringParam0,stringParam1,stringParam2)
    {
        this.core.game.network.sendCustomMessage(this,intParam0,intParam1,intParam2,floatParam0,floatParam1,floatParam2,stringParam0,stringParam1,stringParam2);
    }
    
    getUpdateNetworkData(msgType,remoteId)
    {
        let buffer=new ArrayBuffer(59);
        let dataView=new DataView(buffer);
        
        dataView.setInt16(0,msgType);
        dataView.setInt16(2,remoteId);
        dataView.setInt16(4,this.radius);
        dataView.setInt16(6,this.height);
        dataView.setInt32(8,this.modelEntityAlter.position.x);
        dataView.setInt32(12,this.modelEntityAlter.position.y);
        dataView.setInt32(16,this.modelEntityAlter.position.z);
        dataView.setFloat32(20,this.modelEntityAlter.angle.x);
        dataView.setFloat32(24,this.modelEntityAlter.angle.y);
        dataView.setFloat32(28,this.modelEntityAlter.angle.z);
        dataView.setFloat32(32,this.modelEntityAlter.scale.x);
        dataView.setFloat32(36,this.modelEntityAlter.scale.y);
        dataView.setFloat32(40,this.modelEntityAlter.scale.z);
        dataView.setInt32(44,this.modelEntityAlter.getUpdateNetworkShowData());
        dataView.setInt32(48,this.modelEntityAlter.currentAnimationStartTimestamp);
        dataView.setInt32(52,this.modelEntityAlter.currentAnimationLoopStartTick);
        dataView.setInt32(54,this.modelEntityAlter.currentAnimationLoopEndTick);
        dataView.setInt8(58,(this.modelEntityAlter.queuedAnimationStop?0:1));
        
        return(buffer);
    }
    
    putUpdateNetworkData(dataView)
    {
        let x,y,z;
        
            // size and position
            
        this.radius=dataView.getInt16(4);
        this.height=dataView.getInt16(6);
        
        x=dataView.getInt32(8);
        y=dataView.getInt32(12);
        z=dataView.getInt32(16);
        
        this.remotePositionChange.setFromValues((x-this.position.x),(y-this.position.y),(z-this.position.z));
        this.position.setFromValues(x,y,z);
        
        x=dataView.getFloat32(20);
        y=dataView.getFloat32(24);
        z=dataView.getFloat32(28);
        
        this.remoteAngleChange.setFromValues((x-this.angle.x),(y-this.angle.y),(z-this.angle.z));
        this.angle.setFromValues(x,y,z);
        
        x=dataView.getFloat32(32);
        y=dataView.getFloat32(36);
        z=dataView.getFloat32(40);
        
        this.remoteScaleChange.setFromValues((x-this.scale.x),(y-this.scale.y),(z-this.scale.z));
        this.scale.setFromValues(x,y,z);
        
            // animations
            
        this.modelEntityAlter.putUpdateNetworkShowData(dataView.getInt32(44));
        
        this.modelEntityAlter.currentAnimationStartTimestamp=dataView.getInt32(48);
        this.modelEntityAlter.currentAnimationLoopStartTick=dataView.getInt32(52);
        this.modelEntityAlter.currentAnimationLoopEndTick=dataView.getInt32(54);
        this.modelEntityAlter.queuedAnimationStop=(dataView.getInt8(58)!==0);
       
            // mark as having a remote update
            // this is so we only do one remote update
            // (the latest) and ignore any we missed
        
        this.hadRemoteUpdate=true;
        
            // updates show remote

        this.show=true;
    }
    
        //
        // sequences
        //
        
    startSequence(name)
    {
        this.core.game.startSequence(name);
    }
    
        //
        // some overrides
        //
    
    ready()
    {
        this.currentCube=null;      // not currently in a cube
    }
    
    run()
    {
        let cube;
        
            // check cubes
            
        cube=this.core.game.map.cubeList.findCubeContainingEntity(this);
        if (cube!==null) {
            if (this.currentCube!==cube) {
                if (this.currentCube!==null) this.currentCube.cube.leave(this);
                this.currentCube=cube;
                this.currentCube.cube.enter(this);
            }
        }
        else {
            if (this.currentCube!==null) {
                this.currentCube.cube.leave(this);
                this.currentCube=null;
            }
        }
    }
    
    damage(fromEntity,damage,hitPoint)
    {
    }
    
    telefrag(fromEntity)
    {
    }
    
    remoteEntering(name)
    {
    }
    
    remoteLeaving(name)
    {
    }
    
    animatedBoneSetup()
    {
    }
    
    drawSetup()
    {
        return(false);
    }
    
    drawSetupDeveloper()
    {
        this.modelEntityAlter.position.setFromPoint(this.originalPosition);
        this.modelEntityAlter.angle.setFromPoint(this.originalAngle);
        this.modelEntityAlter.scale.setFromPoint(this.originalScale);
        this.modelEntityAlter.inCameraSpace=false;
    }
    
        //
        // draw entity
        //
    
    draw()
    {
        if (this.model===null) return;
        
            // skip if we aren't showing, or the draw setup returns false
            // otherwise calc the animation and draw
        
        if (!this.show) return;

        if (!this.drawSetup()) return;
        this.modelEntityAlter.runAnimation();
        this.modelEntityAlter.runAnimationMeshShowHide();
        
            // draw the model
            
        this.model.draw(this);
    }
    
    drawDeveloper(selected,drawSkeleton)
    {
        if (this.model===null) return;
        
            // always draw at starting position and skip any non-map spawn
            // entities (as we only edit the map entities, now dynamically
            // spawned ones)
        
        if (!this.mapSpawn) return;

        this.drawSetupDeveloper();
        this.modelEntityAlter.runAninimationDeveloper();
        
            // draw the model
            
        this.model.drawDeveloper(this,selected,drawSkeleton);
    }
}
