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
        
    addSound(name)
    {
        let sound;
        
        if ((name===undefined) || (name===null)) return;        // name can come from json
        
        if (this.sounds.has(name)) return;
        
        sound=new SoundClass(this.core,this.ctx,name);
        sound.initialize();
            
        this.sounds.set(name,sound);
    }
    
    addSoundByNameAttribute(elem)
    {
        if ((elem===undefined) || (elem===null)) return;
        if ((elem.name!==undefined) && (elem.name!==null)) this.addSound(elem.name);
    }
    
    addSoundBySoundNameAttribute(elem)
    {
        if ((elem===undefined) || (elem===null)) return;  
        this.addSoundByNameAttribute(elem.sound);
    }

    async loadAllSounds()
    {
        let n,k;
        let mapDef,entityDef,effectDef,keys,key;
        let movementDef,moveDef;
        let keyIter,rtn;
        let success,promises;
        let game=this.core.game;
        
            // go throw the jsons and find
            // all the sounds, we look at 
            // maps, entities, and effects
            
        keys=Object.keys(game.jsonMapCache);
        
        for (key of keys)
        {
            mapDef=game.jsonMapCache[key];
            if ((mapDef.movements===undefined) || (mapDef.movements===null)) continue;
            
            for (n=0;n!==mapDef.movements.length;n++) {
                movementDef=mapDef.movements[n];
                for (k=0;k!==movementDef.moves.length;k++) {
                    moveDef=movementDef.moves[k];
                    if ((moveDef.sound!==undefined) && (moveDef.sound!==null)) this.addSoundByNameAttribute(moveDef.sound);
                }
                
            }
        }
            
        keys=Object.keys(game.jsonEntityCache);
        
        for (key of keys)
        {
            entityDef=game.jsonEntityCache[key];

            this.addSoundBySoundNameAttribute(entityDef.config.primary);
            this.addSoundBySoundNameAttribute(entityDef.config.secondary);
            this.addSoundBySoundNameAttribute(entityDef.config.tertiary);
            
            this.addSoundByNameAttribute(entityDef.config.hurtSound);
            this.addSoundByNameAttribute(entityDef.config.dieSound);
            this.addSoundByNameAttribute(entityDef.config.pickupSound);
            this.addSoundByNameAttribute(entityDef.config.bounceSound);
            this.addSoundByNameAttribute(entityDef.config.reflectSound);
            this.addSoundByNameAttribute(entityDef.config.spawnSound);
            this.addSoundByNameAttribute(entityDef.config.openSound);
            this.addSoundByNameAttribute(entityDef.config.closeSound);
            this.addSoundByNameAttribute(entityDef.config.wakeUpSound);
            this.addSoundByNameAttribute(entityDef.config.meleeSound);
            this.addSoundByNameAttribute(entityDef.config.deathSound);
            this.addSoundByNameAttribute(entityDef.config.fallSound);
            
            this.addSoundByNameAttribute(entityDef.config.engineSound);
            this.addSoundByNameAttribute(entityDef.config.skidSound);
            this.addSoundByNameAttribute(entityDef.config.crashKartSound);
            this.addSoundByNameAttribute(entityDef.config.crashWallSound);
        }
        
        keys=Object.keys(game.jsonEffectCache);
        
        for (key of keys)
        {
            effectDef=game.jsonEffectCache[key];
            this.addSoundBySoundNameAttribute(effectDef);
        }
        
        // supergumba -- temporary
        
        this.addSound('splash');
            
            // load the sounds
            
        promises=[];
        
        keyIter=this.sounds.keys();
        
        while (true) {
            rtn=keyIter.next();
            if (rtn.done) break;
            
            promises.push(this.sounds.get(rtn.value).load());
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
        
    play(position,name,rate,distance,loopStart,loopEnd,loop)
    {
        let n,idx,sound;
        let soundPlay=null;
        
            // find sound
            
        sound=this.sounds.get(name);
        if (sound===undefined) {
            console.log('warning: unknown sound: '+name);
            return(-1);
        }
        
            // find a free sound play
            
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            if (this.soundPlays[n].free) {
                idx=n;
                soundPlay=this.soundPlays[n];
                break;
            }
        }
        
        if (soundPlay===null) return(-1);
        
            // set it to entity
            
        soundPlay.play(this.ctx,this.currentListenerEntity,position,sound,rate,distance,loopStart,loopEnd,loop);
        
        return(idx);
    }
    
    playJson(position,obj)
    {
        let rate;
        
        if (obj===undefined) return(-1);
        if ((obj.name===undefined) || (obj.name==='')) return(-1);
        
        rate=obj.rate;
        if (obj.randomRateAdd!==0) rate+=(Math.random()*obj.randomRateAdd);
        
        return(this.play(position,obj.name,rate,obj.distance,obj.loopStart,obj.loopEnd,obj.loop));
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
