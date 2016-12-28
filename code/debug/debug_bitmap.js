"use strict";

//
// this is a specialized main that just outputs bitmaps
// so we can check what they look like without running the entire engine
//

class DebugBitmapClass
{
    constructor()
    {
        this.drawTop=5;
        this.bitmapWid=1200;
        this.bitmapHigh=400;
        
        this.genBitmapWall=new GenBitmapWallClass();
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
        // main run for debug
        //
        
    run()
    {
        this.addBitmapWall(0);
        //this.addBitmapSkies(0);     // supergumba -- testing
    }
}

//
// the global debug bitmap object
// and the debug runner
//

let debugBitmap=new DebugBitmapClass();

function debugBitmapRun()
{
    debugBitmap.run();
}
