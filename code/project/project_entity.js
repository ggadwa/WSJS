import * as constants from '../main/constants.js';
import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import ModelClass from '../model/model.js';
import ImportModelClass from '../import/import_model.js';
import CollisionClass from '../map/collisions.js';

//
// project entity base class
//

export default class ProjectEntityClass
{
    constructor(view,map,name,position,angle)
    {
        this.view=view;
        this.map=map;
        
        this.name=name;
        this.radius=1;
        this.height=1;
        this.position=new PointClass(0,0,0);
        this.angle=new PointClass(0,0,0);
        
        this.show=true;
        this.heldBy=null;
        
        this.model=null;
        this.modelImportSettings=null;
        
        if (position!==null) this.position.setFromPoint(position);
        if (angle!==null) this.angle.setFromPoint(angle);
        
        this.positionBackup=new PointClass(0,0,0);
        this.positionBackup.setFromPoint(this.position);
        
        this.eyeOffset=3000;

        this.id=-1;
        
        this.maxHealth=100;
        this.health=100;
        
        this.gravityMinValue=10;
        this.gravityMaxValue=280;
        this.gravityAcceleration=10;
        
        this.movementForwardMaxSpeed=0;
        this.movementForwardAcceleration=0;
        this.movementForwardDeceleration=0;
        this.movementSideMaxSpeed=0;
        this.movementSideAcceleration=0;
        this.movementSideDeceleration=0;

        this.movementForwardOn=false;
        this.movementBackwardOn=false;
        this.movementSideLeftOn=false;
        this.movementSideRightOn=false;
        
        this.movement=new PointClass(0,0,0);
        this.gravity=this.gravityMinValue;
        
        this.markedForDeletion=false;              // used to delete this outside the run loop

        this.touchEntity=null;
        
        this.collideWallMeshIdx=-1;
        this.collideWallLineIdx=-1;
        this.collideCeilingMeshIdx=-1;
        this.standOnMeshIdx=-1;
        
        this.damageTintStartTick=-1;

        this.movePt=new PointClass(0,0,0);     // this are global to stop them being local and GC'd
        this.checkMovePt=new PointClass(0,0,0);
        this.collideMovePt=new PointClass(0,0,0);
        this.collideSlideMovePt=new PointClass(0,0,0);
        this.reflectMovementVector=new PointClass(0,0,0);
        this.reflectLineVector=new PointClass(0,0,0);

        this.xFrustumBound=new BoundClass(0,0);
        this.yFrustumBound=new BoundClass(0,0);
        this.zFrustumBound=new BoundClass(0,0);
        
        this.pushMesh=null;

        this.collision=new CollisionClass(map);
        
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
     
    setModel(modelImportSettings)
    {
        this.modelImportSettings=modelImportSettings;        
    }
    
    async loadModel()
    {
        let importModel;
        
        if (this.modelImportSettings==null) return(true);
        
            // the model
            
        this.model=new ModelClass(this.view);
        this.model.initialize();
        
        importModel=new ImportModelClass(this.view,this.model);
        if (!(await importModel.load(this.modelImportSettings))) return(false);

        this.model.setupBuffers();
        
        return(true);
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
        // start and stop movements
        //
        
    setMovementForward(on)
    {
        this.movementForwardOn=on;
    }
    
    setMovementBackward(on)
    {
        this.movementBackwardOn=on;
    }
    
    setMovementSideLeft(on)
    {
        this.movementSideLeftOn=on;
    }
    
    setMovementSideRight(on)
    {
        this.movementSideRightOn=on;
    }
    
        //
        // utility to backup and restore position
        //
        
    backupPosition()
    {
        this.positionBackup.setFromPoint(this.position);
    }
    
    restorePosition()
    {
        this.position.setFromPoint(this.positionBackup);
    }
    
        //
        // move entity
        //
    
    moveXZ(bump,slide,clipping)
    {
            // if no movement, then skip
        
        if ((this.movePt.x===0) && (this.movePt.z===0)) return;
        
            // run the collision which
            // will return a new move direction
            // if it's the same as the original or
            // there's been a bump, move it, otherwise,
            // try sliding
        
        this.checkMovePt.setFromValues(this.movePt.x,0.0,this.movePt.z);
        
        this.collision.moveObjectInMap(this,this.checkMovePt,bump,this.collideMovePt);
        if ((this.collideMovePt.equals(this.checkMovePt)) || (this.collideMovePt.y!==0)) {
            this.position.addPointTrunc(this.collideMovePt);
            return;
        }
        
            // try to slide
        
        if (slide) {
            this.checkMovePt.setFromValues(this.movePt.x,0.0,0.0);

            this.collision.moveObjectInMap(this,this.checkMovePt,false,this.collideSlideMovePt);
            if (this.collideSlideMovePt.equals(this.checkMovePt)) {
                this.position.addPointTrunc(this.collideSlideMovePt);
                return;
            }

            this.checkMovePt.setFromValues(0.0,0.0,this.movePt.z);

            this.collision.moveObjectInMap(this,this.checkMovePt,false,this.collideSlideMovePt);
            if (this.collideSlideMovePt.equals(this.checkMovePt)) {
                this.position.addPointTrunc(this.collideSlideMovePt);
                return;
            }
        }
        
            // if nothing works, just use the
            // the original collide point
            
        this.position.addPointTrunc(this.collideMovePt);
    }
    
    moveY(noGravity)
    {
        let yAdd,fallY,riseY;
        
            // y movement is the rotated x/z movement
            // (for swimming and flying) plus the natural
            // y movement

        yAdd=this.movePt.y+this.movement.y;
         
            // add in gravity
            
        if (noGravity) {
            this.gravity=this.gravityMinValue;
        }
        else {
            
                // if there is upwards movement (usually a jump or push)
                // then reduce it by the current gravity acceleration
  
            if (this.movement.y>0) {
                this.movement.y-=this.gravityAcceleration;
                if (this.movement.y<=0) {
                    this.gravity=-this.movement.y;
                    this.movement.y=0;
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

            fallY=this.collision.fallObjectInMap(this);
            console.log('yAdd='+yAdd+', fallY='+fallY);
            if (fallY>yAdd) fallY=yAdd;                            // can only drop as far as current fall
            
            this.position.addValuesTrunc(0,fallY,0);
        
            if (fallY>=0) this.gravity=this.gravityMinValue;
        }
        
            // moving up
            
        else {
            /*
            this.standOnMeshIdx=-1;                                 // no standing if going up
            
            riseY=this.collision.riseObjectInMap(this,yAdd);
            this.position.addValuesTrunc(0,riseY,0);
            
            if (riseY>yAdd) {                                       // if we can't get as high as we want, then clear any movement
                this.movement.y=0;
            }
            */
        }
    }
    
    move(bump,slide,noGravity,clipping)
    {
            // clear collision flags
            
        this.touchEntity=null;
        this.collideWallMeshIdx=-1;
        this.collideCeilingMeshIdx=-1;
        this.standOnMeshIdx=-1;

            // calculate the movement, add in
            // acceleration and deceleration
        
        if (this.movementForwardOn) {
            this.movement.z+=this.movementForwardAcceleration;
            if (this.movement.z>this.movementForwardMaxSpeed) this.movement.z=this.movementForwardMaxSpeed;
        }
        else {
            if (!this.movementBackwardOn) {
                this.movement.z-=this.movementForwardDeceleration;
                if (this.movement.z<0) this.movement.z=0;
            }
        }
        
        if (this.movementBackwardOn) {
            this.movement.z-=this.movementForwardAcceleration;
            if (this.movement.z<-this.movementForwardMaxSpeed) this.movement.z=-this.movementForwardMaxSpeed;
        }
        else {
            if (!this.movementForwardOn) {
                this.movement.z+=this.movementForwardDeceleration;
                if (this.movement.z>0) this.movement.z=0;
            }
        }

        if (this.movementSideLeftOn) {
            this.movement.x+=this.movementSideAcceleration;
            if (this.movement.x>this.movementSideMaxSpeed) this.movement.x=this.movementSideMaxSpeed;
        }
        else {
            if (!this.movementSideRightOn) {
                this.movement.x-=this.movementSideAcceleration;
                if (this.movement.x<0) this.movement.x=0;
            }
        }

        if (this.movementSideRightOn) {
            this.movement.x-=this.movementSideAcceleration;
            if (this.movement.x<this.movementSideMaxSpeed) this.movement.x=-this.movementSideMaxSpeed;
        }
        else {
            if (!this.movementSideLeftOn) {
                this.movement.x=this.movementSideAcceleration;
                if (this.movement.x>0) this.movement.x=0;
            }
        }
        
            // turn the facing angle(s), trunc it to avoid
            // floats which mess up the math.  if there is no gravity,
            // then add in the X rotation so we can fly up and down
            // during the moveY section
            
        this.movePt.setFromValues(this.movement.x,0,this.movement.z);
        if (noGravity) this.movePt.rotateX(null,this.angle.x);
        this.movePt.rotateY(null,this.angle.y);
        this.movePt.trunc();
        
            // if no clipping, just move
            
        if (clipping) {
            this.position.addPoint(this.movePt);
            return;
        }

            // move around the map
        
        this.moveY(noGravity);
        this.moveXZ(bump,slide,clipping);
    }
    
    moveDirect(x,y,z)
    {
        this.position.addValuesTrunc(x,y,z);
    }
    
        //
        // mesh pushing
        //
        
    movementPush(meshIdx,movePnt)
    {
            // lifts
            
        if (movePnt.y<0) {
            if (this.standOnMeshIdx===meshIdx) {
                this.pushMesh=this.map.meshList.get(meshIdx);
                if (this.position.y>=this.pushMesh.yBound.min) {
                    this.position.y=Math.trunc(this.pushMesh.yBound.min)-1;
                }
            }
        }
    }
    
        // change movement
        
    movementBounce(bounceFactor)
    {
        this.movement.y=-Math.trunc((this.movement.y+this.gravity)*bounceFactor);
        this.gravity=this.gravityMinValue;
        
        return(Math.abs(this.movement.y)>this.gravityAcceleration);
    }
    
    movementJump(jumpValue)
    {
        this.gravity=this.gravityMinValue;
        this.movement.y=-jumpValue;
    }
    
    movementReflect()
    {
        let f,ang;
        let collisionLine;
        
            // get the movement vector from the hit
            // point, which is the inverse

        this.reflectMovementVector.setFromValues(this.movement.x,0,this.movement.z);
        this.reflectMovementVector.rotateY(null,this.angle.y);
        this.reflectMovementVector.trunc();
        this.reflectMovementVector.scale(-1.0);
        
            // get the collision line vector
        
        collisionLine=this.map.meshList.meshes[this.collideWallMeshIdx].collisionLines[this.collideWallLineIdx];
        this.reflectLineVector.setFromSubPoint(collisionLine.p1,collisionLine.p2);
	
            // now get the angle between them,
            // checking both directions of wall
            
        this.reflectMovementVector.normalize();
        this.reflectLineVector.normalize();
            
        f=this.reflectLineVector.dot(this.reflectMovementVector);
        ang=Math.acos(f)*constants.RAD_TO_DEGREE;

            // calculate the reflection angle
		
	ang=this.angle.y-(180.0-(ang*2.0));
	if (ang===this.angle.y) ang=this.angle.y+180.0;          // special check for straight hits

	this.angle.y=ang;
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
        // health, damage, death
        //
    
    die()
    {
    }
    
    addDamage(hitEntityId,damage)
    {
        this.damageTintStartTick=this.view.timestamp;
        
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
        
        tick=this.view.timestamp-this.damageTintStartTick;
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
        return(this.map.liquidList.getLiquidForPoint(this.position));
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
        
    addSound(name,distance)
    {
        this.view.soundList.add(name,distance);
    }
        
    playSound(name)
    {
        this.view.soundList.play(this,name);
    }
    
        //
        // run entity
        //
        
    run()
    {
    }
    
        //
        // override this to change how the model is setup for drawing
        // will need to setup model position and angles here or nothing
        // will draw
        //
        
    drawSetup()
    {
    }
    
        //
        // draw entity
        //
        
    draw()
    {
        if (this.model===null) return;
        if (!this.show) return;
        
            // call the setup
            
        this.drawSetup();
        
            // draw the model
            
        this.model.draw();
    }
}
