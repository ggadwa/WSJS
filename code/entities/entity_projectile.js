"use strict";

//
// entity projectile object
//

class EntityProjectileClass extends EntityClass
{
    constructor(name,view,position,angle,radius,high,model,hitSound)
    {
        super(name,position,angle,radius,high,model);
        
        this.startTimeStamp=view.timeStamp;
        this.hitSound=hitSound;
    
        this.movePt=new wsPoint(0,0,0);     // global to stop GCd
    }
    
        //
        // run projectile
        //
    
    run(view,bitmapList,soundList,map,entityList)
    {
            // supergumba -- right now cancel any projectile
            // that last over 10 seconds
            
        if ((this.startTimeStamp+10000)<view.timeStamp) {
            super.markAsDelete();
            return;
        }
        
            // else move it
            
        if (super.moveSimple(map,entityList,400,false)) {
            super.markAsDelete();
            view.particleList.addExplosionParticles(view,bitmapList.getBitmap('Particle Blob'),this.position);
            this.hitSound.play(this.position);
        }
    }
    
    
}
