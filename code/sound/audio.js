
export default class AudioClass
{
    constructor(core)
    {
        this.core=core;
        
        this.audioCTX=null;
        
        this.music=null;
        this.musicSourceNode=null;
        this.musicGainNode=null;
    }
    
        //
        // initialize and release main audio object
        //
        
    initialize()
    {
        let initAudioContext=window.AudioContext||window.webkitAudioContext;
        
        this.audioCTX=new initAudioContext();
        
        if (this.audioCTX===null) {
            alert('Could not initialize audio context');
            return(false);
        }
        
        return(true);
    }
    
    release()
    {
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
        // music
        //
        
    musicStart(music)
    {
        this.music=music;
        
            // already playing?
            
        if (this.musicSourceNode!==null) return;
        
            // any music to play?
        
        if ((music.name===null) || (!this.core.setup.musicOn)) return;
        
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
        if (this.musicSourceNode===null) return;
        
        this.musicSourceNode.stop();
        
        this.musicSourceNode.disconnect();
        this.musicGainNode.disconnect();
        this.musicSourceNode=null;
        this.musicGainNode=null;
    }
    
}
