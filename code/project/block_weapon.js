import PointClass from '../utility/point.js';
import BlockClass from '../project/block.js';

export default class BlockWeaponClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.ammoCount=0;
        this.ammoInitialCount=0;
        this.ammoMaxCount=0;
        
        this.idleAnimation=null;
        this.fireAnimation=null;
        
        this.interfaceCrosshair=null;
        this.interfaceAmmoIcon=null;
        this.interfaceAmmoCount=null;
        
        this.fireType=0;
        this.fireMethod=null;
        this.fireWait=0;
        this.damage=0;
        this.distance=0;
        this.hitFilter=null;
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

    initialize(entity)
    {
        this.ammoCount=0;
        this.ammoInitialCount=this.core.game.lookupValue(this.block.ammoInitialCount,entity.data);
        this.ammoMaxCount=this.core.game.lookupValue(this.block.ammoMaxCount,entity.data);
        
        this.idleAnimation=this.block.idleAnimation;
        this.fireAnimation=this.block.fireAnimation;
        
        this.interfaceCrosshair=this.core.game.lookupValue(this.block.interfaceCrosshair,entity.data);
        this.interfaceAmmoIcon=this.core.game.lookupValue(this.block.interfaceAmmoIcon,entity.data);
        this.interfaceAmmoCount=this.core.game.lookupValue(this.block.interfaceAmmoCount,entity.data);
       
            // model setup, skip if no model
            
        if (entity.model!==null) {
            this.handOffset=new PointClass(this.block.handOffset.x,this.block.handOffset.y,this.block.handOffset.z);
            this.handAngle=new PointClass(this.block.handAngle.x,this.block.handAngle.y,this.block.handAngle.z);

            entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
        }
        
            // fire setup
            
        this.fireMethod=this.core.game.lookupValue(this.block.fireMethod,entity.data);
        this.fireWait=this.core.game.lookupValue(this.block.fireWait,entity.data);
        
        this.damage=this.core.game.lookupValue(this.block.damage,entity.data);
        this.distance=this.core.game.lookupValue(this.block.distance,entity.data);
        this.hitFilter=this.block.hitFilter;
        this.hitEffect=this.core.game.lookupValue(this.block.hitEffect,entity.data);
        
        this.fireSound=this.block.fireSound;
        
            // some items added to entity so fire methods
            // can have access to parent animations
            
        entity.parentIdleAnimation=null;
        entity.parentRunAnimation=null; 
        entity.parentFireIdleAnimation=null;
        entity.parentFireRunAnimation=null;
        
        return(true);    
    }
    
    ready(entity)
    {
        this.ammoCount=this.ammoInitialCount;
        
        this.lastFireTimestamp=0;
        
        

                   //     "interfaceAmmoIcon":"grenade",


    }
    
    run(entity)
    {
        let parentEntity=entity.heldBy;
        
            // update any UI
            
        if (this.interfaceCrosshair!==null) this.core.interface.showElement(this.interfaceCrosshair,((entity.show)&&(this.core.camera.isFirstPerson())));
        if (this.interfaceAmmoCount!==null) this.core.interface.updateText(this.interfaceAmmoCount,this.ammoCount);
        
            // if entity has model but not shown,
            // the assume carousel and skip
            
        if (entity.model!==null) {
            if (!entity.show) return;
        }
        
            // skip if no ammo or not time to fire
            
        if (this.ammoCount===0) return;
            
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
            
        this.ammoCount--;
        
        this.core.soundList.playJson(parentEntity,null,this.fireSound);
           
           // weapon animation
           
        if (entity.model!==null) {
            entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.fireAnimation[0],this.fireAnimation[1]);
            entity.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
        }
        
            // parent animation
            
        if (parentEntity.model!==null) {
            if (!parentEntity.modelEntityAlter.isAnimationQueued()) {   // don't do this if we have a queue, which means another fire is still going on
                if ((parentEntity.movement.x!==0) || (parentEntity.movement.z!==0)) {
                    parentEntity.modelEntityAlter.interuptAnimationChunkInFrames(null,30,entity.parentFireRunAnimation[0],entity.parentFireRunAnimation[1]);
                }
                else {
                    parentEntity.modelEntityAlter.interuptAnimationChunkInFrames(null,30,entity.parentFireIdleAnimation[0],entity.parentFireIdleAnimation[1]);
                }
            }
        }
        
            // the hit scan, firing point is the eye
            // and we rotate with the look and then turn
          
        this.firePoint.setFromPoint(parentEntity.position);
        this.firePoint.y+=parentEntity.eyeOffset;
        
        this.fireVector.setFromValues(0,0,this.distance);
        this.fireVector.rotateX(null,parentEntity.angle.x);
        this.fireVector.rotateY(null,parentEntity.angle.y);
        
        if (parentEntity.rayCollision(this.firePoint,this.fireVector,this.fireHitPoint,this.hitFilter,null)) {
            
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
                this.addEffect(entity,this.hitEffect,this.fireHitPoint,null,true);
            }
        }
    }
        
    drawSetup(entity)
    {
        if (entity.model===null) return(false);
        
        entity.modelEntityAlter.position.setFromPoint(this.handOffset);
        entity.modelEntityAlter.angle.setFromPoint(this.handAngle);
        entity.modelEntityAlter.scale.setFromPoint(entity.scale);
        entity.modelEntityAlter.inCameraSpace=true;
        
        return(this.core.camera.isFirstPerson());
    }

}
