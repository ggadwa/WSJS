export default class ShadowmapLoadClass
{
    constructor(core)
    {
        this.core=core;
    }
    
        //
        // load shadow maps
        //
        
    async loadShadowmapBin()
    {
        let resp;
        let url='../models/_'+this.core.map.json.name+'/shadowmap.bin';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.arrayBuffer());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }

    async load()
    {
        let n,nMesh,mesh,offset;
        let k,vertexCount,uvCount;
        let bitmapIdx,bitmaps,bitmap,colorURL;
        let binData,dataView;
        let map=this.core.map;
        
            // start with no shadowmap
            
        map.hasShadowmap=false;
        
            // if bin exists, then we have a shadowmap,
            // otherwise just ignore
            
        binData=null;
        
        await this.loadShadowmapBin()
            .then
                (
                    value=>{
                        binData=value;
                    },
                    value=>{}
                );

        if (binData===null) return(true);
        
            // translate the data
            
        console.info('has shadowmap');
        
        dataView=new DataView(binData,0,binData.length);
        
        nMesh=dataView.getInt32(0);
        if (nMesh!==map.meshList.meshes.length) {
            console.log('Shadowmap does not match glTF, might need to be regenerated.');
            return(true);
        }
        
        offset=4;
        bitmaps=new Map();
        
        for (n=0;n!==nMesh;n++) {
            mesh=map.meshList.meshes[n];
            
                // bitmap index and counts
                
            bitmapIdx=dataView.getInt32(offset);
            offset+=4;
                
            vertexCount=dataView.getInt32(offset);
            offset+=4;
            
            uvCount=dataView.getInt32(offset);
            offset+=4;
            
                // if no vertexes, than this is
                // a mesh we can skip
                
            if (vertexCount===0) {
                mesh.shadowmap=null;
                mesh.vertexShadowArray=null;
                mesh.uvShadowArray=null;
                continue;
            }
            
                // other set the bitmap
                
            bitmap=bitmaps.get(bitmapIdx);
            if (bitmap===undefined) {
                colorURL='models/_'+this.core.map.json.name+'/shadowmap_'+bitmapIdx+'.png';
                bitmap=this.core.bitmapList.addShadowmap(colorURL);
                bitmaps.set(bitmapIdx,bitmap);
            }
            
            mesh.shadowmap=bitmap;
            
                // vertex and uvs
                
            mesh.vertexShadowArray=new Float32Array(vertexCount);
            
            for (k=0;k!==vertexCount;k++) {
                mesh.vertexShadowArray[k]=dataView.getFloat32(offset);
                offset+=4;
            }
                
            mesh.uvShadowArray=new Float32Array(uvCount);
            
            for (k=0;k!==uvCount;k++) {
                mesh.uvShadowArray[k]=dataView.getFloat32(offset);
                offset+=4;
            }
        }
        
            // finally mark it as having a shadowmap

        map.hasShadowmap=true;
        
        return(true);
    }
}
