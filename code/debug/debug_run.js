import sound from '../../code/sound/sound.js';

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

export default class DebugRunClass
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
        
        this.DEBUG_MODEL_XY=0;
        this.DEBUG_MODEL_XZ=1;
        this.DEBUG_MODEL_ZY=2;
        
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
        let ctx,debugBitmap,fourWid;
        let wid=this.bitmapCanvas.width;
        let high=this.bitmapCanvas.height;
        
            // generate the bitmap
            
        debugBitmap=item.obj.generate(item.typeIdx,true);
        
            // draw the bitmap
            
        ctx=this.bitmapCanvas.getContext('2d');
        ctx.fillStyle='#FFFFFF';
        ctx.fillRect(0,0,wid,high);
        
        fourWid=Math.trunc(wid/4);
        
        ctx.drawImage(debugBitmap.bitmap,0,0,fourWid,high);
        if (debugBitmap.normal!==null) ctx.drawImage(debugBitmap.normal,fourWid,0,fourWid,high);
        if (debugBitmap.specular!==null) ctx.drawImage(debugBitmap.specular,(fourWid*2),0,fourWid,high);
        if (debugBitmap.glow!==null) ctx.drawImage(debugBitmap.glow,(fourWid*3),0,fourWid,high);
        
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
    
    drawModelMeshGetX(axisType,pos)
    {
        switch (axisType) {
            case this.DEBUG_MODEL_XY:
                return(pos.x);
            case this.DEBUG_MODEL_XZ:
                return(pos.x);
            case this.DEBUG_MODEL_ZY:
                return(pos.z);
        }
        
        return(0);
    }
    
    drawModelMeshGetY(axisType,pos)
    {
        switch (axisType) {
            case this.DEBUG_MODEL_XY:
                return(pos.y);
            case this.DEBUG_MODEL_XZ:
                return(pos.z);
            case this.DEBUG_MODEL_ZY:
                return(pos.y);
        }
        
        return(0);
    }
    
    drawModelGetOffsetX(axisType,wid)
    {
        switch (axisType) {
            case this.DEBUG_MODEL_XY:
                return(Math.trunc(wid*0.5));
            case this.DEBUG_MODEL_XZ:
                return(Math.trunc(wid*0.5));
            case this.DEBUG_MODEL_ZY:
                return(Math.trunc(wid*0.5));
        }
        
        return(0);
    }
    
    drawModelGetOffsetY(axisType,high)
    {
        switch (axisType) {
            case this.DEBUG_MODEL_XY:
                return(high);
            case this.DEBUG_MODEL_XZ:
                return(Math.trunc(high*0.5));
            case this.DEBUG_MODEL_ZY:
                return(high);
        }
        
        return(0);
    }
    
    drawModelGetFactor(model,axisType,wid,high)
    {
        let n,x,y,minX,minY,maxX,maxY,v;
        let mesh,bone,nBone;
        let xFactor,yFactor;
        
        minX=minY=1000000;
        maxX=maxY=-1000000;
        
        mesh=model.mesh;
        
        for (n=0;n!==mesh.vertexCount;n++) {
            v=mesh.vertexList[n];
            x=this.drawModelMeshGetX(axisType,v.position);
            y=this.drawModelMeshGetY(axisType,v.position);
            
            if (x<minX) minX=x;
            if (x>maxX) maxX=x;
            if (y<minY) minY=y;
            if (y>maxY) maxY=y;
        }
        
        nBone=model.skeleton.bones.length;
        
        for (n=0;n!==nBone;n++) {
            bone=model.skeleton.bones[n];
            
            x=this.drawModelMeshGetX(axisType,bone.position);
            y=this.drawModelMeshGetY(axisType,bone.position);
            
            if (x<minX) minX=x;
            if (x>maxX) maxX=x;
            if (y<minY) minY=y;
            if (y>maxY) maxY=y;
        }
        
        xFactor=wid/Math.abs(maxX-minX);
        yFactor=high/Math.abs(maxY-minY);
        
        return((xFactor<yFactor)?xFactor:yFactor);
    }
    
    drawModelBackground(ctx,lft,top,wid,high,backgroundColor)
    {
        ctx.fillStyle=backgroundColor;
        ctx.fillRect(lft,top,wid,high);
    }
    
    drawModelMesh(ctx,mesh,axisType,factor,xOffset,yOffset,lft,top,wid,high)
    {
        let n,v,x,y,x1,y1,x2,y2,idx,trigCount;
        
            // draw the trigs
        
        idx=0;
        trigCount=Math.trunc(mesh.indexCount/3);
        
        ctx.strokeStyle='#00AA00';
        
        for (n=0;n!==trigCount;n++) {
            
            v=mesh.vertexList[mesh.indexes[idx++]];
            x=lft+(xOffset+(this.drawModelMeshGetX(axisType,v.position)*factor));
            y=top+(yOffset+(this.drawModelMeshGetY(axisType,v.position)*factor));
            
            v=mesh.vertexList[mesh.indexes[idx++]];
            x1=lft+(xOffset+(this.drawModelMeshGetX(axisType,v.position)*factor));
            y1=top+(yOffset+(this.drawModelMeshGetY(axisType,v.position)*factor));
            
            v=mesh.vertexList[mesh.indexes[idx++]];
            x2=lft+(xOffset+(this.drawModelMeshGetX(axisType,v.position)*factor));
            y2=top+(yOffset+(this.drawModelMeshGetY(axisType,v.position)*factor));

            ctx.beginPath();
            ctx.moveTo(x,y);
            ctx.lineTo(x1,y1);
            ctx.lineTo(x2,y2);
            ctx.lineTo(x,y);
            ctx.stroke();
        }
    }
    
    drawModelSkeleton(ctx,skeleton,axisType,factor,xOffset,yOffset,lft,top,wid,high)
    {
        let n,nBone,bone,x,y,x1,y1;
        
        nBone=skeleton.bones.length;
        
            // bones
            
        ctx.strokeStyle='#AA00AA';
        ctx.lineWidth=3;

        for (n=0;n!==nBone;n++) {
            if (skeleton.bones[n].parentBoneIdx===-1) continue;

            bone=skeleton.bones[n];
            x=lft+(xOffset+(this.drawModelMeshGetX(axisType,bone.position)*factor));
            y=top+(yOffset+(this.drawModelMeshGetY(axisType,bone.position)*factor));
            
            bone=skeleton.bones[skeleton.bones[n].parentBoneIdx];
            x1=lft+(xOffset+(this.drawModelMeshGetX(axisType,bone.position)*factor));
            y1=top+(yOffset+(this.drawModelMeshGetY(axisType,bone.position)*factor));

            ctx.beginPath();
            ctx.moveTo(x,y);
            ctx.lineTo(x1,y1);
            ctx.stroke();
        }
        
        ctx.lineWidth=1;
        
            // points
            
        ctx.fillStyle='#AA0000';
        
        for (n=0;n!==nBone;n++) {
            bone=skeleton.bones[n];
            x=lft+(xOffset+(this.drawModelMeshGetX(axisType,bone.position)*factor));
            y=top+(yOffset+(this.drawModelMeshGetY(axisType,bone.position)*factor));
            
            ctx.fillRect((x-4),(y-4),8,8);
        }
    }
    
    drawModel(item)
    {
        let ctx;
        let model,genModel,factor,xOffset,yOffset,thirdWid;
        let wid=this.modelCanvas.width;
        let high=this.modelCanvas.height;

        
            // build the model
        
        model=new ModelClass('test',item.typeIdx);
        
        genModel=new GenModelClass();
        genModel.build(model,null,1.0,true);
        
            // draw axises
        
        thirdWid=Math.trunc(wid/3);

        ctx=this.modelCanvas.getContext('2d');
        
        this.drawModelBackground(ctx,0,0,thirdWid,high,'#CCCCCC');
        factor=this.drawModelGetFactor(model,this.DEBUG_MODEL_XY,thirdWid,high);
        xOffset=this.drawModelGetOffsetX(this.DEBUG_MODEL_XY,thirdWid);
        yOffset=this.drawModelGetOffsetY(this.DEBUG_MODEL_XY,high);
        this.drawModelSkeleton(ctx,model.skeleton,this.DEBUG_MODEL_XY,factor,xOffset,yOffset,0,0,thirdWid,high);
        this.drawModelMesh(ctx,model.mesh,this.DEBUG_MODEL_XY,factor,xOffset,yOffset,0,0,thirdWid,high);
        
        this.drawModelBackground(ctx,thirdWid,0,thirdWid,high,'#EEEEEE');
        factor=this.drawModelGetFactor(model,this.DEBUG_MODEL_ZY,thirdWid,high);
        xOffset=this.drawModelGetOffsetX(this.DEBUG_MODEL_ZY,thirdWid);
        yOffset=this.drawModelGetOffsetY(this.DEBUG_MODEL_ZY,high);
        this.drawModelSkeleton(ctx,model.skeleton,this.DEBUG_MODEL_ZY,factor,xOffset,yOffset,thirdWid,0,thirdWid,high);
        this.drawModelMesh(ctx,model.mesh,this.DEBUG_MODEL_ZY,factor,xOffset,yOffset,thirdWid,0,thirdWid,high);
        
        this.drawModelBackground(ctx,(thirdWid*2),0,thirdWid,high,'#CCCCCC');
        factor=this.drawModelGetFactor(model,this.DEBUG_MODEL_XZ,thirdWid,high);
        xOffset=this.drawModelGetOffsetX(this.DEBUG_MODEL_XZ,thirdWid);
        yOffset=this.drawModelGetOffsetY(this.DEBUG_MODEL_XZ,high);
        this.drawModelSkeleton(ctx,model.skeleton,this.DEBUG_MODEL_XZ,factor,xOffset,yOffset,(thirdWid*2),0,thirdWid,high);
        this.drawModelMesh(ctx,model.mesh,this.DEBUG_MODEL_XZ,factor,xOffset,yOffset,(thirdWid*2),0,thirdWid,high);
        
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
        
            // the scrolling div
            
        parentDiv=document.createElement('div');
        parentDiv.style.position="absolute";
        parentDiv.style.left='300px';
        parentDiv.style.top='0px';
        parentDiv.style.overflowX='auto';
        parentDiv.style.overflowY='hidden';
        parentDiv.style.width='calc(100% - 300px)';
        parentDiv.style.height='100%';
            
        document.body.appendChild(parentDiv);
        
            // the bitmap canvas
            
        this.bitmapCanvas=document.createElement('canvas');
        this.bitmapCanvas.style.position="absolute";
        this.bitmapCanvas.style.left='5px';
        this.bitmapCanvas.style.top='5px';
        this.bitmapCanvas.style.border='1px solid #000000';
        this.bitmapCanvas.style.display='none';
        this.bitmapCanvas.width=512*4;
        this.bitmapCanvas.height=512;
        
        parentDiv.appendChild(this.bitmapCanvas);
        
            // the sound canvas
            
        this.soundCanvas=document.createElement('canvas');
        this.soundCanvas.style.position="absolute";
        this.soundCanvas.style.left='5px';
        this.soundCanvas.style.top='5px';
        this.soundCanvas.style.border='1px solid #000000';
        this.soundCanvas.style.display='none';
        this.soundCanvas.width=1024;
        this.soundCanvas.height=256;
        this.soundCanvas.onclick=this.playSound.bind(this);
        
        parentDiv.appendChild(this.soundCanvas);
        
            // the model canvas
            
        this.modelCanvas=document.createElement('canvas');
        this.modelCanvas.style.position="absolute";
        this.modelCanvas.style.left='5px';
        this.modelCanvas.style.top='5px';
        this.modelCanvas.style.border='1px solid #000000';
        this.modelCanvas.style.display='none';
        this.modelCanvas.width=768*3;
        this.modelCanvas.height=768;
        
        parentDiv.appendChild(this.modelCanvas);
    }
    
        //
        // main run for debug
        //
        
    run()
    {
        this.createInterface();
    }
}
