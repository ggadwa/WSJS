import * as constants from '../../code/main/constants.js';
import BoundClass from '../../code/utility/bound.js';
import MapMeshShaderClass from '../../code/map/map_mesh_shader.js';
import MapLiquidShaderClass from '../../code/map/map_liquid_shader.js';
import GenBitmapWallClass from '../../generate/bitmap/gen_bitmap_wall.js';
import GenBitmapFloorClass from '../../generate/bitmap/gen_bitmap_floor.js';
import GenBitmapCeilingClass from '../../generate/bitmap/gen_bitmap_ceiling.js';
import GenBitmapDoorClass from '../../generate/bitmap/gen_bitmap_door.js';
import GenBitmapMetalClass from '../../generate/bitmap/gen_bitmap_metal.js';
import GenBitmapMachineClass from '../../generate/bitmap/gen_bitmap_machine.js';
import GenBitmapPanelClass from '../../generate/bitmap/gen_bitmap_panel.js';
import GenBitmapBoxClass from '../../generate/bitmap/gen_bitmap_box.js';
import GenBitmapLiquidClass from '../../generate/bitmap/gen_bitmap_liquid.js';
import MapRoomClass from '../../code/map/map_room.js';
import MovementListClass from '../../code/map/movement_list.js';
import MapOverlayClass from '../../code/map/map_overlay.js';
import config from '../../code/main/config.js';
import genRandom from '../../generate/utility/random.js';

//
// map class
//

export default class MapClass
{
    constructor(view,fileCache)
    {
        this.view=view;
        this.fileCache=this.fileCache;
        
        this.mapMeshShader=new MapMeshShaderClass(view,fileCache);
        this.mapLiquidShader=new MapLiquidShaderClass(view,fileCache);        // shared

        this.meshes=[];
        this.lights=[];
        this.rooms=[];
        this.liquids=[];

        this.genBitmapWall=new GenBitmapWallClass(view);
        this.genBitmapFloor=new GenBitmapFloorClass(view);
        this.genBitmapCeiling=new GenBitmapCeilingClass(view);
        this.genBitmapDoor=new GenBitmapDoorClass(view);
        this.genBitmapMetal=new GenBitmapMetalClass(view);
        this.genBitmapMachine=new GenBitmapMachineClass(view);
        this.genBitmapPanel=new GenBitmapPanelClass(view);
        this.genBitmapBox=new GenBitmapBoxClass(view);
        this.genBitmapLiquid=new GenBitmapLiquidClass(view);

        this.textureBitmaps=new Map();

        this.movementList=new MovementListClass();
        this.overlay=new MapOverlayClass(view,fileCache);

        this.lightXBound=new BoundClass(0,0);           // global not local so they won't get GCd
        this.lightYBound=new BoundClass(0,0);
        this.lightZBound=new BoundClass(0,0);

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
        for (let bitmap of this.textureBitmaps.values()) {
            bitmap.close();
        }
        
        this.textureBitmaps.clear();
    }
    
    getTexture(textureType)
    {
        let bitmap=this.textureBitmaps.get(textureType);
        if (bitmap!==undefined) return(bitmap);
            
        switch (textureType) {
            case constants.MAP_TEXTURE_TYPE_WALL:
            case constants.MAP_TEXTURE_TYPE_PILLAR:
                bitmap=this.genBitmapWall.generateRandom(false);
                break;

            case constants.MAP_TEXTURE_TYPE_FLOOR:
            case constants.MAP_TEXTURE_TYPE_PLATFORM:
                bitmap=this.genBitmapFloor.generateRandom(false);
                break;

            case constants.MAP_TEXTURE_TYPE_CEILING:
                bitmap=this.genBitmapCeiling.generateRandom(false);
                break;

            case constants.MAP_TEXTURE_TYPE_METAL:
                bitmap=this.genBitmapMetal.generateRandom(false);
                break;

            case constants.MAP_TEXTURE_TYPE_DOOR:
            case constants.MAP_TEXTURE_TYPE_FRAME:
                bitmap=this.genBitmapDoor.generateRandom(false);
                break;

            case constants.MAP_TEXTURE_TYPE_COMPUTER:
                bitmap=this.genBitmapMachine.generateRandom(false);
                break;

            case constants.MAP_TEXTURE_TYPE_PANEL:
                bitmap=this.genBitmapPanel.generateRandom(false);
                break;

            case constants.MAP_TEXTURE_TYPE_BOX:
                bitmap=this.genBitmapBox.generateRandom(false);
                break;

            case constants.MAP_TEXTURE_TYPE_LIQUID:
                bitmap=this.genBitmapLiquid.generateRandom(false);
                break;
        }
        
        this.textureBitmaps.set(textureType,bitmap);
        
        return(bitmap);
    }
    
        //
        // clear map
        //

    clear()
    {
        let n;
        let nMesh=this.meshes.length;
        let nLiquid=this.liquids.length;

        for (n=0;n!==nMesh;n++) {
            this.meshes[n].close();
        }
        
        for (n=0;n!==nLiquid;n++) {
            this.liquids[n].close();
        }

        this.meshes=[];
        this.lights=[];
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
    
    addLiquid(liquid)
    {
        this.liquids.push(liquid);
        return(this.liquids.length-1);
    }
    
        //
        // tracking rooms
        //
        
    addRoom(pathType,xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,extensionDirection,mainPath,mainPathSide,mainPathConnectedRoom,level,liquid)
    {
        this.rooms.push(new MapRoomClass(this.view,this,pathType,xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,extensionDirection,mainPath,mainPathSide,mainPathConnectedRoom,level,liquid));
        return(this.rooms.length-1);
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
        // check if point is in light
        //

    pointInLight(pt)
    {
        let n;
        let nLight=this.lights.length;

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
        // find all the map lights in this view
        // and add them to the view light list
        //

    addViewLightsFromMapLights()
    {
        let n,k,nLight,idx;
        let x,y,z;
        let light;

            // get the distance from the camera
            // to all the lights

        nLight=this.lights.length;

        for (n=0;n!==nLight;n++) {
            light=this.lights[n];

            x=this.view.camera.position.x-light.position.x;
            y=this.view.camera.position.y-light.position.y;
            z=this.view.camera.position.z-light.position.z;
            light.dist=Math.sqrt((x*x)+(y*y)+(z*z));
        }
        
            // find the view.MAX_LIGHT_COUNT closest lights
            // and put them into the view list

        for (n=0;n!==nLight;n++) {
            light=this.lights[n];
            
                // calculate if this lights bounds
                // are within the frustrum and eliminate if they arent
                
            if (!light.isInsideFrustrum(this.view)) continue;

                // find the light place
                
            idx=-1;

            for (k=0;k!==this.view.lights.length;k++) {
                if (this.view.lights[k].dist>light.dist) {
                    idx=k;
                    break;
                }
            }
            
                // add the light
                
            if (idx===-1) {
                if (this.view.lights.length<this.view.MAX_LIGHT_COUNT) this.view.lights.push(light);
            }
            else {
                this.view.lights.splice(idx,0,light);
                if (this.view.lights.length>this.view.MAX_LIGHT_COUNT) this.view.lights.pop();
            }
        }
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
        // find positions in map
        //
    
    findRoomForPathType(pathType)
    {
        let n;
        let nRoom=this.rooms.length;
        
        for (n=0;n!==nRoom;n++) {
            if (this.rooms[n].pathType===pathType) return(n);
        }
        
        return(-1);
    }
    
    findRandomMonsterPosition()
    {
        let roomIdx;
        let pos;
        let findTry=0;
        
        while (findTry<25) {

                // find a random room,            
                // only put in normal rooms, unless we are in
                // simple map mode where there's only one room
                
            if (config.SIMPLE_TEST_MAP) {
                roomIdx=0;
            }
            else {
                roomIdx=genRandom.randomIndex(this.rooms.length);
                
                if (this.rooms[roomIdx].pathType!==constants.ROOM_PATH_TYPE_NORMAL) {
                    findTry++;
                    continue;
                }
            }
            
                // find a random spot in room
                
            pos=this.rooms[roomIdx].findAndBlockSpawnPosition(false);
            if (pos!==null) return(pos);
            
            findTry++;
        }

        return(null);
    }
    
    findRandomPlayerPosition()
    {
        let roomIdx=this.findRoomForPathType(constants.ROOM_PATH_TYPE_START);
        return(this.rooms[roomIdx].findAndBlockSpawnPosition(true));
    }
    
    findRandomBossPosition()
    {
        let roomIdx=this.findRoomForPathType(constants.ROOM_PATH_TYPE_GOAL);
        return(this.rooms[roomIdx].findAndBlockSpawnPosition(true));
    }
    
        //
        // map movements
        //
    
    addMovement(movement)
    {
        this.movementList.addMovement(movement);
    }
    
    runMovements(entityList)
    {
        this.movementList.run(this.view,this,entityList);
    }
    
        //
        // pass-through for overlays
        //
        
    precalcOverlayDrawValues()
    {
        this.overlay.precalcDrawValues();
    }
        
    overlayDraw(entityList)
    {
        this.overlay.draw(entityList);
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
    
    addOverlayDecorationWall(x,z,x2,z2)
    {
        this.overlay.addDecorationWall(x,z,x2,z2);
    }
    
    addOverlayPlatform(xBound,zBound)
    {
        this.overlay.addPlatform(xBound,zBound);
    }
    
    addOverlayLift(xBound,zBound)
    {
        this.overlay.addLift(xBound,zBound);
    }
    
    addOverlayStair(xBound,zBound)
    {
        this.overlay.addStair(xBound,zBound);
    }
    
    addOverlayDoor(xBound,zBound)
    {
        this.overlay.addDoor(xBound,zBound);
    }

        //
        // setup all the mesh buffers
        //

    setupBuffers()
    {
        let n;
        let nMesh=this.meshes.length;
        let nLiquid=this.liquids.length;

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
        let n,mesh;
        let nMesh=this.meshes.length;
        let currentBitmap;

            // setup map drawing

        currentBitmap=null;

            // draw the meshes

        for (n=0;n!==nMesh;n++) {
            mesh=this.meshes[n];

                // skip if not in view frustum

            if (!this.view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) continue;

                // time to change bitmap

            if (mesh.bitmap!==currentBitmap) {
                currentBitmap=mesh.bitmap;
                mesh.bitmap.attachAsTexture(this.mapMeshShader);
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
                if (this.view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) debug.drawMapMeshLines(mesh);
            }
        }
        
        if (config.DEBUG_DRAW_MAP_MESH_TANGENTS) {
            for (n=0;n!==nMesh;n++) {
                mesh=this.meshes[n];
                if (this.view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) debug.drawMapMeshTangents(mesh);
            }
        }
        
        if (config.DEBUG_DRAW_MAP_MESH_NORMALS) {
            for (n=0;n!==nMesh;n++) {
                mesh=this.meshes[n];
                if (this.view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) debug.drawMapMeshNormals(mesh);
            }
        }
        
    }
    
        //
        // draw map liquids
        //

    drawLiquidStart()
    {
        let gl=this.view.gl;
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

        this.mapLiquidShader.drawStart();
    }

    drawLiquidEnd()
    {
        let gl=this.view.gl;
        
        this.mapLiquidShader.drawEnd();
        
        gl.disable(gl.BLEND);
    }

    drawLiquid()
    {
        let n,liquid;
        let nLiquid=this.liquids.length;
        let currentBitmap;

            // setup liquid drawing

        currentBitmap=null;

            // draw the liquids

        for (n=0;n!==nLiquid;n++) {
            liquid=this.liquids[n];

                // skip if not in view frustum

            if (!this.view.boundBoxInFrustum(liquid.xBound,liquid.yBound,liquid.zBound)) continue;

                // time to change bitmap

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
