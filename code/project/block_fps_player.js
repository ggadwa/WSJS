import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import BlockClass from '../project/block.js';

export default class BlockFPSPlayerClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.inStandingAnimation=true;
    }
        
    initialize(entity)
    {
        return(true);
    }
    
    ready(entity)
    {
        this.inStandingAnimation=true;
        entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.block.idleAnimation[0],this.block.idleAnimation[1]);
    }
    
    run(entity)
    {
        let fireWeapon;
        
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
            
        fireWeapon=false;       // todo -- get this from flags and then clear
            
        if ((entity.movement.x!==0) || (entity.movement.z!==0)) {
            if (entity.currentWeapon===this.WEAPON_BERETTA) {
                if (fireWeapon) {
                    entity.modelEntityAlter.startAnimationChunkInFrames(null,30,523,549);
                    entity.modelEntityAlter.queueAnimationChunkInFrames(null,30,492,518);
                }
                else {
                    if (this.inStandingAnimation) this.startModelAnimationChunkInFrames(null,30,492,518);
                }
            }
            else {
                if (fireWeapon) {
                    entity.modelEntityAlter.startAnimationChunkInFrames(null,30,865,887);
                    entity.modelEntityAlter.queueAnimationChunkInFrames(null,30,933,955);
                }
                else {
                    if (this.inStandingAnimation) entity.modelEntityAlter.startAnimationChunkInFrames(null,30,933,955);
                }
            }
            
            this.inStandingAnimation=false;
        }
        else {
            if (entity.currentWeapon===this.WEAPON_BERETTA) {
                if (fireWeapon) {
                    entity.modelEntityAlter.startAnimationChunkInFrames(null,30,364,401);
                    entity.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.block.idleAnimation[0],this.block.idleAnimation[1]);
                }
                else {
                    if (!this.inStandingAnimation) entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.block.idleAnimation[0],this.block.idleAnimation[1]);
                }
            }
            else {
                if (fireWeapon) {
                    entity.modelEntityAlter.startAnimationChunkInFrames(null,30,775,815);
                    entity.modelEntityAlter.queueAnimationChunkInFrames(null,30,710,760);
                }
                else {
                    if (!this.inStandingAnimation) entity.modelEntityAlter.startAnimationChunkInFrames(null,30,710,760);
                }
            }
            
            this.inStandingAnimation=true;
        }
    }
    
    drawSetup(entity)
    {
        if (entity.model===null) return(false);
        
        entity.modelEntityAlter.position.setFromPoint(entity.position);
        entity.modelEntityAlter.angle.setFromValues(0,entity.angle.y,0);
        entity.modelEntityAlter.scale.setFromPoint(entity.scale);
        entity.modelEntityAlter.inCameraSpace=false;

        return(this.core.camera.isThirdPersonBehind());
    }
}

