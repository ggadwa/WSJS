"use strict";

//
// entity projectile object
//

class EntityProjectileClass extends EntityClass
{
    constructor(name,view,position,angle,radius,high,projectile)
    {
        super(name,position,angle,radius,high,0,projectile.model);
        
        this.projectile=projectile;
        this.startTimeStamp=view.timeStamp;
    
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
        
            // else move it
            
        if (super.moveSimple(map,entityList,this.projectile.speed,false)) {
            super.markAsDelete();
            view.particleList.addExplosionParticles(view,this.position);
            this.projectile.hitSound.play(this.position);
        }
    }
    
    
}
