import PointClass from '../utility/point.js';
import EntityClass from '../project/entity.js';

export default class EntityFPSBotClass extends EntityClass
{
    constructor(core,name,json,position,angle,data)
    {
        super(core,name,json,position,angle,data);
        
        this.fighter=true;
        this.pickup=true;
        
        this.health=0;
        this.healthInitialCount=0;
        this.healthMaxCount=0;
        
        this.armor=0;
        this.armorInitialCount=0;
        this.armorMaxCount=0;
        
        this.interfaceHealthIcon=null;
        this.interfaceHealthCount=null;
        this.interfaceArmorIcon=null;
        this.interfaceArmorCount=null;
        
        this.idleAnimation=null;
        this.runAnimation=null;
        this.dieAnimation=null;
        
        this.inStandingAnimation=true;
        
        this.maxTurnSpeed=0;
        this.maxLookSpeed=0;
        this.maxLookAngle=0;
        this.forwardAcceleration=0;
        this.forwardDeceleration=0;
        this.forwardMaxSpeed=0;
        this.sideAcceleration=0;
        this.sideDeceleration=0;
        this.sideMaxSpeed=0;
        this.jumpHeight=0;
        this.jumpWaterHeight=0;
        this.flySwimYReduce=0;
        this.damageFlinchWaitTick=0;
        this.fallDamageMinDistance=0;
        this.fallDamagePercentage=0;
        this.respawnWaitTick=0;
        
        this.liquidInSound=null;
        this.liquidOutSound=null;
        this.hurtSound=null;
        this.dieSound=null;
        
        this.nextDamageTick=0;
        this.currentFallDistance=0;
        this.lastInLiquid=false;
        this.lastUnderLiquid=false;
        
        this.lastWheelClick=0;
        
        this.carouselWeapons=[];        // weapons in the carousel
        this.extraWeapons=[];           // any other weapon
        
        this.currentCarouselWeaponIdx=0;
        this.defaultCarouselWeaponIdx=0;
        
        this.forceAnimationUpdate=false;
        this.currentIdleAnimation=null;
        this.currentRunAnimation=null;
        
        this.goalNodeIdx=-1;
        this.nextNodeIdx=-1;

        this.pausedTriggerName=null;
        this.targetEntity=null;
        this.lastTargetAngleDif=360;
        this.currentLookIdx=0;

        this.respawnTick=0;
        this.telefragTriggerEntity=null;
        
        this.seekNodeDistanceSlop=0;
        this.seekNodeAngleSlop=0;
        this.targetScanYRange=0;
        
            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        this.stuckPoint=new PointClass(0,0,0);
        
        this.drawAngle=new PointClass(0,0,0);
    }
    
    initialize()
    {
        let n,weaponBlock,weaponEntity;
        
        if (!super.initialize()) return(false);
        
        this.idleAnimation=this.json.config.idleAnimation;
        this.runAnimation=this.json.config.runAnimation;
        this.dieAnimation=this.json.config.dieAnimation;
        
        this.healthInitialCount=this.core.game.lookupValue(this.json.config.healthInitialCount,this.data);
        this.healthMaxCount=this.core.game.lookupValue(this.json.config.healthMaxCount,this.data);
        this.armorInitialCount=this.core.game.lookupValue(this.json.config.armorInitialCount,this.data);
        this.armorMaxCount=this.core.game.lookupValue(this.json.config.armorMaxCount,this.data);
        
        this.maxTurnSpeed=this.core.game.lookupValue(this.json.config.maxTurnSpeed,this.data);
        this.maxLookSpeed=this.core.game.lookupValue(this.json.config.maxLookSpeed,this.data);
        this.maxLookAngle=this.core.game.lookupValue(this.json.config.maxLookAngle,this.data);
        this.forwardAcceleration=this.core.game.lookupValue(this.json.config.forwardAcceleration,this.data);
        this.forwardDeceleration=this.core.game.lookupValue(this.json.config.forwardDeceleration,this.data);
        this.forwardMaxSpeed=this.core.game.lookupValue(this.json.config.forwardMaxSpeed,this.data);
        this.sideAcceleration=this.core.game.lookupValue(this.json.config.sideAcceleration,this.data);
        this.sideDeceleration=this.core.game.lookupValue(this.json.config.sideDeceleration,this.data);
        this.sideMaxSpeed=this.core.game.lookupValue(this.json.config.sideMaxSpeed,this.data);
        this.jumpHeight=this.core.game.lookupValue(this.json.config.jumpHeight,this.data);
        this.jumpWaterHeight=this.core.game.lookupValue(this.json.config.jumpWaterHeight,this.data);
        this.flySwimYReduce=this.core.game.lookupValue(this.json.config.flySwimYReduce,this.data);
        this.damageFlinchWaitTick=this.core.game.lookupValue(this.json.config.damageFlinchWaitTick,this.data);
        this.fallDamageMinDistance=this.core.game.lookupValue(this.json.config.fallDamageMinDistance,this.data);
        this.fallDamagePercentage=this.core.game.lookupValue(this.json.config.fallDamagePercentage,this.data);
        this.respawnWaitTick=this.core.game.lookupValue(this.json.config.respawnWaitTick,this.data);
        
        this.liquidInSound=this.json.config.liquidInSound;
        this.liquidOutSound=this.json.config.liquidOutSound;
        this.hurtSound=this.json.config.hurtSound;
        this.dieSound=this.json.config.dieSound;
        
        this.nextDamageTick=0;
        this.lastInLiquid=false;
        this.lastUnderLiquid=false;
        
        this.seekNodeDistanceSlop=this.core.game.lookupValue(this.json.config.seekNodeDistanceSlop,this.data);
        this.seekNodeAngleSlop=this.core.game.lookupValue(this.json.config.seekNodeAngleSlop,this.data);
        this.targetScanYRange=this.core.game.lookupValue(this.json.config.targetScanYRange,this.data);

            // setup the weapons
        
        for (n=0;n!==this.json.weapons.length;n++) {
            weaponBlock=this.json.weapons[n];
            
                // add the weapon in the correct array
                
            if (weaponBlock.inCarousel) {
                weaponEntity=this.addEntity(this,weaponBlock.json,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),null,true,true);
                weaponEntity.inCarousel=true;
                this.carouselWeapons.push(weaponEntity);
                if ((weaponBlock.default) && (this.defaultCarouselWeaponIdx===-1)) this.defaultCarouselWeaponIdx=n;
            }
            else {
                weaponEntity=this.addEntity(this,weaponBlock.json,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),null,true,true);
                weaponEntity.inCarousel=false;
                this.extraWeapons.push(weaponEntity);
            }
            
                // available to entity?
                
            weaponEntity.initiallyAvailable=this.core.game.lookupValue(weaponBlock.initiallyAvailable,this.data);
            
                // push the parent animations to the weapons
                // so we can pick them up later
                
            weaponEntity.parentIdleAnimation=weaponBlock.parentIdleAnimation;
            weaponEntity.parentRunAnimation=weaponBlock.parentRunAnimation;
            weaponEntity.parentFireIdleAnimation=weaponBlock.parentFireIdleAnimation;
            weaponEntity.parentPrimaryFireRunAnimation=weaponBlock.parentPrimaryFireRunAnimation;
            weaponEntity.parentSecondaryFireRunAnimation=weaponBlock.parentSecondaryFireRunAnimation;
            weaponEntity.parentTertiaryFireRunAnimation=weaponBlock.parentTertiaryFireRunAnimation;
        }
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
            // full health
            
        this.health=100;
        this.armor=0;
        this.deadCount=-1;
        this.stuckCount=0;
        this.passThrough=false;         // reset if this is being called after bot died
        
        this.currentFallDistance=0;
        
        this.respawnTick=0;
        this.telefragTriggerEntity=null;
        
        
        
            // start with beretta
            
        //this.currentWeapon=-1;
        //this.switchWeapon(this.WEAPON_BERETTA);
        
        //this.hasM16=false;
        //this.grenadePauseTick=this.getTimestamp()+this.GRENADE_PAUSE_TICK;
        
        //this.beretta.ready();
        //this.m16.ready();
        //this.grenade.ready();
        
            // start scanning in middle
            
        this.currentLookIdx=0;
        
            // move to random node
            
        this.moveToRandomNode(false);

            // get seek node
            
        this.goalNodeIdx=this.getRandomKeyNodeIndex();      // path to some random key node
        this.nextNodeIdx=this.nextNodeInPath(this.findNearestPathNode(-1),this.goalNodeIdx);    // we always spawn on a node, so next node is node in path to goal node

        this.pausedTriggerName=null;
        this.targetEntity=null;
        this.lastTargetAngleDif=360;
        
            // the draw angle is used to face a
            // different way then we are walking
            
        this.drawAngle.setFromPoint(this.angle);
        
            // turn the bot directly towards the node
            // they are heading to when starting
            
        this.turnYTowardsNode(this.nextNodeIdx,360);

            // start animation
            
        this.startModelAnimationChunkInFrames(null,30,960,996);
    }
    
    die(fromEntity,isTelefrag)
    {
        this.respawnTick=this.core.timestamp+this.respawnWaitTick;
        this.passThrough=true;
        
        this.core.soundList.playJson(this,null,this.dieSound);
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.dieAnimation[0],this.dieAnimation[1]);
        this.modelEntityAlter.queueAnimationStop();

        this.core.game.multiplayerAddScore(fromEntity,this,isTelefrag);
    }
    
    damage(fromEntity,damage,hitPoint)
    {
        if (this.health<=0) return;
        
        this.armor-=damage;
        if (this.armor<0) {
            this.health+=this.armor;
            this.armor=0;
        }

        if (this.health<=0) {
            this.die(fromEntity,false);
            return;
        }
        
        if (fromEntity!==null) this.targetEntity=fromEntity;
    }
    
    telefrag(fromEntity)
    {
        this.telefragTriggerEntity=fromEntity;
    }
        
    run()
    {
        let nodeIdx,prevNodeIdx,moveForward;
        let turnDiff,slideLeft,liquidIdx;
        
            // the developer freeze
            
        if (this.core.game.developer.freezeBotMonsters) return;
        
            // dead
            
        if (this.respawnTick!==0) {
            
                // keep falling
                
            this.rotMovement.setFromValues(0,0,0);
            this.moveInMapY(this.rotMovement,false);
            
                // bots always recover
                
            if (this.core.timestamp>this.respawnTick)  this.ready();
            
            return;
        }
        
            // the telefrag trigger
            // we defer this because it can happen during a spawn
            
        if (this.telefragTriggerEntity!==null) {
            this.die(this.telefragTriggerEntity,true);
            this.telefragTriggerEntity=null;
            return;
        }
        
            // if no node, just skip out
            
        if (this.nextNodeIdx===-1) return;
        
            // pick best weapon
            
        if ((this.hasM16) && (this.m16.ammoCount>0)) {
        //    this.switchWeapon(this.WEAPON_M16);
        }
        else {
        //    this.switchWeapon(this.WEAPON_BERETTA);
        }
        
            // look for things to shoot
            
        //this.findEntityToFight();
        
        //if (this.targetEntity!==null) this.fireWeapon();
        
            // always start by moving
            
        moveForward=true;
       
            // if we are waiting for a trigger,
            // then do nothing until trigger
            
        if (this.pausedTriggerName!==null) {
            if (!this.core.checkTrigger(this.pausedTriggerName)) {
                moveForward=false;
            }
            else {
                this.pausedTriggerName=null;
                this.startModelAnimationChunkInFrames(null,30,960,996);
            }
        }
        
            // if we aren't paused, see if we hit
            // next node or goal
            
        else {

                // have we hit goal node?
                // we only chase goals if we aren't targetting another entity

            if (this.targetEntity===null) {
                if (this.hitPathNode(this.goalNodeIdx,this.seekNodeDistanceSlop)) {
                    nodeIdx=this.goalNodeIdx;
                    this.goalNodeIdx=this.getRandomKeyNodeIndex();
                    this.nextNodeIdx=this.nextNodeInPath(nodeIdx,this.goalNodeIdx);
                }
            }
            
                // have we hit the next node?
                // if we are targetting an entity, go to the next nearest
                // linked node closest to the entity, otherwise path to the goal

            if (this.hitPathNode(this.nextNodeIdx,this.seekNodeDistanceSlop)) {
                prevNodeIdx=this.nextNodeIdx;
                
                if (this.targetEntity===null) {
                    this.nextNodeIdx=this.nextNodeInPath(this.nextNodeIdx,this.goalNodeIdx);
                }
                else {
                    this.nextNodeIdx=this.nextNodeTowardsEntity(this.nextNodeIdx,this.targetEntity);
                }
                
                    // is this a node we should pause at?

                this.pausedTriggerName=this.isNodeATriggerPauseNode(prevNodeIdx,this.nextNodeIdx);
                if (this.pausedTriggerName!==null) {
                    this.startModelAnimationChunkInFrames(null,30,92,177);
                    return;
                }
            }
        }
        
            // if we are touching an entity, try to slide out
            // of the way
            
        slideLeft=false;
        
        if ((this.touchEntity!==null) && (moveForward)) {
            slideLeft=true;
        }
        
            // turn towards the node
            // if we aren't paused
        
        if (this.pausedTriggerName===null) {
            turnDiff=this.turnYTowardsNode(this.nextNodeIdx,this.maxTurnSpeed);
            if (turnDiff>this.seekNodeAngleSlop) moveForward=false;
        }
        
            // changing angles based on if we are
            // walking nodes or targetting
            
        if (this.targetEntity===null) {
            this.drawAngle.turnYTowards(this.angle.y,this.maxTurnSpeed);
        }
        else {
            this.lastTargetAngleDif=this.drawAngle.turnYTowards(this.position.angleYTo(this.targetEntity.position),this.maxTurnSpeed);
        }
        
        return;
        
            // move
            
        this.movement.moveZWithAcceleration(moveForward,false,this.FORWARD_ACCELERATION,this.FORWARD_DECELERATION,this.FORWARD_MAX_SPEED,this.FORWARD_ACCELERATION,this.FORWARD_DECELERATION,this.FORWARD_MAX_SPEED);        
        this.movement.moveXWithAcceleration(slideLeft,false,this.SIDE_ACCELERATION,this.SIDE_DECELERATION,this.SIDE_MAX_SPEED,this.SIDE_ACCELERATION,this.SIDE_DECELERATION,this.SIDE_MAX_SPEED);

        this.rotMovement.setFromPoint(this.movement);
        this.rotMovement.rotateY(null,this.angle.y);
        
        this.movement.y=this.moveInMapY(this.rotMovement,false);
        this.moveInMapXZ(this.rotMovement,true,true);
        
            // detect stuck
            // if we get stuck, then head towards the nearest node and
            // then onto a new random goal
            
        if ((this.position.equals(this.stuckPoint)) && (this.pausedTriggerName===null)) {
            this.stuckCount++;
            if (this.stuckCount>=this.MAX_STUCK_COUNT) {
                this.stuckCount=0;
                this.goalNodeIdx=this.getRandomKeyNodeIndex();
                this.nextNodeIdx=this.findNearestPathNode(-1);
            }
        }
        
        this.stuckPoint.setFromPoint(this.position);
        
            // liquids
            
        liquidIdx=this.core.map.liquidList.getLiquidForPoint(this.position);
        
        if (liquidIdx!==-1) {
            if ((!this.lastInLiquid) && (this.liquidInSound!==null)) this.core.soundList.playJson(this,null,this.liquidInSound);
            this.lastInLiquid=true;
        }
        else {
            if ((this.lastInLiquid) && (this.liquidOutSound!==null)) this.core.soundList.playJson(this,null,this.liquidOutSound);
            this.lastInLiquid=false;
        }
    }
    
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromPoint(this.drawAngle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

