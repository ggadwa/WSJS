"use strict";

//
// monster entity class
//

function EntityMonsterObject(position,angle,radius,high,model)
{
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
    
        //
        // run monster
        //
    
    this.run=function(view,map,entityList)
    {
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
            
        this.baseEntity.moveSimple(map,-50);
            
            // falling
        
        this.baseEntity.fall();
    };
    
}
