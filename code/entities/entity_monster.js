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
        
        Object.seal(this);
    }
    
        //
        // run monster
        //
    
    run(view,soundList,map,entityList)
    {
        var player;
        
            // delete if hit by projectile
        
        if (this.touchEntity!==null) {
            if (this.touchEntity instanceof EntityProjectileClass) {
                this.markAsDelete();
                return;
            }
        }
        
        this.touchEntity=null;
        
            // time to activate monster?
        
        player=entityList.getPlayer();
        
        if ((!this.active) && (config.MONSTER_AI_ON)) {
            var dist=player.position.distance(this.position);
            this.active=(dist<25000);
        }
        
        if (!this.active) {
            this.model.skeleton.idlePose(view,this.model.modelType);
        }
        else {
            
                // pose
            
            this.model.skeleton.walkPose(view,this.model.modelType);
        
                // turn towards player

            super.turnTowards(player.angle.y,1.0);

                // run towards player

            super.moveSimple(map,entityList,-50,true);
        }
        
            // falling
        
        super.fall(map);
    }
    
}
