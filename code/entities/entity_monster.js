"use strict";

//
// monster entity class
//

function EntityMonsterObject(name,position,angle,radius,high,model)
{
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
    
    
    
    // local functions
    
    
        //
        // run monster
        //
    
    this.run=function(view,map,entityList)
    {
            // delete if hit by projectile
        
        var touchEntity=this.getTouchEntity();
        if (touchEntity!==null) {
            if (touchEntity.getName()==='projectile') {     // supergumba -- use instanceof here!!!
                this.markAsDelete();
                return;
            }
        }
        
        this.clearTouchEntity();
        
            // only move if close to player
        
        var player=entityList.getPlayer();
        var dist=player.getPosition().distance(this.getPosition());
        
        if ((dist>25000) || (!MONSTER_AI_ON)) {
            this.baseEntity.fall();
            return;
        }
        
            // turn towards player
            
        this.baseEntity.turnTowards(player.getAngle().y,1.0);
        
            // run towards player
            
        this.baseEntity.moveSimple(map,entityList,-50,true);
            
            // falling
        
        this.baseEntity.fall();
    };
    
}
