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
        
        this.genBitmapWall=new GenBitmapWallClass(new GenRandomClass(config.SEED_TEXTURE));
        this.genBitmapFloor=new GenBitmapFloorClass(new GenRandomClass(config.SEED_TEXTURE));
        this.genBitmapCeiling=new GenBitmapCeilingClass(new GenRandomClass(config.SEED_TEXTURE));
        this.genBitmapMachine=new GenBitmapMachineClass(new GenRandomClass(config.SEED_TEXTURE));
        this.genBitmapLiquid=new GenBitmapLiquidClass(new GenRandomClass(config.SEED_TEXTURE));
        this.genBitmapSkin=new GenBitmapSkinClass(new GenRandomClass(config.SEED_TEXTURE));
        this.genBitmapItem=new GenBitmapItemClass(new GenRandomClass(config.SEED_TEXTURE));
        this.genBitmapSky=new GenBitmapSkyClass(new GenRandomClass(config.SEED_TEXTURE));
        this.genBitmapParticle=new GenBitmapParticleClass(new GenRandomClass(config.SEED_TEXTURE));
        
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
        if (debugBitmap.normal!==null) ctx.drawImage(debugBitmap.normal,wid,0,wid,this.bitmapHigh);
        if (debugBitmap.specular!==null) ctx.drawImage(debugBitmap.specular,(wid*2),0,wid,this.bitmapHigh);

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
            setTimeout(this.addBitmapFloor.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapWall.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
    addBitmapFloor(idx)
    {
        this.drawSingleBitmap('Floor',this.genBitmapFloor.TYPE_NAMES[idx],this.genBitmapFloor.generate(idx,true));

        idx++;
        if (idx>=this.genBitmapFloor.TYPE_NAMES.length) {
            setTimeout(this.addBitmapCeiling.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapFloor.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
    addBitmapCeiling(idx)
    {
        this.drawSingleBitmap('Ceiling',this.genBitmapCeiling.TYPE_NAMES[idx],this.genBitmapCeiling.generate(idx,true));

        idx++;
        if (idx>=this.genBitmapCeiling.TYPE_NAMES.length) {
            setTimeout(this.addBitmapMachine.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapCeiling.bind(this,idx),PROCESS_TIMEOUT_MSEC);
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
            setTimeout(this.addBitmapSkins.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapLiquids.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
    addBitmapSkins(idx)
    {
        this.drawSingleBitmap('Skin',this.genBitmapSkin.TYPE_NAMES[idx],this.genBitmapSkin.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapSkin.TYPE_NAMES.length) {
            setTimeout(this.addBitmapItems.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapSkins.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
    addBitmapItems(idx)
    {
        this.drawSingleBitmap('Item',this.genBitmapItem.TYPE_NAMES[idx],this.genBitmapItem.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapItem.TYPE_NAMES.length) {
            setTimeout(this.addBitmapSkies.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapSkin.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
   
    addBitmapSkies(idx)
    {
        this.drawSingleBitmap('Sky',this.genBitmapSky.TYPE_NAMES[idx],this.genBitmapSky.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapSky.TYPE_NAMES.length) {
            setTimeout(this.addBitmapParticles.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapSkies.bind(this,idx),PROCESS_TIMEOUT_MSEC);
    }
    
    addBitmapParticles(idx)
    {
        this.drawSingleBitmap('Particle',this.genBitmapParticle.TYPE_NAMES[idx],this.genBitmapParticle.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapParticle.TYPE_NAMES.length) {
            setTimeout(this.addSounds.bind(this,0),PROCESS_TIMEOUT_MSEC);
            return;
        }
        
        setTimeout(this.addBitmapParticles.bind(this,idx),PROCESS_TIMEOUT_MSEC);
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
