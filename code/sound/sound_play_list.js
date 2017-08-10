//
// sound play list class
//

export default class SoundPlayListClass
{
    constructor()
    {
        this.MAX_CONCURRENT_SOUNDS=8;                   // maximum number of concurrent sounds you can have playing

        this.soundPlays=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release list
        //
        
    initialize()
    {
        let n;
        
        this.soundPlays=[];
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays.push(new SoundPlayClass());
        }
        
        return(true);
    }
    
    release()
    {
        let n;
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays[n].close();
        }
        
        this.soundPlays=[];
    }
    
        //
        // start playing a sound attached to an entity
        //
        
    startSoundPlay(ctx,entityListener,entity,soundBuffer)
    {
        let n;
        let soundPlay=null;
        
            // skip any null buffer
            
        if (soundBuffer===null) return;
        
            // find a free sound play
            
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
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
        
    updateSoundPlays(listenerEntity)
    {
        let n;

        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            if (!this.soundPlays[n].free) this.soundPlays[n].update(listenerEntity);
        }
        
        return(null);
    }
    

}
