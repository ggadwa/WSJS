"use strict";

//
// sound list class
//

class SoundListClass
{
    constructor()
    {
        this.ctx=null;
        this.sounds=null;

        this.listenerForwardVector=new wsPoint(0.0,0.0,1.0);            // local to global to avoid GC
        
        Object.seal(this);
    }
    
        //
        // initialize and release list
        //
        
    initialize()
    {
        var initAudioContext=window.AudioContext||window.webkitAudioContext;
        this.ctx=new initAudioContext();
        
        this.sounds=[];
        
        return(true);
    }
    
    release()
    {
        var n;
        var nSound=this.sounds.length;
        
        for (n=0;n!==nSound;n++) {
            this.sounds[n].close();
        }
    }
    
        //
        // various getters and setup
        //
        
    getAudioContext()
    {
        return(this.ctx);
    }
    
    setListenerToEntity(entity)
    {
            // supergumba -- all this has to be replace with spatialListener
        var pos=entity.position;
        var ang=entity.angle;
        
        this.listenerForwardVector.setFromValues(0.0,0.0,1.0);
        this.listenerForwardVector.rotateY(null,ang.y);
        
        //this.ctx.listener.setOrientation(this.listenerForwardVector.x,this.listenerForwardVector.y,this.listenerForwardVector.z,0.0,1.0,0.0);
        this.ctx.wsTempPosition=pos;       // supergumba -- temporary for now
    }
    
        //
        // add and get sounds in list
        //
        
    addSound(sound)
    {
        this.sounds.push(sound);
    }
    
    getSound(name)
    {
        var n;
        var nSound=this.sounds.length;
        
        for (n=0;n!==nSound;n++) {
            if (this.sounds[n].name===name) return(this.sounds[n]);
        }
        
        return(null);
    }
    

}
