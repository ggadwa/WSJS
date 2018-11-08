import SoundBufferClass from '../../code/sound/sound_buffer.js';
import genRandom from '../../generate/utility/random.js';

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

export default class GenSoundClass
{
    constructor(ctx)
    {
        this.ctx=ctx;
        
            // types
        
        this.TYPE_GUN_FIRE=0;
        this.TYPE_EXPLOSION=1;
        this.TYPE_MONSTER_WAKE=2;
        this.TYPE_MONSTER_HURT=3;
        this.TYPE_MONSTER_DIE=4;

        this.TYPE_NAMES=    [
                                'Gun Fire','Explosion','Monster Wake Up',
                                'Monster Hurt','Monster Die'
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
    
    createSineMultipleWaves(data,chunkList)
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
    
    delay(data,frameStart,frameEnd,delayOffset,mix)
    {
        let n;
        let frameCount=data.length;
        let fadeFrameIndex=frameStart+((frameEnd-frameStart)*0.1);
        let fadeFactor=mix/(fadeFrameIndex-frameStart);
        let mixFactor=mix;
        let delayIdx=frameEnd+delayOffset;
        
        for (n=frameEnd;n>=frameStart;n--) {
            
                // the delay
                
            if (delayIdx<frameCount) data[delayIdx]=(data[delayIdx]*(1.0-mixFactor))+(data[n]*mixFactor);
            delayIdx--;
            
                // ramp down the mix if we are
                // past the fade start (we run the delay
                // backwards so the mix doesn't interfere
                // with the previous delay.)
            
            if (n<fadeFrameIndex) {
                mixFactor-=fadeFactor;
                if (mixFactor<=0.0) break;
            }
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
    
    normalize(data)
    {
        let n,k,f,max;
        let frameCount=data.length;
        
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
    
    fade(data,fadeIn,fadeOut)
    {
        let n,fadeLen,fadeStart;
        let frameCount=data.length;
        
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
        
        this.normalize(data);
        this.clip(data,0,frameCount,-0.8,0.2);
        
        this.normalize(data);
        this.fade(data,null,0.1);
        
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
        
        this.normalize(data);
        this.clip(data,0,bangPosition,-0.5,0.5);
        this.clip(data,bangPosition,frameCount,-0.9,0.9);
        this.scale(data,bangPosition,frameCount,0.7);
        
            // now normalize and fade the start/finish
            
        this.normalize(data);
        this.fade(data,0.1,0.75);
        
        return(new SoundBufferClass(buffer,30000));
    }
    
        //
        // monster scream sound
        //
    
    generateMonster(sampleLength,frequencyMin,frequencyMax,rumbleFrequencyMin,rumbleFrequencyMax)
    {
        let n,waveCount,dataPos,frequency;
        let frameCount=this.ctx.sampleRate*sampleLength;        // in seconds
        let buffer=this.ctx.createBuffer(1,frameCount,this.ctx.sampleRate);
        let data=buffer.getChannelData(0);
        let mixData=new Float32Array(data.length);
        let chunkList;
        
        waveCount=genRandom.randomInt(1,3);
        
        for (n=0;n!==waveCount;n++) {
            dataPos=0.0;
            frequency=frequencyMin+(genRandom.random()*(frequencyMax-frequencyMin));

            chunkList=[];

            while (true) {
                if (dataPos>1.0) dataPos=1.0;

                chunkList.push(new SineWaveChunkClass(dataPos,frequency));

                if (dataPos===1.0) break;
                dataPos+=(genRandom.random()*0.2);

                frequency+=(100-(genRandom.random()*200));
                if (frequency<frequencyMin) frequency=frequencyMin;
                if (frequency>frequencyMax) frequency=frequencyMax;
            }

            if (n===0) {
                this.createSineMultipleWaves(data,chunkList);
            }
            else {
                this.createSineMultipleWaves(mixData,chunkList);
                this.mixWave(data,mixData,0,frameCount);
            }
        }
        
            // add in a saw wave to change the timber a bit
            
        this.createSawToothWave(mixData,0,0,frameCount,(rumbleFrequencyMin+(genRandom.random()*(rumbleFrequencyMax-rumbleFrequencyMin))));
        this.mixWave(data,mixData,0,frameCount);
        
            // normalize it, randomly clip, low pass, and delay it
            
        this.normalize(data);
        this.clip(data,0,frameCount,(-1.0+(genRandom.random()*0.2)),(1.0-(genRandom.random()*0.2)));
        this.lowPassFilter(data,0,frameCount,genRandom.random());
        
        this.delay(data,0,frameCount,Math.trunc(frameCount*0.1),(genRandom.random()*0.5));
        
            // finally normalize and fade
            
        this.normalize(data);
        this.fade(data,0.1,0.2);

        return(new SoundBufferClass(buffer,35000));
    }
    
        //
        // generate sound mainline
        //
    
    generate(generateType,inDebug)
    {
        switch (generateType) {
            
            case this.TYPE_GUN_FIRE:
                return(this.generateGunFire());
                
            case this.TYPE_EXPLOSION:
                return(this.generateExplosion());
                
            case this.TYPE_MONSTER_WAKE:
                return(this.generateMonster(1.5,100.0,600.0,50.0,200.0));
                
            case this.TYPE_MONSTER_HURT:
                return(this.generateMonster(0.5,300.0,700.0,100.0,300.0));
                
            case this.TYPE_MONSTER_DIE:
                return(this.generateMonster(0.75,80.0,180.0,50.0,100.0));
        }
        
        return(null);
    }
}

