import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import ProjectEntityClass from '../project/project_entity.js';

export default class EntityFPSPlayerClass extends ProjectEntityClass
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
        
            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
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
        
        this.interfaceHealthIcon=this.core.game.lookupValue(this.json.config.interfaceHealthIcon,this.data);
        this.interfaceHealthCount=this.core.game.lookupValue(this.json.config.interfaceHealthCount,this.data);
        this.interfaceArmorIcon=this.core.game.lookupValue(this.json.config.interfaceArmorIcon,this.data);
        this.interfaceArmorCount=this.core.game.lookupValue(this.json.config.interfaceArmorCount,this.data);
        
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
        
        this.lastWheelClick=0;

            // setup the weapons
        
        this.defaultCarouselWeaponIdx=-1;
        
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
            weaponEntity.parentFireRunAnimation=weaponBlock.parentFireRunAnimation;
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
                this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.currentRunAnimation[0],this.currentRunAnimation[1]);
            }
            this.inStandingAnimation=false;
        }
        else {
            if ((!this.inStandingAnimation) || (this.forceAnimationUpdate)) {
                this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.currentIdleAnimation[0],this.currentIdleAnimation[1]);
            }
            this.inStandingAnimation=true;
        }
        
        this.forceAnimationUpdate=false;        
    }
    
    ready()
    {
        let n;
        
        super.ready();
        
            // health
            
        this.health=this.healthInitialCount;
        this.armor=this.armorInitialCount;
        
        this.passThrough=false;
        
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
    
    addAmmo(weaponName,value)
    {
        let weapon=this.findWeaponByName(weaponName);
        if (weapon===null) return;
        
        weapon.addAmmo(value);
    }
    
    addHealth(value)
    {
        if (this.interfaceHealthIcon!==null) this.core.interface.pulseElement(this.interfaceHealthIcon,500,10);
        
        this.health+=value;
        if (this.health>this.healthMaxCount) this.health=this.healthMaxCount;
    }
    
    addArmor(value)
    {
        if (this.interfaceArmorIcon!==null) this.core.interface.pulseElement(this.interfaceArmorIcon,500,10);
        
        this.armor+=value;
        if (this.armor>this.armorMaxCount) this.armor=this.armorMaxCount;
    }
    
        //
        // health
        //
        
    damage(fromEntity,damage,hitPoint)
    {
            // already dead, can't take damage
            
        if (this.health<=0) return;
        
            // pulse and take the damage
            
        if (!this.developerNoDamage) {
            this.armor-=damage;
            if (this.armor<0) {
                if (this.interfaceHealthIcon!==null) this.core.interface.pulseElement(this.interfaceHealthIcon,500,5);
                this.health+=this.armor;
                this.armor=0;
            }
            else {
                if (this.interfaceArmorIcon!==null) this.core.interface.pulseElement(this.interfaceArmorIcon,500,5);
            }
        }
        else {
            if (this.interfaceHealthIcon!==null) this.core.interface.pulseElement(this.interfaceHealthIcon,500,5);
        }
        
            // dead?
        
        if (this.health<=0) {
            this.respawnTick=this.core.timestamp+this.respawnWaitTick;
            this.passThrough=true;
            this.core.soundList.playJson(this,null,this.dieSound);
            
            if (this.isMultiplayer()) {
                if (fromEntity!==null) {
                    if (fromEntity!==this) {
                        this.addScore(fromEntity.name,1);
                        this.updateInterfaceTemporaryText('multiplayer_message',(fromEntity.name+' killed '+this.name),5000);
                    }
                    else {
                        this.addScore(fromEntity.name,-1);
                        this.updateInterfaceTemporaryText('multiplayer_message',(this.name+' committed suicide'),5000);
                    }
                }
                this.displayScore(true);
            }
            
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.dieAnimation[0],this.dieAnimation[1]);            
            return;
        }
        
            // hurt sound
            
        if (this.core.timestamp>this.nextDamageTick) {
            this.nextDamageTick=this.core.timestamp+this.damageFlinchWaitTick;
            this.core.soundList.playJson(this,null,this.hurtSound);
        }
    }

        //
        // run
        //
    
    run()
    {
        let n,x,y;
        let moveForward,moveBackward,moveLeft,moveRight;
        let liquidIdx,bump;
        let turnAdd,lookAdd,startWeaponIdx;
        let mouseWheelClick;
        let input=this.core.input;
        let setup=this.core.setup;
        
        super.run();
        
            // update any UI
            
        if (this.interfaceHealthCount!==null) this.core.interface.updateText(this.interfaceHealthCount,this.health);
        if (this.interfaceArmorCount!==null) this.core.interface.updateText(this.interfaceArmorCount,this.armor);
        
            // weapon switching
            
        mouseWheelClick=this.core.input.mouseWheelRead();
        
        if ((mouseWheelClick<0) && (this.lastWheelClick===0)) {
            this.startWeaponIdx=this.currentCarouselWeaponIdx;
            
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

        if ((mouseWheelClick>0) && (this.lastWheelClick===0)) {
            this.startWeaponIdx=this.currentCarouselWeaponIdx;
            
            while (true) {
                this.currentCarouselWeaponIdx++;
                if (this.currentCarouselWeaponIdx>=(this.carouselWeapons.length-1)) this.currentCarouselWeaponIdx=0;
                
                if (this.currentCarouselWeaponIdx===startWeaponIdx) break;
                
                if (this.carouselWeapons[this.currentCarouselWeaponIdx].available) {
                    this.showCarouselWeapon();
                    break;
                }
            }
        }
        
        for (n=0;n<this.carouselWeapons.length;n++) {
            if (this.core.input.isKeyDown(String.fromCharCode(49+n))) {
                if (this.carouselWeapons[n].available) {
                    this.currentCarouselWeaponIdx=n;
                    this.showCarouselWeapon();
                }
            }
        }
        
        this.lastWheelClick=mouseWheelClick;
        
            // weapon firing
            
        this.firePrimary=this.core.input.mouseButtonFlags[0]||this.core.input.isTouchStickRightClick();
        this.fireSecondary=this.core.input.mouseButtonFlags[1];
        this.fireTertiary=this.core.input.mouseButtonFlags[2];
        
            // forward and shift controls
            
        moveForward=(input.isKeyDown('w')) || (input.isKeyDown('ArrowUp')) || (input.getTouchStickLeftY()<0);
        moveBackward=(input.isKeyDown('s')) || (input.isKeyDown('ArrowDown')) || (input.getTouchStickLeftY()>0);
        moveLeft=input.isKeyDown('a') || (input.getTouchStickLeftX()<0);
        moveRight=input.isKeyDown('d') || (input.getTouchStickLeftX()>0);
        
            // turning
            
        turnAdd=0;
            
        x=input.getMouseMoveX();
        if (x!==0) {
            turnAdd=-(x*setup.mouseXSensitivity);
            turnAdd+=(turnAdd*setup.mouseXAcceleration);
            if (setup.mouseXInvert) turnAdd=-turnAdd;
            if (Math.abs(turnAdd)>this.maxTurnSpeed) turnAdd=this.maxTurnSpeed*Math.sign(turnAdd);
        }
        
        turnAdd-=(input.getTouchStickRightX()*(setup.touchStickXSensitivity*20));
        
        if (turnAdd!==0) {
            this.angle.y+=turnAdd;
            if (this.angle.y<0.0) this.angle.y+=360.0;
            if (this.angle.y>=360.00) this.angle.y-=360.0;
        }
        
            // looking
            
        lookAdd=0;
            
        if (this.core.camera.isFirstPerson()) {
            y=input.getMouseMoveY();
            if (y!==0) {
                lookAdd=y*setup.mouseYSensitivity;
                lookAdd+=(lookAdd*setup.mouseYAcceleration);
                if (setup.mouseYInvert) lookAdd=-lookAdd;
                if (Math.abs(lookAdd)>this.maxLookSpeed) lookAdd=this.maxLookSpeed*Math.sign(lookAdd);
            }

            lookAdd+=(input.getTouchStickRightY()*(setup.touchStickYSensitivity*20));

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
        
            // liquid changes
            
        liquidIdx=this.core.map.liquidList.getLiquidForEyePoint(this.position,this.eyeOffset);
        
        if (liquidIdx!==-1) {
            this.lastUnderLiquid=true;
        }
        else {
            if ((this.lastUnderLiquid) && (this.angle.x>0)) {
                this.gravity=0;
                this.movement.y-=this.jumpWaterHeight;
            }
            
            this.lastUnderLiquid=false;
        }
        
        liquidIdx=this.core.map.liquidList.getLiquidForPoint(this.position);
        
        if (liquidIdx!==-1) {
            if ((!this.lastInLiquid) && (this.liquidInSound!==null)) this.core.soundList.playJson(this,null,this.liquidInSound);
            this.lastInLiquid=true;
        }
        else {
            if ((this.lastInLiquid) && (this.liquidOutSound!==null)) this.core.soundList.playJson(this,null,this.liquidOutSound);
            this.lastInLiquid=false;
        }
        
            // jumping
           
        if (input.isKeyDown(' ')) {
            if ((this.standOnMeshIdx!==-1) && (liquidIdx===-1) && (!this.developerPlayerFly)) {
                this.gravity=this.core.map.gravityMinValue;
                this.movement.y=this.jumpHeight;
            }
        }
        
            // can only bump if we aren't falling
            // as otherwise ledges can catch you and
            // bump you back up, the only exception is
            // swimming, which always bumps over small obstacles
            
        bump=(this.standOnMeshIdx!==-1)||(this.lastUnderLiquid);
        
            // figure out the movement
         
        this.movement.moveZWithAcceleration(moveForward,moveBackward,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed);
        this.movement.moveXWithAcceleration(moveLeft,moveRight,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed);
        
        this.rotMovement.setFromPoint(this.movement);
        if ((this.developerPlayerFly) || (this.lastUnderLiquid)) {
            this.rotMovement.y=0;       // only Y movement comes from X angle rotation
            this.rotMovement.rotateX(null,this.angle.x);     // if flying or swimming, add in the X rotation
            this.rotMovement.y*=this.flySwimYReduce;
        }
        this.rotMovement.rotateY(null,this.angle.y);

            // if no clipping is on then
            // just move directly through map
            
        if (this.developerPlayerNoClip) {
            this.position.addPoint(this.rotMovement);
        }

            // move around the map
        
        else {
            this.movement.y=this.moveInMapY(this.rotMovement,this.developerPlayerFly);
            this.moveInMapXZ(this.rotMovement,bump,true);
        }

            // camera swap button
            
        if (this.json.config.multiCamera) {
            if (this.core.input.isKeyDownAndClear('`')) {
                if (this.core.camera.isFirstPerson()) {
                    this.core.camera.gotoThirdPersonBehind(10000,-10);
                }
                else {
                    this.core.camera.gotoFirstPerson();
                }
            }
        }
        
            // current animation
            
        this.setCurrentAnimation();
    }
    
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromValues(0,this.angle.y,0);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(this.core.camera.isThirdPersonBehind());
    }
}

