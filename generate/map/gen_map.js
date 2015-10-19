"use strict";

//
// generate map class
//

function GenMapObject(view,map,genRandom,callbackFunc)
{
        // constants
        
    this.TIMEOUT_MSEC=10;
    
    this.STAIR_MODE_NONE=0;
    this.STAIR_MODE_UP=1;
    this.STAIR_MODE_DOWN=2;

        // variables
        
    this.view=view;
    this.map=map;
    this.genRandom=genRandom;
    
        // lists of specialized objects
        // we use to track rooms and add
        // additional elements
        
    this.roomFloorCeilingList=[];
    this.roomDecorationList=[];
    
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

        for (n=0;n!==nMesh;n++) {
            mesh=this.map.meshes[n];
            if (mesh.flag!==this.map.MESH_FLAG_ROOM_WALL) continue;

            for (t1=0;t1!==mesh.trigCount;t1++) {

                if (!mesh.isTriangleStraightWall(t1)) continue;
                bounds=mesh.getTriangleBounds(t1);

                hit=false;

                for (k=(n+1);k<nMesh;k++) {
                    otherMesh=this.map.meshes[k];
                    if (otherMesh.flag!==this.map.MESH_FLAG_ROOM_WALL) continue;

                    for (t2=0;t2!==otherMesh.trigCount;t2++) {

                        if (!otherMesh.isTriangleStraightWall(t2)) continue;
                        otherBounds=otherMesh.getTriangleBounds(t2);

                        if ((bounds[0].min===otherBounds[0].min) && (bounds[0].max===otherBounds[0].max) && (bounds[1].min===otherBounds[1].min) && (bounds[1].max===otherBounds[1].max) && (bounds[2].min===otherBounds[2].min) && (bounds[2].max===otherBounds[2].max)) {
                            trigList.push([n,t1]);
                            trigList.push([k,t2]);
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
        // map parts
        //

    this.addRoomMesh=function(piece,xBound,yBound,zBound,level)
    {
        var roomBitmap=this.map.getBitmapById(TEXTURE_WALL);
        
            // has stories?
            
        var hasStories=((level===0) && (piece.isRoom));
        
            // floor
            
        this.map.addMesh(piece.createMeshFloorOrCeiling(this.map.getBitmapById(TEXTURE_FLOOR),xBound,yBound,zBound,true,this.map.MESH_FLAG_ROOM_FLOOR));

            // walls
            
        var n,mesh,mesh2;
        var storyCount=hasStories?2:1;
        var yStoryBound=yBound.copy();
        var yFloorBound;
        
        for (n=0;n!==storyCount;n++) {
            mesh=piece.createMeshWalls(roomBitmap,xBound,yStoryBound,zBound,this.map.MESH_FLAG_ROOM_WALL);

            yFloorBound=new wsBound((yStoryBound.min-settings.roomFloorDepth),yStoryBound.min);
            var mesh2=piece.createMeshWalls(roomBitmap,xBound,yFloorBound,zBound,this.map.MESH_FLAG_ROOM_WALL);
            mesh.combineMesh(mesh2);
            
            this.map.addMesh(mesh);
            
            yStoryBound.add(-(yBound.getSize()+settings.roomFloorDepth));
        }
        
            // platforms
            
        if (hasStories) {
            var genRoomPlatform=new GenRoomPlatform(this.map,this.genRandom);
            genRoomPlatform.createPlatforms(2,yBound.getSize(),roomBitmap,xBound,yBound,zBound)
        }
        
            // the ceiling
            
        this.map.addMesh(piece.createMeshFloorOrCeiling(this.map.getBitmapById(TEXTURE_CEILING),xBound,yFloorBound,zBound,false,this.map.MESH_FLAG_ROOM_CEILING));
    };

    this.addStairRoom=function(piece,connectType,xStairBound,yStairBound,zStairBound,flipDirection,level)
    {
        var genRoomStairs=new GenRoomStairs(this.map,this.genRandom);

        var roomBitmap=this.map.getBitmapById(TEXTURE_WALL);
        var stairBitmap=this.map.getBitmapById(TEXTURE_STAIR);
        
            // flip the direction if going down
            
        if (flipDirection) {
            switch (connectType) {
                case piece.CONNECT_TYPE_LEFT:
                    connectType=piece.CONNECT_TYPE_RIGHT;
                    break;
                case piece.CONNECT_TYPE_TOP:
                    connectType=piece.CONNECT_TYPE_BOTTOM;
                    break;
                case piece.CONNECT_TYPE_RIGHT:
                    connectType=piece.CONNECT_TYPE_LEFT;
                    break;
                case piece.CONNECT_TYPE_BOTTOM:
                    connectType=piece.CONNECT_TYPE_TOP;
                    break;
            }
            
            yStairBound.add(-yStairBound.getSize());
        }

            // create the stairs
            
        switch (connectType) {
            
            case piece.CONNECT_TYPE_LEFT:
                genRoomStairs.createStairsX(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,false,false);
                break;
                
            case piece.CONNECT_TYPE_TOP:
                genRoomStairs.createStairsZ(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,false,false);
                break;
                
            case piece.CONNECT_TYPE_RIGHT:
                genRoomStairs.createStairsX(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,false,true);
                break;
                
            case piece.CONNECT_TYPE_BOTTOM:
                genRoomStairs.createStairsZ(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,false,true);
                break;
                
        }
    };

    this.addLight=function(piece,xBound,yBound,zBound,level)
    {
            // dual story room?
            
        var hasStories=((level===0) && (piece.isRoom));
        
            // light point

        var lightX=xBound.getMidPoint();
        var lightZ=zBound.getMidPoint();
        
        var lightY=yBound.min-settings.roomFloorDepth;
        if (hasStories) lightY-=(yBound.getSize()+settings.roomFloorDepth);

            // light fixture

        var xLightBound=new wsBound((lightX-400),(lightX+400));
        var yLightBound=new wsBound(lightY,(lightY+1000));
        var zLightBound=new wsBound((lightZ-400),(lightZ+400));
        this.map.addMesh(meshPrimitives.createMeshPryamid(this.map.getBitmapById(TEXTURE_LIGHT),xLightBound,yLightBound,zLightBound,this.map.MESH_FLAG_LIGHT));

            // get light intensity and point

        var intensity=xBound.getSize();
        var zSize=zBound.getSize();
        if (zSize>intensity) intensity=zSize;
        
        intensity*=(settings.mapLightFactor+(this.genRandom.random()*settings.mapLightFactorExtra));
        if (hasStories) intensity*=settings.mapTwoStoryLightBoost;

        var pt=new wsPoint(lightX,(lightY+1100),lightZ);

            // the color

        var red=0.5+(this.genRandom.random()*0.5);
        var green=0.5+(this.genRandom.random()*0.5);
        var blue=0.5+(this.genRandom.random()*0.5);
        
            // the exponent
            
        var exponent=settings.mapLightExponentMin+(this.genRandom.random()*settings.mapLightExponentExtra);

            // add light to map

        this.map.addLight(new MapLightObject(pt,new wsColor(red,green,blue),(settings.generateLightmap),intensity,exponent));
    };

        //
        // build map recursive room
        //

    this.buildMapRecursiveRoom=function(recurseCount,connectPieceIdx,connectLineIdx,stairMode,xConnectBound,yConnectBound,zConnectBound,level)
    {
        var n;

            // get random piece
            // unless recurse count is 0, then always
            // start with square

        var pieceIdx;
        if (recurseCount===0) {
            pieceIdx=0;
        }
        else {       
            pieceIdx=Math.floor(this.mapPieceList.count()*this.genRandom.random());
        }

        var piece=this.mapPieceList.get(pieceIdx);

        var nConnectLine=piece.connectLines.length;
        
            // can only have a single level
            // change from a room
            
        var noCurrentLevelChange=true;

            // get mesh location
            // if we don't have a connecting piece,
            // then it's the first mesh and it's
            // centered in the map

        var xBound,yBound,zBound;
        var xStairBound,yStairBound,zStairBound;
        var usedConnectLineIdx=-1;

        if (connectPieceIdx===-1) {
            var mapMid=this.view.OPENGL_FAR_Z/2;

            var halfSize=Math.floor(settings.roomDimension[0]/2);
            xBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));

            var halfSize=Math.floor(settings.roomDimension[1]/2);
            yBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));

            var halfSize=Math.floor(settings.roomDimension[2]/2);
            zBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));
        }

            // otherwise connect it to
            // connecting piece by finding a piece
            // that's on the opposite connection type
            // and lining up the lines

        else {

                // find a opposite piece

            var connectPiece=this.mapPieceList.get(connectPieceIdx);
            var connectType=connectPiece.getConnectType(connectLineIdx);
            
            var offset,connectOffset,connectLength;
            var xAdd,zAdd,stairAdd;

            for (n=0;n!==nConnectLine;n++) {
                if (!piece.isConnectTypeOpposite(n,connectType)) continue;

                    // get offsets for each line
                    // so we line up connections

                offset=piece.getConnectTypeOffset(n,xConnectBound,zConnectBound);
                connectOffset=connectPiece.getConnectTypeOffset(connectLineIdx,xConnectBound,zConnectBound);
                connectLength=connectPiece.getConnectTypeLength(connectLineIdx,xConnectBound,zConnectBound);

                xAdd=connectOffset[0]-offset[0];
                zAdd=connectOffset[1]-offset[1];

                    // get location of the new room
                    // by moving the connections together

                    // if this is a story change, then leave
                    // room for the stair well and get the stair
                    // bounds

                switch (connectType) {

                    case piece.CONNECT_TYPE_LEFT:
                        xBound=new wsBound((xConnectBound.min-settings.roomDimension[0]),xConnectBound.min);
                        zBound=new wsBound((zConnectBound.min+zAdd),(zConnectBound.max+zAdd));
                        
                        if (stairMode!==this.STAIR_MODE_NONE) {
                            stairAdd=connectLength[1]*2;
                            xBound.add(-stairAdd);
                            xStairBound=new wsBound((xConnectBound.min-stairAdd),xConnectBound.min);
                            zStairBound=new wsBound((zConnectBound.min+connectOffset[1]),((zConnectBound.min+connectOffset[1])+connectLength[1]));
                        }
                        break;

                    case piece.CONNECT_TYPE_TOP:
                        xBound=new wsBound((xConnectBound.min+xAdd),(xConnectBound.max+xAdd));
                        zBound=new wsBound((zConnectBound.min-settings.roomDimension[2]),zConnectBound.min);
                        
                        if (stairMode!==this.STAIR_MODE_NONE) {
                            stairAdd=connectLength[0]*2;
                            zBound.add(-stairAdd);
                            xStairBound=new wsBound((xConnectBound.min+connectOffset[0]),((xConnectBound.min+connectOffset[0])+connectLength[0]));
                            zStairBound=new wsBound((zConnectBound.min-stairAdd),zConnectBound.min);
                        }
                        break;

                    case piece.CONNECT_TYPE_RIGHT:
                        xBound=new wsBound(xConnectBound.max,(xConnectBound.max+settings.roomDimension[0]));
                        zBound=new wsBound((zConnectBound.min+zAdd),(zConnectBound.max+zAdd));
                        
                        if (stairMode!==this.STAIR_MODE_NONE) {
                            stairAdd=connectLength[1]*2;
                            xBound.add(stairAdd);
                            xStairBound=new wsBound(xConnectBound.max,(xConnectBound.max+stairAdd));
                            zStairBound=new wsBound((zConnectBound.min+connectOffset[1]),((zConnectBound.min+connectOffset[1])+connectLength[1]));
                        }
                        break;

                    case piece.CONNECT_TYPE_BOTTOM:
                        xBound=new wsBound((xConnectBound.min+xAdd),(xConnectBound.max+xAdd));
                        zBound=new wsBound(zConnectBound.max,(zConnectBound.max+settings.roomDimension[2]));
                        
                        if (stairMode!==this.STAIR_MODE_NONE) {
                            stairAdd=connectLength[0]*2;
                            zBound.add(stairAdd);
                            xStairBound=new wsBound((xConnectBound.min+connectOffset[0]),((xConnectBound.min+connectOffset[0])+connectLength[0]));
                            zStairBound=new wsBound(zConnectBound.max,(zConnectBound.max+stairAdd));
                        }
                        break;

                }

                yBound=yConnectBound.copy();

                    // is it blocked by other pieces?
                    // we never cross over on floors so
                    // don't check the Y

                if (this.map.boxBoundCollision(xBound,null,zBound,this.map.MESH_FLAG_ROOM_WALL)===-1) {
                    usedConnectLineIdx=n;
                    break;
                }
            }

                // could not find a place to add a mesh

            if (usedConnectLineIdx===-1) return;
        }

            // if previous room raised this one, then
            // we need a stairs to the previous room

        if (stairMode!==this.STAIR_MODE_NONE) {
            yStairBound=new wsBound(yBound.max,(yBound.max+(yBound.getSize()+settings.roomFloorDepth)));
            this.addStairRoom(piece,connectType,xStairBound,yStairBound,zStairBound,(stairMode===this.STAIR_MODE_DOWN),level);
        }

            // the room mesh

        this.addRoomMesh(piece,xBound,yBound,zBound,level);

            // add the light

        this.addLight(piece,xBound,yBound,zBound,level);

            // have we recursed too far?

        if (recurseCount<settings.roomMaxRecursion) {

                // always need to force at least
                // one connection.  if that one
                // was already used, move on to the next one

            var forceConnectLineIdx=Math.floor(nConnectLine*this.genRandom.random());
            if (forceConnectLineIdx===usedConnectLineIdx) {
                forceConnectLineIdx++;
                if (forceConnectLineIdx===nConnectLine) forceConnectLineIdx=0;
            }

                // run through connections
                // if a random boolean flag is true,
                // than try to connect another room
                // and recurse
                
            var nextLevel;
            var nextStairMode;
            var yNextBound;
            var storyAdd=yBound.getSize()+settings.roomFloorDepth

            for (n=0;n!==nConnectLine;n++) {

                    // bail if we've reach max room count

                if (this.map.countMeshByFlag(this.map.MESH_FLAG_ROOM_WALL)>=settings.roomMaxCount) break;

                    // determine if this line will go off
                    // on another recursion

                if (n===usedConnectLineIdx) continue;
                if (n!==forceConnectLineIdx) {
                    if (this.genRandom.random()>=settings.roomConnectionPercentage) continue;
                }

                    // check if this connection should
                    // be a level change

                nextLevel=level;
                nextStairMode=this.STAIR_MODE_NONE;
                yNextBound=yBound.copy();

                if (noCurrentLevelChange) {

                    if (this.genRandom.random()<settings.roomLevelChangePercentage) {

                            // change level, we only have
                            // two levels to keep map crossing
                            // over itself
                            
                        if (level===0) {
                            nextLevel=1;
                            yNextBound.add(-storyAdd);
                            nextStairMode=this.STAIR_MODE_UP;
                        }
                        else {
                            nextLevel=0;
                            yNextBound.add(storyAdd);
                            nextStairMode=this.STAIR_MODE_DOWN;
                        }
                        
                            // only one level change
                            // away from a room at a time
                            
                        noCurrentLevelChange=false;
                    }
                }

                    // recurse on to build the new room

                this.buildMapRecursiveRoom((recurseCount+1),pieceIdx,n,nextStairMode,xBound,yNextBound,zBound,nextLevel);
            }
        }
        
            // if it's a room, add to the
            // decoration list

        piece=this.mapPieceList.get(pieceIdx);
        if (piece.isRoom) this.roomDecorationList.push(new GenRoomDecorationObject(this.view,this.map,piece,xBound,yBound,zBound,this.genRandom));
    };
    
        //
        // floors and ceilings
        //
        
    this.buildRoomFloorAndCeilings=function()
    {
        var n,nMesh;
        
        nMesh=this.roomFloorCeilingList.length;
        
        for (n=0;n!==nMesh;n++) {
            this.roomFloorCeilingList[n].addFloorCeiling();
        }
    };
    
        //
        // decorate the meshes
        //
        
    this.buildRoomDecorations=function()
    {
        var n,nMesh;
        
        nMesh=this.roomDecorationList.length;
        
        for (n=0;n!==nMesh;n++) {
            this.roomDecorationList[n].addDecoration();
        }
    };

        //
        // build map mainline
        //

    this.build=function()
    {
        currentGlobalGenMapObject=this;
        
        setTimeout(function() { currentGlobalGenMapObject.buildMapPieceList(); },this.TIMEOUT_MSEC);
    };
    
    this.buildMapPieceList=function()
    {
            // setup the pieces that
            // create the map

        this.mapPieceList=new MapPieceListObject();
        this.mapPieceList.fill();
        
        this.view.loadingScreenDraw(0.20);
        setTimeout(function() { currentGlobalGenMapObject.buildMapRooms(); },this.TIMEOUT_MSEC);
    };
    
    this.buildMapRooms=function()
    {
            // start the recursive
            // room adding

        this.buildMapRecursiveRoom(0,-1,-1,this.STAIR_MODE_NONE,null,null,null,0);
        
        this.view.loadingScreenDraw(0.40);
        setTimeout(function() { currentGlobalGenMapObject.buildMapRemoveSharedTriangles(); },this.TIMEOUT_MSEC);
    };
    
    this.buildMapRemoveSharedTriangles=function()
    {
            // delete any shared triangles

        this.removeSharedTriangles();
        
        this.view.loadingScreenDraw(0.60);
        setTimeout(function() { currentGlobalGenMapObject.buildMapFloorAndCeilings(); },this.TIMEOUT_MSEC);
    };
    
    this.buildMapFloorAndCeilings=function()
    {
            // build floors and ceilings for rooms

        this.buildRoomFloorAndCeilings();
        
        this.view.loadingScreenDraw(0.80);
        setTimeout(function() { currentGlobalGenMapObject.buildMapDecorations(); },this.TIMEOUT_MSEC);
    };
    
    this.buildMapDecorations=function()
    {
            // build room decorations
            
        this.buildRoomDecorations();
        
            // finish with the callback

        this.view.loadingScreenDraw(1.0);
        this.callbackFunc();
    };

}
