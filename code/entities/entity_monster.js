"use strict";

//
// monster entity class
//

class EntityMonsterClass extends EntityClass
{
    constructor(name,position,angle,maxHealth,model,ai)
    {
        super(name,position,angle,maxHealth,model);
        
            // entity setup
            
        this.movementForwardMaxSpeed=50;
        this.movementForwardAcceleration=5;
        this.movementForwardDeceleration=10;
        
            // local variables

        this.ai=ai;
        
        this.active=false;
        this.lastShotTimeStamp=0;
        
        Object.seal(this);
    }
    
        //
        // death and damage override
        //
        
    die()
    {
        this.markAsDelete();
    }
    
    addDamage(damage)
    {
        super.addDamage(damage);
        
        this.active=true;           // always active monsters that take damage
    }
    
        //
        // run monster
        //
    
    run()
    {
        var player;
        
            // time to activate monster?
        
        player=entityList.getPlayer();
        
        if ((!this.active) && (config.MONSTER_AI_ON)) {
            var dist=player.position.distance(this.position);
            this.active=(dist<25000);
        }
        
            // inactive monsters can only turn towards
            // the player if standing on a floor
            
        if (!this.active) {
            this.model.skeleton.idlePose(this.model.modelType);
            
            this.setMovementForward(false);
            this.move(true,false,false);
            if (this.isStandingOnFloor()) this.turnTowardsPosition(player.position,1.0);
        }
        
            // active monsters stalk the player

        else {
            
                // pose
            
            this.model.skeleton.walkPose(this.model.modelType);
        
                // turn towards and stalk player

            this.setMovementForward(true);
            this.move(true,true,false,false);
            if (this.isStandingOnFloor()) this.turnTowardsPosition(player.position,1.0);
        }
        
            // firing projectiles

        if (this.active) {
            if (view.timeStamp>this.lastShotTimeStamp) {
                this.lastShotTimeStamp=view.timeStamp+5000;

                var ang=new wsPoint(0,0,0);
                ang.setFromPoint(this.angle);

                var pos=new wsPoint(0,0,4000);      // supergumba -- all this is hardcoded!
                pos.rotate(ang);
                pos.addPoint(this.position);
                pos.y-=2000;        // supergumba -- all this is hardcoded!

                this.ai.projectile.fire(pos,ang);
            }
        }
    }
    
}
