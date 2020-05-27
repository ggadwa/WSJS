import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import EntityClass from '../project/entity.js';

//
// monster class
//

export default class EntityFPSMonsterClass extends EntityClass
{
    constructor(core,name,json,position,angle,data,mapSpawn)
    {
        super(core,name,json,position,angle,data,mapSpawn);
        
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
        this.fighter=true;
        
        this.health=0;
        this.startHealth=0;
        this.wakeUpDistance=0;
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
        this.slideMoveTick=0;
        this.angleYProjectileRange=5;
        this.angleYMeleeRange=15;
        this.jumpWaitTick=0;
        this.nextJumpTick=0;
        this.jumpHeight=0;
        this.nextDamageTick=0;
       
        this.sleepAnimation=null;
        this.wakeUpAnimation=null;
        this.idleAnimation=null;
        this.walkAnimation=null;
        this.meleeLeftAnimation=null;
        this.meleeRightAnimation=null;
        this.projectileAnimation=null;
        this.hitAnimation=null;
        this.deathAnimation=null;
        this.meleeLeftHitFrame=0;
        this.meleeRightHitFrame=0;
        this.projectileFireFrame=0;
        this.deathFallSoundFrame=0;
        
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
        
            // pre-allocations

        this.movement=new PointClass(0,0,0);
        this.sideMovement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        this.origPosition=new PointClass(0,0,0);
        
        this.firePosition=new PointClass(0,0,0);
        this.fireAngle=new PointClass(0,0,0);
        this.fireVector=new PointClass(0,0,0);
        this.fireHitPoint=new PointClass(0,0,0);
    }

    initialize()
    {
        super.initialize();            
        
        this.startHealth=this.core.game.lookupValue(this.json.config.startHealth,this.data,0);
        this.wakeUpDistance=this.core.game.lookupValue(this.json.config.wakeUpDistance,this.data,0);
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
        this.slideMoveTick=this.core.game.lookupValue(this.json.config.slideMoveTick,this.data,0);
        this.jumpWaitTick=this.core.game.lookupValue(this.json.config.jumpWaitTick,this.data,0);
        this.jumpHeight=this.core.game.lookupValue(this.json.config.jumpHeight,this.data,0);
        this.angleYProjectileRange=this.core.game.lookupValue(this.json.config.angleYProjectileRange,this.data,0);
        this.angleYMeleeRange=this.core.game.lookupValue(this.json.config.angleYMeleeRange,this.data,0);
        
        this.sleepAnimation=this.core.game.lookupAnimationValue(this.json.animations.sleepAnimation);
        this.wakeUpAnimation=this.core.game.lookupAnimationValue(this.json.animations.wakeUpAnimation);
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.animations.idleAnimation);
        this.walkAnimation=this.core.game.lookupAnimationValue(this.json.animations.walkAnimation);
        this.meleeLeftAnimation=this.core.game.lookupAnimationValue(this.json.animations.meleeLeftAnimation);
        this.meleeRightAnimation=this.core.game.lookupAnimationValue(this.json.animations.meleeRightAnimation);
        this.projectileAnimation=this.core.game.lookupAnimationValue(this.json.animations.projectileAnimation);
        this.hitAnimation=this.core.game.lookupAnimationValue(this.json.animations.hitAnimation);
        this.deathAnimation=this.core.game.lookupAnimationValue(this.json.animations.deathAnimation);
        this.meleeLeftHitFrame=this.core.game.lookupValue(this.json.animations.meleeLeftHitFrame,this.data,0);
        this.meleeRightHitFrame=this.core.game.lookupValue(this.json.animations.meleeRightHitFrame,this.data,0);
        this.projectileFireFrame=this.core.game.lookupValue(this.json.animations.projectileFireFrame,this.data,0);
        this.deathFallSoundFrame=this.core.game.lookupValue(this.json.animations.deathFallSoundFrame,this.data,0);
        
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
        
            // sleeping with all health
            
        this.state=(this.showTriggerName===null)?this.STATE_ASLEEP:this.STATE_HIDDEN;
        
        this.health=this.startHealth;
        
            // misc
            
        this.lastInLiquidIdx=-1;
        this.slideNextTick=0;
        this.movementFreezeNextTick=0;
            
            // start idle animation
        
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.sleepAnimation[0],this.sleepAnimation[1]);
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
        
    goWakeUp()
    {
        this.state=this.STATE_WAKING_UP;
        
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.wakeUpAnimation[0],this.wakeUpAnimation[1]);
        this.animationFinishTick=this.core.timestamp+this.modelEntityAlter.getAnimationTickCount(null,30,this.wakeUpAnimation[0],this.wakeUpAnimation[1]);
        
        this.core.soundList.playJson(this.position,this.wakeUpSound);
        if (this.wakeUpSetTriggerName!==null) this.core.setTrigger(this.wakeUpSetTriggerName);
    }
    
    goIdle()
    {
        this.state=this.STATE_IDLE;
        
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
    }   
    
    goStalk(resetTimers)
    {
        this.state=this.STATE_STALKING;
        
        this.movement.setFromValues(0,0,0);
        
        if (resetTimers) {
            this.nextProjectileTick=this.core.timestamp+this.projectileWaitTick;
            this.nextMeleeTick=this.core.timestamp+this.meleeWaitTick;
            this.nextJumpTick=this.core.timestamp+this.jumpWaitTick;
        }
        
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.walkAnimation[0],this.walkAnimation[1]);
    }
    
    goHurt()
    {
            // if already in hurt, just complete
            
        if (this.state===this.STATE_HURT) return;
        
            // go into hurt state
            
        this.state=this.STATE_HURT;
        
        this.core.soundList.playJson(this.position,this.hurtSound);
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.hitAnimation[0],this.hitAnimation[1]);

        this.animationFinishTick=this.core.timestamp+this.modelEntityAlter.getAnimationTickCount(null,30,this.hitAnimation[0],this.hitAnimation[1]);
    }
    
    goMelee(distToPlayer)
    {
        if ((distToPlayer>this.meleeDistance) || (this.core.timestamp<this.nextMeleeTick)) return;
        
        this.state=this.STATE_MELEE;
        
        if (Math.random()<0.5) {
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.meleeLeftAnimation[0],this.meleeLeftAnimation[1]);
            this.meleeHitNextTick=this.core.timestamp+Math.trunc(((this.meleeLeftHitFrame-this.meleeLeftAnimation[0])/30)*1000);
            this.animationFinishTick=this.core.timestamp+this.modelEntityAlter.getAnimationTickCount(null,30,this.meleeLeftAnimation[0],this.meleeLeftAnimation[1]);
        }
        else {
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.meleeRightAnimation[0],this.meleeRightAnimation[1]);
            this.meleeHitNextTick=this.core.timestamp+Math.trunc(((this.meleeRightHitFrame-this.meleeRightAnimation[0])/30)*1000);
            this.animationFinishTick=this.core.timestamp+this.modelEntityAlter.getAnimationTickCount(null,30,this.meleeRightAnimation[0],this.meleeRightAnimation[1]);
        }
    }
    
    goProjectile(player,distToPlayer)
    {
            // don't fire if past projectile distance, or less than melee distance
            
        if ((distToPlayer>this.projectileDistance) || (distToPlayer<this.meleeDistance) || (this.core.timestamp<this.nextProjectileTick)) return;
        
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
            
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.projectileAnimation[0],this.projectileAnimation[1]);
        this.projectileFireNextTick=this.core.timestamp+Math.trunc(((this.projectileFireFrame-this.projectileAnimation[0])/30)*1000);
        this.animationFinishTick=this.core.timestamp+this.modelEntityAlter.getAnimationTickCount(null,30,this.projectileAnimation[0],this.projectileAnimation[1]);
    }
    
    goDying()
    {
        this.state=this.STATE_DYING;
        
        this.passThrough=true;

        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.deathAnimation[0],this.deathAnimation[1]);
        this.modelEntityAlter.queueAnimationStop();
        this.animationFinishTick=this.core.timestamp+this.modelEntityAlter.getAnimationTickCount(null,30,this.deathAnimation[0],this.deathAnimation[1]);

        this.core.soundList.playJson(this.position,this.deathSound);

        this.fallSoundNextTick=this.core.timestamp+Math.trunc(((this.deathFallSoundFrame-this.deathAnimation[0])/30)*1000);
    }
    
    goDead()
    {
        this.state=this.STATE_DEAD;
        
        this.passThrough=true;
        if (this.deathSetTriggerName!==null) this.core.setTrigger(this.deathSetTriggerName);
    }
    
        //
        // damage
        //
        
    damage(fromEntity,damage,hitPoint)
    {
        if ((this.state===this.STATE_HIDDEN) || (this.state===this.STATE_DYING) || (this.state===this.STATE_DEAD)) return;
        
            // the damage and death
            
        this.health-=damage;
        
        if (this.health<=0) {
            this.goDying();
            
            this.dead=true;
            return;
        }
        
            // check for certain states
            // not going directly to hurt
            
        if (this.state===this.STATE_IDLE) {
            this.goStalk(true);
            return;
        }
        if (this.state===this.STATE_ASLEEP) {
            this.goWakeUp();
            return;
        }
        
        if ((this.state===this.STATE_MELEE) || (this.state===this.STATE_PROJECTILE)) return;
        
            // regular damage
            
        this.goHurt();
    }
    
        //
        // jumping and sliding around
        //
        
    jump()
    {
        this.gravity=this.core.map.gravityMinValue;
        this.movement.y=this.jumpHeight;
        
        this.core.soundList.playJson(this.position,this.wakeUpSound);
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
        if (this.core.checkTrigger(this.showTriggerName)) this.goWakeUp();
    }
    
    runAsleep(distToPlayer,gravityFactor)
    {
            // sleeping can only fall
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);

            // time to wake up?
            
        if (distToPlayer<this.wakeUpDistance) {
            this.goWakeUp();
            return;
        }
    }
        
    runWakeUp(gravityFactor)
    {
            // waking up can only fall
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);
        
            // is animation over?
            
        if (this.animationFinishTick<=this.core.timestamp) this.goStalk(true);
    }
    
    runStalk(player,distToPlayer,gravityFactor)
    {
        let angleDif;
        
            // if to far away from player,
            // go into idle
            
        if (distToPlayer>this.idleDistance) {
            this.goIdle();
            return;
        }
        
            // turn towards player, remember how far we had to turn
            // to see if we are facing within a certain distance so
            // we can attack
         
        angleDif=this.turnYTowardsEntity(player,this.maxTurnSpeed);
        
            // projectiles and melee starts
        
        if ((this.projectileJson!=null) && (Math.abs(angleDif)<=this.angleYProjectileRange)) this.goProjectile(player,distToPlayer);
        if (Math.abs(angleDif)<=this.angleYMeleeRange) this.goMelee(distToPlayer);
        
            // time to jump?
            
        if (this.jumpHeight!==0) {
            if (this.core.timestamp>this.nextJumpTick) {
                this.nextJumpTick=this.core.timestamp+this.jumpWaitTick;
                this.jump();
            }
        }
        
            // chase player (don't move if in flinch)

        if (this.core.timestamp>this.movementFreezeNextTick) {
            
                // not in a back slide
                
            if (this.slideNextTick===0) {
                this.movement.moveZWithAcceleration(true,false,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed);        

                this.rotMovement.setFromPoint(this.movement);
                this.rotMovement.rotateY(null,this.angle.y);

                this.origPosition.setFromPoint(this.position);

                this.movement.y=this.moveInMapY(this.rotMovement,gravityFactor,false);
                this.moveInMapXZ(this.rotMovement,true,true);

                    // if we hit a wall, try a random slide left or right
                    // while backing up a bit

                if (this.collideWallMeshIdx!==-1) {    
                    this.position.setFromPoint(this.origPosition);

                    this.slideDirection=this.findSlideDirection(player);
                    this.slideNextTick=this.core.timestamp+this.slideMoveTick;
                    this.sideMovement.setFromValues(0,this.movement.y,0);
                }
            }
            
                // in slide
                
            else {
                this.sideMovement.moveZWithAcceleration(false,true,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed,this.reverseAcceleration,this.reverseDeceleration,this.reverseMaxSpeed); 
                this.sideMovement.moveXWithAcceleration((this.slideDirection<0),(this.slideDirection>0),this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed);
                this.rotMovement.setFromPoint(this.sideMovement);
                this.rotMovement.rotateY(null,this.angle.y);
                
                this.sideMovement.y=this.moveInMapY(this.rotMovement,gravityFactor,false);
                this.moveInMapXZ(this.rotMovement,true,true);
               
                if (this.core.timestamp>this.slideNextTick) {
                    this.slideNextTick=0;
                    this.movement.y=this.sideMovement.y;
                }
            }
        }
        
    }
    
    runHurt(gravityFactor)
    {
            // hurt can only fall
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);
        
            // is animation over?
            
        if (this.animationFinishTick<=this.core.timestamp) this.goStalk(false);
    }
    
    runMelee(player,gravityFactor)
    {
            // can fall and turn towards player while in melee
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);
        
        this.turnYTowardsEntity(player,this.maxTurnSpeed);
        
            // the hit itself
            
        if ((this.meleeHitNextTick<=this.core.timestamp) && (this.meleeHitNextTick!==0)) {
            this.core.soundList.playJson(this.position,this.meleeSound);
            player.damage(this,this.meleeDamage,this.position);
            
            this.meleeHitNextTick=0;
        }
            // is animation over?
            
        if (this.animationFinishTick<=this.core.timestamp) this.goStalk(true);
    }
    
    runProjectile(player,gravityFactor)
    {
        let projEntity;
        
            // can fall and turns towards player while in projectile
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);
        
        this.turnYTowardsEntity(player,this.maxTurnSpeed);
        
            // the projectile itself
            
        if ((this.projectileFireNextTick<=this.core.timestamp) && (this.projectileFireNextTick!==0)) {
            this.projectileSetupFire(player);

            projEntity=this.addEntity(this,this.projectileJson,('projectile_'+this.name),this.firePosition,this.fireAngle,this.projectileData,true,false);
            if (projEntity!==null) projEntity.ready();
            
            this.projectileFireNextTick=0;
        }
            // is animation over?
            
        if (this.animationFinishTick<=this.core.timestamp) this.goStalk(true);
    }
    
    runDying(gravityFactor)
    {
            // dying can only fall
            
        this.rotMovement.setFromValues(0,0,0);
        this.moveInMapY(this.rotMovement,gravityFactor,false);
        
            // the fall sound
               
        if (this.fallSound!==null) {
            if ((this.fallSoundNextTick<=this.core.timestamp) && (this.fallSoundNextTick!==0)) {
                this.core.soundList.playJson(this.position,this.fallSound);
                this.fallSoundNextTick=0;
            }
        }
        
            // is animation over?
            
        if (this.animationFinishTick<=this.core.timestamp) this.goDead();
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
        
            // liquids
            
        liquidIdx=this.core.map.liquidList.getLiquidForPoint(this.position);
        
        if (liquidIdx!==-1) {
            liquid=this.core.map.liquidList.liquids[liquidIdx];
            if (this.lastInLiquidIdx===-1) liquid.playSoundIn(this.position);
            this.lastInLiquidIdx=liquidIdx;
            gravityFactor=liquid.gravityFactor;
        }
        else {
            if (this.lastInLiquidIdx!==-1) this.core.map.liquidList.liquids[this.lastInLiquidIdx].playSoundOut(this.position);
            this.lastInLiquidIdx=-1;
            gravityFactor=1.0;
        }
        
            // distance to player
            
        player=this.getPlayerEntity();
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
                this.runWakeUp(gravityFactor);
                return;
            case this.STATE_IDLE:
                return;
            case this.STATE_STALKING:
                this.runStalk(player,distToPlayer,gravityFactor);
                return;
            case this.STATE_HURT:
                this.runHurt(gravityFactor);
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
        
        return(true);
    }
}
