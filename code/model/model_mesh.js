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
    this.vectorFromBone=new wsPoint(0.0,0.0,0.0);
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
    
        // non-culled index list
        
    this.nonCulledIndexCount=0;
    this.nonCulledIndexes=null;
    
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
        // clone
        //
        
    this.clone=function()
    {
            // nothing that is part of this mesh is every changed
            // only the internal gl arrays so we can just re-use the
            // data
        
        return(new ModelMeshObject(this.bitmap,this.vertexList,this.indexes,this.flag));
    };
    
        //
        // precalcs the vector from the bone animations
        //
        
    this.precalcAnimationValues=function(skeleton)
    {
        var n,v,bone;

        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            bone=skeleton.bones[v.boneIdx];
            
            v.vectorFromBone.setFromSubPoint(v.position,bone.position);
        }
    };
    
        //
        // set vertices to pose and model position
        //
        
    this.updateVertexesToPoseAndPosition=function(view,skeleton,offsetPosition)
    {
        var n,v;
        var bone,normal;
        
        var rotVector=new wsPoint(0.0,0.0,0.0);
        
            // move all the vertexes
            
        var vIdx=0;
        var nIdx=0;
        
        var vertices=new Float32Array(this.vertexCount*3);
        var normals=new Float32Array(this.vertexCount*3);
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            bone=skeleton.bones[v.boneIdx];
            
            rotVector.setFromPoint(v.vectorFromBone);
            rotVector.rotateAroundPoint(null,bone.curPoseAngle);
            
            vertices[vIdx++]=bone.curPosePosition.x+rotVector.x+offsetPosition.x;
            vertices[vIdx++]=bone.curPosePosition.y+rotVector.y+offsetPosition.y;
            vertices[vIdx++]=bone.curPosePosition.z+rotVector.z+offsetPosition.z;
            
            normal=v.normal.copy();
            normal.rotateAroundPoint(null,bone.curPoseAngle);
            
            normals[nIdx++]=normal.x;
            normals[nIdx++]=normal.y;
            normals[nIdx++]=normal.z;
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
        // build an index list of triangles that aren't
        // culled
        //
        
    this.buildNonCulledTriangleIndexes=function(view)
    {
         // non-culled index list
        
    //this.nonCulledIndexCount=0;
    //this.nonCulledIndexes=null;
 		// skip polys with away facing normals
		// do dot product between normal and vector
		// from poly mid-eye point

	//return(((poly->tangent_space.normal.x*(float)(poly->box.mid.x-view.render->camera.pnt.x))+(poly->tangent_space.normal.y*(float)(poly->box.mid.y-view.render->camera.pnt.y))+(poly->tangent_space.normal.z*(float)(poly->box.mid.z-view.render->camera.pnt.z)))>map.optimize.cull_angle);
      
    };

        //
        // model mesh drawing
        //

    this.draw=function(view)
    {
        var gl=view.gl;

        gl.drawElements(gl.TRIANGLES,this.indexCount,gl.UNSIGNED_SHORT,0);
        
        view.drawModelCount++;
        view.drawModelTrigCount+=this.trigCount;
    };

}
