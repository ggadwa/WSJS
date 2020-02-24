import PointClass from '../utility/point.js';
import ProjectEntityClass from '../project/project_entity.js';

export default class EntityWeaponClass extends ProjectEntityClass
{
    constructor(core,name,json,position,angle,data)
    {
        super(core,name,json,position,angle,data);
        
        this.FIRE_TYPE_HIT_SCAN=0;
        this.FIRE_TYPE_PROJECTILE=1;
        
        this.FIRE_TYPE_LIST=['hit_scan','projectile'];
        
        this.ammo=0;
        this.ammoInitialCount=0;
        this.ammoMaxCount=0;
        
        this.idleAnimation=null;
        this.fireAnimation=null;
        
        this.interfaceCrosshair=null;
        this.interfaceAmmoIcon=null;
        this.interfaceAmmoText=null;
        this.interfaceAmmoCount=null;
        
        this.fireType=0;
        this.fireMethod=null;
        this.fireWait=0;
        this.fireStartRadius;
        this.damage=0;
        this.distance=0;
        this.hitEffect=null;
        this.fireSound=null;
        
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
        
        this.ammo=0;
        this.ammoInitialCount=this.core.game.lookupValue(this.json.config.ammoInitialCount,this.data);
        this.ammoMaxCount=this.core.game.lookupValue(this.json.config.ammoMaxCount,this.data);
        
        this.idleAnimation=this.json.config.idleAnimation;
        this.fireAnimation=this.json.config.fireAnimation;
        
        this.interfaceCrosshair=this.core.game.lookupValue(this.json.config.interfaceCrosshair,this.data);
        this.interfaceAmmoIcon=this.core.game.lookupValue(this.json.config.interfaceAmmoIcon,this.data);
        this.interfaceAmmoText=this.core.game.lookupValue(this.json.config.interfaceAmmoText,this.data);
        this.interfaceAmmoCount=this.core.game.lookupValue(this.json.config.interfaceAmmoCount,this.data);
       
            // model setup, skip if no model
            
        if (this.model!==null) {
            this.handOffset=new PointClass(this.json.config.handOffset.x,this.json.config.handOffset.y,this.json.config.handOffset.z);
            this.handAngle=new PointClass(this.json.config.handAngle.x,this.json.config.handAngle.y,this.json.config.handAngle.z);

            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
        }
        
            // fire setup
            
        this.fireType=this.FIRE_TYPE_LIST.indexOf(this.json.config.fireType);
        this.fireMethod=this.core.game.lookupValue(this.json.config.fireMethod,this.data);
        this.fireWait=this.core.game.lookupValue(this.json.config.fireWait,this.data);
        this.fireStartRadius=this.core.game.lookupValue(this.json.config.fireStartRadius,this.data);
        
        this.damage=this.core.game.lookupValue(this.json.config.damage,this.data);
        this.distance=this.core.game.lookupValue(this.json.config.distance,this.data);
        this.hitEffect=this.core.game.lookupValue(this.json.config.hitEffect,this.data);
        
        this.fireSound=this.json.config.fireSound;
        
            // some items added to entity so fire methods
            // can have access to parent animations
            
        this.parentIdleAnimation=null;
        this.parentRunAnimation=null; 
        this.parentFireIdleAnimation=null;
        this.parentFireRunAnimation=null;
        
        return(true);    
    }
    
    ready()
    {
        super.ready();
        
        this.ammo=this.ammoInitialCount;
        
        this.lastFireTimestamp=0;
        
        

                   //     "interfaceAmmoIcon":"grenade",


    }
    
        //
        // ammo
        //
        
    addAmmo(value)
    {
        if (this.interfaceAmmoIcon!==null) this.core.interface.pulseElement(this.interfaceAmmoIcon,500,10);
        
        this.ammo+=value;
        if (this.ammo>this.ammoMaxCount) this.ammo=this.ammoMaxCount;
    }
    
        //
        // hit scans
        //
        
    hitScan(parentEntity)
    {
            // the hit scan, firing point is the eye
            // and we rotate with the look and then turn
          
        this.firePoint.setFromPoint(parentEntity.position);
        this.firePoint.y+=parentEntity.eyeOffset;
        
        this.fireVector.setFromValues(0,0,this.distance);
        this.fireVector.rotateX(null,parentEntity.angle.x);
        this.fireVector.rotateY(null,parentEntity.angle.y);
        
        if (parentEntity.rayCollision(this.firePoint,this.fireVector,this.fireHitPoint)) {
            
                // is this an entity we can hit?
                
            if (parentEntity.hitEntity) {
                if (parentEntity.hitEntity.damage!==undefined) {
                    parentEntity.hitEntity.damage(parentEntity,this.damage,this.fireHitPoint);
                }
            }
            
                // hit effect
                // push effect point towards entity firing so it shows up better

            if (this.hitEffect!=='') {
                this.fireVector.normalize();
                this.fireVector.scale(-100);
                this.fireHitPoint.addPoint(this.fireVector);
                this.addEffect(this,this.hitEffect,this.fireHitPoint,null,true);
            }
        }
    }
    
        //
        // projectiles
        //
        
    projectile(parentEntity)
    {
        let projEntity;
        
            // fire position
            
        this.firePoint.setFromValues(0,0,this.fireStartRadius);        // a little away from the parent
        this.firePoint.rotate(parentEntity.angle);
        this.firePoint.addPoint(parentEntity.position);
        this.firePoint.y+=parentEntity.eyeOffset;
        
            // spawn from whatever is holding this weapon
            // so it counts as the spawnBy for any damage calculations, etc

        projEntity=this.addEntity(parentEntity,this.json.config.json,('projectile_'+this.name),this.firePoint,parentEntity.angle,null,true,false);
        if (projEntity!==null) projEntity.ready();
    }
    
        //
        // main run
        //
        
    run()
    {
        let parentEntity=this.heldBy;
      
        super.run();
        
            // update any UI
            
        if (this.interfaceCrosshair!==null) this.core.interface.showElement(this.interfaceCrosshair,((this.show)&&(this.core.camera.isFirstPerson())));
        if (this.interfaceAmmoText!==null) this.core.interface.updateText(this.interfaceAmmoText,this.ammo);
        if (this.interfaceAmmoCount!==null) this.core.interface.setCount(this.interfaceAmmoCount,this.ammo);
        
            // if entity has model but not shown,
            // the assume carousel and skip
            
        if (this.model!==null) {
            if (!this.show) return;
        }
        
            // skip if no ammo or not time to fire
            
        if (this.ammo===0) return;
            
        switch (this.fireMethod) {
            case 'primary':
                if (!parentEntity.firePrimary) return;
                break;
            case 'secondary':
                if (!parentEntity.fireSecondary) return;
                break;
            case 'tertiary':
                if (!parentEntity.fireTertiary) return;
                break;
            default:
                return;
        }
        
        if ((this.lastFireTimestamp+this.fireWait)>this.core.timestamp) return;
        this.lastFireTimestamp=this.core.timestamp;
        
            // fire
            
        this.ammo--;
        
        this.core.soundList.playJson(parentEntity,null,this.fireSound);
           
           // weapon animation
           
        if (this.model!==null) {
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.fireAnimation[0],this.fireAnimation[1]);
            this.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
        }
        
            // parent animation
            
        if (parentEntity.model!==null) {
            if (!parentEntity.modelEntityAlter.isAnimationQueued()) {   // don't do this if we have a queue, which means another fire is still going on
                if ((parentEntity.movement.x!==0) || (parentEntity.movement.z!==0)) {
                    parentEntity.modelEntityAlter.interuptAnimationChunkInFrames(null,30,this.parentFireRunAnimation[0],this.parentFireRunAnimation[1]);
                }
                else {
                    parentEntity.modelEntityAlter.interuptAnimationChunkInFrames(null,30,this.parentFireIdleAnimation[0],this.parentFireIdleAnimation[1]);
                }
            }
        }
        
            // and the fire method
            
        switch (this.fireType) {
            case this.FIRE_TYPE_HIT_SCAN:
                this.hitScan(parentEntity);
                return;
            case this.FIRE_TYPE_PROJECTILE:
                this.projectile(parentEntity);
                return;
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
