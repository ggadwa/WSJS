import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import CollisionClass from '../../code/entities/collisions.js';

//
// entity base class
//

export default class EntityClass
{
    constructor(view,map,sound,name,position,angle,maxHealth,model)
    {
        this.view=view;
        this.map=map;
        this.sound=sound;
        
        this.name=name;
        this.position=position;
        this.angle=angle;
        this.maxHealth=maxHealth;
        this.model=model;
        
        this.radius=this.model.calculateRadius();
        this.high=this.model.calculateHeight();
        
        this.positionBackup=new PointClass(0,0,0);
        
        this.eyeOffset=3000;

        this.id=-1;
        
        this.maxHealth=maxHealth;
        this.health=maxHealth;
        
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
        
        this.currentRoom=null;

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
        // setup
        //
        
    overrideRadiusHeight(radius,high)
    {
        this.radius=radius;
        this.high=high;
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
                // then reduce it by the current gravity
  
            if (this.movement.y<0) {
                this.movement.y+=this.gravityAcceleration;
                if (this.movement.y>=0) {
                    this.gravity=this.movement.y;
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
            
                yAdd+=this.gravity;
            }
        }
        
            // now move up or down
            
        if (yAdd>=0) {
            this.collideCeilingMeshIdx=-1;                         // no ceiling collisions if going down

            fallY=this.collision.fallObjectInMap(this,yAdd);
            this.position.addValuesTrunc(0,fallY,0);
        
            if (fallY<=0) this.gravity=this.gravityMinValue;
        }
        else {
            this.standOnMeshIdx=-1;                                 // no standing if going up
            
            riseY=this.collision.riseObjectInMap(this,yAdd);
            this.position.addValuesTrunc(0,riseY,0);
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
            this.movement.x-=this.movementSideAcceleration;
            if (this.movement.x<-this.movementSideMaxSpeed) this.movement.x=-this.movementSideMaxSpeed;
        }
        else {
            if (!this.movementSideRightOn) {
                this.movement.x+=this.movementSideAcceleration;
                if (this.movement.x>0) this.movement.x=0;
            }
        }

        if (this.movementSideRightOn) {
            this.movement.x+=this.movementSideAcceleration;
            if (this.movement.x>this.movementSideMaxSpeed) this.movement.x=this.movementSideMaxSpeed;
        }
        else {
            if (!this.movementSideLeftOn) {
                this.movement.x-=this.movementSideAcceleration;
                if (this.movement.x<0) this.movement.x=0;
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
            this.setupCurrentRoom();
            return;
        }

            // move around the map
        
        this.moveY(noGravity);
        this.moveXZ(bump,slide,clipping);
        
            // reset which room entity is in
            
        this.setupCurrentRoom();
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
                this.pushMesh=this.map.getMesh(meshIdx);
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
        // look (x angle)
        //

    look(addAngle)
    {
        this.angle.x+=addAngle;
        if (this.angle.x<-80.0) this.angle.x=-80.0;
        if (this.angle.x>=80.0) this.angle.x=80.0;
    }
    
        //
        // health, damage, death
        //
    
    die()
    {
    }
    
    addDamage(hitEntityId,damage)
    {
        this.damageTintStartTick=this.view.timeStamp;
        
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
        
        tick=this.view.timeStamp-this.damageTintStartTick;
        if (tick>=1000) {
            this.damageTintStartTick=-1;
            return(0.0);
        }
        
        if (tick<500) return((tick/500.0)*0.6);
        return((1.0-((tick-500)/500.0))*0.6);
    }
    
        //
        // room information
        //
        
    isInLiquid()
    {
        if (this.currentRoom===null) return(false);
        if (!this.currentRoom.liquid) return(false);
        
        return((this.position.y-this.eyeOffset)>=this.currentRoom.getLiquidY());
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
    
    getCurrentRoom()
    {
        return(this.currentRoom);
    }
    
    setupCurrentRoom()
    {
        let n,room;
        let nRoom=this.map.roomList.count();
        
            // check if still in the current
            // room
            
        if (this.currentRoom!==null) {
            if (this.currentRoom.posInRoom(this.position)) return;
        }
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.roomList.get(n);
            if (room.posInRoom(this.position)) {
                this.currentRoom=room;
                return;
            }
        }
    }
    
        //
        // run entity
        //
        
    run()
    {
    }
    
        //
        // frustum checks
        //
        
    inFrustum()
    {
        this.xFrustumBound.setFromValues((this.position.x-this.radius),(this.position.x+this.radius));
        this.yFrustumBound.setFromValues((this.position.y-this.high),this.position.y);
        this.zFrustumBound.setFromValues((this.position.z-this.radius),(this.position.z+this.radius));

        return(this.view.boundBoxInFrustum(this.xFrustumBound,this.yFrustumBound,this.zFrustumBound));
    }
    
        //
        // draw entity
        //
        
    draw()
    {
            // either update skeleton and create
            // vertices or just move to current position
            // and angle
            
        if ((this.model.skeleton!==null) && (!this.view.paused)) {
            this.model.skeleton.animate();
            this.model.mesh.updateVertexesToPoseAndPosition(this.model.skeleton,this.angle,this.position);
        }
        else {
            this.model.mesh.updateVertexesToAngleAndPosition(this.angle,this.position);
        }
        
            // draw the model
            
        this.model.draw();
    }
    
    
}
