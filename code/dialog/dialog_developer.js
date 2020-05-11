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
        
        this.SHADOWMAP_THREAD_COUNT=8;
        
        this.shadowmapThreads=null;
        
        this.shadowmapGlobalShadowmapList=null;
        this.shadowmapGlobalMeshes=null;
        
        this.shadowmapTimestamp=0;
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
        // path hint build
        //
        
    buildPathHints()
    {
        console.info('path hints');
    }
    
        //
        // shadowmap build
        //
    
    buildShadowmap()
    {
        let n,nMesh,data;
        let thread,perThreadMeshCount;
        let light,effect;
        let map=this.core.map;
        
            // already building?
            
        if (this.shadowmapThreads!==null) {
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
        
        //data.lights.length=5;   // testing
        
            // use these global variables to contain
            // all the thread results
            
        this.shadowmapGlobalShadowmapList=[];
        this.shadowmapGlobalMeshes=[];
        
            // start the threads
        
        this.displayMessage('Starting background shadowmap build');
        
        this.shadowmapTimestamp=Date.now();
        
        this.shadowmapThreads=[];
        perThreadMeshCount=Math.trunc(nMesh/this.SHADOWMAP_THREAD_COUNT);
        
        for (n=0;n!==this.SHADOWMAP_THREAD_COUNT;n++) {
            /* testing
            if (n!==4) {
                this.shadowmapThreads.push(null);
                continue;
            }
            */
            thread=new Worker('../../code/generate/shadowmap/shadowmap_thread.js',{type:"module"});
            thread.addEventListener('message',this.buildShadowmapThreadFinish.bind(this),false);
            
            data.threadIdx=n;
            data.startMeshIdx=n*perThreadMeshCount;
            data.endMeshIdx=(n===(this.SHADOWMAP_THREAD_COUNT-1))?nMesh:(data.startMeshIdx+perThreadMeshCount);
            thread.postMessage(data);
            
            this.shadowmapThreads.push(thread);
        }
    }
    
    buildShadowmapBinData(meshes)
    {
        let n,k,len,offset,mesh;
        let data,dataView;
        let nMesh=meshes.length;

            // shadowmap model bin
            // mesh count (int)
            //   run count (int)
            //   vertex byte count (int)
            //   uv byte count (int)
            //   runs
            //     bitmap index (int)
            //     trig start index (int)
            //     trig end index (int)
            //   vertexes (array of 3 floats)
            //   uvs (array of 2 floats)

            // calculate the length
            
        len=4;      // mesh count
        
        for (n=0;n!==nMesh;n++) {
            mesh=meshes[n];
            
            len+=12;        // bitmap index and vertex/uv byte count
            if (mesh.vertexShadowArray!==null) len+=((mesh.shadowmapRuns.length*12)+(mesh.vertexShadowArray.length*4)+(mesh.uvShadowArray.length*4)); // runs, vertexes and UVs
        }
        
            // fill the data
            
        data=new ArrayBuffer(len);
        
        dataView=new DataView(data,0,len);
        
        dataView.setInt32(0,nMesh);
        
        offset=4;
        
        for (n=0;n!==nMesh;n++) {
            mesh=meshes[n];
            
            if (mesh.vertexShadowArray===null) {
                dataView.setInt32(offset,0);
                offset+=4;
                dataView.setInt32(offset,0);
                offset+=4;
                dataView.setInt32(offset,0);
                offset+=4;
            }
            else {
                dataView.setInt32(offset,mesh.shadowmapRuns.length);
                offset+=4;
                dataView.setInt32(offset,mesh.vertexShadowArray.length);
                offset+=4;
                dataView.setInt32(offset,mesh.uvShadowArray.length);
                offset+=4;
                
                for (k=0;k!==mesh.shadowmapRuns.length;k++) {
                    dataView.setInt32(offset,mesh.shadowmapRuns[k].shadowmapIdx);
                    offset+=4;
                    dataView.setInt32(offset,mesh.shadowmapRuns[k].startTrigIdx);
                    offset+=4;
                    dataView.setInt32(offset,mesh.shadowmapRuns[k].endTrigIdx);
                    offset+=4;
                }

                for (k=0;k!==mesh.vertexShadowArray.length;k++) {
                    dataView.setFloat32(offset,mesh.vertexShadowArray[k]);
                    offset+=4;
                }
                for (k=0;k!==mesh.uvShadowArray.length;k++) {
                    dataView.setFloat32(offset,mesh.uvShadowArray[k]);
                    offset+=4;
                }
            }
        }
        
        return(data);
    }
    
    base64EncodeData(data)
    {
        let n;
        let byteBuffer,str;
            
        byteBuffer=new Uint8Array(data);
        str='';
        
        for (n=0;n!==byteBuffer.byteLength;n++) {
            str+=String.fromCharCode(byteBuffer[n]);
        }
        
        return(btoa(str));
    }
    
    buildShadowmapThreadFinish(message)
    {
        let n,k;
        let thread,shadowmap,offsetIdx;
        let canvas,ctx,imgData,pIdx,pixel;
        let upload,fileName,mesh,data,bin,pixelSize;
        let threadIdx=message.data.threadIdx;
        let startMeshIdx=message.data.startMeshIdx;
        let endMeshIdx=message.data.endMeshIdx;
        let textureSize=message.data.textureSize;
        let meshes=message.data.meshes;
        let shadowmapList=message.data.shadowmapList;
        
            // end the thread
            
        thread=this.shadowmapThreads[threadIdx];
        thread.terminate();
        
        this.shadowmapThreads[threadIdx]=null;
        
            // move the data
            // we need to change the shadowmap offsets
            // as the shadowmap list grows for each finished thread
            
        offsetIdx=this.shadowmapGlobalShadowmapList.length;
        
        for (n=0;n!==shadowmapList.length;n++) {
            this.shadowmapGlobalShadowmapList.push(shadowmapList[n]);
        }
            
        for (n=startMeshIdx;n<endMeshIdx;n++) {
            mesh=meshes[n];
            
            if (mesh.vertexShadowArray!==null) {
                for (k=0;k!==mesh.shadowmapRuns.length;k++) {
                    mesh.shadowmapRuns[k].shadowmapIdx+=offsetIdx;
                }
            }
            
            this.shadowmapGlobalMeshes[n]=mesh;
        }
        
        this.shadowmapThreads[threadIdx]=null;
        
            // are we finished?
            
        for (n=0;n!==this.SHADOWMAP_THREAD_COUNT;n++) {
            if (this.shadowmapThreads[n]!==null) return;
        }
        
            // finished, clear out the threads
            // and upload
            
        this.shadowmapThreads=null;
        
            // build the bin data
            
        data=this.buildShadowmapBinData(this.shadowmapGlobalMeshes);
        bin=this.base64EncodeData(data);
        
            // upload the data
            
        console.info('Uploading');
        
        this.displayMessage('Shadowmap uploading ('+this.shadowmapGlobalShadowmapList.length+' maps)');
            
        upload=new UploadClass(this.core);
        
            // turn shadowmaps into canvases
            // and then upload as png
        
        canvas=document.createElement('canvas');
        canvas.width=textureSize;
        canvas.height=textureSize;
        
        ctx=canvas.getContext('2d');
            
        pixelSize=textureSize*textureSize;
        
        for (n=0;n!==this.shadowmapGlobalShadowmapList.length;n++) {
            shadowmap=this.shadowmapGlobalShadowmapList[n];
            
                // render unto canvas
                
            imgData=ctx.getImageData(0,0,textureSize,textureSize);

            pIdx=0;

            for (k=0;k!==pixelSize;k++) {
                pixel=shadowmap.lumData[k];     // lumData is a byte, 0..255
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
        
        console.info('time='+(Date.now()-this.shadowmapTimestamp));
        
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
