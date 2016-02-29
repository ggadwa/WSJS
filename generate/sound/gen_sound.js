"use strict";

//
// sound class
//

function GenSoundObject(ctx,genRandom)
{
    this.ctx=ctx;
    this.genRandom=genRandom;
    
    // SUPERGUMBA
    // types:
    // white nose
    // white nose over tone (low rumble for explosion)
    // tone
    
    this.generate=function(name)
    {
            // supergumba -- testing!
            
        var frameCount=this.ctx.sampleRate; // 1 second
            
        var buffer=this.ctx.createBuffer(1,frameCount,this.ctx.sampleRate);
        
        var data=buffer.getChannelData(0);
        var rd=0.0;
        var rdAdd=Math.random()*0.05;
        var n;
        
        for (n=0;n!==frameCount;n++) {
            data[n]=Math.sin(rd);
            rd+=rdAdd;
        }
        
        // fade
        
        var fadeLen=1000;
        var fadeStart=frameCount-fadeLen;
        
        for (n=fadeStart;n!==frameCount;n++) {
            data[n]*=(1.0-((n-fadeStart)/fadeLen));
        }
        
        return(new SoundObject(name,this.ctx,buffer));
    };
}

