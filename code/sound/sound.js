"use strict";

//
// sound class
//

function SoundObject(name,ctx,buffer)
{
    this.name=name;
    this.ctx=ctx;
    this.buffer=buffer;
    
    this.initialize=function()
    {
            // supergumba -- testing!
            
        var frameCount=this.ctx.sampleRate; // 1 second
            
        this.buffer=this.ctx.createBuffer(1,frameCount,this.ctx.sampleRate);
        
        var data=this.buffer.getChannelData(0);
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
        
        return(true);
    };
    
    this.release=function()
    {
        
    };
    
    this.play=function()
    {
        var source=this.ctx.createBufferSource();
        source.buffer=this.buffer;
        
        var gainNode=this.ctx.createGain();
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        gainNode.gain.value=0.1;
        
        source.start(0);
    };
    

}
