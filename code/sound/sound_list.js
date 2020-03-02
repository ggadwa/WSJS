import PointClass from '../utility/point.js';
import SoundClass from '../sound/sound.js';
import SoundPlayClass from '../sound/sound_play.js';

//
// core sound list class
//

export default class SoundListClass
{
    constructor(core)
    {
        this.MAX_CONCURRENT_SOUNDS=8;                   // maximum number of concurrent sounds you can have playing
        
        this.core=core;
        
        this.sounds=new Map();
        
            // global audio setup
            
        this.ctx=null;
        this.listener=null;
        
        this.currentListenerEntity=null;
        this.listenerForwardVector=new PointClass(0.0,0.0,1.0);            // local to global to avoid GC
        
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
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays.push(new SoundPlayClass(this));
        }
       
            // get a reference to the listener
            
        this.listener=this.ctx.listener;
        
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
        // suspend and resume all sound context
        //
        
    suspend()
    {
        this.ctx.suspend();
    }
    
    resume()
    {
        this.ctx.resume();
    }
    
        //
        // get a sound
        //
        
    get(name)
    {
        return(this.sounds.get(name));
    }
    
        //
        // loading
        //
        
    async loadAllSounds()
    {
        let loadSoundList=this.core.map.json.sounds;
        let soundDef,sound;
        let success,promises;
        
            // get all the models and wrap the
            // loading into a list of promises
            
        promises=[];
        
        for (soundDef of loadSoundList) {
            sound=new SoundClass(this.core,this.ctx,soundDef.name,soundDef.distance,soundDef.loopStart,soundDef.loopEnd);
            sound.initialize();
            promises.push(sound.load());
            
            this.sounds.set(soundDef.name,sound);
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
        
        if (this.listener.positionX) {        // backwards compatiablity
            this.listener.positionX.value=this.currentListenerEntity.position.x;
            this.listener.positionY.value=this.currentListenerEntity.position.y;
            this.listener.positionZ.value=this.currentListenerEntity.position.z;
        }
        else {
            this.listener.setPosition(this.currentListenerEntity.position.x,this.currentListenerEntity.position.y,this.currentListenerEntity.position.z);
        }
        if (this.listener.forwardX) {        // backwards compatiablity
            this.listener.forwardX.value=this.listenerForwardVector.x;
            this.listener.forwardY.value=this.listenerForwardVector.y;
            this.listener.forwardZ.value=this.listenerForwardVector.z;
            this.listener.upX.value=0.0;
            this.listener.upY.value=1.0;
            this.listener.upZ.value=0.0;
        }
        else {
            this.listener.setOrientation(this.listenerForwardVector.x,this.listenerForwardVector.y,this.listenerForwardVector.z,0,1,0);
        }
        
            // update all playing sounds
            
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            if (!this.soundPlays[n].free) this.soundPlays[n].update(this.currentListenerEntity);
        }
    }
        //
        // start playing a sound attached to an entity or mesh
        // (or if no attachment, a global sound)
        //
        
    play(entity,mesh,name,rate,loop)
    {
        let n,idx,sound;
        let soundPlay=null;
        
            // find sound
            
        sound=this.sounds.get(name);
        if (sound===undefined) {
            console.log('warning: unknown sound: '+name);
            return;
        }
        
            // find a free sound play
            
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            if (this.soundPlays[n].free) {
                idx=n;
                soundPlay=this.soundPlays[n];
                break;
            }
        }
        
        if (soundPlay===null) return;
        
            // set it to entity
            
        soundPlay.play(this.ctx,this.currentListenerEntity,entity,mesh,sound,rate,loop);
        
        return(idx);
    }
    
    playJson(entity,mesh,obj)
    {
        let rate;
        
        if (obj===undefined) return;
        if ((obj.name===undefined) || (obj.name==='')) return;
        
        rate=obj.rate;
        if (obj.randomRateAdd!==0) rate+=(Math.random()*obj.randomRateAdd);
        
        this.play(entity,mesh,obj.name,rate,obj.loop);
    }
    
    stop(playIdx)
    {
        let soundPlay=this.soundPlays[playIdx];
        
        if (!soundPlay.free) soundPlay.stop();
    }
    
    stopAll()
    {
        let n;
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            if (!this.soundPlays[n].free) this.soundPlays[n].stop();
        }
    }
    
    changeRate(playIdx,rate)
    {
        let soundPlay=this.soundPlays[playIdx];
        
        if (!soundPlay.free) soundPlay.changeRate(rate);
    }
    
}
