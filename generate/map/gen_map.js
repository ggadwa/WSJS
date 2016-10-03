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
        
            // some constants
            
        this.HALLWAY_NONE=0;
        this.HALLWAY_SHORT=1;
        this.HALLWAY_LONG=2;
        
        this.STAIR_NONE=0;
        this.STAIR_UP=1;
        this.STAIR_DOWN=2;
        
        Object.seal(this);
    }
    
        //
        // remove shared triangles
        //

    removeSharedTrianglesChunk(meshFlag,compareMeshFlag,equalY,removeBoth)
    {
        var n,k,t1,t2,nMesh,hit;
        var mesh,otherMesh;
        var trigCache,otherTrigCache;
        
            // this function calculates if a triangle
            // is wall like, and it's bounds, and caches it
            
        nMesh=map.meshes.length;
            
        for (n=0;n!==nMesh;n++) {
            map.meshes[n].buildSharedTriangleCache();
        }

            // create a list of triangles
            // to delete

        var trigList=[];

            // run through all the meshes
            // and remove any triangles occupying
            // the same space

            // since trigs can be rotated, we
            // compare the bounds, equal bounds
            // means overlapping

            // skip any trigs that aren't straight walls
            // so slanted walls don't get erased (only
            // straight walls are connected)
            
        var targetMeshCount=0;
        var targetMeshList=new Uint16Array(nMesh);

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

        var nTrig=trigList.length;
        if (nTrig===0) return;

        var k;
        var aTrig,bTrig;

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

    addRegularRoom(xBlockSize,zBlockSize,xBound,zBound,allowLiquid,level)
    {
        var n,mesh,mesh2;
        var storyCount,yBound,yWallBound,yFloorBound;
        var roomIdx,room;
        var storyCount,liquid;
        var roomBitmap=map.getTexture(map.TEXTURE_TYPE_WALL);
        
            // anything above lower floor can have
            // other stories
        
        storyCount=1;
        if (level!==ROOM_LEVEL_LOWER) storyCount=genRandom.randomInt(1,3);
        
            // bottom of room
        
        yBound=new wsBound(0,0);
        
        switch (level) {
            case ROOM_LEVEL_LOWER:
                yBound.max=this.yBase+(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH);
                break;
            case ROOM_LEVEL_UPPER:
                yBound.max=this.yBase-(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH);
                break;
            default:
                yBound.max=this.yBase;
                break;
        }

            // determine if this room has a liquid,
            // and lower it for pool and add a story
        
        liquid=(config.ROOM_LIQUIDS)&&(genRandom.randomPercentage(config.ROOM_LIQUID_PERCENTAGE))&&allowLiquid;
        
        if (liquid) {
            yBound.max+=(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH);
            storyCount++;
        }
        
            // top of room
            
        yBound.min=yBound.max-((config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH)*storyCount);
            
            // add this room to the tracking room list so
            // we can use it later to add entities and decorations and such

        roomIdx=map.addRoom(xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,liquid,level);
        room=map.rooms[roomIdx];
        
            // the floor
            
        room.createMeshFloor(map.getTexture(map.TEXTURE_TYPE_FLOOR));

            // walls
            // each wall is a tall piece and a short piece on top
            // the short piece is for headers on doors and places for platforms
            
        yWallBound=new wsBound((yBound.max-config.ROOM_FLOOR_HEIGHT),yBound.max);
        yFloorBound=new wsBound((yWallBound.min-config.ROOM_FLOOR_DEPTH),yWallBound.min);
            
        for (n=0;n!==storyCount;n++) {
            mesh=room.createMeshWalls(roomBitmap,yWallBound);
            mesh2=room.createMeshWalls(roomBitmap,yFloorBound);
            mesh.combineMesh(mesh2);
            
            map.addMesh(mesh);
            if (n===0) map.addOverlayRoom(room);
            
            yWallBound.add(-(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH));
            yFloorBound.add(-(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH));
        }
        
            // the ceiling
        
        room.openCeiling=(genRandom.randomPercentage(0.5))&&(storyCount>1);
        room.createMeshCeiling(map.getTexture(map.TEXTURE_TYPE_CEILING));
        
        return(roomIdx);
    }

    addStairRoom(stairMode,connectSide,xStairBound,zStairBound)
    {
        var genRoomStairs=new GenRoomStairsClass();
        
            // y of stairs
            
        var yStairBound=new wsBound(0,0);
        
        switch (stairMode) {
            case this.STAIR_UP:
                yStairBound.max=this.yBase-(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH);
                break;
            case this.STAIR_DOWN:
                yStairBound.max=this.yBase+(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH);
                break;
        }
        
        yStairBound.min=yStairBound.max-config.ROOM_FLOOR_HEIGHT;       // don't count the upper header
        
            // flip the direction if going down
            
        if (stairMode===this.STAIR_DOWN) {
            switch (connectSide) {
                case ROOM_SIDE_LEFT:
                    connectSide=ROOM_SIDE_RIGHT;
                    break;
                case ROOM_SIDE_TOP:
                    connectSide=ROOM_SIDE_BOTTOM;
                    break;
                case ROOM_SIDE_RIGHT:
                    connectSide=ROOM_SIDE_LEFT;
                    break;
                case ROOM_SIDE_BOTTOM:
                    connectSide=ROOM_SIDE_TOP;
                    break;
            }
            
            //yStairBound.add(-(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH));
        }

            // create the stairs
            
        switch (connectSide) {
            
            case ROOM_SIDE_LEFT:
                genRoomStairs.createStairsX(xStairBound,yStairBound,zStairBound,false,false,false);
                break;
                
            case ROOM_SIDE_TOP:
                genRoomStairs.createStairsZ(xStairBound,yStairBound,zStairBound,false,false,false);
                break;
                
            case ROOM_SIDE_RIGHT:
                genRoomStairs.createStairsX(xStairBound,yStairBound,zStairBound,false,false,true);
                break;
                
            case ROOM_SIDE_BOTTOM:
                genRoomStairs.createStairsZ(xStairBound,yStairBound,zStairBound,false,false,true);
                break;
                
        }
        
            // add to overlay
            
        map.addOverlayConnection(xStairBound,zStairBound);
    }
    
        //
        // hallways and liquid steps
        //
        
    addHallwayRoom(connectSide,hallwayMode,xHallwayBound,zHallwayBound)
    {
            // build the door
            
        var genRoomHallway=new GenRoomHallwayClass();
        var yHallwayBound=new wsBound(this.yBase,(this.yBase-config.ROOM_FLOOR_HEIGHT));        // don't count the upper header

        if ((connectSide===ROOM_SIDE_LEFT) || (connectSide===ROOM_SIDE_RIGHT)) {
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
        var xStairBound,zStairBound;
        var yStairBound=new wsBound(room.yBound.max,(room.yBound.max+config.ROOM_BLOCK_WIDTH));
        var genRoomStairs=new GenRoomStairsClass();
        
            // if there's a door, sometimes we need stairs
            // on both sides of room, so we have a flipped version
            
        if (flip) {
            switch (connectSide) {
                case ROOM_SIDE_LEFT:
                    connectSide=ROOM_SIDE_RIGHT;
                    break;
                case ROOM_SIDE_RIGHT:
                    connectSide=ROOM_SIDE_LEFT;
                    break;
                case ROOM_SIDE_TOP:
                    connectSide=ROOM_SIDE_BOTTOM;
                    break;
                case ROOM_SIDE_BOTTOM:
                    connectSide=ROOM_SIDE_TOP;
                    break;
            }
        }

            // create the stairs
            
        switch (connectSide) {
            case ROOM_SIDE_LEFT:
                xStairBound=new wsBound(xBound.max,(xBound.max+config.ROOM_BLOCK_WIDTH));
                genRoomStairs.createStairsX(xStairBound,yStairBound,zBound,true,false,false);
                break;
            case ROOM_SIDE_RIGHT:
                xStairBound=new wsBound((xBound.min-config.ROOM_BLOCK_WIDTH),xBound.min);
                genRoomStairs.createStairsX(xStairBound,yStairBound,zBound,true,false,true);
                break;
            case ROOM_SIDE_TOP:
                zStairBound=new wsBound(zBound.max,(zBound.max+config.ROOM_BLOCK_WIDTH));
                genRoomStairs.createStairsZ(xBound,yStairBound,zStairBound,true,false,false);
                break;
            case ROOM_SIDE_BOTTOM:
                zStairBound=new wsBound((zBound.min-config.ROOM_BLOCK_WIDTH),zBound.min);
                genRoomStairs.createStairsZ(xBound,yStairBound,zStairBound,true,false,true);
                break;
        }
    }
    
        //
        // lights
        //

    addGeneralLight(lightPos,fixturePos,intensity)
    {
        var red,green,blue;

            // light fixture

        if (fixturePos!==null) {
            var xFixtureBound=new wsBound((fixturePos.x-400),(fixturePos.x+400));
            var yFixtureBound=new wsBound(fixturePos.y,(fixturePos.y+1000));
            var zFixtureBound=new wsBound((fixturePos.z-400),(fixturePos.z+400));
            map.addMesh(MeshPrimitivesClass.createMeshPryamid(map.getTexture(map.TEXTURE_TYPE_METAL),xFixtureBound,yFixtureBound,zFixtureBound,MESH_FLAG_LIGHT));
        }
        
            // the color

        red=config.MAP_LIGHT_RGB_MINIMUM+(genRandom.random()*config.MAP_LIGHT_RGB_MINIMUM_EXTRA);
        if (config.MAP_LIGHT_ALWAYS_WHITE) {
            green=blue=red;
        }
        else {
            green=config.MAP_LIGHT_RGB_MINIMUM+(genRandom.random()*config.MAP_LIGHT_RGB_MINIMUM_EXTRA);
            blue=config.MAP_LIGHT_RGB_MINIMUM+(genRandom.random()*config.MAP_LIGHT_RGB_MINIMUM_EXTRA);
        }
        
            // the exponent
            
        var exponent=config.MAP_LIGHT_EXPONENT_MINIMUM+(genRandom.random()*config.MAP_LIGHT_EXPONENT_EXTRA);

            // add light to map

        map.addLight(new MapLightClass(lightPos,new wsColor(red,green,blue),config.MAP_GENERATE_LIGHTMAP,intensity,exponent));
    }
    
    addRoomLight(roomIdx)
    {
        var lightY,fixturePos,lightPos,intensity;
        var room=map.rooms[roomIdx];
        
            // locations
            
        lightY=room.yBound.max-((config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH)*room.storyCount);
        
        fixturePos=new wsPoint(room.xBound.getMidPoint(),lightY,room.zBound.getMidPoint());
        lightPos=new wsPoint(fixturePos.x,(room.openCeiling?(fixturePos.y-100):(fixturePos.y+1100)),fixturePos.z);
        
            // intensity
        
        intensity=Math.max(room.xBound.getSize(),room.yBound.getSize(),room.zBound.getSize());
        intensity=Math.trunc((intensity*config.MAP_LIGHT_FACTOR)+(intensity*(genRandom.random()*config.MAP_LIGHT_FACTOR_EXTRA)));
        
            // create the light
            
        this.addGeneralLight(lightPos,(room.openCeiling?null:fixturePos),intensity);
    }
    
    addHallwayLight(xBound,zBound)
    {
        var fixturePos,lightPos,high;
        
            // locations
            
        fixturePos=new wsPoint(xBound.getMidPoint(),(this.yBase-config.ROOM_FLOOR_HEIGHT),zBound.getMidPoint());
        lightPos=new wsPoint(fixturePos.x,(fixturePos.y+1100),fixturePos.z);
        
            // create the light
            
        this.addGeneralLight(lightPos,fixturePos,(config.ROOM_FLOOR_HEIGHT*1.5));
    }
    
    addStairLight(xBound,yBound,zBound)
    {
        var fixturePos,lightPos,high;
        
            // locations
            
        high=Math.trunc(config.ROOM_FLOOR_HEIGHT*0.6);
            
        fixturePos=new wsPoint(xBound.getMidPoint(),(yBound.min-high),zBound.getMidPoint());
        lightPos=new wsPoint(fixturePos.x,(fixturePos.y+1100),fixturePos.z);
        
            // create the light
            
        this.addGeneralLight(lightPos,fixturePos,(config.ROOM_FLOOR_HEIGHT*1.5));
    }
    
        //
        // finds a single random block offset between two bounds
        //
        
    findRandomBlockOffsetBetweenTwoBounds(bound1,bound2)
    {
        var count,offset;
        var min=bound1.min;
        var max=bound1.max;
        
        if (bound2.min>min) min=bound2.min;
        if (bound2.max<max) max=bound2.max;
        
        count=Math.trunc((max-min)/config.ROOM_BLOCK_WIDTH);
        offset=genRandom.randomIndex(count)*config.ROOM_BLOCK_WIDTH;
        if (bound1.min<bound2.min) offset+=(bound2.min-bound1.min);           // need to align offset with bounds1
        
        return(offset);
    }

        //
        // build a path of rooms
        //

    buildMapRoomPath(lastRoom,hallwayMode)
    {
        var n,roomIdx,room,tryCount;
        var xBlockSize,zBlockSize;
        var connectSide,connectOffset;
        var xBound,zBound;
        var doorOffset,doorAdd,xHallwayBound,zHallwayBound;
        
            // get random block size for room
            // and make sure it stays under the max
            // blocks for room
        
        xBlockSize=genRandom.randomInt(config.ROOM_MIN_BLOCK_PER_SIDE,config.ROOM_MAX_BLOCK_PER_SIDE);
        zBlockSize=genRandom.randomInt(config.ROOM_MIN_BLOCK_PER_SIDE,config.ROOM_MAX_BLOCK_PER_SIDE);
        
        while ((xBlockSize*zBlockSize)>config.ROOM_MAX_BLOCK_COUNT) {
            if (xBlockSize>config.ROOM_MIN_BLOCK_PER_SIDE) xBlockSize--;
            if (zBlockSize>config.ROOM_MIN_BLOCK_PER_SIDE) zBlockSize--;
        }

            // get room location
            // if we don't have a previous room,
            // then it's the first room and it's
            // centered in the map

        if (lastRoom===null) {
            var mapMid=Math.trunc(view.OPENGL_FAR_Z/2);

            var halfSize=Math.trunc((xBlockSize/2)*config.ROOM_BLOCK_WIDTH);
            xBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));

            var halfSize=Math.trunc((zBlockSize/2)*config.ROOM_BLOCK_WIDTH);
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
                    
                connectSide=ROOM_SIDE_TOP;
                
                if ((connectSide===ROOM_SIDE_LEFT) || (connectSide===ROOM_SIDE_RIGHT)) {
                    connectOffset=genRandom.randomInt(-Math.trunc(zBlockSize*0.5),lastRoom.zBlockSize);
                }
                else {
                    connectOffset=genRandom.randomInt(-Math.trunc(xBlockSize*0.5),lastRoom.xBlockSize);
                }
                connectOffset*=config.ROOM_BLOCK_WIDTH;
                
                    // get new room bounds and move it around
                    // if we need space for hallways
                
                doorAdd=(hallwayMode===this.HALLWAY_LONG)?(config.ROOM_BLOCK_WIDTH*4):config.ROOM_BLOCK_WIDTH;
                
                switch (connectSide) {

                    case ROOM_SIDE_LEFT:
                        xBound=new wsBound((lastRoom.xBound.min-(xBlockSize*config.ROOM_BLOCK_WIDTH)),lastRoom.xBound.min);
                        zBound=new wsBound((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*config.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            xBound.add(-doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                            xHallwayBound=new wsBound((lastRoom.xBound.min-doorAdd),lastRoom.xBound.min);
                            zHallwayBound=new wsBound((lastRoom.zBound.min+doorOffset),((lastRoom.zBound.min+doorOffset)+config.ROOM_BLOCK_WIDTH));
                        }
                        
                        break;

                    case ROOM_SIDE_TOP:
                        xBound=new wsBound((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*config.ROOM_BLOCK_WIDTH)));
                        zBound=new wsBound((lastRoom.zBound.min-(zBlockSize*config.ROOM_BLOCK_WIDTH)),lastRoom.zBound.min);
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            zBound.add(-doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                            xHallwayBound=new wsBound((lastRoom.xBound.min+doorOffset),((lastRoom.xBound.min+doorOffset)+config.ROOM_BLOCK_WIDTH));
                            zHallwayBound=new wsBound((lastRoom.zBound.min-doorAdd),lastRoom.zBound.min);
                        }
                        
                        break;

                    case ROOM_SIDE_RIGHT:
                        xBound=new wsBound(lastRoom.xBound.max,(lastRoom.xBound.max+(xBlockSize*config.ROOM_BLOCK_WIDTH)));
                        zBound=new wsBound((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*config.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            xBound.add(doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                            xHallwayBound=new wsBound(lastRoom.xBound.max,(lastRoom.xBound.max+doorAdd));
                            zHallwayBound=new wsBound((lastRoom.zBound.min+doorOffset),((lastRoom.zBound.min+doorOffset)+config.ROOM_BLOCK_WIDTH));
                        }
                        
                        break;

                    case ROOM_SIDE_BOTTOM:
                        xBound=new wsBound((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*config.ROOM_BLOCK_WIDTH)));
                        zBound=new wsBound(lastRoom.zBound.max,(lastRoom.zBound.max+(zBlockSize*config.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            zBound.add(doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                            xHallwayBound=new wsBound((lastRoom.xBound.min+doorOffset),((lastRoom.xBound.min+doorOffset)+config.ROOM_BLOCK_WIDTH));
                            zHallwayBound=new wsBound(lastRoom.zBound.max,(lastRoom.zBound.max+doorAdd));
                        }
                        
                        break;

                }
                
                if (map.boxBoundCollision(xBound,null,zBound,MESH_FLAG_ROOM_WALL)===-1) break;

                tryCount++;
                if (tryCount>config.ROOM_MAX_CONNECT_TRY) return;
            }
        }

            // add in hallways and a light
            // if the hallway is long
            
        if (hallwayMode!==this.HALLWAY_NONE) {
            this.addHallwayRoom(connectSide,hallwayMode,xHallwayBound,zHallwayBound);
            if (hallwayMode===this.HALLWAY_LONG) this.addHallwayLight(xHallwayBound,zHallwayBound);
        }

            // the room
            
        roomIdx=this.addRegularRoom(xBlockSize,zBlockSize,xBound,zBound,false,ROOM_LEVEL_MAIN);
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
            
        if (map.rooms.length>=config.ROOM_PATH_COUNT) return;

            // next room in path
            
        hallwayMode=(genRandom.randomPercentage(config.ROOM_LONG_HALLWAY_PERCENTAGE))?this.HALLWAY_LONG:this.HALLWAY_SHORT;
            
        this.buildMapRoomPath(room,hallwayMode);
    }
    
        //
        // extend any of the rooms along the path
        //
    
    buildRoomExtensionSingle(lastRoom,connectSide)
    {
        var n,roomIdx,room,tryCount;
        var xBlockSize,zBlockSize;
        var connectSide,connectOffset;
        var xBound,yBound,zBound;
        var stairOffset,stairAdd,xStairBound,zStairBound;
        
            // level changes
            
        var storyAdd=config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH;
        var stairMode=this.STAIR_NONE;

        var level=ROOM_LEVEL_MAIN;
        yBound=lastRoom.yBound.copy();

        if (genRandom.randomPercentage(config.ROOM_LEVEL_CHANGE_PERCENTAGE)) {
            
            if (genRandom.randomPercentage(0.5)) {
                level=ROOM_LEVEL_UPPER;
                yBound.add(-storyAdd);
                stairMode=this.STAIR_UP;
            }
            else {
                level=ROOM_LEVEL_LOWER;
                yBound.add(storyAdd);
                stairMode=this.STAIR_DOWN;
            }
        }
   
            // get random block size for room
            // and make sure it stays under the max
            // blocks for room
        
        xBlockSize=genRandom.randomInt(config.ROOM_MIN_BLOCK_PER_SIDE,config.ROOM_MAX_BLOCK_PER_SIDE);
        zBlockSize=genRandom.randomInt(config.ROOM_MIN_BLOCK_PER_SIDE,config.ROOM_MAX_BLOCK_PER_SIDE);
        
        while ((xBlockSize*zBlockSize)>config.ROOM_MAX_BLOCK_COUNT) {
            if (xBlockSize>config.ROOM_MIN_BLOCK_PER_SIDE) xBlockSize--;
            if (zBlockSize>config.ROOM_MIN_BLOCK_PER_SIDE) zBlockSize--;
        }

            // connect to the previous
            // room by picking a side, and an offset into
            // that side

        tryCount=0;

        while (true) {

                // get random side and offset
                // we can start a new room half off the other
                // side and up the last room's side size


            if ((connectSide===ROOM_SIDE_LEFT) || (connectSide===ROOM_SIDE_RIGHT)) {
                connectOffset=genRandom.randomInt(-Math.trunc(zBlockSize*0.5),lastRoom.zBlockSize);
            }
            else {
                connectOffset=genRandom.randomInt(-Math.trunc(xBlockSize*0.5),lastRoom.xBlockSize);
            }
            connectOffset*=config.ROOM_BLOCK_WIDTH;

                // get new room bounds and move it around
                // if we need space for stairs

            stairAdd=config.ROOM_BLOCK_WIDTH*2;

            switch (connectSide) {

                case ROOM_SIDE_LEFT:
                    xBound=new wsBound((lastRoom.xBound.min-(xBlockSize*config.ROOM_BLOCK_WIDTH)),lastRoom.xBound.min);
                    zBound=new wsBound((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*config.ROOM_BLOCK_WIDTH)));

                    if (stairMode!==this.STAIR_NONE) {
                        xBound.add(-stairAdd);
                        stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                        xStairBound=new wsBound((lastRoom.xBound.min-stairAdd),lastRoom.xBound.min);
                        zStairBound=new wsBound((lastRoom.zBound.min+stairOffset),((lastRoom.zBound.min+stairOffset)+config.ROOM_BLOCK_WIDTH));
                    }

                    break;

                case ROOM_SIDE_TOP:
                    xBound=new wsBound((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*config.ROOM_BLOCK_WIDTH)));
                    zBound=new wsBound((lastRoom.zBound.min-(zBlockSize*config.ROOM_BLOCK_WIDTH)),lastRoom.zBound.min);

                    if (stairMode!==this.STAIR_NONE) {
                        zBound.add(-stairAdd);
                        stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                        xStairBound=new wsBound((lastRoom.xBound.min+stairOffset),((lastRoom.xBound.min+stairOffset)+config.ROOM_BLOCK_WIDTH));
                        zStairBound=new wsBound((lastRoom.zBound.min-stairAdd),lastRoom.zBound.min);
                    }

                    break;

                case ROOM_SIDE_RIGHT:
                    xBound=new wsBound(lastRoom.xBound.max,(lastRoom.xBound.max+(xBlockSize*config.ROOM_BLOCK_WIDTH)));
                    zBound=new wsBound((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*config.ROOM_BLOCK_WIDTH)));

                    if (stairMode!==this.STAIR_NONE) {
                        xBound.add(stairAdd);
                        stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                        xStairBound=new wsBound(lastRoom.xBound.max,(lastRoom.xBound.max+stairAdd));
                        zStairBound=new wsBound((lastRoom.zBound.min+stairOffset),((lastRoom.zBound.min+stairOffset)+config.ROOM_BLOCK_WIDTH));
                    }

                    break;

                case ROOM_SIDE_BOTTOM:
                    xBound=new wsBound((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*config.ROOM_BLOCK_WIDTH)));
                    zBound=new wsBound(lastRoom.zBound.max,(lastRoom.zBound.max+(zBlockSize*config.ROOM_BLOCK_WIDTH)));

                    if (stairMode!==this.STAIR_NONE) {
                        zBound.add(stairAdd);
                        stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                        xStairBound=new wsBound((lastRoom.xBound.min+stairOffset),((lastRoom.xBound.min+stairOffset)+config.ROOM_BLOCK_WIDTH));
                        zStairBound=new wsBound(lastRoom.zBound.max,(lastRoom.zBound.max+stairAdd));
                    }

                    break;

            }

            if (map.boxBoundCollision(xBound,null,zBound,MESH_FLAG_ROOM_WALL)===-1) break;

            tryCount++;
            if (tryCount>config.ROOM_MAX_CONNECT_TRY) return;
        }

            // add in any stairs
            
        if (stairMode!==this.STAIR_NONE) {
            this.addStairRoom(stairMode,connectSide,xStairBound,zStairBound);
            //this.addStairLight(xStairBound,zStairBound);
        }

            // the room
            
        var allowLiquid=true;
        if (lastRoom!==null) allowLiquid=!lastRoom.liquid;
            
        roomIdx=this.addRegularRoom(xBlockSize,zBlockSize,xBound,zBound,allowLiquid,level);
        this.currentRoomCount++;
        
        room=map.rooms[roomIdx];
        
            // if we are in a liquid, we need to make stairs out
            // to the connection point or complete stairs down into
            // the liquid (depending on the stair direction, it's either
            // this room or the previous room)
            
        switch (stairMode) {
            case this.STAIR_UP:
                if (lastRoom.liquid) this.addLiquidStairRoom(lastRoom,connectSide,xStairBound,zStairBound,false);
                break;
            case this.STAIR_DOWN:
                if (room.liquid) this.addLiquidStairRoom(room,connectSide,xStairBound,zStairBound,true);
                break;
        }
        
            // finally add the liquid
        
        if (room.liquid) map.addLiquid(new MapLiquidClass(map.getTexture(map.TEXTURE_TYPE_LIQUID),room));
        
            // mask off edges that have collided with
            // the newest room or stairs leading to a room
            // we use this mask to calculate ledges and other
            // outside wall hugging map pieces
        
        if (lastRoom!==null) {
            switch (stairMode) {
                case this.STAIR_UP:
                case this.STAIR_DOWN:
                    lastRoom.maskEdgeGridBlockToBounds(xStairBound,zStairBound);
                    room.maskEdgeGridBlockToBounds(xStairBound,zStairBound);
                    break;
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
        var n,room;
        var nRoom=map.rooms.length;
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            
                // we can add up to two rooms on
                // either side of the path

            switch(genRandom.randomIndex(4)) {
                case 1:
                    this.buildRoomExtensionSingle(room,ROOM_SIDE_LEFT);
                    break;          
                case 2:
                    this.buildRoomExtensionSingle(room,ROOM_SIDE_RIGHT);
                    break;          
                case 3:
                    this.buildRoomExtensionSingle(room,ROOM_SIDE_LEFT);
                    this.buildRoomExtensionSingle(room,ROOM_SIDE_RIGHT);
                    break;          
            }
        }
    }
    
        //
        // closets, platforms, ledges, pillars and decorations
        //
        
    buildRoomClosets()
    {
        var n,room,closet;
        var nRoom=map.rooms.length;
        
        if (!config.ROOM_CLOSETS) return;
        
        closet=new GenRoomClosetClass();
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            if (!room.liquid) closet.addCloset(room);
        }
    }
    
    buildRoomPlatforms()
    {
        var n,room,platform;
        var nRoom=map.rooms.length;
        
        if (!config.ROOM_PLATFORMS) return;
        
        platform=new GenRoomPlatformClass();
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            if ((room.storyCount>1) && (room.level===0)) platform.createPlatforms(room);
        }
    }
    
    buildRoomLedges()
    {
        var n,room,ledge;
        var nRoom=map.rooms.length;
        
        if (!config.ROOM_LEDGES) return;
        
        ledge=new GenRoomLedgeClass();
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            if (!room.liquid) ledge.createLedges(room);
        }
    }
    
    buildRoomPillars()
    {
        var n,room,pillar;
        var nRoom=map.rooms.length;
        
        if (!config.ROOM_PILLARS) return;
        
        pillar=new GenRoomPillarClass();
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            if ((!room.openCeiling) && (!room.liquid)) pillar.addPillars(room);
        }
    }
        
    buildRoomDecorations()
    {
        var n,room,decoration;
        var nRoom=map.rooms.length;
        
        if (!config.ROOM_DECORATIONS) return;
        
        decoration=new GenRoomDecorationClass();
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            if (!room.liquid) decoration.addDecorations(room);
        }
    }

        //
        // build map mainline
        //

    build()
    {
        view.loadingScreenDraw(0.5);
        setTimeout(this.buildMapPath.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapPath()
    {
            // start the recursive
            // room adding

        this.currentRoomCount=0;
        
        this.buildMapRoomPath(null,this.HALLWAY_NONE);
        
        view.loadingScreenDraw(0.1);
        setTimeout(this.buildMapExtensions.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapExtensions()
    {
            // start the recursive
            // room adding

        this.currentRoomCount=0;
        
        this.buildRoomExtensions();
        
        view.loadingScreenDraw(0.2);
        setTimeout(this.buildMapClosets.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapClosets()
    {
            // build room closets
            
        this.buildRoomClosets();
        
            // finish with the callback

        view.loadingScreenDraw(0.3);
        setTimeout(this.buildMapPlatforms.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapPlatforms()
    {
            // build room platforms
            
        this.buildRoomPlatforms();
        
            // finish with the callback

        view.loadingScreenDraw(0.4);
        setTimeout(this.buildMapLedges.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapLedges()
    {
            // build room platforms
            
        this.buildRoomLedges();
        
            // finish with the callback

        view.loadingScreenDraw(0.5);
        setTimeout(this.buildMapRemoveSharedTriangles1.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapRemoveSharedTriangles1()
    {
             // we do this in separate passes as some polygons
            // shouldn't remove others, and vice versa.  first
            // remove all the shared trigs between rooms and
            // remove them both
            
        this.removeSharedTrianglesChunk(MESH_FLAG_ROOM_WALL,MESH_FLAG_ROOM_WALL,true,true);
        
            // finish with the callback
            
        view.loadingScreenDraw(0.6);
        setTimeout(this.buildMapRemoveSharedTriangles2.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    
    buildMapRemoveSharedTriangles2()
    {
            // now remove any platforms or ledges that are equal
            // in another platform or ledge wall
            
        this.removeSharedTrianglesChunk(MESH_FLAG_PLATFORM,MESH_FLAG_PLATFORM,true,true);
        this.removeSharedTrianglesChunk(MESH_FLAG_LEDGE,MESH_FLAG_LEDGE,true,true);
        
            // finish with the callback
            
        view.loadingScreenDraw(0.7);
        setTimeout(this.buildMapRemoveSharedTriangles3.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    buildMapRemoveSharedTriangles3()
    {
            // and finally remove any platform or ledge triangles that
            // are enclosed by an outer wall
            
        this.removeSharedTrianglesChunk(MESH_FLAG_PLATFORM,MESH_FLAG_ROOM_WALL,false,false);
        this.removeSharedTrianglesChunk(MESH_FLAG_LEDGE,MESH_FLAG_ROOM_WALL,false,false);
        
            // finish with the callback
            
        view.loadingScreenDraw(0.8);
        setTimeout(this.buildMapDecorations.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapDecorations()
    {
            // build room pillars and decorations
        
        this.buildRoomPillars();
        this.buildRoomDecorations();
        
            // finish with the callback
            
        view.loadingScreenDraw(0.9);
        setTimeout(this.buildMapFinish.bind(this),PROCESS_TIMEOUT_MSEC);
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
