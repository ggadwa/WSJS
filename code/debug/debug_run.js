"use strict";

class DebugItemClass
{
    constructor(name,objType,obj)
    {
        this.name=name;
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
        this.canvas=null;
        
        this.drawTop=5;
        this.bitmapWid=1200;
        this.bitmapHigh=400;
        
        this.genBitmapWall=new GenBitmapWallClass();        // supergumba -- delete me later
        this.genBitmapFloor=new GenBitmapFloorClass();
        this.genBitmapCeiling=new GenBitmapCeilingClass();
        this.genBitmapDoor=new GenBitmapDoorClass();
        this.genBitmapMetal=new GenBitmapMetalClass();
        this.genBitmapMachine=new GenBitmapMachineClass();
        this.genBitmapPanel=new GenBitmapPanelClass();
        this.genBitmapBox=new GenBitmapBoxClass();
        this.genBitmapLiquid=new GenBitmapLiquidClass();
        this.genBitmapSkin=new GenBitmapSkinClass();
        this.genBitmapItem=new GenBitmapItemClass();
        this.genBitmapSky=new GenBitmapSkyClass();
        this.genBitmapParticle=new GenBitmapParticleClass();
        
        this.DEBUG_ITEM_TYPE_BITMAP=0;
        this.DEBUG_ITEM_TYPE_SOUND=1;
        this.DEBUG_ITEM_TYPE_MODEL=2;
        
        this.list=[];

        this.list.push(new DebugItemClass('Wall',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapWallClass()));
        this.list.push(new DebugItemClass('Floor',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapFloorClass()));
        this.list.push(new DebugItemClass('Ceiling',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapCeilingClass()));
        this.list.push(new DebugItemClass('Door',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapDoorClass()));
        this.list.push(new DebugItemClass('Metal',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapMetalClass()));
        this.list.push(new DebugItemClass('Machine',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapMachineClass()));
        this.list.push(new DebugItemClass('Panel',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapPanelClass()));
        this.list.push(new DebugItemClass('Box',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapBoxClass()));
        this.list.push(new DebugItemClass('Liquid',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapLiquidClass()));
        this.list.push(new DebugItemClass('Skin',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapSkinClass()));
        this.list.push(new DebugItemClass('Item',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapItemClass()));
        this.list.push(new DebugItemClass('Sky',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapSkyClass()));
        this.list.push(new DebugItemClass('Particle',this.DEBUG_ITEM_TYPE_BITMAP,new GenBitmapParticleClass()));
        
        Object.seal(this);
    }
    
        //
        // draw single bitmap
        //
        
    drawSingleBitmap(genName,typeName,debugBitmap)
    {
        let canvas,ctx,div;
        let wid=Math.trunc(this.bitmapWid/3);

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

        ctx=canvas.getContext('2d');
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
            setTimeout(this.addBitmapFloor.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapWall.bind(this,idx),1);
    }
    
    addBitmapFloor(idx)
    {
        this.drawSingleBitmap('Floor',this.genBitmapFloor.TYPE_NAMES[idx],this.genBitmapFloor.generate(idx,true));

        idx++;
        if (idx>=this.genBitmapFloor.TYPE_NAMES.length) {
            setTimeout(this.addBitmapCeiling.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapFloor.bind(this,idx),1);
    }
    
    addBitmapCeiling(idx)
    {
        this.drawSingleBitmap('Ceiling',this.genBitmapCeiling.TYPE_NAMES[idx],this.genBitmapCeiling.generate(idx,true));

        idx++;
        if (idx>=this.genBitmapCeiling.TYPE_NAMES.length) {
            setTimeout(this.addBitmapDoor.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapCeiling.bind(this,idx),1);
    }
    
    addBitmapDoor(idx)
    {
        this.drawSingleBitmap('Door',this.genBitmapDoor.TYPE_NAMES[idx],this.genBitmapDoor.generate(idx,true));

        idx++;
        if (idx>=this.genBitmapDoor.TYPE_NAMES.length) {
            setTimeout(this.addBitmapMetal.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapDoor.bind(this,idx),1);
    }
    
    addBitmapMetal(idx)
    {
        this.drawSingleBitmap('Metal',this.genBitmapMetal.TYPE_NAMES[idx],this.genBitmapMetal.generate(idx,true));

        idx++;
        if (idx>=this.genBitmapMetal.TYPE_NAMES.length) {
            setTimeout(this.addBitmapMachine.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapMetal.bind(this,idx),1);
    }
   
    addBitmapMachine(idx)
    {
        this.drawSingleBitmap('Machine',this.genBitmapMachine.TYPE_NAMES[idx],this.genBitmapMachine.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapMachine.TYPE_NAMES.length) {
            setTimeout(this.addBitmapPanel.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapMachine.bind(this,idx),1);
    }
    
    addBitmapPanel(idx)
    {
        this.drawSingleBitmap('Panel',this.genBitmapPanel.TYPE_NAMES[idx],this.genBitmapPanel.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapPanel.TYPE_NAMES.length) {
            setTimeout(this.addBitmapBox.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapPanel.bind(this,idx),1);
    }
    
    addBitmapBox(idx)
    {
        this.drawSingleBitmap('Box',this.genBitmapBox.TYPE_NAMES[idx],this.genBitmapBox.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapBox.TYPE_NAMES.length) {
            setTimeout(this.addBitmapLiquids.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapBox.bind(this,idx),1);
    }
    
    addBitmapLiquids(idx)
    {
        this.drawSingleBitmap('Liquid',this.genBitmapLiquid.TYPE_NAMES[idx],this.genBitmapLiquid.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapLiquid.TYPE_NAMES.length) {
            setTimeout(this.addBitmapSkins.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapLiquids.bind(this,idx),1);
    }
    
    addBitmapSkins(idx)
    {
        this.drawSingleBitmap('Skin',this.genBitmapSkin.TYPE_NAMES[idx],this.genBitmapSkin.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapSkin.TYPE_NAMES.length) {
            setTimeout(this.addBitmapItems.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapSkins.bind(this,idx),1);
    }
    
    addBitmapItems(idx)
    {
        this.drawSingleBitmap('Item',this.genBitmapItem.TYPE_NAMES[idx],this.genBitmapItem.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapItem.TYPE_NAMES.length) {
            setTimeout(this.addBitmapSkies.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapSkin.bind(this,idx),1);
    }
   
    addBitmapSkies(idx)
    {
        this.drawSingleBitmap('Sky',this.genBitmapSky.TYPE_NAMES[idx],this.genBitmapSky.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapSky.TYPE_NAMES.length) {
            setTimeout(this.addBitmapParticles.bind(this,0),1);
            return;
        }
        
        setTimeout(this.addBitmapSkies.bind(this,idx),1);
    }
    
    addBitmapParticles(idx)
    {
        this.drawSingleBitmap('Particle',this.genBitmapParticle.TYPE_NAMES[idx],this.genBitmapParticle.generate(idx,true));
        
        idx++;
        if (idx>=this.genBitmapParticle.TYPE_NAMES.length) return;
        
        setTimeout(this.addBitmapParticles.bind(this,idx),1);
    }
    
        //
        // list clicking
        //
        
    clickList(idx)
    {
        console.log(idx);
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
        this.listDiv.style.paddingLeft='4px';
        this.listDiv.style.paddingTop='4px';
        this.listDiv.style.boxSizing='border-box';
        this.listDiv.style.border='1px solid #AAAAAA';
        this.listDiv.style.overflowX='hidden';
        this.listDiv.style.overflowY='auto';
        
            // the items
            
        for (n=0;n!==this.list.length;n++) {
            item=this.list[n];
            
            switch (item.objType) {
                case this.DEBUG_ITEM_TYPE_BITMAP:
                    name='Bitmap:'+item.name;
                    break;
                case this.DEBUG_ITEM_TYPE_SOUND:
                    name='Sound:'+item.name;
                    break;
                case this.DEBUG_ITEM_TYPE_MODEL:
                    name='Model:'+item.name;
                    break;
            }
            
            itemDiv=document.createElement('div');
            itemDiv.style.cursor='pointer';
            itemDiv.appendChild(document.createTextNode(name));
            itemDiv.onclick=this.clickList.bind(this,n);
            
            this.listDiv.appendChild(itemDiv);
        }
        
        document.body.appendChild(this.listDiv);
        
            // the drawing canvas
            
        this.canvas=document.createElement('canvas');
        this.canvas.style.position="absolute";
        this.canvas.style.left='305px';
        this.canvas.style.top='0px';
        this.canvas.style.border='1px solid #000000';
        this.canvas.width=800;
        this.canvas.height=800;
        
        document.body.appendChild(this.canvas);

        //ctx=cvs.getContext('2d');
        //ctx.drawImage(fromCanvas,0,0,wid,high);
    }
    
        //
        // main run for debug
        //
        
    run()
    {
        this.createInterface();
        //this.addBitmapWall(0);
        //this.addBitmapSkies(0);     // supergumba -- testing
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
