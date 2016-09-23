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
        
        Object.seal(this);
    }
    
    close()
    {
    }
    
        //
        // play a sound buffer at this entity
        //
        
    play(ctx,entityListener,entity,soundBuffer)
    {
            // skip if over max distance from entity
        
        if (entity!==null) {
            var dist=entity.position.distance(entityListener.position);
            if (dist>this.maxDistance) return(false);
        }
        
            // get attenuation
        
        var f=0.4;
        //var f=((this.maxDistance-dist)/this.maxDistance);
        
            // supergumba -- doing a simple inverse linear distance until
            // panner starts working and/or is implemented correctly
            
        var source=ctx.createBufferSource();
        source.buffer=soundBuffer.buffer;
        source.onended=this.ended.bind(this);
        
            var gainNode=ctx.createGain();
            gainNode.gain.value=f;
        
            source.connect(gainNode);
            gainNode.connect(ctx.destination);
        
            // set to entity and mark as used
        
        this.entity=entity;
        this.free=false;
        
            // finally play the sound
            
        source.start();
    }
    
    ended()
    {
        this.free=true;
        this.entity=null;           // otherwise entities cleared from entity list will be cleaned up late
    }
    
        //
        // handle any entity updates to this sound
        //
        
    update(entityListener)
    {
        
    }

}
