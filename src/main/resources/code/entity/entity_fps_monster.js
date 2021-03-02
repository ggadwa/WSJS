import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import EntityClass from '../game/entity.js';

//
// monster class
//

export default class EntityFPSMonsterClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.STATE_HIDDEN=0;
        this.STATE_ASLEEP=1;
        this.STATE_WAKING_UP=2;
        this.STATE_IDLE=3;
        this.STATE_STALKING=4;
        this.STATE_HURT=5;
        this.STATE_MELEE=6;
        this.STATE_PROJECTILE=7;
        this.STATE_DYING=8;
        this.STATE_DEAD=9;
        
        this.state=this.STATE_ASLEEP;
        
        this.health=0;
        this.startHealth=0;
        this.startAsleep=false;
        this.wakeUpDistance=0;
        this.wakeUpOnOtherWakeUpDistance=0;
        this.idleDistance=0;
        this.meleeDistance=0;
        this.meleeWaitTick=0;
        this.nextMeleeTick=0;
        this.meleeDamage=0;
        this.projectileDistance=0;
        this.projectileWaitTick=0;
        this.nextProjectileTick=0;
        this.projectileStartTick=-1;
        this.projectileFirePosition=null;
        this.projectileJson=null;
        this.projectileData=null;
        this.projectileRequiresSight=true;
        this.noSelfDamage=false;
        this.hitAnimationPercentage=1.0;
        this.maxTurnSpeed=0;
        this.forwardAcceleration=0;
        this.forwardDeceleration=0;
        this.forwardMaxSpeed=0;
        this.reverseAcceleration=0;
        this.reverseDeceleration=0;
        this.reverseMaxSpeed=0;
        this.sideAcceleration=0;
        this.sideDeceleration=0;
        this.sideMaxSpeed=0;
        this.damageSpeedFactor=0;
        this.slideMoveTick=0;
        this.canBump=true;
        this.canSlide=true;
        this.canBePushed=false;
        this.angleYProjectileRange=5;
        this.angleYMeleeRange=15;
        this.jumpWaitTick=0;
        this.jumpWaitTickRandomAdd=0;
        this.nextJumpTick=0;
        this.jumpHeight=0;
        this.nextDamageTick=0;        
        
        this.idlePath=null;
        this.stalkByPath=false;
        this.seekNodeDistanceSlop=0;
        this.seekNodeAngleSlop=0;
        this.seekPauseDistance=0;
       
        this.sleepAnimation=null;
        this.wakeUpAnimation=null;
        this.idleAnimation=null;
        this.walkAnimation=null;
        this.meleeLeftAnimation=null;
        this.meleeRightAnimation=null;
        this.projectileAnimation=null;
        this.hitAnimation=null;
        this.dieAnimation=null;
        
        this.wakeUpSound=null;
        this.hurtSound=null;
        this.meleeSound=null;
        this.deathSound=null;
        this.fallSound=null;
        
        this.fallSoundNextTick=0;
        this.meleeHitNextTick=0;
        this.projectileFireNextTick=0;
        
        this.lastInLiquidIdx=-1;
        
        this.slideDirection=0;
        this.slideNextTick=0;
        
        this.movementFreezeNextTick=0;
        
        this.wakeUpSetTriggerName=null;
        this.deathSetTriggerName=null;
        this.showTriggerName=null;
        
        this.animationFinishTick=0;
        this.noiseFinishTick=0;
        
        this.nextNodeIdx=-1;
        this.playerNodeIdx=-1;
        this.idlePathIdx=0;
        this.idleGoalNodeIdx=-1;
        
            // pre-allocations

        this.movement=new PointClass(0,0,0);
        this.sideMovement=new PointClass(0,0,0);
        this.pushMovement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        this.origPosition=new PointClass(0,0,0);
        
        this.firePosition=new PointClass(0,0,0);
        this.fireAngle=new PointClass(0,0,0);
        this.fireVector=new PointClass(0,0,0);
        this.fireHitPoint=new PointClass(0,0,0);
        
        Object.seal(this);
    }

    initialize()
    {
        super.initialize();            
        
        this.startHealth=this.core.game.lookupValue(this.json.config.startHealth,this.data,0);
        this.startAsleep=this.core.game.lookupValue(this.json.config.startAsleep,this.data,false);
        this.wakeUpDistance=this.core.game.lookupValue(this.json.config.wakeUpDistance,this.data,0);
        this.wakeUpOnOtherWakeUpDistance=this.core.game.lookupValue(this.json.config.wakeUpOnOtherWakeUpDistance,this.data,0);
        this.idleDistance=this.core.game.lookupValue(this.json.config.idleDistance,this.data,0);
        
        this.meleeDistance=this.core.game.lookupValue(this.json.config.meleeDistance,this.data,0);
        this.meleeWaitTick=this.core.game.lookupValue(this.json.config.meleeWaitTick,this.data,0);
        this.meleeDamage=this.core.game.lookupValue(this.json.config.meleeDamage,this.data,0);
        
        this.projectileDistance=this.core.game.lookupValue(this.json.config.projectileDistance,this.data,0);
        this.projectileWaitTick=this.core.game.lookupValue(this.json.config.projectileWaitTick,this.data,0);
        this.projectileFirePosition=this.core.game.lookupPointValue(this.json.config.projectileFirePosition,0,0,0);
        this.projectileJson=this.core.game.lookupValue(this.json.config.projectileJson,this.data,null);
        this.projectileData=this.json.config.projectileData;
        this.projectileRequiresSight=this.core.game.lookupValue(this.json.config.projectileRequiresSight,this.data,0);
        this.noSelfDamage=this.core.game.lookupValue(this.json.config.noSelfDamage,this.data,false);
        this.hitAnimationPercentage=this.core.game.lookupValue(this.json.config.hitAnimationPercentage,this.data,1.0);
        
        this.maxTurnSpeed=this.core.game.lookupValue(this.json.config.maxTurnSpeed,this.data,0);
        this.forwardAcceleration=this.core.game.lookupValue(this.json.config.forwardAcceleration,this.data,0);
        this.forwardDeceleration=this.core.game.lookupValue(this.json.config.forwardDeceleration,this.data,0);
        this.forwardMaxSpeed=this.core.game.lookupValue(this.json.config.forwardMaxSpeed,this.data,0);
        this.reverseAcceleration=this.core.game.lookupValue(this.json.config.reverseAcceleration,this.data,0);
        this.reverseDeceleration=this.core.game.lookupValue(this.json.config.reverseDeceleration,this.data,0);
        this.reverseMaxSpeed=this.core.game.lookupValue(this.json.config.reverseMaxSpeed,this.data,0);
        this.sideAcceleration=this.core.game.lookupValue(this.json.config.sideAcceleration,this.data,0);
        this.sideDeceleration=this.core.game.lookupValue(this.json.config.sideDeceleration,this.data,0);
        this.sideMaxSpeed=this.core.game.lookupValue(this.json.config.sideMaxSpeed,this.data,0);
        this.damageSpeedFactor=this.core.game.lookupValue(this.json.config.damageSpeedFactor,this.data,0);
        this.slideMoveTick=this.core.game.lookupValue(this.json.config.slideMoveTick,this.data,0);
        this.jumpWaitTick=this.core.game.lookupValue(this.json.config.jumpWaitTick,this.data,0);
        this.jumpWaitTickRandomAdd=this.core.game.lookupValue(this.json.config.jumpWaitTickRandomAdd,this.data,0);
        this.jumpHeight=this.core.game.lookupValue(this.json.config.jumpHeight,this.data,0);
        this.canBump=this.core.game.lookupValue(this.json.config.canBump,this.data,true);
        this.canSlide=this.core.game.lookupValue(this.json.config.canSlide,this.data,true);
        this.canBePushed=this.core.game.lookupValue(this.json.config.canBePushed,this.data,false);
        this.angleYProjectileRange=this.core.game.lookupValue(this.json.config.angleYProjectileRange,this.data,0);
        this.angleYMeleeRange=this.core.game.lookupValue(this.json.config.angleYMeleeRange,this.data,0);
        
        this.idlePath=this.core.game.lookupValue(this.json.config.idlePath,this.data,null);
        this.stalkByPath=this.core.game.lookupValue(this.json.config.stalkByPath,this.data,false);
        this.seekNodeDistanceSlop=this.core.game.lookupValue(this.json.config.seekNodeDistanceSlop,this.data,0);
        this.seekNodeAngleSlop=this.core.game.lookupValue(this.json.config.seekNodeAngleSlop,this.data,0);
        this.seekPauseDistance=this.core.game.lookupValue(this.json.config.seekPauseDistance,this.data,0);
        
        this.sleepAnimation=this.core.game.lookupAnimationValue(this.json.animations.sleepAnimation);
        this.wakeUpAnimation=this.core.game.lookupAnimationValue(this.json.animations.wakeUpAnimation);
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.animations.idleAnimation);
        this.walkAnimation=this.core.game.lookupAnimationValue(this.json.animations.walkAnimation);
        this.meleeLeftAnimation=this.core.game.lookupAnimationValue(this.json.animations.meleeLeftAnimation);
        this.meleeRightAnimation=this.core.game.lookupAnimationValue(this.json.animations.meleeRightAnimation);
        this.projectileAnimation=this.core.game.lookupAnimationValue(this.json.animations.projectileAnimation);
        this.hitAnimation=this.core.game.lookupAnimationValue(this.json.animations.hitAnimation);
        this.dieAnimation=this.core.game.lookupAnimationValue(this.json.animations.dieAnimation);
        
        this.wakeUpSound=this.core.game.lookupSoundValue(this.json.sounds.wakeUpSound);
        this.hurtSound=this.core.game.lookupSoundValue(this.json.sounds.hurtSound);
        this.meleeSound=this.core.game.lookupSoundValue(this.json.sounds.meleeSound);
        this.deathSound=this.core.game.lookupSoundValue(this.json.sounds.deathSound);
        this.fallSound=this.core.game.lookupSoundValue(this.json.sounds.fallSound);
        
        this.wakeUpSetTriggerName=this.core.game.lookupValue(this.json.triggers.wakeUpSetTrigger,this.data,null);
        this.deathSetTriggerName=this.core.game.lookupValue(this.json.triggers.deathSetTrigger,this.data,null);
        this.showTriggerName=this.core.game.lookupValue(this.json.triggers.showTrigger,this.data,null);
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        this.health=this.startHealth;
        
            // misc
            
        this.lastInLiquidIdx=-1;
        this.slideNextTick=0;
        this.movementFreezeNextTick=0;
        this.animationFinishTick=0;
        this.noiseFinishTick=0;
        
        this.pushMovement.setFromValues(0,0,0);
            
            // start proper state
            
        if (this.showTriggerName!==null) {
            this.goHidden();
        }
        else {
            if (this.startAsleep) {
                this.goAsleep();
            }
            else {
                this.goIdle();
            }
        }
    }
    
        //
        // projectile fire setup
        //
        
    projectileSetupFire(player)
    {
        this.firePosition.setFromPoint(this.projectileFirePosition);
        this.firePosition.rotateY(null,this.angle.y);
        this.firePosition.addPoint(this.position);
        
        this.fireAngle.setFromPoint(this.angle);
        this.fireAngle.x=this.position.getLookAngleTo(player.position);
    }
    
        //
        // state changes
        //
        
    goHidden()
    {
        this.state=this.STATE_HIDDEN;
        
        this.modelEntityAlter.startAnimationChunkInFrames(this.idleAnimation);
    }
    
    goAsleep()
    {
        this.state=this.STATE_ASLEEP;
        
        this.modelEntityAlter.startAnimationChunkInFrames(this.sleepAnimation);
    }   
        
    goWakeUp(noRecurse)
    {
        let entity;
        
            // wake this monster up
            
        this.state=this.STATE_WAKING_UP;
        
        this.modelEntityAlter.startAnimationChunkInFrames(this.wakeUpAnimation);
        this.animationFinishTick=this.core.game.timestamp+this.modelEntityAlter.getAnimationTickCount(this.wakeUpAnimation);
        
        this.core.audio.soundStartGameFromList(this.core.game.map.soundList,this.position,this.wakeUpSound);
        if (this.wakeUpSetTriggerName!==null) this.core.game.setTrigger(this.wakeUpSetTriggerName);
        
        if (noRecurse) return;
        
            // check any other monster of the same
            // type being alerted
        
        for (entity of this.core.game.map.entityList.entities) {
            if (entity===this) continue;
            if ((!entity.show) || (entity.health<=0)) continue;
            if (entity.json.name!==this.json.name) continue;
            
            if (this.position.distance(entity.position)<entity.wakeUpOnOtherWakeUpDistance) {
                entity.goWakeUp(true);
            }
        }
    }
    
    goIdle()
    {
        this.state=this.STATE_IDLE;
        
            // if there's a path, walk it, otherwise just idle in place
            
        if (this.idlePath!==null) {
            this.idlePathIdx=0;
            this.idleGoalNodeIdx=this.findKeyNodeIndex(this.idlePath[this.idlePathIdx]);
            this.nextNodeIdx=this.nextNodeInPath(this.findNearestPathNode(-1),this.idleGoalNodeIdx); 
            
            this.modelEntityAlter.startAnimationChunkInFrames(this.walkAnimation);
        }
        else {
            this.modelEntityAlter.startAnimationChunkInFrames(this.idleAnimation);
        }
    }   
    
    goStalk(resetTimers)
    {
        this.state=this.STATE_STALKING;
        
        this.movement.setFromValues(0,0,0);
        
        if (resetTimers) {
            this.nextProjectileTick=this.core.game.timestamp+this.projectileWaitTick;
            this.nextMeleeTick=this.core.game.timestamp+this.meleeWaitTick;
            this.nextJumpTick=this.core.game.timestamp+(this.jumpWaitTick+Math.trunc(Math.random()*this.jumpWaitTickRandomAdd));
        }
        
        if (this.stalkByPath) {
            this.playerNodeIdx=this.core.game.map.entityList.getPlayer().findNearestPathNode(-1);
            this.nextNodeIdx=this.nextNodeInPath(this.findNearestPathNode(-1),this.playerNodeIdx);  // always assume monster starts on node
        }
        
        this.modelEntityAlter.startAnimationChunkInFrames(this.walkAnimation);
    }
    
    goHurt()
    {
            // we always make a noise if possible
        
        if (this.noiseFinishTick<=this.core.game.timestamp) {
            this.noiseFinishTick=this.core.game.timestamp+this.core.game.map.soundList.getMillisecondDurationJson(this.hurtSound);
            this.core.audio.soundStartGameFromList(this.core.game.map.soundList,this.position,this.hurtSound);
        }
        
            // if still in hurt, that means the animation
            // is complete so skip
            
        if (this.state===this.STATE_HURT) return;
        
            // go into hurt state if percentage
            // is OK
            
        if (Math.random()<this.hitAnimationPercentage) {
            this.state=this.STATE_HURT;

            this.modelEntityAlter.startAnimationChunkInFrames(this.hitAnimation);
            this.animationFinishTick=this.core.game.timestamp+this.modelEntityAlter.getAnimationTickCount(this.hitAnimation);
        }
    }
    
    goMelee(distToPlayer)
    {
        if ((distToPlayer>this.meleeDistance) || (this.core.game.timestamp<this.nextMeleeTick)) return;
        
        this.state=this.STATE_MELEE;
        
        if (Math.random()<0.5) {
            this.modelEntityAlter.startAnimationChunkInFrames(this.meleeLeftAnimation);
            this.meleeHitNextTick=this.modelEntityAlter.getAnimationFinishTimestampFromFrame(this.meleeLeftAnimation.actionFrame,this.meleeLeftAnimation);
            this.animationFinishTick=this.core.game.timestamp+this.modelEntityAlter.getAnimationTickCount(this.meleeLeftAnimation);
        }
        else {
            this.modelEntityAlter.startAnimationChunkInFrames(this.meleeRightAnimation);
            this.meleeHitNextTick=this.modelEntityAlter.getAnimationFinishTimestampFromFrame(this.meleeRightAnimation.actionFrame,this.meleeRightAnimation);
            this.animationFinishTick=this.core.game.timestamp+this.modelEntityAlter.getAnimationTickCount(this.meleeRightAnimation);
        }
    }
    
    goProjectile(player,distToPlayer)
    {
            // don't fire if past projectile distance, or less than melee distance
            
        if ((distToPlayer>this.projectileDistance) || (distToPlayer<this.meleeDistance) || (this.core.game.timestamp<this.nextProjectileTick)) return;
        
            // does it sight the player?
            
        if (this.projectileRequiresSight) {
            this.projectileSetupFire(player);

            this.fireVector.setFromValues(0,0,this.projectileDistance);
            this.fireVector.rotateX(null,this.fireAngle.x);
            this.fireVector.rotateY(null,this.fireAngle.y);
            
            if (!this.collision.rayCollision(this,this.firePosition,this.fireVector,this.fireHitPoint)) return;
            if (this.hitEntity!==player) return;
        }
        
            // we can fire
            
        this.state=this.STATE_PROJECTILE;

            // projectile animaton
            
        this.modelEntityAlter.startAnimationChunkInFrames(this.projectileAnimation);
        this.projectileFireNextTick=this.modelEntityAlter.getAnimationFinishTimestampFromFrame(this.projectileAnimation.actionFrame,this.projectileAnimation);
        this.animationFinishTick=this.core.game.timestamp+this.modelEntityAlter.getAnimationTickCount(this.projectileAnimation);
    }
    
    goDying()
    {
        this.state=this.STATE_DYING;
        
        this.passThrough=true;

        this.modelEntityAlter.startAnimationChunkInFrames(this.dieAnimation);
        this.modelEntityAlter.queueAnimationStop();
        this.animationFinishTick=this.core.game.timestamp+this.modelEntityAlter.getAnimationTickCount(this.dieAnimation);

        this.core.audio.soundStartGameFromList(this.core.game.map.soundList,this.position,this.deathSound);

        this.fallSoundNextTick=this.modelEntityAlter.getAnimationFinishTimestampFromFrame(this.dieAnimation.actionFrame,this.dieAnimation);
    }
    
    goDead()
    {
        this.state=this.STATE_DEAD;
        
        this.passThrough=true;
        if (this.deathSetTriggerName!==null) this.core.game.setTrigger(this.deathSetTriggerName);
    }
    
        //
        // damage
        //
        
    damage(fromEntity,damage,hitPoint)
    {
        if ((this.state===this.STATE_HIDDEN) || (this.state===this.STATE_DYING) || (this.state===this.STATE_DEAD)) return;
        
            // no self damage
            
        if (this.noSelfDamage) {
            if (fromEntity===this) return;
        }
        
            // the damage and death
            
        this.health-=damage;
        
        if (this.health<=0) {
            this.goDying();
            return;
        }
        
            // check for certain states
            // not going directly to hurt
            
        if (this.state===this.STATE_IDLE) {
            this.goStalk(true);
            return;
        }
        if (this.state===this.STATE_ASLEEP) {
            this.goWakeUp(false);
            return;
        }
        
        if ((this.state===this.STATE_WAKING_UP) || (this.state===this.STATE_MELEE) || (this.state===this.STATE_PROJECTILE)) return;
        
            // regular damage
            
        this.goHurt();
    }
    
        //
        // pushing
        //
        
    entityPush(entity,movePnt)
    {
        if (!this.canBePushed) return(false);
        if (this.weight>entity.weight) return(false);
        
        this.pushMovement.setFromPoint(movePnt);
        return(true);
    }
    
        //
        // jumping and sliding around
        //
        
    jump()
    {
        this.gravity=this.core.game.map.gravityMinValue;
        this.movement.y=this.jumpHeight;
        
        this.core.audio.soundStartGameFromList(this.core.game.map.soundList,this.position,this.wakeUpSound);
    }
            
    findSlideDirection(player)
    {
        let distNeg,distPos;
        let moveAdd=this.slideMoveTick/16;      // estimation of physics ticks
        
            // find which direction gets you close to player
            
        this.rotMovement.setFromValues((this.sideMaxSpeed*moveAdd),0,-(this.reverseMaxSpeed*moveAdd));
        this.rotMovement.rotateY(null,this.angle.y);
        this.rotMovement.addPoint(this.position);
        distNeg=this.rotMovement.distance(player.position);
        
        this.rotMovement.setFromValues(-(this.sideMaxSpeed*moveAdd),0,-(this.reverseMaxSpeed*moveAdd));
        this.rotMovement.rotateY(null,this.angle.y);
        this.rotMovement.addPoint(this.position);
        distPos=this.rotMovement.distance(player.position);
        
        return((distNeg>distPos)?-1:1);
    }
    
        //
        // monster AI
        //
        
    runHidden()
    {
        if (this.core.game.checkTrigger(this.showTriggerName)) {
            this.show=true;
            this.goWakeUp(false);
        }
    }
    
    runAsleep(distToPlayer,gravityFactor)
    {
            // sleeping can only fall
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);

            // time to wake up?
            
        if (distToPlayer<this.wakeUpDistance) {
            this.goWakeUp(false);
            return;
        }
    }
        
    runWakeUp(player,gravityFactor)
    {
        let speedFactor;
        
            // hurt can only turn and fall
            
        speedFactor=((this.startHealth-this.health)*this.damageSpeedFactor)/this.startHealth;
        
        if (this.stalkByPath) {
            if (this.nextNodeIdx===this.playerNodeIdx) {
                this.turnYTowardsEntity(player,(this.maxTurnSpeed+Math.trunc(this.maxTurnSpeed*speedFactor)));
            }
            else {
                this.turnYTowardsNode(this.nextNodeIdx,(this.maxTurnSpeed+Math.trunc(this.maxTurnSpeed*speedFactor)));
            }
        }
        else {
            this.turnYTowardsEntity(player,(this.maxTurnSpeed+Math.trunc(this.maxTurnSpeed*speedFactor)));
        }
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);
        
            // is animation over?
            
        if (this.animationFinishTick<=this.core.game.timestamp) this.goStalk(true);
    }
    
    runIdle(distToPlayer,gravityFactor)
    {
        let angleDif;
        
            // time to stalk?
   
        if (distToPlayer<this.wakeUpDistance) {
            this.goWakeUp(false);
            return;
        }

            // if no idle path, can only fall
            
        if ((this.idlePath===null) || (this.nextNodeIdx===-1)) {
            this.rotMovement.setFromValues(0,0,0);
            this.moveInMapY(this.rotMovement,gravityFactor,false);
            return;
        }
        
            // run the idle path
                 
        if (this.hitPathNode(this.nextNodeIdx,this.seekNodeDistanceSlop)) {
            if (this.nextNodeIdx===this.idleGoalNodeIdx) {
                this.idlePathIdx++;
                if (this.idlePathIdx>=this.idlePath.length) this.idlePathIdx=0;
                this.idleGoalNodeIdx=this.findKeyNodeIndex(this.idlePath[this.idlePathIdx]);
            }

            this.nextNodeIdx=this.nextNodeInPath(this.nextNodeIdx,this.idleGoalNodeIdx);
        }
            
            // if we have to turn to hard to make a node, then
            // pause movement

        angleDif=this.turnYTowardsNode(this.nextNodeIdx,this.maxTurnSpeed);
        
        if (angleDif<this.seekNodeAngleSlop) {
            this.movement.moveZWithAcceleration(true,false,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed);        

            this.rotMovement.setFromPoint(this.movement);
            this.rotMovement.rotateY(null,this.angle.y);
            
            this.movement.y=this.moveInMapY(this.rotMovement,gravityFactor,false);
            this.moveInMapXZ(this.rotMovement,this.canBump,this.canSlide);
        }
        else {
            this.rotMovement.setFromValues(0,0,0);
            this.movement.y=this.moveInMapY(this.rotMovement,gravityFactor,false);
        }  
    }
    
    runStalk(player,distToPlayer,gravityFactor)
    {
        let angleDif,pauseMoveForward;
        let speedFactor,maxForwardSpeed,maxReverseSpeed,maxSideSpeed;
        
            // if to far away from player,
            // go into idle
        
        if (this.idleDistance!==-1) {    
            if (distToPlayer>this.idleDistance) {
                this.goIdle();
                return;
            }
        }
        
            // damage speed changes
            
        speedFactor=((this.startHealth-this.health)*this.damageSpeedFactor)/this.startHealth;
        
            // path stalking
            
        pauseMoveForward=false;
            
        if (this.stalkByPath) {
            
                // keep pathing towards node closest to player
                // if these nodes are equal, always keep trying to repick
                
            if ((this.hitPathNode(this.nextNodeIdx,this.seekNodeDistanceSlop)) || (this.nextNodeIdx===this.playerNodeIdx)) {
                this.playerNodeIdx=player.findNearestPathNode(-1);
                this.nextNodeIdx=this.nextNodeInPath(this.nextNodeIdx,this.playerNodeIdx);
            }
            
                // if we are stuck on a node, just turn towards player and
                // don't move, otherwise turn towards next node
                // if we have to turn to hard to make a node, then
                // pause movement
                
            if (this.nextNodeIdx===this.playerNodeIdx) {
                angleDif=this.turnYTowardsEntity(player,(this.maxTurnSpeed+Math.trunc(this.maxTurnSpeed*speedFactor)));
            }
            else {
                angleDif=this.turnYTowardsNode(this.nextNodeIdx,(this.maxTurnSpeed+Math.trunc(this.maxTurnSpeed*speedFactor)));
                if (angleDif>this.seekNodeAngleSlop) pauseMoveForward=true;
            }

                // if we are in seek pause distance, don't keep moving
            
            pauseMoveForward=pauseMoveForward||(distToPlayer<=this.seekPauseDistance);
        }

            // regular stalking
            // turn towards player, remember how far we had to turn
            // to see if we are facing within a certain distance so
            // we can attack
         
        else {
            angleDif=this.turnYTowardsEntity(player,(this.maxTurnSpeed+Math.trunc(this.maxTurnSpeed*speedFactor)));
        }
        
            // time to jump?
            
        if (this.jumpHeight!==0) {
            if (this.core.game.timestamp>this.nextJumpTick) {
                this.nextJumpTick=this.core.game.timestamp+(this.jumpWaitTick+Math.trunc(Math.random()*this.jumpWaitTickRandomAdd));
                this.jump();
            }
        }
        
            // chase player (don't move if in flinch)

        if ((this.core.game.timestamp>this.movementFreezeNextTick) && (!pauseMoveForward)) {
            
            maxForwardSpeed=this.forwardMaxSpeed+(this.forwardMaxSpeed*speedFactor);
            maxReverseSpeed=this.reverseMaxSpeed+(this.reverseMaxSpeed*speedFactor);
            maxSideSpeed=this.sideMaxSpeed+(this.sideMaxSpeed*speedFactor);
            
                // not in a back slide
                
            if (this.slideNextTick===0) {
                this.movement.moveZWithAcceleration(true,false,this.forwardAcceleration,this.forwardDeceleration,maxForwardSpeed,this.forwardAcceleration,this.forwardDeceleration,maxForwardSpeed);        

                this.rotMovement.setFromPoint(this.movement);
                this.rotMovement.rotateY(null,this.angle.y);
                this.rotMovement.addPoint(this.pushMovement);

                this.origPosition.setFromPoint(this.position);

                this.movement.y=this.moveInMapY(this.rotMovement,gravityFactor,false);
                this.moveInMapXZ(this.rotMovement,this.canBump,this.canSlide);

                    // if we hit a wall, try a random slide left or right
                    // while backing up a bit

                if (this.collideWallMeshIdx!==-1) {
                    this.position.setFromPoint(this.origPosition);

                    this.slideDirection=this.findSlideDirection(player);
                    this.slideNextTick=this.core.game.timestamp+this.slideMoveTick;
                    this.sideMovement.setFromValues(0,this.movement.y,0);
                }
            }
            
                // in slide
                // stop slide if it slams into a wall immediately
                
            else {
                this.sideMovement.moveZWithAcceleration(false,true,this.forwardAcceleration,this.forwardDeceleration,maxForwardSpeed,this.reverseAcceleration,this.reverseDeceleration,maxReverseSpeed); 
                this.sideMovement.moveXWithAcceleration((this.slideDirection<0),(this.slideDirection>0),this.sideAcceleration,this.sideDeceleration,maxSideSpeed,this.sideAcceleration,this.sideDeceleration,maxSideSpeed);
                this.rotMovement.setFromPoint(this.sideMovement);
                this.rotMovement.rotateY(null,this.angle.y);
                this.rotMovement.addPoint(this.pushMovement);
                
                this.sideMovement.y=this.moveInMapY(this.rotMovement,gravityFactor,false);
                this.moveInMapXZ(this.rotMovement,this.canBump,this.canSlide);
               
                if ((this.core.game.timestamp>this.slideNextTick) || (this.collideWallMeshIdx!==-1)) {
                    this.slideNextTick=0;
                    this.movement.y=this.sideMovement.y;
                }
            }
        }
        else {
            this.rotMovement.setFromValues(0,0,0);
            this.movement.y=this.moveInMapY(this.rotMovement,gravityFactor,false);
        }
        
            // end any push
            
        this.pushMovement.setFromValues(0,0,0);
        
            // animation changes
            
        if (pauseMoveForward) {
            this.modelEntityAlter.continueAnimationChunkInFrames(this.idleAnimation);
        }
        else {
            this.modelEntityAlter.continueAnimationChunkInFrames(this.walkAnimation);
        }
        
            // projectiles and melee starts
        
        if ((this.projectileJson!=null) && (Math.abs(angleDif)<=this.angleYProjectileRange)) this.goProjectile(player,distToPlayer);
        if (Math.abs(angleDif)<=this.angleYMeleeRange) this.goMelee(distToPlayer);
    }
    
    runHurt(player,gravityFactor)
    {
        let speedFactor;
        
            // hurt can only turn and fall
            
        speedFactor=((this.startHealth-this.health)*this.damageSpeedFactor)/this.startHealth;
        
        if (this.stalkByPath) {
            if (this.nextNodeIdx===this.playerNodeIdx) {
                this.turnYTowardsEntity(player,(this.maxTurnSpeed+Math.trunc(this.maxTurnSpeed*speedFactor)));
            }
            else {
                this.turnYTowardsNode(this.nextNodeIdx,(this.maxTurnSpeed+Math.trunc(this.maxTurnSpeed*speedFactor)));
            }
        }
        else {
            this.turnYTowardsEntity(player,(this.maxTurnSpeed+Math.trunc(this.maxTurnSpeed*speedFactor)));
        }
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);
        
            // is animation over?
            
        if (this.animationFinishTick<=this.core.game.timestamp) this.goStalk(false);
    }
    
    runMelee(player,gravityFactor)
    {
            // can fall and turn towards player while in melee
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);
        
        this.turnYTowardsEntity(player,this.maxTurnSpeed);
        
            // the hit itself
            
        if ((this.meleeHitNextTick<=this.core.game.timestamp) && (this.meleeHitNextTick!==0)) {
            this.core.audio.soundStartGameFromList(this.core.game.map.soundList,this.position,this.meleeSound);
            player.damage(this,this.meleeDamage,this.position);
            
            this.meleeHitNextTick=0;
        }
            // is animation over?
            
        if (this.animationFinishTick<=this.core.game.timestamp) this.goStalk(true);
    }
    
    runProjectile(player,gravityFactor)
    {
        let projEntity;
        
            // can fall and turns towards player while in projectile
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);
        
        this.turnYTowardsEntity(player,this.maxTurnSpeed);
        
            // the projectile itself
            
        if ((this.projectileFireNextTick<=this.core.game.timestamp) && (this.projectileFireNextTick!==0)) {
            this.projectileSetupFire(player);

            projEntity=this.addEntity(this.projectileJson,('projectile_'+this.name),this.firePosition,this.fireAngle,this.projectileData,this,null,true);
            if (projEntity!==null) projEntity.ready();
            
            this.projectileFireNextTick=0;
        }
            // is animation over?
            
        if (this.animationFinishTick<=this.core.game.timestamp) this.goStalk(true);
    }
    
    runDying(gravityFactor)
    {
            // dying can only fall
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);
        
            // the fall sound
               
        if (this.fallSound!==null) {
            if ((this.fallSoundNextTick<=this.core.game.timestamp) && (this.fallSoundNextTick!==0)) {
                this.core.audio.soundStartGameFromList(this.core.game.map.soundList,this.position,this.fallSound);
                this.fallSoundNextTick=0;
            }
        }
        
            // is animation over?
            
        if (this.animationFinishTick<=this.core.game.timestamp) this.goDead();
    }
    
    runDead(gravityFactor)
    {
            // dead can only fall
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);
    }
    
    run()
    {
        let player,distToPlayer,liquid,liquidIdx,gravityFactor;
        
        if (this.core.game.freezeAI) return;
        
            // liquids
            
        liquidIdx=this.core.game.map.liquidList.getLiquidForPoint(this.position);
        
        if (liquidIdx!==-1) {
            liquid=this.core.game.map.liquidList.liquids[liquidIdx];
            if (this.lastInLiquidIdx===-1) liquid.playSoundIn(this.position);
            this.lastInLiquidIdx=liquidIdx;
            gravityFactor=liquid.gravityFactor;
        }
        else {
            if (this.lastInLiquidIdx!==-1) this.core.game.map.liquidList.liquids[this.lastInLiquidIdx].playSoundOut(this.position);
            this.lastInLiquidIdx=-1;
            gravityFactor=1.0;
        }
        
            // distance to player
            
        player=this.core.game.map.entityList.getPlayer();
        distToPlayer=this.position.distance(player.position);
        
            // run the state
            
        switch (this.state) {
            case this.STATE_HIDDEN:
                this.runHidden();
                return;
            case this.STATE_ASLEEP:
                this.runAsleep(distToPlayer,gravityFactor);
                return;
            case this.STATE_WAKING_UP:
                this.runWakeUp(player,gravityFactor);
                return;
            case this.STATE_IDLE:
                this.runIdle(distToPlayer,gravityFactor);
                return;
            case this.STATE_STALKING:
                this.runStalk(player,distToPlayer,gravityFactor);
                return;
            case this.STATE_HURT:
                this.runHurt(player,gravityFactor);
                return;
            case this.STATE_MELEE:
                this.runMelee(player,gravityFactor);
                return;
            case this.STATE_PROJECTILE:
                this.runProjectile(player,gravityFactor);
                return;
            case this.STATE_DYING:
                this.runDying(gravityFactor);
                return;
            case this.STATE_DEAD:
                this.runDead(gravityFactor);
                return;
        }
    }
    
        //
        // drawing
        //
    
    drawSetup()
    {
        if (this.state===this.STATE_HIDDEN) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromPoint(this.angle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;
        
        return(this.modelEntityAlter.boundBoxInFrustum());
    }
}
