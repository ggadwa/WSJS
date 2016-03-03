"use strict";

//
// sound list class
//

function SoundListObject()
{
    this.ctx=null;
    this.sounds=null;
    
    this.listenerForwardVector=new wsPoint(0.0,0.0,1.0);            // local to global to avoid GC
    
    this.initialize=function()
    {
        var initAudioContext=window.AudioContext||window.webkitAudioContext;
        this.ctx=new initAudioContext();
        
        this.sounds=[];
        
        return(true);
    };
    
    this.release=function()
    {
        var n;
        var nSound=this.sounds.length;
        
        for (n=0;n!==nSound;n++) {
            this.sounds[n].close();
        }
    };
    
    this.getAudioContext=function()
    {
        return(this.ctx);
    };
    
    this.setListenerToEntity=function(entity)
    {
            // supergumba -- all this has to be replace with spatialListener
        var pos=entity.getPosition();
        var ang=entity.getAngle();
        
        this.listenerForwardVector.set(0.0,0.0,1.0);
        this.listenerForwardVector.rotateY(null,ang.y);
        
        //this.ctx.listener.setOrientation(this.listenerForwardVector.x,this.listenerForwardVector.y,this.listenerForwardVector.z,0.0,1.0,0.0);
        this.ctx.wsTempPosition=pos;       // supergumba -- temporary for now
    };
    
    this.add=function(sound)
    {
        this.sounds.push(sound);
    };
    
    this.get=function(name)
    {
        var n;
        var nSound=this.sounds.length;
        
        for (n=0;n!==nSound;n++) {
            if (this.sounds[n].name===name) return(this.sounds[n]);
        }
        
        return(null);
    };
    

}
