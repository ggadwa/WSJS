import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';
import Bitmap2Class from '../bitmap/bitmap2.js';
import MeshVertexClass from '../../code/mesh/mesh_vertex.js';
import MeshClass from '../../code/mesh/mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';

export default class ImportObjClass
{
    constructor(view,map,url,scale)
    {
        this.view=view;
        this.map=map;
        this.url=url;
        this.scale=scale;
        
        this.data=null;
        this.lines=null;
        
        this.vertexList=[];
        this.uvList=[];
        this.normalList=[];
        this.textureMap=new Map();
        
        this.callback=null;
    }
    
        //
        // start the import by loading the obj file
        // and passing it on to the decoder
        //
        
    import(callback)
    {
            // save callback for later
            
        this.callback=callback;
        
            // start with the fetch
            
        fetch(this.url)
            .then(
                (resp)=>{
                    if (resp.status!=200) return(Promise.reject(new Error('Missing file: '+this.url)));
                    return(resp.text());
                }
            )
            .then((data)=>{
                    this.data=data;
                    this.decode();
                }
            )
            //.catch((error)=>alert(error));
            .catch((error)=>console.log(error));
    }
    
        //
        // loads all the textures in the obj
        //
        
    loadTexturesProcess(keyIter,callback)
    {
        let rtn,bitmap;
        
            // get next key
            
        rtn=keyIter.next();
        if (rtn.done) {
            callback();
            return;
        }
        
        bitmap=this.textureMap.get(rtn.value);
        bitmap.initialize(this.loadTexturesProcess.bind(this,keyIter,callback));
    }
    
    loadTextures(callback)
    {
        this.loadTexturesProcess(this.textureMap.keys(),callback);
    }
    
        //
        // utilities
        //
    
    fixVertexOffset(tokenStr,curListPosition)
    {
        let idx=parseInt(tokenStr);
        
        if (idx>0) return(idx-1);
        return(curListPosition+idx);
    }
    
    addTrigsForFace(tokens,posVertexIdx,posUVIdx,posNormalIdx,meshVertices,meshIndexes)
    {
        let n,npt,v,vIdx,uvIdx,normalIdx;
        let vTokens,startTrigIdx;
        
        npt=0;
        vIdx=[];
        uvIdx=[];
        normalIdx=[];
        
        for (n=0;n!==8;n++) {
            if ((n+1)>=tokens.length) break;
            
            vTokens=tokens[n+1].split('/');
            
                // the indexes

            vIdx.push(this.fixVertexOffset(vTokens[0],posVertexIdx));
            uvIdx.push(this.fixVertexOffset(vTokens[1],posUVIdx));
            normalIdx.push(this.fixVertexOffset(vTokens[2],posNormalIdx));
			
            npt++;
        }
		
            // is there at least 3 points?
			
	if (npt<3) return;
        
            // polys are tesselated into
            // triangles around 0 vertex
            
        startTrigIdx=meshVertices.length;

            // add the polys
        
        //console.log('=== point start');
        
        for (n=0;n!==npt;n++) {
            v=new MeshVertexClass();
            v.position.setFromPoint(this.vertexList[vIdx[n]]);
            v.uv.setFromPoint(this.uvList[uvIdx[n]]);
            v.normal.setFromPoint(this.normalList[normalIdx[n]]);
            meshVertices.push(v);
            
            //console.log('v='+v.position.x+','+v.position.y+','+v.position.z);
            //console.log('vt='+v.uv.x+','+v.uv.y);
            //console.log('vn='+v.normal.x+','+v.normal.y+','+v.normal.z);
        }
        
        //console.log('=== index start ('+npt+')');
        
        for (n=0;n<(npt-2);n++) {
            meshIndexes.push(startTrigIdx);
            meshIndexes.push(startTrigIdx+(n+1));
            meshIndexes.push(startTrigIdx+(n+2));
            
            //console.log(startTrigIdx+','+(startTrigIdx+(n+1))+','+(startTrigIdx+(n+2)));
        }
    }
    
    addMesh(bitmapName,meshVertices,meshIndexes)
    {
        console.log('adding mesh with vertex count='+meshVertices.length);
        
        let bitmap=this.textureMap.get(bitmapName);
        if (bitmap===undefined) {
            console.log('missing material: '+bitmapName);
            return;
        }

        MeshUtilityClass.buildVertexListTangents(meshVertices,meshIndexes);
        this.map.meshList.add(new MeshClass(this.view,bitmap,meshVertices,meshIndexes,0));
            
            console.log('mesh idx='+(this.map.meshList.meshes.length-1));
            console.log('index count='+this.map.meshList.meshes[this.map.meshList.meshes.length-1].indexCount);
            console.log('trig count='+this.map.meshList.meshes[this.map.meshList.meshes.length-1].trigCount);
    }
    
        //
        // main decoder
        //
        
    decode()
    {
        let n,splitChar,tokens;
        
            // get the lines and trim
            // any extraneous control characters
            
        splitChar='\r';
        if (this.data.indexOf('\r')===-1) splitChar='\n';
            
        this.lines=this.data.split(splitChar);
        
        for (n=0;n!==this.lines.length;n++) {
            this.lines[n]=this.lines[n].trim().replace(/  +/g,' ');
        }
        
            // find all the texture materials
            
        for (n=0;n!==this.lines.length;n++) {
            tokens=this.lines[n].split(' ');
            
            switch(tokens[0]) {
                case 'usemtl':                        
                    if (!this.textureMap.has(tokens[1])) this.textureMap.set(tokens[1],new Bitmap2Class(this.view,tokens[1]));
                    break;
            }
        }
        
            // load the textures by fetch
            
        this.loadTextures(this.decodeMeshes.bind(this));
    }
    
    decodeMeshes()
    {
        let n,tokens;
        let x,y,z,pnt;
        let lastMaterialName;
        let posVertexIdx,posUVIdx,posNormalIdx;
        let meshVertices,meshIndexes;
        let min=new PointClass(0,0,0);
        let max=new PointClass(0,0,0);
        
            // get the vertexes, UVs, and normals
            
        for (n=0;n!==this.lines.length;n++) {
            tokens=this.lines[n].split(' ');
            
            switch(tokens[0]) {
                case 'v':
                    x=Math.trunc(parseFloat(tokens[1])*this.scale);
                    y=Math.trunc(parseFloat(tokens[2])*this.scale);
                    z=Math.trunc(parseFloat(tokens[3])*this.scale);
                    pnt=new PointClass(x,y,z);
                    
                    min.minFromPoint(pnt);
                    max.maxFromPoint(pnt);
                    this.vertexList.push(pnt);
                    break;
                case 'vt':
                    this.uvList.push(new Point2DClass(parseFloat(tokens[1]),parseFloat(tokens[2])));
                    break;
                case 'vn':
                    this.normalList.push(new PointClass(parseFloat(tokens[1]),parseFloat(tokens[2]),parseFloat(tokens[3])));
                    break;
            }
        }
        
        console.log('main vertex list count='+this.vertexList.length);
        console.log('main uv list count='+this.uvList.length);
        console.log('main normal list count='+this.normalList.length);
        
            // now create all the meshes
            
        meshVertices=[];
        meshIndexes=[];
        
        posVertexIdx=0;
        posUVIdx=0;
        posNormalIdx=0;
        
        lastMaterialName=null;
            
        for (n=0;n!==this.lines.length;n++) {
            tokens=this.lines[n].split(' ');
            
            switch(tokens[0]) {
                case 'g':
                    break;
                case 'v':
                    posVertexIdx++;
                    break;
                case 'vt':
                    posUVIdx++;
                    break;
                case 'vn':
                    posNormalIdx++;
                    break;
                case 'f':
                    this.addTrigsForFace(tokens,posVertexIdx,posUVIdx,posNormalIdx,meshVertices,meshIndexes);
                    break;
                case 'usemtl':
                    if (lastMaterialName!==null) this.addMesh(lastMaterialName,meshVertices,meshIndexes);
                    
                    lastMaterialName=tokens[1];
                    meshVertices=[];
                    meshIndexes=[];
                    break;
            }
        }
        
            // and finally any current usemtl
            
        if (lastMaterialName!==null) this.addMesh(lastMaterialName,meshVertices,meshIndexes);
        
            // finally callback to finish the import
            
        this.callback();
    }
    
}
    
