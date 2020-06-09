import PointClass from '../utility/point.js';
import EntityClass from '../project/entity.js';

export default class EntityPlatformPlayerClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.thirdPersonCameraDistance=0;
        this.thirdPersonCameraLookAngle=null;

            // pre-allocates
            
        this.drawAngle=new PointClass(0,90,0);
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.thirdPersonCameraDistance=this.core.game.lookupValue(this.json.config.thirdPersonCameraDistance,this.data,0);
        this.thirdPersonCameraLookAngle=new PointClass(this.json.config.thirdPersonCameraLookAngle.x,this.json.config.thirdPersonCameraLookAngle.y,this.json.config.thirdPersonCameraLookAngle.z);
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        this.core.camera.gotoThirdPerson(this.thirdPersonCameraDistance,this.thirdPersonCameraLookAngle);
    }
        
    run()
    {
        let input=this.core.input;
        
        super.run();
        
        if (input.isKeyDown('d')) {
            this.drawAngle.y=90;
            this.position.x+=70;
        }
        else {
            if (input.isKeyDown('a')) {
                this.drawAngle.y=270;
                this.position.x-=70;
            }
        }
        
    }
    
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromPoint(this.drawAngle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

