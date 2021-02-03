import UploadClass from '../developer/upload.js';
import ShadowmapLightClass from '../generate/shadowmap/shadowmap_light.js';
import ShadowmapMeshClass from '../generate/shadowmap/shadowmap_mesh.js';

export default class DeveloperBuilderClass
{
    constructor(core)
    {
        this.core=core;
        
        this.SHADOWMAP_THREAD_COUNT=8;
        
        this.shadowmapThreads=null;
        
        this.shadowmapGlobalShadowmapList=null;
        this.shadowmapGlobalMeshes=null;
        
        this.shadowmapTimestamp=0;
        
        this.pathHintThread=null;
        this.pathHintTimestamp=0;
    }

        //
        // path hint build
        //
        
    buildPathHints()
    {
            // already building?
            
        if (this.pathHintThread!==null) {
            console.info('Currently in path build');
            return;
        }
        
            // start the build thread
            
        console.info('Starting background path hint build');
        
        this.pathHintTimestamp=Date.now();
        
        this.pathHintThread=new Worker('../../code/generate/path/path_thread.js',{type:"module"});
        this.pathHintThread.addEventListener('message',this.buildPathHintsThreadFinish.bind(this),false);
            
        this.pathHintThread.postMessage({nodes:this.core.game.map.path.nodes});
    }
    
    buildPathHintsThreadFinish(message)
    {
        let upload;
        let json=message.data.json;
        
            // end the thread
            
        this.pathHintThread.terminate();
        this.pathHintThread=null;
        
            // upload the path
            
        upload=new UploadClass(this.core);
        upload.upload('PTH',0,btoa(json));
            
        console.info('time='+(Date.now()-this.pathHintTimestamp));
        
        console.info('Path hint build completed');
    }
    
        //
        // shadowmap build
        //
    
    buildShadowmap(ignoreNormals)
    {
            // already building?
            
        if (this.shadowmapThreads!==null) {
            console.info('Currently in shadowmap build');
            return;
        }
        
        console.info('Starting up shadowmap build');
        
        this.shadowmapTimestamp=Date.now();
                
        setTimeout(this.buildShadowmapSetup.bind(this,ignoreNormals),1);
    }
    
    buildShadowmapSetup(ignoreNormals)
    {
        let n,k,nMesh,data;
        let thread,perThreadMeshCount;
        let light,effect,lightIdx;
        let map=this.core.game.map;
        
            // we need to make a parallel object of
            // all the data because our regular data has DOM
            // elements in it and those can't be passed to
            // workers, we also do all pre-calculation here
            
        data={};
        
            // pre-calc the meshes
            
        data.meshes=[];
        
        nMesh=map.meshList.meshes.length;
            
        for (n=0;n!==nMesh;n++) {
            data.meshes.push(new ShadowmapMeshClass(map.meshList.meshes[n]));
        }
        
            // pre-calc lights and the meshes they
            // collide with, we always insert the list
            // with the biggest lights last as they have
            // the most meshes to check, hopefully you'll find
            // a path to the smaller light and early exit
            
        data.lights=[];
        
        for (n=0;n!==map.lightList.lights.length;n++) {
            light=new ShadowmapLightClass(data.meshes,map.lightList.lights[n]);
            light.calculateCollisionList();
            
            lightIdx=data.lights.length;
            
            for (k=0;k<data.lights.length;k++) {
                if (light.intensity<data.lights[k].intensity) {
                    lightIdx=k;
                    break;
                }
            }
            
            data.lights.splice(lightIdx,0,light);
        }
        
        for (n=0;n!==map.effectList.effects.length;n++) {
            effect=map.effectList.effects[n];
            if (effect.light===null) continue;
            
            light=new ShadowmapLightClass(data.meshes,effect.light);
            light.calculateCollisionList();
            
            lightIdx=data.lights.length;
            
            for (k=0;k<data.lights.length;k++) {
                if (light.intensity<data.lights[k].intensity) {
                    lightIdx=k;
                    break;
                }
            }
            
            data.lights.splice(lightIdx,0,light);
        }
                
            // use these global variables to contain
            // all the thread results
            
        this.shadowmapGlobalShadowmapList=[];
        this.shadowmapGlobalMeshes=[];
        
            // start the threads
        
        console.info('Starting background shadowmap build');
        
        this.shadowmapThreads=[];
        perThreadMeshCount=Math.trunc(nMesh/this.SHADOWMAP_THREAD_COUNT);
        
        for (n=0;n!==this.SHADOWMAP_THREAD_COUNT;n++) {
            thread=new Worker('../../code/generate/shadowmap/shadowmap_thread.js',{type:"module"});
            thread.addEventListener('message',this.buildShadowmapThreadFinish.bind(this),false);
            
            data.threadIdx=n;
            data.startMeshIdx=n*perThreadMeshCount;
            data.endMeshIdx=(n===(this.SHADOWMAP_THREAD_COUNT-1))?nMesh:(data.startMeshIdx+perThreadMeshCount);
            data.ignoreNormals=ignoreNormals;
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
        let upload,mesh,data,bin,pixelSize;
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
        
        console.info('Shadowmap uploading ('+this.shadowmapGlobalShadowmapList.length+' maps)');
            
        upload=new UploadClass(this.core);
        
            // the bin
            
        upload.upload('SBN',0,bin);
        
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
            
            data=canvas.toDataURL();
            data=data.substring(data.indexOf(',')+1);
            upload.upload('SMP',n,data);   // already in base64
        }
        
        console.info('time='+(Date.now()-this.shadowmapTimestamp));
        
        console.info('Shadowmap build completed');
    }

}
