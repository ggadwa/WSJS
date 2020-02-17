import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import BlockClass from '../project/block.js';

export default class BlockHealthClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
    }
        
    initialize(entity)
    {
            // add these on the entity so all blocks have access
            
        entity.armor=0;
        entity.health=0;
        
        return(true);
    }
    
    ready(entity)
    {
        entity.health=this.core.game.lookupValue(this.block.healthInitialCount,entity.data);
        entity.armor=this.core.game.lookupValue(this.block.armorInitialCount,entity.data);
    }
    
    run(entity)
    {
        if (entity===this.core.map.entityList.getPlayer()) {
            this.core.interface.updateText('armor_count',entity.armor);
            this.core.interface.updateText('health_count',entity.health);
        }
    }
}

