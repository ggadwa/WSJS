import PointClass from '../utility/point.js';
import BlockClass from '../project/block.js';

export default class BlockFireProjectileClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.fireMethod=null;
        this.fireWait=0;
        this.fireSound=null;
        
        this.lastFireTimestamp=0;
        
            // pre-allocates
            
        this.firePoint=new PointClass(0,0,0);
    }
    
    initialize(entity)
    {
        this.fireMethod=this.core.game.lookupValue(this.block.fireMethod,entity.data);
        this.fireWait=this.core.game.lookupValue(this.block.fireWait,entity.data);
        this.fireStartRadius=this.core.game.lookupValue(this.block.fireStartRadius,entity.data);
        
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
        let projEntity;
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

            // fire position
            
        this.firePoint.setFromValues(0,0,this.fireStartRadius);        // a little away from the parent
        this.firePoint.rotate(parentEntity.angle);
        this.firePoint.addPoint(parentEntity.position);
        this.firePoint.y+=parentEntity.eyeOffset;
        
            // spawn from whatever is holding this weapon
            // so it counts as the spawnBy for any damage calculations, etc

        projEntity=this.addEntity(parentEntity,this.block.json,'projectile_grenade',this.firePoint,parentEntity.angle,null,true,false);
        if (projEntity!==null) projEntity.ready(projEntity);
    }

}
