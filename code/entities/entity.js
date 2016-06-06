"use strict";

//
// entity base class
//

class EntityClass
{
    constructor(name,position,angle,maxHealth,model)
    {
        this.name=name;
        this.position=position;
        this.angle=angle;
        this.maxHealth=maxHealth;
        this.model=model;
        
        this.radius=this.model.calculateRadius();
        this.high=this.model.calculateHeight();
        
        this.eyeOffset=3000;

        this.id=-1;
        
        this.maxHealth=maxHealth;
        this.health=maxHealth;
        
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
        
        this.movement=new wsPoint(0,0,0);
        this.gravity=0;
        
        this.currentRoom=null;
        this.onFloor=false;

        this.markedForDeletion=false;              // used to delete this outside the run loop

        this.touchEntity=null;
        
        this.collideWallMeshIdx=-1;
        this.collideFloorCeilingMeshIdx=-1;
        this.standOnMeshIdx=-1;
        
        this.damageTintStartTick=-1;

        this.movePt=new wsPoint(0,0,0);     // this are global to stop them being local and GC'd
        this.slidePt=new wsPoint(0,0,0);
        this.collideMovePt=new wsPoint(0,0,0);
        this.collideSlideMovePt=new wsPoint(0,0,0);

        this.xFrustumBound=new wsBound(0,0);
        this.yFrustumBound=new wsBound(0,0);
        this.zFrustumBound=new wsBound(0,0);
        
        this.pushMesh=null;

        this.collision=new CollisionClass();
        
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
        // move entity
        //
    
    moveXZ(bump,clipping)
    {
            // if no movement, then skip
        
        if ((this.movePt.x===0) && (this.movePt.z===0)) return;
        
            // run the collision which
            // will return a new move direction
            // if it's the same as the original or
            // there's been a bump, move it, otherwise,
            // try sliding
            
        this.collision.moveObjectInMap(this,this.movePt,bump,this.collideMovePt);
        if ((this.collideMovePt.equals(this.movePt)) || (this.collideMovePt.y!==0)) {
            this.position.addPointTrunc(this.collideMovePt);
            return;
        }
        
            // try to slide
            
        this.slidePt.setFromValues(this.movePt.x,0.0,0.0);
        
        this.collision.moveObjectInMap(this,this.slidePt,false,this.collideSlideMovePt);
        if (this.collideSlideMovePt.equals(this.slidePt)) {
            this.position.addPointTrunc(this.collideSlideMovePt);
            return;
        }
        
        this.slidePt.setFromValues(0.0,0.0,this.movePt.z);
        
        this.collision.moveObjectInMap(this,this.slidePt,false,this.collideSlideMovePt);
        if (this.collideSlideMovePt.equals(this.slidePt)) {
            this.position.addPointTrunc(this.collideSlideMovePt);
            return;
        }
        
            // if nothing works, just use the
            // the original collide point
            
        this.position.addPointTrunc(this.collideMovePt);
    }
    
    moveY(noGravity)
    {
         var yAdd=this.movePt.y;
         
            // mark as not on floor
            
        this.onFloor=false;

            // add in gravity
            
        if (noGravity) {
            this.gravity=0;
        }
        else {
            if (this.gravity<=0) this.gravity=5;
            this.gravity*=1.1;
            if (this.gravity>100) this.gravity=100;       // supergumba -- there's a lot of made-up numbers here, need to be real numbers in the future

            yAdd+=this.gravity;
        }
        
            // now move
            
        if (yAdd>=0) {
            if (yAdd===0) yAdd=10;              // always try to fall
            
            var fallY=this.collision.fallObjectInMap(this,yAdd);
            this.position.addValuesTrunc(0,fallY,0);
        
            if (fallY<=0) {
                this.gravity=0;
                this.onFloor=true;
            }
        }
        else {
            this.position.addValuesTrunc(0,yAdd,0);
        }
    }
    
    move(bump,noGravity,clipping)
    {
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
        this.moveXZ(bump,clipping);
        
            // reset which room entity is in
            
        this.setupCurrentRoom();
    }
    
    moveSimple(xzDist,bump)
    {
        this.movePt.setFromValues(0.0,0.0,xzDist);
        this.movePt.rotateY(null,this.angle.y);
            
        this.collision.moveObjectInMap(this,this.movePt,bump,this.collideMovePt);
        if (!this.collideMovePt.equals(this.movePt)) return(true);
        
        this.position.addPointTrunc(this.collideMovePt);
        return(false);
    }
    
    moveDirect(x,y,z)
    {
        this.position.addValuesTrunc(x,y,z);
    }
    
        //
        // check floors and ceilings (mostly projectiles)
        //
        
    checkFloorCeilingCollision()
    {
        return(this.collision.checkFloorCeilingCollision(this));
    }
    
        //
        // mesh pushing
        //
        
    movementPush(meshIdx,movePnt)
    {
            // lifts
            
        if (movePnt.y<0) {
            if (this.standOnMeshIdx===meshIdx) {
                this.pushMesh=map.getMesh(meshIdx);
                if (this.position.y>=this.pushMesh.yBound.min) {
                    this.position.y=Math.trunc(this.pushMesh.yBound.min)-1;
                }
            }
        }
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
        var subway,addway;
        
        if (this.angle.y===toY) return;
	
            // which way is faster?
	
	if (this.angle.y>toY) {
            subway=this.angle.y-toY;
            addway=360.0-(this.angle.y-toY);
	}
	else {
            subway=360.0-(toY-this.angle.y);
            addway=toY-this.angle.y;
	}
		
            // now turn
		
	if (subway<addway) {
            if (subway>speed) subway=speed;
            this.turn(-subway);
	}
        else {
            if (addway>speed) addway=speed;
            this.turn(addway);
        }
    }
    
    turnTowardsPosition(pos,speed)
    {
        this.turnTowards(this.position.angleYTo(pos),speed);
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
    
    addDamage(damage)
    {
        this.damageTintStartTick=view.timeStamp;
        
        this.health-=damage;
        if (this.health<=0) this.die();
    }
    
    getPercentageHealth()
    {
        return(this.health/this.maxHealth);
    }
    
    getDamageTintAttenuation()
    {
        if (this.damageTintStartTick===-1) return(0.0);
        
        var tick=view.timeStamp-this.damageTintStartTick;
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
        
    inLiquid()
    {
        if (this.currentRoom===null) return(false);
        if (!this.currentRoom.liquid) return(false);
        
        return((this.position.y-this.eyeOffset)>=this.currentRoom.getLiquidY());
    }
    
    isOnFloor()
    {
        return(this.onFloor);
    }
    
    getCurrentRoom()
    {
        return(this.currentRoom);
    }
    
    setupCurrentRoom()
    {
        var n,room;
        var nRoom=map.rooms.length;
        
            // check if still in the current
            // room
            
        if (this.currentRoom!==null) {
            if (this.currentRoom.posInRoom(this.position)) return;
        }
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
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

        return(view.boundBoxInFrustum(this.xFrustumBound,this.yFrustumBound,this.zFrustumBound));
    }
    
        //
        // draw entity
        //
        
    drawStart()
    {
        this.model.drawStart();
    }

    drawEnd()
    {
        this.model.drawEnd();
    }

    draw()
    {
            // either update skeleton and create
            // vertices or just move to current position
            // and angle
            
        if ((this.model.skeleton!==null) && (!view.paused)) {
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
