"use strict";

//
// entity projectile object
//

class EntityProjectileClass extends EntityClass
{
    constructor(name,parentEntityId,position,angle,projectile)
    {
        super(name,position,angle,0,projectile.model);
        
            // remember who shot this
            
        this.parentEntityId=parentEntityId;
        
            // entity setup
            
        this.movementForwardMaxSpeed=projectile.speed;
        this.movementForwardAcceleration=projectile.speed;
        this.movementForwardDeceleration=0;
        
        this.gravity=projectile.gravityInitValue;
        this.gravityMaxValue=projectile.gravityMaxValue;
        this.gravityAcceleration=projectile.gravityAcceleration;
        
            // local variables
            
        this.projectile=projectile;
        this.startTimeStamp=view.timeStamp;
        
        Object.seal(this);
    }
    
        //
        // damage overrides
        // projectiles can't take damage, they just get destroyed
        // if they hit each other
        //
    
    addDamage(hitEntityId,damage)
    {
        this.markAsDelete();
    }
    
        //
        // projectile hits
        //
        
    hit()
    {
            // delete entity
            
        this.markAsDelete();
        
            // explosion and sound
            
        particleList.addExplosionParticles(this.position);
        this.projectile.hitSound.play(this.position);
        
            // handle any damage
        
        if (this.touchEntity!==null) this.touchEntity.addDamage(this.parentEntityId,this.projectile.damage);
    }
    
        //
        // run projectile
        //
    
    run()
    {
            // cancel any projectile that lasts over lifetime
            
        if ((this.startTimeStamp+this.projectile.lifeTick)<view.timeStamp) {
            this.markAsDelete();
            return;
        }
        
            // move it and check for any collisions
        
        this.setMovementForward(true);
        this.move(false,false,this.projectile.noGravity,false);
        
        if (this.isAnyCollision()) {
            this.hit();
            return;
        }
    }
    
    
}
