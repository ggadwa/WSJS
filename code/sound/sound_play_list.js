"use strict";

//
// sound play list class
//

class SoundPlayListClass
{
    constructor()
    {
        this.soundPlays=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release list
        //
        
    initialize()
    {
        var n;
        
        this.soundPlays=[];
        
        for (n=0;n!==config.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays.push(new SoundPlayClass());
        }
        
        return(true);
    }
    
    release()
    {
        var n;
        
        for (n=0;n!==config.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays[n].close();
        }
        
        this.soundPlays=[];
    }
    
        //
        // start playing a sound attached to an entity
        //
        
    startSoundPlay(ctx,entityListener,entity,soundBuffer)
    {
        var n;
        var soundPlay=null;
        
            // find a free sound play
            
        for (n=0;n!==config.MAX_CONCURRENT_SOUNDS;n++) {
            if (this.soundPlays[n].free) {
                soundPlay=this.soundPlays[n];
                break;
            }
        }
        
        if (soundPlay===null) return;
        
            // set it to entity
            
        soundPlay.play(ctx,entityListener,entity,soundBuffer);
    }
    
        //
        // update all the sounds attached to entities
        //
        
    updateSoundPlays(entityListener)
    {
        var n;

        for (n=0;n!==config.MAX_CONCURRENT_SOUNDS;n++) {
            if (!this.soundPlays[n].free) this.soundPlays[n].update(entityListener);
        }
        
        return(null);
    }
    

}
