import PointClass from '../utility/point.js';
import EntityClass from '../game/entity.js';

export default class EntityRemoteClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        Object.seal(this);
    }
}

