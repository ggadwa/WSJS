"use strict";

//
// model mesh vertex
//

function ModelMeshVertexObject()
{
    this.position=new wsPoint(0,0,0);
    this.normal=new wsPoint(0.0,0.0,0.0);
    this.tangent=new wsPoint(0.0,0.0,0.0);
    this.uv=new ws2DPoint(0.0,0.0);
    this.boneIdx=-1;
}

//
// model mesh class
//

function ModelMeshObject(bitmap,vertexList,indexes,flag)
{
    this.bitmap=bitmap;
    this.vertexList=vertexList;
    this.indexes=indexes;
    this.flag=flag;
    
    this.vertexCount=this.vertexList.length;
    this.indexCount=this.indexes.length;
    this.trigCount=Math.floor(this.indexCount/3);
    
        // gl buffers
        
    this.vertexPosBuffer=null;
    this.vertexNormalBuffer=null;
    this.vertexTangentBuffer=null;
    this.vertexUVAttribute=null;
    this.indexBuffer=null;
        
        //
        // close model mesh
        //

    this.close=function(view)
    {
        var gl=view.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        if (this.vertexPosBuffer!==null) gl.deleteBuffer(this.vertexPosBuffer);
        if (this.vertexNormalBuffer!==null) gl.deleteBuffer(this.vertexNormalBuffer);
        if (this.vertexTangentBuffer!==null) gl.deleteBuffer(this.vertexTangentBuffer);
        if (this.vertexUVAttribute!==null) gl.deleteBuffer(this.vertexUVAttribute);

        if (this.indexBuffer!==null) gl.deleteBuffer(this.indexBuffer);
    };
    
        //
        // set vertices to pose and model position
        //
        
    this.updateVertexesToPoseAndPosition=function(view,skeleton,offsetPosition)
    {
        var n,v;
        var bone;
        
            // move all the vertexes
            
        var vIdx=0;
        var nIdx=0;
        
        var vertices=new Float32Array(this.vertexCount*3);
        var normals=new Float32Array(this.vertexCount*3);
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            bone=skeleton.bones[v.boneIdx];
            
            vertices[vIdx++]=v.position.x+bone.curPoseVector.x+offsetPosition.x;
            vertices[vIdx++]=v.position.y+bone.curPoseVector.y+offsetPosition.y;
            vertices[vIdx++]=v.position.z+bone.curPoseVector.z+offsetPosition.z;
            
            normals[nIdx++]=v.normal.x;         // supergumba -- need to rotate these
            normals[nIdx++]=v.normal.y;
            normals[nIdx++]=v.normal.z;
        }
        
            // set the buffers
            
        var gl=view.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,normals,gl.STATIC_DRAW);
    };

        //
        // model mesh gl binding
        //

    this.setupBuffers=function(view)
    {
            // build the default buffer data
            // from the vertex list
        
        var n;
        
        var vertices=new Float32Array(this.vertexCount*3);
        var normals=new Float32Array(this.vertexCount*3);
        var tangents=new Float32Array(this.vertexCount*3);
        var uvs=new Float32Array(this.vertexCount*2);
        
        var vIdx=0;
        var uIdx=0;
        var nIdx=0;
        var tIdx=0;
        var v;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            vertices[vIdx++]=v.position.x;
            vertices[vIdx++]=v.position.y;
            vertices[vIdx++]=v.position.z;
            
            uvs[uIdx++]=v.uv.x;
            uvs[uIdx++]=v.uv.y;
            
            normals[nIdx++]=v.normal.x;
            normals[nIdx++]=v.normal.y;
            normals[nIdx++]=v.normal.z;
            
            tangents[tIdx++]=v.tangent.x;
            tangents[tIdx++]=v.tangent.y;
            tangents[tIdx++]=v.tangent.z;
        }

            // create all the buffers

        var gl=view.gl;

        this.vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);

        this.vertexNormalBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,normals,gl.STATIC_DRAW);

        this.vertexTangentBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,tangents,gl.STATIC_DRAW);

        this.vertexUVBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,uvs,gl.STATIC_DRAW);

            // indexes are static lists
            
        this.indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexes,gl.STATIC_DRAW);    
    };

    this.bindBuffers=function(view,modelShader)
    {
        var gl=view.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.vertexAttribPointer(modelShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.vertexAttribPointer(modelShader.vertexNormalAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.vertexAttribPointer(modelShader.vertexTangentAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.vertexAttribPointer(modelShader.vertexUVAttribute,2,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
    };

        //
        // model mesh drawing
        //

    this.draw=function(view)
    {
        var gl=view.gl;

        gl.drawElements(gl.TRIANGLES,this.indexCount,gl.UNSIGNED_SHORT,0);
    };

}
