//
// sound class
//

export default class MusicClass
{
    constructor(core)
    {
        this.core=core;

        this.name=null;
        this.loopStart=0;
        this.loopEnd=0;
        
        this.buffer=null;
        this.loaded=false;
        
        this.sourceNode=null;
        this.gainNode=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
        this.buffer=null;
        this.loaded=false;
        
        return(true);
    }
    
    release()
    {
        this.buffer=null;
        this.loaded=false;
    }
    
        //
        // music api
        //
        
    setMusic(name,loopStart,loopEnd)
    {
        this.name=name;
        this.loopStart=loopStart;
        this.loopEnd=loopEnd;
    }
    
    start()
    {
            // any music to play?
        
        if ((this.name===null) || (!this.core.setup.musicOn)) return;
        
            // set the audio nodes
        
        this.sourceNode=this.core.audioCTX.createBufferSource();
        this.sourceNode.buffer=this.buffer;
        this.sourceNode.playbackRate.value=1.0;
        this.sourceNode.loopStart=this.loopStart;
        this.sourceNode.loopEnd=this.loopEnd;
        this.sourceNode.loop=true;
        
        this.gainNode=this.core.audioCTX.createGain();
        this.gainNode.gain.value=this.core.setup.musicVolume;

        this.sourceNode.connect(this.gainNode);
        this.gainNode.connect(this.core.audioCTX.destination);
        
            // finally play the music
            
        this.sourceNode.start();
    }
    
    stop()
    {
        this.sourceNode.stop();
    }
    
        //
        // load mp3 file
        //
        
    async loadMP3()
    {
        let resp;
        let url='../music/'+this.name+'.mp3';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.arrayBuffer());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
    
    decodeAudioPromise(data)
    {
            // safari doesn't have the promise version of this
            
        return(
                new Promise((resolve,reject) =>
                    {
                        this.core.audioCTX.decodeAudioData(data,resolve,reject);
                    }
                )
           );
    }
    
    async load()
    {
        let data=null;
        
            // any music?
            
        if ((this.name===null) || (!this.core.setup.musicOn)) return(true);
        
            // load the mp3 file
            
        await this.loadMP3()
            .then
                (
                        // resolved
                
                    value=>{
                        data=value;
                    },
                    
                        // rejected
                        
                    err=>{
                        console.log(err);
                    }
                );

        if (data==null) return(false);
        
           // decode the mp3 file to get an audio buffer
           
        this.buffer=null;
        
        await this.decodeAudioPromise(data)
        //await this.core.audioCTX.decodeAudioData(data)      // safari doesn't have the promise version of this
            .then
                (
                        // resolved
                
                    decodedData=>{
                        this.buffer=decodedData;
                    },
                            
                        // rejected
                        
                    ()=>{
                        console.log('Unable to decode mp3 file '+this.name);
                    }
                );
        
        return(this.buffer!==null);
    }
    
}
