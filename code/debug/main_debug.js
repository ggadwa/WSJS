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
        
        this.genBitmapWall=new GenBitmapWallClass(new GenRandomClass(config.SEED_BITMAP_MAP));
        this.genBitmapFloorCeiling=new GenBitmapFloorCeilingClass(new GenRandomClass(config.SEED_BITMAP_MAP));
        this.genBitmapMachine=new GenBitmapMachineClass(new GenRandomClass(config.SEED_BITMAP_MAP));
        this.genBitmapLiquid=new GenBitmapLiquidClass(new GenRandomClass(config.SEED_BITMAP_MAP));
        this.genBitmapModel=new GenBitmapModelClass(new GenRandomClass(config.SEED_BITMAP_MAP));

        this.genBitmapSky=null;
        this.genBitmapParticle=null;
        
        this.debugSoundList=null;
        this.genSound=null;
        
        Object.seal(this);
    }
    
        //
        // draw single bitmap
        //
        
    drawSingleBitmap(genName,typeName,debugBitmap)
    {
        var canvas,ctx,div;
        var wid=Math.trunc(this.bitmapWid/3);

            // label

        div=document.createElement('div');
        div.style.position="absolute";
        div.style.left='5px';
        div.style.top=this.drawTop+'px';
        div.innerHTML=genName+': '+typeName;
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
    }
    
        //
        // bitmap types
        //
        
    addBitmapWall(idx)
    {
        this.drawSingleBitmap('Wall',this.genBitmapWall.TYPE_NAMES[idx],this.genBitmapWall.generate(idx,true));

        idx++;
        if (idx>=this.genBitmapWall.TYPE_NAMES.length) {
            setTimeout(this.addBitmapFloorCeiling.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapWall.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
    addBitmapFloorCeiling(idx)
    {
        this.drawSingleBitmap('Floor/Ceiling',this.genBitmapFloorCeiling.TYPE_NAMES[idx],this.genBitmapFloorCeiling.generate(idx,true));

        idx++;
        if (idx>=this.genBitmapFloorCeiling.TYPE_NAMES.length) {
            setTimeout(this.addBitmapMachine.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapFloorCeiling.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
    addBitmapMachine(idx)
    {
        this.drawSingleBitmap('Machine',this.genBitmapMachine.TYPE_NAMES[idx],this.genBitmapMachine.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapMachine.TYPE_NAMES.length) {
            setTimeout(this.addBitmapLiquids.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapMachine.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
    addBitmapLiquids(idx)
    {
        this.drawSingleBitmap('Liquid',this.genBitmapLiquid.TYPE_NAMES[idx],this.genBitmapLiquid.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapLiquid.TYPE_NAMES.length) {
            setTimeout(this.addBitmapModels.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapLiquids.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
    addBitmapModels(idx)
    {
        this.drawSingleBitmap('Model',this.genBitmapModel.TYPE_NAMES[idx],this.genBitmapModel.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapModel.TYPE_NAMES.length) {
            setTimeout(this.addBitmapMachine.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapSkies.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
        //
        // sky bitmaps
        //
        
    addBitmapSkies(idx)
    {
        var canvas,ctx,div;
        var wid;
        var debugBitmap;

        wid=Math.trunc(this.bitmapWid/3);

            // generate random bitmap

        debugBitmap=this.genBitmapSky.generate(idx,true);

            // label

        div=document.createElement('div');
        div.style.position="absolute";
        div.style.left='5px';
        div.style.top=this.drawTop+'px';
        div.innerHTML='[SKY] '+this.genBitmapSky.TYPE_NAMES[idx];
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

        document.body.appendChild(canvas);

        this.drawTop+=(this.bitmapHigh+5);
        
            // next bitmap
            
        idx++;
        if (idx>=this.genBitmapSky.TYPE_NAMES.length) {
            setTimeout(this.addBitmapParticles.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapSkies.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
        //
        // particle bitmaps
        //
        
    addBitmapParticles(idx)
    {
        var canvas,ctx,div;
        var wid;
        var debugBitmap;

        wid=Math.trunc(this.bitmapWid/3);

            // generate random bitmap

        debugBitmap=this.genBitmapParticle.generate(idx,true);

            // label

        div=document.createElement('div');
        div.style.position="absolute";
        div.style.left='5px';
        div.style.top=this.drawTop+'px';
        div.innerHTML='[PARTICLE] '+this.genBitmapParticle.TYPE_NAMES[idx];
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

        document.body.appendChild(canvas);

        this.drawTop+=(this.bitmapHigh+5);
        
            // next bitmap
            
        idx++;
        if (idx>=this.genBitmapParticle.TYPE_NAMES.length) {
            setTimeout(this.addSounds.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapSkies.bind(this,idx),PROCESS_TIMEOUT_MSEC);
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

        debugSound=this.genSound.generate('test',idx,true);
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
            
        this.genBitmapLiquid=new GenBitmapLiquidClass(new GenRandomClass(config.SEED_BITMAP_LIQUID));
        this.genBitmapModel=new GenBitmapModelClass(new GenRandomClass(config.SEED_BITMAP_MODEL));
        this.genBitmapSky=new GenBitmapSkyClass(new GenRandomClass(config.SEED_BITMAP_SKY));
        this.genBitmapParticle=new GenBitmapParticleClass(new GenRandomClass(config.SEED_BITMAP_PARTICLE));
        
        this.debugSoundList=new SoundListClass();
        if (!this.debugSoundList.initialize()) {
            alert('Sound initialization failed');
            return;
        }
        
        this.genSound=new GenSoundClass(this.debugSoundList.getAudioContext(),new GenRandomClass(config.SEED_SOUND));

            // start the timed process
            
        this.addBitmapWall(0);
    }
}

//
// the global main debug object
// and the debug runner
//

var mainDebug=new MainDebugClass();

function mainDebugRun()
{
    mainDebug.run();
}
