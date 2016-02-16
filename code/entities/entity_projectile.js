"use strict";

//
// entity projectile object
//

function EntityProjectileObject(view,position,angle,radius,high,model)
{
    this.startTimeStamp=view.timeStamp;
    
    this.movePt=new wsPoint(0,0,0);     // global to stop GCd
    
        // supergumba -- ALL AWFUL REPLACE WHEN WE HAVE CLASSES
        // change all baseEntity. to this.
        
    this.baseEntity=new EntityObject(position,angle,radius,high,model);
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
    
    this.markAsDelete=function()
    {
        this.baseEntity.markedForDeletion=true;
    };
    
    this.isMarkedForDeletion=function()
    {
        return(this.baseEntity.isMarkedForDeletion());
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
        // run projectile
        //
    
    this.run=function(view,map,entityList)
    {
            // supergumba -- right now cancel any projectile
            // that last over 10 seconds
            
        if ((this.startTimeStamp+10000)<view.timeStamp) {
            this.baseEntity.markAsDelete();
            return;
        }
        
            // else move it
            
        if (this.baseEntity.moveSimple(map,400)) {
            this.baseEntity.markAsDelete();
        }
    };
    
    
}
