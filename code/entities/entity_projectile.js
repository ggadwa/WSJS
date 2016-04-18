"use strict";

//
// entity projectile object
//

class EntityProjectileClass extends EntityClass
{
    constructor(name,view,position,angle,projectile)
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
        // run projectile
        //
    
    run(view,map,entityList)
    {
            // supergumba -- right now cancel any projectile
            // that last over 10 seconds
            
        if ((this.startTimeStamp+this.projectile.lifeTick)<view.timeStamp) {
            super.markAsDelete();
            return;
        }
        
            // handle gravity
            
        this.position.y+=this.gravity;
        
        if ((this.startTimeStamp+this.projectile.gravityWaitTimeStamp)>=view.timeStamp) {
            this.gravity+=this.projectile.gravityAdd;
        }
        
            // else move it
            
        if (super.moveSimple(map,entityList,this.projectile.speed,false)) {
            super.markAsDelete();
            view.particleList.addExplosionParticles(view,this.position);
            this.projectile.hitSound.play(this.position);
        }
    }
    
    
}
