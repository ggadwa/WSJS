"use strict";

//
// model mesh class
//

function ModelMeshObject(bitmap,vertices,normals,tangents,vertexUVs,indexes,flag)
{
    this.bitmap=bitmap;
    this.vertices=vertices;
    this.normals=normals;
    this.tangents=tangents;
    this.vertexUVs=vertexUVs;
    this.indexes=indexes;
    this.flag=flag;
    
    this.vertexCount=Math.floor(this.vertices.length/3);
    this.indexCount=this.indexes.length;
    this.trigCount=Math.floor(this.indexCount/3);
    
        // null buffers
        
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
        // model mesh gl binding
        //

    this.setupBuffers=function(view)
    {
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

        this.vertexUVBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexUVs,gl.STATIC_DRAW);

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
        gl.vertexAttribPointer(modelShader.vertexUVAttribute,4,gl.FLOAT,false,0,0);

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
