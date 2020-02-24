import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import ProjectEntityClass from '../project/project_entity.js';

//
// monster class
//

export default class EntityFPSMonsterClass extends ProjectEntityClass
{
    constructor(core,name,json,position,angle,data)
    {
        super(core,name,json,position,angle,data);
        
        this.fighter=true;
        
        this.health=0;
        this.startHealth=0;
        this.awoke=false;
        this.dead=false;
        this.wakeUpDistance=0;
        this.fallAsleepDistance=0;
        this.meleeDistance=0;
        this.meleeWaitTick=0;
        this.meleeDamageTick=0;
        this.nextMeleeTick=0;
        this.meleeDamage=0;
        this.meleeStartTick=-1;
        this.projectileDistance=0;
        this.projectileWaitTick=0;
        this.projectileFireTick=0;
        this.nextProjectileTick=0;
        this.projectileStartTick=-1;
        this.projectileClass=null;
        this.projectileData=null;
        this.projectileRequiresSight=true;
        this.maxTurnSpeed=0;
        this.forwardAcceleration=0;
        this.forwardMaxSpeed=0;
        this.angleYProjectileRange=5;
        this.angleYMeleeRange=15;
        this.damageFlinchWaitTick=500;
        this.jumpWaitTick=0;
        this.nextJumpTick=0;
        this.jumpHeight=0;
        this.trapMeshName=null;
        this.trapMeshShrink=null;
        this.nextDamageTick=0;
       
        this.idleAnimation=null;
        this.walkAnimation=null;
        this.melee1Animation=null;
        this.melee2Animation=null;
        this.projectileAnimation=null;
        this.hitAnimation=null;
        this.deathAnimation=null;
        this.wakeUpSound=null;
        this.hurtSound=null;
        this.meleeSound=null;
        this.deathSound=null;
        this.liquidInSound=null;
        this.liquidOutSound=null;
        this.fallSound=null;
        this.fallSoundWaitCount=0;
        
        this.lastInLiquid=false;
        
            // pre-allocations

        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        this.firePosition=new PointClass(0,0,0);
        this.fireAngle=new PointClass(0,0,0);
        this.fireVector=new PointClass(0,0,0);
        this.fireHitPoint=new PointClass(0,0,0);
        
        this.trapMeshXBound=new BoundClass(0,0);
        this.trapMeshZBound=new BoundClass(0,0);
    }

    initialize()
    {
        super.initialize();            
        
        this.startHealth=this.core.game.lookupValue(this.json.config.startHealth,this.data);
        this.wakeUpDistance=this.core.game.lookupValue(this.json.config.wakeUpDistance,this.data);
        this.fallAsleepDistance=this.core.game.lookupValue(this.json.config.fallAsleepDistance,this.data);
        this.meleeDistance=this.core.game.lookupValue(this.json.config.meleeDistance,this.data);
        this.meleeWaitTick=this.core.game.lookupValue(this.json.config.meleeWaitTick,this.data);
        this.meleeDamageTick=this.core.game.lookupValue(this.json.config.meleeDamageTick,this.data);
        this.meleeDamage=this.core.game.lookupValue(this.json.config.meleeDamage,this.data);
        this.maxTurnSpeed=this.core.game.lookupValue(this.json.config.maxTurnSpeed,this.data);
        this.forwardAcceleration=this.core.game.lookupValue(this.json.config.forwardAcceleration,this.data);
        this.forwardMaxSpeed=this.core.game.lookupValue(this.json.config.forwardMaxSpeed,this.data);
        this.jumpWaitTick=this.core.game.lookupValue(this.json.config.jumpWaitTick,this.data);
        this.jumpHeight=this.core.game.lookupValue(this.json.config.jumpHeight,this.data);
        this.angleYProjectileRange=this.core.game.lookupValue(this.json.config.angleYProjectileRange,this.data);
        this.angleYMeleeRange=this.core.game.lookupValue(this.json.config.angleYMeleeRange,this.data);
        this.damageFlinchWaitTick=this.core.game.lookupValue(this.json.config.damageFlinchWaitTick,this.data);
    
        this.idleAnimation=this.json.config.idleAnimation;
        this.walkAnimation=this.json.config.walkAnimation;
        this.melee1Animation=this.json.config.melee1Animation;
        this.melee2Animation=this.json.config.melee2Animation;
        this.projectileAnimation=this.json.config.projectileAnimation;
        this.hitAnimation=this.json.config.hitAnimation;
        this.deathAnimation=this.json.config.deathAnimation;
        this.wakeUpSound=this.json.config.wakeUpSound;
        this.hurtSound=this.json.config.hurtSound;
        this.meleeSound=this.json.config.meleeSound;
        this.deathSound=this.json.config.deathSound;
        this.liquidInSound=this.json.config.liquidInSound;
        this.liquidOutSound=this.json.config.liquidOutSound;
        this.fallSound=this.json.config.fallSound;
        this.fallSoundWaitCount=this.core.game.lookupValue(this.json.config.fallSoundWaitCount,this.data);
            
            // non-gc stuff
        
        
        return(true);
    }
    
    ready()
    {
        let meshList,mesh;
        
        super.ready();
        
            // sleeping with all health
            
        this.health=this.startHealth;
        this.awoke=false;
        this.dead=false;
        
            // if there is a trap mesh, get it's bounds
            
        if (this.trapMeshName!==null) {
            meshList=this.getMeshList();
            mesh=meshList.meshes[meshList.find(this.trapMeshName)];
            this.trapMeshXBound.setFromBound(mesh.xBound);
            this.trapMeshZBound.setFromBound(mesh.zBound);
            
            if (this.trapMeshShrink!==null) {
                this.trapMeshXBound.min+=this.trapMeshShrink.x;
                this.trapMeshXBound.max-=this.trapMeshShrink.x;
                this.trapMeshZBound.min+=this.trapMeshShrink.z;
                this.trapMeshZBound.max-=this.trapMeshShrink.z;
            }
        }
        
            // misc
            
        this.lastInLiquid=false;
            
            // start idle animation
        
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
    }
    
    wakeUp()
    {
        let timestamp=this.getTimestamp();
        
        this.awoke=true;
        this.movement.setFromValues(0,0,0);
        
        this.nextProjectileTick=timestamp;
        this.projectileStartTick=-1;
        
        this.nextMeleeTick=timestamp;
        this.meleeStartTick=-1;
        
        this.nextJumpTick=timestamp+this.jumpWaitTick;
        
        this.nextDamageTick=timestamp;
        
        this.core.soundList.playJson(this,null,this.wakeUpSound);
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.walkAnimation[0],this.walkAnimation[1]);
    }
    
    sleep()
    {
        this.awoke=false;
        this.projectileStartTick=-1;
        this.meleeStartTick=-1;
        
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
    }
    
    damage(fromEntity,damage,hitPoint)
    {
        let timestamp;
        
        if (this.dead) return;
        
        this.health-=damage;
        if (!this.awoke) this.wakeUp();
        
            // just damage
            
        if (this.health>0) {
            timestamp=this.getTimestamp();
            if (timestamp>this.nextDamageTick) {
                this.nextDamageTick=timestamp+this.damageFlinchWaitTick;

                this.core.soundList.playJson(this,null,this.hurtSound);
                this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.hitAnimation[0],this.hitAnimation[1]);
                this.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.walkAnimation[0],this.walkAnimation[1]);
            }
            return;
        }
        
            // monster is dead
            
        this.dead=true;
        this.passThrough=true;
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.deathAnimation[0],this.deathAnimation[1]);
        this.queueAnimationStop();
        
        this.core.soundList.playJson(this,null,this.deathSound);
    }
    
    jump()
    {
        this.gravity=this.gravityMinValue;
        this.movement.y=this.jumpHeight;
        
        this.core.soundList.playJson(this,null,this.wakeUpSound);
    }
    
    meleeStart(distToPlayer,timestamp)
    {
        if ((distToPlayer>this.meleeDistance) || (timestamp<this.nextMeleeTick)) return;
        
        this.nextMeleeTick=this.getTimestamp()+this.meleeWaitTick;
        
            // melee animation
            
        if (Math.random()<0.5) {
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.melee1Animation[0],this.melee1Animation[1]);
        }
        else {
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.melee2Animation[0],this.melee2Animation[1]);
        }
        this.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.walkAnimation[0],this.walkAnimation[1]);
        
            // pause to start actual melee
            
        this.meleeStartTick=this.getTimestamp()+this.meleeDamageTick;
    }
    
    meleeHit(player)
    {
        this.core.soundList.playJson(this,null,this.meleeSound);
        player.damage(this,this.meleeDamage,null);
    }
    
    projectileSetupFire(player)
    {
            // get fire position outside of radius
            // and in middle of monster height
            
        this.firePosition.setFromValues(0,0,(this.radius*2));
        this.firePosition.rotateY(null,this.angle.y);
        this.firePosition.addPoint(this.position);
        this.firePosition.y+=Math.trunc(this.height*0.5);
        
        this.fireAngle.setFromPoint(this.angle);
        this.fireAngle.x=this.position.getLookAngleTo(player.position);
    }
    
    projectileStart(player,distToPlayer,timestamp)
    {
        if ((distToPlayer<this.projectileDistance) || (timestamp<this.nextProjectileTick)) return;
        
            // does it sight the player?
            
        if (this.projectileRequiresSight) {
            this.projectileSetupFire(player);

            this.fireVector.setFromValues(0,0,this.projectileDistance);
            this.fireVector.rotateX(null,this.fireAngle.x);
            this.fireVector.rotateY(null,this.fireAngle.y);

            if (!this.rayCollision(this.firePosition,this.fireVector,this.fireHitPoint,null,null)) return;
            if (this.hitEntity!==player) return;
        }
        
            // we can fire
            
        this.nextProjectileTick=this.getTimestamp()+this.projectileWaitTick;

            // fire animaton
            
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.projectileAnimation[0],this.projectileAnimation[1]);
        this.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.walkAnimation[0],this.walkAnimation[1]);
        
            // pause for fire animation
            
        this.projectileStartTick=this.getTimestamp()+this.projectileFireTick;
    }
    
    projectileFire(player)
    {
        this.projectileSetupFire(player);
        this.addEntityFromEntity(this,this.projectileClass,'monster_projectile',this.firePosition,this.fireAngle,this.projectileData,true,false);
    }
    
    run()
    {
        let timestamp,angleDif;
        let player,distToPlayer,liquidIdx;
        
            // if dead, only fall and play
            // and fall sound
            
        if (this.dead) {
            
            if (this.fallSound!==null) {
                if (this.fallSoundWaitCount>0) {
                    this.fallSoundWaitCount--;
                    if (this.fallSoundWaitCount===0) this.core.soundList.playJson(this,null,this.fallSound);
                }
            }
            
            this.rotMovement.setFromValues(0,0,0);
            this.moveInMapY(this.rotMovement,false);
            return;
        }
        
            // get player and timestamp
            
        timestamp=this.getTimestamp();
        
        player=this.getPlayerEntity();
        distToPlayer=this.position.distance(player.position);
        
            // if we are in a projectile animation,
            // wait to fire
            
        if (this.projectileStartTick!==-1) {
            if (timestamp>this.projectileStartTick) {
                this.projectileStartTick=-1;
                this.projectileFire(player);
            }
        }
        
            // if we are in a melee animation,
            // wait for damage
            
        if (this.meleeStartTick!==-1) {
            if (timestamp>this.meleeStartTick) {
                this.meleeStartTick=-1;
                if (distToPlayer<this.meleeDistance) this.meleeHit(player);
            }
        }
        
            // always turn towards player, even when idling
            // remember how far we had to turn to see if we are
            // facing within a certain distance so we can attack
         
        angleDif=this.turnYTowardsEntity(player,this.maxTurnSpeed);
        
            // time to wake up?
            
        if (!this.awoke) {
            if (distToPlayer<this.wakeUpDistance) {
                this.wakeUp();
            }
            return;
        }
        
            // if we get to far away, go back to sleep
            
        if (distToPlayer>this.fallAsleepDistance) {
            this.sleep();
            return;
        }
        
            // liquids
            
        liquidIdx=this.getInLiquidIndex();
        
        if (liquidIdx!==-1) {
            if (!this.lastInLiquid) this.core.soundList.playJson(this,null,this.liquidInSound);
            this.lastInLiquid=true;
        }
        else {
            if (this.lastInLiquid) this.core.soundList.playJson(this,null,this.liquidOutSound);
            this.lastInLiquid=false;
        }
        
            // projectiles and melee starts
        
        if ((this.projectileClass!=null) && (Math.abs(angleDif)<=this.angleYProjectileRange)) this.projectileStart(player,distToPlayer,timestamp);
        if (Math.abs(angleDif)<=this.angleYMeleeRange) this.meleeStart(distToPlayer,timestamp);
        
            // time to jump?
            
        if (this.jumpHeight!==0) {
            if (timestamp>this.nextJumpTick) {
                this.nextJumpTick=timestamp+this.jumpWaitTick;
                this.jump();
            }
        }
        
            // chase player

        this.movement.moveZWithAcceleration(true,false,this.forwardAcceleration,0,this.forwardMaxSpeed,this.forwardAcceleration,0,this.forwardMaxSpeed);        
        this.rotMovement.setFromPoint(this.movement);
        this.rotMovement.rotateY(null,this.angle.y);
        
        this.movement.y=this.moveInMapY(this.rotMovement,false);
        this.moveInMapXZ(this.rotMovement,true,true);
        
            // any bounding?
            
        if (this.trapMeshName!==null) {
            if (this.position.x<this.trapMeshXBound.min) this.position.x=this.trapMeshXBound.min;
            if (this.position.x>this.trapMeshXBound.max) this.position.x=this.trapMeshXBound.max;
            if (this.position.z<this.trapMeshZBound.min) this.position.z=this.trapMeshZBound.min;
            if (this.position.z>this.trapMeshZBound.max) this.position.z=this.trapMeshZBound.max;
        }
    }
}
