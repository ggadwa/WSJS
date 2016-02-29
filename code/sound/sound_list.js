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
    };
    
    this.getAudioContext=function()
    {
        return(this.ctx);
    };
    
    this.addSound=function(name,buffer)
    {
        this.sounds.push(new SoundObject(name,this.ctx,buffer));
    };
    
    this.play=function(name)
    {
        var n;
        var nSound=this.sounds.length;
        
        for (n=0;n!==nSound;n++) {
            if (this.sounds[n].name===name) {
                this.sounds[n].play();
                return;
            }
        }
    };
    

}
