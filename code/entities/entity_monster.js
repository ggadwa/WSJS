"use strict";

//
// monster entity class
//

class EntityMonsterClass extends EntityClass
{
    constructor(name,position,angle,radius,high,model)
    {
        super(name,position,angle,radius,high,model);
        this.active=false;
    }
    
        //
        // run monster
        //
    
    run(view,soundList,map,entityList)
    {
        var player,touchEntity;
        
            // delete if hit by projectile
        
        touchEntity=this.getTouchEntity();
        if (touchEntity!==null) {
            if (touchEntity instanceof EntityProjectileClass) {
                this.markAsDelete();
                return;
            }
        }
        
        this.clearTouchEntity();
        
            // time to activate monster?
        
        player=entityList.getPlayer();
        
        if ((!this.active) && (MONSTER_AI_ON)) {
            var dist=player.position.distance(this.position);
            this.active=(dist<25000);
        }
        
        if (this.active) {
            
                // pose
            
            this.model.skeleton.randomPose(view,this.model.modelType);
        
                // turn towards player

            super.turnTowards(player.angle.y,1.0);

                // run towards player

            super.moveSimple(map,entityList,-50,true);
        }
        
            // falling
        
        super.fall(map);
    }
    
}
