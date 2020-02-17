import PointClass from '../utility/point.js';
import BlockClass from '../project/block.js';

export default class BlockWeaponClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.ammoInitialCount=0;
        this.ammoMaxCount=0;
        
        this.idleAnimation=null;
        this.fireAnimation=null;
        
        this.interfaceCrosshair=null;
        this.interfaceAmmoIcon=null;
        this.interfaceAmmoCount=null;
        
            // pre-allocates
            
        this.handOffset=new PointClass(0,0,0);
        this.handAngle=new PointClass(0,0,0);
    }

    initialize(entity)
    {
        entity.ammoCount=0;         // ammo count on entity so other blocks can access it
        
        entity.idleAnimation=this.block.idleAnimation;
        entity.fireAnimation=this.block.fireAnimation;
        
        this.ammoInitialCount=this.core.game.lookupValue(this.block.ammoInitialCount,entity.data);
        this.ammoMaxCount=this.core.game.lookupValue(this.block.ammoMaxCount,entity.data);
        
        this.interfaceCrosshair=this.core.game.lookupValue(this.block.interfaceCrosshair,entity.data);
        this.interfaceAmmoIcon=this.core.game.lookupValue(this.block.interfaceAmmoIcon,entity.data);
        this.interfaceAmmoCount=this.core.game.lookupValue(this.block.interfaceAmmoCount,entity.data);
        
            // model setup, skip if no model
            
        if (entity.model!==null) {
            this.handOffset=new PointClass(this.block.handOffset.x,this.block.handOffset.y,this.block.handOffset.z);
            this.handAngle=new PointClass(this.block.handAngle.x,this.block.handAngle.y,this.block.handAngle.z);

            entity.modelEntityAlter.startAnimationChunkInFrames(null,30,entity.idleAnimation[0],entity.idleAnimation[1]);
        }
        
        return(true);    
    }
    
    ready(entity)
    {
        entity.ammoCount=this.ammoInitialCount;
        
        

                   //     "interfaceAmmoIcon":"grenade",


    }
    
    run(entity)
    {
            // update any UI
            
        if (this.interfaceCrosshair!==null) this.core.interface.showElement(this.interfaceCrosshair,((entity.show)&&(this.core.camera.isFirstPerson())));
        if (this.interfaceAmmoCount!==null) this.core.interface.updateText(this.interfaceAmmoCount,entity.ammoCount);
        
    }
        
    drawSetup(entity)
    {
        if (entity.model===null) return(false);
        
        entity.modelEntityAlter.position.setFromPoint(this.handOffset);
        entity.modelEntityAlter.angle.setFromPoint(this.handAngle);
        entity.modelEntityAlter.scale.setFromPoint(entity.scale);
        entity.modelEntityAlter.inCameraSpace=true;
        
        return(this.core.camera.isFirstPerson());
    }

}
