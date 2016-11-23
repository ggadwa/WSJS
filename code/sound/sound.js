"use strict";

//
// sound class
//

class SoundClass
{
    constructor()
    {
        this.ctx=null;
        this.listener=null;

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
        
            // get a reference to the listener
            
        this.listener=this.ctx.listener;
        
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
        if (this.listener===null) return;
        
            // update listener
            
        this.listenerForwardVector.setFromValues(0.0,0.0,-1.0);
        this.listenerForwardVector.rotateY(null,this.currentListenerEntity.angle.y);
        
        if (this.listener.positionX) {
            this.listener.positionX.value=this.currentListenerEntity.position.x;
            this.listener.positionY.value=this.currentListenerEntity.position.y;
            this.listener.positionZ.value=this.currentListenerEntity.position.z;
            this.listener.forwardX.value=this.listenerForwardVector.x;
            this.listener.forwardY.value=this.listenerForwardVector.y;
            this.listener.forwardZ.value=this.listenerForwardVector.z;
            this.listener.upX.value=0.0;
            this.listener.upY.value=1.0;
            this.listener.upZ.value=0.0;
        }
        else {      // supergumba -- remove all this when firefox stops being stupid
            this.listener.setPosition(this.currentListenerEntity.position.x,this.currentListenerEntity.position.y,this.currentListenerEntity.position.z);
            this.listener.setOrientation(this.listenerForwardVector.x,this.listenerForwardVector.y,this.listenerForwardVector.z,0.0,1.0,0.0);
        }
        
            // update all playing sounds
            
        this.soundPlayList.updateSoundPlays(this.currentListenerEntity);
    }
}

//
// the global sound object
//

var sound=new SoundClass();
