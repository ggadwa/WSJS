import PointClass from '../utility/point.js';
import BlockClass from '../project/block.js';

export default class BlockFireHitScanClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
    }
    
    initialize(entity)
    {
         
            
            
            /*
        this.DAMAGE=20;
        this.HIT_FILTER=['player','remote','bot','monster'];
        
            // setup
            
        this.radius=5000;
        this.height=11000;      // this model is based on a humanoid skeleton, so it's taller
        
        this.fireWait=900;
        
        this.ammoInitialCount=15;
        this.ammoAddCount=10;
        this.ammoMaxCount=25;
        this.interfaceIconName='beretta_bullet';
        

            // the model
            
        this.setModel('hand_beretta');
        this.scale.setFromValues(7000,7000,7000);
             * 
             */
    }
    /*
    ready(entity)
    {
        super.ready(entity);
        
        this.startModelAnimationChunkInFrames(null,30,77,127);
    }
    
        //
        // fire call
        //
    
    fire(position,angle,eyeOffset)
    {
            // the super does the ammo calc
            // and tells if we can fire
            
        if (!super.fire(position,angle,eyeOffset)) return(false);
        
            // the sound
            // played at holder of weapon
            
        this.playSoundAtEntity(this.heldBy,'beretta_fire',1.0,false);
        
            // the animation
            
        this.startModelAnimationChunkInFrames(null,30,128,143);
        this.queueModelAnimationChunkInFrames(null,30,77,127);
        
            // run the hitscan
            
        this.hitScan(position,angle,eyeOffset,100000,this.HIT_FILTER,this.DAMAGE,EffectHitClass);
        
        return(true);
    }
    
    //
    // this weapon draws in the camera view
    // so we have to set some positions and angles
    //
            
    drawSetup()
    {
        if (!this.getCamera().isFirstPerson()) return(false);
        
        this.setModelDrawPosition(this.handOffset,this.handAngle,this.scale,true);
        return(true);
    }
         * 
     */
    
    run(entity)
    {
        let fireWeapon;
        
            // if entity has model but not shown,
            // the assume carousel and skip
            
        if ((entity.model!==null) && (!entity.show)) return;
        
            // check for fire
            
        fireWeapon=this.core.input.mouseButtonFlags[0]||this.core.input.isTouchStickRightClick();
        
        if (fireWeapon) {
        //    this.sendMessageToBlock('weapon','fired',)
        //    this.weaponBlock.ammoCount--;
        }
    }
    
    
    
    
    hitScan(fromEntity,maxDistance,hitFilter,damage,hitEffectName)
    {
            // the hit scan, firing point is the eye
            // and we rotate with the look and then turn
            
        this.firePoint.setFromPoint(fromEntity.position);
        this.firePoint.y+=fromEntity.eyeOffset;
        
        this.fireVector.setFromValues(0,0,maxDistance);
        this.fireVector.rotateX(null,fromEntity.angle.x);
        this.fireVector.rotateY(null,fromEntity.angle.y);
        
        if (fromEntity.rayCollision(this.firePoint,this.fireVector,this.fireHitPoint,hitFilter,null)) {
            
                // is this an entity we can hit?
                
            if (fromEntity.hitEntity) {
                if (fromEntity.hitEntity.damage!==undefined) {
                    fromEntity.hitEntity.damage(fromEntity,damage,this.fireHitPoint);
                }
            }
            
                // hit effect
                // push effect point towards entity firing so it shows up better

            if (hitEffectName!==null) {
                this.fireVector.normalize();
                this.fireVector.scale(-100);
                this.fireHitPoint.addPoint(this.fireVector);
                this.core.map.effectList.add(hitEffectName,this.fireHitPoint,null,true);
            }
        }

    }

}
