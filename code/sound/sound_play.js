"use strict";

//
// sound play class
//

class SoundPlayClass
{
    constructor()
    {
        this.free=true;
        this.entity=null;
        
        this.sourceNode=null;
        this.gainNode=null;
        this.pannerNode=null;
        
        Object.seal(this);
    }
    
    close()
    {
    }
    
    /*
     * var panner = audioCtx.createPanner();

     */
    
        //
        // play a sound buffer at this entity
        //
        
    play(ctx,entityListener,entity,soundBuffer)
    {
            // skip if over max distance from entity
        
        if (entity!==null) {
            var dist=entity.position.distance(entityListener.position);
            if (dist>soundBuffer.maxDistance) return(false);
        }
        
            // set the audio nodes
        
        this.sourceNode=ctx.createBufferSource();
        this.sourceNode.buffer=soundBuffer.buffer;
        this.sourceNode.onended=this.ended.bind(this);
        
            // if no entity, than just add
            // a gain node, otherwise a panner
            
            // supergumba -- waiting for this to be implemented, then remove the comments
            
        if (entity===null) {
            this.gainNode=ctx.createGain();
            this.gainNode.gain.value=0.4;
        
            this.sourceNode.connect(this.gainNode);
            this.gainNode.connect(ctx.destination);
        }
        else {
            this.pannerNode=ctx.createPanner();
            
            this.pannerNode.panningModel='HRTF';
            this.pannerNode.distanceModel='inverse';
            this.pannerNode.refDistance=1;
            this.pannerNode.maxDistance=soundBuffer.maxDistance;
            this.pannerNode.rolloffFactor=1;
            this.pannerNode.coneInnerAngle=360;
            this.pannerNode.coneOuterAngle=0;
            this.pannerNode.coneOuterGain=0;
            this.pannerNode.positionX.value=entity.position.x;
            this.pannerNode.positionY.value=entity.position.y;
            this.pannerNode.positionZ.value=entity.position.z;
            this.pannerNode.orientationX.value=1;
            this.pannerNode.orientationY.value=0;
            this.pannerNode.orientationZ.value=0;

            this.sourceNode.connect(this.pannerNode);
            this.pannerNode.connect(ctx.destination);
        }
       
            // set to entity and mark as used
        
        this.entity=entity;
        this.free=false;
        
            // finally play the sound
            
        this.sourceNode.start();
    }
    
    ended()
    {
        this.free=true;
        this.entity=null;           // otherwise entities cleared from entity list will be cleaned up late
        this.sourceNode=null;
        this.gainNode=null;
        this.pannerNode=null;
    }
    
        //
        // handle any entity updates to this sound
        //
        
    update(entityListener)
    {
        // supergumba -- remove these when panner finally works again

        /*
        if (this.entity!==null) {
            this.pannerNode.positionX.value=this.entity.position.x;
            this.pannerNode.positionY.value=this.entity.position.y;
            this.pannerNode.positionZ.value=this.entity.position.z;
        }
        */
    }

}
