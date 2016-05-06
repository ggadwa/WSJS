"use strict";

//
// this is a specialized main that just outputs bitmaps and sounds
// so we can check what they look like without running the entire engine
//

class MainDebugClass
{
    constructor()
    {
        this.drawTop=5;
        this.bitmapWid=1200;
        this.bitmapHigh=400;
        this.soundWid=1200;
        this.soundHigh=250;
        
        this.genBitmapMap=null;
        this.genBitmapModel=null;
        
        this.debugSoundList=null;
        this.genSound=null;
        
        Object.seal(this);
    }
    
        //
        // map bitmaps
        //
        
    addBitmapMaps(idx)
    {
        var canvas,ctx,div;
        var wid;
        var debugBitmap;

        wid=Math.trunc(this.bitmapWid/3);

            // generate random bitmap

        debugBitmap=this.genBitmapMap.generate(null,GEN_BITMAP_MAP_TYPE_NAMES[idx],idx);

            // label

        div=document.createElement('div');
        div.style.position="absolute";
        div.style.left='5px';
        div.style.top=this.drawTop+'px';
        div.innerHTML='[MAP] '+GEN_BITMAP_MAP_TYPE_NAMES[idx];
        document.body.appendChild(div);

        this.drawTop+=25;

        canvas=document.createElement('canvas');
        canvas.style.position="absolute";
        canvas.style.left='5px';
        canvas.style.top=this.drawTop+'px';
        canvas.style.border='1px solid #000000';
        canvas.width=this.bitmapWid;
        canvas.height=this.bitmapHigh;

        var ctx=canvas.getContext('2d');
        ctx.drawImage(debugBitmap.bitmap,0,0,wid,this.bitmapHigh);
        ctx.drawImage(debugBitmap.normal,wid,0,wid,this.bitmapHigh);
        ctx.drawImage(debugBitmap.specular,(wid*2),0,wid,this.bitmapHigh);

        document.body.appendChild(canvas);

        this.drawTop+=(this.bitmapHigh+5);
        
            // next bitmap
            
        idx++;
        if (idx>=GEN_BITMAP_MAP_TYPE_NAMES.length) {
            setTimeout(this.addBitmapModels.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapMaps.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
        //
        // model bitmaps
        //
        
    addBitmapModels(idx)
    {
        var canvas,ctx,div;
        var wid;
        var debugBitmap;

        wid=Math.trunc(this.bitmapWid/3);

            // generate random bitmap

        debugBitmap=this.genBitmapModel.generate(null,GEN_BITMAP_MODEL_TYPE_NAMES[idx],idx);

            // label

        div=document.createElement('div');
        div.style.position="absolute";
        div.style.left='5px';
        div.style.top=this.drawTop+'px';
        div.innerHTML='[MODEL] '+GEN_BITMAP_MODEL_TYPE_NAMES[idx];
        document.body.appendChild(div);

        this.drawTop+=25;

        canvas=document.createElement('canvas');
        canvas.style.position="absolute";
        canvas.style.left='5px';
        canvas.style.top=this.drawTop+'px';
        canvas.style.border='1px solid #000000';
        canvas.width=this.bitmapWid;
        canvas.height=this.bitmapHigh;

        var ctx=canvas.getContext('2d');
        ctx.drawImage(debugBitmap.bitmap,0,0,wid,this.bitmapHigh);
        ctx.drawImage(debugBitmap.normal,wid,0,wid,this.bitmapHigh);
        ctx.drawImage(debugBitmap.specular,(wid*2),0,wid,this.bitmapHigh);

        document.body.appendChild(canvas);

        this.drawTop+=(this.bitmapHigh+5);
        
            // next bitmap
            
        idx++;
        if (idx>=GEN_BITMAP_MODEL_TYPE_NAMES.length) {
            setTimeout(this.addSounds.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapModels.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
   
        //
        // sound waves
        //
    
    drawWave(ctx,wid,high,data)
    {
        var n,fx,fxAdd,y,halfHigh;
        var dataLen=data.length;

            // get x divisions

        fx=0;
        fxAdd=wid/dataLen;
        halfHigh=Math.trunc(high/2);

            // draw the wave

        ctx.strokeStyle='#0000FF';
        ctx.beginPath();

        y=halfHigh+Math.trunc(data[0]*halfHigh);
        ctx.moveTo(Math.trunc(fx),y);

        for (n=1;n<dataLen;n++) {
            fx+=fxAdd;
            y=halfHigh+Math.trunc(data[n]*halfHigh);
            ctx.lineTo(Math.trunc(fx),y);
        }

        ctx.stroke();
    }
    
    clickSound(name)
    {
        this.debugSoundList.getSound(name).playSimple();
    }
    
    addSounds(idx)
    {
        var canvas,ctx,div;
        var debugSound;
        
            // generate random sound

        debugSound=this.genSound.generate(GEN_SOUND_TYPE_NAMES[idx],idx);
        this.debugSoundList.addSound(debugSound);      // so we can play later

            // label

        div=document.createElement('div');
        div.style.position="absolute";
        div.style.left='5px';
        div.style.top=this.drawTop+'px';
        div.innerHTML=GEN_SOUND_TYPE_NAMES[idx];
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
        canvas.onclick=this.clickSound.bind(this,GEN_SOUND_TYPE_NAMES[idx]);

        var ctx=canvas.getContext('2d');
        this.drawWave(ctx,this.soundWid,this.soundHigh,debugSound.buffer.getChannelData(0));

        document.body.appendChild(canvas);

        this.drawTop+=(this.soundHigh+5);
        
            // next bitmap
            
        idx++;
        if (idx>=GEN_SOUND_TYPE_NAMES.length) return;
        
        setTimeout(this.addSounds.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
        //
        // main run for debug
        //
        
    run()
    {
            // construct necessary classes
            
        this.genBitmapMap=new GenBitmapMapClass(new GenRandomClass(config.SEED_BITMAP_MAP));
        this.genBitmapModel=new GenBitmapModelClass(new GenRandomClass(config.SEED_BITMAP_MODEL));
        
        this.debugSoundList=new SoundListClass();
        if (!this.debugSoundList.initialize()) {
            alert('Sound initialization failed');
            return;
        }
        
        this.genSound=new GenSoundClass(this.debugSoundList.getAudioContext(),new GenRandomClass(config.SEED_SOUND));

            // start the timed process
            
        this.addBitmapMaps(0);
    }
}

var mainDebug=new MainDebugClass();

function mainDebugRun()
{
    mainDebug.run();
}
