"use strict";

//
// sound class
//

function SoundObject(name,ctx,buffer)
{
    this.name=name;
    this.ctx=ctx;
    this.buffer=buffer;
    
    this.close=function()
    {
        this.buffer=null;
    };
    
    this.play=function(listenerPos,soundPos)
    {
        var source=this.ctx.createBufferSource();
        source.buffer=this.buffer;
        
        var pannerNode=this.ctx.createPanner();
        //pannerNode.panningModel='HRTF';
        //pannerNode.distanceModel='inverse';
        //pannerNode.refDistance=1.0;
        pannerNode.maxDistance=100000;
        //pannerNode.rolloffFactor=1.0;
        //pannerNode.coneInnerAngle=360.0;
        //pannerNode.coneOuterAngle=0.0;
        //pannerNode.coneOuterGain=0.0;
        //pannerNode.setOrientation(1,0,0);
        pannerNode.setPosition((listenerPos.x-soundPos.x),(listenerPos.y-soundPos.y),(listenerPos.z-soundPos.z));
        
        console.log((listenerPos.x-soundPos.x)+','+(listenerPos.y-soundPos.y)+','+(listenerPos.z-soundPos.z));
        console.log(listenerPos.distance(soundPos));
        
        var gainNode=this.ctx.createGain();
        gainNode.gain.value=1.0;
        source.connect(gainNode);
        gainNode.connect(pannerNode);
        
        //source.connect(pannerNode);
        pannerNode.connect(this.ctx.destination);
        
        
//        var gainNode=this.ctx.createGain();
//        source.connect(gainNode);
//        gainNode.connect(this.ctx.destination);
        
//        gainNode.gain.value=0.1;
        
        source.start(0);
    };
    

}
