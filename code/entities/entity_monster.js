"use strict";

//
// monster AI class
// we use this to create a type of monster, and attach this to the regular entity monster
//

class MonsterAIClass
{
    constructor(projectile)
    {
        this.projectile=projectile;
    }
}

//
// monster entity class
//

class EntityMonsterClass extends EntityClass
{
    constructor(name,position,angle,maxHealth,model,ai)
    {
        super(name,position,angle,maxHealth,model);
        
        this.ai=ai;
        
        this.active=false;
        this.lastShotTimeStamp=0;
        
        Object.seal(this);
    }
    
        //
        // death override
        //
        
    die()
    {
        this.markAsDelete();
    }
    
        //
        // run monster
        //
    
    run(map)
    {
        var player;
        
            // time to activate monster?
        
        player=entityList.getPlayer();
        
        if ((!this.active) && (config.MONSTER_AI_ON)) {
            var dist=player.position.distance(this.position);
            this.active=(dist<25000);
        }
        
        if (!this.active) {
            this.model.skeleton.idlePose(this.model.modelType);
        }
        else {
            
                // pose
            
            this.model.skeleton.walkPose(this.model.modelType);
        
                // turn and move towards player if
                // not falling
                
            if (!super.isFalling()) {
                super.turnTowards(player.angle.y,1.0);
                super.moveSimple(map,-50,true);
            }
        }
        
            // falling
        
        super.fall(map);
        
            // firing projectiles

        if (this.active) {
            if (view.timeStamp>this.lastShotTimeStamp) {
                this.lastShotTimeStamp=view.timeStamp+5000;

                var ang=new wsPoint(0,0,0);
                ang.setFromPoint(this.angle);
                ang.y+=180.0;

                var pos=new wsPoint(0,0,4000);      // supergumba -- all this is hardcoded!
                pos.rotate(ang);
                pos.addPoint(this.position);
                pos.y-=2000;        // supergumba -- all this is hardcoded!

                this.ai.projectile.fire(pos,ang);
            }
        }
    }
    
}
