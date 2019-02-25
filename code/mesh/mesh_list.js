import * as constants from '../main/constants.js';
import config from '../main/config.js';
import PointClass from '../utility/point.js';

//
// mesh list class
//

export default class MeshListClass
{
    constructor(view)
    {
        this.view=view;
        this.shader=null;           // this will be attached later when initialized

        this.meshes=[];
        
        this.frustumTranslationPoint=new PointClass(0,0,0);
        
            // this is an optimization that we use to skip
            // transparency drawing if the opaque draw didn't
            // skip any
            
        this.hadTransparentInDraw=false;

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
        let n;
        let nMesh=this.meshes.length;

        for (n=0;n!==nMesh;n++) {
            this.meshes[n].close();
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

        //
        // check for mesh list collisions
        //

    boxBoundCollision(xBound,yBound,zBound,onlyFlag)
    {
        let n;
        let nMesh=this.meshes.length;

        for (n=0;n!==nMesh;n++) {
            if (onlyFlag!==null) {
                if (this.meshes[n].flag!==onlyFlag) continue;
            }
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
        let n;
        let nMesh=this.meshes.length;

        for (n=0;n!==nMesh;n++) {
            this.meshes[n].buildCollisionGeometry();
        }
    }
    
        //
        // setup all the mesh buffers
        //

    setupBuffers()
    {
        let n;
        let nMesh=this.meshes.length;

        for (n=0;n!==nMesh;n++) {
            this.meshes[n].setupBuffers();
        }
    }

        //
        // draw meshes
        //

    drawOpaque(modelMatrix,jointMatrixArray)
    {
        let n,mesh;
        let currentBitmap;
        let nMesh=this.meshes.length;
        
        this.shader.drawStart();
        
            // set any model matrix
            
        if (modelMatrix===null) {
            this.frustumTranslationPoint.setFromValues(0,0,0);
        }
        else {
            this.view.gl.uniformMatrix4fv(this.shader.modelMatrixUniform,false,modelMatrix.data);
            this.frustumTranslationPoint.translationFromMatrix(modelMatrix);
        }
        
            // set any joint matrixes
            
        if (jointMatrixArray!==null) {
            for (n=0;n!==jointMatrixArray.length;n++) {
                this.view.gl.uniformMatrix4fv(this.shader.jointMatrixUniformArray[n],false,jointMatrixArray[n].data);
            }
        }

            // setup map drawing

        currentBitmap=null;
        this.hadTransparentInDraw=false;
        
            // draw the opaque meshes

        for (n=0;n!==nMesh;n++) {
            mesh=this.meshes[n];
            if (mesh.isTransparent()) {
                this.hadTransparentInDraw=true;
                continue;
            }

                // skip if not in view frustum

            if (!this.view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound,this.frustumTranslationPoint)) continue;

                // time to change bitmap

            if (mesh.bitmap!==currentBitmap) {
                currentBitmap=mesh.bitmap;
                mesh.bitmap.attachAsTexture(this.shader);
            }
            
                // draw the mesh

            mesh.updateBuffers();
            mesh.bindBuffers(this.shader);
            mesh.drawOpaque();
        }
        
        this.shader.drawEnd();
    }
    
    drawTransparent(modelMatrix,jointMatrixArray)
    {
        let n,mesh;
        let nMesh=this.meshes.length;
        let currentBitmap;
        let gl=this.view.gl;
        
            // if no transparency in the opaque draw,
            // skip this whole method
            
        if (!this.hadTransparentInDraw) return;
        
            // change the blend
            
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
        gl.depthMask(false);
        
        this.shader.drawStart();
        
            // set any model matrix
            
        if (modelMatrix===null) {
            this.frustumTranslationPoint.setFromValues(0,0,0);
        }
        else {
            this.view.gl.uniformMatrix4fv(this.shader.modelMatrixUniform,false,modelMatrix.data);
            this.frustumTranslationPoint.translationFromMatrix(modelMatrix);
        }
        
            // set any joint matrixes
            
        if (jointMatrixArray!==null) {
            for (n=0;n!==jointMatrixArray.length;n++) {
                this.view.gl.uniformMatrix4fv(this.shader.jointMatrixUniformArray[n],false,jointMatrixArray[n].data);
            }
        }

            // setup map drawing

        currentBitmap=null;

            // draw the transparent meshes

        for (n=0;n!==nMesh;n++) {
            mesh=this.meshes[n];
            if (!mesh.isTransparent()) continue;

                // skip if not in view frustum

            if (!this.view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound,this.frustumTranslationPoint)) continue;

                // time to change bitmap

            if (mesh.bitmap!==currentBitmap) {
                currentBitmap=mesh.bitmap;
                mesh.bitmap.attachAsTexture(this.shader);
            }

                // draw the mesh

            mesh.updateBuffers();
            mesh.bindBuffers(this.shader);
            mesh.drawTransparent();
        }
        
            // reset the blend
            
        this.shader.drawEnd();
        
        gl.disable(gl.BLEND);
        gl.depthMask(true);
    }
    
}
