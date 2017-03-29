/* global sound */

"use strict";

class DebugItemClass
{
    constructor(name,typeIdx,objType,obj)
    {
        this.name=name;
        this.typeIdx=typeIdx;
        this.objType=objType;
        this.obj=obj;
    }
}
//
// this is a specialized main that debug outputs some
// generated items
//

class DebugRunClass
{
    constructor()
    {
        this.listDiv=null;
        this.lastItemDiv=null;
        this.bitmapCanvas=null;
        this.soundCanvas=null;
        this.currentSoundBuffer=null;
        
        this.DEBUG_ITEM_TYPE_BITMAP=0;
        this.DEBUG_ITEM_TYPE_SOUND=1;
        this.DEBUG_ITEM_TYPE_MODEL=2;
        
        this.list=[];

        this.fillListWithBitmapGenerator('Wall',new GenBitmapWallClass());
        this.fillListWithBitmapGenerator('Floor',new GenBitmapFloorClass());
        this.fillListWithBitmapGenerator('Ceiling',new GenBitmapCeilingClass());
        this.fillListWithBitmapGenerator('Door',new GenBitmapDoorClass());
        this.fillListWithBitmapGenerator('Metal',new GenBitmapMetalClass());
        this.fillListWithBitmapGenerator('Machine',new GenBitmapMachineClass());
        this.fillListWithBitmapGenerator('Panel',new GenBitmapPanelClass());
        this.fillListWithBitmapGenerator('Box',new GenBitmapBoxClass());
        this.fillListWithBitmapGenerator('Liquid',new GenBitmapLiquidClass());
        this.fillListWithBitmapGenerator('Skin',new GenBitmapSkinClass());
        this.fillListWithBitmapGenerator('Item',new GenBitmapItemClass());
        this.fillListWithBitmapGenerator('Sky',new GenBitmapSkyClass());
        this.fillListWithBitmapGenerator('Particle',new GenBitmapParticleClass());
        
        sound.initialize();
        this.fillListWithSoundGenerator(new GenSoundClass(sound.getAudioContext()));
        
        Object.seal(this);
    }
    
        //
        // break up generator objects by their type names
        //
        
    fillListWithBitmapGenerator(name,obj)
    {
        let n;
        
        for (n=0;n!==obj.TYPE_NAMES.length;n++) {
            this.list.push(new DebugItemClass(name,n,this.DEBUG_ITEM_TYPE_BITMAP,obj));
        }
    }
    
    fillListWithSoundGenerator(obj)
    {
        let n;
        
        for (n=0;n!==obj.TYPE_NAMES.length;n++) {
            this.list.push(new DebugItemClass(null,n,this.DEBUG_ITEM_TYPE_SOUND,obj));
        }
    }
        
        //
        // item drawing
        //
        
    drawBitmap(item)
    {
        let ctx,debugBitmap;
        let wid=this.bitmapCanvas.width;
        let high=this.bitmapCanvas.height;
        
            // generate the bitmap
            
        debugBitmap=item.obj.generate(item.typeIdx,true);
        
            // draw the bitmap
            
        ctx=this.bitmapCanvas.getContext('2d');
        ctx.fillStyle='#FFFFFF';
        ctx.fillRect(0,0,wid,high);
        
        ctx.drawImage(debugBitmap.bitmap,0,0,Math.trunc(wid/2),Math.trunc(high/2));
        if (debugBitmap.normal!==null) ctx.drawImage(debugBitmap.normal,Math.trunc(wid/2),0,Math.trunc(wid/2),Math.trunc(high/2));
        if (debugBitmap.specular!==null) ctx.drawImage(debugBitmap.specular,0,Math.trunc(high/2),Math.trunc(wid/2),Math.trunc(high/2));
        
            // show the canvas
            
        this.soundCanvas.style.display='none';
        this.bitmapCanvas.style.display='';
    }
    
    drawSound(item)
    {
        let x,dataSkip,dataLen,y,idx,halfHigh;
        let soundBuffer,data;
        let ctx;
        let wid=this.soundCanvas.width;
        let high=this.soundCanvas.height;
        
        this.currentSoundBuffer=item.obj.generate(item.typeIdx,true);
        data=this.currentSoundBuffer.buffer.getChannelData(0);
        dataLen=data.length;
        
        ctx=this.soundCanvas.getContext('2d');
        ctx.fillStyle='#FFFFFF';
        ctx.fillRect(0,0,wid,high);
        
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

            // show the canvas
            
        this.bitmapCanvas.style.display='none';
        this.soundCanvas.style.display='';
    }
    
    playSound()
    {
        sound.play(null,this.currentSoundBuffer);
    }
    
        //
        // list clicking
        //
        
    clickList(idx)
    {
        let item,itemDiv;
        
            // the list selection
            
        if (this.lastItemDiv!==null) this.lastItemDiv.style.backgroundColor=null;
        
        itemDiv=document.getElementById('item'+idx);
        itemDiv.style.backgroundColor='#FF00FF';
        
        this.lastItemDiv=itemDiv;
        
            // draw the item
            
        item=this.list[idx];
        
        switch (item.objType) {
            case this.DEBUG_ITEM_TYPE_BITMAP:
                this.drawBitmap(item);
                break;
            case this.DEBUG_ITEM_TYPE_SOUND:
                this.drawSound(item);
                break;
            case this.DEBUG_ITEM_TYPE_MODEL:
                break;
        }
    }
    
        //
        // add interface
        //
        
    createInterface()
    {
        let n,item,name;
        let itemDiv;
        
            // the list
            
        this.listDiv=document.createElement('div');
        this.listDiv.style.position="absolute";
        this.listDiv.style.left='0px';
        this.listDiv.style.top='0px';
        this.listDiv.style.width='300px';
        this.listDiv.style.height='100%';
        this.listDiv.style.backgroundColor='#CCCCFF';
        this.listDiv.style.fontFamily='Arial';
        this.listDiv.style.fontSize='14pt';
        this.listDiv.style.whiteSpace='nowrap';
        this.listDiv.style.boxSizing='border-box';
        this.listDiv.style.border='1px solid #AAAAAA';
        this.listDiv.style.overflowX='hidden';
        this.listDiv.style.overflowY='auto';
        
            // the items
            
        for (n=0;n!==this.list.length;n++) {
            item=this.list[n];
            
            switch (item.objType) {
                case this.DEBUG_ITEM_TYPE_BITMAP:
                    name='Bitmap>'+item.name+'>'+item.obj.TYPE_NAMES[item.typeIdx];
                    break;
                case this.DEBUG_ITEM_TYPE_SOUND:
                    name='Sound>'+item.obj.TYPE_NAMES[item.typeIdx];
                    break;
                case this.DEBUG_ITEM_TYPE_MODEL:
                    name='Model>'+item.name;
                    break;
            }
            
            itemDiv=document.createElement('div');
            itemDiv.id='item'+n;
            itemDiv.style.paddingLeft='4px';
            itemDiv.style.cursor='pointer';
            itemDiv.appendChild(document.createTextNode(name));
            itemDiv.onclick=this.clickList.bind(this,n);
            
            this.listDiv.appendChild(itemDiv);
        }
        
        document.body.appendChild(this.listDiv);
        
            // the bitmap canvas
            
        this.bitmapCanvas=document.createElement('canvas');
        this.bitmapCanvas.style.position="absolute";
        this.bitmapCanvas.style.left='305px';
        this.bitmapCanvas.style.top='0px';
        this.bitmapCanvas.style.border='1px solid #000000';
        this.bitmapCanvas.style.display='none';
        this.bitmapCanvas.width=512;
        this.bitmapCanvas.height=512;
        
        document.body.appendChild(this.bitmapCanvas);
        
            // the sound canvas
            
        this.soundCanvas=document.createElement('canvas');
        this.soundCanvas.style.position="absolute";
        this.soundCanvas.style.left='305px';
        this.soundCanvas.style.top='0px';
        this.soundCanvas.style.border='1px solid #000000';
        this.soundCanvas.style.display='none';
        this.soundCanvas.width=512;
        this.soundCanvas.height=256;
        this.soundCanvas.onclick=this.playSound.bind(this);
        
        document.body.appendChild(this.soundCanvas);
    }
    
        //
        // main run for debug
        //
        
    run()
    {
        this.createInterface();
    }
}

//
// the global debug bitmap object
// and the debug runner
//

let debugRun=new DebugRunClass();

function debugStart()
{
    
    debugRun.run();
}
