"use strict";

//
// this is a specialized main that just outputs samples
// so we can check what they sound like without running the entire engine
//

class DebugSoundClass
{
    constructor()
    {
        this.drawTop=5;
        this.soundWid=1200;
        this.soundHigh=250;
        
        sound.initialize();
        
        this.soundBuffers=[];
        this.genSound=new GenSoundClass(sound.getAudioContext());
        
        Object.seal(this);
    }
       
        //
        // sound waves
        //
    
    drawWave(ctx,wid,high,data)
    {
        let x,dataSkip,y,idx,halfHigh;
        let dataLen=data.length;
        
            // the midline
            
        halfHigh=Math.trunc(high/2);
            
        ctx.strokeStyle='#FF0000';
        
        ctx.beginPath();
        ctx.moveTo(0,halfHigh);
        ctx.lineTo(wid,halfHigh);
        ctx.stroke();

            // the drawing skip

        dataSkip=Math.trunc(dataLen/wid);

            // draw the wave

        ctx.strokeStyle='#0000FF';
        ctx.beginPath();

        y=halfHigh+Math.trunc(data[0]*halfHigh);
        ctx.moveTo(0,y);
        
        idx=0;

        for (x=1;x!==wid;x++) {
            y=halfHigh+Math.trunc(data[idx]*halfHigh);
            ctx.lineTo(x,y);
            
            idx+=dataSkip;
        }

        ctx.stroke();
    }
    
    clickSound(soundIdx)
    {
        sound.play(null,this.soundBuffers[soundIdx]);
    }
    
    addSounds(idx)
    {
        let canvas,ctx,div;
        let soundBuffer;
        
            // generate random sound

        soundBuffer=this.genSound.generate(idx,true);
        this.soundBuffers.push(soundBuffer);      // so we can play later

            // label

        div=document.createElement('div');
        div.style.position="absolute";
        div.style.left='5px';
        div.style.top=this.drawTop+'px';
        div.innerHTML=this.genSound.TYPE_NAMES[idx];
        document.body.appendChild(div);

        this.drawTop+=25;

        canvas=document.createElement('canvas');
        canvas.style.position="absolute";
        canvas.style.left='5px';
        canvas.style.top=this.drawTop+'px';
        canvas.style.border='1px solid #000000';
        canvas.width=this.soundWid;
        canvas.height=this.soundHigh;
        canvas.style.cursor='pointer';
        canvas.onclick=this.clickSound.bind(this,idx);

        ctx=canvas.getContext('2d');
        this.drawWave(ctx,this.soundWid,this.soundHigh,soundBuffer.buffer.getChannelData(0));

        document.body.appendChild(canvas);

        this.drawTop+=(this.soundHigh+5);
        
            // next bitmap
            
        idx++;
        if (idx>=this.genSound.TYPE_NAMES.length) return;
        
        setTimeout(this.addSounds.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
        //
        // main run for debug
        //
        
    run()
    {
        this.addSounds(0);
    }
}

//
// the global main debug object
// and the debug runner
//

let debugSound=new DebugSoundClass();

function debugSoundRun()
{
    debugSound.run();
}
