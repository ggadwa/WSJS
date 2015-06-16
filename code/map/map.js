"use strict";

//
// map class
//

function MapObject()
{
        // constants
    
    this.MESH_FLAG_NONE=0;
    this.MESH_FLAG_ROOM_WALL=1;
    this.MESH_FLAG_ROOM_FLOOR=2;
    this.MESH_FLAG_ROOM_CEILING=3;
    this.MESH_FLAG_STAIR=4;
    this.MESH_FLAG_LIGHT=5;
    this.MESH_FLAG_DECORATION=6;
 
        // variables
        
    this.mapShader=new MapShaderObject();
    
    this.meshes=[];
    this.lights=[];
    this.bitmaps=[];
    this.lightmaps=[];
    
        //
        // initialize and release
        //

    this.initialize=function(view)
    {
        return(this.mapShader.initialize(view));
    };

    this.release=function(view)
    {
        this.mapShader.release(view);
    };
    
        //
        // clear map
        //

    this.clear=function(view)
    {
        var n;
        var nMesh=this.meshes.length;
        var nBitmap=this.bitmaps.length;
        var nLightmap=this.lightmaps.length;

        for (n=0;n!==nMesh;n++) {
            this.meshes[n].close(view);
        }

        for (n=0;n!==nBitmap;n++) {
            this.bitmaps[n].close(view);
        }

        for (n=0;n!==nLightmap;n++) {
            this.lightmaps[n].close(view);
        }

        this.meshes=[];
        this.lights=[];
        this.bitmaps=[];
        this.lightmaps=[];
    };

        //
        // add items to map
        //

    this.addMesh=function(mesh)
    {
        this.meshes.push(mesh);
    };

    this.addLight=function(light)
    {
        this.lights.push(light);
    };

    this.addBitmap=function(bitmap)
    {
        this.bitmaps.push(bitmap);
    };

    this.addLightmap=function(lightmap)
    {
        this.lightmaps.push(lightmap);
    };

        //
        // bitmap/lightmap lookup
        //

    this.getBitmapById=function(bitmapId)
    {
        var n;
        var nBitmap=this.bitmaps.length;

        for (n=0;n!==nBitmap;n++) {
            if (this.bitmaps[n].bitmapId===bitmapId) return(this.bitmaps[n]);
        }

        return(null);
    };

    this.getLightmapById=function(lightmapId)
    {
        var n;
        var nLightmap=this.lightmaps.length;

        for (n=0;n!==nLightmap;n++) {
            if (this.lightmaps[n].lightmapId===lightmapId) return(this.lightmaps[n]);
        }

        return(null);
    };

        //
        // check for map mesh collisions
        //

    this.boxBoundCollision=function(xBound,yBound,zBound,onlyFlag)
    {
        var n;
        var nMesh=this.meshes.length;

        for (n=0;n!==nMesh;n++) {
            if (onlyFlag!==null) {
                if (this.meshes[n].flag!==onlyFlag) continue;
            }
            if (this.meshes[n].boxBoundCollision(xBound,yBound,zBound)) return(n);
        }

        return(-1);
    };

    this.boxMeshCollision=function(checkMesh,onlyFlag)
    {
        var n;
        var nMesh=this.meshes.length;

        for (n=0;n!==nMesh;n++) {
            if (onlyFlag!==null) {
                if (this.meshes[n].flag!==onlyFlag) continue;
            }
            if (this.meshes[n].boxMeshCollision(checkMesh)) return(n);
        }

        return(-1);
    };

        //
        // flag counts
        //

    this.countMeshByFlag=function(onlyFlag)
    {
        var n;
        var nMesh=this.meshes.length;

        if (onlyFlag===null) return(nMesh);

        var count=0;

        for (n=0;n!==nMesh;n++) {
            if (this.meshes[n].flag===onlyFlag) count++;
        }

        return(count);
    };

        //
        // check if point is in light
        //

    this.pointInLight=function(pt)
    {
        var n;
        var nLight=this.lights.length;

        for (n=0;n!==nLight;n++) {
            if (this.lights[n].position.distance(pt)<this.lights[n].intensity) return(true);
        }

        return(false);
    };

    this.pointInSingleLight=function(light,pt)
    {
        return(light.position.distance(pt)<light.intensity);
    };

        //
        // build list of meshes that intersect with
        // light and a list of lights that intersect with
        // meshes
        //

    this.buildLightMeshIntersectLists=function()
    {
        var n,k,i,nIntersect,light,mesh,pt;
        var meshIndexes,lightIndexes;
        var lightXBound,lightYBound,lightZBound;
        var nLight=this.lights.length;
        var nMesh=this.meshes.length;

            // build the meshes intersecting lights
            // list

        for (n=0;n!==nLight;n++) {
            light=this.lights[n];
            
            lightXBound=light.getXBound();
            lightYBound=light.getYBound();
            lightZBound=light.getZBound();

            meshIndexes=[];

                // check the 8 corners of the cube

            for (k=0;k!==nMesh;k++) {
                mesh=this.meshes[k];
                
                if (lightXBound.max<mesh.xBound.min) continue;
                if (lightXBound.min>mesh.xBound.max) continue;
                if (lightYBound.max<mesh.yBound.min) continue;
                if (lightYBound.min>mesh.yBound.max) continue;
                if (lightZBound.max<mesh.zBound.min) continue;
                if (lightZBound.min>mesh.zBound.max) continue;
                
                meshIndexes.push(k);
            }

                // add to the list

            light.meshIntersectList=new Uint16Array(meshIndexes);
        }

            // now reverse the list for lights
            // intersecting meshes list

        for (n=0;n!==nMesh;n++) {
            mesh=this.meshes[n];

            lightIndexes=[];

            for (k=0;k!==nLight;k++) {
                light=this.lights[k];

                nIntersect=light.meshIntersectList.length;
                for (i=0;i!==nIntersect;i++) {
                    if (light.meshIntersectList[i]===n) {
                        lightIndexes.push(k);
                        break;
                    }
                }
            }

            mesh.lightIntersectList=new Uint16Array(lightIndexes);
        }
    };

        //
        // map light utilities
        //

    this.createViewLightsFromMapLights=function(view)
    {
        var n,k,nLight,idx;
        var x,y,z;
        var light;

            // get the distance from the camera
            // to all the lights

        nLight=this.lights.length;

        for (n=0;n!==nLight;n++) {
            light=this.lights[n];

            light.origIndex=n;

            x=view.camera.position.x-light.position.x;
            y=view.camera.position.y-light.position.y;
            z=view.camera.position.z-light.position.z;
            light.dist=Math.sqrt((x*x)+(y*y)+(z*z));        // sqrt not required here, but overflow could be a problem
        }

            // find the four closest lights
            // and put them into the view list

        for (k=0;k!==view.LIGHT_COUNT;k++) {
            view.lights[k]=null;
        }

        view.lights=[];

        for (n=0;n!==nLight;n++) {
            light=this.lights[n];

            idx=-1;

            for (k=0;k!==view.lights.length;k++) {
                if (view.lights[k].dist>light.dist) {
                    idx=k;
                    break;
                }
            }
            
                // build the eye coordinate version
                
            if (idx===-1) {
                if (view.lights.length<view.LIGHT_COUNT) view.lights.push(light);
            }
            else {
                view.lights.splice(idx,0,light);
                if (view.lights.length>view.LIGHT_COUNT) view.lights.pop();
            }
        }

            // fill in any missing lights

        while (view.lights.length<view.LIGHT_COUNT) {
            view.lights.push(null);
        }
    };
    
        // run through the meshes and
        // have them build their collision meshes
        
    this.buildCollisionGeometry=function()
    {
        var n;
        var nMesh=this.meshes.length;

            // setup all the gl
            // buffers and indexes

        for (n=0;n!==nMesh;n++) {
            this.meshes[n].buildCollisionGeometry(view);
        }
    };

        //
        // find positions in map
        //
        
    this.findPlayerStartPosition=function()
    {
            // always start in middle of
            // first generated room
            
        var mesh=this.meshes[0];
        return(new wsPoint(mesh.xBound.getMidPoint(),mesh.yBound.max,mesh.zBound.getMidPoint()));
    };

    this.findRandomPosition=function(genRandom)
    {
        var findTry=0;
        var meshIdx,mesh;

            // try to only look at wall meshes

        while (findTry<25) {
            meshIdx=genRandom.randomInt(0,this.meshes.length);
            mesh=this.meshes[meshIdx];
            if (mesh.flag===this.MESH_FLAG_ROOM_FLOOR) break;
            findTry++;
        }

            // build a random location

        var pos=new wsPoint(0,0,0);
        pos.x=genRandom.randomInBetween(mesh.xBound.min,mesh.xBound.max);
        pos.y=mesh.yBound.max;
        pos.z=genRandom.randomInBetween(mesh.zBound.min,mesh.zBound.max);

        return(pos);
    };

        //
        // setup all the mesh buffers
        //

    this.setupBuffers=function(view)
    {
        var n;
        var nMesh=this.meshes.length;

            // setup all the gl
            // buffers and indexes

        for (n=0;n!==nMesh;n++) {
            this.meshes[n].setupBuffers(view);
        }
    };

        //
        // draw map
        //

    this.drawStart=function(view)
    {
        this.mapShader.drawStart(view);
    };

    this.drawEnd=function(view)
    {
        this.mapShader.drawEnd(view);
    };

    this.draw=function(view)
    {
        var n,mesh;
        var meshCount=0;
        var nMesh=this.meshes.length;
        var currentBitmap,currentLightmap;

            // setup map drawing

        currentBitmap=null;
        currentLightmap=null;

            // draw the meshes

        for (n=0;n!==nMesh;n++) {
            mesh=this.meshes[n];

                // skip if not in view frustum

            if (!view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) continue;

                // time to change bitmap
                // or lightmap?

            if (mesh.bitmap!==currentBitmap) {
                currentBitmap=mesh.bitmap;
                mesh.bitmap.attach(view,this.mapShader);
            }

            if (mesh.lightmap!==currentLightmap) {
                currentLightmap=mesh.lightmap;
                mesh.lightmap.attach(view,this.mapShader);
            }

                // draw the mesh

            mesh.bindBuffers(view,this.mapShader);
            mesh.draw(view);

            meshCount++;
        }
        
            // normal debugging draw
/*            
        for (n=0;n!==nMesh;n++) {
            mesh=this.meshes[n];
            if (view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) debug.drawMapMeshNormals(view,mesh);
        }
*/
        return(meshCount);
    };

}

