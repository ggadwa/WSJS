import PointClass from '../utility/point.js';
import EntityClass from '../project/entity.js';

export default class Entity2DPlayerClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        return(true);
    }
    
    ready()
    {
        super.ready();
    }
        
    run()
    {
        super.run();
        
    }
    
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromPoint(this.angle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

