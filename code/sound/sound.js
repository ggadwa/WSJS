import PointClass from '../utility/point.js';

//
// sound class
//

export default class SoundClass
{
    constructor(core,ctx,name,maxDistance,loopStart,loopEnd)
    {
        this.core=core;
        this.ctx=ctx;
        this.name=name;
        this.maxDistance=maxDistance;
        this.loopStart=loopStart;
        this.loopEnd=loopEnd;
        
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
        // load wav file
        //
        
    async loadWAV()
    {
        let resp;
        let url='../sounds/'+this.name+'.wav';
        
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
                        this.ctx.decodeAudioData(data,resolve,reject);
                    }
                )
           );
    }
    
    async load()
    {
        let data=null;
        
            // load the wav file
            
        await this.loadWAV()
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
        
           // decode the wav file to get an audio buffer
           
        this.buffer=null;
        
        await this.decodeAudioPromise(data)
        //await this.ctx.decodeAudioData(data)      // safari doesn't have the promise version of this
            .then
                (
                        // resolved
                
                    decodedData=>{
                        this.buffer=decodedData;
                    },
                            
                        // rejected
                        
                    ()=>{
                        console.log('Unable to decode wav file '+this.name);
                    }
                );
        
        return(this.buffer!==null);
    }
    
}
