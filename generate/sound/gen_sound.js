/* global genRandom */

"use strict";

//
// special class for building sine waves
//

class SineWaveChunkClass
{
    constructor(timePercentage,frequency)
    {
        this.timePercentage=timePercentage;
        this.frequency=frequency;
        
        this.frame=0;
        this.sineAdd=0.0;
        
        Object.seal(this);
    }
}

//
// generate sound class
//

class GenSoundClass
{
    constructor(ctx)
    {
        this.ctx=ctx;
        
            // types
        
        this.TYPE_GUN_FIRE=0;
        this.TYPE_EXPLOSION=1;
        this.TYPE_MONSTER_SCREAM=2;

        this.TYPE_NAMES=    [
                                'Gun Fire','Explosion','Monster Scream'
                            ];
                            
        Object.seal(this);
    }
    
        //
        // waves
        //
        
    createSineWave(data,frameStart,frameEnd,hzFrequency)
    {
        let n;
        let rd=0.0;
        let rdAdd=(Math.PI*(hzFrequency*2.0))/this.ctx.sampleRate;
        
        for (n=frameStart;n<frameEnd;n++) {
            data[n]=Math.sin(rd);
            rd+=rdAdd;
        }
    }
    
    
    
    createSineWave2(data,chunkList)
    {
        let n,chunk,idx,rd,chunkFrameLen,chunkSineSize;
        let chunkLen=chunkList.length;
        let frameCount=data.length;
        
            // convert the chunks from % of position to
            // absolute frames and the frequency to
            // the proper sin
            
        for (n=0;n!==chunkLen;n++) {
            chunk=chunkList[n];
            chunk.frame=Math.trunc(chunk.timePercentage*frameCount);
            chunk.sineAdd=(Math.PI*(chunk.frequency*2.0))/this.ctx.sampleRate;
        }
        
            // run through all the sin waves
            
        idx=0;
        rd=0.0;
        
        chunkFrameLen=chunkList[1].frame-chunkList[0].frame;
        chunkSineSize=chunkList[1].sineAdd-chunkList[0].sineAdd;
        
        for (n=0;n!==frameCount;n++) {
            data[n]=Math.sin(rd);
            
            if ((n!==0) && (n===chunkList[idx+1].frame)) {
                if (idx<(chunkLen-2)) idx++;
                chunkFrameLen=chunkList[idx+1].frame-chunkList[idx].frame;
                chunkSineSize=chunkList[idx+1].sineAdd-chunkList[idx].sineAdd;
            }
            
            rd+=(chunkList[idx].sineAdd+((chunkSineSize*(n-chunkList[idx].frame))/chunkFrameLen));
        }
    }
    
    
    
    createSquareWave(data,frameStart,frameEnd,hzFrequency)
    {
        let n;
        let rd=0.0;
        let rdAdd=(Math.PI*(hzFrequency*2.0))/this.ctx.sampleRate;
        
        for (n=frameStart;n<frameEnd;n++) {
            data[n]=Math.sign(Math.sin(rd));
            rd+=rdAdd;
        }
    }
    
    createTriangleWave(data,frameStart,frameEnd,hzFrequency)
    {
        let n;
        let period=this.ctx.sampleRate/hzFrequency;
        
        for (n=frameStart;n<frameEnd;n++) {
            data[n]=(Math.abs(((n/period)-Math.floor((n/period)+0.5))*2.0)*2.0)-1.0;
        }
    }
    
    createSawToothWave(data,frameStart,frameEnd,hzFrequency)
    {
        let n;
        let period=this.ctx.sampleRate/hzFrequency;
        
        for (n=frameStart;n<frameEnd;n++) {
            data[n]=((n/period)-Math.floor((n/period)+0.5))*2.0;
        }
    }
    
    mixWave(data,mixData,frameStart,frameEnd)
    {
        let n;
        
        for (n=frameStart;n<frameEnd;n++) {
            data[n]=(data[n]*0.5)+(mixData[n]*0.5);
        }
    }
    
        //
        // effects
        //
        
    mixWhiteNoise(data,frameStart,frameEnd,range)
    {
        let n;
        let doubleRange=range*2.0;
        
        for (n=frameStart;n<frameEnd;n++) {
            data[n]+=(Math.random()*doubleRange)-range;     // use internal random as white noise doesn't need to be anything that we track and recreate
        }
    }
    
    lowPassFilter(data,frameStart,frameEnd,factor)
    {
        let n;
        let inverseFactor=1.0-factor;
        
        if (frameStart<1) frameStart=1;
        
        for (n=frameStart;n<frameEnd;n++) {
            data[n]+=(factor*data[n])+(inverseFactor*data[n-1]);
        }
    }
    
    delay(data,frameStart,frameEnd,frameCount,delayOffset,mixDest)
    {
        let n;
        let mixSource=1.0-mixDest;
        let delayIdx=frameStart+delayOffset;
        
        for (n=frameEnd;n>=frameStart;n--) {
            if (delayIdx<frameCount) data[delayIdx]=(data[delayIdx]*mixSource)+(data[n]*mixDest);
            delayIdx--;
        }
    }
    
    clip(data,frameStart,frameEnd,min,max)
    {
        let n;
        
        for (n=frameStart;n<frameEnd;n++) {
            if (data[n]<min) {
                data[n]=min;
                continue;
            }
            if (data[n]>max) data[n]=max;
        }
    }
    
    scale(data,frameStart,frameEnd,factor)
    {
        let n;
        
        for (n=frameStart;n<frameEnd;n++) {
            data[n]*=factor;
        }
    }
    
    normalize(data,frameCount)
    {
        let n,k,f,max;
        
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
        let n,fadeLen,fadeStart;
        
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
    
    generateGunFire()
    {
        let frameCount=this.ctx.sampleRate*0.25;
        let buffer=this.ctx.createBuffer(1,frameCount,this.ctx.sampleRate);
        let data=buffer.getChannelData(0);
        let mixData=new Float32Array(data.length);
        
        this.createSineWave(data,0,frameCount,40);
        this.createSineWave(mixData,0,frameCount,25);
        this.mixWave(data,mixData,0,frameCount);
        this.mixWhiteNoise(data,0,frameCount,0.1);
        
        this.normalize(data,frameCount);
        this.clip(data,0,frameCount,-0.8,0.2);
        
        this.normalize(data,frameCount);
        this.fade(data,frameCount,null,0.1);
        
        return(new SoundBufferClass(buffer,5000));
    }
    
        //
        // explosion sound
        //
    
    generateExplosion()
    {
        let frameCount=this.ctx.sampleRate*2;
        let buffer=this.ctx.createBuffer(1,frameCount,this.ctx.sampleRate);
        let data=buffer.getChannelData(0);
        let mixData=new Float32Array(data.length);
        
        let bangPosition=Math.trunc(frameCount*(0.1+(genRandom.random()*0.25)));
        
            // original tone
            
        this.createSineWave(data,0,frameCount,30);
        this.createSineWave(mixData,0,frameCount,55);
        this.mixWave(data,mixData,0,frameCount);
        this.mixWhiteNoise(data,0,frameCount,0.25);
        this.lowPassFilter(data,0,frameCount,0.15);
        
            // this part of the clip is the 'bang'
            // part of the exposion, so clip that
            // and then scale the rest to match
        
        this.normalize(data,frameCount);
        this.clip(data,0,bangPosition,-0.5,0.5);
        this.clip(data,bangPosition,frameCount,-0.9,0.9);
        this.scale(data,bangPosition,frameCount,0.7);
        
            // now normalize and fade the start/finish
            
        this.normalize(data,frameCount);
        this.fade(data,frameCount,0.1,0.75);
        
        return(new SoundBufferClass(buffer,30000));
    }
    
        //
        // monster scream sound
        //
    
    generateMonsterScream()
    {
        let frameCount=this.ctx.sampleRate*2;
        let buffer=this.ctx.createBuffer(1,frameCount,this.ctx.sampleRate);
        let data=buffer.getChannelData(0);
        let mixData=new Float32Array(data.length);
        let chunkList=[];
        
        
        chunkList.push(new SineWaveChunkClass(0.0,100));
        chunkList.push(new SineWaveChunkClass(0.3,150));
        chunkList.push(new SineWaveChunkClass(0.5,250));
        chunkList.push(new SineWaveChunkClass(0.6,400));
        chunkList.push(new SineWaveChunkClass(0.8,400));
        chunkList.push(new SineWaveChunkClass(0.9,200));
        chunkList.push(new SineWaveChunkClass(1.0,100));
        
        this.createSineWave2(data,chunkList);
        this.createSineWave(mixData,0,frameCount,55);
        //this.mixWave(data,mixData,0,frameCount);
        this.normalize(data,frameCount);
        
        //this.createSineWave(data,0,frameCount,80);
        
        
        /*
        this.createSineWave(data,0,frameCount,80);
        this.createTriangleWave(mixData,0,frameCount,8*6);
        this.scale(mixData,0,frameCount,0.5);
        this.mixWave(data,mixData,0,frameCount);
        */
        
        /*
        let frameAdd=Math.trunc(frameCount/5);
        
        this.createTone(data,0,frameCount,50);        
        this.mixTone(data,frameAdd-100,(frameAdd*2),45);
        this.mixTone(data,((frameAdd*2)-100),(frameAdd*3),42);
        this.mixTone(data,((frameAdd*3)-100),(frameAdd*4),45);
        this.mixTone(data,((frameAdd*4)-100),frameCount,35);
        
        this.delay(data,0,frameCount,frameCount,Math.trunc(frameCount*0.1),0.25);
        
        
        //this.mixWhiteNoise(data,0,frameCount,0.5);
        this.normalize(data,frameCount);
        this.fade(data,frameCount,0.05,0.2);
        */
        return(new SoundBufferClass(buffer,25000));
    }
    
        //
        // generate sound mainline
        //
    
    generate(generateType,inDebug)
    {
        let sound=null;
        
        switch (generateType) {
            
            case this.TYPE_GUN_FIRE:
                sound=this.generateGunFire();
                break;
                
            case this.TYPE_EXPLOSION:
                sound=this.generateExplosion();
                break;
                
            case this.TYPE_MONSTER_SCREAM:
                sound=this.generateMonsterScream();
                break;
        }
        
        return(sound);
    }
}

