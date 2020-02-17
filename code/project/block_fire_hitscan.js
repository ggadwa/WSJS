import PointClass from '../utility/point.js';
import BlockClass from '../project/block.js';

export default class BlockFireHitScanClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.fireMethod=null;
        this.fireWait=0;
        this.damage=0;
        this.distance=0;
        this.hitFilter=null;
        this.hitEffect=null;
        this.fireSound=null;
        
        this.lastFireTimestamp=0;
        
            // pre-allocates
            
        this.firePoint=new PointClass(0,0,0);
        this.fireVector=new PointClass(0,0,0);
        this.fireHitPoint=new PointClass(0,0,0);
    }
    
    initialize(entity)
    {
        this.fireMethod=this.core.game.lookupValue(this.block.fireMethod,entity.data);
        this.fireWait=this.core.game.lookupValue(this.block.fireWait,entity.data);
        
        this.damage=this.core.game.lookupValue(this.block.damage,entity.data);
        this.distance=this.core.game.lookupValue(this.block.distance,entity.data);
        this.hitFilter=this.block.hitFilter;
        this.hitEffect=this.core.game.lookupValue(this.block.hitEffect,entity.data);
        
        this.fireSound=this.block.fireSound;
            
            // variables that all blocks need access to, added
            // by fps_control but put here in case that block isn't used
            
        entity.firePrimary=false;
        entity.fireSecondary=false;
        entity.fireTertiary=false;
    }
    
    ready(entity)
    {
        this.lastFireTimestamp=0;
    }
    
    run(entity)
    {
        let parentEntity=entity.heldBy;
        
            // if entity has model but not shown,
            // the assume carousel and skip
            
        if (entity.model!==null) {
            if (!entity.show) return;
        }
        
            // skip if no ammo or not time to fire
            
        if (entity.ammoCount===0) return;
            
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
            
        entity.ammoCount--;
        
        this.core.soundList.playJson(parentEntity,null,this.fireSound);
           
        if (entity.model!==null) {
            entity.modelEntityAlter.startAnimationChunkInFrames(null,30,entity.fireAnimation[0],entity.fireAnimation[1]);
            entity.modelEntityAlter.queueAnimationChunkInFrames(null,30,entity.idleAnimation[0],entity.idleAnimation[1]);
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
}
