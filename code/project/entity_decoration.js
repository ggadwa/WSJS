import PointClass from '../utility/point.js';
import ProjectEntityClass from '../project/project_entity.js';

export default class EntityDecorationClass extends ProjectEntityClass
{
    constructor(core,name,json,position,angle,data)
    {
        super(core,name,json,position,angle,data);
        
        this.idleAnimation=null;
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.idleAnimation=this.json.config.idleAnimation;
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        if (this.idleAnimation!==null) this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
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

