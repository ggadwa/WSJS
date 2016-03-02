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
    
    this.play=function(listenerPos,soundPos)
    {
        var source=this.ctx.createBufferSource();
        source.buffer=this.buffer;

        var pannerNode=this.ctx.createPanner();
        //pannerNode.panningModel='HRTF';
        //pannerNode.distanceModel='inverse';
        //pannerNode.refDistance=1.0;
        pannerNode.maxDistance=maxDistance;
        //pannerNode.rolloffFactor=1.0;
        //pannerNode.coneInnerAngle=360.0;
        //pannerNode.coneOuterAngle=0.0;
        //pannerNode.coneOuterGain=0.0;
        //pannerNode.setOrientation(1,0,0);
        pannerNode.setPosition((soundPos.x-listenerPos.x),(soundPos.y-listenerPos.y),(soundPos.z-listenerPos.z));
        
        //pannerNode.setPosition(100,0,100);
        
        console.log('listen='+(listenerPos.x)+','+(listenerPos.y)+','+(listenerPos.z));
        console.log('sound='+(soundPos.x)+','+(soundPos.y)+','+(soundPos.z));
        console.log('distance='+listenerPos.distance(soundPos));
        console.log('maxdistance='+pannerNode.maxDistance);
        
        var gainNode=this.ctx.createGain();
        gainNode.gain.value=20.0;
        source.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(this.ctx.destination);


        
        /*
        var gainNode=this.ctx.createGain();
        gainNode.gain.value=0.1;
       source.connect(gainNode);
       gainNode.connect(this.ctx.destination);
        */
        
        
        source.start();
    };
    

}
