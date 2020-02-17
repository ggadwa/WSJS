import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import EntityJsonClass from '../project/entity_json.js';

export default class BlockClass
{
    constructor(core,block)
    {
        this.core=core;
        this.block=block;
    }
    
        //
        // overrides
        //
        
    initialize(entity)
    {
        return(true);
    }
    
    release(entity)
    {
    }
    
    ready(entity)
    {
    }
    
    run(entity)
    {
    }
    
    drawSetup(entity)
    {
        return(true);
    }
    
        //
        // utilities
        //
    
    addEntity(spawnedByEntity,jsonName,name,position,angle,data,show,hold)
    {
        let entity=new EntityJsonClass(this.core,name,position,angle,data,jsonName);
        
        entity.spawnedBy=spawnedByEntity;
        if (hold) entity.heldBy=spawnedByEntity;
        entity.show=show;
        
        this.core.map.entityList.add(entity);
        
        return(entity);
    }
    
    addEffect(spawnedByEntity,jsonName,position,data,show)
    {
        return(this.core.map.effectList.add(spawnedByEntity,jsonName,position,data,show));
    }
        
    runActions(entity,actions)
    {
        let action;
        
        for (action of actions) {
            
            switch (action.action) {
                case 'trigger':
                    this.core.setTrigger(this.core.game.lookupValue(action.name,entity.data));
                    break;
            }
            
            
        }
    }
}
