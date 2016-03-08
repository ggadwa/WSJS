"use strict";

var debugSoundList;

//
// this is a specialized main that just outputs bitmaps and sounds
// so we can check what they look like without running the entire engine
//

function debugDrawWave(ctx,wid,high,data)
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

function debugClickSound(event,name)
{
    debugSoundList.get(name).playSimple();
}

function debugInit()
{
    var n,nBitmap,nSound;
    var canvas,ctx,div;
    var top,wid;
    var genBitmap,debugBitmap,genSound,debugSound;
    var bitmapWid=1200;
    var bitmapHigh=400;
    var soundWid=1200;
    var soundHigh=250;
    
        // the bitmaps
    
    top=5;
    wid=Math.trunc(bitmapWid/3);
    nBitmap=GEN_BITMAP_TYPE_NAMES.length;
    
    genBitmap=new GenBitmapObject(new GenRandomObject(SEED_MAP_BITMAP));
    
    for (n=0;n!==nBitmap;n++) {
        
            // generate random bitmap
            
        debugBitmap=genBitmap.generate(null,GEN_BITMAP_TYPE_NAMES[n],n);
        
            // label

        div=document.createElement('div');
        div.style.position="absolute";
        div.style.left='5px';
        div.style.top=top+'px';
        div.innerHTML=GEN_BITMAP_TYPE_NAMES[n];
        document.body.appendChild(div);
        
        top+=25;
        
        canvas=document.createElement('canvas');
        canvas.style.position="absolute";
        canvas.style.left='5px';
        canvas.style.top=top+'px';
        canvas.style.border='1px solid #000000';
        canvas.width=bitmapWid;
        canvas.height=bitmapHigh;

        var ctx=canvas.getContext('2d');
        ctx.drawImage(debugBitmap.bitmap,0,0,wid,bitmapHigh);
        ctx.drawImage(debugBitmap.normal,wid,0,wid,bitmapHigh);
        ctx.drawImage(debugBitmap.specular,(wid*2),0,wid,bitmapHigh);

        document.body.appendChild(canvas);
        
        top+=bitmapHigh+5;
    }
    
        // the sounds
        // need to create soundlist for audio sample rates
        
    debugSoundList=new SoundList();
    if (!debugSoundList.initialize()) return;

    nSound=GEN_SOUND_TYPE_NAMES.length;
    
    genSound=new GenSoundObject(debugSoundList.getAudioContext(),new GenRandomObject(SEED_SOUND));
    
    for (n=0;n!==nSound;n++) {
        
            // generate random sound
            
        debugSound=genSound.generate(GEN_SOUND_TYPE_NAMES[n],n);
        debugSoundList.add(debugSound);      // so we can play later

            // label

        div=document.createElement('div');
        div.style.position="absolute";
        div.style.left='5px';
        div.style.top=top+'px';
        div.innerHTML=GEN_SOUND_TYPE_NAMES[n];
        document.body.appendChild(div);
        
        top+=25;
        
        canvas=document.createElement('canvas');
        canvas.style.position="absolute";
        canvas.style.left='5px';
        canvas.style.top=top+'px';
        canvas.style.border='1px solid #000000';
        canvas.width=soundWid;
        canvas.height=soundHigh;
        canvas.style.cursor='pointer';
        canvas.onclick=new Function('event','debugClickSound(event,\''+GEN_SOUND_TYPE_NAMES[n]+'\')');

        var ctx=canvas.getContext('2d');
        debugDrawWave(ctx,soundWid,soundHigh,debugSound.buffer.getChannelData(0));

        document.body.appendChild(canvas);
        
        top+=soundHigh+5;
    }

}