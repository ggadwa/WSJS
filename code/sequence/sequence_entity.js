import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';

export default class SequenceEntityClass
{
    constructor(core,sequence,entityName,frames)
    {
        this.core=core;
        this.sequence=sequence;
        this.entityName=entityName;
        this.frames=frames;
        
            // the entity
            
        this.entity=null;
        this.currentFrameIdx=-1;
        
        this.originalPosition=new PointClass(0,0,0);
        this.originalAngle=new PointClass(0,0,0);
        this.originalScale=new PointClass(0,0,0);
        this.originalAnimationFrames=[0,0];
        
        this.effectPosition=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
    initialize()
    {
        this.entity=this.core.game.map.entityList.find(this.entityName);
        if (this.entity===null) {
            console.log('unknown entity name: '+this.entityName+' in sequence '+sequence.jsonName);
            return(false);
        }
        
        this.originalPosition.setFromPoint(this.entity.position);
        this.originalAngle.setFromPoint(this.entity.angle);
        this.originalScale.setFromPoint(this.entity.scale);
        
        this.entity.modelEntityAlter.getAnimationCurrentFrames(this.originalAnimationFrames);
        
        return(true);
    }
    
    release()
    {
        this.entity.position.setFromPoint(this.originalPosition);
        this.entity.angle.setFromPoint(this.originalAngle);
        this.entity.scale.setFromPoint(this.originalScale);
        
        this.entity.modelEntityAlter.startAnimationChunkInFrames(this.originalAnimationFrames);
    }
    
    run(tick)
    {
        let n,f;
        let startIdx,endIdx;
        let startFrame,endFrame,frameCount;
        
            // if outside frames, no drawing
            
        frameCount=this.frames.length;
        if (frameCount===1) return;
        
        if ((tick<this.frames[0].tick) || (tick>=this.frames[frameCount-1].tick)) return;
        
            // find the tween points
            
        startIdx=0;
        endIdx=frameCount-1;
        
        for (n=0;n!==frameCount;n++) {
            if (tick<=this.frames[n].tick) {
                endIdx=n;
                break;
            }
            startIdx=n;
        }
        
            // tween factor
            
        startFrame=this.frames[startIdx];
        endFrame=this.frames[endIdx];
         
        if (startIdx===endIdx) {
            f=1;
        }
        else {
            f=(tick-startFrame.tick)/(endFrame.tick-startFrame.tick);
        }
        
            // we use the current frame to see
            // if we need to do any "starts" which only happen
            // once
            
        if (this.currentFrameIdx!==startIdx) {
            this.currentFrameIdx=startIdx;
            
            if (startFrame.startAnimation!==undefined) {
                this.entity.modelEntityAlter.startAnimationChunkInFrames(startFrame.startAnimation);
            }
            
            if (startFrame.show!==undefined) {
                this.entity.show=startFrame.show;
            }
            
            if (startFrame.startEffect!==undefined) {
                this.effectPosition.setFromPoint(this.entity.position);
                this.effectPosition.addPoint(startFrame.startEffect.positionOffset);
                this.entity.addEffect(this.entity,startFrame.startEffect.name,this.effectPosition,null,true);
            }
        }
        
            // tween
            
        this.entity.position.x=this.originalPosition.x+(startFrame.positionOffset.x+((endFrame.positionOffset.x-startFrame.positionOffset.x)*f));
        this.entity.position.y=this.originalPosition.y+(startFrame.positionOffset.y+((endFrame.positionOffset.y-startFrame.positionOffset.y)*f));
        this.entity.position.z=this.originalPosition.z+(startFrame.positionOffset.z+((endFrame.positionOffset.z-startFrame.positionOffset.z)*f)); 
          
        if (this.entity.drawAngle!==undefined) {
            this.entity.drawAngle.x=this.originalAngle.x+(startFrame.angleOffset.x+((endFrame.angleOffset.x-startFrame.angleOffset.x)*f));
            this.entity.drawAngle.y=this.originalAngle.y+(startFrame.angleOffset.y+((endFrame.angleOffset.y-startFrame.angleOffset.y)*f));
            this.entity.drawAngle.z=this.originalAngle.z+(startFrame.angleOffset.z+((endFrame.angleOffset.z-startFrame.angleOffset.z)*f));
        }
        else {
            this.entity.angle.x=this.originalAngle.x+(startFrame.angleOffset.x+((endFrame.angleOffset.x-startFrame.angleOffset.x)*f));
            this.entity.angle.y=this.originalAngle.y+(startFrame.angleOffset.y+((endFrame.angleOffset.y-startFrame.angleOffset.y)*f));
            this.entity.angle.z=this.originalAngle.z+(startFrame.angleOffset.z+((endFrame.angleOffset.z-startFrame.angleOffset.z)*f));
        }
        
        this.entity.scale.x=this.originalScale.x*(startFrame.scale.x+((endFrame.scale.x-startFrame.scale.x)*f));
        this.entity.scale.y=this.originalScale.y*(startFrame.scale.y+((endFrame.scale.y-startFrame.scale.y)*f));
        this.entity.scale.z=this.originalScale.z*(startFrame.scale.z+((endFrame.scale.z-startFrame.scale.z)*f));
    }
}
