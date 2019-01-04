import * as constants from '../../code/main/constants.js';
import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';

//
// map mesh list class
//

export default class MapMeshListClass
{
    constructor(view)
    {
        this.view=view;

        this.meshes=[];
        
            // this is an optimization that we use to skip
            // transparency drawing if the opaque draw didn't
            // skip any
            
        this.hadTransparentInDraw=false;

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
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
        // check for map mesh collisions
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
        // flag counts
        //

    countMeshByFlag(onlyFlag)
    {
        let n,count;
        let nMesh=this.meshes.length;

        if (onlyFlag===null) return(nMesh);

        count=0;

        for (n=0;n!==nMesh;n++) {
            if (this.meshes[n].flag===onlyFlag) count++;
        }

        return(count);
    }
    
        //
        // run through the meshes and
        // have them build their collision meshes
        //
        
    buildCollisionGeometry()
    {
        let n;
        let nMesh=this.meshes.length;

            // setup all the gl
            // buffers and indexes

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
        // draw map meshes
        //

    drawOpaque()
    {
        let n,mesh;
        let currentBitmap;
        let nMesh=this.meshes.length;
        
        this.view.shaderList.mapMeshShader.drawStart();

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

            if (!this.view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) continue;

                // time to change bitmap

            if (mesh.bitmap!==currentBitmap) {
                currentBitmap=mesh.bitmap;
                mesh.bitmap.attachAsTexture(this.view.shaderList.mapMeshShader);
            }
            
                // draw the mesh

            mesh.updateBuffers();
            mesh.buildNonCulledTriangleIndexes();
            mesh.bindBuffers(this.view.shaderList.mapMeshShader);
            mesh.drawOpaque();
        }
        
        this.view.shaderList.mapMeshShader.drawEnd();
    }
    
    drawTransparent()
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
        
        this.view.shaderList.mapMeshShader.drawStart();

            // setup map drawing

        currentBitmap=null;

            // draw the transparent meshes

        for (n=0;n!==nMesh;n++) {
            mesh=this.meshes[n];
            if (!mesh.isTransparent()) continue;

                // skip if not in view frustum

            if (!this.view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) continue;

                // time to change bitmap

            if (mesh.bitmap!==currentBitmap) {
                currentBitmap=mesh.bitmap;
                mesh.bitmap.attachAsTexture(this.view.shaderList.mapMeshShader);
            }

                // draw the mesh

            mesh.updateBuffers();
            mesh.buildNonCulledTriangleIndexes();
            mesh.bindBuffers(this.view.shaderList.mapMeshShader);
            mesh.drawTransparent();
        }
        
            // reset the blend
            
        this.view.shaderList.mapMeshShader.drawEnd();
        
        gl.disable(gl.BLEND);
        gl.depthMask(true);
    }
    
}
