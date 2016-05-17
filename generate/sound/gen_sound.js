"use strict";

//
// generate sound class
//

class GenSoundClass
{
    constructor(ctx,genRandom)
    {
        this.ctx=ctx;
        this.genRandom=genRandom;
        
        Object.seal(this);
    }
    
        //
        // sound utilities
        //
    
    createTone(data,frameStart,frameEnd,cycleCount)
    {
        var n;
        var rd=0.0;
        var rdAdd=(Math.PI*cycleCount)/(frameEnd-frameStart);
        
            // tones are always in cycles, so we always
            // start and stop at 0 points to reduce clicks
            // which means cycleCount needs to always be an integer
            
        for (n=frameStart;n<frameEnd;n++) {
            data[n]=Math.sin(rd);
            rd+=rdAdd;
        }
    }
    
    mixTone(data,frameStart,frameEnd,cycleCount)
    {
        var n;
        var rd=0.0;
        var rdAdd=(Math.PI*cycleCount)/(frameEnd-frameStart);
        
        for (n=frameStart;n<frameEnd;n++) {
            data[n]=(data[n]*0.5)+(Math.sin(rd)*0.5);
            rd+=rdAdd;
        }
    }
    
    mixWhiteNoise(data,frameStart,frameEnd,range)
    {
        var n;
        var doubleRange=range*2.0;
        
        for (n=frameStart;n<frameEnd;n++) {
            data[n]+=(Math.random()*doubleRange)-range;     // use internal random as white noise doesn't need to be anything that we track and recreate
        }
    }
    
    delay(data,frameStart,frameEnd,frameCount,delayOffset,mixDest)
    {
        var n;
        var mixSource=1.0-mixDest;
        var delayIdx=frameStart+delayOffset;
        
        for (n=frameEnd;n>=frameStart;n--) {
            if (delayIdx<frameCount) data[delayIdx]=(data[delayIdx]*mixSource)+(data[n]*mixDest);
            delayIdx--;
        }
    }
    
    normalize(data,frameCount)
    {
        var n,k,f,max;
        
            // get max value
            
        max=0.0;
        
        for (n=0;n!==frameCount;n++) {
            k=Math.abs(data[n]);
            if (k>max) max=k;
        }
        
        if (max===0.0) return;
        
            // normalize
            
        f=1.0/max;
        
        for (n=0;n!==frameCount;n++) {
            data[n]*=f;
        }
    }
    
    fade(data,frameCount,fadeIn,fadeOut)
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
    }
    
        //
        // gun fire sound
        //
    
    generateGunFire(name)
    {
        var frameCount=this.ctx.sampleRate*0.25;
        var buffer=this.ctx.createBuffer(1,frameCount,this.ctx.sampleRate);
        var data=buffer.getChannelData(0);
        
        this.createTone(data,0,frameCount,50);
        this.mixTone(data,0,frameCount,70);
        this.mixWhiteNoise(data,0,frameCount,0.05);
        this.normalize(data,frameCount);
        this.fade(data,frameCount,null,0.1);
        
        return(new SoundClass(name,this.ctx,buffer,25000));
    }
    
        //
        // explosion sound
        //
    
    generateExplosion(name)
    {
        var frameCount=this.ctx.sampleRate*2;
        var buffer=this.ctx.createBuffer(1,frameCount,this.ctx.sampleRate);
        var data=buffer.getChannelData(0);
        
        this.createTone(data,0,frameCount,80);
        this.mixTone(data,0,frameCount,150);
        this.mixWhiteNoise(data,0,frameCount,0.25);
        this.normalize(data,frameCount);
        this.fade(data,frameCount,0.1,0.5);
        
        return(new SoundClass(name,this.ctx,buffer,50000));
    }
    
        //
        // monster scream sound
        //
    
    generateMonsterScream(name)
    {
        var frameCount=this.ctx.sampleRate*1;
        var buffer=this.ctx.createBuffer(1,frameCount,this.ctx.sampleRate);
        var data=buffer.getChannelData(0);
        
        var frameAdd=Math.trunc(frameCount/5);
        
        this.createTone(data,0,frameCount,50);        
        this.mixTone(data,frameAdd-100,(frameAdd*2),45);
        this.mixTone(data,((frameAdd*2)-100),(frameAdd*3),42);
        this.mixTone(data,((frameAdd*3)-100),(frameAdd*4),45);
        this.mixTone(data,((frameAdd*4)-100),frameCount,35);
        
        this.delay(data,0,frameCount,frameCount,Math.trunc(frameCount*0.1),0.25);
        
        
        //this.mixWhiteNoise(data,0,frameCount,0.5);
        this.normalize(data,frameCount);
        this.fade(data,frameCount,0.05,0.2);
        
        return(new SoundClass(name,this.ctx,buffer,25000));
    }
    
        //
        // generate sound mainline
        //
    
    generate(name,generateType,inDebug)
    {
        var sound=null;
        
        switch (generateType) {
            
            case GEN_SOUND_TYPE_GUN_FIRE:
                sound=this.generateGunFire(name);
                break;
                
            case GEN_SOUND_TYPE_EXPLOSION:
                sound=this.generateExplosion(name);
                break;
                
            case GEN_SOUND_TYPE_MONSTER_SCREAM:
                sound=this.generateMonsterScream(name);
                break;
        }
        
        return(sound);
    }
}

