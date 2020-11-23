import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import EntityClass from '../game/entity.js';

export default class EntityFPSPlayerClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
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
        
        this.isThirdPersonCamera=false;
        this.thirdPersonCameraDistance=0;
        this.thirdPersonCameraLookAngle=null;
        this.isTopDownCameraOnDeath=false;
        this.topDownCameraDistance=0;
        
        this.hitIndicator=false;
        this.hitIndicatorFlashTick=0;
        
        this.hurtSound=null;
        this.dieSound=null;
        
        this.nextDamageTick=0;
        this.falling=false;
        this.fallStartY=0;
        this.lastInLiquidIdx=-1;
        this.lastUnderLiquid=false;
        
        this.carouselWeapons=[];        // weapons in the carousel
        this.extraWeapons=[];           // any other weapon
        
        this.currentCarouselWeaponIdx=0;
        this.defaultCarouselWeaponIdx=0;
        
        this.forceAnimationUpdate=false;
        this.currentIdleAnimation=null;
        this.currentRunAnimation=null;
        
        this.respawnTick=0;
        this.telefragTriggerEntity=null;
        
            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        this.firePosition=new PointClass(0,0,0);
        
        Object.seal(this);
    }
        
    initialize()
    {
        let n,weaponBlock,weaponEntity;
        
        if (!super.initialize()) return(false);
        
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.animations.idleAnimation);
        this.runAnimation=this.core.game.lookupAnimationValue(this.json.animations.runAnimation);
        this.dieAnimation=this.core.game.lookupAnimationValue(this.json.animations.dieAnimation);
        
        this.healthInitialCount=this.core.game.lookupValue(this.json.config.healthInitialCount,this.data,0);
        this.healthMaxCount=this.core.game.lookupValue(this.json.config.healthMaxCount,this.data,0);
        this.armorInitialCount=this.core.game.lookupValue(this.json.config.armorInitialCount,this.data,0);
        this.armorMaxCount=this.core.game.lookupValue(this.json.config.armorMaxCount,this.data,0);
        
        this.interfaceHealthIcon=this.core.game.lookupValue(this.json.config.interfaceHealthIcon,this.data,null);
        this.interfaceHealthCount=this.core.game.lookupValue(this.json.config.interfaceHealthCount,this.data,null);
        this.interfaceArmorIcon=this.core.game.lookupValue(this.json.config.interfaceArmorIcon,this.data,null);
        this.interfaceArmorCount=this.core.game.lookupValue(this.json.config.interfaceArmorCount,this.data,null);
        
        this.maxTurnSpeed=this.core.game.lookupValue(this.json.config.maxTurnSpeed,this.data,0);
        this.maxLookSpeed=this.core.game.lookupValue(this.json.config.maxLookSpeed,this.data,0);
        this.maxLookAngle=this.core.game.lookupValue(this.json.config.maxLookAngle,this.data,0);
        
        this.forwardAcceleration=this.core.game.lookupValue(this.json.config.forwardAcceleration,this.data,0);
        this.forwardDeceleration=this.core.game.lookupValue(this.json.config.forwardDeceleration,this.data,0);
        this.forwardMaxSpeed=this.core.game.lookupValue(this.json.config.forwardMaxSpeed,this.data,0);
        this.backwardAcceleration=this.core.game.lookupValue(this.json.config.backwardAcceleration,this.data,0);
        this.backwardDeceleration=this.core.game.lookupValue(this.json.config.backwardDeceleration,this.data,0);
        this.backwardMaxSpeed=this.core.game.lookupValue(this.json.config.backwardMaxSpeed,this.data,0);
        this.sideAcceleration=this.core.game.lookupValue(this.json.config.sideAcceleration,this.data,0);
        this.sideDeceleration=this.core.game.lookupValue(this.json.config.sideDeceleration,this.data,0);
        this.sideMaxSpeed=this.core.game.lookupValue(this.json.config.sideMaxSpeed,this.data,0);
        this.swimAcceleration=this.core.game.lookupValue(this.json.config.swimAcceleration,this.data,0);
        this.swimDeceleration=this.core.game.lookupValue(this.json.config.swimDeceleration,this.data,0);
        this.swimMaxSpeed=this.core.game.lookupValue(this.json.config.swimMaxSpeed,this.data,0);
        this.flyAcceleration=this.core.game.lookupValue(this.json.config.flyAcceleration,this.data,0);
        this.flyDeceleration=this.core.game.lookupValue(this.json.config.flyDeceleration,this.data,0);
        this.flyMaxSpeed=this.core.game.lookupValue(this.json.config.flyMaxSpeed,this.data,0);

        this.jumpHeight=this.core.game.lookupValue(this.json.config.jumpHeight,this.data,0);
        this.jumpWaterHeight=this.core.game.lookupValue(this.json.config.jumpWaterHeight,this.data,0);
        this.damageFlinchWaitTick=this.core.game.lookupValue(this.json.config.damageFlinchWaitTick,this.data,0);
        this.fallDamageMinDistance=this.core.game.lookupValue(this.json.config.fallDamageMinDistance,this.data,0);
        this.fallDamagePercentage=this.core.game.lookupValue(this.json.config.fallDamagePercentage,this.data,0);
        this.respawnWaitTick=this.core.game.lookupValue(this.json.config.respawnWaitTick,this.data,0);
        
        this.isThirdPersonCamera=this.core.game.lookupValue(this.json.config.isThirdPersonCamera,this.data,0);
        this.thirdPersonCameraDistance=this.core.game.lookupValue(this.json.config.thirdPersonCameraDistance,this.data,0);
        this.thirdPersonCameraLookAngle=new PointClass(this.json.config.thirdPersonCameraLookAngle.x,this.json.config.thirdPersonCameraLookAngle.y,this.json.config.thirdPersonCameraLookAngle.z);
        this.isTopDownCameraOnDeath=this.core.game.lookupValue(this.json.config.isTopDownCameraOnDeath,this.data,0);
        this.topDownCameraDistance=this.core.game.lookupValue(this.json.config.topDownCameraDistance,this.data,0);
        
        this.hitIndicator=this.core.game.lookupValue(this.json.config.hitIndicator,this.data,null);
        this.hitIndicatorFlashTick=this.core.game.lookupValue(this.json.config.hitIndicatorFlashTick,this.data,0);
        
        this.hurtSound=this.core.game.lookupSoundValue(this.json.sounds.hurtSound);
        this.dieSound=this.core.game.lookupSoundValue(this.json.sounds.dieSound);
        
        this.nextDamageTick=0;
        this.lastInLiquidIdx=-1;
        this.lastUnderLiquid=false;

            // setup the weapons
        
        this.defaultCarouselWeaponIdx=-1;
        
        for (n=0;n!==this.json.weapons.length;n++) {
            weaponBlock=this.json.weapons[n];
            
                // add the weapon in the correct array
                
            if (weaponBlock.inCarousel) {
                weaponEntity=this.addEntity(weaponBlock.weaponJson,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),weaponBlock.weaponData,this,this,true);
                this.carouselWeapons.push(weaponEntity);
                if ((weaponBlock.default) && (this.defaultCarouselWeaponIdx===-1)) this.defaultCarouselWeaponIdx=n;
            }
            else {
                weaponEntity=this.addEntity(weaponBlock.weaponJson,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),weaponBlock.weaponData,this,this,true);
                this.extraWeapons.push(weaponEntity);
            }
            
                // available to entity?
                
            weaponEntity.initiallyAvailable=this.core.game.lookupValue(weaponBlock.initiallyAvailable,this.data,false);
            
                // push the parent animations to the weapons
                // so we can pick them up later
                
            weaponEntity.parentIdleAnimation=weaponBlock.parentIdleAnimation;
            weaponEntity.parentRunAnimation=weaponBlock.parentRunAnimation;
            weaponEntity.parentFireIdleAnimation=weaponBlock.parentFireIdleAnimation;
            weaponEntity.parentPrimaryFireRunAnimation=weaponBlock.parentPrimaryFireRunAnimation;
            weaponEntity.parentPrimaryFireFreezeMovement=false;
            weaponEntity.parentSecondaryFireRunAnimation=weaponBlock.parentSecondaryFireRunAnimation;
            weaponEntity.parentSecondaryFireFreezeMovement=false;
            weaponEntity.parentTertiaryFireRunAnimation=weaponBlock.parentTertiaryFireRunAnimation;
            weaponEntity.parentTertiaryFireFreezeMovement=false;
        }
        
        return(true);
    }
    
    release()
    {
        let n;
        
        super.release();
        
        for (n=0;n!==this.carouselWeapons.length;n++) {
            this.carouselWeapons[n].release();
        }
        for (n=0;n!==this.extraWeapons.length;n++) {
            this.extraWeapons[n].release();
        }
    }
    
    showCarouselWeapon()
    {
        let n,weaponEntity,meshName;

        for (n=0;n!==this.carouselWeapons.length;n++) {
            weaponEntity=this.carouselWeapons[n];
            
            if (n===this.currentCarouselWeaponIdx) {
                weaponEntity.show=true;
                
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
    
    setCurrentAnimation()
    {
        if ((this.movement.x!==0) || (this.movement.z!==0)) {
            if ((this.inStandingAnimation) || (this.forceAnimationUpdate)) {
                this.modelEntityAlter.startAnimationChunkInFrames(this.currentRunAnimation);
            }
            this.inStandingAnimation=false;
        }
        else {
            if ((!this.inStandingAnimation) || (this.forceAnimationUpdate)) {
                this.modelEntityAlter.startAnimationChunkInFrames(this.currentIdleAnimation);
            }
            this.inStandingAnimation=true;
        }
        
        this.forceAnimationUpdate=false;        
    }
    
    ready()
    {
        let n;
        
        super.ready();
        
            // set the camera
            
        if (!this.isThirdPerson) {
            this.core.game.camera.gotoFirstPerson();
        }
        else {
            this.core.game.camera.gotoThirdPerson(this.thirdPersonCameraDistance,this.thirdPersonCameraAngle);
        }
        
            // health
            
        this.health=this.healthInitialCount;
        this.armor=this.armorInitialCount;
        
        this.passThrough=false;
        
        this.respawnTick=0;
        
        this.falling=false;
        this.fallStartY=0;
        
            // some animation defaults
            
        this.currentIdleAnimation=this.idleAnimation;
        this.currentRunAnimation=this.runAnimation;
        
            // ready all the weapons
            
        this.currentCarouselWeaponIdx=this.defaultCarouselWeaponIdx;

        for (n=0;n!==this.carouselWeapons.length;n++) {
            this.carouselWeapons[n].ready();
        }
        
        for (n=0;n!==this.extraWeapons.length;n++) {
            this.extraWeapons[n].ready();
        }
        
        this.showCarouselWeapon();

            // start with the idle animation
            
        this.inStandingAnimation=true;
        this.setCurrentAnimation();
        
            // move to random node
            // if multiplayer
            
        this.telefragTriggerEntity=null;
            
        if (this.core.game.multiplayerMode!==this.core.game.MULTIPLAYER_MODE_NONE) this.moveToRandomNode(false);
        
            // turn off any score display
            
        this.core.game.overlay.multiplayerShowScores(false);
    }
    
        //
        // messages
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
        let n;
        
        let weapon=this.findWeaponByName(weaponName);
        if (weapon===null) return;
        
            // make weapon available
            
        weapon.available=true;
        
            // select weapon if in carousel
            
        for (n=0;n!==this.carouselWeapons.length;n++) {
            if (this.carouselWeapons[n].name===weaponName) {
                this.currentCarouselWeaponIdx=n;
                this.showCarouselWeapon();
                break;
            }
        }
    }
    
    addAmmo(weaponName,fireMethod,count)
    {
        let weapon=this.findWeaponByName(weaponName);
        if (weapon===null) return;
        
        weapon.addAmmo(fireMethod,count);
    }
    
    addHealth(count)
    {
        if (this.interfaceHealthIcon!==null) this.core.game.overlay.pulseElement(this.interfaceHealthIcon,500,10);
        
        this.health+=count;
        if (this.health>this.healthMaxCount) this.health=this.healthMaxCount;
    }
    
    addArmor(count)
    {
        if (this.interfaceArmorIcon!==null) this.core.game.overlay.pulseElement(this.interfaceArmorIcon,500,10);
        
        this.armor+=count;
        if (this.armor>this.armorMaxCount) this.armor=this.armorMaxCount;
    }
    
        //
        // health
        //
        
    die(fromEntity,isTelefrag)
    {
        this.respawnTick=this.core.game.timestamp+this.respawnWaitTick;
        this.passThrough=true;
        
        if (this.isTopDownCameraOnDeath) this.core.game.camera.gotoTopDown(this.topDownCameraDistance);

        this.core.audio.soundStartGame(this.core.game.map.soundList,this.position,this.dieSound);
        this.modelEntityAlter.startAnimationChunkInFrames(this.dieAnimation);
        this.modelEntityAlter.queueAnimationStop();
        
        this.core.game.overlay.multiplayerAddScore(fromEntity,this,isTelefrag);
        this.core.game.overlay.multiplayerShowScores(true);
    }
    
    damage(fromEntity,damage,hitPoint)
    {
        let y,addway,subway;

            // already dead, can't take damage
            
        if (this.health<=0) return;
        
            // apply the hit indicator
            
        if ((hitPoint!==null) && (this.hitIndicator)) {
            
                // get position of hit from view direction
                
            y=this.position.angleYTo(hitPoint);
            
            if (this.angle.y>y) {
                addway=360.0-(this.angle.y-y);
                subway=this.angle.y-y;
            }
            else {
                addway=y-this.angle.y;
                subway=360.0-(y-this.angle.y);
            }
            
            y=(addway<subway)?addway:-subway;

                // get hit spot

            if ((y<=-45) && (y>=-135)) {
                this.core.game.overlay.hitOverlay.flash(this.core.game.overlay.hitOverlay.SIDE_RIGHT,this.hitIndicatorFlashTick);
            }
            else {
                if ((y>=45) && (y<=135)) {
                    this.core.game.overlay.hitOverlay.flash(this.core.game.overlay.hitOverlay.SIDE_LEFT,this.hitIndicatorFlashTick);
                }
                else {
                    if ((y>-45) && (y<45)) {
                        this.core.game.overlay.hitOverlay.flash(this.core.game.overlay.hitOverlay.SIDE_TOP,this.hitIndicatorFlashTick);
                    }
                    else {
                        this.core.game.overlay.hitOverlay.flash(this.core.game.overlay.hitOverlay.SIDE_BOTTOM,this.hitIndicatorFlashTick);
                    }
                }
            }
        }
        
            // apply the damage
            
        this.armor-=damage;
        if (this.armor<0) {
            if (this.interfaceHealthIcon!==null) this.core.game.overlay.pulseElement(this.interfaceHealthIcon,500,5);
            this.health+=this.armor;
            this.armor=0;
        }
        else {
            if (this.interfaceArmorIcon!==null) this.core.game.overlay.pulseElement(this.interfaceArmorIcon,500,5);
        }
        
            // dead?
        
        if (this.health<=0) {
            this.die(fromEntity,false);
            return;
        }
        
            // hurt sound
            
        if (this.core.game.timestamp>this.nextDamageTick) {
            this.nextDamageTick=this.core.game.timestamp+this.damageFlinchWaitTick;
            this.core.audio.soundStartGame(this.core.game.map.soundList,this.position,this.hurtSound);
        }
    }
    
    telefrag(fromEntity)
    {
        this.telefragTriggerEntity=fromEntity;
    }

        //
        // run
        //
    
    run()
    {
        let n,x,y;
        let moveForward,moveBackward,moveLeft,moveRight;
        let liquid,liquidIdx,bump,gravityFactor,fallDist;
        let weapon,firePrimary,fireSecondary,fireTertiary;
        let turnAdd,lookAdd,startWeaponIdx;
        let weapChangeDir,cube;
        let input=this.core.input;
        let setup=this.core.setup;
        
        if (this.core.game.freezePlayer) return;
        
            // liquid changes
            
        liquidIdx=this.core.game.map.liquidList.getLiquidForEyePoint(this.position,this.eyeOffset);
        
        if (liquidIdx!==-1) {
            this.lastUnderLiquid=true;
        }
        else {
            if ((this.lastUnderLiquid) && (this.angle.x<0)) {
                this.gravity=this.core.game.map.gravityMinValue;
                this.movement.y=this.jumpWaterHeight;
                if (this.lastInLiquidIdx!==-1) this.core.game.map.liquidList.liquids[this.lastInLiquidIdx].playSoundOut(this.position);
            }
            
            this.lastUnderLiquid=false;
        }
        
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
        
            // update any UI
            
        if (this.interfaceHealthCount!==null) this.core.game.overlay.updateText(this.interfaceHealthCount,this.health);
        if (this.interfaceArmorCount!==null) this.core.game.overlay.updateText(this.interfaceArmorCount,this.armor);
        
            // dead
            
        if (this.respawnTick!==0) {
            
                // keep falling
                
            this.rotMovement.setFromValues(0,0,0);
            this.moveInMapY(this.rotMovement,gravityFactor,false);
            
                // only recover in multiplayer
                
            if (this.core.game.multiplayerMode!==this.core.game.MULTIPLAYER_MODE_NONE) {
                if (this.core.game.timestamp>this.respawnTick)  this.ready();
            }
            
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
        
            // weapon switching
            
        weapChangeDir=input.mouseWheelRead()+input.getTouchSwipeLeftX();
        
        if (weapChangeDir<0) {
            startWeaponIdx=this.currentCarouselWeaponIdx;
            
            while (true) {
                this.currentCarouselWeaponIdx--;
                if (this.currentCarouselWeaponIdx<0) this.currentCarouselWeaponIdx=this.carouselWeapons.length-1;
                
                if (this.currentCarouselWeaponIdx===startWeaponIdx) break;
                
                if (this.carouselWeapons[this.currentCarouselWeaponIdx].available) {
                    this.showCarouselWeapon();
                    break;
                }
            }
        }

        if (weapChangeDir>0) {
            startWeaponIdx=this.currentCarouselWeaponIdx;
            
            while (true) {
                this.currentCarouselWeaponIdx++;
                if (this.currentCarouselWeaponIdx>(this.carouselWeapons.length-1)) this.currentCarouselWeaponIdx=0;
                
                if (this.currentCarouselWeaponIdx===startWeaponIdx) break;
                
                if (this.carouselWeapons[this.currentCarouselWeaponIdx].available) {
                    this.showCarouselWeapon();
                    break;
                }
            }
        }
        
        for (n=0;n<this.carouselWeapons.length;n++) {
            if (input.isKeyDown(String.fromCharCode(49+n))) {
                if (this.carouselWeapons[n].available) {
                    this.currentCarouselWeaponIdx=n;
                    this.showCarouselWeapon();
                }
            }
        }
        
            // weapon firing
            
        firePrimary=input.mouseButtonFlags[0]||input.isTouchStickRightClick();
        fireSecondary=input.mouseButtonFlags[1];
        fireTertiary=input.mouseButtonFlags[2]||(input.getTouchSwipeRightY()<0);
        
        this.firePosition.setFromPoint(this.position);
        this.firePosition.y+=this.eyeOffset;
        
        if (this.currentCarouselWeaponIdx!==-1) {
            weapon=this.carouselWeapons[this.currentCarouselWeaponIdx];

            if (firePrimary) weapon.firePrimary(this.firePosition,this.angle);
            if (fireSecondary) weapon.fireSecondary(this.firePosition,this.angle);
            if (fireTertiary) weapon.fireTertiary(this.firePosition,this.angle);
        }
        
        for (n=0;n<this.extraWeapons.length;n++) {
            weapon=this.extraWeapons[n];
            if (weapon.available) {
                if (firePrimary) weapon.firePrimary(this.firePosition,this.angle);
                if (fireSecondary) weapon.fireSecondary(this.firePosition,this.angle);
                if (fireTertiary) weapon.fireTertiary(this.firePosition,this.angle);
            }
        }
        
            // forward and shift controls
            
        x=input.getTouchStickLeftX(setup.touchStickLeftXDeadZone,setup.touchStickLeftXAcceleration);
        y=input.getTouchStickLeftY(setup.touchStickLeftYDeadZone,setup.touchStickLeftYAcceleration);
            
        moveForward=(input.isKeyDown('w')) || (input.isKeyDown('ArrowUp')) || (y<0);
        moveBackward=(input.isKeyDown('s')) || (input.isKeyDown('ArrowDown')) || (y>0);
        moveLeft=input.isKeyDown('a') || (x<0);
        moveRight=input.isKeyDown('d') || (x>0);
        
            // turning
            
        turnAdd=0;
            
        x=input.getMouseMoveX();
        if (x!==0) {
            turnAdd=-(x*setup.mouseXSensitivity);
            turnAdd+=(turnAdd*setup.mouseXAcceleration);
            if (setup.mouseXInvert) turnAdd=-turnAdd;
            if (Math.abs(turnAdd)>this.maxTurnSpeed) turnAdd=this.maxTurnSpeed*Math.sign(turnAdd);
        }
        
        x=input.getTouchStickRightX(setup.touchStickRightXDeadZone,setup.touchStickRightXAcceleration);
        turnAdd-=x;
        
        if (turnAdd!==0) {
            this.angle.y+=turnAdd;
            if (this.angle.y<0.0) this.angle.y+=360.0;
            if (this.angle.y>=360.00) this.angle.y-=360.0;
        }
        
            // looking
            
        lookAdd=0;
            
        if (this.core.game.camera.isFirstPerson()) {
            y=input.getMouseMoveY();
            if (y!==0) {
                lookAdd=y*setup.mouseYSensitivity;
                lookAdd+=(lookAdd*setup.mouseYAcceleration);
                if (setup.mouseYInvert) lookAdd=-lookAdd;
                if (Math.abs(lookAdd)>this.maxLookSpeed) lookAdd=this.maxLookSpeed*Math.sign(lookAdd);
            }

            y=input.getTouchStickRightY(setup.touchStickRightYDeadZone,setup.touchStickRightYAcceleration);
            lookAdd+=y;

            if ((setup.snapLook) && (moveForward || moveBackward || moveLeft || moveRight)) {
                if (lookAdd===0) {
                    this.angle.x=this.angle.x*0.95;
                    if (Math.abs(this.angle.x)<0.05) this.angle.x=0;
                }
            }
        
            if (lookAdd!==0) {
                this.angle.x+=lookAdd;
                if (this.angle.x<-this.maxLookAngle) this.angle.x=-this.maxLookAngle;
                if (this.angle.x>=this.maxLookAngle) this.angle.x=this.maxLookAngle;
            }
        }
        else {
            this.angle.x=0;
        }
        
            // jumping
           
        if (input.isKeyDown(' ')) {
            if ((this.standOnMeshIdx!==-1) && (!this.lastUnderLiquid)) {
                this.gravity=this.core.game.map.gravityMinValue;
                this.movement.y=this.jumpHeight;
            }
        }
        
            // can only bump if we aren't falling
            // as otherwise ledges can catch you and
            // bump you back up, the only exception is
            // swimming, which always bumps over small obstacles
            
        bump=(this.standOnMeshIdx!==-1)||(this.lastUnderLiquid);
        
            // move
         
        if (this.lastUnderLiquid) {
            this.movement.moveZWithAcceleration(moveForward,moveBackward,this.swimAcceleration,this.swimDeceleration,this.swimMaxSpeed,this.swimAcceleration,this.swimDeceleration,this.swimMaxSpeed);
        }
        else {
            this.movement.moveZWithAcceleration(moveForward,moveBackward,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed,this.backwardAcceleration,this.backwardDeceleration,this.backwardMaxSpeed);
        }

        this.movement.moveXWithAcceleration(moveLeft,moveRight,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed);
        
        this.rotMovement.setFromPoint(this.movement);
        if (this.lastUnderLiquid) {
            this.rotMovement.y=0;       // only Y movement comes from X angle rotation
            this.rotMovement.rotateX(null,this.angle.x);     // if flying or swimming, add in the X rotation
        }
        this.rotMovement.rotateY(null,this.angle.y);

        this.movement.y=this.moveInMapY(this.rotMovement,gravityFactor,false);
        this.moveInMapXZ(this.rotMovement,bump,true);
        
            // current animation
            
        this.setCurrentAnimation();
        
            // any cube actions
            
        cube=this.core.game.map.cubeList.findCubeContainingEntity(this);
        if (cube!==null) this.runActions(this,cube.actions);
    }
    
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromValues(0,this.angle.y,0);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(!this.core.game.camera.isFirstPerson());
    }
}

