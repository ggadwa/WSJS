"use strict";

//
// map class
//

class MapClass
{
    constructor()
    {
        var n;
        
        this.mapMeshShader=new MapMeshShaderClass();
        this.mapLiquidShader=new MapLiquidShaderClass();        // shared

        this.meshes=[];
        this.lights=[];
        this.lightmaps=[];
        this.rooms=[];
        this.liquids=[];
        
        this.TEXTURE_COUNT=12;
        
        this.TEXTURE_TYPE_WALL=0;
        this.TEXTURE_TYPE_FLOOR=1;
        this.TEXTURE_TYPE_WALL=2;
        this.TEXTURE_TYPE_FLOOR=3;
        this.TEXTURE_TYPE_CEILING=4;
        this.TEXTURE_TYPE_PLATFORM=5;
        this.TEXTURE_TYPE_PILLAR=6;
        this.TEXTURE_TYPE_METAL=7;
        this.TEXTURE_TYPE_DOOR=8;
        this.TEXTURE_TYPE_MACHINE=9;
        this.TEXTURE_TYPE_BOX=10;
        this.TEXTURE_TYPE_LIQUID=11;
        
        this.genBitmapWall=new GenBitmapWallClass();
        this.genBitmapFloor=new GenBitmapFloorClass();
        this.genBitmapCeiling=new GenBitmapCeilingClass();
        this.genBitmapDoor=new GenBitmapDoorClass();
        this.genBitmapMetal=new GenBitmapMetalClass();
        this.genBitmapMachine=new GenBitmapMachineClass();
        this.genBitmapBox=new GenBitmapBoxClass();
        this.genBitmapLiquid=new GenBitmapLiquidClass();
        
        this.textureBitmapList=[];
        for (n=0;n!=this.TEXTURE_COUNT;n++) this.textureBitmapList.push(null);      // textures are loaded dynamically as map is made
        
        this.lightmapBitmapList=[];
        
        this.movementList=new MovementListClass();
        this.overlay=new MapOverlayClass();

        this.cameraVector=new wsPoint(0,0,0);           // global not local so they won't get GCd
        this.lightVector=new wsPoint(0,0,0);
        this.lightXBound=new wsBound(0,0);
        this.lightYBound=new wsBound(0,0);
        this.lightZBound=new wsBound(0,0);
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        if (!this.overlay.initialize()) return(false);
        if (!this.mapMeshShader.initialize()) return(false);
        return(this.mapLiquidShader.initialize());
    }

    release()
    {
        this.mapLiquidShader.release();
        this.mapMeshShader.release();
        this.overlay.release();
    }
    
        //
        // textures
        //
    
    releaseTextures()
    {
        var n;
        
        for (n=0;n!==this.TEXTURE_COUNT;n++) {
            if (this.textureBitmapList[n]!==null) {
                this.textureBitmapList[n].close();
                this.textureBitmapList[n]=null;
            }
        }
        
        for (n=0;n!=lightmapBitmapList.length;n++) {
            this.lightmapBitmapList[n].close();
        }
        
        this.lightmapBitmapList=[];
    }
    
    getTexture(textureType)
    {
        if (this.textureBitmapList[textureType]===null) {
            
            switch (textureType) {
                case this.TEXTURE_TYPE_WALL:
                case this.TEXTURE_TYPE_PILLAR:
                    this.textureBitmapList[textureType]=this.genBitmapWall.generateRandom(false);
                    break;
                    
                case this.TEXTURE_TYPE_FLOOR:
                case this.TEXTURE_TYPE_PLATFORM:
                    this.textureBitmapList[textureType]=this.genBitmapFloor.generateRandom(false);
                    break;
                    
                case this.TEXTURE_TYPE_CEILING:
                    this.textureBitmapList[textureType]=this.genBitmapCeiling.generateRandom(false);
                    break;
                    
                case this.TEXTURE_TYPE_METAL:
                    this.textureBitmapList[textureType]=this.genBitmapMetal.generateRandom(false);
                    break;
                    
                case this.TEXTURE_TYPE_DOOR:
                    this.textureBitmapList[textureType]=this.genBitmapDoor.generateRandom(false);
                    break;
                    
                case this.TEXTURE_TYPE_MACHINE:
                    this.textureBitmapList[textureType]=this.genBitmapMachine.generateRandom(false);
                    break;
                    
                case this.TEXTURE_TYPE_BOX:
                    this.textureBitmapList[textureType]=this.genBitmapBox.generateRandom(false);
                    break;
                    
                case this.TEXTURE_TYPE_LIQUID:
                    this.textureBitmapList[textureType]=this.genBitmapLiquid.generateRandom(false);
                    break;
            }
        }
        
        return(this.textureBitmapList[textureType]);
    }
    
    addLightmapBitmap(bitmap)
    {
        this.lightmapBitmapList.push(bitmap);
    }
    
    getLightmapBitmap(idx)
    {
        return(this.lightmapBitmapList[idx]);
    }
    
        //
        // clear map
        //

    clear()
    {
        var n;
        var nMesh=this.meshes.length;
        var nLiquid=this.liquids.length;
        var nLightmap=this.lightmaps.length;

        for (n=0;n!==nMesh;n++) {
            this.meshes[n].close();
        }
        
        for (n=0;n!==nLiquid;n++) {
            this.liquids[n].close();
        }

        for (n=0;n!==nLightmap;n++) {
            this.lightmaps[n].close();
        }

        this.meshes=[];
        this.lights=[];
        this.lightmaps=[];
        this.rooms=[];
        this.liquids=[];
    }

        //
        // add items to map
        //

    addMesh(mesh)
    {
        this.meshes.push(mesh);
        return(this.meshes.length-1);
    }
    
    getMesh(idx)
    {
        return(this.meshes[idx]);
    }

    addLight(light)
    {
        this.lights.push(light);
    }

    addLightmap(lightmap)
    {
        this.lightmaps.push(lightmap);
    }
    
    addLiquid(liquid)
    {
        this.liquids.push(liquid);
        return(this.liquids.length-1);
    }
    
        //
        // tracking rooms
        //
        
    addRoom(xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,decorationType,liquid,level)
    {
        this.rooms.push(new MapRoomClass(xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,decorationType,liquid,level));
        return(this.rooms.length-1);
    }

        //
        // check for map mesh collisions
        //

    boxBoundCollision(xBound,yBound,zBound,onlyFlag)
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
    }

    boxMeshCollision(checkMesh,onlyFlag)
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
    }

        //
        // flag counts
        //

    countMeshByFlag(onlyFlag)
    {
        var n;
        var nMesh=this.meshes.length;

        if (onlyFlag===null) return(nMesh);

        var count=0;

        for (n=0;n!==nMesh;n++) {
            if (this.meshes[n].flag===onlyFlag) count++;
        }

        return(count);
    }

        //
        // check if point is in light
        //

    pointInLight(pt)
    {
        var n;
        var nLight=this.lights.length;

        for (n=0;n!==nLight;n++) {
            if (this.lights[n].position.distance(pt)<this.lights[n].intensity) return(true);
        }

        return(false);
    }

    pointInSingleLight(light,pt)
    {
        return(light.position.distance(pt)<light.intensity);
    }

        //
        // build list of meshes that intersect with
        // light and a list of lights that intersect with
        // meshes
        //

    buildLightMeshIntersectLists()
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
    }

        //
        // find all the map lights in this view
        // that we need to pass to glsl.  Ignore
        // lights that are behind the player and
        // outside the light cone
        //

    createViewLightsFromMapLights()
    {
        var n,k,nLight,idx,startIdx;
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
            
            light.usedInList=false;         // to make sure we don't add lights twice
        }
        
            // the camera normal
            
        this.cameraVector.setFromValues(0.0,0.0,1.0);
        this.cameraVector.rotateX(null,view.camera.angle.x);
        this.cameraVector.rotateY(null,view.camera.angle.y);
        
            // find the view.LIGHT_COUNT closest lights
            // and put them into the view list

        for (k=0;k!==view.LIGHT_COUNT;k++) {
            view.lights[k]=null;
        }

        view.lights=[];
        
            // first, we put in all lights where
            // we are within the light cone, this are
            // must do lights
            
        for (n=0;n!==nLight;n++) {
            light=this.lights[n];
            if (light.dist>light.intensity) continue;
            
            idx=-1;

            for (k=0;k!==view.lights.length;k++) {
                if (view.lights[k].dist>light.dist) {
                    idx=k;
                    break;
                }
            }
            
                // add the light
                
            if (idx===-1) {
                if (view.lights.length<view.LIGHT_COUNT) view.lights.push(light);
            }
            else {
                view.lights.splice(idx,0,light);
                if (view.lights.length>view.LIGHT_COUNT) view.lights.pop();
            }
            
            light.usedInList=true;
        }
        
            // if we have spots left, then closests lights
            // that aren't behind the player
            
        startIdx=view.lights.length;    
            
        for (n=0;n!==nLight;n++) {
            light=this.lights[n];
            if (light.usedInList) continue;
            
            this.lightVector.setFromSubPoint(view.camera.position,light.position);   
            this.lightVector.normalize();
            if (this.lightVector.dot(this.cameraVector)>0.0) continue;
            
            idx=-1;

            for (k=startIdx;k<view.lights.length;k++) {
                if (view.lights[k].dist>light.dist) {
                    idx=k;
                    break;
                }
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
    }
    
        //
        // run through the meshes and
        // have them build their collision meshes
        //
        
    buildCollisionGeometry()
    {
        var n;
        var nMesh=this.meshes.length;

            // setup all the gl
            // buffers and indexes

        for (n=0;n!==nMesh;n++) {
            this.meshes[n].buildCollisionGeometry();
        }
    }

        //
        // find positions in map
        //
        
    findRandomEntityPosition()
    {
        var roomIdx;
        var pos;
        var findTry=0;
        
        while (findTry<25) {

                // find a random room

            roomIdx=genRandom.randomIndex(this.rooms.length);
        
                // find a random spot
                
            pos=this.rooms[roomIdx].findRandomEntityPosition();
            if (pos!==null) return(pos);
            
            findTry++;
        }

        return(null);
    }
    
    findRandomPlayerPosition()
    {
        return(this.rooms[0].findRandomEntityPosition());
    }
    
        //
        // map movements
        //
    
    addMovement(movement)
    {
        this.movementList.addMovement(movement);
    }
    
    runMovements()
    {
        this.movementList.run(this);
    }
    
        //
        // pass-through for overlays
        //
        
    precalcOverlayDrawValues()
    {
        this.overlay.precalcDrawValues();
    }
        
    overlayDraw()
    {
        this.overlay.draw();
    }
    
    addOverlayRoom(room)
    {
        this.overlay.addRoom(room);
    }
    
    addOverlayCloset(xBound,zBound)
    {
        this.overlay.addCloset(xBound,zBound);
    }
    
    addOverlayConnection(xBound,zBound)
    {
        this.overlay.addConnection(xBound,zBound);
    };
    
    addOverlayPlatform(xBound,zBound)
    {
        this.overlay.addPlatform(xBound,zBound);
    }

        //
        // setup all the mesh buffers
        //

    setupBuffers()
    {
        var n;
        var nMesh=this.meshes.length;
        var nLiquid=this.liquids.length;

            // setup all the mesh and
            // liquid gl buffers

        for (n=0;n!==nMesh;n++) {
            this.meshes[n].setupBuffers();
        }
        
        for (n=0;n!==nLiquid;n++) {
            this.liquids[n].setupBuffers();
        }
    }

        //
        // draw map meshes
        //

    drawMeshStart()
    {
        this.mapMeshShader.drawStart();
    }

    drawMeshEnd()
    {
        this.mapMeshShader.drawEnd();
    }

    drawMesh()
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
                mesh.bitmap.attachAsTexture(this.mapMeshShader);
            }

            if (mesh.lightmap!==currentLightmap) {
                currentLightmap=mesh.lightmap;
                mesh.lightmap.attachAsLightmap();
            }

                // draw the mesh

            mesh.updateBuffers();
            mesh.buildNonCulledTriangleIndexes();
            mesh.bindBuffers(this.mapMeshShader);
            mesh.draw();
        }
        
            // debugging draw
        
        if (config.DEBUG_DRAW_MAP_MESH_LINES) {
            for (n=0;n!==nMesh;n++) {
                mesh=this.meshes[n];
                if (view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) debug.drawMapMeshLines(mesh);
            }
        }
        
        if (config.DEBUG_DRAW_MAP_MESH_TANGENTS) {
            for (n=0;n!==nMesh;n++) {
                mesh=this.meshes[n];
                if (view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) debug.drawMapMeshTangents(mesh);
            }
        }
        
        if (config.DEBUG_DRAW_MAP_MESH_NORMALS) {
            for (n=0;n!==nMesh;n++) {
                mesh=this.meshes[n];
                if (view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) debug.drawMapMeshNormals(mesh);
            }
        }
        
    }
    
        //
        // draw map liquids
        //

    drawLiquidStart()
    {
        var gl=view.gl;
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

        this.mapLiquidShader.drawStart();
    }

    drawLiquidEnd()
    {
        var gl=view.gl;
        
        this.mapLiquidShader.drawEnd();
        
        gl.disable(gl.BLEND);
    }

    drawLiquid()
    {
        var n,liquid;
        var nLiquid=this.liquids.length;
        var currentBitmap;

            // setup liquid drawing

        currentBitmap=null;

            // draw the liquids

        for (n=0;n!==nLiquid;n++) {
            liquid=this.liquids[n];

                // skip if not in view frustum

            if (!view.boundBoxInFrustum(liquid.xBound,liquid.yBound,liquid.zBound)) continue;

                // time to change bitmap
                // or lightmap?

            if (liquid.bitmap!==currentBitmap) {
                currentBitmap=liquid.bitmap;
                liquid.bitmap.attachAsLiquid();
            }

                // draw the liquid

            liquid.updateBuffers();
            liquid.bindBuffers(this.mapLiquidShader);
            liquid.draw();
        }
    }
    
}

//
// the global map object
//

var map=new MapClass();
