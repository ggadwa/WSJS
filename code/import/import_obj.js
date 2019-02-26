import ImportBaseClass from '../import/import_base.js';
import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';
import ColorClass from '../utility/color.js';
import MeshClass from '../mesh/mesh.js';

export default class ImportObjClass extends ImportBaseClass
{
    constructor(view,importSettings)
    {
        super(view,importSettings);
        
        this.data=null;
        this.lines=null;
        
        this.vertexList=[];
        this.uvList=[];
        this.normalList=[];
        
        this.meshes=[];
        
        Object.seal(this);
    }
    
        //
        // async OBJ loader
        //
        
    async loadOBJ()
    {
        let resp;
        let url='./data/objs/'+this.importSettings.name+'.obj';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.text());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
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
    
    addTrigsForFace(tokens,posVertexIdx,posUVIdx,posNormalIdx,vertexArray,normalArray,uvArray,indexArray)
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
            
        startTrigIdx=Math.trunc(vertexArray.length/3);

            // add the polys
        
        for (n=0;n!==npt;n++) {
            vertexArray.push(this.vertexList[vIdx[n]].x,this.vertexList[vIdx[n]].y,this.vertexList[vIdx[n]].z);
            normalArray.push(this.normalList[normalIdx[n]].x,this.normalList[normalIdx[n]].y,this.normalList[normalIdx[n]].z);
            uvArray.push(this.uvList[uvIdx[n]].x,this.uvList[uvIdx[n]].y);
        }
        
        for (n=0;n<(npt-2);n++) {
            indexArray.push(startTrigIdx);
            indexArray.push(startTrigIdx+(n+1));
            indexArray.push(startTrigIdx+(n+2));
        }
    }
    
    buildTangents(vertexArray,uvArray,indexArray)
    {
        let n,nTrig,trigIdx,vIdx,uvIdx;
        let u10,u20,v10,v20;

            // generate tangents by the trigs
            // sometimes we will end up overwriting
            // but it depends on the mesh to have
            // constant shared vertexes against
            // triangle tangents

            // note this recreates a bit of what
            // goes on to create the normal, because
            // we need that first to make the UVs

        let v0=new PointClass(0,0,0);
        let v1=new PointClass(0,0,0);
        let v2=new PointClass(0,0,0);
        let uv0=new Point2DClass(0,0,0);
        let uv1=new Point2DClass(0,0,0);
        let uv2=new Point2DClass(0,0,0);
        let p10=new PointClass(0.0,0.0,0.0);
        let p20=new PointClass(0.0,0.0,0.0);
        let vLeft=new PointClass(0.0,0.0,0.0);
        let vRight=new PointClass(0.0,0.0,0.0);
        let vNum=new PointClass(0.0,0.0,0.0);
        let denom;
        let tangent=new PointClass(0.0,0.0,0.0);
        
        let tangentArray=[];

        nTrig=Math.trunc(indexArray.length/3);

        for (n=0;n!==nTrig;n++) {

                // get the vertex indexes and
                // the vertexes for the trig

            trigIdx=n*3;

            vIdx=indexArray[trigIdx]*3;
            v0.setFromValues(vertexArray[vIdx],vertexArray[vIdx+1],vertexArray[vIdx+2]);
            vIdx=indexArray[trigIdx+1]*3;
            v1.setFromValues(vertexArray[vIdx],vertexArray[vIdx+1],vertexArray[vIdx+2]);
            vIdx=indexArray[trigIdx+2]*3;
            v2.setFromValues(vertexArray[vIdx],vertexArray[vIdx+1],vertexArray[vIdx+2]);
            
            uvIdx=indexArray[trigIdx]*2;
            uv0.setFromValues(uvArray[uvIdx],uvArray[uvIdx+1]);
            uvIdx=indexArray[trigIdx+1]*2;
            uv1.setFromValues(uvArray[uvIdx],uvArray[uvIdx+1]);
            uvIdx=indexArray[trigIdx+2]*2;
            uv2.setFromValues(uvArray[uvIdx],uvArray[uvIdx+1]);

                // create vectors

            p10.setFromSubPoint(v1,v0);
            p20.setFromSubPoint(v2,v0);

                // get the UV scalars (u1-u0), (u2-u0), (v1-v0), (v2-v0)

            u10=uv1.x-uv0.x;        // x component
            u20=uv2.x-uv0.x;
            v10=uv1.y-uv0.y;        // y component
            v20=uv2.y-uv0.y;

                // calculate the tangent
                // (v20xp10)-(v10xp20) / (u10*v20)-(v10*u20)

            vLeft.setFromScale(p10,v20);
            vRight.setFromScale(p20,v10);
            vNum.setFromSubPoint(vLeft,vRight);

            denom=(u10*v20)-(v10*u20);
            if (denom!==0.0) denom=1.0/denom;
            tangent.setFromScale(vNum,denom);
            tangent.normalize();

                // and set the mesh tangent
                // to all vertexes in this trig

            tangentArray.push(tangent.x,tangent.y,tangent.z);
            tangentArray.push(tangent.x,tangent.y,tangent.z);
            tangentArray.push(tangent.x,tangent.y,tangent.z);
        }
        
        return(tangentArray);
    }
    
    addMesh(groupName,groupNameOffset,bitmapName,vertexArray,normalArray,uvArray,indexArray)
    {
        let name,tangentArray;
        let bitmap=this.view.bitmapList.get('textures/'+bitmapName+'.png');
        if (bitmap===undefined) {
            console.log('missing material: textures/'+bitmapName+'.png');
            return;
        }
        
        name=groupName;
        if (groupNameOffset!=0) name+=('_'+groupNameOffset);
        
        tangentArray=this.buildTangents(vertexArray,uvArray,indexArray);
        this.meshes.push(new MeshClass(this.view,name,bitmap,1.0,new Float32Array(vertexArray),new Float32Array(normalArray),new Float32Array(tangentArray),new Float32Array(uvArray),null,null,new Uint32Array(indexArray)));
    }
    
        //
        // flooring
        //
        
    floorY()
    {
        let n,nVertex,fy;
        
            // can't do anything if only one
            // or no vertexes
            
        nVertex=this.vertexList.length;
        if (nVertex<=1) return;
       
            // find bottom Y
            
        fy=this.vertexList[0].y;
            
        for (n=0;n!==nVertex;n++) {
            if (this.vertexList[n].y<fy) fy=this.vertexList[n].y;
        }
        
            // floor it
            
        for (n=0;n!==nVertex;n++) {
            this.vertexList[n].y-=fy;
        }
    }
    
        //
        // main importer
        //
        
    async import(meshList)
    {
        let n,k,splitChar,tokens;
        let x,y,z,normal;
        let lastGroupName,groupNameOffset,lastMaterialName;
        let posVertexIdx,posUVIdx,posNormalIdx;
        let vertexArray,normalArray,uvArray,indexArray;
        let curBitmapName;
        
            // load the file
            
        this.data=null;
            
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
                    }
                );
        
        if (this.data===null) return(false);
        
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
                    this.view.bitmapList.add(('textures/'+tokens[1]+'.png'),('textures/'+tokens[1]+'_n.png'),('textures/'+tokens[1]+'_s.png'),new ColorClass(5,5,5),null);
                    break;
            }
        }
        
            // get the vertexes, UVs, and normals
            
        for (n=0;n!==this.lines.length;n++) {
            tokens=this.lines[n].split(' ');
            
            switch(tokens[0]) {
                case 'v':
                    x=Math.trunc(parseFloat(tokens[1])*this.importSettings.scale);
                    y=Math.trunc(parseFloat(tokens[2])*this.importSettings.scale);
                    z=Math.trunc(parseFloat(tokens[3])*this.importSettings.scale);
                    this.vertexList.push(new PointClass(x,y,z));
                    break;
                case 'vt':
                    x=parseFloat(tokens[1]);
                    y=-parseFloat(tokens[2]);
                    this.uvList.push(new Point2DClass(x,y));
                    break;
                case 'vn':
                    x=parseFloat(tokens[1]);
                    y=parseFloat(tokens[2]);
                    z=parseFloat(tokens[3]);
                    normal=new PointClass(x,y,z);
                    normal.normalize();
                    this.normalList.push(normal);
                    break;
            }
        }
        
            // models should have zero bottom so they
            // draw at the bottom of the xyz position

        if (this.importSettings.floorY) this.floorY();
        
            // now create all the meshes
            
        vertexArray=[];
        normalArray=[];
        uvArray=[];
        indexArray=[];
        
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
                    if ((lastMaterialName!==null) && (vertexArray.length!==0)) this.addMesh(lastGroupName,groupNameOffset,lastMaterialName,vertexArray,normalArray,uvArray,indexArray);
                    lastGroupName=tokens[1];
                    groupNameOffset=0;
                    vertexArray=[];
                    normalArray=[];
                    uvArray=[];
                    indexArray=[];
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
                    this.addTrigsForFace(tokens,posVertexIdx,posUVIdx,posNormalIdx,vertexArray,normalArray,uvArray,indexArray);
                    break;
                case 'usemtl':
                    if ((lastMaterialName!==null) && (vertexArray.length!==0)) {
                        this.addMesh(lastGroupName,groupNameOffset,lastMaterialName,vertexArray,normalArray,uvArray,indexArray);
                        groupNameOffset++;      // new materials break meshes, so if we are under the same group name it needs a new _X value
                    }
                    lastMaterialName=tokens[1];
                    vertexArray=[];
                    normalArray=[];
                    uvArray=[];
                    indexArray=[];
                    break;
            }
        }
        
            // and finally any current usemtl
            
        if ((lastMaterialName!==null) && (vertexArray.length!==0)) this.addMesh(lastGroupName,groupNameOffset,lastMaterialName,vertexArray,normalArray,uvArray,indexArray);
        
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
    
