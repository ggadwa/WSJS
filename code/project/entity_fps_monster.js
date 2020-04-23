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
        this.fallSoundWaitTick=0;
        
        this.fallSoundNextTick=0;
        
        this.lastInLiquid=false;
        
        this.slideDirection=0;
        this.slideNextTick=0;
        
            // pre-allocations

        this.movement=new PointClass(0,0,0);
        this.sideMovement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        this.origPosition=new PointClass(0,0,0);
        
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
        
        this.startHealth=this.core.game.lookupValue(this.json.config.startHealth,this.data,0);
        this.wakeUpDistance=this.core.game.lookupValue(this.json.config.wakeUpDistance,this.data,0);
        this.fallAsleepDistance=this.core.game.lookupValue(this.json.config.fallAsleepDistance,this.data,0);
        
        this.meleeDistance=this.core.game.lookupValue(this.json.config.meleeDistance,this.data,0);
        this.meleeWaitTick=this.core.game.lookupValue(this.json.config.meleeWaitTick,this.data,0);
        this.meleeDamageTick=this.core.game.lookupValue(this.json.config.meleeDamageTick,this.data,0);
        this.meleeDamage=this.core.game.lookupValue(this.json.config.meleeDamage,this.data,0);
        
        this.projectileDistance=this.core.game.lookupValue(this.json.config.projectileDistance,this.data,0);
        this.projectileWaitTick=this.core.game.lookupValue(this.json.config.projectileWaitTick,this.data,0);
        this.projectileFireTick=this.core.game.lookupValue(this.json.config.projectileFireTick,this.data,0);
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
        this.damageFlinchWaitTick=this.core.game.lookupValue(this.json.config.damageFlinchWaitTick,this.data,0);
        this.fallSoundWaitTick=this.core.game.lookupValue(this.json.config.fallSoundWaitTick,this.data,0);
        
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.config.idleAnimation);
        this.walkAnimation=this.core.game.lookupAnimationValue(this.json.config.walkAnimation);
        this.melee1Animation=this.core.game.lookupAnimationValue(this.json.config.melee1Animation);
        this.melee2Animation=this.core.game.lookupAnimationValue(this.json.config.melee2Animation);
        this.projectileAnimation=this.core.game.lookupAnimationValue(this.json.config.projectileAnimation);
        this.hitAnimation=this.core.game.lookupAnimationValue(this.json.config.hitAnimation);
        this.deathAnimation=this.core.game.lookupAnimationValue(this.json.config.deathAnimation);
        
        this.wakeUpSound=this.core.game.lookupSoundValue(this.json.config.wakeUpSound);
        this.hurtSound=this.core.game.lookupSoundValue(this.json.config.hurtSound);
        this.meleeSound=this.core.game.lookupSoundValue(this.json.config.meleeSound);
        this.deathSound=this.core.game.lookupSoundValue(this.json.config.deathSound);
        this.liquidInSound=this.core.game.lookupSoundValue(this.json.config.liquidInSound);
        this.liquidOutSound=this.core.game.lookupSoundValue(this.json.config.liquidOutSound);
        this.fallSound=this.core.game.lookupSoundValue(this.json.config.fallSound);
        
        this.trapMeshName=this.json.config.trapMeshName;
        this.trapMeshShrink=this.json.config.trapMeshShrink;

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
        this.slideNextTick=0;
            
            // start idle animation
        
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
    }
    
    wakeUp()
    {
        this.awoke=true;
        this.movement.setFromValues(0,0,0);
        
        this.nextProjectileTick=this.core.timestamp;
        this.projectileStartTick=-1;
        
        this.nextMeleeTick=this.core.timestamp;
        this.meleeStartTick=-1;
        
        this.nextJumpTick=this.core.timestamp+this.jumpWaitTick;
        
        this.nextDamageTick=this.core.timestamp;
        
        this.core.soundList.playJson(this.position,this.wakeUpSound);
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
        if (this.dead) return;
        
        this.health-=damage;
        if (!this.awoke) this.wakeUp();
        
            // just damage
            
        if (this.health>0) {
            if (this.core.timestamp>this.nextDamageTick) {
                this.nextDamageTick=this.core.timestamp+this.damageFlinchWaitTick;

                this.core.soundList.playJson(this.position,this.hurtSound);
                this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.hitAnimation[0],this.hitAnimation[1]);
                this.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.walkAnimation[0],this.walkAnimation[1]);
            }
            return;
        }
        
            // monster is dead
            
        this.dead=true;
        this.passThrough=true;
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.deathAnimation[0],this.deathAnimation[1]);
        this.modelEntityAlter.queueAnimationStop();
        
        this.core.soundList.playJson(this.position,this.deathSound);
        
        this.fallSoundNextTick=this.core.timestamp+this.fallSoundWaitTick;
    }
    
    jump()
    {
        this.gravity=this.core.map.gravityMinValue;
        this.movement.y=this.jumpHeight;
        
        this.core.soundList.playJson(this.position,this.wakeUpSound);
    }
    
    meleeStart(distToPlayer)
    {
        if ((distToPlayer>this.meleeDistance) || (this.core.timestamp<this.nextMeleeTick)) return;
        
        this.nextMeleeTick=this.core.timestamp+this.meleeWaitTick;
        
            // melee animation
            
        if (Math.random()<0.5) {
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.melee1Animation[0],this.melee1Animation[1]);
        }
        else {
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.melee2Animation[0],this.melee2Animation[1]);
        }
        this.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.walkAnimation[0],this.walkAnimation[1]);
        
            // pause to start actual melee
            
        this.meleeStartTick=this.core.timestamp+this.meleeDamageTick;
    }
    
    meleeHit(player)
    {
        this.core.soundList.playJson(this.position,this.meleeSound);
        player.damage(this,this.meleeDamage,this.position);
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
    
    projectileStart(player,distToPlayer)
    {
        if ((distToPlayer>this.projectileDistance) || (this.core.timestamp<this.nextProjectileTick)) return;
        
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
            
        this.nextProjectileTick=this.core.timestamp+this.projectileWaitTick;

            // fire animaton
            
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.projectileAnimation[0],this.projectileAnimation[1]);
        this.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.walkAnimation[0],this.walkAnimation[1]);
        
            // pause for fire animation
            
        this.projectileStartTick=this.core.timestamp+this.projectileFireTick;
    }
    
    projectileFire(player)
    {
        let projEntity;
        
        this.projectileSetupFire(player);
        
        projEntity=this.addEntity(this,this.projectileJson,('projectile_'+this.name),this.firePosition,this.fireAngle,this.projectileData,true,false);
        if (projEntity!==null) projEntity.ready();
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
    
    run()
    {
        let angleDif;
        let player,distToPlayer,liquidIdx,gravityFactor;
        
            // liquids
            
        liquidIdx=this.getInLiquidIndex();
        
        if (liquidIdx!==-1) {
            if (!this.lastInLiquid) this.core.soundList.playJson(this.position,this.liquidInSound);
            this.lastInLiquid=true;
            gravityFactor=this.core.map.liquidList.liquids[liquidIdx].gravityFactor;
        }
        else {
            if (this.lastInLiquid) this.core.soundList.playJson(this.position,this.liquidOutSound);
            this.lastInLiquid=false;
            gravityFactor=1.0;
        }
        
            // if dead, only fall and play
            // and fall sound
            
        if (this.dead) {
            
            if ((this.fallSound!==null) && (this.fallSoundNextTick!==0)) {
                if (this.core.timestamp>this.fallSoundNextTick) {
                    this.core.soundList.playJson(this.position,this.fallSound);
                    this.fallSoundNextTick=0;
                }
            }
            
            this.rotMovement.setFromValues(0,0,0);
            this.moveInMapY(this.rotMovement,gravityFactor,false);
            return;
        }
        
            // distance to player
            
        player=this.getPlayerEntity();
        distToPlayer=this.position.distance(player.position);
        
            // if we are in a projectile animation,
            // wait to fire
            
        if (this.projectileStartTick!==-1) {
            if (this.core.timestamp>this.projectileStartTick) {
                this.projectileStartTick=-1;
                this.projectileFire(player);
            }
        }
        
            // if we are in a melee animation,
            // wait for damage
            
        if (this.meleeStartTick!==-1) {
            if (this.core.timestamp>this.meleeStartTick) {
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
        
            // projectiles and melee starts
        
        if ((this.projectileJson!=null) && (Math.abs(angleDif)<=this.angleYProjectileRange)) this.projectileStart(player,distToPlayer);
        if (Math.abs(angleDif)<=this.angleYMeleeRange) this.meleeStart(distToPlayer);
        
            // time to jump?
            
        if (this.jumpHeight!==0) {
            if (this.core.timestamp>this.nextJumpTick) {
                this.nextJumpTick=this.core.timestamp+this.jumpWaitTick;
                this.jump();
            }
        }
        
            // chase player (don't move if in flinch)

        if (this.core.timestamp>this.nextDamageTick) {
            
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
        
            // any bounding?
            
        if (this.trapMeshName!==null) {
            if (this.position.x<this.trapMeshXBound.min) this.position.x=this.trapMeshXBound.min;
            if (this.position.x>this.trapMeshXBound.max) this.position.x=this.trapMeshXBound.max;
            if (this.position.z<this.trapMeshZBound.min) this.position.z=this.trapMeshZBound.min;
            if (this.position.z>this.trapMeshZBound.max) this.position.z=this.trapMeshZBound.max;
        }
    }
    
    drawSetup()
    {
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromPoint(this.angle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;
        
        return(true);
    }
}
