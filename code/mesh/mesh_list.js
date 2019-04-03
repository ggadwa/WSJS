import * as constants from '../main/constants.js';
import config from '../main/config.js';
import PointClass from '../utility/point.js';
import Matrix3Class from '../utility/matrix3.js';
import Matrix4Class from '../utility/matrix4.js';

//
// mesh list class
//

export default class MeshListClass
{
    constructor(core)
    {
        this.core=core;
        this.shader=null;           // this will be attached later when initialized

        this.meshes=[];
        
            // some pre-allocated matrixes
            
        this.normalMatrix=new Matrix3Class();
        this.modelViewMatrix=new Matrix4Class();

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize(shader)
    {
        this.shader=shader;
        
        return(true);
    }

    release()
    {
    }
    
        //
        // clear mesh list
        //

    clear()
    {
        let mesh;

        for (mesh of this.meshes) {
            mesh.close();
        }
        
        this.meshes=[];
    }

        //
        // mesh items
        //

    add(mesh)
    {
        this.meshes.push(mesh);
        return(this.meshes.length-1);
    }
    
    get(idx)
    {
        return(this.meshes[idx]);
    }
    
    find(name)
    {
        let n;
        let nMesh=this.meshes.length;

        for (n=0;n!==nMesh;n++) {
            if (this.meshes[n].name===name) return(n);
        }

        return(-1);
    }

    delete(name)
    {
        let mesh;
        let idx=this.find(name);
        if (idx===-1) return;
        
        mesh=this.meshes[idx];
        mesh.close();
        this.meshes.splice(idx,1);
    }
    
        //
        // set no/simple collisions for bitmaps
        //
        
    setNoCollisionsForBitmap(bitmap)
    {
        let mesh;
        
        for (mesh of this.meshes) {
            if (mesh.bitmap.colorURL===bitmap.colorURL) mesh.noCollisions=true;
        }
    }
    
    setNoCollisionsForMeshes(name)
    {
        let mesh;
        
        for (mesh of this.meshes) {
            if (mesh.name.startsWith(name)) mesh.noCollisions=true;
        }
    }
    
    setSimpleCollisionsForBitmap(bitmap)
    {
        let mesh;
        
        for (mesh of this.meshes) {
            if (mesh.bitmap.colorURL===bitmap.colorURL) mesh.simpleCollisions=true;
        }
    }
    
    setSimpleCollisionsForMeshes(name)
    {
        let mesh;
        
        for (mesh of this.meshes) {
            if (mesh.name.startsWith(name)) mesh.simpleCollisions=true;
        }
    }
    
        //
        // check for mesh list collisions
        //

    boxBoundCollision(xBound,yBound,zBound)
    {
        let n;
        let nMesh=this.meshes.length;

        for (n=0;n!==nMesh;n++) {
            if (this.meshes[n].boxBoundCollision(xBound,yBound,zBound)) return(n);
        }

        return(-1);
    }

    boxMeshCollision(checkMesh,onlyFlag)
    {
        let n;
        let nMesh=this.meshes.length;

        for (n=0;n!==nMesh;n++) {
            if (onlyFlag!==null) {
                if (this.meshes[n].flag!==onlyFlag) continue;
            }
            if (this.meshes[n].boxMeshCollision(checkMesh)) return(n);
        }

        return(-1);
    }

        //
        // run through the meshes and
        // have them build their collision meshes
        //
        
    buildCollisionGeometry()
    {
        let mesh;

        for (mesh of this.meshes) {
            mesh.buildCollisionGeometry();
        }
    }
    
        //
        // only use on maps as they aren't rigged
        // animations have inverseBindMatrixes which have
        // transposes in them so you can only scale them
        // in model matrixes
        //
        
    scaleMeshes(scale)
    {
        let mesh;

        for (mesh of this.meshes) {
            mesh.scale(scale);
        }
    }
    
        //
        // setup all the mesh buffers
        //

    setupBuffers()
    {
        let mesh;

        for (mesh of this.meshes) {
            mesh.setupBuffers();
        }
    }
    
        //
        // draw meshes
        //

    draw(modelEntityAlter)
    {
        let n,k,mesh;
        let jointMatrixArray;
        let currentBitmap,currentSkinIdx;
        let gl=this.core.gl;
        let nMesh=this.meshes.length;
        
            // start the shader
        
        this.shader.drawStart();
        
            // if a model then we use the model
            // matrix to position it, models don't
            // have pre-set normal matrixes because
            // they need the skin (view*model*skin) so
            // they are calculated in the shader
            
            // also some models (like hand weapons)
            // draw in the camera space, so we have to replace
            // the view here
            
        if (modelEntityAlter!==null) {
            gl.uniformMatrix4fv(this.shader.modelMatrixUniform,false,modelEntityAlter.modelMatrix.data);
            if (modelEntityAlter.inCameraSpace) gl.uniformMatrix4fv(this.shader.viewMatrixUniform,false,this.core.cameraSpaceViewMatrix.data);
        }
        
            // otherwise it's a map mesh, which is pre-positioned
            // so we don't need a model matrix, but we
            // need to create the normal matrix, which
            // is used to tranform normals into eye space
            
        else {    
            this.normalMatrix.setInvertTransposeFromMat4(this.core.viewMatrix);
            gl.uniformMatrix3fv(this.shader.normalMatrixUniform,false,this.normalMatrix.data);
        }

            // keep track of skin and bitmap
            // changes to reduce state changes

        currentSkinIdx=-1;
        currentBitmap=null;
        
            // draw the meshes

        for (n=0;n!==nMesh;n++) {
            mesh=this.meshes[n];

                // if we are in a model (we have a model
                // matrix) we have to deal with meshes that are
                // skinned and not skinned through some variables
                // and setting or changing the joint skinning matrix
                
            if (modelEntityAlter!==null) {
                
                    // any hidden model meshes
                    
                if (modelEntityAlter.meshHideList[n]===1) continue;
                
                    // skinned
                    
                if (mesh.noSkinAttachedNodeIdx===-1) {
                    gl.uniform1i(this.shader.noSkinUniform,0);
                    
                    if (currentSkinIdx!==mesh.skinIdx) {
                        currentSkinIdx=mesh.skinIdx;
                        
                        jointMatrixArray=modelEntityAlter.getPoseJointMatrixArray(currentSkinIdx);
                        for (k=0;k!==jointMatrixArray.length;k++) {
                            gl.uniformMatrix4fv(this.shader.jointMatrixUniformArray[k],false,jointMatrixArray[k].data);
                        }
                    }
                }
                
                    // not skinned
                    
                else {
                    gl.uniform1i(this.shader.noSkinUniform,1);
                    gl.uniformMatrix4fv(this.shader.noSkinAttachedNodeMatrixUniform,false,modelEntityAlter.getNodeCurrentPoseMatrix(mesh.noSkinAttachedNodeIdx).data);
                }
            }
            
                // models cull as a single unit, but map meshes
                // which are precalculated cull against the view frustum
                // on a per mesh basis
            
            else {
                if (!this.core.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) continue;
            }
            
                // time to change bitmap

            if (mesh.bitmap!==currentBitmap) {
                currentBitmap=mesh.bitmap;
                mesh.bitmap.attachAsTexture(this.shader);
            }
            
                // draw the mesh

            mesh.updateBuffers();
            mesh.bindBuffers(this.shader);
            mesh.draw();
        }
        
        this.shader.drawEnd();
    }
    
        //
        // debug for drawing collision surfaces
        // note this is not optimal and slow!
        //
        
    debugDrawCollisionSurfaces()
    {
        let k,mesh,wall,floor,ceiling;
        let vertexes,vertexBuffer,indexBuffer;
        let gl=this.core.gl;
        let shader=this.core.shaderList.debugShader;
        
        shader.drawStart();
        
            // arrays for any drawing
            
        vertexes=new Float32Array(36);     // we need at least 12 triangles for simple collision cubes
        
        vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexes,gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

            // draw the collision parts

        for (mesh of this.meshes) {
            if (mesh.noCollisions) continue;

                // skip if not in view frustum

            if (!this.core.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) continue;
            
                // draw simple collisions in yellow
                
            if (mesh.simpleCollisions) {
                vertexes[0]=mesh.xBound.min;        // top
                vertexes[1]=mesh.yBound.max;
                vertexes[2]=mesh.zBound.min;
                vertexes[3]=mesh.xBound.max;
                vertexes[4]=mesh.yBound.max;
                vertexes[5]=mesh.zBound.min;
                vertexes[6]=mesh.xBound.max;
                vertexes[7]=mesh.yBound.max;
                vertexes[8]=mesh.zBound.max;
                vertexes[9]=mesh.xBound.min;
                vertexes[10]=mesh.yBound.max;
                vertexes[11]=mesh.zBound.min;
                vertexes[12]=mesh.xBound.max;
                vertexes[13]=mesh.yBound.max;
                vertexes[14]=mesh.zBound.max;
                vertexes[15]=mesh.xBound.min;
                vertexes[16]=mesh.yBound.max;
                vertexes[17]=mesh.zBound.max;

                vertexes[18]=mesh.xBound.min;        // bottom
                vertexes[19]=mesh.yBound.min;
                vertexes[20]=mesh.zBound.min;
                vertexes[21]=mesh.xBound.max;
                vertexes[22]=mesh.yBound.min;
                vertexes[23]=mesh.zBound.min;
                vertexes[24]=mesh.xBound.max;
                vertexes[25]=mesh.yBound.min;
                vertexes[26]=mesh.zBound.max;
                vertexes[27]=mesh.xBound.min;
                vertexes[28]=mesh.yBound.min;
                vertexes[29]=mesh.zBound.min;
                vertexes[30]=mesh.xBound.max;
                vertexes[31]=mesh.yBound.min;
                vertexes[32]=mesh.zBound.max;
                vertexes[33]=mesh.xBound.min;
                vertexes[34]=mesh.yBound.min;
                vertexes[35]=mesh.zBound.max;

                gl.uniform3f(shader.colorUniform,0.8,0.8,0.0);
                gl.bufferSubData(gl.ARRAY_BUFFER,0,vertexes);
                gl.drawArrays(gl.TRIANGLES,0,12);
                
                vertexes[0]=mesh.xBound.min;        // left
                vertexes[1]=mesh.yBound.max;
                vertexes[2]=mesh.zBound.max;
                vertexes[3]=mesh.xBound.min;
                vertexes[4]=mesh.yBound.max;
                vertexes[5]=mesh.zBound.min;
                vertexes[6]=mesh.xBound.min;
                vertexes[7]=mesh.yBound.min;
                vertexes[8]=mesh.zBound.min;
                vertexes[9]=mesh.xBound.min;
                vertexes[10]=mesh.yBound.max;
                vertexes[11]=mesh.zBound.max;
                vertexes[12]=mesh.xBound.min;
                vertexes[13]=mesh.yBound.min;
                vertexes[14]=mesh.zBound.min;
                vertexes[15]=mesh.xBound.min;
                vertexes[16]=mesh.yBound.min;
                vertexes[17]=mesh.zBound.max;

                vertexes[18]=mesh.xBound.max;        // right
                vertexes[19]=mesh.yBound.max;
                vertexes[20]=mesh.zBound.max;
                vertexes[21]=mesh.xBound.max;
                vertexes[22]=mesh.yBound.max;
                vertexes[23]=mesh.zBound.min;
                vertexes[24]=mesh.xBound.max;
                vertexes[25]=mesh.yBound.min;
                vertexes[26]=mesh.zBound.min;
                vertexes[27]=mesh.xBound.max;
                vertexes[28]=mesh.yBound.max;
                vertexes[29]=mesh.zBound.max;
                vertexes[30]=mesh.xBound.max;
                vertexes[31]=mesh.yBound.min;
                vertexes[32]=mesh.zBound.min;
                vertexes[33]=mesh.xBound.max;
                vertexes[34]=mesh.yBound.min;
                vertexes[35]=mesh.zBound.max;

                gl.uniform3f(shader.colorUniform,1.0,1.0,0.0);
                gl.bufferSubData(gl.ARRAY_BUFFER,0,vertexes);
                gl.drawArrays(gl.TRIANGLES,0,12);
                
                
                
                continue;
            }
            
                // draw the walls in green

            gl.uniform3f(shader.colorUniform,0.0,1.0,0.0);
            
            for (k=0;k!==mesh.collisionWallTrigs.length;k++) {
                wall=mesh.collisionWallTrigs[k];
                
                vertexes[0]=wall.v0.x;
                vertexes[1]=wall.v0.y;
                vertexes[2]=wall.v0.z;
                vertexes[3]=wall.v1.x;
                vertexes[4]=wall.v1.y;
                vertexes[5]=wall.v1.z;
                vertexes[6]=wall.v2.x;
                vertexes[7]=wall.v2.y;
                vertexes[8]=wall.v2.z;
                
                gl.bufferSubData(gl.ARRAY_BUFFER,0,vertexes);
                gl.drawArrays(gl.TRIANGLES,0,3);
            }
            
                // draw the floors in blue

            gl.uniform3f(shader.colorUniform,0.0,0.0,1.0);
            
            for (k=0;k!==mesh.collisionFloorTrigs.length;k++) {
                floor=mesh.collisionFloorTrigs[k];
                
                vertexes[0]=floor.v0.x;
                vertexes[1]=floor.v0.y;
                vertexes[2]=floor.v0.z;
                vertexes[3]=floor.v1.x;
                vertexes[4]=floor.v1.y;
                vertexes[5]=floor.v1.z;
                vertexes[6]=floor.v2.x;
                vertexes[7]=floor.v2.y;
                vertexes[8]=floor.v2.z;
                
                gl.bufferSubData(gl.ARRAY_BUFFER,0,vertexes);
                gl.drawArrays(gl.TRIANGLES,0,3);
            }
            
                // draw the ceilings in red

            gl.uniform3f(shader.colorUniform,1.0,0.0,0.0);
            
            for (k=0;k!==mesh.collisionCeilingTrigs.length;k++) {
                ceiling=mesh.collisionCeilingTrigs[k];
                
                vertexes[0]=ceiling.v0.x;
                vertexes[1]=ceiling.v0.y;
                vertexes[2]=ceiling.v0.z;
                vertexes[3]=ceiling.v1.x;
                vertexes[4]=ceiling.v1.y;
                vertexes[5]=ceiling.v1.z;
                vertexes[6]=ceiling.v2.x;
                vertexes[7]=ceiling.v2.y;
                vertexes[8]=ceiling.v2.z;
                
                gl.bufferSubData(gl.ARRAY_BUFFER,0,vertexes);
                gl.drawArrays(gl.TRIANGLES,0,3);
            }
        }
        
        shader.drawEnd();
        
            // tear down buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(indexBuffer);
    }
    
}
