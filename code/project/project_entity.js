import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import QuaternionClass from '../utility/quaternion.js';
import MeshClass from '../mesh/mesh.js';
import ModelClass from '../model/model.js';
import ModelEntityAlterClass from '../model/model_entity_alter.js';
import CollisionClass from '../collision/collisions.js';

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
        
        this.model=null;
        this.modelEntityAlter=null;
        
        this.positionBackup=this.position.copy();
        
        this.eyeOffset=0;
        this.bumpHeight=0;

        this.id=-1;
        
        this.maxHealth=100;
        this.health=100;
        
        this.gravityMinValue=10;
        this.gravityMaxValue=300;
        this.gravityAcceleration=10;
        
        this.gravity=this.gravityMinValue;
        
        this.markedForDeletion=false;              // used to delete this outside the run loop

        this.touchEntity=null;
        this.hitEntity=null;
        
        this.collideWallMeshIdx=-1;
        this.collideWallTrigIdx=-1;
        this.collideCeilingMeshIdx=-1;
        this.standOnMeshIdx=-1;
        
        this.damageTintStartTick=-1;

        this.checkMovePnt=new PointClass(0,0,0);
        this.reflectMovementVector=new PointClass(0,0,0);
        this.reflectLineVector=new PointClass(0,0,0);

        this.pushMesh=null;

        this.collision=new CollisionClass(core);
        
            // these developer debug flags
            // live here so people can switch between
            // developer and regular entities
            
        this.debugPlayerNoClip=false;
        this.debugPlayerFly=false;
        
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
        if (this.model!==null) this.model.release();
    }
    
        //
        // models
        //
     
    setModel(importSettings)
    {
        if (this.model!==null) {
            console.log('already set model once');
            return;
        }
        
        this.model=this.core.modelList.add(importSettings.name,importSettings);
        this.modelEntityAlter=new ModelEntityAlterClass(this.core,this);
    }
    
    showModelMesh(name,show)
    {
        return(this.modelEntityAlter.show(name,show));
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
    
    queueModelAnimationChunkInFrames(name,framesPerSecond,loopStartFrame,loopEndFrame)
    {
        return(this.modelEntityAlter.queueAnimationChunkInFrames(name,framesPerSecond,loopStartFrame,loopEndFrame));
    }
    
    isModelAnimationRunning()
    {
        return(this.modelEntityAlter.isAnimationRunning());
    }
    
        //
        // deleting
        //
        
    markAsDelete()
    {
        this.markedForDeletion=true;
    }
    
    isMarkedForDeletion()
    {
        return(this.markedForDeletion);
    }
    
        //
        // holding
        //
        
    hold(entity)
    {
        entity.heldBy=this;
    }
    
        //
        // messages
        //
        
    sendMessage(data)
    {
    }
    
        //
        // periodics
        //
        
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
        // path utilities
        //
        
    findNearestPathNode(maxDistance)
    {
        let n,d,dist;
        let nodeIdx;
        let path=this.core.map.path;
        let nNode=path.nodes.length;
        
        nodeIdx=-1;
        dist=maxDistance;
        
        for (n=0;n!==nNode;n++) {
            d=path.nodes[n].position.distance(this.position);
            if ((d<dist) || (dist===-1)) {
                dist=d;
                nodeIdx=n;
            }
        }

        return(nodeIdx);
    }
    
    hitPathNode(nodeIdx,slopDistance)
    {
        return(this.core.map.path.nodes[nodeIdx].position.distance(this.position)<slopDistance);
    }
    
    nextNodeInPath(fromNodeIdx,toNodeIdx)
    {
        return(this.core.map.path.nodes[fromNodeIdx].pathHints[toNodeIdx]);
    }
    
    moveToRandomNode()
    {
        let nodes=this.core.map.path.nodes;
        let idx=Math.trunc(nodes.length*Math.random());
        
        this.position.setFromPoint(nodes[idx].position);
    }
    
    getRandomKeyNodeIndex()
    {
        let keyNodes=this.core.map.path.keyNodes;
        return(keyNodes[Math.trunc(keyNodes.length*Math.random())]);
    }
    
    turnTowardsNode(nodeIdx,turnSpeed)
    {
        let toY,subway,addway;
        let node=this.core.map.path.nodes[nodeIdx];
        
            // already there?
            
        toY=this.position.angleYTo(node.position);
        if (this.angle.y===toY) return;
        
            // which way is faster?
	
	if (this.angle.y>toY) {
            addway=360.0-(this.angle.y-toY);
            subway=this.angle.y-toY;
	}
	else {
            addway=toY-this.angle.y;
            subway=360.0-(toY-this.angle.y);
	}
        
            // if we are within speed, then
            // it's equal
            
        if ((subway<turnSpeed) || (addway<turnSpeed)) {
            this.angle.y=toY;
            return(0);
        }
		
            // now turn and always
            // return the difference
	
	if (subway<addway) {
            this.turn(-turnSpeed);
            return(subway);
	}

        this.turn(turnSpeed);
        return(addway);
    }
    
    getVectorToNode(nodeIdx,pnt)
    {
        pnt.setFromSubPoint(this.core.map.path.nodes[nodeIdx].position,this.position);
    }
    
        //
        // move utilities
        //
    
    moveInMapXZ(movePnt,bump,slide)
    {
            // clear collisions
            
        this.touchEntity=null;
        this.collideWallMeshIdx=-1;
        
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
            this.checkMovePnt.setFromValues(movePnt.x,0.0,0.0);

            if (!this.collision.moveEntityInMap(this,this.checkMovePnt,false)) {
                this.position.addPointTrunc(this.checkMovePnt);
                return;
            }

            this.checkMovePnt.setFromValues(0.0,0.0,movePnt.z);

            if (!this.collision.moveEntityInMap(this,this.checkMovePnt,false)) {
                this.position.addPointTrunc(this.checkMovePnt);
                return;
            }
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

            fallY=this.collision.fallEntityInMap(this);
            if (fallY<yAdd) fallY=yAdd;                            // can only drop as far as current fall
            
            this.position.addValuesTrunc(0,fallY,0);
        
            if (fallY>=0) {
                this.gravity=this.gravityMinValue;                  // if we are rising or stopped by a floor, restart gravity
                return(movePnt.y);
            }
        }
        
            // moving up
            
        else {
            this.standOnMeshIdx=-1;                                 // no standing if going up
            
            riseY=this.collision.riseEntityInMap(this,yAdd);
            this.position.addValuesTrunc(0,riseY,0);
            
            if (riseY<yAdd) return(0);                      // if we can't get as high as we want, then clear any movement
        }
        
        return(movePnt.y);
    }
    
        //
        // mesh pushing
        //
        
    movementPush(meshIdx,movePnt)
    {
            // lifts
            
        if (movePnt.y<0) {
            if (this.standOnMeshIdx===meshIdx) {
                this.pushMesh=this.core.map.meshList.get(meshIdx);
                if (this.position.y<=this.pushMesh.yBound.min) {
                    this.position.y=Math.trunc(this.pushMesh.yBound.min)+1;
                }
            }
        }
    }
    
        //
        // movement utilities
        //
        
    floorHitBounceY(y,bounceFactor)
    {
        y=-Math.trunc((y+this.gravity)*bounceFactor);
        this.gravity=this.gravityMinValue;
        
        if (Math.abs(y)<this.gravityAcceleration) y=0;          // always break if we are less than acceleration
        
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
        // turn (y angle)
        //

    turn(addAngle)
    {
        this.angle.y+=addAngle;
        if (this.angle.y<0.0) this.angle.y+=360.0;
        if (this.angle.y>=360.00) this.angle.y-=360.0;
    }
    
    turnTowards(toY,speed)
    {
        let subway,addway;
        
        if (this.angle.y===toY) return(0);
        
            // which way is faster?
	
	if (this.angle.y>toY) {
            addway=360.0-(this.angle.y-toY);
            subway=this.angle.y-toY;
	}
	else {
            addway=toY-this.angle.y;
            subway=360.0-(toY-this.angle.y);
	}
        
            // if we are within speed, then
            // it's equal
            
        if ((subway<speed) || (addway<speed)) {
            this.angle.y=toY;
            return(0);
        }
		
            // now turn and always
            // return the difference
	
	if (subway<addway) {
            this.turn(-speed);
            return(subway);
	}

        this.turn(speed);
        return(addway);
    }
    
    turnTowardsPosition(pos,speed)
    {
        return(this.turnTowards(this.position.angleYTo(pos),speed));
    }
    
    getAngleDifferenceTowardsPosition(pos)
    {
        let subway,addway;
        let toY=this.position.angleYTo(pos);
        
        if (this.angle.y===toY) return(0);
        
            // which way is faster?
	
	if (this.angle.y>toY) {
            addway=360.0-(this.angle.y-toY);
            subway=this.angle.y-toY;
	}
	else {
            addway=toY-this.angle.y;
            subway=360.0-(toY-this.angle.y);
	}
        
        return((addway<subway)?addway:subway);
    }
    
        //
        // ray trace utilities
        //
        
    rayCollision(pnt,vector,hitPnt)
    {
        return(this.collision.rayCollision(pnt,vector,hitPnt,this));
    }
    
        //
        // entity utilities
        //
        
    isEntityInRange(name,dist)
    {
        let entity=this.core.map.entityList.find(name);
        
        if (entity===null) {
            console.log('Unable to find entity '+name);
            return(false);
        }
        
        return(entity.position.distance(this.position)<dist);
    }
    
        //
        // health, damage, death
        //
    
    die()
    {
    }
    
    addDamage(hitEntityId,damage)
    {
        this.damageTintStartTick=this.core.timestamp;
        
        this.health-=damage;
        if (this.health<=0) this.die();
    }
    
    getPercentageHealth()
    {
        return(this.health/this.maxHealth);
    }
    
    getDamageTintAttenuation()
    {
        let tick;
        
        if (this.damageTintStartTick===-1) return(0.0);
        
        tick=this.core.timestamp-this.damageTintStartTick;
        if (tick>=1000) {
            this.damageTintStartTick=-1;
            return(0.0);
        }
        
        if (tick<500) return((tick/500.0)*0.6);
        return((1.0-((tick-500)/500.0))*0.6);
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
    
    getStandingOnFloorMoveMode()
    {
        if (this.standOnMeshIdx===-1) return(MeshClass.MOVE_NONE);
        return(this.core.map.meshList.meshes[this.standOnMeshIdx].moveMode);
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
        
    addSound(name,distance)
    {
        this.core.soundList.add(name,distance);
    }
        
    playSound(name)
    {
        this.core.soundList.play(this,name);
    }
    
    playSoundAtEntity(entity,name)
    {
        this.core.soundList.play(entity,name);
    }
    
        //
        // ready entity
        // this is the first call before it starts running,
        // after everything has been prepared and loaded
        //
    
    ready()
    {
    }
    
        //
        // run entity
        // called during physics loops as entity is run
        //
        
    run()
    {
    }
    
        //
        // override this if you want to change how a model is setup
        // or positioned in the scene.  the default is just to
        // position the model the same as the entity's position and
        // angle.  use setModelDrawPosition([PointClass],[PointClass],[PointClass],inCameraSpace) to change
        // inside this method
        //
        
    drawSetup()
    {
        this.setModelDrawPosition(this.position,this.angle,this.scale,false);
    }
    
        //
        // draw entity
        //
        
    draw()
    {
        if (this.model===null) return;
        if (!this.show) return;
        
            // run the animation
            // and then call the setup
            
        this.modelEntityAlter.runAnimation();
        this.drawSetup();
        
            // draw the model
            
        this.model.draw(this);
    }
}
