"use strict";

//
// generate map class
//

class GenMapClass
{
    constructor(genRandom,callbackFunc)
    {
        this.genRandom=genRandom;

        this.currentRoomCount=0;

            // the callback function when
            // generation concludes

        this.callbackFunc=callbackFunc;
        
        Object.seal(this);
    }
    
        //
        // remove shared triangles
        //

    removeSharedTriangles()
    {
        var n,k,t1,t2,nMesh,hit;
        var bounds,otherBounds;
        var mesh,otherMesh;

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
            
        nMesh=map.meshes.length;
        
        var targetMeshCount=0;
        var targetMeshList=new Uint16Array(nMesh);

        for (n=0;n!==nMesh;n++) {
            mesh=map.meshes[n];
            if ((mesh.flag!==MESH_FLAG_ROOM_WALL) && (mesh.flag!==MESH_FLAG_LEDGE)) continue;
            
                // build a list of meshes that
                // are targets for trig eliminations from
                // this mesh
            
            targetMeshCount=0;
            
            for (k=(n+1);k<nMesh;k++) {
                otherMesh=map.meshes[k];
                if ((otherMesh.flag!==MESH_FLAG_ROOM_WALL) && (otherMesh.flag!==MESH_FLAG_LEDGE)) continue;
                
                if (mesh.boxTouchOtherMesh(otherMesh)) targetMeshList[targetMeshCount++]=k;
            }
            
            if (targetMeshCount===0) continue;
                
                // now run through the triangles

            for (t1=0;t1!==mesh.trigCount;t1++) {
                
                if (!mesh.isTriangleStraightWall(t1)) continue;
                bounds=mesh.getTriangleBounds(t1);

                hit=false;

                for (k=0;k!==targetMeshCount;k++) {
                    otherMesh=map.meshes[targetMeshList[k]];

                    for (t2=0;t2!==otherMesh.trigCount;t2++) {

                        if (!otherMesh.isTriangleStraightWall(t2)) continue;
                        otherBounds=otherMesh.getTriangleBounds(t2);
                        
                        if ((bounds[0].min===otherBounds[0].min) && (bounds[0].max===otherBounds[0].max) && (bounds[1].min===otherBounds[1].min) && (bounds[1].max===otherBounds[1].max) && (bounds[2].min===otherBounds[2].min) && (bounds[2].max===otherBounds[2].max)) {
                            trigList.push([n,t1]);
                            trigList.push([targetMeshList[k],t2]);
                            hit=true;
                            break;
                        }
                    }

                    if (hit) break;
                }
            }
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

    addRegularRoom(xBlockSize,zBlockSize,xBound,yBound,zBound,lastLiquid,level)
    {
        var n,mesh,mesh2;
        var storyCount,yStoryBound,yFloorBound;
        var roomIdx,room;
        var hasStories;
        var roomBitmap=bitmapList.getBitmap('Map Wall');
        
            // stories, platforms, and ledges
            
        if (level===0) {
            hasStories=true;
        }
        else {
            hasStories=this.genRandom.randomPercentage(config.ROOM_UPPER_TALL_PERCENTAGE);
        }
            
            // add this room to the tracking room list so
            // we can use it later to add entities and decorations and such

        roomIdx=map.addRoom(xBlockSize,zBlockSize,xBound,yBound,zBound,hasStories,level);
        room=map.rooms[roomIdx];
        
            // liquid flags and floor
        
        room.liquid=(config.ROOM_LIQUIDS)&&(this.genRandom.randomPercentage(config.ROOM_LIQUID_PERCENTAGE))&&(room.level!==1)&&(!lastLiquid);
        room.createMeshFloor(bitmapList.getBitmap('Map Floor'),yBound);

            // walls
            
        storyCount=hasStories?2:1;
        yStoryBound=yBound.copy();
            
        for (n=0;n!==storyCount;n++) {
            mesh=room.createMeshWalls(roomBitmap,yStoryBound);

            yFloorBound=new wsBound((yStoryBound.min-config.ROOM_FLOOR_DEPTH),yStoryBound.min);
            mesh2=room.createMeshWalls(roomBitmap,yFloorBound);
            mesh.combineMesh(mesh2);
            
            map.addMesh(mesh);
            if (n===0) map.addOverlayRoom(room);
            
            yStoryBound.add(-(yBound.getSize()+config.ROOM_FLOOR_DEPTH));
        }
        
            // the ceiling
        
        room.openCeiling=(this.genRandom.randomPercentage(0.5))&&(room.level!==0);
        room.createMeshCeiling(bitmapList.getBitmap('Map Ceiling'),yFloorBound);
        
        return(roomIdx);
    }

    addStairRoom(connectSide,xStairBound,yStairBound,zStairBound,flipDirection,level)
    {
        var genRoomStairs=new GenRoomStairsClass(this.genRandom);
        
            // flip the direction if going down
            
        if (flipDirection) {
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
            
            yStairBound.add(-yStairBound.getSize());
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
        // doors and liquid steps
        //
        
    addDoorRoom(connectSide,xDoorBound,yDoorBound,zDoorBound)
    {
            // build the door
            
        var genRoomDoor=new GenRoomDoorClass(this.genRandom);
        
        if ((connectSide===ROOM_SIDE_LEFT) || (connectSide===ROOM_SIDE_RIGHT)) {
            genRoomDoor.createDoorX(xDoorBound,yDoorBound,zDoorBound);
        }
        else {
            genRoomDoor.createDoorZ(xDoorBound,yDoorBound,zDoorBound);
        }
        
            // add to overlay
            
        map.addOverlayConnection(xDoorBound,zDoorBound);
    }
    
    addLiquidStairRoom(room,connectSide,xBound,zBound,flip)
    {
        var xStairBound,zStairBound;
        var yStairBound=new wsBound(room.yBound.max,(room.yBound.max+config.ROOM_BLOCK_WIDTH));
        var genRoomStairs=new GenRoomStairsClass(this.genRandom);
        
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
            map.addMesh(MeshPrimitivesClass.createMeshPryamid(bitmapList.getBitmap('Map Metal'),xFixtureBound,yFixtureBound,zFixtureBound,MESH_FLAG_LIGHT));
        }
        
            // the color

        red=config.MAP_LIGHT_RGB_MINIMUM+(this.genRandom.random()*config.MAP_LIGHT_RGB_MINIMUM_EXTRA);
        if (config.MAP_LIGHT_ALWAYS_WHITE) {
            green=blue=red;
        }
        else {
            green=config.MAP_LIGHT_RGB_MINIMUM+(this.genRandom.random()*config.MAP_LIGHT_RGB_MINIMUM_EXTRA);
            blue=config.MAP_LIGHT_RGB_MINIMUM+(this.genRandom.random()*config.MAP_LIGHT_RGB_MINIMUM_EXTRA);
        }
        
            // the exponent
            
        var exponent=config.MAP_LIGHT_EXPONENT_MINIMUM+(this.genRandom.random()*config.MAP_LIGHT_EXPONENT_EXTRA);

            // add light to map

        map.addLight(new MapLightClass(lightPos,new wsColor(red,green,blue),config.MAP_GENERATE_LIGHTMAP,intensity,exponent));
    }
    
    addRoomLight(roomIdx)
    {
        var lightY,fixturePos,lightPos,intensity;
        var room=map.rooms[roomIdx];
        
            // locations
            
        lightY=room.yBound.min-config.ROOM_FLOOR_DEPTH;
        if (room.hasStories) lightY-=(room.yBound.getSize()+config.ROOM_FLOOR_DEPTH);
        
        fixturePos=new wsPoint(room.xBound.getMidPoint(),lightY,room.zBound.getMidPoint());
        lightPos=new wsPoint(fixturePos.x,(room.openCeiling?(fixturePos.y-100):(fixturePos.y+1100)),fixturePos.z);
        
            // intensity
            
        intensity=Math.trunc((room.xBound.getSize()+room.zBound.getSize())*0.25);   // it's a radius, so 0.5 for half, 0.5 for radius
        
        intensity*=(config.MAP_LIGHT_FACTOR+(this.genRandom.random()*config.MAP_LIGHT_FACTOR_EXTRA));
        if (room.hasStories) intensity*=config.MAP_LIGHT_TWO_STORY_BOOST;
        
            // create the light
            
        this.addGeneralLight(lightPos,(room.openCeiling?null:fixturePos),intensity);
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
        offset=this.genRandom.randomIndex(count)*config.ROOM_BLOCK_WIDTH;
        if (bound1.min<bound2.min) offset+=(bound2.min-bound1.min);           // need to align offset with bounds1
        
        return(offset);
    }

        //
        // build map recursive room
        //

    buildMapRecursiveRoom(recurseCount,lastRoom,yLastBound,connectionMode,level,depth)
    {
        var n,roomIdx,room,tryCount;
        var xBlockSize,zBlockSize;
        var connectSide,connectOffset;
        var xBound,yBound,zBound;
        var stairOffset,stairAdd,xStairBound,yStairBound,zStairBound;
        var doorOffset,doorAdd,xDoorBound,yDoorBound,zDoorBound;

            // get random block size for room
            // and make sure it stays under the max
            // blocks for room
        
        xBlockSize=this.genRandom.randomInt(config.ROOM_MIN_BLOCK_PER_SIDE,config.ROOM_MAX_BLOCK_PER_SIDE);
        zBlockSize=this.genRandom.randomInt(config.ROOM_MIN_BLOCK_PER_SIDE,config.ROOM_MAX_BLOCK_PER_SIDE);
        
        while ((xBlockSize*zBlockSize)>config.ROOM_MAX_BLOCK_COUNT) {
            if (xBlockSize>config.ROOM_MIN_BLOCK_PER_SIDE) xBlockSize--;
            if (zBlockSize>config.ROOM_MIN_BLOCK_PER_SIDE) zBlockSize--;
        }

            // can only have a single level
            // change from a room
            
        var noCurrentLevelChange=true;

            // get room location
            // if we don't have a previous room,
            // then it's the first room and it's
            // centered in the map

        if (lastRoom===null) {
            var mapMid=Math.trunc(view.OPENGL_FAR_Z/2);

            var halfSize=Math.trunc((xBlockSize/2)*config.ROOM_BLOCK_WIDTH);
            xBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));

            var halfSize=Math.trunc(config.ROOM_FLOOR_HEIGHT/2);
            yBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));

            var halfSize=Math.trunc((zBlockSize/2)*config.ROOM_BLOCK_WIDTH);
            zBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));
        }

            // otherwise we connect to the previous
            // room by picking a side, and an offset into
            // that side

        else {

            tryCount=0;
            
            while (true) {
                
                    // get random side and offset
                    // we can start a new room half off the other
                    // side and up the last room's side size

                connectSide=this.genRandom.randomIndex(4);
                if ((connectSide===ROOM_SIDE_LEFT) || (connectSide===ROOM_SIDE_RIGHT)) {
                    connectOffset=this.genRandom.randomInt(-Math.trunc(zBlockSize*0.5),lastRoom.zBlockSize);
                }
                else {
                    connectOffset=this.genRandom.randomInt(-Math.trunc(xBlockSize*0.5),lastRoom.xBlockSize);
                }
                connectOffset*=config.ROOM_BLOCK_WIDTH;
                
                    // get new room bounds and move it around
                    // if we need space for stairs or doors
                
                stairAdd=config.ROOM_BLOCK_WIDTH*2;
                doorAdd=config.ROOM_BLOCK_WIDTH;
                
                switch (connectSide) {

                    case ROOM_SIDE_LEFT:
                        xBound=new wsBound((lastRoom.xBound.min-(xBlockSize*config.ROOM_BLOCK_WIDTH)),lastRoom.xBound.min);
                        zBound=new wsBound((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*config.ROOM_BLOCK_WIDTH)));
                        
                        switch (connectionMode) {
                            case ROOM_CONNECT_MODE_UP:
                            case ROOM_CONNECT_MODE_DOWN:
                                xBound.add(-stairAdd);
                                stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                                xStairBound=new wsBound((lastRoom.xBound.min-stairAdd),lastRoom.xBound.min);
                                zStairBound=new wsBound((lastRoom.zBound.min+stairOffset),((lastRoom.zBound.min+stairOffset)+config.ROOM_BLOCK_WIDTH));
                                break;
                            case ROOM_CONNECT_MODE_DOOR:
                                xBound.add(-doorAdd);
                                doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                                xDoorBound=new wsBound((lastRoom.xBound.min-doorAdd),lastRoom.xBound.min);
                                zDoorBound=new wsBound((lastRoom.zBound.min+doorOffset),((lastRoom.zBound.min+doorOffset)+config.ROOM_BLOCK_WIDTH));
                                break;
                        }
                        
                        break;

                    case ROOM_SIDE_TOP:
                        xBound=new wsBound((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*config.ROOM_BLOCK_WIDTH)));
                        zBound=new wsBound((lastRoom.zBound.min-(zBlockSize*config.ROOM_BLOCK_WIDTH)),lastRoom.zBound.min);
                        
                        switch (connectionMode) {
                            case ROOM_CONNECT_MODE_UP:
                            case ROOM_CONNECT_MODE_DOWN:
                                zBound.add(-stairAdd);
                                stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                                xStairBound=new wsBound((lastRoom.xBound.min+stairOffset),((lastRoom.xBound.min+stairOffset)+config.ROOM_BLOCK_WIDTH));
                                zStairBound=new wsBound((lastRoom.zBound.min-stairAdd),lastRoom.zBound.min);
                                break;
                            case ROOM_CONNECT_MODE_DOOR:
                                zBound.add(-doorAdd);
                                doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                                xDoorBound=new wsBound((lastRoom.xBound.min+doorOffset),((lastRoom.xBound.min+doorOffset)+config.ROOM_BLOCK_WIDTH));
                                zDoorBound=new wsBound((lastRoom.zBound.min-doorAdd),lastRoom.zBound.min);
                                break;
                        }
                        
                        break;

                    case ROOM_SIDE_RIGHT:
                        xBound=new wsBound(lastRoom.xBound.max,(lastRoom.xBound.max+(xBlockSize*config.ROOM_BLOCK_WIDTH)));
                        zBound=new wsBound((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*config.ROOM_BLOCK_WIDTH)));
                        
                        switch (connectionMode) {
                            case ROOM_CONNECT_MODE_UP:
                            case ROOM_CONNECT_MODE_DOWN:
                                xBound.add(stairAdd);
                                stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                                xStairBound=new wsBound(lastRoom.xBound.max,(lastRoom.xBound.max+stairAdd));
                                zStairBound=new wsBound((lastRoom.zBound.min+stairOffset),((lastRoom.zBound.min+stairOffset)+config.ROOM_BLOCK_WIDTH));
                                break;
                            case ROOM_CONNECT_MODE_DOOR:
                                xBound.add(doorAdd);
                                doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                                xDoorBound=new wsBound(lastRoom.xBound.max,(lastRoom.xBound.max+doorAdd));
                                zDoorBound=new wsBound((lastRoom.zBound.min+doorOffset),((lastRoom.zBound.min+doorOffset)+config.ROOM_BLOCK_WIDTH));
                                break;
                        }
                        
                        break;

                    case ROOM_SIDE_BOTTOM:
                        xBound=new wsBound((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*config.ROOM_BLOCK_WIDTH)));
                        zBound=new wsBound(lastRoom.zBound.max,(lastRoom.zBound.max+(zBlockSize*config.ROOM_BLOCK_WIDTH)));
                        
                        switch (connectionMode) {
                            case ROOM_CONNECT_MODE_UP:
                            case ROOM_CONNECT_MODE_DOWN:
                                zBound.add(stairAdd);
                                stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                                xStairBound=new wsBound((lastRoom.xBound.min+stairOffset),((lastRoom.xBound.min+stairOffset)+config.ROOM_BLOCK_WIDTH));
                                zStairBound=new wsBound(lastRoom.zBound.max,(lastRoom.zBound.max+stairAdd));
                                break;
                            case ROOM_CONNECT_MODE_DOOR:
                                zBound.add(doorAdd);
                                doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                                xDoorBound=new wsBound((lastRoom.xBound.min+doorOffset),((lastRoom.xBound.min+doorOffset)+config.ROOM_BLOCK_WIDTH));
                                zDoorBound=new wsBound(lastRoom.zBound.max,(lastRoom.zBound.max+doorAdd));
                                break;
                        }
                        
                        break;

                }
                
                if (map.boxBoundCollision(xBound,null,zBound,MESH_FLAG_ROOM_WALL)===-1) break;

                tryCount++;
                if (tryCount>config.ROOM_MAX_CONNECT_TRY) return;
            }
            
                // bounds now the same as last room
                // until any level changes
                
            yBound=yLastBound.copy();
        }

            // add in any stairs or doors
            
        switch (connectionMode) {
            case ROOM_CONNECT_MODE_UP:
            case ROOM_CONNECT_MODE_DOWN:
                yStairBound=new wsBound(yBound.max,(yBound.max+(yBound.getSize()+config.ROOM_FLOOR_DEPTH)));
                this.addStairRoom(connectSide,xStairBound,yStairBound,zStairBound,(connectionMode===ROOM_CONNECT_MODE_DOWN),level);
                this.addStairLight(xStairBound,yStairBound,zStairBound);
                break;
            case ROOM_CONNECT_MODE_DOOR:
                yDoorBound=new wsBound(yBound.max,(yBound.max-config.ROOM_FLOOR_HEIGHT));
                this.addDoorRoom(connectSide,xDoorBound,yDoorBound,zDoorBound);
                break;
        }

            // the room
            
        var lastLiquid=false;
        if (lastRoom!==null) lastLiquid=lastRoom.liquid;
            
        roomIdx=this.addRegularRoom(xBlockSize,zBlockSize,xBound,yBound,zBound,lastLiquid,level);
        this.currentRoomCount++;
        
        room=map.rooms[roomIdx];
        
            // mark off any doors we made
            
        if (connectionMode===ROOM_CONNECT_MODE_DOOR) {
            lastRoom.markDoorOnConnectionSide(connectSide,false);
            room.markDoorOnConnectionSide(connectSide,true);
        }
        
            // if we are in a liquid, we need to make stairs out
            // to the connection point or complete stairs down into
            // the liquid (depending on the stair direction, it's either
            // this room or the previous room)
            
        switch (connectionMode) {
            case ROOM_CONNECT_MODE_UP:
                if (lastRoom.liquid) this.addLiquidStairRoom(lastRoom,connectSide,xStairBound,zStairBound,false);
                break;
            case ROOM_CONNECT_MODE_DOWN:
                if (room.liquid) this.addLiquidStairRoom(room,connectSide,xStairBound,zStairBound,true);
                break;
            case ROOM_CONNECT_MODE_DOOR:
                if (room.liquid) this.addLiquidStairRoom(room,connectSide,xDoorBound,zDoorBound,true);
                if (lastRoom.liquid) this.addLiquidStairRoom(lastRoom,connectSide,xDoorBound,zDoorBound,false);
                break;
        }
        
            // finally add the liquid
        
        if (room.liquid) map.addLiquid(new MapLiquidClass(bitmapList.getBitmap('Map Liquid'),room));
        
            // mask off edges that have collided with
            // the newest room or stairs leading to a room
            // we use this mask to calculate ledges and other
            // outside wall hugging map pieces
        
        if (lastRoom!==null) {
            switch (connectionMode) {
                case ROOM_CONNECT_MODE_UP:
                case ROOM_CONNECT_MODE_DOWN:
                    lastRoom.maskEdgeGridBlockToBounds(xStairBound,yStairBound,zStairBound);
                    room.maskEdgeGridBlockToBounds(xStairBound,yStairBound,zStairBound);
                    break;
                case ROOM_CONNECT_MODE_DOOR:
                    lastRoom.maskEdgeGridBlockToBounds(xDoorBound,yDoorBound,zDoorBound);
                    room.maskEdgeGridBlockToBounds(xDoorBound,yDoorBound,zDoorBound);
                    break;
                default:
                    lastRoom.maskEdgeGridBlockToRoom(room);
                    room.maskEdgeGridBlockToRoom(lastRoom);
                    break;
            }
        }
        
            // add the room light

        this.addRoomLight(roomIdx);
        
            // start recursing for more rooms
            // we try a couple times to find a place
            // for the next room
            
        var nextLevel;
        var nextConnectionMode;
        var yNextBound;
        var storyAdd=yBound.getSize()+config.ROOM_FLOOR_DEPTH;
            
        for (n=0;n!==config.ROOM_MAX_CONNECTION_COUNT;n++) {
            
                // detect any level changes, we
                // can only have one per room
                
            nextLevel=level;
            nextConnectionMode=ROOM_CONNECT_MODE_NONE;
            yNextBound=yBound.copy();
                
            if (noCurrentLevelChange) {

                if (this.genRandom.randomPercentage(config.ROOM_LEVEL_CHANGE_PERCENTAGE)) {

                        // change level, we only have
                        // two levels to keep map crossing
                        // over itself

                    if (level===0) {
                        nextLevel=1;
                        yNextBound.add(-storyAdd);
                        nextConnectionMode=ROOM_CONNECT_MODE_UP;
                    }
                    else {
                        nextLevel=0;
                        yNextBound.add(storyAdd);
                        nextConnectionMode=ROOM_CONNECT_MODE_DOWN;
                    }

                        // only one level change
                        // away from a room at a time

                    noCurrentLevelChange=false;
                }
            }
            
                // if no level change, check for a door
                
            if (nextConnectionMode===ROOM_CONNECT_MODE_NONE) {
                if (this.genRandom.randomPercentage(config.ROOM_DOOR_PERCENTAGE)) nextConnectionMode=ROOM_CONNECT_MODE_DOOR;
            }
            
                // recurse to next room
            
            if ((depth+1)<config.ROOM_MAX_RECURSION_DEPTH) this.buildMapRecursiveRoom((recurseCount+1),room,yNextBound,nextConnectionMode,nextLevel,(depth+1));
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
        
        closet=new GenRoomClosetClass(this.genRandom);
        
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
        
        platform=new GenRoomPlatformClass(this.genRandom);
        
        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            if ((room.hasStories) && (room.level===0)) platform.createPlatforms(room);
        }
    }
    
    buildRoomLedges()
    {
        var n,room,ledge;
        var nRoom=map.rooms.length;
        
        if (!config.ROOM_LEDGES) return;
        
        ledge=new GenRoomLedgeClass(this.genRandom);
        
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
        
        pillar=new GenRoomPillarClass(this.genRandom);
        
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
        
        decoration=new GenRoomDecorationClass(this.genRandom);
        
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
        view.loadingScreenDraw(0.12);
        setTimeout(this.buildMapRooms.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapRooms()
    {
            // start the recursive
            // room adding

        this.currentRoomCount=0;
        
        this.buildMapRecursiveRoom(0,null,null,ROOM_CONNECT_MODE_NONE,0,0);
        
        view.loadingScreenDraw(0.24);
        setTimeout(this.buildMapClosets.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapClosets()
    {
            // build room closets
            
        this.buildRoomClosets();
        
            // finish with the callback

        view.loadingScreenDraw(0.36);
        setTimeout(this.buildMapPlatforms.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapPlatforms()
    {
            // build room platforms
            
        this.buildRoomPlatforms();
        
            // finish with the callback

        view.loadingScreenDraw(0.48);
        setTimeout(this.buildMapLedges.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapLedges()
    {
            // build room platforms
            
        this.buildRoomLedges();
        
            // finish with the callback

        view.loadingScreenDraw(0.60);
        setTimeout(this.buildMapRemoveSharedTriangles.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapRemoveSharedTriangles()
    {
            // delete any shared triangles

        this.removeSharedTriangles();
        
            // finish with the callback
            
        view.loadingScreenDraw(0.72);
        setTimeout(this.buildMapDecorations.bind(this),PROCESS_TIMEOUT_MSEC);
    }
    
    buildMapDecorations()
    {
            // build room pillars and decorations
        
        this.buildRoomPillars();
        this.buildRoomDecorations();
        
            // finish with the callback
            
        view.loadingScreenDraw(0.84);
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
