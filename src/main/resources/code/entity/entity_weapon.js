import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import EntityClass from '../game/entity.js';

export default class EntityWeaponClass extends EntityClass
{
    constructor(core,name,json,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,json,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.FIRE_TYPE_HIT_SCAN=0;
        this.FIRE_TYPE_PROJECTILE=1;
        
        this.FIRE_TYPE_LIST=['hit_scan','projectile'];
        
        this.FIRE_METHOD_ANY=-1;
        this.FIRE_METHOD_PRIMARY=0;
        this.FIRE_METHOD_SECONDARY=1;
        this.FIRE_METHOD_TERTIARY=2;
        
        this.idleAnimation=null;
        this.idleWalkAnimation=null;
        this.raiseAnimation=null;
        this.lowerAnimation=null;
        this.reloadAnimation=null;
        
        this.interfaceCrosshair=null;
        
        this.initiallyAvailable=false;
        this.available=false;
        this.fireYSlop=0;
        
        this.lastFireTimestamp=0;
        
        this.inStandIdle=false;
        
        this.handOffset=new PointClass(0,0,0);
        this.handAngle=new PointClass(0,0,0);
        this.fireOffsetAdd=new PointClass(0,0,0);
        this.fireAngleAdd=new PointClass(0,0,0);
        this.botFireRange=new BoundClass(0,0);
        
        this.parentIdleAnimation=null;
        this.parentRunAnimation=null; 
        this.parentFireIdleAnimation=null;
        this.parentFireRunAnimation=null;
        this.parentFireFreezeMovement=false;
        
        this.usesClips=this.core.game.lookupValue(fireObj.usesClips,weapon.data,false);
        this.clipInitialCount=this.core.game.lookupValue(fireObj.clipInitialCount,weapon.data,0);
        this.clipMaxCount=this.core.game.lookupValue(fireObj.clipMaxCount,weapon.data,0);
        this.clipSize=this.core.game.lookupValue(fireObj.clipSize,weapon.data,0);
        this.clipAmmoInitialCount=this.core.game.lookupValue(fireObj.clipAmmoInitialCount,weapon.data,-1);
        this.ammoRegenerateTick=this.core.game.lookupValue(fireObj.ammoRegenerateTick,weapon.data,-1);
        
        this.clipCount=0;
        this.ammoInClipCount=0;
        
        this.interfaceAmmoIcon=this.core.game.lookupValue(fireObj.interfaceAmmoIcon,weapon.data,null);
        this.interfaceAmmoText=this.core.game.lookupValue(fireObj.interfaceAmmoText,weapon.data,null);
        this.interfaceAmmoCount=this.core.game.lookupValue(fireObj.interfaceAmmoCount,weapon.data,null);
        this.interfaceClipIcon=this.core.game.lookupValue(fireObj.interfaceClipIcon,weapon.data,null);
        this.interfaceClipText=this.core.game.lookupValue(fireObj.interfaceClipText,weapon.data,null);
        this.interfaceClipCount=this.core.game.lookupValue(fireObj.interfaceClipCount,weapon.data,null);
                
        this.type=weapon.FIRE_TYPE_LIST.indexOf(this.core.game.lookupValue(fireObj.type,weapon.data,null));
        this.waitTick=this.core.game.lookupValue(fireObj.waitTick,weapon.data,0);
        
        this.damage=this.core.game.lookupValue(fireObj.damage,weapon.data,0);
        this.distance=this.core.game.lookupValue(fireObj.distance,weapon.data,0);
        this.hitEffect=this.core.game.lookupValue(fireObj.hitEffect,weapon.data,null);
        
        this.projectileJson=this.core.game.lookupValue(fireObj.projectileJson,weapon.data,null);
        
        this.animation=this.core.game.lookupAnimationValue(fireObj.animation);
        this.fireSound=this.core.game.lookupSoundValue(fireObj.sounds.fire);
        
        this.lastFireTimestamp=0;
        this.lastRegenerateTimestamp=0;
            
            // pre-allocates
        
        this.firePoint=new PointClass(0,0,0);
        this.fireAng=new PointClass(0,0,0);
        this.fireVector=new PointClass(0,0,0);
        this.fireHitPoint=new PointClass(0,0,0);
    }

    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.animations.idleAnimation);
        this.idleWalkAnimation=this.core.game.lookupAnimationValue(this.json.animations.idleWalkAnimation);
        this.raiseAnimation=this.core.game.lookupAnimationValue(this.json.animations.raiseAnimation);
        this.lowerAnimation=this.core.game.lookupAnimationValue(this.json.animations.lowerAnimation);
        this.reloadAnimation=this.core.game.lookupAnimationValue(this.json.animations.reloadAnimation);
        
        this.reloadSound=this.core.game.lookupSoundValue(this.json.sounds.reloadSound);
        
        this.interfaceCrosshair=this.core.game.lookupValue(this.json.config.interfaceCrosshair,this.data);
       
            // model setup, skip if no model
            
        if (this.model!==null) {
            this.handOffset=new PointClass(this.json.config.handOffset.x,this.json.config.handOffset.y,this.json.config.handOffset.z);
            this.handAngle=new PointClass(this.json.config.handAngle.x,this.json.config.handAngle.y,this.json.config.handAngle.z);
        }
        
            // fire setup
        
        this.fireOffsetAdd=new PointClass(this.json.config.fireOffsetAdd.x,this.json.config.fireOffsetAdd.y,this.json.config.fireOffsetAdd.z);
        this.fireAngleAdd=new PointClass(this.json.config.fireAngleAdd.x,this.json.config.fireAngleAdd.y,this.json.config.fireAngleAdd.z);
                    
            // misc bot setup
            
        this.botFireRange.setFromValues(this.json.config.botFireRange[0],this.json.config.botFireRange[1]);
        
            // some items added to entity so fire methods
            // can have access to parent animations
            
        this.parentIdleAnimation=null;
        this.parentRunAnimation=null; 
        this.parentFireIdleAnimation=null;
        this.parentFireRunAnimation=null;
        this.parentFireFreezeMovement=false;
        
        return(true);    
    }
    
    ready()
    {
        super.ready();
        
        this.available=this.initiallyAvailable;
        
        this.clipCount=this.clipInitialCount;
        this.ammoInClipCount=this.clipAmmoInitialCount;
        
        this.lastFireTimestamp=0;
        this.lastRegenerateTimestamp=this.core.game.timestamp+this.ammoRegenerateTick;
        
        this.inStandIdle=false
        if (this.model!==null) this.queueIdleAnimation();
    }
    
        //
        // ammo
        //
        
    addClip(count)
    {
        if ((this.interfaceClipIcon!==null) && (this.weapon.heldBy===this.core.game.map.entityList.getPlayer())) {
            this.pulseElement(this.interfaceClipIcon,500,10);
        }
        else {      // if no clip icon, flash the ammo icon if one
            if ((this.interfaceAmmoIcon!==null) && (this.weapon.heldBy===this.core.game.map.entityList.getPlayer())) this.pulseElement(this.interfaceAmmoIcon,500,10);
        }
        
        this.clipCount+=count;
        if (this.clipCount>this.clipMaxCount) this.clipCount=this.clipMaxCount;
    }
    
    addAmmo(count)
    {
        if ((this.interfaceAmmoIcon!==null) && (this.weapon.heldBy===this.core.game.map.entityList.getPlayer())) this.pulseElement(this.interfaceAmmoIcon,500,10);
        
        this.ammoInClipCount+=count;
        if (this.ammoInClipCount>this.clipSize) this.ammoInClipCount=this.clipSize;
    }
    
    hasAnyAmmo()
    {
        if (this.clipCount===0) return(false);
        return(this.ammoInClipCount!==0);
    }
    
    updateUI()
    {
        if (this.interfaceClipText!==null) this.updateText(this.interfaceClipText,this.clipCount);
        if (this.interfaceClipCount!==null) this.setCount(this.interfaceClipCount,this.clipCount);
        if (this.interfaceAmmoText!==null) this.updateText(this.interfaceAmmoText,this.ammoInClipCount);
        if (this.interfaceAmmoCount!==null) this.setCount(this.interfaceAmmoCount,this.ammoInClipCount);
    }
    
    resetRegenerateAmmo()
    {
        this.lastRegenerateTimestamp=this.core.game.timestamp+this.ammoRegenerateTick;
    }
    
    regenerateAmmo()
    {
        if (this.ammoRegenerateTick!==-1) {
            if (this.core.game.timestamp>this.lastRegenerateTimestamp) {
                this.lastRegenerateTimestamp=this.core.game.timestamp+this.ammoRegenerateTick;
                this.addAmmo(1);
            }
        }
    }
    
        //
        // animation utilities
        //
        
    queueIdleAnimation()
    {
        if (this.model===null) return;
        
        if (this.heldBy!==null) {
            this.inStandIdle=(this.heldBy.movement.length()===0)||(this.idleWalkAnimation===null);
        }
        
        if (this.inStandIdle) {
            if (this.idleAnimation!==null) this.queueAnimation(this.idleAnimation);
        }
        else {
            this.queueAnimation(this.idleWalkAnimation);    
        }
    }
    
    startIdleAnimation()
    {
        if (this.model===null) return;
        
        this.inStandIdle=true;
        if (this.idleAnimation!==null) this.startAnimation(this.idleAnimation);
    }
    
    setIdleAnimation()
    {
        let nextStandIdle;
        
        if (this.model===null) return;
        
        nextStandIdle=true;
        
        if (this.heldBy!==null) {
            nextStandIdle=(this.heldBy.movement.length()===0)||(this.idleWalkAnimation===null);
        }
        
        if (nextStandIdle===this.inStandIdle) return;
        
        this.inStandIdle=nextStandIdle;
        
        if (this.inStandIdle) {
            if (this.idleAnimation!==null) this.startAnimation(this.idleAnimation);
        }
        else {
            this.startAnimation(this.idleWalkAnimation);    
        }
    }
    
    runLowerAnimation()
    {
        if (this.model===null) return(0);
        
        if (this.lowerAnimation!=null) {
            this.startAnimation(this.lowerAnimation);
            this.queueIdleAnimation();
            return(this.getAnimationTickCount(this.lowerAnimation));
        }
        
        return(0);
    }
    
    runRaiseAnimation()
    {
        if (this.model===null) return;
        
        if (this.raiseAnimation!=null) {
            this.startAnimation(this.raiseAnimation);
            this.queueIdleAnimation();
            return(this.getAnimationTickCount(this.raiseAnimation));
        }
        
        return(0);
    }
    
    runReloadAnimation()
    {
        if (this.model===null) return;
        
        if (this.reloadAnimation!=null) {
            this.startAnimation(this.reloadAnimation);
            this.queueIdleAnimation();
            return(this.getAnimationTickCount(this.reloadAnimation));
        }
        
        return(0);
    }
    
        //
        // hit scans
        //
        
    hitScan(parentEntity,fire,firePosition,fireAngle)
    {
        let y;
        
            // the hit scan
          
        this.firePoint.setFromPoint(firePosition);
        this.fireAng.setFromAddPoint(fireAngle,this.fireAngleAdd);
        
        this.fireVector.setFromValues(0,0,fire.distance);
        this.fireVector.rotateX(null,this.fireAng.x);
        
        y=this.fireAng.y;
        if (this.fireYSlop!==0) {
            y+=(this.fireYSlop-(Math.random()*(this.fireYSlop*2)));
            if (y<0) y=360+y;
            if (y>360) y-=360;
        }
        this.fireVector.rotateY(null,y);
        
        if (parentEntity.rayCollision(this.firePoint,this.fireVector,this.fireHitPoint)) {
            
                // is this an entity we can hit?
                
            if (parentEntity.hitEntity) {
                if (parentEntity.hitEntity.damage!==undefined) {
                    parentEntity.hitEntity.damage(parentEntity,fire.damage,this.fireHitPoint);
                }
            }
            
                // hit effect
                // push effect point towards entity firing so it shows up better

            if (fire.hitEffect!==null) {
                this.fireVector.normalize();
                this.fireVector.scale(-100);
                this.fireHitPoint.addPoint(this.fireVector);
                this.addEffect(this,fire.hitEffect,this.fireHitPoint,null,true);
            }
        }
    }
    
        //
        // projectiles
        //
        
    projectile(parentEntity,fire,firePosition,fireAngle)
    {
        let y,projEntity;
        
            // fire position
            
        this.firePoint.setFromPoint(this.fireOffsetAdd);
        this.fireAng.setFromAddPoint(fireAngle,this.fireAngleAdd);
        
        this.firePoint.rotateX(null,this.fireAng.x);
        
        y=this.fireAng.y;
        if (this.fireYSlop!==0) {
            y+=(this.fireYSlop-(Math.random()*(this.fireYSlop*2)));
            if (y<0) y=360+y;
            if (y>360) y-=360;
        }
        this.firePoint.rotateY(null,y);

        this.firePoint.addPoint(firePosition);
        
            // spawn from whatever is holding this weapon
            // so it counts as the spawnBy for any damage calculations, etc

        projEntity=this.addEntity(fire.projectileJson,('projectile_'+this.name),this.firePoint,this.fireAng,null,parentEntity,null,true);
        if (projEntity!==null) projEntity.ready();
    }
    
        //
        // firing
        //
        
    isFirePaused()
    {
        return((this.lastFireTimestamp+this.waitTick)>this.core.game.timestamp);
    }
    
    fireForType(parentEntity,fire,fireAnimation,fireAnimationFreezeMovement,firePosition,fireAngle)
    {
    }
    
    fire(firePosition,fireAngle)
    {
        if (this.ammoInClipCount===0) return(false);
        
        
            this.fireForType(this.heldBy,this.primary,this.parentPrimaryFireRunAnimation,this.parentPrimaryFireFreezeMovement,firePosition,fireAngle);
            
            
        if ((this.lastFireTimestamp+this.waitTick)>this.core.game.timestamp) return;
        this.lastFireTimestamp=this.core.game.timestamp;
        
            // fire
            
        this.ammoInClipCount--;
        this.resetRegenerateAmmo();
        
        this.playSoundAtPosition(firePosition,this.fireSound);
           
           // weapon animation
           
        if (this.model!==null) {
            if (this.parentFireRunAnimation!==null) this.startAnimation(this.parentFireRunAnimation);
            this.queueIdleAnimation();
        }
        
            // parent animation
            
        if (parentEntity.model!==null) {
            if (!parentEntity.isAnimationQueued()) {   // don't do this if we have a queue, which means another fire is still going on
                if ((parentEntity.movement.x!==0) || (parentEntity.movement.z!==0)) {
                    if (this.fireAnimation!==null) {
                        parentEntity.interuptAnimation(this.parentFireRunAnimation);
                        if ((this.parentFireFreezeMovement) && (parentEntity.movementFreezeTick!==undefined)) {
                            parentEntity.movementFreezeTick=this.core.game.timestamp+parentEntity.getAnimationTickCount(this.parentFireRunAnimation);
                        }
                    }
                }
                else {
                    if (this.parentFireIdleAnimation!==null) parentEntity.interuptAnimation(this.parentFireIdleAnimation);
                }
            }
        }
        
            // and the fire method
            
        switch (this.fireType) {
            case this.FIRE_TYPE_HIT_SCAN:
                this.hitScan(parentEntity,fire,firePosition,fireAngle);
                return;
            case this.FIRE_TYPE_PROJECTILE:
                this.projectile(parentEntity,fire,firePosition,fireAngle);
                return;
        }



        return(true);
    }
    
        //
        // clip changes
        //
     
    needClipChange()
    {
        if (!this.usesClips) return(false);
        if (this.clipCount===0) return(false);
        return(this.ammoInClipCount===0);
    }
    
    changeClip(position)
    {
            // update the clip
            
        this.clipCount--;
        this.ammoInClipCount=this.clipSize;
        
            // play sound and animation
            
        this.playSoundAtPosition(position,this.reloadSound);
        return(this.runReloadAnimation());
    }
    
        //
        // main run
        //
        
    run()
    {
        let parentEntity=this.heldBy;
      
        super.run();
        
            // do any ammo regen
            
        this.regenerateAmmo();
        
            // update any UI if player
            
        if (parentEntity===this.core.game.map.entityList.getPlayer()) {
            if (this.interfaceCrosshair!==null) this.showElement(this.interfaceCrosshair,((this.show)&&(this.cameraIsFirstPerson())));
            this.updateUI();
        }
    }
        
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.setModelDrawAttributes(this.handOffset,this.handAngle,this.scale,true);
        
        return(this.cameraIsFirstPerson());
    }

}
