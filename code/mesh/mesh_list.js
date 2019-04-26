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
        let idx,vertexCount;
        let vertexes,vertexBuffer,indexBuffer;
        let gl=this.core.gl;
        let shader=this.core.shaderList.debugShader;
        
        shader.drawStart();
        
            // get max number of items to draw
            
        vertexCount=0;
        
        for (mesh of this.meshes) {
            if (mesh.noCollisions) continue;
            
            vertexCount+=(Math.max(mesh.collisionWallTrigs.length,mesh.collisionFloorTrigs.length,mesh.collisionCeilingTrigs.length)*9);
        }
        
            // arrays for any drawing
            
        vertexes=new Float32Array(vertexCount);
        
        vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexes,gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

            // draw the collision parts

        for (mesh of this.meshes) {
            if (mesh.noCollisions) continue;

                // skip if not in view frustum

            if (!this.core.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) continue;
            
                // draw the walls in green
                // or yellow if simple

            idx=0;
            
            for (k=0;k!==mesh.collisionWallTrigs.length;k++) {
                wall=mesh.collisionWallTrigs[k];
                
                vertexes[idx++]=wall.v0.x;
                vertexes[idx++]=wall.v0.y;
                vertexes[idx++]=wall.v0.z;
                vertexes[idx++]=wall.v1.x;
                vertexes[idx++]=wall.v1.y;
                vertexes[idx++]=wall.v1.z;
                vertexes[idx++]=wall.v2.x;
                vertexes[idx++]=wall.v2.y;
                vertexes[idx++]=wall.v2.z;
            }
            
            if (idx!==0) {
                if (mesh.simpleCollisions) {
                    gl.uniform3f(shader.colorUniform,1.0,1.0,0.0);
                }
                else {
                    gl.uniform3f(shader.colorUniform,0.0,1.0,0.0);
                }

                gl.bufferSubData(gl.ARRAY_BUFFER,0,vertexes,0,idx);
                gl.drawArrays(gl.TRIANGLES,0,idx);
            }
            
                // draw the floors in blue
                // or puple is simple

            idx=0;
            
            for (k=0;k!==mesh.collisionFloorTrigs.length;k++) {
                floor=mesh.collisionFloorTrigs[k];
                
                vertexes[idx++]=floor.v0.x;
                vertexes[idx++]=floor.v0.y;
                vertexes[idx++]=floor.v0.z;
                vertexes[idx++]=floor.v1.x;
                vertexes[idx++]=floor.v1.y;
                vertexes[idx++]=floor.v1.z;
                vertexes[idx++]=floor.v2.x;
                vertexes[idx++]=floor.v2.y;
                vertexes[idx++]=floor.v2.z;
            }
                
            if (idx!==0) {
                if (mesh.simpleCollisions) {
                    gl.uniform3f(shader.colorUniform,1.0,0.0,1.0);
                }
                else {
                    gl.uniform3f(shader.colorUniform,0.0,0.0,1.0);
                }
                
                gl.bufferSubData(gl.ARRAY_BUFFER,0,vertexes,0,idx);
                gl.drawArrays(gl.TRIANGLES,0,idx);
            }
            
                // draw the ceilings in red
                // or orange if simple

            idx=0;
            
            for (k=0;k!==mesh.collisionCeilingTrigs.length;k++) {
                ceiling=mesh.collisionCeilingTrigs[k];
                
                vertexes[idx++]=ceiling.v0.x;
                vertexes[idx++]=ceiling.v0.y;
                vertexes[idx++]=ceiling.v0.z;
                vertexes[idx++]=ceiling.v1.x;
                vertexes[idx++]=ceiling.v1.y;
                vertexes[idx++]=ceiling.v1.z;
                vertexes[idx++]=ceiling.v2.x;
                vertexes[idx++]=ceiling.v2.y;
                vertexes[idx++]=ceiling.v2.z;
            }
                
            if (idx!==0) {
                if (mesh.simpleCollisions) {
                    gl.uniform3f(shader.colorUniform,1.0,0.4,0.0);
                }
                else {
                    gl.uniform3f(shader.colorUniform,1.0,0.0,0.0);
                }
                
                gl.bufferSubData(gl.ARRAY_BUFFER,0,vertexes,0,idx);
                gl.drawArrays(gl.TRIANGLES,0,idx);
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
