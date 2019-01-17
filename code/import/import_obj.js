import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';
import MeshVertexClass from '../../code/mesh/mesh_vertex.js';
import MeshClass from '../../code/mesh/mesh.js';

export default class ImportObjClass
{
    constructor(view,url,scale,flipY,forceBottomYToZero)
    {
        this.view=view;
        this.url=url;
        this.scale=scale;
        this.forceBottomYToZero=forceBottomYToZero;
        
        this.flipFactor=flipY?-1.0:1.0;
        
        this.data=null;
        this.lines=null;
        
        this.vertexList=[];
        this.uvList=[];
        this.normalList=[];
        
        this.meshes=[];
    }
    
        //
        // async OBJ loader
        //
        
    async loadOBJ()
    {
        let resp;
        
        try {
            resp=await fetch(this.url);
            if (!resp.ok) return(Promise.reject('Unable to load '+this.url+'; '+resp.statusText));
            return(await resp.text());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+this.url+'; '+e.message));
        }
    }
    
        //
        // start the import by loading the obj file
        // and passing it on to the decoder
        //
        
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
        
        for (n=0;n!==npt;n++) {
            v=new MeshVertexClass();
            v.position.setFromPoint(this.vertexList[vIdx[n]]);
            v.uv.setFromPoint(this.uvList[uvIdx[n]]);
            v.normal.setFromPoint(this.normalList[normalIdx[n]]);
            meshVertices.push(v);
        }
        
        for (n=0;n<(npt-2);n++) {
            meshIndexes.push(startTrigIdx);
            meshIndexes.push(startTrigIdx+(n+1));
            meshIndexes.push(startTrigIdx+(n+2));
        }
    }
    
    buildVertexListTangents(vertexList,indexes)
    {
        let n,nTrig,trigIdx;
        let v0,v1,v2;
        let u10,u20,v10,v20;

            // generate tangents by the trigs
            // sometimes we will end up overwriting
            // but it depends on the mesh to have
            // constant shared vertices against
            // triangle tangents

            // note this recreates a bit of what
            // goes on to create the normal, because
            // we need that first to make the UVs

        let p10=new PointClass(0.0,0.0,0.0);
        let p20=new PointClass(0.0,0.0,0.0);
        let vLeft=new PointClass(0.0,0.0,0.0);
        let vRight=new PointClass(0.0,0.0,0.0);
        let vNum=new PointClass(0.0,0.0,0.0);
        let denom;
        let tangent=new PointClass(0.0,0.0,0.0);

        nTrig=Math.trunc(indexes.length/3);

        for (n=0;n!==nTrig;n++) {

                // get the vertex indexes and
                // the vertexes for the trig

            trigIdx=n*3;

            v0=vertexList[indexes[trigIdx]];
            v1=vertexList[indexes[trigIdx+1]];
            v2=vertexList[indexes[trigIdx+2]];

                // create vectors

            p10.setFromSubPoint(v1.position,v0.position);
            p20.setFromSubPoint(v2.position,v0.position);

                // get the UV scalars (u1-u0), (u2-u0), (v1-v0), (v2-v0)

            u10=v1.uv.x-v0.uv.x;        // x component
            u20=v2.uv.x-v0.uv.x;
            v10=v1.uv.y-v0.uv.y;        // y component
            v20=v2.uv.y-v0.uv.y;

                // calculate the tangent
                // (v20xp10)-(v10xp20) / (u10*v20)-(v10*u20)

            vLeft.setFromScale(p10,v20);
            vRight.setFromScale(p20,v10);
            vNum.setFromSubPoint(vLeft,vRight);

            denom=(u10*v20)-(v10*u20);
            if (denom!==0.0) denom=1.0/denom;
            tangent.setFromScale(vNum,denom);
            tangent.normalize();

                // and set the mesh normal
                // to all vertexes in this trig

            v0.tangent.setFromPoint(tangent);
            v1.tangent.setFromPoint(tangent);
            v2.tangent.setFromPoint(tangent);
        }
    }
    
    addMesh(groupName,groupNameOffset,bitmapName,meshVertices,meshIndexes)
    {
        let name;
        let bitmap=this.view.bitmapList.get(bitmapName);
        if (bitmap===undefined) {
            console.log('missing material: '+bitmapName);
            return;
        }
        
        name=groupName;
        if (groupNameOffset!=0) name+=('_'+groupNameOffset);

        this.buildVertexListTangents(meshVertices,meshIndexes);
        this.meshes.push(new MeshClass(this.view,name,bitmap,meshVertices,meshIndexes,0));
    }
    
        //
        // main importer
        //
        
    async import(meshList)
    {
        let n,k,splitChar,tokens,mesh;
        let x,y,z,normal,by;
        let lastGroupName,groupNameOffset,lastMaterialName;
        let posVertexIdx,posUVIdx,posNormalIdx;
        let meshVertices,meshIndexes;
        let curBitmapName;
        
            // load the file
            
        await this.loadOBJ()
            .then
                (
                        // resolved
                
                    value=>{
                        this.data=value;
                    },
                    
                        // rejected
                        
                    value=>{
                        console.log(value);
                        return;
                    }
                );
        
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
                    this.view.bitmapList.add(tokens[1],false);
                    break;
            }
        }
        
            // get the vertexes, UVs, and normals
            
        for (n=0;n!==this.lines.length;n++) {
            tokens=this.lines[n].split(' ');
            
            switch(tokens[0]) {
                case 'v':
                    x=Math.trunc(parseFloat(tokens[1])*this.scale);
                    y=Math.trunc((parseFloat(tokens[2])*this.scale)*this.flipFactor);
                    z=Math.trunc(parseFloat(tokens[3])*this.scale);
                    this.vertexList.push(new PointClass(x,y,z));
                    break;
                case 'vt':
                    x=parseFloat(tokens[1]);
                    y=parseFloat(tokens[2])*this.flipFactor;
                    this.uvList.push(new Point2DClass(x,y));
                    break;
                case 'vn':
                    x=parseFloat(tokens[1]);
                    y=parseFloat(tokens[2])*this.flipFactor;
                    z=parseFloat(tokens[3]);
                    normal=new PointClass(x,y,z);
                    normal.normalize();
                    this.normalList.push(normal);
                    break;
            }
        }
        
            // now create all the meshes
            
        meshVertices=[];
        meshIndexes=[];
        
        posVertexIdx=0;
        posUVIdx=0;
        posNormalIdx=0;
        
        lastMaterialName=null;
        lastGroupName=null;
        groupNameOffset=0;
            
        for (n=0;n!==this.lines.length;n++) {
            tokens=this.lines[n].split(' ');
            
            switch(tokens[0]) {
                case 'g':
                    if ((lastMaterialName!==null) && (meshVertices.length!==0)) this.addMesh(lastGroupName,groupNameOffset,lastMaterialName,meshVertices,meshIndexes);
                    lastGroupName=tokens[1];
                    groupNameOffset=0;
                    meshVertices=[];
                    meshIndexes=[];
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
                    if ((lastMaterialName!==null) && (meshVertices.length!==0)) {
                        this.addMesh(lastGroupName,groupNameOffset,lastMaterialName,meshVertices,meshIndexes);
                        groupNameOffset++;      // new materials break meshes, so if we are under the same group name it needs a new _X value
                    }
                    lastMaterialName=tokens[1];
                    meshVertices=[];
                    meshIndexes=[];
                    break;
            }
        }
        
            // and finally any current usemtl
            
        if ((lastMaterialName!==null) && (meshVertices.length!==0)) this.addMesh(lastGroupName,groupNameOffset,lastMaterialName,meshVertices,meshIndexes);
        
            // force the bottom Y to 0
            // this is used for game play models
            
        if (this.forceBottomYToZero) {
            
            for (n=0;n!==this.meshes.length;n++) {
                mesh=this.meshes[n];
                
                    // get the bottom Y
                
                by=0;
                
                for (k=0;k!==mesh.vertexList.length;k++) {
                    if (mesh.vertexList[k].position.y>by) by=mesh.vertexList[k].position.y;
                }
                
                    // now transform the vertexes
            
                for (k=0;k!==mesh.vertexList.length;k++) {
                    mesh.vertexList[k].position.y-=by;
                }
            }
        }
        
            // and sort meshes by bitmaps into mesh list
            
        for (n=0;n!==this.meshes.length;n++) {
            if (this.meshes[n]===null) continue;
            
            curBitmapName=this.meshes[n].bitmap.name;
            
            for (k=n;k<this.meshes.length;k++) {
                if (this.meshes[k]===null) continue;
                
                if (this.meshes[k].bitmap.name===curBitmapName) {
                    meshList.add(this.meshes[k]);
                    this.meshes[k]=null;
                }
            }
        }
        
        return(true);
    }
    
}
    
