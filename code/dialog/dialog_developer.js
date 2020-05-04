import SetupClass from '../main/setup.js';
import DialogBaseClass from '../dialog/dialog_base.js';
import UploadClass from '../main/upload.js';
import ShadowmapLightClass from '../generate/shadowmap/shadowmap_light.js';
import ShadowmapMeshClass from '../generate/shadowmap/shadowmap_mesh.js';

export default class DialogDeveloperClass extends DialogBaseClass
{
    constructor(core)
    {
        super(core);
        
        this.shadowmapThread=null;
    }
    
        //
        // views
        //
        
    addDeveloperControls(viewDiv)
    {
        this.addInput(viewDiv,'test1','Test1:','text',null,'blah',null);
        
        /*
        this.addInput(viewDiv,'localGame','Local Game:','checkbox',null,this.core.setup.localGame,this.localGameChange.bind(this));
        this.addInput(viewDiv,'botCount','Local Bot Count:','select',['0','1','2','3','4','5','6','7','8','9'],this.core.setup.botCount,null);
        this.addInput(viewDiv,'botSkill','Local Bot Skill:','select',['Easy','Moderate','Normal','Skilled','Hard'],this.core.setup.botSkill,null);
        this.addInput(viewDiv,'serverURL','Server URL:','text',null,this.core.setup.serverURL,null);
        this.addInput(viewDiv,'savedServerURLList','Saved Server URLs:','select',this.core.setup.savedServerURLList,-1,this.savedServerListPick.bind(this));
        
        this.localGameChange();         // to reset disabled items
            */
    }
    
    addBuilderControls(viewDiv)
    {
        this.addButton(viewDiv,'buildPathHints','Build Path Hints',this.buildPathHints.bind(this));
        this.addButton(viewDiv,'buildShadowmap','Build Shadowmap',this.buildShadowmap.bind(this));
        
        /*
        this.addInput(viewDiv,'localGame','Local Game:','checkbox',null,this.core.setup.localGame,this.localGameChange.bind(this));
        this.addInput(viewDiv,'botCount','Local Bot Count:','select',['0','1','2','3','4','5','6','7','8','9'],this.core.setup.botCount,null);
        this.addInput(viewDiv,'botSkill','Local Bot Skill:','select',['Easy','Moderate','Normal','Skilled','Hard'],this.core.setup.botSkill,null);
        this.addInput(viewDiv,'serverURL','Server URL:','text',null,this.core.setup.serverURL,null);
        this.addInput(viewDiv,'savedServerURLList','Saved Server URLs:','select',this.core.setup.savedServerURLList,-1,this.savedServerListPick.bind(this));
        
        this.localGameChange();         // to reset disabled items
            */
    }
    
        //
        // buttons
        //
        
    buildPathHints()
    {
        console.info('path hints');
    }
    
    buildShadowmap()
    {
        let n,nMesh,data;
        let light,effect;
        let map=this.core.map;
        
            // already building?
            
        if (this.shadowmapThread!==null) {
            this.displayMessage('Currently in Shadowmap Build');
            return;
        }

            // we need to make a parallel object of
            // all the data because our regular data has DOM
            // elements in it and those can't be passed to
            // workers, we also do all pre-calculation here
            
        data={};
        
            // need to save this from map json
            
        data.shadowMapHighlightBitmaps=map.json.shadowMapHighlightBitmaps;
        
            // pre-calc the meshes
            
        data.meshes=[];
        
        nMesh=map.meshList.meshes.length;
            
        for (n=0;n!==nMesh;n++) {
            data.meshes.push(new ShadowmapMeshClass(map.meshList.meshes[n]));
        }
        
            // pre-calc lights and the meshes they
            // collide with
            
        data.lights=[];
        
        for (n=0;n!==map.lightList.lights.length;n++) {
            light=new ShadowmapLightClass(data.meshes,map.json.shadowMapSkinBitmaps,map.lightList.lights[n]);
            light.calculateCollisionList();
            data.lights.push(light);
        }
        
        for (n=0;n!==map.effectList.effects.length;n++) {
            effect=map.effectList.effects[n];
            if (effect.light===null) continue;
            
            light=new ShadowmapLightClass(data.meshes,map.json.shadowMapSkinBitmaps,effect.light);
            light.calculateCollisionList();
            data.lights.push(light);
        }
        
        this.displayMessage('Starting background shadowmap build');
        
        this.shadowmapThread=new Worker('../../code/generate/shadowmap/shadowmap_thread.js',{type:"module"});
        this.shadowmapThread.addEventListener('message',this.buildShadowmapFinish.bind(this),false);
        this.shadowmapThread.postMessage(data);
    }
    
    buildShadowmapFinish(message)
    {
        let n,k;
        let shadowmap;
        let canvas,ctx,imgData,pIdx,pixel;
        let upload,fileName,data,pixelSize;
        let textureSize=message.data.textureSize;
        let bin=message.data.bin;
        let shadowmapList=message.data.shadowmapList;
        
        this.shadowmapThread.terminate();
        this.shadowmapThread=null;
        
            // upload the data
            
        console.info('Uploading');
        
        this.displayMessage('Shadowmap uploading ('+shadowmapList.length+' maps)');
            
        upload=new UploadClass(this.core);
        
            // turn shadowmaps into canvases
            // and then upload as png
        
        canvas=document.createElement('canvas');
        canvas.width=textureSize;
        canvas.height=textureSize;
        
        ctx=canvas.getContext('2d');
            
        pixelSize=textureSize*textureSize;
        
        for (n=0;n!==shadowmapList.length;n++) {
            shadowmap=shadowmapList[n];
            
                // render unto canvas
                
            imgData=ctx.getImageData(0,0,textureSize,textureSize);

            pIdx=0;

            for (k=0;k!==pixelSize;k++) {
                pixel=shadowmap.lumData[k]*255.0;
                imgData.data[pIdx++]=pixel;
                imgData.data[pIdx++]=pixel;
                imgData.data[pIdx++]=pixel;
                imgData.data[pIdx++]=255;
            }

            ctx.putImageData(imgData,0,0);
            
                // upload as png
            
            fileName='shadowmap_'+n+'.png';
            data=canvas.toDataURL();
            data=data.substring(data.indexOf(',')+1);
            upload.upload(fileName,data);   // already in base64
        }
        
            // the bin
            
        upload.upload('shadowmap.bin',bin);
        
        this.displayMessage('Shadowmap build completed');
    }
    
        //
        // connect dialog
        //
    
    open()
    {
        this.createDialog(['Developer','Builders'],0,this.core.setPauseState.bind(this.core,false,false));
        
        this.addDeveloperControls(this.getView('Developer'));
        this.addBuilderControls(this.getView('Builders'));
    }
    
    close()
    {
        /*
            // change the setup and save
            
        this.core.setup.localGame=document.getElementById('localGame').checked;
        this.core.setup.botCount=document.getElementById('botCount').selectedIndex;
        this.core.setup.botSkill=document.getElementById('botSkill').selectedIndex;
        
        this.core.setup.serverURL=document.getElementById('serverURL').value;
        if (this.core.setup.savedServerURLList.indexOf(this.core.setup.serverURL)===-1) this.core.setup.savedServerURLList.splice(0,0,this.core.setup.serverURL);
        
        this.core.setup.name=document.getElementById('name').value;
        
        this.core.setup.save(this.core);
        */
            // close the dialog
            
        this.removeDialog();
    }

}
