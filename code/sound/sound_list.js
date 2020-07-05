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
    
    addMapSoundsToSoundSet(soundSet)
    {
        let mesh,move,liquid;
        let map=this.core.map;
        
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
    }
    
    addObjectSoundsArrayToSoundSet(soundSet,obj)
    {
        let key,sound;

        if ((obj===undefined) || (obj===null)) return;
        if ((obj.sounds===undefined) || (obj.sounds===null)) return;
        
        for (key in obj.sounds)
        {
            sound=obj.sounds[key];
            if (sound!==null) soundSet.add(sound.name);
        }
    }
    
    addEntityProjectileSoundsToSoundSet(soundSet,jsonProjectileItem)
    {
        let jsonProjectile;
        
        if ((jsonProjectileItem===undefined) || (jsonProjectileItem===null)) return;
        if ((jsonProjectileItem.projectileJson===undefined) || (jsonProjectileItem.projectileJson===null)) return;
        
        jsonProjectile=this.core.game.getCachedJsonEntity(jsonProjectileItem.projectileJson);
        this.addObjectSoundsArrayToSoundSet(soundSet,jsonProjectile);
    }
    
    addEntityWeaponSoundsToSoundSet(soundSet,jsonWeaponItem)
    {
        let jsonWeapon;
        
        jsonWeapon=this.core.game.getCachedJsonEntity(jsonWeaponItem.json);
        
        this.addObjectSoundsArrayToSoundSet(soundSet,jsonWeapon.config.primary);
        this.addEntityProjectileSoundsToSoundSet(soundSet,jsonWeapon.config.primary);
        
        this.addObjectSoundsArrayToSoundSet(soundSet,jsonWeapon.config.secondary);
        this.addEntityProjectileSoundsToSoundSet(soundSet,jsonWeapon.config.secondary);
        
        this.addObjectSoundsArrayToSoundSet(soundSet,jsonWeapon.config.tertiary);
        this.addEntityProjectileSoundsToSoundSet(soundSet,jsonWeapon.config.tertiary);
    }
    
    addEntitySoundsToSoundSet(soundSet)
    {
        let entity,jsonEntity,jsonWeaponItem;
        let game=this.core.game;
        
        for (entity of this.core.map.entityList.entities) {
            jsonEntity=this.core.game.getCachedJsonEntity(entity.jsonName);

                // entity sounds
                
            this.addObjectSoundsArrayToSoundSet(soundSet,jsonEntity);
            
                // fps/kart/platform weapon sounds
                
            if (jsonEntity.weapons!==undefined) {
                for (jsonWeaponItem of jsonEntity.weapons) {
                    this.addEntityWeaponSoundsToSoundSet(soundSet,jsonWeaponItem);
                }
            }
            
                // monster projectiles
                
            if (jsonEntity.config!==undefined) this.addEntityProjectileSoundsToSoundSet(soundSet,jsonEntity.config);
        }        
    }
    
    addEffectSoundsToSoundSet(soundSet)
    {
        let jsonEffect;
        let game=this.core.game;
        
            // we have to add all effects, we don't
            // know what will be launched
            
        for (jsonEffect of game.jsonEffectMap.values())
        {
            this.addObjectSoundsArrayToSoundSet(soundSet,jsonEffect);
        }
    }

    async loadAllSounds()
    {
        let soundSet,name,sound;
        let success,promises;
        
            // load all the necessary sounds
            // into a set
            
        soundSet=new Set();
        
        this.addMapSoundsToSoundSet(soundSet);
        this.addEntitySoundsToSoundSet(soundSet);
        this.addEffectSoundsToSoundSet(soundSet);
        
            // load the sounds
            
        promises=[];
        
        for (name of soundSet) {
            sound=new SoundClass(this.core,this.ctx,name);
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
            
        soundPlay.play(this.ctx,this.currentListenerEntity,position,sound,rate,distance,loopStart,loopEnd,loop);
        
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
