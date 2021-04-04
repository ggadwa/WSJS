import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import EntityClass from '../game/entity.js';

export default class EntityFPSPlayerClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.isPlayer=true;
        
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
        
        this.carouselWeapons=[];
        this.grenadeWeapon=null;
        
        this.currentCarouselWeaponIdx=0;
        this.gotoCarouselWeaponIdx=0;
        this.defaultCarouselWeaponIdx=0;
        this.weaponLowerFinishTick=-1;
        this.weaponRaiseFinishTick=-1;
        this.weaponClipFinishTick=-1;
        
        this.forceAnimationUpdate=false;
        this.currentIdleAnimation=null;
        this.currentRunAnimation=null;
        
        this.respawnTick=0;
        this.telefragTriggerEntity=null;
        
            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        this.firePosition=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,0,0);
        
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
        
        //this.pistolWeapon=this.addEntity('weapon_bowling_ball','weapon_bowling_ball',new PointClass(0,0,0),new PointClass(0,0,0),null,this,this,true);
        //this.m16Weapon=this.addEntity('weapon_bowling_ball','weapon_bowling_ball',new PointClass(0,0,0),new PointClass(0,0,0),null,this,this,true);
        //this.grenadeWeapon=this.addEntity('weapon_bowling_ball','weapon_bowling_ball',new PointClass(0,0,0),new PointClass(0,0,0),null,this,this,true);
        
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
                this.grenadeWeapon=weaponEntity;
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

        this.grenadeWeapon.release();
    }
    
        //
        // player ready
        //
        
    ready()
    {
        let n;
        
        super.ready();
        
            // set the camera
            
        if (!this.isThirdPerson) {
            this.cameraGotoFirstPerson();
        }
        else {
            this.cameraGotoThirdPerson(this.thirdPersonCameraDistance,this.thirdPersonCameraAngle);
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
            
        for (n=0;n!==this.carouselWeapons.length;n++) {
            this.carouselWeapons[n].ready();
        }
        
        this.grenadeWeapon.ready();
        
        this.setCarouselWeaponDefault();

            // start with the idle animation
            
        this.inStandingAnimation=true;
        this.setCurrentAnimation();
        
            // move to random spawn node
            // if multiplayer, if no nodes
            // yet, just leave spawned at 0,0,0
            
        this.telefragTriggerEntity=null;
        if ((this.core.game.multiplayerMode!==this.core.game.MULTIPLAYER_MODE_NONE) && (this.core.game.map.path.spawnNodes.length!==0)) this.moveToRandomSpawnNode(false);
        
            // turn off any score display
            
        this.multiplayerShowScores(false);
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
        
        if (this.grenadeWeapon.name===weaponName) return(this.grenadeWeapon);

        console.log('Unknown weapon: '+weaponName);
        return(null);
    }
    
    hasWeapon(weaponName)
    {
        let n;
        
        for (n=0;n!==this.carouselWeapons.length;n++) {
            if (this.carouselWeapons[n].name===weaponName) return(this.carouselWeapons[n].available);
        }
        
        return(false);
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
                this.startCarouselWeaponSwitch(n);
                break;
            }
        }
    }
    
    addClip(weaponName,count)
    {
        let weapon=this.findWeaponByName(weaponName);
        if (weapon!==null) weapon.addClip(count);
    }
    
    addAmmo(weaponName,count)
    {
        let weapon=this.findWeaponByName(weaponName);
        if (weapon!==null) weapon.addAmmo(count);
    }
    
    addHealth(count)
    {
        if (this.interfaceHealthIcon!==null) this.pulseElement(this.interfaceHealthIcon,500,10);
        
        this.health+=count;
        if (this.health>this.healthMaxCount) this.health=this.healthMaxCount;
    }
    
    addArmor(count)
    {
        if (this.interfaceArmorIcon!==null) this.pulseElement(this.interfaceArmorIcon,500,10);
        
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
        
        if (this.isTopDownCameraOnDeath) this.cameraGotoTopDown(this.topDownCameraDistance);

        this.playSound(this.dieSound);
        this.startAnimation(this.dieAnimation);
        this.queueAnimationStop();
        
        this.multiplayerAddScore(fromEntity,this,isTelefrag);
        this.multiplayerShowScores(true);
        
        if (this.core.game.multiplayerMode===this.core.game.MULTIPLAYER_MODE_NONE) this.core.game.lost(this);
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
                this.hitFlashRight(this.hitIndicatorFlashTick);
            }
            else {
                if ((y>=45) && (y<=135)) {
                    this.hitFlashLeft(this.hitIndicatorFlashTick);
                }
                else {
                    if ((y>-45) && (y<45)) {
                        this.hitFlashTop(this.hitIndicatorFlashTick);
                    }
                    else {
                        this.hitFlashBottom(this.hitIndicatorFlashTick);
                    }
                }
            }
        }
        
            // apply the damage
            
        this.armor-=damage;
        if (this.armor<0) {
            if (this.interfaceHealthIcon!==null) this.pulseElement(this.interfaceHealthIcon,500,5);
            this.health+=this.armor;
            this.armor=0;
        }
        else {
            if (this.interfaceArmorIcon!==null) this.pulseElement(this.interfaceArmorIcon,500,5);
        }
        
            // dead?
        
        if (this.health<=0) {
            this.die(fromEntity,false);
            return;
        }
        
            // hurt sound
            
        if (this.core.game.timestamp>this.nextDamageTick) {
            this.nextDamageTick=this.core.game.timestamp+this.damageFlinchWaitTick;
            this.playSound(this.hurtSound);
        }
    }
    
    telefrag(fromEntity)
    {
        this.telefragTriggerEntity=fromEntity;
    }
    
        //
        // animation utilities
        //
        
    setCurrentAnimation()
    {
        if ((this.movement.x!==0) || (this.movement.z!==0)) {
            if ((this.inStandingAnimation) || (this.forceAnimationUpdate)) {
                this.startAnimation(this.currentRunAnimation);
            }
            this.inStandingAnimation=false;
        }
        else {
            if ((!this.inStandingAnimation) || (this.forceAnimationUpdate)) {
                this.startAnimation(this.currentIdleAnimation);
            }
            this.inStandingAnimation=true;
        }
        
        this.forceAnimationUpdate=false;        
    }

        //
        // weapons
        //
        
    setCarouselWeaponDefault()
    {
        let n,weaponEntity,meshName;
        
        this.currentCarouselWeaponIdx=this.defaultCarouselWeaponIdx;
        this.weaponLowerFinishTick=-1;
        this.weaponRaiseFinishTick=-1;
        this.weaponClipFinishTick=-1;
        
            // show hide weapons

        for (n=0;n!==this.carouselWeapons.length;n++) {
            weaponEntity=this.carouselWeapons[n];
            
            if (n===this.currentCarouselWeaponIdx) {
                weaponEntity.show=true;
                
                this.forceAnimationUpdate=true;
                this.currentIdleAnimation=weaponEntity.parentIdleAnimation;
                this.currentRunAnimation=weaponEntity.parentRunAnimation;
                
                for (meshName of this.json.weapons[n].meshes) {
                    this.showMesh(meshName,true);
                }
                
                weaponEntity.startIdleAnimation();
            }
            else {
                weaponEntity.show=false;
                
                for (meshName of this.json.weapons[n].meshes) {
                    this.showMesh(meshName,false);
                }
            }
        }
    }
        
    startCarouselWeaponSwitch(weaponIdx)
    {
        let weaponEntity;
        
        this.gotoCarouselWeaponIdx=weaponIdx;
        
            // lower current weapon
        
        if (this.currentCarouselWeaponIdx!==-1) {
            weaponEntity=this.carouselWeapons[this.currentCarouselWeaponIdx];
            this.weaponLowerFinishTick=this.core.game.timestamp+weaponEntity.runLowerAnimation();
        }
        else {
            swapCarouselWeaponSwitch();
        }
    }
    
    swapCarouselWeaponSwitch()
    {
        let meshName,weaponEntity;
        
            // hide the current weapon
        
        if (this.currentCarouselWeaponIdx!==-1) {
            weaponEntity=this.carouselWeapons[this.currentCarouselWeaponIdx];
            
            weaponEntity.show=false;
                
            for (meshName of this.json.weapons[this.currentCarouselWeaponIdx].meshes) {
                this.showMesh(meshName,false);
            }
        }
        
        this.weaponLowerFinishTick=-1;
        
            // start the raise
            
        this.currentCarouselWeaponIdx=this.gotoCarouselWeaponIdx;
        weaponEntity=this.carouselWeapons[this.currentCarouselWeaponIdx];
                
        weaponEntity.show=true;

        this.forceAnimationUpdate=true;
        this.currentIdleAnimation=weaponEntity.parentIdleAnimation;
        this.currentRunAnimation=weaponEntity.parentRunAnimation;

        for (meshName of this.json.weapons[this.currentCarouselWeaponIdx].meshes) {
            this.showMesh(meshName,true);
        }

        this.weaponRaiseFinishTick=this.core.game.timestamp+weaponEntity.runRaiseAnimation();
    }
    
    endCarouselWeaponSwitch()
    {
        this.weaponRaiseFinishTick=-1;
    }
    
    runWeaponAnimations()
    {
        let weaponCarouselFreeze=false;
        
        if (this.weaponLowerFinishTick!==-1) {
            if (this.weaponLowerFinishTick<=this.core.game.timestamp) {
                this.swapCarouselWeaponSwitch();
            }
            weaponCarouselFreeze=true;
        }
        
        if (this.weaponRaiseFinishTick!==-1) {
            if (this.weaponRaiseFinishTick<=this.core.game.timestamp) {
                this.endCarouselWeaponSwitch();
            }
            else {
                weaponCarouselFreeze=true;
            }
        }

        if (this.weaponClipFinishTick!==-1) {
            if (this.weaponClipFinishTick<=this.core.game.timestamp) {
                this.weaponClipFinishTick=-1;
            }
            else {
                weaponCarouselFreeze=true;
            }
        }

        return(weaponCarouselFreeze);
    }
    
    runWeaponCarouselInput()
    {
        let n;
        let switchWeaponIdx,weapChangeDir,startWeaponIdx;
        
        switchWeaponIdx=this.currentCarouselWeaponIdx;
        weapChangeDir=this.mouseWheelRead()+this.getTouchSwipeLeftX();

        if (weapChangeDir<0) {
            startWeaponIdx=switchWeaponIdx;

            while (true) {
                switchWeaponIdx--;
                if (switchWeaponIdx<0) switchWeaponIdx=this.carouselWeapons.length-1;
                if (switchWeaponIdx===startWeaponIdx) break;

                if (this.carouselWeapons[switchWeaponIdx].available) break;
            }
        }

        if (weapChangeDir>0) {
            startWeaponIdx=switchWeaponIdx;

            while (true) {
                switchWeaponIdx++;
                if (switchWeaponIdx>(this.carouselWeapons.length-1)) switchWeaponIdx=0;
                if (switchWeaponIdx===startWeaponIdx) break;

                if (this.carouselWeapons[switchWeaponIdx].available) break;
            }
        }

        for (n=0;n<this.carouselWeapons.length;n++) {
            if (this.isKeyDown(String.fromCharCode(49+n))) {
                if (this.carouselWeapons[n].available) {
                    switchWeaponIdx=n;
                    break;
                }
            }
        }

        if (this.currentCarouselWeaponIdx!==switchWeaponIdx) {
            this.startCarouselWeaponSwitch(switchWeaponIdx);
        }
    }
    
    runWeaponFiring()
    {
        let n,weapon;
        let fireCarouselWeapon,fireGrenade;
        
        fireCarouselWeapon=this.isMouseButtonDown(0)||this.isTouchStickRightClick();
        fireGrenade=this.isMouseButtonDown(2)||(this.getTouchSwipeRightY()<0);

        if ((!fireCarouselWeapon) && (!fireGrenade)) return;
        
        this.firePosition.setFromPoint(this.position);
        this.firePosition.y+=this.eyeOffset;
        
            // which weapon to fire
            
        weapon=null;
        
        if (fireCarouselWeapon) {
            weapon=this.carouselWeapons[this.currentCarouselWeaponIdx];
        }
        else {
            weapon=this.grenadeWeapon;
        }
        
        if (!weapon.available) return;
            
            // fire wait

        if (weapon.isFirePaused()) return;

            // check for clip reload

        if (weapon.needClipChange()) {
            this.weaponClipFinishTick=this.core.game.timestamp+weapon.changeClip(this.position);
            return;
        }

            // fire

        weapon.fire(this.firePosition,this.angle);
    }
    
        //
        // run
        //
    
    run()
    {
        let x,y;
        let moveForward,moveBackward,moveLeft,moveRight;
        let liquid,liquidIdx,bump,gravityFactor,fallDist;
        let turnAdd,lookAdd;
        let setup=this.core.setup;
        
        super.run();
        
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
            
        if (this.interfaceHealthCount!==null) this.updateText(this.interfaceHealthCount,this.health);
        if (this.interfaceArmorCount!==null) this.updateText(this.interfaceArmorCount,this.armor);
        
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
        
            // weapons
            
        if (!this.runWeaponAnimations()) {
            this.runWeaponCarouselInput();
            this.runWeaponFiring();
        }
        
            // forward and shift controls
            
        x=this.getTouchStickLeftX();
        y=this.getTouchStickLeftY();
            
        moveForward=(this.isKeyDown('w')) || (this.isKeyDown('ArrowUp')) || (y<0);
        moveBackward=(this.isKeyDown('s')) || (this.isKeyDown('ArrowDown')) || (y>0);
        moveLeft=this.isKeyDown('a') || (x<0);
        moveRight=this.isKeyDown('d') || (x>0);
        
            // turning
            
        turnAdd=0;
            
        x=this.getMouseMoveX();
        if (x!==0) {
            turnAdd=-(x*setup.mouseXSensitivity);
            turnAdd+=(turnAdd*setup.mouseXAcceleration);
            if (setup.mouseXInvert) turnAdd=-turnAdd;
            if (Math.abs(turnAdd)>this.maxTurnSpeed) turnAdd=this.maxTurnSpeed*Math.sign(turnAdd);
        }
        
        x=this.getTouchStickRightX();
        turnAdd-=x;
        
        if (turnAdd!==0) {
            this.angle.y+=turnAdd;
            if (this.angle.y<0.0) this.angle.y+=360.0;
            if (this.angle.y>=360.00) this.angle.y-=360.0;
        }
        
            // looking
            
        lookAdd=0;
            
        if (this.cameraIsFirstPerson()) {
            y=this.getMouseMoveY();
            if (y!==0) {
                lookAdd=y*setup.mouseYSensitivity;
                lookAdd+=(lookAdd*setup.mouseYAcceleration);
                if (setup.mouseYInvert) lookAdd=-lookAdd;
                if (Math.abs(lookAdd)>this.maxLookSpeed) lookAdd=this.maxLookSpeed*Math.sign(lookAdd);
            }

            y=this.getTouchStickRightY();
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
           
        if (this.isKeyDown(' ')) {
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
        
        if (this.currentCarouselWeaponIdx!==-1) {
            if ((this.weaponLowerFinishTick===-1) && (this.weaponRaiseFinishTick===-1) && (this.weaponClipFinishTick===-1)) {
                this.carouselWeapons[this.currentCarouselWeaponIdx].setIdleAnimation();
            }
        }
    }
    
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.drawAngle.setFromValues(0,this.angle.y,0);
        this.setModelDrawAttributes(this.position,this.drawAngle,this.scale,false);

        if (this.cameraIsFirstPerson()) return(false);
        return(this.boundBoxInFrustum());
    }
}

