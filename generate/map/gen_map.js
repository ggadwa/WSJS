/* global map, genRandom, config, view, MeshPrimitivesClass, mapRoomConstants */

"use strict";

//
// generate map class
//

class GenMapClass
{
    constructor(callbackFunc)
    {
        this.currentRoomCount=0;

            // the callback function when
            // generation concludes

        this.callbackFunc=callbackFunc;
        
            // the base Y for the path part
            // of the map
            
        this.yBase=Math.trunc(view.OPENGL_FAR_Z/2);
        
            // constants
            
        this.HALLWAY_NONE=0;
        this.HALLWAY_SHORT=1;
        this.HALLWAY_LONG=2;
        
        this.LEVEL_NORMAL=0;
        this.LEVEL_LOWER=1;
        
        this.EXTENSION_COUNT=3;
        
            // generation constants

        this.ROOM_MIN_BLOCK_PER_SIDE=5;                 // minimum number of blocks that can make up one side of a room
        this.ROOM_MAX_BLOCK_PER_SIDE=10;                // maximum number of blocks that can make up one side of a room
        this.ROOM_MAX_BLOCK_COUNT=100;                  // maximum number of blocks in total for a room (x * z block count)
            
        this.ROOM_MAX_CONNECT_TRY=20;                   // number of times we try to find a place to connect rooms
        
        this.ROOM_LONG_HALLWAY_PERCENTAGE=0.3;          // what percentage of the time the general room path will have a long hallway
        this.ROOM_LIQUID_PERCENTAGE=0.3;                // what % of time a lower room can have a liquid
        
        this.ROOM_LIGHT_FACTOR=0.45;                    // lights are initially set to room radius, this factor is multipled in
        this.ROOM_LIGHT_FACTOR_EXTRA=0.4;               // random addition to light factor above

        this.ROOM_LIGHT_EXPONENT_MINIMUM=0.2;           // minimum light exponent (0.0 is completely hard light with no fall off)
        this.ROOM_LIGHT_EXPONENT_EXTRA=0.5;             // exponent add

        this.ROOM_LIGHT_RGB_MINIMUM=0.7;                // minimum r, g, or b value for map lights
        this.ROOM_LIGHT_RGB_MINIMUM_EXTRA=0.3;          // random r, g, b add for map lights

        this.MAP_LIGHT_ALWAYS_WHITE=false;              // make sure map lights are always white

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
            
        nMesh=map.meshes.length;
            
        for (n=0;n!==nMesh;n++) {
            map.meshes[n].buildSharedTriangleCache();
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
            mesh=map.meshes[n];
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
                    otherMesh=map.meshes[k];
                    if (otherMesh.flag!==compareMeshFlag) continue;

                    if (mesh.boxTouchOtherMeshOutside(otherMesh)) targetMeshList[targetMeshCount++]=k;
                }
            }
            else {
                for (k=0;k!==nMesh;k++) {
                    otherMesh=map.meshes[k];
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
                    otherMesh=map.meshes[targetMeshList[k]];

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
            map.meshes[n].clearSharedTriangleCache();
        }
        
            // finally delete the triangles

        nTrig=trigList.length;
        if (nTrig===0) return;

        for (n=0;n!==nTrig;n++) {

                // remove the trig

            aTrig=trigList[n];
            map.meshes[aTrig[0]].removeTriangle(aTrig[1]);

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

    addRegularRoom(level,xBlockSize,zBlockSize,xBound,zBound,mainPath)
    {
        let n,mesh,mesh2;
        let yAdd,yBound,yWallBound,yFloorBound;
        let roomIdx,room;
        let storyCount,decorationType,liquid;
        let roomBitmap=map.getTexture(map.TEXTURE_TYPE_WALL);
        
            // figure out room Y size from extension mode
            
        switch (level) {
            case this.LEVEL_LOWER:
                storyCount=genRandom.randomInt(2,3);        // need at least two stories
                yAdd=(genRandom.randomInBetween(1,(storyCount-1)));
                yBound=new wsBound(0,this.yBase+((map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)*yAdd));
                break;
            default:
                storyCount=genRandom.randomInt(1,4);
                yBound=new wsBound(0,this.yBase);
                break;
        }
        
            // determine if this room has a liquid,
            // and lower it for pool and add a story
        
        liquid=(config.ROOM_LIQUIDS)&&(level===this.LEVEL_LOWER)&&(genRandom.randomPercentage(this.ROOM_LIQUID_PERCENTAGE))&&(!config.SIMPLE_TEST_MAP);
        
            // determine the decoration type
        
        if (liquid) {
            decorationType=mapRoomConstants.ROOM_DECORATION_NONE;
        }
        else {
            decorationType=genRandom.randomIndex(mapRoomConstants.ROOM_DECORATION_COUNT);
        }
        
            // top of room
            
        yBound.min=yBound.max-((map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)*storyCount);
            
            // add this room to the tracking room list so
            // we can use it later to add entities and decorations and such

        roomIdx=map.addRoom(xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,decorationType,mainPath,liquid);
        room=map.rooms[roomIdx];
        
            // the floor
            
        room.createMeshFloor(map.getTexture(map.TEXTURE_TYPE_FLOOR));

            // walls
            // each wall is a tall piece and a short piece on top
            // the short piece is for headers on doors and places for platforms
            
        yWallBound=new wsBound((yBound.max-map.ROOM_FLOOR_HEIGHT),yBound.max);
        yFloorBound=new wsBound((yWallBound.min-map.ROOM_FLOOR_DEPTH),yWallBound.min);
            
        for (n=0;n!==storyCount;n++) {
            mesh=room.createMeshWalls(roomBitmap,yWallBound);
            mesh2=room.createMeshWalls(roomBitmap,yFloorBound);
            mesh.combineMesh(mesh2);
            
            map.addMesh(mesh);
            if (n===0) map.addOverlayRoom(room);
            
            yWallBound.add(-(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH));
            yFloorBound.add(-(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH));
        }
        
            // the ceiling
        
        room.openCeiling=(genRandom.randomPercentage(0.5))&&(storyCount>1);
        room.createMeshCeiling(map.getTexture(map.TEXTURE_TYPE_CEILING));
        
        return(roomIdx);
    }
/* supergumba -- deactivated for now
    addStairRoom(level,connectSide,xStairBound,zStairBound)
    {
        let genRoomStairs=new GenRoomStairsClass();
        
            // y of stairs
            
        let yStairBound=new wsBound(0,0);
        
        switch (level) {
            case this.EXTENSION_STAIR_UP:
                yStairBound.max=this.yBase;
                break;
            case this.EXTENSION_STAIR_DOWN:
                yStairBound.max=this.yBase+(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH);
                break;
        }
        
        yStairBound.min=yStairBound.max-(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH);       // don't count the upper header
        
            // flip the direction if going down
            
        if (level===this.EXTENSION_STAIR_DOWN) {
            switch (connectSide) {
                case mapRoomConstants.ROOM_SIDE_LEFT:
                    connectSide=mapRoomConstants.ROOM_SIDE_RIGHT;
                    break;
                case mapRoomConstants.ROOM_SIDE_TOP:
                    connectSide=mapRoomConstants.ROOM_SIDE_BOTTOM;
                    break;
                case mapRoomConstants.ROOM_SIDE_RIGHT:
                    connectSide=mapRoomConstants.ROOM_SIDE_LEFT;
                    break;
                case mapRoomConstants.ROOM_SIDE_BOTTOM:
                    connectSide=mapRoomConstants.ROOM_SIDE_TOP;
                    break;
            }
        }

            // create the stairs
            
        switch (connectSide) {
            
            case mapRoomConstants.ROOM_SIDE_LEFT:
                genRoomStairs.createStairsX(xStairBound,yStairBound,zStairBound,false,false,false);
                break;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                genRoomStairs.createStairsZ(xStairBound,yStairBound,zStairBound,false,false,false);
                break;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                genRoomStairs.createStairsX(xStairBound,yStairBound,zStairBound,false,false,true);
                break;
                
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                genRoomStairs.createStairsZ(xStairBound,yStairBound,zStairBound,false,false,true);
                break;
                
        }
        
            // add to overlay
            
        map.addOverlayConnection(xStairBound,zStairBound);
    }
*/    
        //
        // hallways and liquid steps
        //
        
    addHallwayRoom(connectSide,hallwayMode,xHallwayBound,zHallwayBound)
    {
            // build the door
            
        let genRoomHallway=new GenRoomHallwayClass();
        let yHallwayBound=new wsBound(this.yBase,(this.yBase-map.ROOM_FLOOR_HEIGHT));        // don't count the upper header

        if ((connectSide===mapRoomConstants.ROOM_SIDE_LEFT) || (connectSide===mapRoomConstants.ROOM_SIDE_RIGHT)) {
            genRoomHallway.createHallwayX(xHallwayBound,yHallwayBound,zHallwayBound,(hallwayMode===this.HALLWAY_LONG));
        }
        else {
            genRoomHallway.createHallwayZ(xHallwayBound,yHallwayBound,zHallwayBound,(hallwayMode===this.HALLWAY_LONG));
        }
        
            // add to overlay
            
        map.addOverlayConnection(xHallwayBound,zHallwayBound);
    }
    
    addLiquidStairRoom(room,connectSide,xBound,zBound,flip)
    {
        let xStairBound,zStairBound;
        let yStairBound=new wsBound(room.yBound.max,(room.yBound.max+map.ROOM_BLOCK_WIDTH));
        let genRoomStairs=new GenRoomStairsClass();
        
            // if there's a door, sometimes we need stairs
            // on both sides of room, so we have a flipped version
            
        if (flip) {
            switch (connectSide) {
                case mapRoomConstants.ROOM_SIDE_LEFT:
                    connectSide=mapRoomConstants.ROOM_SIDE_RIGHT;
                    break;
                case mapRoomConstants.ROOM_SIDE_RIGHT:
                    connectSide=mapRoomConstants.ROOM_SIDE_LEFT;
                    break;
                case mapRoomConstants.ROOM_SIDE_TOP:
                    connectSide=mapRoomConstants.ROOM_SIDE_BOTTOM;
                    break;
                case mapRoomConstants.ROOM_SIDE_BOTTOM:
                    connectSide=mapRoomConstants.ROOM_SIDE_TOP;
                    break;
            }
        }

            // create the stairs
            
        switch (connectSide) {
            case mapRoomConstants.ROOM_SIDE_LEFT:
                xStairBound=new wsBound(xBound.max,(xBound.max+map.ROOM_BLOCK_WIDTH));
                genRoomStairs.createStairsX(xStairBound,yStairBound,zBound,true,false,false);
                break;
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                xStairBound=new wsBound((xBound.min-map.ROOM_BLOCK_WIDTH),xBound.min);
                genRoomStairs.createStairsX(xStairBound,yStairBound,zBound,true,false,true);
                break;
            case mapRoomConstants.ROOM_SIDE_TOP:
                zStairBound=new wsBound(zBound.max,(zBound.max+map.ROOM_BLOCK_WIDTH));
                genRoomStairs.createStairsZ(xBound,yStairBound,zStairBound,true,false,false);
                break;
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                zStairBound=new wsBound((zBound.min-map.ROOM_BLOCK_WIDTH),zBound.min);
                genRoomStairs.createStairsZ(xBound,yStairBound,zStairBound,true,false,true);
                break;
        }
    }
    
        //
        // lights
        //

    addGeneralLight(lightPos,fixturePos,intensity)
    {
        let red,green,blue,exponent;
        let xFixtureBound,yFixtureBound,zFixtureBound;

            // light fixture

        if (fixturePos!==null) {
            xFixtureBound=new wsBound((fixturePos.x-400),(fixturePos.x+400));
            yFixtureBound=new wsBound(fixturePos.y,(fixturePos.y+1000));
            zFixtureBound=new wsBound((fixturePos.z-400),(fixturePos.z+400));
            map.addMesh(MeshPrimitivesClass.createMeshPryamid(map.getTexture(map.TEXTURE_TYPE_METAL),xFixtureBound,yFixtureBound,zFixtureBound,map.MESH_FLAG_LIGHT));
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

        map.addLight(new MapLightClass(lightPos,new wsColor(red,green,blue),config.MAP_GENERATE_LIGHTMAP,intensity,exponent));
    }
    
    addRoomLight(roomIdx)
    {
        let lightY,fixturePos,lightPos,intensity;
        let room=map.rooms[roomIdx];
        
            // locations
            
        lightY=room.yBound.max-((map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)*room.storyCount);
        
        fixturePos=new wsPoint(room.xBound.getMidPoint(),lightY,room.zBound.getMidPoint());
        lightPos=new wsPoint(fixturePos.x,(room.openCeiling?(fixturePos.y-100):(fixturePos.y+1100)),fixturePos.z);
        
            // intensity
        
        intensity=Math.max(room.xBound.getSize(),room.yBound.getSize(),room.zBound.getSize());
        if (!config.SIMPLE_TEST_MAP) intensity=Math.trunc((intensity*this.ROOM_LIGHT_FACTOR)+(intensity*(genRandom.random()*this.ROOM_LIGHT_FACTOR_EXTRA)));
        
            // create the light
            
        this.addGeneralLight(lightPos,(room.openCeiling?null:fixturePos),intensity);
    }
    
    addHallwayLight(xBound,zBound)
    {
        let fixturePos,lightPos;
        
            // locations
            
        fixturePos=new wsPoint(xBound.getMidPoint(),(this.yBase-map.ROOM_FLOOR_HEIGHT),zBound.getMidPoint());
        lightPos=new wsPoint(fixturePos.x,(fixturePos.y+1100),fixturePos.z);
        
            // create the light
            
        this.addGeneralLight(lightPos,fixturePos,(map.ROOM_FLOOR_HEIGHT*1.5));
    }
/* supergumba -- deactivated for now    
    addStairLight(level,xBound,zBound)
    {
        let fixturePos,lightPos;
        
            // locations
            
        let y=0;
        
        switch (level) {
            case this.EXTENSION_STAIR_UP:
                y=this.yBase-Math.trunc(map.ROOM_FLOOR_HEIGHT*1.55);
                break;
            case this.EXTENSION_STAIR_DOWN:
                y=this.yBase-Math.trunc(map.ROOM_FLOOR_HEIGHT*0.45);
                break;
        }
            
        fixturePos=new wsPoint(xBound.getMidPoint(),y,zBound.getMidPoint());
        lightPos=new wsPoint(fixturePos.x,(fixturePos.y+1100),fixturePos.z);
        
            // create the light
            
        this.addGeneralLight(lightPos,fixturePos,(map.ROOM_FLOOR_HEIGHT*1.5));
    }
*/    
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
        
        count=Math.trunc((max-min)/map.ROOM_BLOCK_WIDTH);
        offset=genRandom.randomIndex(count)*map.ROOM_BLOCK_WIDTH;
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
        let connectSide,connectOffset;
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
            mapMid=Math.trunc(view.OPENGL_FAR_Z/2);

            halfSize=Math.trunc((xBlockSize/2)*map.ROOM_BLOCK_WIDTH);
            xBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));

            halfSize=Math.trunc((zBlockSize/2)*map.ROOM_BLOCK_WIDTH);
            zBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));
        }

            // otherwise we connect to the previous
            // room by picking a side, and an offset into
            // that side

        else {

            tryCount=0;
            
            while (true) {
                
                    // for right now, we always head up, but we leave
                    // this code here in case we want turns in the path
                    //connectSide=genRandom.randomIndex(4); // supergumba
                    
                connectSide=mapRoomConstants.ROOM_SIDE_TOP;
                
                if ((connectSide===mapRoomConstants.ROOM_SIDE_LEFT) || (connectSide===mapRoomConstants.ROOM_SIDE_RIGHT)) {
                    connectOffset=genRandom.randomInt(-Math.trunc(zBlockSize*0.5),lastRoom.zBlockSize);
                }
                else {
                    connectOffset=genRandom.randomInt(-Math.trunc(xBlockSize*0.5),lastRoom.xBlockSize);
                }
                connectOffset*=map.ROOM_BLOCK_WIDTH;
                
                    // get new room bounds and move it around
                    // if we need space for hallways
                
                doorAdd=(hallwayMode===this.HALLWAY_LONG)?(map.ROOM_BLOCK_WIDTH*4):map.ROOM_BLOCK_WIDTH;
                
                switch (connectSide) {

                    case mapRoomConstants.ROOM_SIDE_LEFT:
                        xBound=new wsBound((lastRoom.xBound.min-(xBlockSize*map.ROOM_BLOCK_WIDTH)),lastRoom.xBound.min);
                        zBound=new wsBound((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*map.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            xBound.add(-doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                            xHallwayBound=new wsBound((lastRoom.xBound.min-doorAdd),lastRoom.xBound.min);
                            zHallwayBound=new wsBound((lastRoom.zBound.min+doorOffset),((lastRoom.zBound.min+doorOffset)+map.ROOM_BLOCK_WIDTH));
                        }
                        
                        break;

                    case mapRoomConstants.ROOM_SIDE_TOP:
                        xBound=new wsBound((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*map.ROOM_BLOCK_WIDTH)));
                        zBound=new wsBound((lastRoom.zBound.min-(zBlockSize*map.ROOM_BLOCK_WIDTH)),lastRoom.zBound.min);
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            zBound.add(-doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                            xHallwayBound=new wsBound((lastRoom.xBound.min+doorOffset),((lastRoom.xBound.min+doorOffset)+map.ROOM_BLOCK_WIDTH));
                            zHallwayBound=new wsBound((lastRoom.zBound.min-doorAdd),lastRoom.zBound.min);
                        }
                        
                        break;

                    case mapRoomConstants.ROOM_SIDE_RIGHT:
                        xBound=new wsBound(lastRoom.xBound.max,(lastRoom.xBound.max+(xBlockSize*map.ROOM_BLOCK_WIDTH)));
                        zBound=new wsBound((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*map.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            xBound.add(doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                            xHallwayBound=new wsBound(lastRoom.xBound.max,(lastRoom.xBound.max+doorAdd));
                            zHallwayBound=new wsBound((lastRoom.zBound.min+doorOffset),((lastRoom.zBound.min+doorOffset)+map.ROOM_BLOCK_WIDTH));
                        }
                        
                        break;

                    case mapRoomConstants.ROOM_SIDE_BOTTOM:
                        xBound=new wsBound((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*map.ROOM_BLOCK_WIDTH)));
                        zBound=new wsBound(lastRoom.zBound.max,(lastRoom.zBound.max+(zBlockSize*map.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            zBound.add(doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                            xHallwayBound=new wsBound((lastRoom.xBound.min+doorOffset),((lastRoom.xBound.min+doorOffset)+map.ROOM_BLOCK_WIDTH));
                            zHallwayBound=new wsBound(lastRoom.zBound.max,(lastRoom.zBound.max+doorAdd));
                        }
                        
                        break;

                }
                
                if (map.boxBoundCollision(xBound,null,zBound,map.MESH_FLAG_ROOM_WALL)===-1) break;

                tryCount++;
                if (tryCount>this.ROOM_MAX_CONNECT_TRY) return;
            }
        }

            // add in hallways and a light
            // if the hallway is long
            
        if (hallwayMode!==this.HALLWAY_NONE) {
            this.addHallwayRoom(connectSide,hallwayMode,xHallwayBound,zHallwayBound);
            if (hallwayMode===this.HALLWAY_LONG) this.addHallwayLight(xHallwayBound,zHallwayBound);
        }

            // the room
            
        roomIdx=this.addRegularRoom(this.LEVEL_NORMAL,xBlockSize,zBlockSize,xBound,zBound,true);
        this.currentRoomCount++;
        
        room=map.rooms[roomIdx];
        
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
            
        if ((map.rooms.length>=config.ROOM_PATH_COUNT) || (config.SIMPLE_TEST_MAP)) return;

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
        let stairOffset,stairAdd,xStairBound,zStairBound;   // supergumba -- deal with unused variables
        
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


            if ((connectSide===mapRoomConstants.ROOM_SIDE_LEFT) || (connectSide===mapRoomConstants.ROOM_SIDE_RIGHT)) {
                connectOffset=genRandom.randomInt(-Math.trunc(zBlockSize*0.5),lastRoom.zBlockSize);
            }
            else {
                connectOffset=genRandom.randomInt(-Math.trunc(xBlockSize*0.5),lastRoom.xBlockSize);
            }
            connectOffset*=map.ROOM_BLOCK_WIDTH;

                // get new room bounds and move it around
                // if we need space for stairs

            stairAdd=map.ROOM_BLOCK_WIDTH*2;

            switch (connectSide) {

                case mapRoomConstants.ROOM_SIDE_LEFT:
                    xBound=new wsBound((lastRoom.xBound.min-(xBlockSize*map.ROOM_BLOCK_WIDTH)),lastRoom.xBound.min);
                    zBound=new wsBound((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*map.ROOM_BLOCK_WIDTH)));
                    break;

                case mapRoomConstants.ROOM_SIDE_TOP:
                    xBound=new wsBound((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*map.ROOM_BLOCK_WIDTH)));
                    zBound=new wsBound((lastRoom.zBound.min-(zBlockSize*map.ROOM_BLOCK_WIDTH)),lastRoom.zBound.min);
                    break;

                case mapRoomConstants.ROOM_SIDE_RIGHT:
                    xBound=new wsBound(lastRoom.xBound.max,(lastRoom.xBound.max+(xBlockSize*map.ROOM_BLOCK_WIDTH)));
                    zBound=new wsBound((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*map.ROOM_BLOCK_WIDTH)));
                    break;

                case mapRoomConstants.ROOM_SIDE_BOTTOM:
                    xBound=new wsBound((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*map.ROOM_BLOCK_WIDTH)));
                    zBound=new wsBound(lastRoom.zBound.max,(lastRoom.zBound.max+(zBlockSize*map.ROOM_BLOCK_WIDTH)));
                    break;

            }

            if (map.boxBoundCollision(xBound,null,zBound,map.MESH_FLAG_ROOM_WALL)===-1) break;

            tryCount++;
            if (tryCount>this.ROOM_MAX_CONNECT_TRY) return;
        }

            // the room
            
        roomIdx=this.addRegularRoom(level,xBlockSize,zBlockSize,xBound,zBound,false);
        this.currentRoomCount++;
        
        room=map.rooms[roomIdx];
        
            // if we are in a liquid, we need to make stairs out
            // to the connection point or complete stairs down into
            // the liquid (depending on the stair direction, it's either
            // this room or the previous room)
       /* supergumba -- deal with this     
        switch (level) {
            case this.EXTENSION_STAIR_UP:
                if (lastRoom.liquid) this.addLiquidStairRoom(lastRoom,connectSide,xStairBound,zStairBound,false);
                break;
            case this.EXTENSION_STAIR_DOWN:
                if (room.liquid) this.addLiquidStairRoom(room,connectSide,xStairBound,zStairBound,true);
                break;
        }
        */
            // finally add the liquid
        
        if (room.liquid) map.addLiquid(new MapLiquidClass(map.getTexture(map.TEXTURE_TYPE_LIQUID),room));
        
            // mask off edges that have collided with
            // the newest room or stairs leading to a room
            // we use this mask to calculate ledges and other
            // outside wall hugging map pieces
        
        if (lastRoom!==null) {
            switch (level) {
                /* supergumba -- deal with this
                case this.EXTENSION_STAIR_UP:
                case this.EXTENSION_STAIR_DOWN:
                    lastRoom.maskEdgeGridBlockToBounds(xStairBound,zStairBound);
                    room.maskEdgeGridBlockToBounds(xStairBound,zStairBound);
                    break;
                    */
                default:
                    lastRoom.maskEdgeGridBlockToRoom(room);
                    room.maskEdgeGridBlockToRoom(lastRoom);
                    break;
            }
        }
        
            // add the room light

        this.addRoomLight(roomIdx);
    }

    buildRoomExtensions()
    {
        let n,room;
        let nRoom=map.rooms.length;
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            this.buildRoomExtensionSingle(genRandom.randomIndex(this.EXTENSION_COUNT),room,mapRoomConstants.ROOM_SIDE_LEFT);
            this.buildRoomExtensionSingle(genRandom.randomIndex(this.EXTENSION_COUNT),room,mapRoomConstants.ROOM_SIDE_RIGHT);
        }
    }
    
        //
        // closets, ledges, and decorations
        //
        
    buildRoomClosets()
    {
        let n,room,closet;
        let nRoom=map.rooms.length;
        
        closet=new GenRoomClosetClass();
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            if (!room.liquid) closet.addCloset(room);
        }
    }
    
    buildRoomLedges()
    {
        let n,room,ledge;
        let nRoom=map.rooms.length;
        
        ledge=new GenRoomLedgeClass();
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            ledge.createLedges(room);
        }
    }
    
    buildRoomPlatforms()
    {
        let n,room,platform;
        let nRoom=map.rooms.length;
        
        platform=new GenRoomPlatformClass();
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            if (((room.liquid) || (room.storyCount>1)) && (!room.mainPath)) platform.create(room);
        }
    }
    
    buildRoomDecorations()
    {
        let n,room;
        let pillar=null;
        let storage=null;
        let machine=null;
        let equipment=null;
        let walls=null;
        let nRoom=map.rooms.length;
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            
            //room.decorationType=mapRoomConstants.ROOM_DECORATION_WALLS;  // supergumba -- testing
            
            switch (room.decorationType) {
                case mapRoomConstants.ROOM_DECORATION_PILLARS:
                    if (pillar===null) pillar=new GenRoomDecorationPillarClass();
                    pillar.create(room);
                    break;
                case mapRoomConstants.ROOM_DECORATION_STORAGE:
                    if (storage===null) storage=new GenRoomDecorationStorageClass();
                    storage.create(room);
                    break;
                case mapRoomConstants.ROOM_DECORATION_MACHINES:
                    if (machine===null) machine=new GenRoomDecorationMachineClass();
                    machine.create(room);
                    break;
                case mapRoomConstants.ROOM_DECORATION_EQUIPMENT:
                    if (equipment===null) equipment=new GenRoomDecorationEquipmentClass();
                    equipment.create(room);
                    break;
                case mapRoomConstants.ROOM_DECORATION_WALLS:
                    if (walls===null) walls=new GenRoomDecorationWallsClass();
                    walls.create(room);
                    break;
                
            }
        }
    }

        //
        // build map mainline
        //

    build()
    {
        view.loadingScreenDraw(0.1);
        setTimeout(this.buildMapPath.bind(this),1);
    }
    
    buildMapPath()
    {
            // start the recursive
            // room adding

        this.currentRoomCount=0;
        
        this.buildMapRoomPath(null,this.HALLWAY_NONE);
        
        view.loadingScreenDraw(0.2);
        
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
        
        view.loadingScreenDraw(0.3);
        setTimeout(this.buildMapRoomPieces.bind(this),1);
    }
    
    buildMapRoomPieces()
    {
            // build room closets
            
        this.buildRoomClosets();
        this.buildRoomLedges();
        this.buildRoomPlatforms();
        this.buildRoomDecorations();
        
            // finish with the callback

        view.loadingScreenDraw(0.4);
        setTimeout(this.buildMapRemoveSharedTriangles1.bind(this),1);
    }
    
    buildMapRemoveSharedTriangles1()
    {
             // we do this in separate passes as some polygons
            // shouldn't remove others, and vice versa.  first
            // remove all the shared trigs between rooms and
            // remove them both
            
        this.removeSharedTrianglesChunk(map.MESH_FLAG_ROOM_WALL,map.MESH_FLAG_ROOM_WALL,true,true);
        
            // finish with the callback
            
        view.loadingScreenDraw(0.6);
        setTimeout(this.buildMapRemoveSharedTriangles2.bind(this),1);
    }
    
    
    buildMapRemoveSharedTriangles2()
    {
            // now remove any platforms or ledges that are equal
            // in another platform or ledge wall
            
        this.removeSharedTrianglesChunk(map.MESH_FLAG_PLATFORM,map.MESH_FLAG_PLATFORM,true,true);
        this.removeSharedTrianglesChunk(map.MESH_FLAG_LEDGE,map.MESH_FLAG_LEDGE,true,true);
        
            // finish with the callback
            
        view.loadingScreenDraw(0.7);
        setTimeout(this.buildMapRemoveSharedTriangles3.bind(this),1);
    }

    buildMapRemoveSharedTriangles3()
    {
            // and finally remove any platform or ledge triangles that
            // are enclosed by an outer wall
            
        this.removeSharedTrianglesChunk(map.MESH_FLAG_PLATFORM,map.MESH_FLAG_ROOM_WALL,false,false);
        this.removeSharedTrianglesChunk(map.MESH_FLAG_LEDGE,map.MESH_FLAG_ROOM_WALL,false,false);
        
            // finish with the callback
            
        view.loadingScreenDraw(0.8);
        setTimeout(this.buildMapFinish.bind(this),1);
    }
    
    buildMapFinish()
    {
            // overlay precalc
            
        map.precalcOverlayDrawValues();
        
            // finish with the callback
            
        view.loadingScreenDraw(1.0);
        this.callbackFunc();
    }

}
