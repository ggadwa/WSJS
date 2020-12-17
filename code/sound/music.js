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
        this.autoStop=false;
        
        this.buffer=null;
        this.loaded=false;
        
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
        // set the music
        //
        
    setMusic(name,loopStart,loopEnd,autoStop)
    {
        this.name=name;
        this.loopStart=loopStart;
        this.loopEnd=loopEnd;
        this.autoStop=autoStop;
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
                        this.core.audio.audioCTX.decodeAudioData(data,resolve,reject);
                    }
                )
           );
    }
    
    async load()
    {
        let data=null;
        
            // any music?
            
        if (this.name===null) return(true);
        
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
        //await this.core.audio.audioCTX.decodeAudioData(data)      // safari doesn't have the promise version of this
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
