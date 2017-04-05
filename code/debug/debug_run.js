/* global sound */

"use strict";

class DebugItemClass
{
    constructor(name,typeIdx,objType,obj,isHeader)
    {
        this.name=name;
        this.typeIdx=typeIdx;
        this.objType=objType;
        this.obj=obj;
        this.isHeader=isHeader;
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
        this.modelCanvas=null;
        this.currentSoundBuffer=null;
        
        this.DEBUG_ITEM_TYPE_BITMAP=0;
        this.DEBUG_ITEM_TYPE_SOUND=1;
        this.DEBUG_ITEM_TYPE_MODEL=2;
        
        this.list=[];
        
        this.list.push(new DebugItemClass('Models',-1,-1,null,true));
        this.fillListWithModelGenerator();

        this.list.push(new DebugItemClass('Bitmaps',-1,-1,null,true));
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
        this.list.push(new DebugItemClass('Sounds',-1,-1,null,true));
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
            this.list.push(new DebugItemClass(name,n,this.DEBUG_ITEM_TYPE_BITMAP,obj,false));
        }
    }
    
    fillListWithSoundGenerator(obj)
    {
        let n;
        
        for (n=0;n!==obj.TYPE_NAMES.length;n++) {
            this.list.push(new DebugItemClass(null,n,this.DEBUG_ITEM_TYPE_SOUND,obj,false));
        }
    }
    
    fillListWithModelGenerator()
    {
        let n;
        
        for (n=0;n!==modelConstants.TYPE_NAMES.length;n++) {
            this.list.push(new DebugItemClass(null,n,this.DEBUG_ITEM_TYPE_MODEL,modelConstants,false));
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
        this.modelCanvas.style.display='none';
        this.bitmapCanvas.style.display='';
    }
    
    drawSound(item)
    {
        let x,dataSkip,dataLen,y,idx,halfHigh;
        let data;
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
        this.modelCanvas.style.display='none';
        this.soundCanvas.style.display='';
    }
    
    playSound()
    {
        sound.play(null,this.currentSoundBuffer);
    }
    
    drawModelMesh(ctx,mesh,wid,high)
    {
        let n,v,x,y,x1,y1,x2,y2,midX,idx,trigCount;
        let minX,maxX,minY,maxY;
        let xFactor,yFactor,factor;
        
            // get the total size
            
        minX=maxX=0;
        minY=maxY=0;
        
        for (n=0;n!==mesh.vertexCount;n++) {
            v=mesh.vertexList[n];
            
            x=v.position.x;
            y=v.position.y;
            
            if (x<minX) minX=x;
            if (x>maxX) maxX=x;
            if (y<minY) minY=y;
            if (y>maxY) maxY=y;
        }
        
        xFactor=wid/(maxX-minX);
        yFactor=high/(maxY-minY);
        
        factor=xFactor;
        if (yFactor>factor) factor=yFactor;
        
            // draw the trigs
        
        midX=Math.trunc(wid*0.5);
        
        idx=0;
        trigCount=Math.trunc(mesh.vertexCount/3);
        
        ctx.strokeStyle='#00AA00';
        
        for (n=0;n!==trigCount;n++) {
            
            v=mesh.vertexList[idx++];
            x=midX+(v.position.x*factor);
            y=high+(v.position.y*factor);
            
            v=mesh.vertexList[idx++];
            x1=midX+(v.position.x*factor);
            y1=high+(v.position.y*factor);
            
            v=mesh.vertexList[idx++];
            x2=midX+(v.position.x*factor);
            y2=high+(v.position.y*factor);

            ctx.beginPath();
            ctx.moveTo(x,y);
            ctx.lineTo(x1,y1);
            ctx.lineTo(x2,y2);
            ctx.lineTo(x,y);
            ctx.stroke();
        }
    }
    
    drawModel(item)
    {
        let ctx;
        let model,genModel;
        let wid=this.modelCanvas.width;
        let high=this.modelCanvas.height;
        
            // build the model
        
        model=new ModelClass('test',item.typeIdx);
        
        genModel=new GenModelClass();
        genModel.build(model,null,1.0,true);

            // erase canvas
            
        ctx=this.modelCanvas.getContext('2d');
        ctx.fillStyle='#CCCCCC';
        ctx.fillRect(0,0,wid,high);
        
            // draw axis
            
        this.drawModelMesh(ctx,model.mesh,wid,high);
        
            // show the canvas
            
        this.bitmapCanvas.style.display='none';
        this.soundCanvas.style.display='none';
        this.modelCanvas.style.display='';
    }
    
        //
        // list clicking
        //
        
    clickListItem(idx)
    {
        let item,itemDiv;
        
            // the list selection
            
        if (this.lastItemDiv!==null) this.lastItemDiv.style.backgroundColor=null;
        
        itemDiv=document.getElementById('item_'+idx);
        itemDiv.style.backgroundColor='#FF00FF';
        
        this.lastItemDiv=itemDiv;
        
            // draw the item
            
        item=this.list[idx];
        
        switch (item.objType) {
            case this.DEBUG_ITEM_TYPE_BITMAP:
                setTimeout(this.drawBitmap.bind(this,item),1);
                break;
            case this.DEBUG_ITEM_TYPE_SOUND:
                setTimeout(this.drawSound.bind(this,item),1);
                break;
            case this.DEBUG_ITEM_TYPE_MODEL:
                setTimeout(this.drawModel.bind(this,item),1);
                break;
        }
    }
    
    clickListHeader(idx)
    {
        let viewDiv;
        
        viewDiv=document.getElementById('view_'+idx);
        viewDiv.style.display=(viewDiv.style.display==='')?'none':'';
    }
    
        //
        // add interface
        //
    
    createInterface()
    {
        let n,item,name;
        let itemDiv,headerDiv,viewDiv,parentDiv;
        
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
            
        parentDiv=null;
            
        for (n=0;n!==this.list.length;n++) {
            item=this.list[n];
            
                // headers
            
            if (item.isHeader) {
                headerDiv=document.createElement('div');
                headerDiv.id='header_'+n;
                headerDiv.style.paddingLeft='4px';
                headerDiv.style.cursor='pointer';
                headerDiv.appendChild(document.createTextNode(item.name));
                headerDiv.onclick=this.clickListHeader.bind(this,n);
                
                this.listDiv.appendChild(headerDiv);
                
                viewDiv=document.createElement('div');
                viewDiv.id='view_'+n;
                viewDiv.style.paddingLeft='24px';
                viewDiv.style.display='none';
                
                this.listDiv.appendChild(viewDiv);
                
                parentDiv=viewDiv;
                continue;
            }
            
                // regular items
            
            switch (item.objType) {
                case this.DEBUG_ITEM_TYPE_BITMAP:
                    name=item.name+'>'+item.obj.TYPE_NAMES[item.typeIdx];
                    break;
                case this.DEBUG_ITEM_TYPE_SOUND:
                    name=item.obj.TYPE_NAMES[item.typeIdx];
                    break;
                case this.DEBUG_ITEM_TYPE_MODEL:
                    name=item.obj.TYPE_NAMES[item.typeIdx];
                    break;
            }
            
            itemDiv=document.createElement('div');
            itemDiv.id='item_'+n;
            itemDiv.style.paddingLeft='4px';
            itemDiv.style.cursor='pointer';
            itemDiv.appendChild(document.createTextNode(name));
            itemDiv.onclick=this.clickListItem.bind(this,n);
            
            parentDiv.appendChild(itemDiv);
        }
        
        document.body.appendChild(this.listDiv);
        
            // the bitmap canvas
            
        this.bitmapCanvas=document.createElement('canvas');
        this.bitmapCanvas.style.position="absolute";
        this.bitmapCanvas.style.left='305px';
        this.bitmapCanvas.style.top='5px';
        this.bitmapCanvas.style.border='1px solid #000000';
        this.bitmapCanvas.style.display='none';
        this.bitmapCanvas.width=1024;
        this.bitmapCanvas.height=1024;
        
        document.body.appendChild(this.bitmapCanvas);
        
            // the sound canvas
            
        this.soundCanvas=document.createElement('canvas');
        this.soundCanvas.style.position="absolute";
        this.soundCanvas.style.left='305px';
        this.soundCanvas.style.top='5px';
        this.soundCanvas.style.border='1px solid #000000';
        this.soundCanvas.style.display='none';
        this.soundCanvas.width=1024;
        this.soundCanvas.height=256;
        this.soundCanvas.onclick=this.playSound.bind(this);
        
        document.body.appendChild(this.soundCanvas);
        
            // the model canvas
            
        this.modelCanvas=document.createElement('canvas');
        this.modelCanvas.style.position="absolute";
        this.modelCanvas.style.left='305px';
        this.modelCanvas.style.top='5px';
        this.modelCanvas.style.border='1px solid #000000';
        this.modelCanvas.style.display='none';
        this.modelCanvas.width=1024;
        this.modelCanvas.height=1024;
        
        document.body.appendChild(this.modelCanvas);
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
