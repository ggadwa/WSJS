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
            
        this.movementForwardMaxSpeed=ai.speed;
        this.movementForwardAcceleration=ai.acceleration;
        this.movementForwardDeceleration=ai.deceleration;
        
            // local variables

        this.ai=ai;
        
        this.active=false;
        this.lastShotTimeStamp=0;
        
        this.enemyId=-1;
        this.lastAngleDifToEnemy=360;
        
            // global to stop GC
            
        this.fireAngle=new wsPoint(0,0,0);
        this.firePosition=new wsPoint(0,0,0);
        
        Object.seal(this);
    }
    
        //
        // death and damage override
        //
        
    die()
    {
        this.markAsDelete();
    }
    
    addDamage(hitEntityId,damage)
    {
        super.addDamage(hitEntityId,damage);
        
        this.active=true;                           // always active monsters that take damage
        if (hitEntityId!==-1) this.enemyId=hitEntityId;     // and switch over enemy to whoever hit me
    }
    
        //
        // projectile firing
        //
        
    fire(enemy)
    {
            // can't fire if no projectile
            
        if (this.ai.projectile===null) return;
        
            // wait time not up
            
        if (view.timeStamp<this.lastShotTimeStamp) return;
        
            // check if we are within fire slop angle
            
        if (this.lastAngleDifToEnemy>this.ai.fireSlopAngle) return;
        
            // fire

        this.lastShotTimeStamp=view.timeStamp+this.ai.fireRechargeTick;

        this.fireAngle.setFromPoint(this.angle);

        this.firePosition.setFromValues(0,0,Math.trunc(this.radius*1.5));      // supergumba -- all this is hardcoded!
        this.firePosition.rotate(this.fireAngle);
        this.firePosition.addPoint(this.position);
        this.firePosition.y-=Math.trunc(this.high*0.5);        // supergumba -- all this is hardcoded!

        this.ai.projectile.fire(this.id,this.firePosition,this.fireAngle);
    }
    
        //
        // run monster
        //
    
    run()
    {
        var enemy;
        
            // if we don't have an enemy yet,
            // make it the player, and if our old
            // enemy got deleted, revert back to player
            
        if (this.enemyId===-1) this.enemyId=entityList.getPlayer().id;
        
        enemy=entityList.findEntityById(this.enemyId);
        if (enemy===null) {
            enemy=entityList.getPlayer();
            this.enemyId=enemy.id;
        }
        
            // time to activate monster?
        
        if ((!this.active) && (config.MONSTER_AI_ON)) {
            var dist=enemy.position.distance(this.position);
            this.active=(dist<25000);
        }
        
            // inactive monsters can only turn towards
            // the player if standing on a floor
            
        if (!this.active) {
            this.model.skeleton.idlePose(this.model.modelType);
            
            this.setMovementForward(false);
            this.move(true,false,false);
            if (this.isStandingOnFloor()) this.lastAngleDifToEnemy=this.turnTowardsPosition(enemy.position,this.ai.standTurnSpeed);
        }
        
            // active monsters stalk the player

        else {
            
                // pose
            
            this.model.skeleton.walkPose(this.model.modelType);
        
                // turn towards and stalk player

            this.setMovementForward(true);
            //this.move(true,true,false,false);
            //if (this.isStandingOnFloor()) this.lastAngleDifToEnemy=this.turnTowardsPosition(enemy.position,this.ai.walkTurnSpeed);
        }
        
            // firing projectiles
            
        if (this.active) this.fire(enemy);
    }
    
}
