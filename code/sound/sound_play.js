//
// sound play class
//

export default class SoundPlayClass
{
    constructor(core)
    {
        this.core=core;
        
        this.free=true;
        this.position=null;
        
        this.sourceNode=null;
        this.gainNode=null;
        this.pannerNode=null;
        
        Object.seal(this);
    }
    
    close()
    {
    }
    
        //
        // play a sound buffer at this position
        //
        
    play(ctx,entityListener,position,sound,rate,distance,loopStart,loopEnd,loop)
    {
        let dist;
        
            // skip if over max distance from position
            // null position = always play
            // loop = always play as looped sounds are infinite
            // and might come into position later
        
        if ((position!==null) && (!loop)) {
            dist=position.distance(entityListener.position);
            if (dist>distance) return(false);
        }
        
            // set the audio nodes
        
        this.sourceNode=ctx.createBufferSource();
        this.sourceNode.buffer=sound.buffer;
        this.sourceNode.playbackRate.value=rate;
        this.sourceNode.loopStart=loopStart;
        this.sourceNode.loopEnd=loopEnd;
        this.sourceNode.loop=loop;
        this.sourceNode.onended=this.ended.bind(this);
        
            // if no position, than just add
            // a gain node, otherwise a panner
            
        if (position===null) {
            this.gainNode=ctx.createGain();
            this.gainNode.gain.value=this.core.setup.soundVolume;
        
            this.sourceNode.connect(this.gainNode);
            this.gainNode.connect(ctx.destination);
        }
        else {
            this.pannerNode=ctx.createPanner();
            
            this.pannerNode.panningModel='HRTF';
            this.pannerNode.distanceModel='inverse';
            this.pannerNode.refDistance=distance*0.25;
            this.pannerNode.maxDistance=distance;
            this.pannerNode.rolloffFactor=1;
            this.pannerNode.coneInnerAngle=360;
            this.pannerNode.coneOuterAngle=0;
            this.pannerNode.coneOuterGain=0;
            
            if (this.pannerNode.positionX) {        // backwards compatiablity
                this.pannerNode.positionX.value=position.x;
                this.pannerNode.positionY.value=position.y;
                this.pannerNode.positionZ.value=position.z;
            }
            else {
                this.pannerNode.setPosition(position.x,position.y,position.z);
            }
            
            if (this.pannerNode.orientationX) {
                this.pannerNode.orientationX.value=1;
                this.pannerNode.orientationY.value=0;
                this.pannerNode.orientationZ.value=0;
            }
            else {
                this.pannerNode.setOrientation(1,0,0);
            }
            
            this.sourceNode.connect(this.pannerNode);
            
            this.gainNode=ctx.createGain();
            this.gainNode.gain.value=this.core.setup.soundVolume;

            this.pannerNode.connect(this.gainNode);
            this.gainNode.connect(ctx.destination);
        }
       
            // set to position and mark as used
        
        this.position=position;
        
        this.free=false;
        
            // finally play the sound
            
        this.sourceNode.start();
        
        return(true);
    }
    
    ended()
    {
        this.free=true;
        this.position=null;
        
        this.gainNode.disconnect();
        if (this.pannerNode!==null) this.pannerNode.disconnect();
        this.sourceNode.disconnect();
        
        this.sourceNode=null;
        this.pannerNode=null;
        this.gainNode=null;
    }
    
        //
        // stop a playing sound
        //
        
    stop()
    {
        this.sourceNode.stop();
    }
    
        //
        // change the rate
        //
        
    changeRate(rate)
    {
        this.sourceNode.playbackRate.value=rate;
    }
    
        //
        // handle any position updates to this sound
        //
        
    update()
    {
        if (this.position!==null) {
            if (this.pannerNode.positionX) {
                this.pannerNode.positionX.value=this.position.x;
                this.pannerNode.positionY.value=this.position.y;
                this.pannerNode.positionZ.value=this.position.z;
            }
            else {
                this.pannerNode.setPosition(this.position.x,this.position.y,this.position.z);
            }
            return;
        }
    }

}
