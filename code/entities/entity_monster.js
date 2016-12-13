/* global entityList, config, sound, view */

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
        sound.play(this,this.ai.dieSoundBuffer);
        this.markAsDelete();
    }
    
    addDamage(hitEntityId,damage)
    {
        super.addDamage(hitEntityId,damage);
        
            // if we weren't active, play the
            // active sound instead of the hurt
        
        sound.play(this,(this.active?this.ai.wakeSoundBuffer:this.ai.hurtSoundBuffer));
        
            // always wake up and chase the
            // entity that damaged you
        
        this.active=true;
        if (hitEntityId!==-1) this.enemyId=hitEntityId;
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
        // wake up
        //
        
    wakeUp(enemy)
    {
        let dist;
        
            // if we are already awake, skip
            // also never awake if AI is off
            
        if ((this.active) || (!config.MONSTER_AI_ON)) return;
        
            // get distance, near wake distance always
            // wakes, far only if seen
            
        dist=enemy.position.distance(this.position);
        if (dist>this.ai.farWakeDistance) return;
        
            // if within near, wake up
            // otherwise, wake up if looking at you
            
        if (dist<this.ai.nearWakeDistance) {
            this.active=true;
        }
        else {
            this.active=(this.getAngleDifferenceTowardsPosition(enemy.position)<this.ai.fireSlopAngle);
        }
        
        if (!this.active) return;
        
            // play sound and reset last fire
            // time so it doesn't fire immediately
            
            console.log('WAKE '+this.id);
            
        sound.play(this,this.ai.wakeSoundBuffer);
        this.lastShotTimeStamp=view.timeStamp+this.ai.fireRechargeTick;
    }
    
        //
        // run monster
        //
    
    run()
    {
        let enemy;
        
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
            
        this.wakeUp(enemy);
        
            // inactive monsters currently just stand
            
        if (!this.active) {
            this.model.skeleton.idlePose(this.model.modelType);
            
            this.setMovementForward(false);
            this.move(true,false,false);
        }
        
            // active monsters stalk the player

        else {
            
                // pose
            
            this.model.skeleton.walkPose(this.model.modelType);
        
                // turn towards and stalk player

            this.setMovementForward(true);
            this.move(true,true,false,false);
            if (this.isStandingOnFloor()) this.lastAngleDifToEnemy=this.turnTowardsPosition(enemy.position,this.ai.walkTurnSpeed);
        }
        
            // firing projectiles
            
        if (this.active) this.fire(enemy);
    }
    
}
