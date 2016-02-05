"use strict";

//
// generate map class
//

function GenMapObject(view,map,genRandom,callbackFunc)
{
    this.view=view;
    this.map=map;
    this.genRandom=genRandom;
    
    this.currentRoomCount=0;
    
        // the callback function when
        // generation concludes
        
    this.callbackFunc=callbackFunc;
    
        // a link to this object so we can
        // use it in the "this" callbacks
        
    var currentGlobalGenMapObject;

        //
        // remove shared triangles
        //

    this.removeSharedTriangles=function()
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
            
        nMesh=this.map.meshes.length;
        
        var targetMeshCount=0;
        var targetMeshList=new Uint16Array(nMesh);

        for (n=0;n!==nMesh;n++) {
            mesh=this.map.meshes[n];
            if (mesh.flag!==MESH_FLAG_ROOM_WALL) continue;
            
                // build a list of meshes that
                // are targets for trig eliminations from
                // this mesh
            
            targetMeshCount=0;
            
            for (k=(n+1);k<nMesh;k++) {
                otherMesh=this.map.meshes[k];
                if (otherMesh.flag!==MESH_FLAG_ROOM_WALL) continue;
                
                if (mesh.boxTouchOtherMesh(otherMesh)) targetMeshList[targetMeshCount++]=k;
            }
            
            if (targetMeshCount===0) continue;
                
                // now run through the triangles

            for (t1=0;t1!==mesh.trigCount;t1++) {
                
                if (!mesh.isTriangleStraightWall(t1)) continue;
                bounds=mesh.getTriangleBounds(t1);

                hit=false;

                for (k=0;k!==targetMeshCount;k++) {
                    otherMesh=this.map.meshes[targetMeshList[k]];

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
            this.map.meshes[aTrig[0]].removeTriangle(aTrig[1]);

                // shift other indexes

            for (k=n;k<nTrig;k++) {
                bTrig=trigList[k];
                if (aTrig[0]===bTrig[0]) {
                    if (aTrig[1]<bTrig[1]) bTrig[1]--;
                }
            }
        }
    };

        //
        // create rooms
        //

    this.addRegularRoom=function(xBlockSize,zBlockSize,xBound,yBound,zBound,level)
    {
        var roomBitmap=this.map.getBitmapById(TEXTURE_WALL);
        
            // stories and platforms
            
        var hasStories=false;
        var hasPlatforms=false;
        
        if (level===0) {
            hasStories=true;
            hasPlatforms=((hasStories) && (ROOM_PLATFORMS));
        }
        else {
            hasStories=this.genRandom.randomPercentage(ROOM_UPPER_TALL_PERCENTAGE);
            hasPlatforms=false;
        }
            
            // add this room to the tracking room list so
            // we can use it later to add entities and decorations and such

        var roomIdx=this.map.addRoom(xBlockSize,zBlockSize,xBound,yBound,zBound,hasStories,level);
        var room=this.map.rooms[roomIdx];
        
            // floor
            
        this.map.addMesh(room.createMeshFloorOrCeiling(this.map.getBitmapById(TEXTURE_FLOOR),yBound,true,MESH_FLAG_ROOM_FLOOR));

            // walls
            
        var n,mesh,mesh2;
        var storyCount=hasStories?2:1;
        var yStoryBound=yBound.copy();
        var yFloorBound;
        
        for (n=0;n!==storyCount;n++) {
            mesh=room.createMeshWalls(roomBitmap,yStoryBound,MESH_FLAG_ROOM_WALL);

            yFloorBound=new wsBound((yStoryBound.min-ROOM_FLOOR_DEPTH),yStoryBound.min);
            mesh2=room.createMeshWalls(roomBitmap,yFloorBound,MESH_FLAG_ROOM_WALL);
            mesh.combineMesh(mesh2);
            
            this.map.addMesh(mesh);
            if (n===0) this.map.addOverlayRoom(room);
            
            yStoryBound.add(-(yBound.getSize()+ROOM_FLOOR_DEPTH));
        }
        
            // platforms
            
        if (hasPlatforms) {
            var genRoomPlatform=new GenRoomPlatform(this.map,this.genRandom,this.map.rooms[roomIdx]);
            genRoomPlatform.createPlatforms(xBound,yBound,zBound);
        }
        
            // the ceiling
            
        this.map.addMesh(room.createMeshFloorOrCeiling(this.map.getBitmapById(TEXTURE_CEILING),yFloorBound,false,MESH_FLAG_ROOM_CEILING));
        
        return(roomIdx);
    };

    this.addStairRoom=function(connectSide,xStairBound,yStairBound,zStairBound,flipDirection,level)
    {
        var genRoomStairs=new GenRoomStairs(this.map,this.genRandom);

        var roomBitmap=this.map.getBitmapById(TEXTURE_WALL);
        var stairBitmap=this.map.getBitmapById(TEXTURE_STAIR);
        
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
                genRoomStairs.createStairsX(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,false,false,false);
                break;
                
            case ROOM_SIDE_TOP:
                genRoomStairs.createStairsZ(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,false,false,false);
                break;
                
            case ROOM_SIDE_RIGHT:
                genRoomStairs.createStairsX(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,false,false,true);
                break;
                
            case ROOM_SIDE_BOTTOM:
                genRoomStairs.createStairsZ(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,false,false,true);
                break;
                
        }
        
            // add to overlay
            
        this.map.addOverlayStair(xStairBound,zStairBound);
    };

    this.addLight=function(roomIdx)
    {
        var lightX,lightY,lightZ;
        var red,green,blue;
        var room=this.map.rooms[roomIdx];
        
            // light point

        lightX=room.xBound.getMidPoint();
        lightZ=room.zBound.getMidPoint();
        
        lightY=room.yBound.min-ROOM_FLOOR_DEPTH;
        if (room.hasStories) lightY-=(room.yBound.getSize()+ROOM_FLOOR_DEPTH);

            // light fixture

        var xLightBound=new wsBound((lightX-400),(lightX+400));
        var yLightBound=new wsBound(lightY,(lightY+1000));
        var zLightBound=new wsBound((lightZ-400),(lightZ+400));
        this.map.addMesh(meshPrimitives.createMeshPryamid(this.map.getBitmapById(TEXTURE_LIGHT),xLightBound,yLightBound,zLightBound,MESH_FLAG_LIGHT));

            // get light intensity and point

        var intensity=room.xBound.getSize();
        var zSize=room.zBound.getSize();
        if (zSize>intensity) intensity=zSize;
        
        intensity*=(MAP_LIGHT_FACTOR+(this.genRandom.random()*MAP_LIGHT_FACTOR_EXTRA));
        if (room.hasStories) intensity*=MAP_LIGHT_TWO_STORY_BOOST;

        var pt=new wsPoint(lightX,(lightY+1100),lightZ);

            // the color

        red=MAP_LIGHT_RGB_MINIMUM+(this.genRandom.random()*MAP_LIGHT_RGB_MINIMUM_EXTRA);
        if (MAP_LIGHT_ALWAYS_WHITE) {
            green=blue=red;
        }
        else {
            green=MAP_LIGHT_RGB_MINIMUM+(this.genRandom.random()*MAP_LIGHT_RGB_MINIMUM_EXTRA);
            blue=MAP_LIGHT_RGB_MINIMUM+(this.genRandom.random()*MAP_LIGHT_RGB_MINIMUM_EXTRA);
        }
        
            // the exponent
            
        var exponent=MAP_LIGHT_EXPONENT_MINIMUM+(this.genRandom.random()*MAP_LIGHT_EXPONENT_EXTRA);

            // add light to map

        this.map.addLight(new MapLightObject(pt,new wsColor(red,green,blue),MAP_GENERATE_LIGHTMAP,intensity,exponent));
    };
    
        //
        // finds a single random block offset between two bounds
        //
        
    this.findRandomBlockOffsetBetweenTwoBounds=function(bound1,bound2)
    {
        var count;
        var min=bound1.min;
        var max=bound1.max;
        
        if (bound2.min>min) min=bound2.min;
        if (bound2.max<max) max=bound2.max;
        
        count=Math.floor((max-min)/ROOM_BLOCK_WIDTH);
        return(this.genRandom.randomIndex(count)*ROOM_BLOCK_WIDTH);
    };

        //
        // build map recursive room
        //

    this.buildMapRecursiveRoom=function(recurseCount,lastRoomIdx,stairMode,xConnectBound,yConnectBound,zConnectBound,level)
    {
        var n,tryCount;
        var xBlockSize,zBlockSize;

            // get random piece
            // unless recurse count is 0, then always
            // start with square
            
        xBlockSize=10;
        zBlockSize=10;

        this.currentRoomCount++;
        
            // can only have a single level
            // change from a room
            
        var noCurrentLevelChange=true;

            // get room location
            // if we don't have a previous room,
            // then it's the first room and it's
            // centered in the map

        var xBound,yBound,zBound;
        var xStairBound,yStairBound,zStairBound;

        if (lastRoomIdx===-1) {
            var mapMid=this.view.OPENGL_FAR_Z/2;

            var halfSize=Math.floor(ROOM_DIMENSIONS[0]/2);
            xBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));

            var halfSize=Math.floor(ROOM_DIMENSIONS[1]/2);
            yBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));

            var halfSize=Math.floor(ROOM_DIMENSIONS[2]/2);
            zBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));
        }

            // otherwise we connect to the previous
            // room by picking a side, and an offset into
            // that side

        else {

            tryCount=0;
            
            while (true) {
                
                    // get random side and offset

                var connectSide=this.genRandom.randomIndex(4);
                var connectOffset=this.genRandom.randomInt(-5,10);          // supergumba -- needs to consider block of two rooms
                
                var stairOffset;
                var stairAdd=ROOM_BLOCK_WIDTH*2;
                var roomAdd=ROOM_BLOCK_WIDTH*connectOffset;
                
                switch (connectSide) {

                    case ROOM_SIDE_LEFT:
                        xBound=new wsBound((xConnectBound.min-ROOM_DIMENSIONS[0]),xConnectBound.min);   // supergumba -- need to add in block sizes here instead of just dimensions
                        zBound=new wsBound((zConnectBound.min+roomAdd),(zConnectBound.max+roomAdd));
                        
                        if (stairMode!==STAIR_MODE_NONE) {
                            xBound.add(-stairAdd);
                            stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(zConnectBound,zBound);
                            xStairBound=new wsBound((xConnectBound.min-stairAdd),xConnectBound.min);
                            zStairBound=new wsBound((zConnectBound.min+stairOffset),((zConnectBound.min+stairOffset)+ROOM_BLOCK_WIDTH));
                        }
                        break;

                    case ROOM_SIDE_TOP:
                        xBound=new wsBound((xConnectBound.min+roomAdd),(xConnectBound.max+roomAdd));
                        zBound=new wsBound((zConnectBound.min-ROOM_DIMENSIONS[2]),zConnectBound.min);
                        
                        if (stairMode!==STAIR_MODE_NONE) {
                            zBound.add(-stairAdd);
                            stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(xConnectBound,xBound);
                            xStairBound=new wsBound((xConnectBound.min+stairOffset),((xConnectBound.min+stairOffset)+ROOM_BLOCK_WIDTH));
                            zStairBound=new wsBound((zConnectBound.min-stairAdd),zConnectBound.min);
                        }
                        break;

                    case ROOM_SIDE_RIGHT:
                        xBound=new wsBound(xConnectBound.max,(xConnectBound.max+ROOM_DIMENSIONS[0]));
                        zBound=new wsBound((zConnectBound.min+roomAdd),(zConnectBound.max+roomAdd));
                        
                        if (stairMode!==STAIR_MODE_NONE) {
                            xBound.add(stairAdd);
                            stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(zConnectBound,zBound);
                            xStairBound=new wsBound(xConnectBound.max,(xConnectBound.max+stairAdd));
                            zStairBound=new wsBound((zConnectBound.min+stairOffset),((zConnectBound.min+stairOffset)+ROOM_BLOCK_WIDTH));
                        }
                        break;

                    case ROOM_SIDE_BOTTOM:
                        xBound=new wsBound((xConnectBound.min+roomAdd),(xConnectBound.max+roomAdd));
                        zBound=new wsBound(zConnectBound.max,(zConnectBound.max+ROOM_DIMENSIONS[2]));
                        
                        if (stairMode!==STAIR_MODE_NONE) {
                            zBound.add(stairAdd);
                            stairOffset=this.findRandomBlockOffsetBetweenTwoBounds(xConnectBound,xBound);
                            xStairBound=new wsBound((xConnectBound.min+stairOffset),((xConnectBound.min+stairOffset)+ROOM_BLOCK_WIDTH));
                            zStairBound=new wsBound(zConnectBound.max,(zConnectBound.max+stairAdd));
                        }
                        break;

                }

                if (this.map.boxBoundCollision(xBound,null,zBound,MESH_FLAG_ROOM_WALL)===-1) break;

                tryCount++;
                if (tryCount>ROOM_MAX_CONNECT_TRY) return;
            }
            
                // bounds now the same as last room
                // until any level changes
                
            yBound=yConnectBound.copy();
        }

            // if previous room raised this one, then
            // we need a stairs to the previous room

        if (stairMode!==STAIR_MODE_NONE) {
            yStairBound=new wsBound(yBound.max,(yBound.max+(yBound.getSize()+ROOM_FLOOR_DEPTH)));
            this.addStairRoom(connectSide,xStairBound,yStairBound,zStairBound,(stairMode===STAIR_MODE_DOWN),level);
        }

            // the room

        var roomIdx=this.addRegularRoom(xBlockSize,zBlockSize,xBound,yBound,zBound,level);

            // add the light

        this.addLight(roomIdx);
        
            // start recursing for more rooms
            
        var nextLevel;
        var nextStairMode;
        var yNextBound;
        var storyAdd=yBound.getSize()+ROOM_FLOOR_DEPTH;
            
        for (n=0;n!==ROOM_MAX_RECURSIONS;n++) {
            
                // at max room?
                
            if (this.currentRoomCount>=ROOM_MAX_COUNT) return;
            
                // detect any level changes, we
                // can only have one per room
                
            nextLevel=level;
            nextStairMode=STAIR_MODE_NONE;
            yNextBound=yBound.copy();
                
            if (noCurrentLevelChange) {

                if (this.genRandom.randomPercentage(ROOM_LEVEL_CHANGE_PERCENTAGE)) {

                        // change level, we only have
                        // two levels to keep map crossing
                        // over itself

                    if (level===0) {
                        nextLevel=1;
                        yNextBound.add(-storyAdd);
                        nextStairMode=STAIR_MODE_UP;
                    }
                    else {
                        nextLevel=0;
                        yNextBound.add(storyAdd);
                        nextStairMode=STAIR_MODE_DOWN;
                    }

                        // only one level change
                        // away from a room at a time

                    noCurrentLevelChange=false;
                }
            }
            
                // recurse to next room
                
            this.buildMapRecursiveRoom((recurseCount+1),roomIdx,nextStairMode,xBound,yNextBound,zBound,nextLevel);
        }
    };
    
        //
        // closets and decorations
        //
        
    this.buildRoomClosets=function()
    {
        var n,closet;
        var nRoom=this.map.rooms.length;
        
        for (n=0;n!==nRoom;n++) {
            closet=new GenRoomClosetObject(this.view,this.map,this.map.rooms[n],genRandom);
            closet.addCloset();
        }
    };
        
    this.buildRoomDecorations=function()
    {
        var n,decoration;
        var nRoom=this.map.rooms.length;
        
        for (n=0;n!==nRoom;n++) {
            decoration=new GenRoomDecorationObject(this.view,this.map,this.map.rooms[n],genRandom);
            decoration.addDecoration();
        }
    };

        //
        // build map mainline
        //

    this.build=function()
    {
        currentGlobalGenMapObject=this;
        
        this.view.loadingScreenDraw(0.16);
        setTimeout(function() { currentGlobalGenMapObject.buildMapRooms(); },PROCESS_TIMEOUT_MSEC);
    };
    
    this.buildMapRooms=function()
    {
            // start the recursive
            // room adding

        this.currentRoomCount=0;
        
        this.buildMapRecursiveRoom(0,-1,STAIR_MODE_NONE,null,null,null,0);
        
        this.view.loadingScreenDraw(0.32);
        setTimeout(function() { currentGlobalGenMapObject.buildMapClosets(); },PROCESS_TIMEOUT_MSEC);
    };
    
    this.buildMapClosets=function()
    {
            // build room closets
            
        this.buildRoomClosets();
        
            // finish with the callback

        this.view.loadingScreenDraw(0.48);
        setTimeout(function() { currentGlobalGenMapObject.buildMapRemoveSharedTriangles(); },PROCESS_TIMEOUT_MSEC);
    };
    
    this.buildMapRemoveSharedTriangles=function()
    {
            // delete any shared triangles

        this.removeSharedTriangles();
        
            // finish with the callback
            
        this.view.loadingScreenDraw(0.64);
        setTimeout(function() { currentGlobalGenMapObject.buildMapDecorations(); },PROCESS_TIMEOUT_MSEC);
    };
    
    this.buildMapDecorations=function()
    {
            // build room decorations
            
        this.buildRoomDecorations();
        
            // finish with the callback
            
        this.view.loadingScreenDraw(0.86);
        setTimeout(function() { currentGlobalGenMapObject.buildMapFinish(); },PROCESS_TIMEOUT_MSEC);
    };
    
    this.buildMapFinish=function()
    {
            // overlay precalc
            
        this.map.precalcOverlayDrawValues(this.view);
        
            // finish with the callback
            
        this.view.loadingScreenDraw(1.0);
        this.callbackFunc();
    };

}
