import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import BlockClass from '../project/block.js';

export default class BlockFPSPlayerClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.idleAnimation=null;       // these can be overridden by weapon list
        this.runAnimation=null;
        
        this.inStandingAnimation=true;
    }
        
    initialize(entity)
    {
        this.idleAnimation=this.block.idleAnimation;
        this.runAnimation=this.block.runAnimation;
        
        return(true);
    }
    
    ready(entity)
    {
        this.inStandingAnimation=true;
        entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
    }
    
    run(entity)
    {
            // camera swap button
            
        if (this.block.multiCamera) {
            if (this.core.input.isKeyDownAndClear('`')) {
                if (this.core.camera.isFirstPerson()) {
                    this.core.camera.gotoThirdPersonBehind(10000,-10);
                }
                else {
                    this.core.camera.gotoFirstPerson();
                }
            }
        }
        
            // current animation
            
        if ((entity.movement.x!==0) || (entity.movement.z!==0)) {
            if (this.inStandingAnimation) entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.runAnimation[0],this.runAnimation[1]);
            this.inStandingAnimation=false;
        }
        else {
            if (!this.inStandingAnimation) entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
            this.inStandingAnimation=true;
        }
    }
    
    drawSetup(entity)
    {
        if (entity.model===null) return(false);
        
        entity.modelEntityAlter.position.setFromPoint(entity.position);
        entity.modelEntityAlter.angle.setFromValues(0,entity.angle.y+180,0);
        entity.modelEntityAlter.scale.setFromPoint(entity.scale);
        entity.modelEntityAlter.inCameraSpace=false;

        return(this.core.camera.isThirdPersonBehind());
    }
}

