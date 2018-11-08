import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';
import EntityClass from '../../code/entities/entity.js';

//
// monster entity class
//

export default class EntityMonsterClass extends EntityClass
{
    constructor(view,map,sound,name,position,angle,maxHealth,model)
    {
        super(view,map,sound,name,position,angle,maxHealth,model);
        
        this.standTurnSpeed=0;
        this.walkTurnSpeed=0;
        
        this.nearWakeDistance=0;
        this.farWakeDistance=0;
        this.farWakeHalfAngleFieldOfVision=0;
        this.sleepDistance=0;
        
        this.fireRechargeTick=0;
        this.fireSlopAngle=0;
        this.fireMaxDistance=0;
        this.lastFireTimeStamp=0;
        
        this.active=false;
        this.lastShotTimeStamp=0;
        
        this.enemyId=-1;
        this.currentDistanceToEnemy=0;
        this.lastAngleDifToEnemy=360;
        
        this.projectile=null;
        
        this.wakeSoundBuffer=null;
        this.hurtSoundBuffer=null;
        this.dieSoundBuffer=null;
        
            // global to stop GC
            
        this.fireAngle=new PointClass(0,0,0);
        this.firePosition=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
        //
        // death and damage override
        //
        
    die()
    {
        this.sound.play(this,this.dieSoundBuffer);
        this.markAsDelete();
    }
    
    addDamage(hitEntityId,damage)
    {
        super.addDamage(hitEntityId,damage);
        
            // if we weren't active, play the
            // active sound instead of the hurt
        
        this.sound.play(this,(this.active?this.wakeSoundBuffer:this.hurtSoundBuffer));
        
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
            
        if (this.projectile===null) return;
        
            // wait time not up
            
        if (this.view.timeStamp<this.lastShotTimeStamp) return;
        
            // check if we are within fire slop angle
            // or too far away
            
        if (this.lastAngleDifToEnemy>this.fireSlopAngle) return;
        if (this.currentDistanceToEnemy>this.fireMaxDistance) return;
        
            // setup fire position

        this.lastShotTimeStamp=this.view.timeStamp+this.fireRechargeTick;

        this.fireAngle.setFromPoint(this.angle);

        this.firePosition.setFromValues(0,0,Math.trunc(this.radius*1.5));      // supergumba -- all this is hardcoded!
        this.firePosition.rotate(this.fireAngle);
        this.firePosition.addPoint(this.position);
        this.firePosition.y-=Math.trunc(this.high*0.5);        // supergumba -- all this is hardcoded!
        
        this.fireAngle.x=-(this.firePosition.angleXTo(enemy.position)*0.7);     // need to calculate this better for speed
        
            // fire

        this.projectile.fire(this.id,this.firePosition,this.fireAngle);
    }
    
        //
        // wake up or sleep
        //
        
    wakeUpOrSleep(enemy)
    {
            // if monster AI is off, just keep sleeping
            
        if (!config.MONSTER_AI_ON) return;
        
            // if active, see if time to sleep
            
        if (this.active) {
            if (this.sleepDistance===-1) return;         // some monsters never sleep
            
            if (this.currentDistanceToEnemy>this.sleepDistance) {
                this.active=false;
                this.model.skeleton.resetAnimation();
                return;
            }
            
            return;
        }
        
            // get distance, near wake distance always
            // wakes, far only if seen
            
        if (this.currentDistanceToEnemy>this.farWakeDistance) return;
        
            // if within near, wake up
            // otherwise, wake up if looking at you
            
        if (this.currentDistanceToEnemy<this.nearWakeDistance) {
            this.active=true;
        }
        else {
            this.active=(this.getAngleDifferenceTowardsPosition(enemy.position)<this.farWakeHalfAngleFieldOfVision);
        }
        
        if (!this.active) return;
        
            // play sound and reset last fire
            // time so it doesn't fire immediately
            
        this.sound.play(this,this.wakeSoundBuffer);
        this.lastShotTimeStamp=this.view.timeStamp;
        
        this.model.skeleton.resetAnimation();
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
            
        if (this.enemyId===-1) this.enemyId=this.map.entityList.getPlayer().id;
        
        enemy=this.map.entityList.findById(this.enemyId);
        if (enemy===null) {
            enemy=this.map.entityList.getPlayer();
            this.enemyId=enemy.id;
        }
        
            // always mark last distance to enemy
            
        this.currentDistanceToEnemy=enemy.position.distance(this.position);
        
            // time to wake or sleep monster?
            
        this.wakeUpOrSleep(enemy);
        
            // inactive monsters currently just stand
            
        if (!this.active) {
            this.modelDraw.drawSkeleton.idlePose();
            
            this.setMovementForward(false);
            this.move(true,false,false);
        }
        
            // active monsters stalk the player

        else {
            
                // pose
            
            this.modelDraw.drawSkeleton.walkPose();
        
                // turn towards and stalk player

            this.setMovementForward(true);
            this.move(true,true,false,false);
            if (this.isStandingOnFloor()) this.lastAngleDifToEnemy=this.turnTowardsPosition(enemy.position,this.walkTurnSpeed);
        }
        
            // firing projectiles
            
        if (this.active) this.fire(enemy);
    }
    
}
