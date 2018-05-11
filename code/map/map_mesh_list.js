import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import genRandom from '../../generate/utility/random.js';

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
        // utility to remove any triangles in meshes
        // that share the same plane and bounds.  used to
        // optimize created maps
        //

    removeSharedTrianglesChunk(meshFlag,compareMeshFlag,equalY,removeBoth)
    {
        let n,k,t1,t2,nMesh,hit;
        let mesh,otherMesh;
        let trigList,trigCache,otherTrigCache;
        let targetMeshCount,targetMeshList;
        let nTrig,aTrig,bTrig;
        
            // this function calculates if a triangle
            // is wall like, and it's bounds, and caches it
            
        nMesh=this.meshes.length;
            
        for (n=0;n!==nMesh;n++) {
            this.meshes[n].buildSharedTriangleCache();
        }

            // create a list of triangles
            // to delete

        trigList=[];

            // run through all the meshes
            // and remove any triangles occupying
            // the same space

            // since trigs can be rotated, we
            // compare the bounds, equal bounds
            // means overlapping

            // skip any trigs that aren't straight walls
            // so slanted walls don't get erased (only
            // straight walls are connected)
            
        targetMeshCount=0;
        targetMeshList=new Uint16Array(nMesh);

        for (n=0;n!==nMesh;n++) {
            mesh=this.meshes[n];
            if (mesh.flag!==meshFlag) continue;
            
                // build a list of meshes that
                // are targets for trig eliminations from
                // this mesh
                
                // if we are comparing two distinct types
                // then we need to iterate over the whole
                // list, otherwise just the back half as we've
                // already hit that type in the outer loop
                
                // also, two different types means we are
                // eliminating from inside, so do the touch differently
            
            targetMeshCount=0;
            
            if (meshFlag===compareMeshFlag) {
                for (k=(n+1);k<nMesh;k++) {
                    otherMesh=this.meshes[k];
                    if (otherMesh.flag!==compareMeshFlag) continue;

                    if (mesh.boxTouchOtherMeshOutside(otherMesh)) targetMeshList[targetMeshCount++]=k;
                }
            }
            else {
                for (k=0;k!==nMesh;k++) {
                    otherMesh=this.meshes[k];
                    if (otherMesh.flag!==compareMeshFlag) continue;

                    if (mesh.boxTouchOtherMeshInside(otherMesh)) targetMeshList[targetMeshCount++]=k;
                }
            }
            
            if (targetMeshCount===0) continue;
                
                // now run through the triangles

            for (t1=0;t1!==mesh.trigCount;t1++) {
                
                trigCache=mesh.getSharedTriangleCacheItem(t1);
                if (!trigCache.isWall) continue;

                hit=false;

                for (k=0;k!==targetMeshCount;k++) {
                    otherMesh=this.meshes[targetMeshList[k]];

                    for (t2=0;t2!==otherMesh.trigCount;t2++) {
                        
                        otherTrigCache=otherMesh.getSharedTriangleCacheItem(t2);
                        if (!otherTrigCache.isWall) continue;
                        
                        if ((trigCache.xBound.min!==otherTrigCache.xBound.min) || (trigCache.xBound.max!==otherTrigCache.xBound.max)) continue;
                        if ((trigCache.zBound.min!==otherTrigCache.zBound.min) || (trigCache.zBound.max!==otherTrigCache.zBound.max)) continue;

                        if (equalY) {
                            if ((trigCache.yBound.min!==otherTrigCache.yBound.min) || (trigCache.yBound.max!==otherTrigCache.yBound.max)) continue;
                        }
                        else {
                            if ((trigCache.yBound.min<otherTrigCache.yBound.min) || (trigCache.yBound.max>otherTrigCache.yBound.max)) continue;
                        }
                        
                        trigList.push([n,t1]);
                        if (removeBoth) trigList.push([targetMeshList[k],t2]);
                        hit=true;
                        break;
                    }

                    if (hit) break;
                }
            }
        }
        
            // clear the caches
            
        for (n=0;n!==nMesh;n++) {
            this.meshes[n].clearSharedTriangleCache();
        }
        
            // finally delete the triangles

        nTrig=trigList.length;
        if (nTrig===0) return;

        for (n=0;n!==nTrig;n++) {

                // remove the trig

            aTrig=trigList[n];
            this.meshes[aTrig[0]].removeTriangle(aTrig[1]);

                // shift other indexes

            for (k=n;k<nTrig;k++) {
                bTrig=trigList[k];
                if (aTrig[0]===bTrig[0]) {
                    if (aTrig[1]<bTrig[1]) bTrig[1]--;
                }
            }
        }
    }
    
        //
        // special utility routine to randomize vertexes
        // in a map
        //
        
    randomizeVertexes(meshFlag,xMove,zMove)
    {
        let n,k,n2,k2,x,z,nMesh;
        let nVertex,nVertex2,vertexList,vertexList2;
        let pos=new PointClass(0,0,0);
        
            // this function calculates if a triangle
            // is wall like, and it's bounds, and caches it
            
        nMesh=this.meshes.length;
            
        for (n=0;n!==nMesh;n++) {
            if (this.meshes[n].flag!==meshFlag) continue;
            
            vertexList=this.meshes[n].vertexList;
            nVertex=vertexList.length;
            
            for (k=0;k!==nVertex;k++) {
 
                    // get a movement and a position to move
                    // from
                
                pos.setFromPoint(vertexList[k].position);
                x=genRandom.randomInt(0,xMove);
                z=genRandom.randomInt(0,zMove);
                
                    // now move every vertex like this
                    
                for (n2=0;n2!==nMesh;n2++) {
                    vertexList2=this.meshes[n2].vertexList;
                    nVertex2=vertexList2.length;
            
                    for (k2=0;k2!==nVertex2;k2++) {
                        if (vertexList2[k2].position.equals(pos)) {
                            vertexList2[k2].position.addValues(x,0,z);
                        }
                    }
                }
                    
            }
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
            mesh.bindBuffers();
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
            mesh.bindBuffers();
            mesh.drawTransparent();
        }
        
            // reset the blend
            
        this.view.shaderList.mapMeshShader.drawEnd();
        
        gl.disable(gl.BLEND);
        gl.depthMask(true);
    }
    
}
