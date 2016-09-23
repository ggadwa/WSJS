"use strict";

//
// sound buffer list class
//

class SoundBufferListClass
{
    constructor()
    {
        this.soundBuffers=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release list
        //
        
    initialize()
    {
        this.soundBuffers=[];
        return(true);
    }
    
    release()
    {
        var n;
        var nSoundBuffer=this.sounds.length;
        
        for (n=0;n!==nSoundBuffer;n++) {
            this.soundBuffers[n].close();
        }
        
        this.soundPlays=[];
    }
    
        //
        // add and get sounds in list
        //
        
    addBuffer(buffer)
    {
        this.soundBuffers.push(buffer);
    }
    
    getBufferByName(name)
    {
        var n;
        var nSoundBuffer=this.soundBuffers.length;
        
        for (n=0;n!==nSoundBuffer;n++) {
            if (this.soundBuffers[n].name===name) return(this.soundBuffers[n]);
        }
        
        return(null);
    }
}
