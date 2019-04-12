import PointClass from '../utility/point.js';
import SoundClass from '../sound/sound.js';
import SoundPlayClass from '../sound/sound_play.js';

//
// core sound list class
//

export default class SoundListClass
{
    static MAX_CONCURRENT_SOUNDS=8;                   // maximum number of concurrent sounds you can have playing
    
    constructor(core)
    {
        this.core=core;
        
        this.sounds=new Map();
        
            // global audio setup
            
        this.ctx=null;
        this.listener=null;
        
        this.currentListenerEntity=null;
        this.listenerForwardVector=new PointClass(0.0,0.0,1.0);            // local to global to avoid GC
        
            // volumes
            
        this.soundVolume=0.3;
        this.musicVolume=0.3;
        
            // playing sounds

        this.soundPlays=null;

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        let n;
        
            // initialize the audio context
            
        let initAudioContext=window.AudioContext||window.webkitAudioContext;
        this.ctx=new initAudioContext();
        
        if (this.ctx===null) {
            alert('Could not initialize audio context');
            return(false);
        }
        
            // list of playing sounds
        
        this.soundPlays=[];
        
        for (n=0;n!==SoundListClass.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays.push(new SoundPlayClass(this));
        }
       
            // get a reference to the listener
            
        this.listener=this.ctx.listener;
        
        return(true);
    }

    release()
    {
        let n;
        
        for (n=0;n!==SoundListClass.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays[n].close();
        }
        
        this.soundPlays=[];
    }
    
        //
        // add and get a sound
        //
        
    add(name,maxDistance)
    {
        let sound;
            
            // already in list?
            
        if (this.sounds.has(name)) return;
        
            // add new one to list, will be loaded
            // by another call that force loads unloaded
            // sounds
                    
        sound=new SoundClass(this.core,this.ctx,name,maxDistance);
        sound.initialize();
        this.sounds.set(name,sound);
    }

    get(name)
    {
        return(this.sounds.get(name));
    }
    
        //
        // loading
        //
        
    async loadAllSounds()
    {
        let keyIter,rtn,sound;
        let success,promises=[];
        
            // gather all the promises
        
        keyIter=this.sounds.keys();
        
        while (true) {
            rtn=keyIter.next();
            if (rtn.done) break;
            
            sound=this.sounds.get(rtn.value);
            if (!sound.loaded) promises.push(sound.load());
        }

            // and await them all
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    (values)=>{
                        success=!values.includes(false);
                    },
                );

        return(success);
    }
    
        //
        // setup listener
        //
        
    setListenerToEntity(entity)
    {
        this.currentListenerEntity=entity;
    }
    
    updateListener()
    {
        let n;
        
        if (this.listener===null) return;
        
            // update listener
            
        this.listenerForwardVector.setFromValues(0,0,1);
        this.listenerForwardVector.rotateY(null,this.currentListenerEntity.angle.y);
        
        this.listener.positionX.value=this.currentListenerEntity.position.x;
        this.listener.positionY.value=this.currentListenerEntity.position.y;
        this.listener.positionZ.value=this.currentListenerEntity.position.z;
        this.listener.forwardX.value=this.listenerForwardVector.x;
        this.listener.forwardY.value=this.listenerForwardVector.y;
        this.listener.forwardZ.value=this.listenerForwardVector.z;
        this.listener.upX.value=0.0;
        this.listener.upY.value=1.0;
        this.listener.upZ.value=0.0;
        
            // update all playing sounds
            
        for (n=0;n!==SoundListClass.MAX_CONCURRENT_SOUNDS;n++) {
            if (!this.soundPlays[n].free) this.soundPlays[n].update(this.currentListenerEntity);
        }
    }
        //
        // start playing a sound attached to an entity
        //
        
    play(entity,name)
    {
        let n,sound;
        let soundPlay=null;
        
            // find sound
            
        sound=this.sounds.get(name);
        if (sound===null) return;
        
            // find a free sound play
            
        for (n=0;n!==SoundListClass.MAX_CONCURRENT_SOUNDS;n++) {
            if (this.soundPlays[n].free) {
                soundPlay=this.soundPlays[n];
                break;
            }
        }
        
        if (soundPlay===null) return;
        
            // set it to entity
            
        soundPlay.play(this.ctx,this.currentListenerEntity,entity,sound);
    }
    
    
}
