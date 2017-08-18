import * as constants from '../../code/main/constants.js';
import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import ColorClass from '../../code/utility/color.js';
import LightClass from '../../code/light/light.js';
import MapLiquidClass from '../../code/map/map_liquid.js';
import GenRoomHallwayClass from '../../generate/map/gen_map_hallway.js';
import GenRoomClosetClass from '../../generate/map/gen_map_closet.js';
import GenRoomWindowClass from '../../generate/map/gen_map_window.js';
import GenRoomLedgeClass from '../../generate/map/gen_map_ledge.js';
import GenRoomPlatformClass from '../../generate/map/gen_map_platform.js';
import GenRoomStairsClass from '../../generate/map/gen_map_stair.js';
import GenRoomDecorationPillarClass from '../../generate/map/gen_map_decoration_pillar.js';
import GenRoomDecorationStorageClass from '../../generate/map/gen_map_decoration_storage.js';
import GenRoomDecorationComputerClass from '../../generate/map/gen_map_decoration_computer.js';
import GenRoomDecorationPipeClass from '../../generate/map/gen_map_decoration_pipe.js';
import GenRoomDecorationCubicalClass from '../../generate/map/gen_map_decoration_cubical.js';
import GenRoomDecorationLabClass from '../../generate/map/gen_map_decoration_lab.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';
import genRandom from '../../generate/utility/random.js';

//
// generate map class
//

export default class GenMapClass
{
    constructor(view,map,callbackFunc)
    {
        this.view=view;
        this.map=map;

            // the callback function when
            // generation concludes

        this.callbackFunc=callbackFunc;
        
            // the base Y for the path part
            // of the map
            
        this.yBase=Math.trunc(this.view.OPENGL_FAR_Z/2);
        
        this.currentRoomCount=0;
        
            // constants
            
        this.HALLWAY_NONE=0;
        this.HALLWAY_SHORT=1;
        this.HALLWAY_LONG=2;
        
            // generation constants

        this.ROOM_MIN_BLOCK_PER_SIDE=5;                 // minimum number of blocks that can make up one side of a room
        this.ROOM_MAX_BLOCK_PER_SIDE=10;                // maximum number of blocks that can make up one side of a room
        this.ROOM_MAX_BLOCK_COUNT=100;                  // maximum number of blocks in total for a room (x * z block count)
            
        this.ROOM_MAX_CONNECT_TRY=20;                   // number of times we try to find a place to connect rooms
        
        this.ROOM_LONG_HALLWAY_PERCENTAGE=0.3;          // what percentage of the time the general room path will have a long hallway
        this.ROOM_LIQUID_PERCENTAGE=0.3;                // what % of time a lower room can have a liquid
        
        this.ROOM_LIGHT_FACTOR=0.5;                     // lights are initially set to room radius, this factor is multipled in
        this.ROOM_LIGHT_FACTOR_EXTRA=0.3;               // random addition to light factor above
        this.ROOM_LIGHT_PER_STORY_BOOST=0.1;            // add in for each extra story

        this.ROOM_LIGHT_EXPONENT_MINIMUM=1.0;           // minimum light exponent (0.0 is completely hard light with no fall off)
        this.ROOM_LIGHT_EXPONENT_EXTRA=0.5;             // exponent add

        this.ROOM_LIGHT_RGB_MINIMUM=0.7;                // minimum r, g, or b value for map lights
        this.ROOM_LIGHT_RGB_MINIMUM_EXTRA=0.3;          // random r, g, b add for map lights

        this.MAP_LIGHT_ALWAYS_WHITE=false;              // make sure map lights are always white
        
        this.HALLWAY_LIGHT_INTENSITY=constants.ROOM_FLOOR_HEIGHT*1.6;                 // intensity of hallway lights
        this.DOOR_LIGHT_INTENSITY=constants.ROOM_FLOOR_HEIGHT*1.3;                    // intensity of lights over doors
        this.WINDOW_LIGHT_INTENSITY=constants.ROOM_FLOOR_HEIGHT*3.6;                  // intensity of window light
        this.WINDOW_MAIN_LIGHT_INTENSITY_CUT=constants.ROOM_FLOOR_HEIGHT*0.15;         // how much to cut main room light for each window

        Object.seal(this);
    }
    
        //
        // remove shared triangles
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
            
        nMesh=this.map.meshes.length;
            
        for (n=0;n!==nMesh;n++) {
            this.map.meshes[n].buildSharedTriangleCache();
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
            mesh=this.map.meshes[n];
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
                    otherMesh=this.map.meshes[k];
                    if (otherMesh.flag!==compareMeshFlag) continue;

                    if (mesh.boxTouchOtherMeshOutside(otherMesh)) targetMeshList[targetMeshCount++]=k;
                }
            }
            else {
                for (k=0;k!==nMesh;k++) {
                    otherMesh=this.map.meshes[k];
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
                    otherMesh=this.map.meshes[targetMeshList[k]];

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
            this.map.meshes[n].clearSharedTriangleCache();
        }
        
            // finally delete the triangles

        nTrig=trigList.length;
        if (nTrig===0) return;

        for (n=0;n!==nTrig;n++) {

                // remove the trig

            aTrig=trigList[n];
            this.map.meshes[aTrig[0]].removeTriangle(aTrig[1]);

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
        // create rooms
        //

    addRegularRoom(level,pathType,xBlockSize,zBlockSize,xBound,zBound,mainPath,mainPathSide,mainPathConnectedRoom,extensionDirection)
    {
        let n,mesh,mesh2;
        let yAdd,yBound,yWallBound,yFloorBound;
        let roomIdx,room;
        let storyCount,liquid;
        let roomBitmap=this.map.getTexture(constants.MAP_TEXTURE_TYPE_WALL);
        
            // figure out room Y size from extension mode
            // all rooms need at least 2 stories
            
        switch (level) {
            case constants.ROOM_LEVEL_LOWER:
                storyCount=genRandom.randomInt(2,4);
                yAdd=(genRandom.randomInBetween(1,(storyCount-1)));
                yBound=new BoundClass(0,this.yBase+((constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH)*yAdd));
                break;
            case constants.ROOM_LEVEL_HIGHER:
                storyCount=genRandom.randomInt(2,4);
                yBound=new BoundClass(0,this.yBase-(constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH));
                break;
            default:
                storyCount=genRandom.randomInt(2,3);
                yBound=new BoundClass(0,this.yBase);
                break;
        }
        
            // if a goal room, and we have a boss, always
            // make room taller
            
        if (pathType===constants.ROOM_PATH_TYPE_GOAL) {
            if (storyCount<4) storyCount=4;
        }
        
            // determine if this room has a liquid,
            // and lower it for pool and add a story
        
        liquid=(config.ROOM_LIQUIDS)&&(level===constants.ROOM_LEVEL_LOWER)&&(genRandom.randomPercentage(this.ROOM_LIQUID_PERCENTAGE))&&(!config.SIMPLE_TEST_MAP);
        
            // top of room
            
        yBound.min=yBound.max-((constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH)*storyCount);
            
            // add this room to the tracking room list so
            // we can use it later to add entities and decorations and such

        roomIdx=this.map.addRoom(pathType,xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,extensionDirection,mainPath,mainPathSide,mainPathConnectedRoom,level,liquid);
        room=this.map.rooms[roomIdx];
        
            // the floor
            
        room.createMeshFloor(this.map.getTexture(constants.MAP_TEXTURE_TYPE_FLOOR));

            // walls
            // each wall is a tall piece and a short piece on top
            // the short piece is for headers on doors and places for platforms
            
        yWallBound=new BoundClass((yBound.max-constants.ROOM_FLOOR_HEIGHT),yBound.max);
        yFloorBound=new BoundClass((yWallBound.min-constants.ROOM_FLOOR_DEPTH),yWallBound.min);
            
        for (n=0;n!==storyCount;n++) {
            mesh=room.createMeshWalls(roomBitmap,yWallBound);
            mesh2=room.createMeshWalls(roomBitmap,yFloorBound);
            mesh.combineMesh(mesh2);
            
            this.map.addMesh(mesh);
            if (n===0) this.map.addOverlayRoom(room);
            
            yWallBound.add(-(constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH));
            yFloorBound.add(-(constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH));
        }
        
            // the ceiling
        
        room.createMeshCeiling(this.map.getTexture(constants.MAP_TEXTURE_TYPE_CEILING));
        
        return(roomIdx);
    }
   
        //
        // hallways and liquid steps
        //
        
    addHallwayRoom(connectSide,hallwayMode,xHallwayBound,zHallwayBound)
    {
            // build the door
            
        let genRoomHallway=new GenRoomHallwayClass(this.map);
        let yHallwayBound=new BoundClass(this.yBase,(this.yBase-constants.ROOM_FLOOR_HEIGHT));        // don't count the upper header

        if ((connectSide===constants.ROOM_SIDE_LEFT) || (connectSide===constants.ROOM_SIDE_RIGHT)) {
            genRoomHallway.createHallwayX(xHallwayBound,yHallwayBound,zHallwayBound,(hallwayMode===this.HALLWAY_LONG));
        }
        else {
            genRoomHallway.createHallwayZ(xHallwayBound,yHallwayBound,zHallwayBound,(hallwayMode===this.HALLWAY_LONG));
        }
        
            // add to overlay
            
        this.map.addOverlayConnection(xHallwayBound,zHallwayBound);
    }
        
        //
        // lights
        //

    addGeneralLight(lightPos,fixturePos,rotAngle,intensity)
    {
        let light,red,green,blue,exponent;
        let xFixtureBound,yFixtureBound,zFixtureBound;

            // light fixture

        if (fixturePos!==null) {
            xFixtureBound=new BoundClass((fixturePos.x-400),(fixturePos.x+400));
            yFixtureBound=new BoundClass(fixturePos.y,(fixturePos.y+1000));
            zFixtureBound=new BoundClass((fixturePos.z-400),(fixturePos.z+400));
            this.map.addMesh(MeshPrimitivesClass.createMeshPryamid(this.map.getTexture(constants.MAP_TEXTURE_TYPE_METAL),xFixtureBound,yFixtureBound,zFixtureBound,rotAngle,constants.MESH_FLAG_LIGHT));
        }
        
            // the color

        red=this.ROOM_LIGHT_RGB_MINIMUM+(genRandom.random()*this.ROOM_LIGHT_RGB_MINIMUM_EXTRA);
        if (this.MAP_LIGHT_ALWAYS_WHITE) {
            green=blue=red;
        }
        else {
            green=this.ROOM_LIGHT_RGB_MINIMUM+(genRandom.random()*this.ROOM_LIGHT_RGB_MINIMUM_EXTRA);
            blue=this.ROOM_LIGHT_RGB_MINIMUM+(genRandom.random()*this.ROOM_LIGHT_RGB_MINIMUM_EXTRA);
        }
        
            // the exponent
            
        exponent=this.ROOM_LIGHT_EXPONENT_MINIMUM+(genRandom.random()*this.ROOM_LIGHT_EXPONENT_EXTRA);

            // add light to map

        light=new LightClass(lightPos,new ColorClass(red,green,blue),intensity,exponent);
        this.map.addLight(light);

        return(light);
    }
    
    addRoomLight(roomIdx)
    {
        let lightY,fixturePos,lightPos,intensity;
        let room=this.map.rooms[roomIdx];
        
            // locations
            
        lightY=room.yBound.max-((constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH)*room.storyCount);
        
        fixturePos=new PointClass(room.xBound.getMidPoint(),lightY,room.zBound.getMidPoint());
        lightPos=new PointClass(fixturePos.x,(fixturePos.y+1100),fixturePos.z);
        
            // intensity
        
        intensity=Math.max(room.xBound.getSize(),room.yBound.getSize(),room.zBound.getSize());
        if (room.storyCount>=2) intensity+=(intensity*((room.storyCount-1)*this.ROOM_LIGHT_PER_STORY_BOOST));
        if (!config.SIMPLE_TEST_MAP) intensity=Math.trunc((intensity*this.ROOM_LIGHT_FACTOR)+(intensity*(genRandom.random()*this.ROOM_LIGHT_FACTOR_EXTRA)));
        
            // create the light
            // remember this because later windows can reduce light
            
        room.mainLight=this.addGeneralLight(lightPos,fixturePos,null,intensity);
    }
    
    addHallwayLight(connectSide,hallwayMode,hallwaySize,xBound,zBound)
    {
        let xAdd,zAdd,xAdd2,zAdd2,y,fixturePos,lightPos;
        let rot1,rot2;
        
            // middle of hallway
            
        if (hallwayMode===this.HALLWAY_LONG) {
            fixturePos=new PointClass(xBound.getMidPoint(),(this.yBase-constants.ROOM_FLOOR_HEIGHT),zBound.getMidPoint());
            lightPos=new PointClass(fixturePos.x,(fixturePos.y+1100),fixturePos.z);
            this.addGeneralLight(lightPos,fixturePos,null,this.HALLWAY_LIGHT_INTENSITY);
        }
        
            // ends
        
        y=this.yBase-(constants.ROOM_FLOOR_HEIGHT+(constants.ROOM_FLOOR_DEPTH*4));
        
        if ((connectSide===constants.ROOM_SIDE_LEFT) || (connectSide===constants.ROOM_SIDE_RIGHT)) {
            xAdd=Math.trunc(hallwaySize*0.5)+constants.ROOM_FLOOR_DEPTH;
            xAdd2=1000;
            zAdd=zAdd2=0;
            rot1=new PointClass(90,90,0);
            rot2=new PointClass(0,90,90);
        }
        else {
            xAdd=xAdd2=0;
            zAdd=Math.trunc(hallwaySize*0.5)+constants.ROOM_FLOOR_DEPTH;
            zAdd2=1000;
            rot1=new PointClass(90,0,0);
            rot2=new PointClass(90,180,0);
        }
        
        fixturePos=new PointClass((xBound.getMidPoint()+xAdd),y,(zBound.getMidPoint()+zAdd));
        lightPos=new PointClass((fixturePos.x+xAdd2),fixturePos.y,(fixturePos.z+zAdd2));
        this.addGeneralLight(lightPos,fixturePos,rot1,this.DOOR_LIGHT_INTENSITY);
        
        fixturePos=new PointClass((xBound.getMidPoint()-xAdd),y,(zBound.getMidPoint()-zAdd));
        lightPos=new PointClass((fixturePos.x-xAdd2),fixturePos.y,(fixturePos.z-zAdd2));
        this.addGeneralLight(lightPos,fixturePos,rot2,this.DOOR_LIGHT_INTENSITY);
    }
  
        //
        // finds a single random block offset between two bounds
        //
        
    findRandomBlockOffsetBetweenTwoBounds(bound1,bound2)
    {
        let count,offset;
        let min=bound1.min;
        let max=bound1.max;
        
        if (bound2.min>min) min=bound2.min;
        if (bound2.max<max) max=bound2.max;
        
        count=Math.trunc((max-min)/constants.ROOM_BLOCK_WIDTH);
        offset=genRandom.randomIndex(count)*constants.ROOM_BLOCK_WIDTH;
        if (bound1.min<bound2.min) offset+=(bound2.min-bound1.min);           // need to align offset with bounds1
        
        return(offset);
    }

        //
        // build a path of rooms
        //

    buildMapRoomPath(lastRoom,hallwayMode)
    {
        let roomIdx,room,tryCount;
        let xBlockSize,zBlockSize;
        let connectSide,connectOffset,pathType,extensionDirection;
        let xBound,zBound;
        let doorOffset,doorAdd,xHallwayBound,zHallwayBound;
        let mapMid,halfSize;
        
            // get random block size for room
            // and make sure it stays under the max
            // blocks for room
        
        if (config.SIMPLE_TEST_MAP) {
            xBlockSize=10;
            zBlockSize=10;
        }
        else {
            xBlockSize=genRandom.randomInt(this.ROOM_MIN_BLOCK_PER_SIDE,this.ROOM_MAX_BLOCK_PER_SIDE);
            zBlockSize=genRandom.randomInt(this.ROOM_MIN_BLOCK_PER_SIDE,this.ROOM_MAX_BLOCK_PER_SIDE);

            while ((xBlockSize*zBlockSize)>this.ROOM_MAX_BLOCK_COUNT) {
                if (xBlockSize>this.ROOM_MIN_BLOCK_PER_SIDE) xBlockSize--;
                if (zBlockSize>this.ROOM_MIN_BLOCK_PER_SIDE) zBlockSize--;
            }
        }
        
            // get room location
            // if we don't have a previous room,
            // then it's the first room and it's
            // centered in the map

        if (lastRoom===null) {
            mapMid=Math.trunc(this.view.OPENGL_FAR_Z/2);

            halfSize=Math.trunc((xBlockSize/2)*constants.ROOM_BLOCK_WIDTH);
            xBound=new BoundClass((mapMid-halfSize),(mapMid+halfSize));

            halfSize=Math.trunc((zBlockSize/2)*constants.ROOM_BLOCK_WIDTH);
            zBound=new BoundClass((mapMid-halfSize),(mapMid+halfSize));
            
            pathType=constants.ROOM_PATH_TYPE_START;
            extensionDirection=constants.ROOM_EXTENSION_DIRECTION_LEFT_RIGHT;
        }

            // otherwise we connect to the previous room

        else {

            tryCount=0;
            
            while (true) {
                
                    // most of the time we always path up, but 1/3rd
                    // of the time we can jog left or right, and this changes
                    // where the extension rooms go
                
                if (genRandom.randomPercentage(0.33)) {
                    connectSide=(genRandom.randomPercentage(0.5))?constants.ROOM_SIDE_LEFT:constants.ROOM_SIDE_RIGHT;
                    extensionDirection=constants.ROOM_EXTENSION_DIRECTION_TOP_BOTTOM;
                }
                else {
                    connectSide=constants.ROOM_SIDE_TOP;
                    extensionDirection=constants.ROOM_EXTENSION_DIRECTION_LEFT_RIGHT;
                }
                
                if ((connectSide===constants.ROOM_SIDE_LEFT) || (connectSide===constants.ROOM_SIDE_RIGHT)) {
                    connectOffset=genRandom.randomInt(-Math.trunc(zBlockSize*0.5),lastRoom.zBlockSize);
                }
                else {
                    connectOffset=genRandom.randomInt(-Math.trunc(xBlockSize*0.5),lastRoom.xBlockSize);
                }
                
                connectOffset*=constants.ROOM_BLOCK_WIDTH;
                
                    // get new room bounds and move it around
                    // if we need space for hallways
                
                doorAdd=(hallwayMode===this.HALLWAY_LONG)?(constants.ROOM_BLOCK_WIDTH*4):constants.ROOM_BLOCK_WIDTH;
                
                switch (connectSide) {

                    case constants.ROOM_SIDE_LEFT:
                        xBound=new BoundClass((lastRoom.xBound.min-(xBlockSize*constants.ROOM_BLOCK_WIDTH)),lastRoom.xBound.min);
                        zBound=new BoundClass((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            xBound.add(-doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                            xHallwayBound=new BoundClass((lastRoom.xBound.min-doorAdd),lastRoom.xBound.min);
                            zHallwayBound=new BoundClass((lastRoom.zBound.min+doorOffset),((lastRoom.zBound.min+doorOffset)+constants.ROOM_BLOCK_WIDTH));
                        }
                        
                        break;

                    case constants.ROOM_SIDE_TOP:
                        xBound=new BoundClass((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        zBound=new BoundClass((lastRoom.zBound.min-(zBlockSize*constants.ROOM_BLOCK_WIDTH)),lastRoom.zBound.min);
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            zBound.add(-doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                            xHallwayBound=new BoundClass((lastRoom.xBound.min+doorOffset),((lastRoom.xBound.min+doorOffset)+constants.ROOM_BLOCK_WIDTH));
                            zHallwayBound=new BoundClass((lastRoom.zBound.min-doorAdd),lastRoom.zBound.min);
                        }
                        
                        break;

                    case constants.ROOM_SIDE_RIGHT:
                        xBound=new BoundClass(lastRoom.xBound.max,(lastRoom.xBound.max+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        zBound=new BoundClass((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            xBound.add(doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                            xHallwayBound=new BoundClass(lastRoom.xBound.max,(lastRoom.xBound.max+doorAdd));
                            zHallwayBound=new BoundClass((lastRoom.zBound.min+doorOffset),((lastRoom.zBound.min+doorOffset)+constants.ROOM_BLOCK_WIDTH));
                        }
                        
                        break;

                    case constants.ROOM_SIDE_BOTTOM:
                        xBound=new BoundClass((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        zBound=new BoundClass(lastRoom.zBound.max,(lastRoom.zBound.max+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            zBound.add(doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                            xHallwayBound=new BoundClass((lastRoom.xBound.min+doorOffset),((lastRoom.xBound.min+doorOffset)+constants.ROOM_BLOCK_WIDTH));
                            zHallwayBound=new BoundClass(lastRoom.zBound.max,(lastRoom.zBound.max+doorAdd));
                        }
                        
                        break;

                }
                
                if (this.map.boxBoundCollision(xBound,null,zBound,constants.MESH_FLAG_ROOM_WALL)===-1) break;

                tryCount++;
                if (tryCount>this.ROOM_MAX_CONNECT_TRY) return;
            }
                
                // path type for rooms on path is normal unless
                // this is the final room

            pathType=((this.map.rooms.length+1)>=config.ROOM_PATH_COUNT)?constants.ROOM_PATH_TYPE_GOAL:constants.ROOM_PATH_TYPE_NORMAL;
        }

            // add in hallways and a light
            // if the hallway is long
            
        if (hallwayMode!==this.HALLWAY_NONE) {
            this.addHallwayRoom(connectSide,hallwayMode,xHallwayBound,zHallwayBound);
            this.addHallwayLight(connectSide,hallwayMode,doorAdd,xHallwayBound,zHallwayBound);
        }

            // the room
            
        roomIdx=this.addRegularRoom(constants.ROOM_LEVEL_NORMAL,pathType,xBlockSize,zBlockSize,xBound,zBound,true,-1,null,extensionDirection);
        this.currentRoomCount++;
        
        room=this.map.rooms[roomIdx];
        
            // mark off any doors we made
            
        if (hallwayMode!==this.HALLWAY_NONE) {
            lastRoom.markDoorOnConnectionSide(connectSide,false);
            room.markDoorOnConnectionSide(connectSide,true);
        }
        
            // mask off edges that have collided with
            // the newest room or hallway to room
            // we use this mask to calculate ledges and other
            // outside wall hugging map pieces
        
        if (lastRoom!==null) {
            switch (hallwayMode) {
                case this.HALLWAY_SHORT:
                case this.HALLWAY_LONG:
                    lastRoom.maskEdgeGridBlockToBounds(xHallwayBound,zHallwayBound);
                    room.maskEdgeGridBlockToBounds(xHallwayBound,zHallwayBound);
                    break;
                default:
                    lastRoom.maskEdgeGridBlockToRoom(room);
                    room.maskEdgeGridBlockToRoom(lastRoom);
                    break;
            }
        }
        
            // add the room light

        this.addRoomLight(roomIdx);
        
            // at end of path?
            
        if ((this.map.rooms.length>=config.ROOM_PATH_COUNT) || (config.SIMPLE_TEST_MAP)) return;

            // next room in path
            
        hallwayMode=(genRandom.randomPercentage(this.ROOM_LONG_HALLWAY_PERCENTAGE))?this.HALLWAY_LONG:this.HALLWAY_SHORT;
            
        this.buildMapRoomPath(room,hallwayMode);
    }
    
        //
        // extend any of the rooms along the path
        //
    
    buildRoomExtensionSingle(level,lastRoom,connectSide)
    {
        let roomIdx,room,tryCount;
        let xBlockSize,zBlockSize;
        let connectOffset;
        let xBound,zBound;
        
        //level=constants.ROOM_LEVEL_LOWER;         // supergumba -- testing
        
            // get random block size for room
            // and make sure it stays under the max
            // blocks for room
        
        xBlockSize=genRandom.randomInt(this.ROOM_MIN_BLOCK_PER_SIDE,this.ROOM_MAX_BLOCK_PER_SIDE);
        zBlockSize=genRandom.randomInt(this.ROOM_MIN_BLOCK_PER_SIDE,this.ROOM_MAX_BLOCK_PER_SIDE);
        
        while ((xBlockSize*zBlockSize)>this.ROOM_MAX_BLOCK_COUNT) {
            if (xBlockSize>this.ROOM_MIN_BLOCK_PER_SIDE) xBlockSize--;
            if (zBlockSize>this.ROOM_MIN_BLOCK_PER_SIDE) zBlockSize--;
        }

            // connect to the previous
            // room by picking a side, and an offset into
            // that side

        tryCount=0;

        while (true) {

                // get random side and offset
                // we can start a new room half off the other
                // side and up the last room's side size


            if ((connectSide===constants.ROOM_SIDE_LEFT) || (connectSide===constants.ROOM_SIDE_RIGHT)) {
                connectOffset=genRandom.randomInt(-Math.trunc(zBlockSize*0.5),lastRoom.zBlockSize);
            }
            else {
                connectOffset=genRandom.randomInt(-Math.trunc(xBlockSize*0.5),lastRoom.xBlockSize);
            }
            connectOffset*=constants.ROOM_BLOCK_WIDTH;

                // get new room bounds

            switch (connectSide) {

                case constants.ROOM_SIDE_LEFT:
                    xBound=new BoundClass((lastRoom.xBound.min-(xBlockSize*constants.ROOM_BLOCK_WIDTH)),lastRoom.xBound.min);
                    zBound=new BoundClass((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    break;

                case constants.ROOM_SIDE_TOP:
                    xBound=new BoundClass((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    zBound=new BoundClass((lastRoom.zBound.min-(zBlockSize*constants.ROOM_BLOCK_WIDTH)),lastRoom.zBound.min);
                    break;

                case constants.ROOM_SIDE_RIGHT:
                    xBound=new BoundClass(lastRoom.xBound.max,(lastRoom.xBound.max+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    zBound=new BoundClass((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    break;

                case constants.ROOM_SIDE_BOTTOM:
                    xBound=new BoundClass((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    zBound=new BoundClass(lastRoom.zBound.max,(lastRoom.zBound.max+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    break;

            }

            if (this.map.boxBoundCollision(xBound,null,zBound,constants.MESH_FLAG_ROOM_WALL)===-1) break;

            tryCount++;
            if (tryCount>this.ROOM_MAX_CONNECT_TRY) return;
        }
        
            // the room
            
        roomIdx=this.addRegularRoom(level,constants.ROOM_PATH_TYPE_NORMAL,xBlockSize,zBlockSize,xBound,zBound,false,connectSide,lastRoom,lastRoom.extensionDirection);
        this.currentRoomCount++;
        
        room=this.map.rooms[roomIdx];
        
            // mark where windows can be
        
        room.markExtensionLegalWindowSide(connectSide,lastRoom);
        
            // finally add the liquid
        
        if (room.liquid) this.map.addLiquid(new MapLiquidClass(this.map.getTexture(constants.MAP_TEXTURE_TYPE_LIQUID),room));
        
            // mask off edges that have collided with
            // the newest room or stairs leading to a room
            // we use this mask to calculate ledges and other
            // outside wall hugging map pieces
        
        if (lastRoom!==null) {
            lastRoom.maskEdgeGridBlockToRoom(room);
            room.maskEdgeGridBlockToRoom(lastRoom);
        }
        
            // add the room light

        this.addRoomLight(roomIdx);
    }

    buildRoomExtensions()
    {
        let n,room;
        let nRoom=this.map.rooms.length;
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.rooms[n];
            
                // only do extensions on normal rooms
                
            if (room.pathType!==constants.ROOM_PATH_TYPE_NORMAL) continue;
            
                // extensions on side of path direction
            
            if (room.extensionDirection===constants.ROOM_EXTENSION_DIRECTION_LEFT_RIGHT) {
                if (genRandom.randomPercentage(0.5)) this.buildRoomExtensionSingle(genRandom.randomIndex(constants.ROOM_LEVEL_COUNT),room,constants.ROOM_SIDE_LEFT);
                if (genRandom.randomPercentage(0.5)) this.buildRoomExtensionSingle(genRandom.randomIndex(constants.ROOM_LEVEL_COUNT),room,constants.ROOM_SIDE_RIGHT);
            }
            else {
                if (genRandom.randomPercentage(0.5)) this.buildRoomExtensionSingle(genRandom.randomIndex(constants.ROOM_LEVEL_COUNT),room,constants.ROOM_SIDE_TOP);
                if (genRandom.randomPercentage(0.5)) this.buildRoomExtensionSingle(genRandom.randomIndex(constants.ROOM_LEVEL_COUNT),room,constants.ROOM_SIDE_BOTTOM);
            }
        }
    }
    
        //
        // closets, ledges, and decorations
        //
        
    buildRoomClosets()
    {
        let n,room,closet;
        let nRoom=this.map.rooms.length;
        
        closet=new GenRoomClosetClass(this.map);
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.rooms[n];
            if (!room.liquid) closet.addCloset(room);
        }
    }
    
    buildRoomWindows()
    {
        let n,room,windows;
        let nRoom=this.map.rooms.length;
        
        windows=new GenRoomWindowClass(this.map);
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.rooms[n];
            if (!room.liquid) windows.addWindow(this,room);
        }
    }
    
    buildRoomLedges()
    {
        let n,room,ledge;
        let nRoom=this.map.rooms.length;
        
        ledge=new GenRoomLedgeClass(this.map);
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.rooms[n];
            ledge.createLedges(room);
        }
    }
    
    buildRoomPlatforms()
    {
        let n,room,platform,stair;
        let nRoom=this.map.rooms.length;
        
        platform=new GenRoomPlatformClass(this.map);
        stair=new GenRoomStairsClass(this.map);
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.rooms[n];
            if (room.mainPath) continue;
            
            switch (room.level) {
                case constants.ROOM_LEVEL_LOWER:
                    platform.create(room);
                    break;
                case constants.ROOM_LEVEL_HIGHER:
                    stair.createStairsExtension(room);
                    break;
            }
        }
    }
    
    buildRoomDecorations()
    {
        let n,room,rects;
        let k,nRect,decorationType;
        let pillar=new GenRoomDecorationPillarClass(this.map);
        let storage=new GenRoomDecorationStorageClass(this.map);
        let computer=new GenRoomDecorationComputerClass(this.map);
        let pipe=new GenRoomDecorationPipeClass(this.map);
        let cubicle=new GenRoomDecorationCubicalClass(this.map);
        let lab=new GenRoomDecorationLabClass(this.map);
        let nRoom=this.map.rooms.length;
        
        if (!config.ROOM_DECORATIONS) return;
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.rooms[n];
            
                // a random series of rectangles in the room
                // to place decorations
                
            rects=room.createRandomRects(room);
            
                // put items in the rects
            
            nRect=rects.length;
            
            for (k=0;k!==nRect;k++) {
            
                decorationType=genRandom.randomIndex(7);        // +1 for a skip version
                //decorationType=constants.ROOM_DECORATION_PIPE; // supergumba -- testing
            
                switch (decorationType) {
                    case constants.ROOM_DECORATION_PILLARS:
                        pillar.create(room,rects[k]);
                        room.blockGridForRect(rects[k]);
                        break;
                    case constants.ROOM_DECORATION_STORAGE:
                        storage.create(room,rects[k]);
                        room.blockGridForRect(rects[k]);
                        break;
                    case constants.ROOM_DECORATION_COMPUTER:
                        computer.create(room,rects[k]);
                        room.blockGridForRect(rects[k]);
                        break;
                    case constants.ROOM_DECORATION_PIPE:
                        pipe.create(room,rects[k]);
                        room.blockGridForRect(rects[k]);
                        break;
                    case constants.ROOM_DECORATION_CUBICAL:
                        cubicle.create(room,rects[k]);
                        room.blockGridForRect(rects[k]);
                        break;
                    case constants.ROOM_DECORATION_LAB:
                        lab.create(room,rects[k]);
                        room.blockGridForRect(rects[k]);
                        break;

                }
            }
        }
    }

        //
        // build map mainline
        //

    build()
    {
        this.view.loadingScreenDraw(0.1);
        setTimeout(this.buildMapPath.bind(this),1);
    }
    
    buildMapPath()
    {
            // start the recursive
            // room adding

        this.currentRoomCount=0;
        
        this.buildMapRoomPath(null,this.HALLWAY_NONE);
        
        this.view.loadingScreenDraw(0.2);
        
        if (config.SIMPLE_TEST_MAP) {
            setTimeout(this.buildMapFinish.bind(this),1);
        }
        else {
            setTimeout(this.buildMapExtensions.bind(this),1);
        }
    }
    
    buildMapExtensions()
    {
            // start the recursive
            // room adding

        this.currentRoomCount=0;
        
        this.buildRoomExtensions();
        
        this.view.loadingScreenDraw(0.3);
        setTimeout(this.buildMapRoomPieces.bind(this),1);
    }
    
    buildMapRoomPieces()
    {
            // build room closets
            
        this.buildRoomClosets();
        this.buildRoomWindows();
        this.buildRoomLedges();
        this.buildRoomPlatforms();
        this.buildRoomDecorations();
        
            // finish with the callback

        this.view.loadingScreenDraw(0.4);
        setTimeout(this.buildMapRemoveSharedTriangles1.bind(this),1);
    }
    
    buildMapRemoveSharedTriangles1()
    {
            // we do this in separate passes as some polygons
            // shouldn't remove others, and vice versa.  first
            // remove all the shared trigs between rooms and
            // remove them both
            
        this.removeSharedTrianglesChunk(constants.MESH_FLAG_ROOM_WALL,constants.MESH_FLAG_ROOM_WALL,true,true);
        
            // finish with the callback
            
        this.view.loadingScreenDraw(0.6);
        setTimeout(this.buildMapRemoveSharedTriangles2.bind(this),1);
    }
    
    
    buildMapRemoveSharedTriangles2()
    {
            // now remove any platforms or ledges that are equal
            // in another platform or ledge wall
            
        this.removeSharedTrianglesChunk(constants.MESH_FLAG_PLATFORM,constants.MESH_FLAG_PLATFORM,true,true);
        this.removeSharedTrianglesChunk(constants.MESH_FLAG_LEDGE,constants.MESH_FLAG_LEDGE,true,true);
        
            // finish with the callback
            
        this.view.loadingScreenDraw(0.7);
        setTimeout(this.buildMapRemoveSharedTriangles3.bind(this),1);
    }

    buildMapRemoveSharedTriangles3()
    {
            // and finally remove any platform or ledge triangles that
            // are enclosed by an outer wall
            
        this.removeSharedTrianglesChunk(constants.MESH_FLAG_PLATFORM,constants.MESH_FLAG_ROOM_WALL,false,false);
        this.removeSharedTrianglesChunk(constants.MESH_FLAG_LEDGE,constants.MESH_FLAG_ROOM_WALL,false,false);
        
            // finish with the callback
            
        this.view.loadingScreenDraw(0.8);
        setTimeout(this.buildMapFinish.bind(this),1);
    }
    
    buildMapFinish()
    {
            // overlay precalc
            
        this.map.precalcOverlayDrawValues();
        
            // finish with the callback
            
        this.view.loadingScreenDraw(1.0);
        this.callbackFunc();
    }

}
