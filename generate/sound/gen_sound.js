"use strict";

//
// sound class
//

function GenSoundObject(ctx,genRandom)
{
    this.ctx=ctx;
    this.genRandom=genRandom;
    
    //
    // sound utilities
    //
    
    this.addTone=function(data,frameCount,freq)
    {
        var n;
        var rd=0.0;
        
        for (n=0;n!==frameCount;n++) {
            data[n]+=Math.sin(rd);
            rd+=freq;
        }
    };
    
    this.addWhiteNoise=function(data,frameCount,range)
    {
        var n;
        var doubleRange=range*2.0;
        
        for (n=0;n!==frameCount;n++) {
            data[n]+=(Math.random()*doubleRange)-range;     // use internal random as white noise doesn't need to be anything that we track and recreate
        }
    };
    
    this.normalize=function(data,frameCount)
    {
        var n;
        
        for (n=0;n!==frameCount;n++) {
            if (data[n]>1.0) {
                data[n]=1.0;
            }
            else {
                if (data[n]<-1.0) data[n]=-1.0;
            }
        }
    };
    
    this.fade=function(data,frameCount,fadeIn,fadeOut)
    {
        var n,fadeLen,fadeStart;
        
            // fade in
        
        if (fadeIn!==null) {
            fadeLen=Math.trunc(frameCount*fadeIn);

            for (n=0;n<fadeLen;n++) {
                data[n]*=(n/fadeLen);
            }
        }
        
            // fade out
        
        if (fadeOut!==null) {
            fadeLen=Math.trunc(frameCount*fadeOut);
            fadeStart=frameCount-fadeLen;

            for (n=fadeStart;n<frameCount;n++) {
                data[n]*=(1.0-((n-fadeStart)/fadeLen));
            }
        }
    };
    
    //
    // gun fire sound
    //
    
    this.generateGunFire=function(name)
    {
        var frameCount=this.ctx.sampleRate*0.5;
        var buffer=this.ctx.createBuffer(1,frameCount,this.ctx.sampleRate);
        var data=buffer.getChannelData(0);
        
        this.addTone(data,frameCount,0.007);
        this.addTone(data,frameCount,0.008);
        this.addWhiteNoise(data,frameCount,0.1);
        this.normalize(data,frameCount);
        this.fade(data,frameCount,null,0.1);
        
        return(new SoundObject(name,this.ctx,buffer,25000));
    };
    
    //
    // explosion sound
    //
    
    this.generateExplosion=function(name)
    {
        var frameCount=this.ctx.sampleRate*2;
        var buffer=this.ctx.createBuffer(1,frameCount,this.ctx.sampleRate);
        var data=buffer.getChannelData(0);
        
        this.addTone(data,frameCount,0.007);
        this.addTone(data,frameCount,0.005);
        this.addWhiteNoise(data,frameCount,0.2);
        this.normalize(data,frameCount);
        this.fade(data,frameCount,0.1,0.5);
        
        return(new SoundObject(name,this.ctx,buffer,50000));
    };
    
    //
    // generate sound mainline
    //
    
    this.generate=function(name,soundType)
    {
        switch (soundType) {
            
            case GEN_SOUND_GUN_FIRE:
                return(this.generateGunFire(name));
                
            case GEN_SOUND_EXPLOSION:
                return(this.generateExplosion(name));
        }
        
        return(null);
    };
}

