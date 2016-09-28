"use strict";

//
// sound class
//

class SoundClass
{
    constructor()
    {
        this.ctx=null;

        this.soundPlayList=null;
        
        this.currentListenerEntity=null;
        this.listenerForwardVector=new wsPoint(0.0,0.0,1.0);            // local to global to avoid GC
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
            // initialize the audio context
            
        var initAudioContext=window.AudioContext||window.webkitAudioContext;
        this.ctx=new initAudioContext();
        
        if (this.ctx===null) {
            alert('Could not initialize audio context');
            return(false);
        }
        
            // and the sound play list
        
        this.soundPlayList=new SoundPlayListClass();
        if (!this.soundPlayList.initialize()) return(false);
        
        return(true);
    }
    
    release()
    {
       this.soundPlayList.release();
    }
    
        //
        // utilities
        //
        
    getAudioContext()
    {
        return(this.ctx);
    }
    
        //
        // setup listener
        //
        
    setListenerToEntity(entity)
    {
        this.currentListenerEntity=entity;
    }
    
        //
        // play a sound
        //
        
    play(entity,buffer)
    {
        this.soundPlayList.startSoundPlay(this.ctx,this.currentListenerEntity,entity,buffer);
    }
        
        //
        // update sounds
        //
    
    update()
    {
            // update listener
            
        this.listenerForwardVector.setFromValues(0.0,0.0,1.0);
        this.listenerForwardVector.rotateY(null,this.currentListenerEntity.angle.y);
        
        this.ctx.listener.positionX=0;      // always consider listener at 0, and other entities relative to it
        this.ctx.listener.positionY=0;
        this.ctx.listener.positionZ=0;
        this.ctx.listener.forwardX=this.listenerForwardVector.x;
        this.ctx.listener.forwardY=this.listenerForwardVector.y;
        this.ctx.listener.forwardZ=this.listenerForwardVector.z;
        this.ctx.listener.upX=0.0;
        this.ctx.listener.upY=1.0;
        this.ctx.listener.upZ=0.0;
        
            // update all playing sounds
            
        this.soundPlayList.updateSoundPlays(this.currentListenerEntity);
    }
}

//
// the global sound object
//

var sound=new SoundClass();
