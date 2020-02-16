import PointClass from '../utility/point.js';
import BlockClass from '../project/block.js';

export default class BlockWeaponClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.ammoCount=0;
        this.ammoInitialCount=0;
        this.ammoMaxCount=0;
        
        this.interfaceCrosshair=null;
        this.interfaceAmmoIcon=null;
        this.interfaceAmmoCount=null;
        
            // pre-allocates
            
        this.handOffset=new PointClass(0,0,0);
        this.handAngle=new PointClass(0,0,0);
    }

    initialize(entity)
    {
        this.ammoInitialCount=this.core.game.lookupValue(this.block.ammoInitialCount,entity.data);
        this.ammoMaxCount=this.core.game.lookupValue(this.block.ammoMaxCount,entity.data);
        
        this.interfaceCrosshair=this.core.game.lookupValue(this.block.interfaceCrosshair,entity.data);
        this.interfaceAmmoIcon=this.core.game.lookupValue(this.block.interfaceAmmoIcon,entity.data);
        this.interfaceAmmoCount=this.core.game.lookupValue(this.block.interfaceAmmoCount,entity.data);
        
            // model setup, skip if no model
            
        if (entity.model!==null) {
            
                // set the weapon draw type for in hand

            this.handOffset=new PointClass(this.block.handOffset.x,this.block.handOffset.y,this.block.handOffset.z);
            this.handAngle=new PointClass(this.block.handAngle.x,this.block.handAngle.y,this.block.handAngle.z);

                // and start idle animation

            entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.block.idleAnimation[0],this.block.idleAnimation[1]);
        }
        
        return(true);    
    }
    
    ready(entity)
    {
        this.ammoCount=this.ammoInitialCount;
        
        if (this.interfaceAmmoCount!==null) this.core.interface.updateText(this.interfaceAmmoCount,this.ammoCount);

                   //     "interfaceAmmoIcon":"grenade",


    }
    
    run(entity)
    {
            // show/hide crosshair
            
        if (this.interfaceCrosshair!==null) this.core.interface.showElement(this.interfaceCrosshair,((entity.show)&&(this.core.camera.isFirstPerson())));
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
