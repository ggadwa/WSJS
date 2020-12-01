import PointClass from '../utility/point.js';
import SoundClass from '../sound/sound.js';
import SoundPlayClass from '../sound/sound_play.js';

export default class AudioClass
{
    constructor(core)
    {
        this.core=core;
        
        this.MAX_CONCURRENT_SOUNDS=8;                   // maximum number of concurrent sounds you can have playing
        
        this.audioCTX=null;
        
            // listener setup
            
        this.listener=null;
        
        this.currentListenerEntity=null;
        this.listenerForwardVector=new PointClass(0.0,0.0,1.0);            // local to global to avoid GC
        
            // playing sounds

        this.soundPlays=null;

            // playing music
            
        this.music=null;
        this.musicSourceNode=null;
        this.musicGainNode=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release main audio object
        //
        
    initialize()
    {
        let n;
        let initAudioContext=window.AudioContext||window.webkitAudioContext;
        
            // initialize audio context
            
        this.audioCTX=new initAudioContext();
        
        if (this.audioCTX===null) {
            alert('Could not initialize audio context');
            return(false);
        }
        
       
            // get a reference to the listener
            
        this.listener=this.core.audio.audioCTX.listener;
        
        this.currentListenerEntity=null;
       
            // list of playing sounds
        
        this.soundPlays=[];
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays.push(new SoundPlayClass(this.core));
        }
        
            // currently no music
            
        this.music=null;
        this.musicSourceNode=null;
        this.musicGainNode=null;
        
        return(true);
    }
    
    release()
    {
        let n;
        
            // clear any music

        this.musicStop();
        
            // clear all playing sounds
            
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays[n].close();
        }
      
        this.soundPlays=[];
        
            // close the audio
            
        this.audioCTX.close();
        this.audioCTX=null;
    }
    
        //
        // suspend and resume all sound context
        //
        
    suspend()
    {
        this.audioCTX.suspend();
    }
    
    resume()
    {
        this.audioCTX.resume();
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
        
        if ((this.listener===null) || (this.currentListenerEntity===null)) return;
        
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
        // playing music
        //
        
    musicStart(music)
    {
            // already playing?
            
        if (this.music!==null) return;
        
            // any music to play?
        
        if ((music.name===null) || (!this.core.setup.musicOn)) return;
        
            // playing
            
        this.music=music;
        
            // set the audio nodes
        
        this.musicSourceNode=this.core.audio.audioCTX.createBufferSource();
        this.musicSourceNode.buffer=music.buffer;
        this.musicSourceNode.playbackRate.value=1.0;
        this.musicSourceNode.loopStart=music.loopStart;
        this.musicSourceNode.loopEnd=music.loopEnd;
        this.musicSourceNode.loop=true;
        
        this.musicGainNode=this.core.audio.audioCTX.createGain();
        this.musicGainNode.gain.value=this.core.setup.musicVolume;

        this.musicSourceNode.connect(this.musicGainNode);
        this.musicGainNode.connect(this.core.audio.audioCTX.destination);
        
            // finally play the music
            
        this.musicSourceNode.start();
    }
    
    musicStop()
    {
        if (this.music===null) return;
        
        this.musicSourceNode.stop();
        
        this.musicSourceNode.disconnect();
        this.musicGainNode.disconnect();
        this.musicSourceNode=null;
        this.musicGainNode=null;
        
        this.music=null;
    }
    
        //
        // playing sounds
        //
    
    soundStartGame(sound,position,obj)
    {
        let n,idx;
        let distance,rate,loopStart,loopEnd,loop;
        let soundPlay=null;
        
            // check for bad sounds/setup
            
        if (sound===undefined) {
            console.log(`warning: unknown sound: ${obj.name}`);
            return(-1);
        }
        
        if ((obj===undefined) || (obj===null)) return(-1);
        if ((obj.name===undefined) || (obj.name==='')) {
            console.log('Sound is missing or has a blank name');
            return(-1);
        }
        
            // null positions have no distance
            
        distance=0;
        
        if (position!==null) {
            if (obj.distance===undefined) {
                console.info(`Sound ${obj.name} is missing a distance value`);
                return(-1);
            }
            distance=obj.distance;
        }
        
            // lookup sound attributes
            
        rate=(obj.rate===undefined)?1.0:obj.rate;
        if (obj.randomRateAdd!==undefined) {
            if (obj.randomRateAdd!==0) rate+=(Math.random()*obj.randomRateAdd);
        }
        
        loopStart=(obj.loopStart===undefined)?0:obj.loopStart;
        loopEnd=(obj.loopEnd===undefined)?0:obj.loopEnd;
        loop=(obj.loop===undefined)?false:obj.loop;
        
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
            
        if (!soundPlay.play(this.audioCTX,this.currentListenerEntity,position,sound,rate,distance,loopStart,loopEnd,loop)) return(-1);
        
        return(idx);
    }
    
    soundStartGameFromList(soundList,position,obj)
    {
        if ((obj===undefined) || (obj===null)) return;      // no sound setup
        
        return(this.soundStartGame(soundList.sounds.get(obj.name),position,obj));
    }
    
    soundStartUI(sound)
    {
        let n,idx;
        let soundPlay=null;
        
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
            
        if (!soundPlay.play(this.audioCTX,null,null,sound,1.0,0,0,0,false)) return(-1);
        
        return(idx);
    }
    
    soundStop(playIdx)
    {
        let soundPlay;
        
        if (playIdx===-1) return;
                
        soundPlay=this.soundPlays[playIdx];
        if (!soundPlay.free) soundPlay.stop();
    }
    
    soundStopAll()
    {
        let n;
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            if (!this.soundPlays[n].free) this.soundPlays[n].stop();
        }
    }
    
    soundChangeRate(playIdx,rate)
    {
        let soundPlay;
        
        if (playIdx===-1) return;
                
        soundPlay=this.soundPlays[playIdx];
        if (!soundPlay.free) soundPlay.changeRate(rate);
    }
    
    soundPauseAllLooping()
    {
        let n;
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            if (!this.soundPlays[n].free) this.soundPlays[n].pauseIfLooped();
        }
        
    }
    
    soundResumeAllLooping()
    {
        let n;
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            if (!this.soundPlays[n].free) this.soundPlays[n].resumeIfLooped(this.audioCTX);
        }
        
    }
    
}
