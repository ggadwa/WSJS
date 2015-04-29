"use strict";

//
// combine two meshes
//

function mapMeshCombineMesh(mesh)
{
        // change the data
        
    var vertices2=new Float32Array(this.vertices.length+mesh.vertices.length);
    vertices2.set(this.vertices,0);
    vertices2.set(mesh.vertices,this.vertices.length);
    this.vertices=vertices2;
    
    var normals2=new Float32Array(this.normals.length+mesh.normals.length);
    normals2.set(this.normals,0);
    normals2.set(mesh.normals,this.normals.length);
    this.normals=normals2;
    
    var tangents2=new Float32Array(this.tangents.length+mesh.tangents.length);
    tangents2.set(this.tangents,0);
    tangents2.set(mesh.tangents,this.tangents.length);
    this.tangents=tangents2;
    
    var vertexUVs2=new Float32Array(this.vertexUVs.length+mesh.vertexUVs.length);
    vertexUVs2.set(this.vertexUVs,0);
    vertexUVs2.set(mesh.vertexUVs,this.vertexUVs.length);
    this.vertexUVs=vertexUVs2;
    
    if ((this.lightmapUVs!==null) && (mesh.lightmapUVs!==null)) {
        var lightmapUVs2=new Float32Array(this.lightmapUVs.length+mesh.lightmapUVs.length);
        lightmapUVs2.set(this.lightmapUVs,0);
        lightmapUVs2.set(mesh.lightmapUVs,this.lightmapUVs.length);
        this.lightmapUVs=lightmapUVs2;
    }
    else {
        this.lightmapUVs=null;
    }
    
        // indexes need to be moved
        
    var indexes2=new Uint16Array(this.indexes.length+mesh.indexes.length);
    indexes2.set(this.indexes,0);
    
    var n;
    var iAdd=this.indexes.length;
    
    for (n=0;n!==mesh.indexes.length;n++) {
        indexes2[n+iAdd]=mesh.indexes[n]+iAdd;
    }

    this.indexes=indexes2;
    
        // reset counts
        
    this.vertexCount=Math.floor(this.vertices.length/3);
    this.indexCount=this.indexes.length;
    this.trigCount=Math.floor(this.indexCount/3);
    
        // setup bounds
        
    this.setupBounds();
}

//
// mesh box collision
//

function mapMeshBoxBoundCollision(xBound,yBound,zBound)
{
    if (xBound!==null) {
        if (this.xBound.min>=xBound.max) return(false);
        if (this.xBound.max<=xBound.min) return(false);
    }
    if (yBound!==null) {
        if (this.yBound.min>=yBound.max) return(false);
        if (this.yBound.max<=yBound.min) return(false);
    }
    if (zBound!==null) {
        if (this.zBound.min>=zBound.max) return(false);
        if (this.zBound.max<=zBound.min) return(false);
    }
    return(true);
}

function mapMeshBoxMeshCollision(checkMesh)
{
    if (this.xBound.min>=checkMesh.xBound.max) return(false);
    if (this.xBound.max<=checkMesh.xBound.min) return(false);
    if (this.yBound.min>=checkMesh.yBound.max) return(false);
    if (this.yBound.max<=checkMesh.yBound.min) return(false);
    if (this.zBound.min>=checkMesh.zBound.max) return(false);
    return(!(this.zBound.max<=checkMesh.zBound.min));
}

//
// triangles
//

function mapMeshGetTriangleVertex(trigIdx,vertexIdx)
{
    var vIdx=this.indexes[(trigIdx*3)+vertexIdx]*3;
    return(vec3.fromValues(this.vertices[vIdx],this.vertices[vIdx+1],this.vertices[vIdx+2]));
}

function mapMeshGetTriangleBounds(trigIdx)
{
    var v=this.getTriangleVertex(trigIdx,0);
    
    var xBound=new wsBound(v[0],v[0]);
    var yBound=new wsBound(v[1],v[1]);
    var zBound=new wsBound(v[2],v[2]);
    
    for (var n=1;n!==3;n++) {
        v=this.getTriangleVertex(trigIdx,n);
        xBound.adjust(v[0]);
        yBound.adjust(v[1]);
        zBound.adjust(v[2]);
    }
    
    return([xBound,yBound,zBound]);
}

function mapMeshIsTriangleStraightWall(trigIdx)
{
    var v0=this.getTriangleVertex(trigIdx,0);
    var v1=this.getTriangleVertex(trigIdx,0);
    var v2=this.getTriangleVertex(trigIdx,0);
    
        // if all the Xs of Zs are equal,
        // consider it a straight wall
        
    if ((v0[0]===v1[0]) && (v0[0]===v2[0])) return(true);
    if ((v0[1]===v1[1]) && (v0[1]===v2[1])) return(true);
    
    return(false);
}

function mapMeshRemoveTriangle(trigIdx)
{
    if (this.indexCount===0) return;
    if ((trigIdx<0) || (trigIdx>=this.trigCount)) return;
    
        // rebuild the array
        
    var newIndexes=new Uint16Array(this.indexCount-3);
    
    var n;
    var idx=0;
    var cutIdx=trigIdx*3;
    
    for (n=0;n<cutIdx;n++) {
        newIndexes[idx++]=this.indexes[n];
    }
    
    for (n=(cutIdx+3);n<this.indexCount;n++) {
        newIndexes[idx++]=this.indexes[n];
    }
    
    this.indexes=newIndexes;
    
        // fix a couple counts
        
    this.indexCount=this.indexes.length;
    this.trigCount=Math.floor(this.indexCount/3);
}

//
// setup mesh boxes and bounds
//

function mapMeshSetupBounds()
{
    this.center=new wsPoint(this.vertices[0],this.vertices[1],this.vertices[2]);
    this.xBound=new wsBound(this.vertices[0],this.vertices[0]);
    this.yBound=new wsBound(this.vertices[1],this.vertices[1]);
    this.zBound=new wsBound(this.vertices[2],this.vertices[2]);
    
    var n,x,y,z;
    var idx=3;
    
    for (n=1;n<this.vertexCount;n++) {
        x=this.vertices[idx];
        y=this.vertices[idx+1];
        z=this.vertices[idx+2];
        
        this.center.x+=x;
        this.center.y+=y;
        this.center.z+=z;
        
        this.xBound.adjust(x);
        this.yBound.adjust(y);
        this.zBound.adjust(z);
        
        idx+=3;
    }
    
    this.center.x/=this.vertexCount;
    this.center.y/=this.vertexCount;
    this.center.z/=this.vertexCount;
}

//
// special caches
//

function mapMeshBuildTrigRayTraceCache()
{
    var n,tIdx,cIdx;
    var v0Idx,v1Idx,v2Idx;
    
        // this builds a specialized cache to
        // speed up ray tracing.  For each triangle
        // in the mesh it builds this packed array
        
        // X of point 0
        // Y of point 0
        // Z of point 0
        // vector X of point 1-point 0
        // vector Y of point 1-point 0
        // vector Z of point 1-point 0
        // vector X of point 2-point 0
        // vector Y of point 2-point 0
        // vector Z of point 2-point 0
    
    this.trigRayTraceCache=new Float32Array(this.trigCount*9);
    
    tIdx=0;
    cIdx=0;
    
    for (n=0;n!==this.trigCount;n++) {
        v0Idx=this.indexes[tIdx++]*3;
        v1Idx=this.indexes[tIdx++]*3;
        v2Idx=this.indexes[tIdx++]*3;
        
            // point 0 of the triangle
            
        this.trigRayTraceCache[cIdx++]=this.vertices[v0Idx];
        this.trigRayTraceCache[cIdx++]=this.vertices[v0Idx+1];
        this.trigRayTraceCache[cIdx++]=this.vertices[v0Idx+2];
        
            // vector of point 1-point 0
            
        this.trigRayTraceCache[cIdx++]=this.vertices[v1Idx]-this.vertices[v0Idx];    
        this.trigRayTraceCache[cIdx++]=this.vertices[v1Idx+1]-this.vertices[v0Idx+1];    
        this.trigRayTraceCache[cIdx++]=this.vertices[v1Idx+2]-this.vertices[v0Idx+2];    

            // vector of point 2-point 0
            
        this.trigRayTraceCache[cIdx++]=this.vertices[v2Idx]-this.vertices[v0Idx];    
        this.trigRayTraceCache[cIdx++]=this.vertices[v2Idx+1]-this.vertices[v0Idx+1];    
        this.trigRayTraceCache[cIdx++]=this.vertices[v2Idx+2]-this.vertices[v0Idx+2];    
    }
}

//
// collision lines
//

function mapMeshAddCollisionLine(p1,p2)
{
    this.collisionLines.push(new wsLine(p1,p2));
}

//
// UVs
//

function mapMeshRebuildPackedUVBuffer()
{
    var n,uvIdx,arrIdx;
    
    uvIdx=0;
    arrIdx=0;
    this.vertexAndLightmapUVs=new Float32Array(this.vertexCount*4);
    
        // if no light map UVs
        
    if (this.lightmapUVs===null) {
        
        for (n=0;n!==this.vertexCount;n++) {
            this.vertexAndLightmapUVs[arrIdx++]=this.vertexUVs[uvIdx];
            this.vertexAndLightmapUVs[arrIdx++]=this.vertexUVs[uvIdx+1];
            this.vertexAndLightmapUVs[arrIdx++]=0.0;
            this.vertexAndLightmapUVs[arrIdx++]=0.0;
            uvIdx+=2;
        }
       
        return;
    }
    
        // pack both together
        
    for (n=0;n!==this.vertexCount;n++) {
        this.vertexAndLightmapUVs[arrIdx++]=this.vertexUVs[uvIdx];
        this.vertexAndLightmapUVs[arrIdx++]=this.vertexUVs[uvIdx+1];
        this.vertexAndLightmapUVs[arrIdx++]=this.lightmapUVs[uvIdx];
        this.vertexAndLightmapUVs[arrIdx++]=this.lightmapUVs[uvIdx+1];
        uvIdx+=2;
    }
}

function mapMeshSetLightmap(lightmap,lightmapUVs)
{
    this.lightmap=lightmap;
    this.lightmapUVs=lightmapUVs;
}

//
// mesh binding
//

function mapMeshSetupBuffers(view)
{
        // need to build the combined texture and
        // light map uv buffer
        
    this.rebuildPackedUVBuffer();
    
        // create all the buffers
        // expects buffers to already be Float32Array
        // or Uint16Array
        
    var gl=view.gl;
            
    this.vertexPosBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,this.vertices,gl.STATIC_DRAW);
    
    this.vertexNormalBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,this.normals,gl.STATIC_DRAW);

    this.vertexTangentBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,this.tangents,gl.STATIC_DRAW);

    this.vertexAndLightmapUVBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexAndLightmapUVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,this.vertexAndLightmapUVs,gl.STATIC_DRAW);

    this.indexBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexes,gl.STATIC_DRAW);    
}

function mapMeshBindBuffers(view,mapShader)
{
    var gl=view.gl;
    
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
    gl.vertexAttribPointer(mapShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
 
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
    gl.vertexAttribPointer(mapShader.vertexNormalAttribute,3,gl.FLOAT,false,0,0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
    gl.vertexAttribPointer(mapShader.vertexTangentAttribute,3,gl.FLOAT,false,0,0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexAndLightmapUVBuffer);
    gl.vertexAttribPointer(mapShader.vertexAndLightmapUVAttribute,4,gl.FLOAT,false,0,0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
}

//
// mesh drawing
//

function mapMeshDraw(view)
{
    var gl=view.gl;
    
    gl.drawElements(gl.TRIANGLES,this.indexCount,gl.UNSIGNED_SHORT,0);
}

//
// close mesh
//

function mapMeshClose()
{
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    
    if (this.vertexPosBuffer!==null) gl.deleteBuffer(this.vertexPosBuffer);
    if (this.vertexNormalBuffer!==null) gl.deleteBuffer(this.vertexNormalBuffer);
    if (this.vertexTangentBuffer!==null) gl.deleteBuffer(this.vertexTangentBuffer);
    if (this.vertexAndLightmapUVAttribute!==null) gl.deleteBuffer(this.vertexAndLightmapUVAttribute);

    if (this.indexBuffer!==null) gl.deleteBuffer(this.indexBuffer);
}

//
// mesh object
//

function mapMeshObject(bitmap,vertices,normals,tangents,vertexUVs,indexes,flag)
{
    this.bitmap=bitmap;
    this.lightmap=null;
    this.vertices=vertices;
    this.normals=normals;
    this.tangents=tangents;
    this.vertexUVs=vertexUVs;
    this.lightmapUVs=null;
    this.vertexAndLightmapUVs=null;
    this.indexes=indexes;
    this.flag=flag;
    
    this.vertexCount=Math.floor(this.vertices.length/3);
    this.indexCount=this.indexes.length;
    this.trigCount=Math.floor(this.indexCount/3);
    
        // null buffers
        
    this.vertexPosBuffer=null;
    this.vertexNormalBuffer=null;
    this.vertexTangentBuffer=null;
    this.vertexAndLightmapUVAttribute=null;
    this.indexBuffer=null;
    
        // special caches for light map building
        
    this.trigRayTraceCache=null;
    
        // collision lines
        
    this.collisionLines=[];
    
        // mesh alterations
        
    this.combineMesh=mapMeshCombineMesh;

        // collision functions
        
    this.boxBoundCollision=mapMeshBoxBoundCollision;
    this.boxMeshCollision=mapMeshBoxMeshCollision;
    
        // triangle functions
    
    this.getTriangleVertex=mapMeshGetTriangleVertex;
    this.getTriangleBounds=mapMeshGetTriangleBounds;
    this.isTriangleStraightWall=mapMeshIsTriangleStraightWall;
    this.removeTriangle=mapMeshRemoveTriangle;
    
        // setup
        
    this.setupBounds=mapMeshSetupBounds;
    
        // special caches
        
    this.buildTrigRayTraceCache=mapMeshBuildTrigRayTraceCache;
    
        // collision lines
        
    this.addCollisionLine=mapMeshAddCollisionLine;
    
        // UVs
    
    this.rebuildPackedUVBuffer=mapMeshRebuildPackedUVBuffer;
    this.setLightmap=mapMeshSetLightmap;
    
        // draw functions
        
    this.setupBuffers=mapMeshSetupBuffers;
    this.bindBuffers=mapMeshBindBuffers;
    this.draw=mapMeshDraw;
    
        // close functions
        
    this.close=mapMeshClose;
    
        // setup bounds
        
    this.setupBounds();
}


