"use strict";

//
// entity projectile object
//

function EntityProjectileObject(name,view,position,angle,radius,high,model,hitSound)
{
    this.startTimeStamp=view.timeStamp;
    this.hitSound=hitSound;
    
    this.movePt=new wsPoint(0,0,0);     // global to stop GCd
    
        // supergumba -- ALL AWFUL REPLACE WHEN WE HAVE CLASSES
        // change all baseEntity. to this.
        
    this.baseEntity=new EntityObject(name,position,angle,radius,high,model);
    this.getName=function()
    {
        return(this.baseEntity.name);
    };
    this.getModel=function()
    {
        return(this.baseEntity.getModel());
    };
    
    this.getPosition=function()
    {
        return(this.baseEntity.getPosition());
    };
    
    this.getAngle=function()
    {
        return(this.baseEntity.getAngle());
    };
    this.getRadius=function()
    {
        return(this.baseEntity.radius);
    };
    
    this.getHigh=function()
    {
        return(this.baseEntity.high);
    };
    this.setId=function(id)
    {
        this.baseEntity.setId(id);
    };
    
    this.getId=function()
    {
        return(this.baseEntity.getId());
    };
    
    this.markAsDelete=function()
    {
        this.baseEntity.markedForDeletion=true;
    };
    
    this.isMarkedForDeletion=function()
    {
        return(this.baseEntity.isMarkedForDeletion());
    };
    this.clearTouchEntity=function()
    {
        this.baseEntity.touchEntity=null;
    };
    
    this.setTouchEntity=function(entity)
    {
        this.baseEntity.touchEntity=entity;
    };
    
    this.getTouchEntity=function()
    {
        return(this.baseEntity.touchEntity);
    };

    this.inFrustum=function(view)
    {
        return(this.baseEntity.inFrustum(view));
    };
    
    this.drawStart=function(view)
    {
        this.baseEntity.drawStart(view);
    };

    this.drawEnd=function(view)
    {
        this.baseEntity.drawEnd(view);
    };

    this.draw=function(view)
    {
        this.baseEntity.draw(view);
    };
    
    
    
    // supergumba -- local functions
    // 
    
        //
        // run projectile
        //
    
    this.run=function(view,soundList,map,entityList)
    {
            // supergumba -- right now cancel any projectile
            // that last over 10 seconds
            
        if ((this.startTimeStamp+10000)<view.timeStamp) {
            this.baseEntity.markAsDelete();
            return;
        }
        
            // else move it
            
        if (this.baseEntity.moveSimple(map,entityList,400,false)) {
            this.baseEntity.markAsDelete();
            view.particleList.addExplosionParticles(view,this.getPosition());
            hitSound.play(this.getPosition());
        }
    };
    
    
}
