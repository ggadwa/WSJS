import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import CoreClass from '../main/core.js';
import EntityClass from '../project/entity.js';

export default class EntityRemoteClass
{
    constructor(core,remoteId,name)
    {
            // remotes have no position, angle, etc until their first
            // update
            
        //super(core,name,new PointClass(0,0,0),new PointClass(0,0,0),null);
        
        this.remoteId=remoteId;
        this.filter='remote';
        
        this.show=false;
    }


}
