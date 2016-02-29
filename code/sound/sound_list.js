"use strict";

//
// sound list class
//

function SoundListObject()
{
    this.ctx=null;
    this.sounds=null;
    
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
