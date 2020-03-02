import PointClass from '../utility/point.js';
import ProjectEntityClass from '../project/project_entity.js';

export default class EntityFPSBotClass extends ProjectEntityClass
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
        this.respawnWaitTick=0;
        
        this.liquidInSound=null;
        this.liquidOutSound=null;
        this.hurtSound=null;
        this.dieSound=null;
        
        this.nextDamageTick=0;
        this.death
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

        
            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        
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
        this.respawnWaitTick=this.core.game.lookupValue(this.json.config.respawnWaitTick,this.data);
        
        this.liquidInSound=this.json.config.liquidInSound;
        this.liquidOutSound=this.json.config.liquidOutSound;
        this.hurtSound=this.json.config.hurtSound;
        this.dieSound=this.json.config.dieSound;
        
        this.nextDamageTick=0;
        this.lastInLiquid=false;
        this.lastUnderLiquid=false;

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
        
            // start with beretta
            
        //this.currentWeapon=-1;
        //this.switchWeapon(this.WEAPON_BERETTA);
        
        //this.hasM16=false;
        //this.grenadePauseTick=this.getTimestamp()+this.GRENADE_PAUSE_TICK;
        
        //this.beretta.ready();
        //this.m16.ready();
        //this.grenade.ready();
        
            // start scanning in middle
            
        //this.currentLookIdx=Math.trunc(this.TARGET_SCAN_Y_ANGLES.length*0.5);
        
            // move to random node
            
        this.moveToRandomNode();

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
        
    run()
    {
        super.run();
        
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

