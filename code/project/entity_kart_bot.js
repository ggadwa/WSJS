import PointClass from '../utility/point.js';
import EntityClass from '../project/entity.js';

export default class EntityKartBotClass extends EntityClass
{
    constructor(core,name,json,position,angle,data)
    {
        super(core,name,json,position,angle,data);
        
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
//        this.opened=this.core.game.lookupValue(this.json.config.startOpened,this.data);
        
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

