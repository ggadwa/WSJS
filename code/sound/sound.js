"use strict";

//
// sound class
//

function SoundObject(name,ctx,buffer,maxDistance)
{
    this.name=name;
    this.ctx=ctx;
    this.buffer=buffer;
    this.maxDistance=maxDistance;
    
    this.close=function()
    {
        this.buffer=null;
    };
    
        //
        // play a sound with distance attenuation and panning
        //
        
    this.play=function(soundPos)
    {
            // skip if over max
            
        var dist=soundPos.distance(this.ctx.wsTempPosition);
        if (dist>this.maxDistance) return;
        
            // get attenuation
            
        var f=((this.maxDistance-dist)/this.maxDistance);
        
            // supergumba -- doing a simple inverse linear distance until
            // spatialpanner is implemented
            
        var source=this.ctx.createBufferSource();
        source.buffer=this.buffer;
        
        var gainNode=this.ctx.createGain();
        gainNode.gain.value=f;
        
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        source.start();
    };
    
        //
        // simple sound play with no change
        //
        
    this.playSimple=function()
    {
        var source=this.ctx.createBufferSource();
        source.buffer=this.buffer;
        
        var gainNode=this.ctx.createGain();
        gainNode.gain.value=0.4;
        
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        source.start();
    };

}
