import PointClass from '../utility/point.js';
import EntityClass from '../project/entity.js';

export default class EntityFPSBotClass extends EntityClass
{
    constructor(core,name,json,position,angle,data,mapSpawn)
    {
        super(core,name,json,position,angle,data,mapSpawn);
        
        this.fighter=true;
        this.canPickup=true;
        
        this.health=0;
        this.healthInitialCount=0;
        this.healthMaxCount=0;
        
        this.armor=0;
        this.armorInitialCount=0;
        this.armorMaxCount=0;
        
        this.idleAnimation=null;
        this.runAnimation=null;
        this.dieAnimation=null;
        
        this.inStandingAnimation=true;
        
        this.maxTurnSpeed=0;
        this.forwardAcceleration=0;
        this.forwardDeceleration=0;
        this.forwardMaxSpeed=0;
        this.backwardAcceleration=0;
        this.backwardDeceleration=0;
        this.backwardMaxSpeed=0;
        this.sideAcceleration=0;
        this.sideDeceleration=0;
        this.sideMaxSpeed=0;
        this.swimAcceleration=0;
        this.swimDeceleration=0;
        this.swimMaxSpeed=0;
        this.flyAcceleration=0;
        this.flyDeceleration=0;
        this.flyMaxSpeed=0;

        this.jumpHeight=0;
        this.jumpWaterHeight=0;
        this.damageFlinchWaitTick=0;
        this.fallDamageMinDistance=0;
        this.fallDamagePercentage=0;
        this.respawnWaitTick=0;
        
        this.hurtSound=null;
        this.dieSound=null;
        
        this.nextDamageTick=0;
        this.falling=false;
        this.fallStartY=0;
        this.lastInLiquidIdx=-1;
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
        this.currentTargetYScan=0;

        this.respawnTick=0;
        this.telefragTriggerEntity=null;
        
        this.seekNodeDistanceSlop=0;
        this.seekNodeAngleSlop=0;
        this.targetScanYRange=0;
        this.targetForgetDistance=0;
        this.targetFireYRange=0;
        this.targetFireSlop=0;
        
            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        
        this.stuckPoint=new PointClass(0,0,0);
        this.lookPoint=new PointClass(0,0,0);
        this.lookVector=new PointClass(0,0,0);
        this.lookHitPoint=new PointClass(0,0,0);
        
        this.firePosition=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,0,0);
    }
    
    initialize()
    {
        let n,weaponBlock,weaponEntity;
        let skill;
        
        if (!super.initialize()) return(false);
        
            // regular config
            
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.config.idleAnimation);
        this.runAnimation=this.core.game.lookupAnimationValue(this.json.config.runAnimation);
        this.dieAnimation=this.core.game.lookupAnimationValue(this.json.config.dieAnimation);
        
        this.hurtSound=this.core.game.lookupSoundValue(this.json.config.hurtSound);
        this.dieSound=this.core.game.lookupSoundValue(this.json.config.dieSound);

            // skill based config
            
        skill=this.json.config.skills[this.core.setup.botSkill];
        
        this.healthInitialCount=this.core.game.lookupValue(skill.healthInitialCount,this.data,0);
        this.healthMaxCount=this.core.game.lookupValue(skill.healthMaxCount,this.data,0);
        this.armorInitialCount=this.core.game.lookupValue(skill.armorInitialCount,this.data,0);
        this.armorMaxCount=this.core.game.lookupValue(skill.armorMaxCount,this.data,0);
        
        this.maxTurnSpeed=this.core.game.lookupValue(skill.maxTurnSpeed,this.data,0);
        
        this.forwardAcceleration=this.core.game.lookupValue(skill.forwardAcceleration,this.data,0);
        this.forwardDeceleration=this.core.game.lookupValue(skill.forwardDeceleration,this.data,0);
        this.forwardMaxSpeed=this.core.game.lookupValue(skill.forwardMaxSpeed,this.data,0);
        this.backwardAcceleration=this.core.game.lookupValue(skill.backwardAcceleration,this.data,0);
        this.backwardDeceleration=this.core.game.lookupValue(skill.backwardDeceleration,this.data,0);
        this.backwardMaxSpeed=this.core.game.lookupValue(skill.backwardMaxSpeed,this.data,0);
        this.sideAcceleration=this.core.game.lookupValue(skill.sideAcceleration,this.data,0);
        this.sideDeceleration=this.core.game.lookupValue(skill.sideDeceleration,this.data,0);
        this.sideMaxSpeed=this.core.game.lookupValue(skill.sideMaxSpeed,this.data,0);
        this.swimAcceleration=this.core.game.lookupValue(skill.swimAcceleration,this.data,0);
        this.swimDeceleration=this.core.game.lookupValue(skill.swimDeceleration,this.data,0);
        this.swimMaxSpeed=this.core.game.lookupValue(skill.swimMaxSpeed,this.data,0);
        this.flyAcceleration=this.core.game.lookupValue(skill.flyAcceleration,this.data,0);
        this.flyDeceleration=this.core.game.lookupValue(skill.flyDeceleration,this.data,0);
        this.flyMaxSpeed=this.core.game.lookupValue(skill.flyMaxSpeed,this.data,0);

        this.jumpHeight=this.core.game.lookupValue(skill.jumpHeight,this.data,0);
        this.jumpWaterHeight=this.core.game.lookupValue(skill.jumpWaterHeight,this.data,0);
        this.damageFlinchWaitTick=this.core.game.lookupValue(skill.damageFlinchWaitTick,this.data,0);
        this.fallDamageMinDistance=this.core.game.lookupValue(skill.fallDamageMinDistance,this.data,0);
        this.fallDamagePercentage=this.core.game.lookupValue(skill.fallDamagePercentage,this.data,0);
        this.respawnWaitTick=this.core.game.lookupValue(skill.respawnWaitTick,this.data,0);
        
        this.seekNodeDistanceSlop=this.core.game.lookupValue(skill.seekNodeDistanceSlop,this.data,0);
        this.seekNodeAngleSlop=this.core.game.lookupValue(skill.seekNodeAngleSlop,this.data,0);
        this.targetScanYRange=this.core.game.lookupValue(skill.targetScanYRange,this.data,0);
        this.targetForgetDistance=this.core.game.lookupValue(skill.targetForgetDistance,this.data,0);
        this.targetFireYRange=this.core.game.lookupValue(skill.targetFireYRange,this.data,0);
        this.targetFireSlop=this.core.game.lookupValue(skill.targetFireSlop,this.data,0);
        
        this.flying=false;
        
        this.nextDamageTick=0;
        this.lastInLiquidIdx=-1;
        this.lastUnderLiquid=false;

            // setup the weapons
        
        for (n=0;n!==this.json.weapons.length;n++) {
            weaponBlock=this.json.weapons[n];
            
                // add the weapon in the correct array
                
            if (weaponBlock.inCarousel) {
                weaponEntity=this.addEntity(this,weaponBlock.json,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),null,true,true);
                this.carouselWeapons.push(weaponEntity);
                if ((weaponBlock.default) && (this.defaultCarouselWeaponIdx===-1)) this.defaultCarouselWeaponIdx=n;
            }
            else {
                weaponEntity=this.addEntity(this,weaponBlock.json,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),null,true,true);
                this.extraWeapons.push(weaponEntity);
            }
            
                // add in the bot slop
                
            weaponEntity.fireYSlop=this.targetFireSlop;
            
                // available to entity?
                
            weaponEntity.initiallyAvailable=this.core.game.lookupValue(weaponBlock.initiallyAvailable,this.data,false);
            
                // push the parent animations to the weapons
                // so we can pick them up later
                
            weaponEntity.parentIdleAnimation=this.core.game.lookupAnimationValue(weaponBlock.parentIdleAnimation);
            weaponEntity.parentRunAnimation=this.core.game.lookupAnimationValue(weaponBlock.parentRunAnimation);
            weaponEntity.parentFireIdleAnimation=this.core.game.lookupAnimationValue(weaponBlock.parentFireIdleAnimation);
            weaponEntity.parentPrimaryFireRunAnimation=this.core.game.lookupAnimationValue(weaponBlock.parentPrimaryFireRunAnimation);
            weaponEntity.parentSecondaryFireRunAnimation=this.core.game.lookupAnimationValue(weaponBlock.parentSecondaryFireRunAnimation);
            weaponEntity.parentTertiaryFireRunAnimation=this.core.game.lookupAnimationValue(weaponBlock.parentTertiaryFireRunAnimation);
        }
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
            // full health
            
        this.health=this.healthInitialCount;
        this.armor=this.armorInitialCount;
        this.stuckCount=0;
        this.passThrough=false;         // reset if this is being called after bot died
        
        this.falling=false;
        this.fallStartY=0;
        
        this.respawnTick=0;
        this.telefragTriggerEntity=null;
        
            // start with best weapon
            
        this.currentCarouselWeaponIdx=-1;
        this.pickBestWeapon();
        
            // start scanning in middle
            
        this.currentTargetYScan=Math.trunc(this.targetScanYRange*0.5);
        
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
            
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.runAnimation[0],this.runAnimation[1]);
    }
    
        //
        // health
        //
        
    die(fromEntity,isTelefrag)
    {
        this.respawnTick=this.core.timestamp+this.respawnWaitTick;
        this.passThrough=true;
        
        this.core.soundList.playJson(this.position,this.dieSound);
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
    
        //
        // action messages
        //
        
    findWeaponByName(weaponName)
    {
        let n;
        
        for (n=0;n!==this.carouselWeapons.length;n++) {
            if (this.carouselWeapons[n].name===weaponName) return(this.carouselWeapons[n]);
        }
        
        for (n=0;n!==this.extraWeapons.length;n++) {
            if (this.extraWeapons[n].name===weaponName) return(this.extraWeapons[n]);
        }

        console.log('Unknown weapon: '+weaponName);
        return(null);
    }
    
    addWeapon(weaponName)
    {
        let weapon=this.findWeaponByName(weaponName);
        if (weapon===null) return;
        
            // make weapon available
            
        weapon.available=true;
    }
    
    addAmmo(weaponName,fireMethod,count)
    {
        let weapon=this.findWeaponByName(weaponName);
        if (weapon===null) return;
        
        weapon.addAmmo(fireMethod,count);
    }
    
    addHealth(count)
    {
        this.health+=count;
        if (this.health>this.healthMaxCount) this.health=this.healthMaxCount;
    }
    
    addArmor(count)
    {
        this.armor+=count;
        if (this.armor>this.armorMaxCount) this.armor=this.armorMaxCount;
    }
    
        //
        // determine if we are at a node that is a pause node.  This is not
        // built in but we specify data that says at this node wait for a certain
        // trigger before going on to another node
        //
    
    isNodeATriggerPauseNode(nodeIdx,nextNodeIdx)
    {
        let n,data;
        
        data=this.getNodeData(nodeIdx);
        if (data===null) return(null);
        
        for (n=0;n!=data.length;n++) {
            if (data[n].link===nextNodeIdx) return(data[n].trigger);
        }
        
        return(null); 
    }
    
        //
        // fighting
        //
        
    pickBestWeapon()
    {
        let n,idx,weaponEntity,meshName;
        
            // find best weapon
            
        idx=0;

        for (n=0;n!==this.carouselWeapons.length;n++) {
            if ((this.carouselWeapons[n].available) && (this.carouselWeapons[n].primary.ammo!==0)) idx=n;
        }

        if (idx===this.currentCarouselWeaponIdx) return;
        
            // switch weapon
            
        this.currentCarouselWeaponIdx=idx;
        
        for (n=0;n!==this.carouselWeapons.length;n++) {
            weaponEntity=this.carouselWeapons[n];
            
            if (n===this.currentCarouselWeaponIdx) {
                this.forceAnimationUpdate=true;
                this.currentIdleAnimation=weaponEntity.parentIdleAnimation;
                this.currentRunAnimation=weaponEntity.parentRunAnimation;
                
                for (meshName of this.json.weapons[n].meshes) {
                    this.modelEntityAlter.show(meshName,true);
                }
            }
            else {
                weaponEntity.show=false;
                
                for (meshName of this.json.weapons[n].meshes) {
                    this.modelEntityAlter.show(meshName,false);
                }
            }
        }
    }

    findEntityToFight()
    {
            // special check for no ammo
            // if so, don't fight
        
        if (this.carouselWeapons[this.currentCarouselWeaponIdx].primary.ammo===0) {
            this.targetEntity=null;
            return;
        }
        
            // already fighting?
            // if so, see if we are past the forget
            // distance or the target has no health
            
        if (this.targetEntity!=null) {
            if (this.targetEntity.health<=0) {
                this.targetEntity=null;
                return;
            }
            if (this.position.distance(this.targetEntity.position)>this.targetForgetDistance) {
                this.targetEntity=null;
                return;
            }
            
            return;
        }
        
            // ray trace for entities
            // we do one look angle per tick
            
        this.lookPoint.setFromPoint(this.position);
        this.lookPoint.y+=Math.trunc(this.height*0.5);      // use middle instead of eye position in case other stuff is smaller
        
        this.lookVector.setFromValues(0,0,this.targetForgetDistance);
        this.lookVector.rotateY(null,(this.currentTargetYScan-Math.trunc(this.targetScanYRange*0.5)));
        
        this.currentTargetYScan++;
        if (this.currentTargetYScan>=this.targetScanYRange) this.currentTargetYScan=0;
        
        if (this.rayCollision(this.lookPoint,this.lookVector,this.lookHitPoint)) {
            if (this.hitEntity!==null) {
                if (this.hitEntity.fighter) this.targetEntity=this.hitEntity;
            }
        }
    }

    fireWeapon()
    {
        let x,weapon;
        
            // are we turned enough towards player?
            
        if (Math.abs(this.lastTargetAngleDif)>this.targetFireYRange) return;
            
           // are we outside of grenade distance?
           // if so, then we can throw a grenade
           // we also have a pause so bots don't unload
           // at one helpless player
           
           // run through extraWeapons here
           /*
        if (this.grenade.ammoCount>0) {
            if (this.getTimestamp()>this.grenadePauseTick) {
                if (this.position.distance(this.targetEntity.position)>this.MIN_GRENADE_DISTANCE) {
                    this.fireAngle.setFromPoint(this.drawAngle);
                    this.fireAngle.x=this.position.getLookAngleTo(this.targetEntity.position);
                    this.grenade.fire(this.position,this.fireAngle,this.eyeOffset);
                    this.grenadePauseTick=this.getTimestamp()+this.GRENADE_PAUSE_TICK;

                    if (this.currentWeapon===this.WEAPON_BERETTA) {
                        this.modelEntityAlter.startAnimationChunkInFrames(null,30,51,91);
                        this.modelEntityAlter.queueAnimationChunkInFrames(null,30,406,442);
                    }
                    else {
                        this.modelEntityAlter.startAnimationChunkInFrames(null,30,820,860);
                        this.modelEntityAlter.queueAnimationChunkInFrames(null,30,960,996);
                    }
                    return;
                }
            }
        }
        */
            // otherwise shot the held weapon
            
        this.firePosition.setFromPoint(this.position);
        this.firePosition.y+=this.eyeOffset;
            
        weapon=this.carouselWeapons[this.currentCarouselWeaponIdx].firePrimary(this.firePosition,this.drawAngle);
    }
    
        //
        // mainline bot run
        //
        
    run()
    {
        let nodeIdx,prevNodeIdx,moveForward;
        let turnDiff,slideLeft,liquid,liquidIdx,gravityFactor,fallDist;
        let idleAnimation,cube;
        
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
       
            // dead
            
        if (this.respawnTick!==0) {
            
                // keep falling
                
            this.rotMovement.setFromValues(0,0,0);
            this.moveInMapY(this.rotMovement,gravityFactor,false);
            
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
        
            // falling
            
        if ((this.standOnMeshIdx!==-1) && (liquidIdx===-1)) {
            if (this.falling) {
                this.falling=false;
                fallDist=(this.fallStartY-this.position.y)-this.fallDamageMinDistance;
                if (fallDist>0) this.damage(this,Math.trunc(fallDist*this.fallDamagePercentage),this.position);
            }
        }
        else {
            if (this.movement.y>0) {
                this.falling=false;
            }
            else {
                if (!this.falling) {
                    this.falling=true;
                    this.fallStartY=this.position.y;
                }
            }
        }
        
            // if no node, just skip out
            
        if (this.nextNodeIdx===-1) return;
        
            // pick best weapon
            
        this.pickBestWeapon();
        
            // look for things to shoot
            
        this.findEntityToFight();
        
        if (this.targetEntity!==null) this.fireWeapon();
        
            // run the nodes, we do this before
            // freezing for trigger waits because we might
            // be standing upon something that auto moves us to
            // the next node
        
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
                if (!this.core.checkTrigger(this.pausedTriggerName)) {
                    idleAnimation=this.carouselWeapons[this.currentCarouselWeaponIdx].parentIdleAnimation;
                    this.modelEntityAlter.startAnimationChunkInFrames(null,30,idleAnimation[0],idleAnimation[1]);
                    return;
                }
            }
        }
        
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
                this.modelEntityAlter.startAnimationChunkInFrames(null,30,960,996);
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
        
            // move
            
        if (this.flying) {
            this.movement.moveZWithAcceleration(moveForward,false,this.flyAcceleration,this.flyDeceleration,this.flyMaxSpeed,this.flyAcceleration,this.flyDeceleration,this.flyMaxSpeed);
        }
        else {
            if (this.lastUnderLiquid) {
                this.movement.moveZWithAcceleration(moveForward,false,this.swimAcceleration,this.swimDeceleration,this.swimMaxSpeed,this.swimAcceleration,this.swimDeceleration,this.swimMaxSpeed);
            }
            else {
                this.movement.moveZWithAcceleration(moveForward,false,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed,this.backwardAcceleration,this.backwardDeceleration,this.backwardMaxSpeed);
            }
        }
        this.movement.moveXWithAcceleration(slideLeft,false,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed);
        
        this.rotMovement.setFromPoint(this.movement);
        if ((this.flying) || (this.lastUnderLiquid)) {
            this.rotMovement.y=0;       // only Y movement comes from X angle rotation
            this.rotMovement.rotateX(null,this.angle.x);     // if flying or swimming, add in the X rotation
        }
        this.rotMovement.rotateY(null,this.angle.y);
                    
        this.movement.y=this.moveInMapY(this.rotMovement,gravityFactor,false);
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
        
            // any cube actions
            
        cube=this.core.map.cubeList.findCubeContainingEntity(this);
        if (cube!==null) this.runActions(this,cube.actions);
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

