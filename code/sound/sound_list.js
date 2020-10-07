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
        
            // listener setup
            
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
        
            // list of playing sounds
        
        this.soundPlays=[];
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays.push(new SoundPlayClass(this));
        }
       
            // get a reference to the listener
            
        this.listener=this.core.audioCTX.listener;
        
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
        this.core.audioCTX.suspend();
    }
    
    resume()
    {
        this.core.audioCTX.resume();
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
        let soundSet,name,sound;
        let mesh,move,liquid;
        let entity,jsonEntity,jsonEffect,jsonSequence;
        let success,promises;
        let game=this.core.game;
        let map=game.map;
        
            // load all the necessary sounds
            // into a set
            
        soundSet=new Set();
        
            // movement sounds
            
        for (mesh of map.meshList.meshes) {
            if (mesh.movement!==null) {
                for (move of mesh.movement.moves) {
                    if (move.sound!==null) soundSet.add(move.sound.name);
                }
            }
        }
        
            // liquid sounds
        
        for (liquid of map.liquidList.liquids) {
            if (liquid.soundIn!==null) soundSet.add(liquid.soundIn.name);
            if (liquid.soundOut!==null) soundSet.add(liquid.soundOut.name);
        }

            // entity sounds
            
        for (entity of map.entityList.entities) {
            jsonEntity=game.jsonEntityCache.get(entity.jsonName);
            if (jsonEntity!==null) game.addJsonObjectToLoadSet(soundSet,entity.data,"sounds",false,['name'],jsonEntity);
        }
        
            // effect sounds
            
        for (jsonEffect of game.jsonEffectCache.values())
        {
            game.addJsonObjectToLoadSet(soundSet,null,"sounds",false,['name'],jsonEffect);
        }
        
            // sequence sounds
            
        for (jsonSequence of game.jsonSequenceCache.values())
        {
            game.addJsonObjectToLoadSet(soundSet,null,"sounds",false,['name'],jsonSequence);
        }
        
            // load the sounds
            
        promises=[];
        
        for (name of soundSet) {
            sound=new SoundClass(this.core,name);
            sound.initialize();
            promises.push(sound.load());
            
            this.sounds.set(name,sound);
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
                
        if (!success) return(false);

        return(true);
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
        // gets milliseconds length of sample
        //
        
    getMillisecondDuration(name)
    {
        let sound;
        
        sound=this.sounds.get(name);
        if (sound===undefined) return(0);
        
        return(sound.buffer.duration*1000);
    }
    
    getMillisecondDurationJson(obj)
    {
        if ((obj===undefined) || (obj===null)) return(0);
        if ((obj.name===undefined) || (obj.name==='')) return(0);
        
        return(this.getMillisecondDuration(obj.name));
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
            
        if (!soundPlay.play(this.core.audioCTX,this.currentListenerEntity,position,sound,rate,distance,loopStart,loopEnd,loop)) return(-1);
        
        return(idx);
    }
    
    playJson(position,obj)
    {
        let rate;
        
        if ((obj===undefined) || (obj===null)) return(-1);
        if ((obj.name===undefined) || (obj.name==='')) {
            console.log('Sound is missing or has a blank name');
            return(-1);
        }
        if (obj.distance===undefined) {
            console.info(`Sound ${obj.name} is missing a distance value`);
            return(-1);
        }
        
        rate=(obj.rate===undefined)?1.0:obj.rate;
        if (obj.randomRateAdd!==undefined) {
            if (obj.randomRateAdd!==0) rate+=(Math.random()*obj.randomRateAdd);
        }
        
        return(this.play(position,obj.name,rate,obj.distance,((obj.loopStart===undefined)?0:obj.loopStart),((obj.loopEnd===undefined)?0:obj.loopEnd),((obj.loop===undefined)?false:obj.loop)));
    }
    
    stop(playIdx)
    {
        let soundPlay;
        
        if (playIdx===-1) return;
                
        soundPlay=this.soundPlays[playIdx];
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
        let soundPlay;
        
        if (playIdx===-1) return;
                
        soundPlay=this.soundPlays[playIdx];
        if (!soundPlay.free) soundPlay.changeRate(rate);
    }
    
}
