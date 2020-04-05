import PointClass from '../utility/point.js';
import EntityClass from '../project/entity.js';

class EntityWeaponFireClass
{
    constructor(core,weapon,fireObj)
    {
        this.core=core;
        this.weapon=weapon;
        
        this.ammo=0;
        this.ammoInitialCount=this.core.game.lookupValue(fireObj.ammoInitialCount,weapon.data,0);
        this.ammoMaxCount=this.core.game.lookupValue(fireObj.ammoMaxCount,weapon.data,0);
        this.ammoRegenerateTick=this.core.game.lookupValue(fireObj.ammoRegenerateTick,weapon.data,-1);
        
        this.interfaceAmmoIcon=this.core.game.lookupValue(fireObj.interfaceAmmoIcon,weapon.data,null);
        this.interfaceAmmoText=this.core.game.lookupValue(fireObj.interfaceAmmoText,weapon.data,null);
        this.interfaceAmmoCount=this.core.game.lookupValue(fireObj.interfaceAmmoCount,weapon.data,null);
                
        this.type=weapon.FIRE_TYPE_LIST.indexOf(this.core.game.lookupValue(fireObj.type,weapon.data,null));
        this.waitTick=this.core.game.lookupValue(fireObj.waitTick,weapon.data,0);
        this.startRadius=this.core.game.lookupValue(fireObj.startRadius,weapon.data,0);
        
        this.damage=this.core.game.lookupValue(fireObj.damage,weapon.data,0);
        this.distance=this.core.game.lookupValue(fireObj.distance,weapon.data,0);
        this.hitEffect=this.core.game.lookupValue(fireObj.hitEffect,weapon.data,null);
        
        this.projectileJson=this.core.game.lookupValue(fireObj.projectileJson,weapon.data,null);
        
        this.animation=this.core.game.lookupAnimationValue(fireObj.animation);
        this.sound=this.core.game.lookupSoundValue(fireObj.sound);
       
        this.lastFireTimestamp=0;
        this.lastRegenerateTimestamp=0;
    }
    
    ready()
    {
        this.ammo=this.ammoInitialCount;
        
        this.lastFireTimestamp=0;
        this.lastRegenerateTimestamp=this.core.timestamp+this.ammoRegenerateTick;
    }
    
    addAmmo(count)
    {
        if ((this.interfaceAmmoIcon!==null) && (this.weapon.heldBy===this.core.map.entityList.getPlayer())) this.core.interface.pulseElement(this.interfaceAmmoIcon,500,10);
        
        this.ammo+=count;
        if (this.ammo>this.ammoMaxCount) this.ammo=this.ammoMaxCount;
    }
    
    updateUI()
    {
        if (this.interfaceAmmoText!==null) this.core.interface.updateText(this.interfaceAmmoText,this.ammo);
        if (this.interfaceAmmoCount!==null) this.core.interface.setCount(this.interfaceAmmoCount,this.ammo);
    }
    
    resetRegenerateAmmo()
    {
        this.lastRegenerateTimestamp=this.core.timestamp+this.ammoRegenerateTick;
    }
    
    regenerateAmmo()
    {
        if (this.ammoRegenerateTick!==-1) {
            if (this.core.timestamp>this.lastRegenerateTimestamp) {
                this.lastRegenerateTimestamp=this.core.timestamp+this.ammoRegenerateTick;
                this.addAmmo(1);
            }
        }
    }
}

export default class EntityWeaponClass extends EntityClass
{
    constructor(core,name,json,position,angle,data)
    {
        super(core,name,json,position,angle,data);
        
        this.FIRE_TYPE_HIT_SCAN=0;
        this.FIRE_TYPE_PROJECTILE=1;
        
        this.FIRE_TYPE_LIST=['hit_scan','projectile'];
        
        this.idleAnimation=null;
        
        this.interfaceCrosshair=null;
        
        this.primary=null;
        this.secondary=null;
        this.tertiary=null;
        
        this.initiallyAvailable=false;
        this.available=false;
        this.fireYSlop=0;
        
        this.lastFireTimestamp=0;
        
            // pre-allocates
            
        this.handOffset=new PointClass(0,0,0);
        this.handAngle=new PointClass(0,0,0);
        
        this.firePoint=new PointClass(0,0,0);
        this.fireVector=new PointClass(0,0,0);
        this.fireHitPoint=new PointClass(0,0,0);
    }

    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.idleAnimation=this.json.config.idleAnimation;
        
        this.interfaceCrosshair=this.core.game.lookupValue(this.json.config.interfaceCrosshair,this.data);
       
            // model setup, skip if no model
            
        if (this.model!==null) {
            this.handOffset=new PointClass(this.json.config.handOffset.x,this.json.config.handOffset.y,this.json.config.handOffset.z);
            this.handAngle=new PointClass(this.json.config.handAngle.x,this.json.config.handAngle.y,this.json.config.handAngle.z);

            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
        }
        
            // fire setup
            
        if (this.json.config.primary!==null) this.primary=new EntityWeaponFireClass(this.core,this,this.json.config.primary);
        if (this.json.config.secondary!==null) this.secondary=new EntityWeaponFireClass(this.core,this,this.json.config.secondary);
        if (this.json.config.tertiary!==null) this.tertiary=new EntityWeaponFireClass(this.core,this,this.json.config.tertiary);
        
            // some items added to entity so fire methods
            // can have access to parent animations
            
        this.parentIdleAnimation=null;
        this.parentRunAnimation=null; 
        this.parentFireIdleAnimation=null;
        this.parentPrimaryFireRunAnimation=null;
        this.parentSecondaryFireRunAnimation=null;
        this.parentTertiaryFireRunAnimation=null;
        
        return(true);    
    }
    
    ready()
    {
        super.ready();
        
        this.available=this.initiallyAvailable;
        
        if (this.primary!==null) this.primary.ready();
        if (this.secondary!==null) this.secondary.ready();
        if (this.tertiary!==null) this.tertiary.ready();
    }
    
        //
        // ammo
        //
        
    addAmmo(fireMethod,count)
    {
        switch (fireMethod) {
            case 'primary':
                if (this.primary!==null) this.primary.addAmmo(count);
                break;
            case 'secondary':
                if (this.secondary!==null) this.secondary.addAmmo(count);
                break;
            case 'tertiary':
                if (this.tertiary!==null) this.tertiary.addAmmo(count);
                break;
        }
    }
    
        //
        // hit scans
        //
        
    hitScan(parentEntity,fire)
    {
        let y;
        
            // the hit scan, firing point is the eye
            // and we rotate with the look and then turn
          
        this.firePoint.setFromPoint(parentEntity.position);
        this.firePoint.y+=parentEntity.eyeOffset;
        
        this.fireVector.setFromValues(0,0,fire.distance);
        this.fireVector.rotateX(null,parentEntity.angle.x);
        
        y=parentEntity.angle.y;
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
        
    projectile(parentEntity,fire)
    {
        let y,projEntity;
        
            // fire position
            
        this.firePoint.setFromValues(0,0,fire.startRadius);

        this.firePoint.rotateX(null,parentEntity.angle.x);
        
        y=parentEntity.angle.y;
        if (this.fireYSlop!==0) {
            y+=(this.fireYSlop-(Math.random()*(this.fireYSlop*2)));
            if (y<0) y=360+y;
            if (y>360) y-=360;
        }
        this.firePoint.rotateY(null,y);

        this.firePoint.addPoint(parentEntity.position);
        this.firePoint.y+=parentEntity.eyeOffset;
        
            // spawn from whatever is holding this weapon
            // so it counts as the spawnBy for any damage calculations, etc

        projEntity=this.addEntity(parentEntity,fire.projectileJson,('projectile_'+this.name),this.firePoint,parentEntity.angle,null,true,false);
        if (projEntity!==null) projEntity.ready();
    }
    
        //
        // fire for type
        //
        
    fireForType(parentEntity,fire,fireAnimation)
    {
        if (fire.ammo===0) return;
        
        if ((fire.lastFireTimestamp+fire.waitTick)>this.core.timestamp) return;
        fire.lastFireTimestamp=this.core.timestamp;
        
            // fire
            
        fire.ammo--;
        fire.resetRegenerateAmmo();
        
        fire.core.soundList.playJson(parentEntity.position,fire.sound);
           
           // weapon animation
           
        if (this.model!==null) {
            if (fireAnimation!==null) this.modelEntityAlter.startAnimationChunkInFrames(null,30,fire.animation[0],fire.animation[1]);
            if (this.idleAnimation!==null) this.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
        }
        
            // parent animation
            
        if (parentEntity.model!==null) {
            if (!parentEntity.modelEntityAlter.isAnimationQueued()) {   // don't do this if we have a queue, which means another fire is still going on
                if ((parentEntity.movement.x!==0) || (parentEntity.movement.z!==0)) {
                    if (fireAnimation!==null) parentEntity.modelEntityAlter.interuptAnimationChunkInFrames(null,30,fireAnimation[0],fireAnimation[1]);
                }
                else {
                    if (this.parentFireIdleAnimation!==null) parentEntity.modelEntityAlter.interuptAnimationChunkInFrames(null,30,this.parentFireIdleAnimation[0],this.parentFireIdleAnimation[1]);
                }
            }
        }
        
            // and the fire method
            
        switch (fire.type) {
            case this.FIRE_TYPE_HIT_SCAN:
                this.hitScan(parentEntity,fire);
                return;
            case this.FIRE_TYPE_PROJECTILE:
                this.projectile(parentEntity,fire);
                return;
        }
    }
    
        //
        // firing
        //
        
    firePrimary()
    {
        if (this.primary!==null) this.fireForType(this.heldBy,this.primary,this.parentPrimaryFireRunAnimation);
    }
    
    fireSecondary()
    {
        if (this.secondary!==null) this.fireForType(this.heldBy,this.secondary,this.parentSecondaryFireRunAnimation);
    }
    
    fireTertiary()
    {
        if (this.tertiary!==null) this.fireForType(this.heldBy,this.tertiary,this.parentTertiaryFireRunAnimation);
    }
    
        //
        // main run
        //
        
    run()
    {
        let parentEntity=this.heldBy;
      
        super.run();
        
            // do any ammo regen
            
        if (this.primary!==null) this.primary.regenerateAmmo();
        if (this.secondary!==null) this.secondary.regenerateAmmo();
        if (this.tertiary!==null) this.tertiary.regenerateAmmo();
        
            // update any UI if player
            
        if (parentEntity===this.core.map.entityList.getPlayer()) {
            if (this.interfaceCrosshair!==null) this.core.interface.showElement(this.interfaceCrosshair,((this.show)&&(this.core.camera.isFirstPerson())));
            if (this.primary!==null) this.primary.updateUI();
            if (this.secondary!==null) this.secondary.updateUI();
            if (this.tertiary!==null) this.tertiary.updateUI();
        }
    }
        
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.handOffset);
        this.modelEntityAlter.angle.setFromPoint(this.handAngle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=true;
        
        return(this.core.camera.isFirstPerson());
    }

}
