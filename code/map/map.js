"use strict";

//
// map class
//

function MapObject()
{
        // map items
        
    this.mapShader=new MapShader();
    
    this.meshes=[];
    this.lights=[];
    this.lightmaps=[];
    this.rooms=[];
    
    this.overlay=new MapOverlayObject();
    
    this.cameraVector=new wsPoint(0,0,0);           // global not local so they won't get GCd
    this.lightVector=new wsPoint(0,0,0);
    this.lightXBound=new wsBound(0,0);
    this.lightYBound=new wsBound(0,0);
    this.lightZBound=new wsBound(0,0);
    
        //
        // initialize and release
        //

    this.initialize=function(view)
    {
        if (!this.overlay.initialize(view)) return(false);
        return(this.mapShader.initialize(view));
    };

    this.release=function(view)
    {
        this.mapShader.release(view);
        this.overlay.release(view);
    };
    
        //
        // clear map
        //

    this.clear=function(view)
    {
        var n;
        var nMesh=this.meshes.length;
        var nLightmap=this.lightmaps.length;

        for (n=0;n!==nMesh;n++) {
            this.meshes[n].close(view);
        }

        for (n=0;n!==nLightmap;n++) {
            this.lightmaps[n].close(view);
        }

        this.meshes=[];
        this.lights=[];
        this.lightmaps=[];
    };

        //
        // add items to map
        //

    this.addMesh=function(mesh)
    {
        this.meshes.push(mesh);
        return(this.meshes.length-1);
    };

    this.addLight=function(light)
    {
        this.lights.push(light);
    };

    this.addLightmap=function(lightmap)
    {
        this.lightmaps.push(lightmap);
    };
    
        //
        // tracking rooms
        //
        
    this.addRoom=function(xBlockSize,zBlockSize,xBound,yBound,zBound,hasStories,level)
    {
        this.rooms.push(new MapRoomObject(xBlockSize,zBlockSize,xBound,yBound,zBound,hasStories,level));
        return(this.rooms.length-1);
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
        var n,k,i,nIntersect,light,mesh;
        var meshIndexes,lightIndexes;
        var nLight=this.lights.length;
        var nMesh=this.meshes.length;

            // build the meshes intersecting lights
            // list

        for (n=0;n!==nLight;n++) {
            light=this.lights[n];
            
            light.getXBound(this.lightXBound);
            light.getYBound(this.lightYBound);
            light.getZBound(this.lightZBound);

            meshIndexes=[];

                // check the 8 corners of the cube

            for (k=0;k!==nMesh;k++) {
                mesh=this.meshes[k];
                
                if (this.lightXBound.max<mesh.xBound.min) continue;
                if (this.lightXBound.min>mesh.xBound.max) continue;
                if (this.lightYBound.max<mesh.yBound.min) continue;
                if (this.lightYBound.min>mesh.yBound.max) continue;
                if (this.lightZBound.max<mesh.zBound.min) continue;
                if (this.lightZBound.min>mesh.zBound.max) continue;
                
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
        // find all the map lights in this view
        // that we need to pass to glsl.  Ignore
        // lights that are behind the player and
        // outside the light cone
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
            light.dist=Math.sqrt((x*x)+(y*y)+(z*z));
        }
        
            // the camera normal
            
        this.cameraVector.set(0.0,0.0,1.0);
        this.cameraVector.rotateX(null,view.camera.angle.x);
        this.cameraVector.rotateY(null,view.camera.angle.y);
        
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
            
                // are we out of the light cone
                // and behind the light?
                
            this.lightVector.setFromSubPoint(view.camera.position,light.position);   
            this.lightVector.normalize();
            if (this.lightVector.dot(this.cameraVector)>0.0) {
                if (light.dist>light.intensity) continue;
            }
            
                // add the light
                
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
    
        //
        // run through the meshes and
        // have them build their collision meshes
        //
        
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
        
    this.findRandomEntityPosition=function(genRandom)
    {
        var roomIdx;
        var pos;
        var findTry=0;
        
        while (findTry<25) {

                // find a random room

            roomIdx=genRandom.randomIndex(this.rooms.length);
        
                // find a random spot
                
            pos=this.rooms[roomIdx].findRandomEntityPosition(genRandom);
            if (pos!==null) return(pos);
            
            findTry++;
        }

        return(null);
    };
    
        //
        // pass-through for overlays
        //
        
    this.precalcOverlayDrawValues=function(view)
    {
        this.overlay.precalcDrawValues(view);
    };
        
    this.overlayDraw=function(view,entityList)
    {
        this.overlay.draw(view,entityList);
    };
    
    this.addOverlayRoom=function(room)
    {
        this.overlay.addRoom(room);
    };
    
    this.addOverlayCloset=function(xBound,zBound)
    {
        this.overlay.addCloset(xBound,zBound);
    };
    
    this.addOverlayStair=function(xBound,zBound)
    {
        this.overlay.addStair(xBound,zBound);
    };
    
    this.addOverlayPlatform=function(xBound,zBound)
    {
        this.overlay.addPlatform(xBound,zBound);
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
                mesh.bitmap.attachAsTexture(this.mapShader);
            }

            if (mesh.lightmap!==currentLightmap) {
                currentLightmap=mesh.lightmap;
                mesh.lightmap.attachAsLightmap();
            }

                // draw the mesh

            mesh.buildNonCulledTriangleIndexes(view);
            mesh.bindBuffers(view,this.mapShader);
            mesh.draw(view);
        }
        
            // debugging draw
        
        if (DEBUG_DRAW_MAP_MESH_LINES) {
            for (n=0;n!==nMesh;n++) {
                mesh=this.meshes[n];
                if (view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) debug.drawMapMeshLines(view,mesh);
            }
        }
        
        if (DEBUG_DRAW_MAP_MESH_TANGENTS) {
            for (n=0;n!==nMesh;n++) {
                mesh=this.meshes[n];
                if (view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) debug.drawMapMeshTangents(view,mesh);
            }
        }
        
        if (DEBUG_DRAW_MAP_MESH_NORMALS) {
            for (n=0;n!==nMesh;n++) {
                mesh=this.meshes[n];
                if (view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) debug.drawMapMeshNormals(view,mesh);
            }
        }
        
    };
    
}

