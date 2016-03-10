"use strict";

//
// model mesh vertex
//

class ModelMeshVertexClass
{
    constructor()
    {
        this.position=new wsPoint(0,0,0);
        this.normal=new wsPoint(0.0,0.0,0.0);
        this.tangent=new wsPoint(0.0,0.0,0.0);
        this.uv=new ws2DPoint(0.0,0.0);

        this.boneIdx=-1;
        this.vectorFromBone=new wsPoint(0.0,0.0,0.0);

        this.parentBoneIdx=-1;
        this.vectorFromParentBone=new wsPoint(0.0,0.0,0.0);
    }
}

//
// model mesh class
//

class ModelMeshClass
{
    constructor(bitmap,vertexList,indexes,flag)
    {
        this.bitmap=bitmap;
        this.vertexList=vertexList;
        this.indexes=indexes;
        this.flag=flag;

        this.vertexCount=this.vertexList.length;
        this.indexCount=this.indexes.length;
        this.trigCount=Math.trunc(this.indexCount/3);

            // non-culled index list

        this.nonCulledIndexCount=0;
        this.nonCulledIndexes=null;

            // drawing arrays

        this.drawVertices=null;
        this.drawNormals=null;
        this.drawTangents=null;
        this.drawUVs=null;

            // gl buffers

        this.vertexPosBuffer=null;
        this.vertexNormalBuffer=null;
        this.vertexTangentBuffer=null;
        this.vertexUVAttribute=null;
        this.indexBuffer=null;

            // global variables to stop GCd

        this.rotVector=new wsPoint(0.0,0.0,0.0);
        this.rotNormal=new wsPoint(0.0,0.0,0.0);
        this.parentRotVector=new wsPoint(0.0,0.0,0.0);
        this.parentRotNormal=new wsPoint(0.0,0.0,0.0);
    }
    
        //
        // close model mesh
        //

    close(view)
    {
        var gl=view.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        if (this.vertexPosBuffer!==null) gl.deleteBuffer(this.vertexPosBuffer);
        if (this.vertexNormalBuffer!==null) gl.deleteBuffer(this.vertexNormalBuffer);
        if (this.vertexTangentBuffer!==null) gl.deleteBuffer(this.vertexTangentBuffer);
        if (this.vertexUVAttribute!==null) gl.deleteBuffer(this.vertexUVAttribute);

        if (this.indexBuffer!==null) gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // clone
        //
        
    clone()
    {
            // nothing that is part of this mesh is every changed
            // only the internal gl arrays so we can just re-use the
            // data
        
        return(new ModelMeshClass(this.bitmap,this.vertexList,this.indexes,this.flag));
    }
    
        //
        // precalcs the vector from the bone animations
        //
        
    precalcAnimationValues(skeleton)
    {
        var n,v,bone,parentBone;

        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            bone=skeleton.bones[v.boneIdx];
            v.vectorFromBone.setFromSubPoint(v.position,bone.position);
            
            if (bone.parentBoneIdx!==-1) {
                parentBone=skeleton.bones[bone.parentBoneIdx];
                
                v.parentBoneIdx=bone.parentBoneIdx;
                v.vectorFromParentBone.setFromSubPoint(v.position,parentBone.position);
            }
        }
    }
    
        //
        // set vertices to pose and offset position
        //
        
    updateVertexesToPoseAndPosition(view,skeleton,angle,position)
    {
        var n,v;
        var bone,parentBone;
        
            // move all the vertexes
            
        var vIdx=0;
        var nIdx=0;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
                // bone movement
                
            bone=skeleton.bones[v.boneIdx];
                
            this.rotVector.setFromPoint(v.vectorFromBone);
            this.rotVector.rotate(bone.curPoseAngle);
            
            this.rotVector.x=bone.curPosePosition.x+this.rotVector.x;
            this.rotVector.y=bone.curPosePosition.y+this.rotVector.y;
            this.rotVector.z=bone.curPosePosition.z+this.rotVector.z;
            
            this.rotNormal.setFromPoint(v.normal);
            this.rotNormal.rotate(bone.curPoseAngle);
            
                // average in any parent movement
                
            if (v.parentBoneIdx!==-1) {
                parentBone=skeleton.bones[v.parentBoneIdx];
                
                this.parentRotVector.setFromPoint(v.vectorFromParentBone);
                this.parentRotVector.rotate(parentBone.curPoseAngle);

                this.parentRotVector.x=parentBone.curPosePosition.x+this.parentRotVector.x;
                this.parentRotVector.y=parentBone.curPosePosition.y+this.parentRotVector.y;
                this.parentRotVector.z=parentBone.curPosePosition.z+this.parentRotVector.z;

                this.parentRotNormal.setFromPoint(v.normal);
                this.parentRotNormal.rotate(parentBone.curPoseAngle);
                
                this.rotVector.average(this.parentRotVector);
                this.rotNormal.average(this.parentRotNormal);
            }    
            
                // whole model movement
                
            this.rotVector.rotate(angle);
            
            this.drawVertices[vIdx++]=this.rotVector.x+position.x;
            this.drawVertices[vIdx++]=this.rotVector.y+position.y;
            this.drawVertices[vIdx++]=this.rotVector.z+position.z;
            
            this.rotNormal.rotate(angle);
            
            this.drawNormals[nIdx++]=this.rotNormal.x;
            this.drawNormals[nIdx++]=this.rotNormal.y;
            this.drawNormals[nIdx++]=this.rotNormal.z;
        }
        
            // set the buffers
            
        var gl=view.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawVertices,gl.DYNAMIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawNormals,gl.STATIC_DRAW);
    }
    
        //
        // set vertices to ang and offset position
        //
        
    updateVertexesToAngleAndPosition(view,angle,position)
    {
        var n,v;
        
            // move all the vertexes
            
        var vIdx=0;
        var nIdx=0;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            this.rotVector.setFromPoint(v.position);
            this.rotVector.rotate(angle);
            
            this.drawVertices[vIdx++]=this.rotVector.x+position.x;
            this.drawVertices[vIdx++]=this.rotVector.y+position.y;
            this.drawVertices[vIdx++]=this.rotVector.z+position.z;
            
            this.rotNormal.setFromPoint(v.normal);
            this.rotNormal.rotate(angle);
            
            this.drawNormals[nIdx++]=this.rotNormal.x;
            this.drawNormals[nIdx++]=this.rotNormal.y;
            this.drawNormals[nIdx++]=this.rotNormal.z;
        }
        
            // set the buffers
            
        var gl=view.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawVertices,gl.DYNAMIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawNormals,gl.STATIC_DRAW);
    }

        //
        // model mesh gl binding
        //

    setupBuffers(view)
    {
            // build the default buffer data
            // from the vertex list
        
        var n;
        
        this.drawVertices=new Float32Array(this.vertexCount*3);
        this.drawNormals=new Float32Array(this.vertexCount*3);
        this.drawTangents=new Float32Array(this.vertexCount*3);
        this.drawUVs=new Float32Array(this.vertexCount*2);
        
        var vIdx=0;
        var uIdx=0;
        var nIdx=0;
        var tIdx=0;
        var v;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            this.drawVertices[vIdx++]=v.position.x;
            this.drawVertices[vIdx++]=v.position.y;
            this.drawVertices[vIdx++]=v.position.z;
            
            this.drawNormals[nIdx++]=v.normal.x;
            this.drawNormals[nIdx++]=v.normal.y;
            this.drawNormals[nIdx++]=v.normal.z;
            
            this.drawTangents[tIdx++]=v.tangent.x;
            this.drawTangents[tIdx++]=v.tangent.y;
            this.drawTangents[tIdx++]=v.tangent.z;
            
            this.drawUVs[uIdx++]=v.uv.x;
            this.drawUVs[uIdx++]=v.uv.y;
        }

            // create all the buffers

        var gl=view.gl;

        this.vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawVertices,gl.DYNAMIC_DRAW);

        this.vertexNormalBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawNormals,gl.STATIC_DRAW);

        this.vertexTangentBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawTangents,gl.STATIC_DRAW);

        this.vertexUVBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawUVs,gl.STATIC_DRAW);

            // indexes are dynamic
            
        this.indexBuffer=gl.createBuffer();
    }

    bindBuffers(view,modelShader)
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

            // need to always rebuild the array from the culled list
            
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.nonCulledIndexes,gl.DYNAMIC_DRAW);
    }
    
        //
        // build an index list of triangles that aren't
        // culled
        //
        
    buildNonCulledTriangleIndexes(view)
    {
        var n,idx,vIdx;
        var pnt=new wsPoint(0,0,0);
        var normal=new wsPoint(0,0,0);
        var trigToEyeVector=new wsPoint(0,0,0);

            // if it's the first time, we'll need
            // to create the index array
            
        this.nonCulledIndexCount=0;
        if (this.nonCulledIndexes===null) this.nonCulledIndexes=new Uint16Array(this.indexCount);
        
            // build it out of triangles
            // that aren't normal culled, i.e.,
            // have normals facing away from the eye
            // which is the dot product between the normal
            // and the vector from trig to eye point
        
        idx=0;
        
        for (n=0;n!==this.trigCount;n++) {
            
            vIdx=this.indexes[idx]*3;
            
                // vector from trig to eye point
                
            pnt.setFromValues(this.drawVertices[vIdx],this.drawVertices[vIdx+1],this.drawVertices[vIdx+2]);
            trigToEyeVector.setFromSubPoint(pnt,view.camera.position);
            trigToEyeVector.normalize();
            
                // dot product
                
            normal.setFromValues(this.drawNormals[vIdx],this.drawNormals[vIdx+1],this.drawNormals[vIdx+2]);
                
            if (trigToEyeVector.dot(normal)<=view.VIEW_NORMAL_CULL_LIMIT) {
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx++];
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx++];
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx++];
            }
            else {
                idx+=3;
            }
        }
    }

        //
        // model mesh drawing
        //

    draw(view)
    {
        var gl=view.gl;

        gl.drawElements(gl.TRIANGLES,this.nonCulledIndexCount,gl.UNSIGNED_SHORT,0);
        
        view.drawModelCount++;
        view.drawModelTrigCount+=Math.trunc(this.nonCulledIndexCount/3);
    }

}
