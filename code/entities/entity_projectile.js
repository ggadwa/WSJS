"use strict";

//
// entity projectile object
//

class EntityProjectileClass extends EntityClass
{
    constructor(name,position,angle,projectile)
    {
        super(name,position,angle,0,projectile.model);
        
        this.projectile=projectile;
        this.startTimeStamp=view.timeStamp;
        
            // reset gravity from look up angle
            // and initial value
            
        var rd=angle.x*DEGREE_TO_RAD;
        this.gravity=(angle.x*Math.cos(rd))-(this.projectile.speed*Math.sin(rd));
        this.gravity+=this.projectile.gravityInitValue;
    
        this.movePt=new wsPoint(0,0,0);     // global to stop GCd
        
        Object.seal(this);
    }
    
        //
        // damage overrides
        // projectiles can't take damage, they just get destroyed
        // if they hit each other
        //
    
    addDamage(damage)
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
        
        if (this.touchEntity!==null) this.touchEntity.addDamage(this.projectile.damage);
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
        
            // handle gravity
            
        this.position.y+=this.gravity;
        
        if ((this.startTimeStamp+this.projectile.gravityWaitTimeStamp)<=view.timeStamp) {
            this.gravity+=this.projectile.gravityAdd;
        }
        
            // move it and check wall collisions
            
        if (this.moveSimple(this.projectile.speed,false)) {
            this.hit();
            return;
        }
        
            // check floor and ceiling collisions
            
        if (this.checkFloorCeilingCollision()) {
            this.hit();
            return;
        }
    }
    
    
}
