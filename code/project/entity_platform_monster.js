import PointClass from '../utility/point.js';
import EntityClass from '../project/entity.js';

export default class EntityPlatformMonsterClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.walkSpeed=0;
        this.chaseSpeed=0;
        this.turnSpeed=0;
        this.initialWalkDirection=0;
        this.jumpHeight=0;
        this.jumpWaitTick=0;
        
        this.stompable=false;
        this.stompBounceHeight=0;
        
        this.melee=false;
        this.meleeDistance=0;
        this.meleeDamage=0;
        this.meleeHitFrame=0;
        this.shoveSpeed=0;
        this.shoveFadeFactor=0;
        
        this.patrolDistance=0;
        
        this.disappearShrinkFactor=0;
        this.disappearEffectFrame=0;
        this.disappearEffect=null;
        
        this.idleAnimation=null;
        this.walkAnimation=null;
        this.hitAnimation=null;
        this.dieAnimation=null;
        
        this.hurtSound=null;
        this.stompSound=null;
        this.meleeSound=null;
        this.dieSound=null;
        
            // variables
            
        this.startX=0;
        
        this.walkDirection=1;
        this.nextJumpTick=0;
        
        this.meleeNextTick=0;
        
        this.dead=false;
        this.shrinkFactor=0;
        this.effectLaunchTick=0;
        this.animationFinishTick=0;

            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,90,0);
        
        Object.seal(this);
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.walkSpeed=this.core.game.lookupValue(this.json.config.walkSpeed,this.data,150);
        this.chaseSpeed=this.core.game.lookupValue(this.json.config.chaseSpeed,this.data,200);
        this.initialWalkDirection=this.core.game.lookupValue(this.json.config.initialWalkDirection,this.data,1);
        this.turnSpeed=this.core.game.lookupValue(this.json.config.turnSpeed,this.data,20);
        this.jumpHeight=this.core.game.lookupValue(this.json.config.jumpHeight,this.data,0);
        this.jumpWaitTick=this.core.game.lookupValue(this.json.config.jumpWaitTick,this.data,0);
        
        this.stompable=this.core.game.lookupValue(this.json.config.stompable,this.data,false);
        this.stompBounceHeight=this.core.game.lookupValue(this.json.config.stompBounceHeight,this.data,0);
        
        this.melee=this.core.game.lookupValue(this.json.config.melee,this.data,false);
        this.meleeDistance=this.core.game.lookupValue(this.json.config.meleeDistance,this.data,0);
        this.meleeDamage=this.core.game.lookupValue(this.json.config.meleeDamage,this.data,0);
        this.meleeHitFrame=this.core.game.lookupValue(this.json.config.meleeHitFrame,this.data,0);
        
        this.shoveSpeed=this.core.game.lookupValue(this.json.config.shoveSpeed,this.data,0);
        this.shoveFadeFactor=this.core.game.lookupValue(this.json.config.shoveFadeFactor,this.data,0.9);
        
        this.patrolDistance=this.core.game.lookupValue(this.json.config.patrolDistance,this.data,200);
        
        this.disappearShrinkFactor=this.core.game.lookupValue(this.json.config.disappearShrinkFactor,this.data,0);
        this.disappearEffectFrame=this.core.game.lookupValue(this.json.config.disappearEffectFrame,this.data,0);
        this.disappearEffect=this.core.game.lookupValue(this.json.config.disappearEffect,this.data,null);
        
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.animations.idleAnimation);
        this.walkAnimation=this.core.game.lookupAnimationValue(this.json.animations.walkAnimation);
        this.hitAnimation=this.core.game.lookupAnimationValue(this.json.animations.hitAnimation);
        this.dieAnimation=this.core.game.lookupAnimationValue(this.json.animations.dieAnimation);
        
        this.hurtSound=this.core.game.lookupSoundValue(this.json.sounds.hurtSound);
        this.stompSound=this.core.game.lookupSoundValue(this.json.sounds.stompSound);
        this.meleeSound=this.core.game.lookupSoundValue(this.json.sounds.meleeSound);
        this.dieSound=this.core.game.lookupSoundValue(this.json.sounds.dieSound);
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        this.startX=this.position.x;
        this.walkDirection=this.initialWalkDirection;
        this.nextJumpTick=0;
        
        this.meleeNextTick=0;

        this.dead=false;
        this.passThrough=false;
        this.shrinkFactor=0;
        this.effectLaunchTick=0;
        this.animationFinishTick=0;
        
        this.movement.setFromValues(0,0,0);
        this.angle.setFromValues(0,90,0);           // monsters don't have the camera so they can use the regular angle
        
        this.modelEntityAlter.startAnimationChunkInFrames(this.walkAnimation);
    }
    
    die()
    {
        this.dead=true;
        this.passThrough=true;
        
        this.modelEntityAlter.startAnimationChunkInFrames(this.dieAnimation);
        this.modelEntityAlter.queueAnimationStop();
        
        this.effectLaunchTick=this.modelEntityAlter.getAnimationFinishTimestampFromFrame(this.disappearEffectFrame,this.dieAnimation);
        this.animationFinishTick=this.core.game.timestamp+this.modelEntityAlter.getAnimationTickCount(this.dieAnimation);
        
        this.core.audio.soundStartGame(this.core.game.map.soundList,this.position,this.dieSound);
    }
    
    isMeleeOK(player)
    {
        let dist,halfHigh;
        
            // don't attack dead players
            
        if (player.health<=0) return(false);
        
            // melees only count if within distance
            // and within half the height of each other

        dist=player.position.x-this.position.x;
        if (Math.abs(dist)>this.meleeDistance) return(false);
                
        halfHigh=Math.abs(this.height*0.5);
        return((player.position.y<(this.position.y+halfHigh)) && (player.position.y>(this.position.y-halfHigh)));
    }
        
    run()
    {
        let player=this.core.game.map.entityList.getPlayer();
        
        super.run();
        
            // if dead
            
        if (this.dead) {
            if (this.animationFinishTick===0) return;
            
            if ((this.core.game.timestamp>this.effectLaunchTick) && (this.effectLaunchTick!==0)) {
                this.effectLaunchTick=0;
                if (this.disappearEffect!==null) this.addEffect(this,this.disappearEffect,this.position,null,true);
            }
            
            if (this.core.game.timestamp>this.animationFinishTick) {
                this.animationFinishTick=0;
                this.show=false;
            }
            
            if (this.disappearShrinkFactor!==0) this.scale.scale(this.disappearShrinkFactor);
            
            return;
        }
        
            // any waiting melee
                    
        if (this.meleeNextTick!==0) {
            if (this.core.game.timestamp>=this.meleeNextTick) {
                this.meleeNextTick=0;
                if (this.isMeleeOK(player)) player.meleeHit(this.meleeDamage,(Math.sign(player.position.x-this.position.x)*this.shoveSpeed),this.shoveFadeFactor);
                this.core.audio.soundStartGame(this.core.game.map.soundList,this.position,this.meleeSound);
            }
        }
        
            // movement
            
        this.movement.x=0;
        
        if (this.walkDirection>0) {
            if (this.angle.turnYTowards(90,this.turnSpeed)===0) this.movement.x=this.walkSpeed;
        }
        else {
            if (this.angle.turnYTowards(270,this.turnSpeed)===0) this.movement.x=-this.walkSpeed;
        }
        
            // frozen in a finishing animation
            
        if (this.animationFinishTick!==0) {
            if (this.core.game.timestamp>this.animationFinishTick) this.animationFinishTick=0;
            this.movement.y=this.moveInMapY(this.movement,1.0,false);
            return;
        }
        
            // jumping
            
        if (this.jumpHeight!==0) {
            if ((this.standOnMeshIdx!==-1) || (this.standOnEntity!==null)) {
                if (this.core.game.timestamp>this.nextJumpTick) {
                    this.nextJumpTick=this.core.game.timestamp+this.jumpWaitTick;

                    this.movement.y=this.jumpHeight;
                }
            }
            else {
                this.nextJumpTick=this.core.game.timestamp+this.jumpWaitTick;
            }
        }
        
            // run the movement
            
        this.movement.y=this.moveInMapY(this.movement,1.0,false);
        this.moveInMapXZ(this.movement,false,false);
        
            // melee
            // don't run if already waiting on a melee
            
        if ((this.melee) && (this.meleeNextTick===0)) {
            if (this.isMeleeOK(player)) {
                this.walkDirection=Math.sign(player.position.x-this.position.x);     // always turn towards player

                this.modelEntityAlter.startAnimationChunkInFrames(this.hitAnimation);
                this.modelEntityAlter.queueAnimationChunkInFrames(this.walkAnimation);

                this.meleeNextTick=this.modelEntityAlter.getAnimationFinishTimestampFromFrame(this.meleeHitFrame,this.hitAnimation);
                this.animationFinishTick=this.core.game.timestamp+this.modelEntityAlter.getAnimationTickCount(this.hitAnimation);
            }
        }
        
            // hitting something turns patrols around
            
        if (this.collideWallMeshIdx!==-1) {
            this.walkDirection=-this.walkDirection;
        }
        else {
        
                // time to turn around

            if (this.walkDirection>0) {
                if ((this.position.x-this.startX)>this.patrolDistance) {
                    this.position.x=this.startX+this.patrolDistance;
                    this.walkDirection=-1;
                }
            }
            else {
                if ((this.startX-this.position.x)>this.patrolDistance) {
                    this.position.x=this.startX-this.patrolDistance;
                    this.walkDirection=1;
                }
            }
        }
    }

    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromPoint(this.angle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

