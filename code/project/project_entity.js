import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import QuaternionClass from '../utility/quaternion.js';
import MeshClass from '../mesh/mesh.js';
import ModelClass from '../model/model.js';
import ModelEntityAlterClass from '../model/model_entity_alter.js';
import CollisionClass from '../collision/collisions.js';
import NetworkClass from '../main/network.js';

//
// project entity base class
//

export default class ProjectEntityClass
{
    static RAD_TO_DEGREE=180.0/Math.PI;
    
    constructor(core,name,position,angle,data)
    {
        this.core=core;
        
        this.name=name;
        this.radius=1;
        this.height=1;
        this.scale=new PointClass(1,1,1);
        this.position=position.copy();
        this.angle=angle.copy();
        this.data=data;
        
        this.show=true;
        this.heldBy=null;
        this.spawnedBy=null;
        this.filter=null;
        this.markDelete=false;
        
        this.model=null;
        this.modelEntityAlter=null;
        
        this.eyeOffset=0;
        this.bumpHeight=0;

        this.remoteId=-1;       // the network ID
        
        this.gravityMinValue=10;
        this.gravityMaxValue=300;
        this.gravityAcceleration=10;
        
        this.gravity=this.gravityMinValue;
        
        this.passThrough=false;
        this.touchEntity=null;
        this.hitEntity=null;
        this.hitPoint=new PointClass(0,0,0);
        
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
        this.reflectMovementVector=new PointClass(0,0,0);
        this.reflectLineVector=new PointClass(0,0,0);

        this.collision=new CollisionClass(core);
        
            // remotes
            
        this.remoteId=null;
        
        this.hadRemoteUpdate=false;
        this.remotePositionChange=new PointClass(0,0,0);
        this.remoteAngleChange=new PointClass(0,0,0);
        this.remoteScaleChange=new PointClass(0,0,0);
        
            // these developer debug flags
            // live here so people can switch between
            // developer and regular entities
            
        this.debugPlayerNoClip=false;
        this.debugPlayerFly=false;
        this.debugNoDamage=false;
        
        // no seal, as this object is extended
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
        this.model=null;
    }
    
    release()
    {
        this.modelEntityAlter.release();
    }
    
        //
        // general info
        //
        
    getSetup()
    {
        return(this.core.setup);
    }
    
    getCamera()
    {
        return(this.core.camera);
    }
    
    isMultiplayer()
    {
        return(this.core.isMultiplayer);
    }
    
        //
        // meshes and liquids
        //
        
    getMeshList()
    {
        return(this.core.map.meshList);
    }
    
    getLiquidList()
    {
        return(this.core.map.liquidList);
    }
    
        //
        // input
        //
        
    isKeyDown(keyCode)
    {
        return(this.core.input.keyFlags[keyCode]);
    }
    
    isMouseButtonDown(buttonIdx)
    {
        return(this.core.input.mouseButtonFlags[buttonIdx]);
    }
    
    getMouseWheelClick()
    {
        return(this.core.input.mouseWheelRead());
    }
    
    getMouseMoveX()
    {
        let x;
        
        x=this.core.input.mouseChangeX;
        this.core.input.mouseChangeX=0;
        return(x);
    }
    
    getMouseMoveY()
    {
        let y;
        
        y=this.core.input.mouseChangeY;
        this.core.input.mouseChangeY=0;
        return(y);
    }
    
    getNextTouchClick(quardent)
    {
        return(this.core.input.getNextTouchClick(quardent));
    }
    
    getNextTouchSwipe(quardent,direction)
    {
        return(this.core.input.getNextTouchSwipe(quardent,direction));
    }
    
        //
        // models
        //
     
    setModel(name)
    {
        if (this.model!==null) throw('already set model once');
        
            // cached shared model
            
        this.model=this.core.modelList.get(name);
        if (this.model===undefined) throw('model '+name+' does not exist, needs to be defined in map setup');
        
            // this entities person model animation/altering data
            
        this.modelEntityAlter=new ModelEntityAlterClass(this.core,this);
        this.modelEntityAlter.initialize();
    }
    
    showModelMesh(name,show)
    {
        return(this.modelEntityAlter.show(name,show));
    }
    
    setModelRotationOrder(rotationOrder)
    {
        this.modelEntityAlter.rotationOrder=rotationOrder;
    }
    
    setModelDrawPosition(position,angle,scale,inCameraSpace)
    {
        this.modelEntityAlter.position.setFromPoint(position);
        this.modelEntityAlter.angle.setFromPoint(angle);
        this.modelEntityAlter.scale.setFromPoint(scale);
        this.modelEntityAlter.inCameraSpace=(inCameraSpace===undefined)?false:inCameraSpace;
    }
    
    startModelAnimationChunkInFrames(name,framesPerSecond,loopStartFrame,loopEndFrame)
    {
        return(this.modelEntityAlter.startAnimationChunkInFrames(name,framesPerSecond,loopStartFrame,loopEndFrame));
    }
    
    queueAnimationStop()
    {
        this.modelEntityAlter.queueAnimationStop();
    }
    
    queueModelAnimationChunkInFrames(name,framesPerSecond,loopStartFrame,loopEndFrame)
    {
        return(this.modelEntityAlter.queueAnimationChunkInFrames(name,framesPerSecond,loopStartFrame,loopEndFrame));
    }
    
    isModelAnimationRunning()
    {
        return(this.modelEntityAlter.isAnimationRunning());
    }
    
    setModelBoneTranslationPoint(name,translation)
    {
        this.modelEntityAlter.setBoneTranslationPoint(name,translation);
    }
    
    setModelBoneRotationQuaternion(name,rotation)
    {
        this.modelEntityAlter.setBoneRotationQuaternion(name,rotation);
    }
    
    setModelBoneScalePoint(name,scale)
    {
        this.modelEntityAlter.setBoneScale(name,scale);
    }
    
        //
        // ticks and periodics
        //
        
    getTimestamp()
    {
        return(this.core.timestamp);
    }
    
    getPeriodicCos(millisecondPeriod,amplitude)
    {
        return(this.core.getPeriodicCos(millisecondPeriod,amplitude));
    }
    
    getPeriodicSin(millisecondPeriod,amplitude)
    {
        return(this.core.getPeriodicSin(millisecondPeriod,amplitude));
    }
    
    getPeriodicLinear(millisecondPeriod,amplitude)
    {
        return(this.core.getPeriodicLinear(millisecondPeriod,amplitude));
    }
    
        //
        // entity utilities
        //
        
    getEntityList()
    {
        return(this.core.map.entityList);
    }
    
    getPlayerEntity()
    {
        return(this.core.map.entityList.getPlayer());
    }
    
    addEntity(entityClass,name,position,angle,data,show,hold)
    {
        let entity;
        
        entity=new entityClass(this.core,name,position,angle,data);
        
        entity.spawnedBy=this;
        if (hold) entity.heldBy=this;
        entity.show=show;
        
        this.core.map.entityList.add(entity);
        
        return(entity);
    }
    
    addEntityFromEntity(spawnedBy,entityClass,name,position,angle,data,show,hold)
    {
        let entity;
        
        entity=new entityClass(this.core,name,position,angle,data);
        
        entity.spawnedBy=spawnedBy;
        if (hold) entity.heldBy=spawnedBy;
        entity.show=show;
        
        this.core.map.entityList.add(entity);
        
        return(entity);
    }
    
    holdEntity(entity)
    {
        entity.heldBy=this;
    }
        
    isEntityInRange(entity,dist)
    {
        return(entity.position.distance(this.position)<dist);
    }
    
    turnYTowardsEntity(entity,turnSpeed)
    {
        return(this.angle.turnYTowards(this.position.angleYTo(entity.position),turnSpeed));
    }
    
    damageEntityForRadius(hitEntity,centerPosition,maxDistance,maxDamage)
    {
        let entity,dist,damage;

        for (entity of this.core.map.entityList.entities) {
            if (!entity.show) continue;
            
            dist=centerPosition.distance(entity.position);
            if (dist>maxDistance) continue;
            
            damage=Math.trunc((1.0-(dist/maxDistance))*maxDamage);
            entity.damage(hitEntity,damage,centerPosition);
        }
    }
    
        //
        // effect utilities
        //
        
    getEffectList()
    {
        return(this.core.map.effectList);
    }
    
    addEffect(effectClass,position,data,show)
    {
        let effect;
        
        effect=new effectClass(this.core,position,data,show)
        this.core.map.effectList.add(effect);
        
        return(effect);
    }
    
        //
        // interface utilities
        //
        
    addInterfaceElement(id,colorURL,uvOffset,uvSize,rect,color,alpha)
    {
        let bitmap=this.core.bitmapList.get(colorURL);
        if (bitmap===null) {
            console.log('Missing bitmap to add to interface: '+colorURL);
            return;
        }
                    
        this.core.interface.addElement(id,bitmap,uvOffset,uvSize,rect,color,alpha);
    }
    
    showInterfaceElement(id,show)
    {
        this.core.interface.showElement(id,show);
    }
    
    pulseInterfaceElement(id,tick,expand)
    {
        this.core.interface.pulseElement(id,tick,expand);
    }
    
    addInterfaceText(id,text,x,y,fontSize,align,color,alpha)
    {
        this.core.interface.addText(id,text,x,y,fontSize,align,color,alpha);
    }
    
    removeInterfaceText(id)
    {
        this.core.interface.removeText(id);
    }
    
    showInterfaceText(id,show)
    {
        this.core.interface.showText(id,show);
    }
    
    updateInterfaceText(id,str)
    {
        this.core.interface.updateText(id,str);
    }
    
    updateInterfaceTemporaryText(id,str,tick)
    {
        this.core.interface.updateTemporaryText(id,str,tick);
    }
    
    getInterfaceWidth()
    {
        return(this.core.wid);
    }
    
    getInterfaceHeight()
    {
        return(this.core.high);
    }
    
        //
        // misc APIs
        //
        
    shakeCamera(shakePosition,shakeDistance,shakeTick,shakeMaxShift)
    {
        let entity,dist;

            // shake only registers if close enough
            // to camera object
            
        entity=this.getPlayerEntity();
        
        dist=this.position.distance(entity.position);
        if (dist<shakeDistance) this.core.startCameraShake(shakeTick,Math.trunc((shakeMaxShift*dist)/shakeDistance));
    }
    
    /**
     * Override this to setup a tinting color for the screen.
     * Return false if not tint.
     * 
     * @param {ColorClass} tintColor 
     */
    getScreenTint(tintColor)
    {
        return(false);
    }
    
        //
        // path utilities
        //
        
    getPathNodeList()
    {
        return(this.core.map.path.nodes);
    }
    
    findNearestPathNode(maxDistance)
    {
        let n,d,dist;
        let nodeIdx;
        let nodes=this.core.map.path.nodes;
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
        let nodes=this.core.map.path.nodes;
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
        let node=this.core.map.path.nodes[nodeIdx];
        
        if (node.altPosition!==null) {
            if (node.altPosition.distance(this.position)<slopDistance) return(true);
        }
        
        return(node.position.distance(this.position)<slopDistance);
    }
    
    nextNodeInPath(fromNodeIdx,toNodeIdx)
    {
        return(this.core.map.path.nodes[fromNodeIdx].pathHints[toNodeIdx]);
    }
    
    nextNodeTowardsEntity(fromNodeIdx,entity)
    {
        let n,linkNode,nextNodeIdx;
        let dist,currentDist;
        let nodes=this.core.map.path.nodes;
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
        this.position.setFromPoint(this.core.map.path.nodes[nodeIdx].position);
    }
    
    moveToRandomNode(failCount)
    {
        let nodes=this.core.map.path.nodes;
        let idx;
        
        while (failCount>0) {
            idx=Math.trunc(nodes.length*Math.random());
            this.position.setFromPoint(nodes[idx].position);
            
            if (this.collision.checkEntityCollision(this)===null) return;
            
            failCount--;
        }
    }
    
    getRandomKeyNodeIndex()
    {
        let keyNodes=this.core.map.path.keyNodes;
        return(keyNodes[Math.trunc(keyNodes.length*Math.random())]);
    }
    
    findKeyNodeIndex(key)
    {
        let n;
        let keyNodes=this.core.map.path.keyNodes;
        
        for (n=0;n!==keyNodes.length;n++) {
            if (this.core.map.path.nodes[keyNodes[n]].key===key) return(keyNodes[n]);
        }
        
        return(-1);
    }
    
    getNodeKey(nodeIdx)
    {
        if (this.core.map.path.nodes[nodeIdx].key===undefined) return(null);
        return(this.core.map.path.nodes[nodeIdx].key);
    }
    
    getNodeData(nodeIdx)
    {
        if (this.core.map.path.nodes[nodeIdx].data===undefined) return(null);
        return(this.core.map.path.nodes[nodeIdx].data);
    }
    
    getNodePosition(nodeIdx)
    {
        return(this.core.map.path.nodes[nodeIdx].position);
    }
    
    turnYTowardsNode(nodeIdx,turnSpeed)
    {
        return(this.angle.turnYTowards(this.position.angleYTo(this.core.map.path.nodes[nodeIdx].position),turnSpeed));
    }
    
    getTurnYTowardsNode(nodeIdx)
    {
        return(this.angle.getTurnYTowards(this.position.angleYTo(this.core.map.path.nodes[nodeIdx].position)));
    }
    
    getVectorToNode(nodeIdx,pnt)
    {
        pnt.setFromSubPoint(this.core.map.path.nodes[nodeIdx].position,this.position);
    }
    
    getYAngleBetweenNodes(fromNodeIdx,toNodeIdx)
    {
        let nodes=this.core.map.path.nodes;
        return(nodes[fromNodeIdx].position.angleYTo(nodes[toNodeIdx].position));
    }
    
        //
        // trigger utilities
        //
        
    setTrigger(triggerName)
    {
        this.core.setTrigger(triggerName);
    }
    
    checkTrigger(triggerName)
    {
        return(this.core.checkTrigger(triggerName));
    }
    
        //
        // cube utilities
        //
        
    findCubeContainingEntity()
    {
        return(this.core.map.cubeList.findCubeContainingEntity(this));
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
    
    moveInMapY(movePnt,noGravity)
    {
        let yAdd,fallY,riseY;
        
            // clear collisions
            
        this.collideCeilingMeshIdx=-1;
        this.standOnMeshIdx=-1;
        
            // get the initial y movement
            
        yAdd=movePnt.y;
         
            // add in gravity
            
        if (noGravity) {
            this.gravity=this.gravityMinValue;
        }
        else {
            
                // if there is upwards movement (usually a jump or push)
                // then reduce it by the current gravity acceleration
  
            if (movePnt.y>0) {
                movePnt.y-=this.gravityAcceleration;
                if (movePnt.y<=0) {
                    this.gravity=-movePnt.y;
                    movePnt.y=0;
                }
                else {
                    this.gravity=this.gravityMinValue;
                }
            }
            
                // otherwise run the gravity and
                // add it into the movement

            else {
                this.gravity+=this.gravityAcceleration;
                if (this.gravity>this.gravityMaxValue) this.gravity=this.gravityMaxValue;
            
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
                this.gravity=this.gravityMinValue;                  // if we are rising or stopped by a floor, restart gravity
                return(movePnt.y);
            }
        }
        
            // moving up
            
        else {
            this.standOnMeshIdx=-1;                                 // no standing if going up
            this.standOnEntity=null;
            
            riseY=this.collision.riseEntityInMap(this,yAdd);
            this.position.addValuesTrunc(0,riseY,0);
            
            if (riseY<yAdd) return(0);                      // if we can't get as high as we want, then clear any movement
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
        // you can override entityPush to do special things when
        // touched by another entity, currently, returning FALSE means
        // it can't be pushed
        //
        
    meshPush(meshIdx,movePnt,rotateAng)
    {
        let lft,rgt,top,bot;
        let mesh;
        
        mesh=this.core.map.meshList.get(meshIdx);
        
            // lifting
            
        if (movePnt.y<0) {
            if (this.standOnMeshIdx===meshIdx) {
                if (this.position.y<=mesh.yBound.min) {
                    this.position.y=Math.trunc(mesh.yBound.min)+1;
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
        
    floorHitBounceY(y,bounceFactor,bounceCut)
    {
        y=-Math.trunc((y-this.gravity)*bounceFactor);
        this.gravity=this.gravityMinValue;
        
        if (Math.abs(y)<bounceCut) y=0;
        
        return(y);
    }
    
    wallHitAngleReflect()
    {
        let f,ang;
        let collisionTrig;
        
            // get the opposite of the movement
            // vector and the collision wall vector
            // we do the opposite so we start facing
            // back down the movement vector

        this.reflectMovementVector.setFromValues(0,0,-1);
        this.reflectMovementVector.rotateY(null,this.angle.y);
        
        collisionTrig=this.core.map.meshList.meshes[this.collideWallMeshIdx].collisionWallTrigs[this.collideWallTrigIdx];
        collisionTrig.getReflectionVector(this.reflectLineVector);
        
        this.reflectLineVector.y=0;       // remove y, we are only doing in 2D
	
            // now get the angle between the vectors
            
        this.reflectMovementVector.normalize();
        this.reflectLineVector.normalize();
            
        f=this.reflectLineVector.dot(this.reflectMovementVector);
        ang=Math.acos(f)*ProjectEntityClass.RAD_TO_DEGREE;
        
            // calculate the reflection angle
            
        if (this.angle.y>=180.0) {
            ang=(this.angle.y+180.0)+(180.0-(ang*2.0));
        }
        else {
            ang=(this.angle.y+180.0)-(ang*2.0);
        }

        if (ang<0.0) ang=360.0+ang;
        if (ang>360.0) ang=ang-360.0;
        
        return(ang);
    }
    
        //
        // collision utilities
        //
        
    rayCollision(pnt,vector,hitPnt,hitFilter,skipFilter)
    {
        return(this.collision.rayCollision(this,pnt,vector,hitPnt,hitFilter,skipFilter));
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
        return(this.core.map.liquidList.getLiquidForPoint(this.position));
    }
    
    getUnderLiquidIndex()
    {
        return(this.core.map.liquidList.getLiquidForEyePoint(this.position,this.eyeOffset));
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
        // sounds
        //
        
    playSound(name,rate,loop)
    {
        return(this.core.soundList.play(this,null,name,rate,loop));
    }
    
    playSoundAtEntity(entity,name,rate,loop)
    {
        return(this.core.soundList.play(entity,null,name,rate,loop));
    }
    
    playGlobal(name,rate,loop)
    {
        return(this.core.soundList.play(null,null,name,rate,loop));
    }
    
    stopSound(playIdx)
    {
        this.core.soundList.stop(playIdx);
    }
    
    changeSoundRate(playIdx,rate)
    {
        this.core.soundList.changeRate(playIdx,rate);
    }
    
        //
        // networking utilities
        //
        
    getUpdateNetworkData(remoteId)
    {
        let buffer=new ArrayBuffer(55);
        let dataView=new DataView(buffer);
        
        dataView.setInt16(0,NetworkClass.MESSAGE_TYPE_ENTITY_UPDATE);
        dataView.setInt16(2,remoteId);
        dataView.setInt32(4,this.position.x);
        dataView.setInt32(8,this.position.y);
        dataView.setInt32(12,this.position.z);
        dataView.setFloat32(16,this.angle.x);
        dataView.setFloat32(20,this.angle.y);
        dataView.setFloat32(24,this.angle.z);
        dataView.setFloat32(28,this.scale.x);
        dataView.setFloat32(32,this.scale.y);
        dataView.setFloat32(36,this.scale.z);
        dataView.setInt16(40,this.modelEntityAlter.currentAnimationIdx);
        dataView.setInt32(42,this.modelEntityAlter.currentAnimationStartTimestamp);
        dataView.setInt32(46,this.modelEntityAlter.currentAnimationLoopStartTick);
        dataView.setInt32(50,this.modelEntityAlter.currentAnimationLoopEndTick);
        dataView.setInt8(54,(this.modelEntityAlter.queuedAnimationStop?0:1));
        
        return(buffer);
    }
    
    putUpdateNetworkData(dataView)
    {
        let x,y,z;
        
        x=dataView.getInt32(4);
        y=dataView.getInt32(8);
        z=dataView.getInt32(12);
        
        this.remotePositionChange.setFromValues((x-this.position.x),(y-this.position.y),(z-this.position.z));
        this.position.setFromValues(x,y,z);
        
        x=dataView.getFloat32(16);
        y=dataView.getFloat32(20);
        z=dataView.getFloat32(24);
        
        this.remoteAngleChange.setFromValues((x-this.angle.x),(y-this.angle.y),(z-this.angle.z));
        this.angle.setFromValues(x,y,z);
        
        x=dataView.getFloat32(28);
        y=dataView.getFloat32(32);
        z=dataView.getFloat32(36);
        
        this.remoteScaleChange.setFromValues((x-this.scale.x),(y-this.scale.y),(z-this.scale.z));
        this.scale.setFromValues(x,y,z);
        
        this.modelEntityAlter.currentAnimationIdx=dataView.getInt16(40);
        this.modelEntityAlter.currentAnimationStartTimestamp=dataView.getInt32(42);
        this.modelEntityAlter.currentAnimationLoopStartTick=dataView.getInt32(46);
        this.modelEntityAlter.currentAnimationLoopEndTick=dataView.getInt32(50);
        this.modelEntityAlter.queuedAnimationStop=(dataView.getInt8(54)!==0);
       
            // mark as having a remote update
            // this is so we only do one remote update
            // (the latest) and ignore any we missed
        
        this.hadRemoteUpdate=true;
        
            // updates show remote

        this.show=true;
    }

    /**
     * Override to deal with final entity setup.  This is the first call
     * before the main game starts running, after everything has been prepared
     * and loaded.
     */
    ready()
    {
    }
    
    /**
     * The main entity run function, called during the physics loop.
     * It is guarenteed to be called 60 times a second (about, actually
     * every 16 milliseconds.)
     */    
    run()
    {
    }
    
    /**
     * Override this to deal with the entity taking damage.
     * 
     * @param {EntityClass} The entity dealing the damage
     * @param {number} Amount of damage
     * @param {PointClass} The hit position (in world space)
     */    
    damage(fromEntity,damage,hitPoint)
    {
    }
    
    /**
     * Override this if you want to make some alterations to bones after
     * the animation has been calculated.  Use the setModelBoneXXX methods
     * to alter bones.
     */    
    animatedBoneSetup()
    {
    }
    
    /**
     * Override this if you want to change how a model is setup
     * or positioned in the scene.  The default is just to
     * position the model the same as the entity's position and
     * angle.  Use setModelDrawPosition([PointClass],[PointClass],[PointClass],inCameraSpace)
     * inside this method to change how entity model draws.
     * Return TRUE to draw the model, FALSE to not draw
     * 
     * @returns {boolean} TRUE to draw the model
     */    
    drawSetup()
    {
        this.setModelDrawPosition(this.position,this.angle,this.scale,false);
        return(true);
    }
    
        //
        // draw entity
        //
    
    draw()
    {
        if (this.model===null) return;
        if (!this.show) return;
        
            // call the draw setup and
            // then if returns true, run the animation
            
        if (!this.drawSetup()) return;        
        this.modelEntityAlter.runAnimation();
        
            // draw the model
            
        this.model.draw(this);
    }
}
