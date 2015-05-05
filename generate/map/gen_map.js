"use strict";

//
// constants
// 

const GEN_MAP_STAIR_LENGTH=5000;

//
// setup
//

function buildMapSetupObject(maxRoom,maxRecurseCount,maxRoomSize,maxStoryCount,connectionPercentage,storyChangePercentage)
{
    this.maxRoom=maxRoom;
    this.maxRecurseCount=maxRecurseCount;
    this.maxRoomSize=maxRoomSize;
    this.maxStoryCount=maxStoryCount;
    this.connectionPercentage=connectionPercentage;
    this.storyChangePercentage=storyChangePercentage;
}

//
// remove shared triangles
//

function genMapRemoveSharedTriangles()
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
        if (mesh.flag!==MAP_MESH_FLAG_ROOM_WALL) continue;
    
        for (t1=0;t1!==mesh.trigCount;t1++) {
            
            if (!mesh.isTriangleStraightWall(t1)) continue;
            bounds=mesh.getTriangleBounds(t1);
            
            hit=false;
            
            for (k=(n+1);k<nMesh;k++) {
                otherMesh=this.map.meshes[k];
                if (otherMesh.flag!==MAP_MESH_FLAG_ROOM_WALL) continue;
            
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
}

//
// map parts
//

function genMapAddRoomMesh(piece,storyCount,xBound,yBound,zBound,levelCount)
{
    var n;
    var floorTextures=[BITMAP_CONCRETE,BITMAP_TILE,BITMAP_TILE_2];
    var wallTextures=[BITMAP_STONE,BITMAP_BRICK_RANDOM,BITMAP_BRICK_STACK];
    
        // floor
        
    this.map.addMesh(piece.createMeshFloor(this.map.getBitmapById(floorTextures[levelCount%3]),xBound,yBound,zBound,MAP_MESH_FLAG_ROOM_FLOOR));
    
        // walls
        // combine into a single mesh
        
    var yStoryAdd=yBound.max-yBound.min;
    var yStoryBound=yBound.copy();
    
    var mesh,mesh2;
    
    for (n=0;n!==storyCount;n++) {
        if (n===0) {
            mesh=piece.createMeshWalls(this.map.getBitmapById(wallTextures[levelCount%3]),xBound,yStoryBound,zBound,MAP_MESH_FLAG_ROOM_WALL);
        }
        else {
            yStoryBound.add(-yStoryAdd);
            mesh2=piece.createMeshWalls(this.map.getBitmapById(wallTextures[levelCount%3]),xBound,yStoryBound,zBound,MAP_MESH_FLAG_ROOM_WALL);
            mesh.combineMesh(mesh2);
        }
    }

    this.map.addMesh(mesh);
    
        // ceiling
        
    this.map.addMesh(piece.createMeshCeiling(this.map.getBitmapById(BITMAP_WOOD_PLANK),xBound,yStoryBound,zBound,MAP_MESH_FLAG_ROOM_CEILING));
    
        // decorations
        
    if (piece.isRoom) {
        this.addDecoration(this.map,piece,xBound,new wsBound(yStoryBound.min,yBound.max),zBound);
    }

    return(yStoryBound);
}

function genMapAddStairMesh(piece,connectType,xStairBound,yStairBound,zStairBound)
{
        // no stair if collide with another staircase
        
    if (this.map.boxBoundCollision(xStairBound,yStairBound,zStairBound,MAP_MESH_FLAG_STAIR)!==-1) return;
    
    var meshPrimitives=new meshPrimitivesObject();

    switch (connectType) {
        case piece.CONNECT_TYPE_LEFT:
            meshPrimitives.createStairsPosX(this.map,xStairBound,yStairBound,zStairBound);
            break;
        case piece.CONNECT_TYPE_TOP:
            meshPrimitives.createStairsPosZ(this.map,xStairBound,yStairBound,zStairBound);
            break;
        case piece.CONNECT_TYPE_RIGHT:
            meshPrimitives.createStairsNegX(this.map,xStairBound,yStairBound,zStairBound);
            break;
        case piece.CONNECT_TYPE_BOTTOM:
            meshPrimitives.createStairsNegZ(this.map,xStairBound,yStairBound,zStairBound);
            break;
    }
}

function genMapAddLight(piece,xBound,yBound,zBound)
{
        // light point
        
    var lightX=xBound.getMidPoint();
    var lightZ=zBound.getMidPoint();
    
        // light fixture
        
    var xLightBound=new wsBound((lightX-400),(lightX+400));
    var yLightBound=new wsBound(yBound.min,(yBound.min+1000));
    var zLightBound=new wsBound((lightZ-400),(lightZ+400));
    
    var meshPrimitives=new meshPrimitivesObject();
    this.map.addMesh(meshPrimitives.createMeshPryamid(this.map.getBitmapById(BITMAP_METAL),xLightBound,yLightBound,zLightBound,MAP_MESH_FLAG_LIGHT));
    
        // reduce light if already in the
        // path of another light
        
    var intensity=xBound.max-xBound.min*0.95;
    
    var pt=new wsPoint(lightX,(yLightBound.max+100),lightZ);
    if (this.map.pointInLight(pt)) intensity*=0.8;
    
        // the color

    var red=0.8+(this.genRandom.random()*0.2);
    var green=0.8+(this.genRandom.random()*0.2);
    var blue=0.8+(this.genRandom.random()*0.2);
    
        // add light to map
        
    this.map.addLight(new mapLightObject(pt,new wsColor(red,green,blue),true,intensity,1.0));
}

//
// build map recursive room
//

function genMapBuildMapRecursiveRoom(recurseCount,connectPieceIdx,connectLineIdx,connectStoryCount,needStairs,xConnectBound,yConnectBound,zConnectBound,levelCount)
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
    
        // get mesh location
        // if we don't have a connecting piece,
        // then it's the first mesh and it's
        // centered in the map
    
    var xBound,yBound,zBound;
    var xStairBound,yStairBound,zStairBound;
    var usedConnectLineIdx=-1;
    
    if (connectPieceIdx===-1) {
        var mapMid=this.view.OPENGL_FAR_Z/2;
        
        var halfSize=Math.floor(this.setup.maxRoomSize[0]/2);
        xBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));
        
        var halfSize=Math.floor(this.setup.maxRoomSize[1]/2);
        yBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));
        
        var halfSize=Math.floor(this.setup.maxRoomSize[2]/2);
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
        
        for (n=0;n!==nConnectLine;n++) {
            if (!piece.isConnectTypeOpposite(n,connectType)) continue;
            
                // get offsets for each line
                // so we line up connections
                
            var offset=piece.getConnectTypeOffset(n,xConnectBound,zConnectBound);
            var connectOffset=connectPiece.getConnectTypeOffset(connectLineIdx,xConnectBound,zConnectBound);
            var connectLength=connectPiece.getConnectTypeLength(connectLineIdx,xConnectBound,zConnectBound);
            
            var xAdd=connectOffset[0]-offset[0];
            var zAdd=connectOffset[1]-offset[1];
            
                // get location of the new room
                // by moving the connections together
                
                // at the same time, find the location
                // of any staircase if needed later

            switch (connectType) {

                case piece.CONNECT_TYPE_LEFT:
                    xBound=new wsBound((xConnectBound.min-this.setup.maxRoomSize[0]),xConnectBound.min);
                    zBound=new wsBound((zConnectBound.min+zAdd),(zConnectBound.max+zAdd));
                    xStairBound=new wsBound(xConnectBound.min,(xConnectBound.min+GEN_MAP_STAIR_LENGTH));
                    zStairBound=new wsBound((zConnectBound.min+connectOffset[1]),((zConnectBound.min+connectOffset[1])+connectLength[1]));
                    break;

                case piece.CONNECT_TYPE_TOP:
                    xBound=new wsBound((xConnectBound.min+xAdd),(xConnectBound.max+xAdd));
                    zBound=new wsBound((zConnectBound.min-this.setup.maxRoomSize[2]),zConnectBound.min);
                    xStairBound=new wsBound((xConnectBound.min+connectOffset[0]),((xConnectBound.min+connectOffset[0])+connectLength[0]));
                    zStairBound=new wsBound(zConnectBound.min,(zConnectBound.min+GEN_MAP_STAIR_LENGTH));
                    break;

                case piece.CONNECT_TYPE_RIGHT:
                    xBound=new wsBound(xConnectBound.max,(xConnectBound.max+this.setup.maxRoomSize[0]));
                    zBound=new wsBound((zConnectBound.min+zAdd),(zConnectBound.max+zAdd));
                    xStairBound=new wsBound((xConnectBound.max-GEN_MAP_STAIR_LENGTH),xConnectBound.max);
                    zStairBound=new wsBound((zConnectBound.min+connectOffset[1]),((zConnectBound.min+connectOffset[1])+connectLength[1]));
                    break;

                case piece.CONNECT_TYPE_BOTTOM:
                    xBound=new wsBound((xConnectBound.min+xAdd),(xConnectBound.max+xAdd));
                    zBound=new wsBound(zConnectBound.max,(zConnectBound.max+this.setup.maxRoomSize[2]));
                    xStairBound=new wsBound((xConnectBound.min+connectOffset[0]),((xConnectBound.min+connectOffset[0])+connectLength[0]));
                    zStairBound=new wsBound((zConnectBound.max-GEN_MAP_STAIR_LENGTH),zConnectBound.max);
                    break;

            }

            yBound=yConnectBound.copy();
            
                // is it blocked by other pieces?
                // we ignore the Y so upper stories don't
                // go over current stories
            
            if (this.map.boxBoundCollision(xBound,null,zBound,MAP_MESH_FLAG_ROOM_WALL)===-1) {
                usedConnectLineIdx=n;
                break;
            }
        }
        
            // could not find a place to add a mesh
            
        if (usedConnectLineIdx===-1) return;
    }
    
        // if previous room raised this one, then
        // we need a stairs to the previous room
        
    if (needStairs) {
        yStairBound=new wsBound(yBound.max,(yBound.max+(yBound.max-yBound.min)));
        this.addStairMesh(piece,connectType,xStairBound,yStairBound,zStairBound);
    }
    
        // how many stories?
        
    var storyCount=1+Math.floor(this.setup.maxStoryCount*this.genRandom.random());

        // add the room mesh
        
    var yStoryBound=this.addRoomMesh(piece,storyCount,xBound,yBound,zBound,levelCount);

        // add the light
        
    this.addLight(piece,xBound,yStoryBound,zBound);
    
        // have we recursed too far?
        
    if (recurseCount>=this.setup.maxRecurseCount) return;
    
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
        
    var yStoryAdd=yBound.max-yBound.min;

    for (n=0;n!==nConnectLine;n++) {
    
            // bail if we've reach max room count

        if (this.map.countMeshByFlag(MAP_MESH_FLAG_ROOM_WALL)>=this.setup.maxRoom) return;
        
            // determine if this line will go off
            // on another recursion
            
        if (n===usedConnectLineIdx) continue;
        if (n!==forceConnectLineIdx) {
            if (this.genRandom.random()>=this.setup.connectionPercentage) continue;
        }
        
            // if we are connecting to a room
            // with more than one story, we
            // can change the Y
        
        var nextNeedStairs=false;
        yStoryBound=yBound.copy();
        
        if (storyCount>1) {
            if (this.genRandom.random()<this.setup.storyChangePercentage) {
                
                    // move new room up
                    // and switch level
                    
                yStoryBound.add(-yStoryAdd);
                levelCount++;
                
                    // and tell next room that
                    // we might need stairs to it
                    
                nextNeedStairs=true;
            }
        }
        
            // recurse on to build the new room
            
        this.buildMapRecursiveRoom((recurseCount+1),pieceIdx,n,storyCount,nextNeedStairs,xBound,yStoryBound,zBound,levelCount);
    }
}

//
// build map mainline
//

function genMapBuild()
{
    wsStartStatusBar(4);
    
        // setup the pieces that
        // create the map
        
    this.mapPieceList=new mapPieceListObject();
    wsNextStatusBar();
    
        // start the recursive
        // room adding
    
    this.buildMapRecursiveRoom(0,-1,-1,-1,false,null,null,null,0);
    wsNextStatusBar();
    
        // delete any shared triangles
    
    this.removeSharedTriangles();
    wsNextStatusBar();
    
        // build the light/mesh intersection lists
        
    this.map.buildLightMeshIntersectLists();
    wsNextStatusBar();
}

//
// generate map object
//

function genMapObject(view,map,setup,genRandom)
{
    this.view=view;
    this.map=map;
    this.setup=setup;
    this.genRandom=genRandom;
    
        // functions
        
    this.removeSharedTriangles=genMapRemoveSharedTriangles;
    this.addRoomMesh=genMapAddRoomMesh;
    this.addStairMesh=genMapAddStairMesh;
    this.addLight=genMapAddLight;
    this.buildMapRecursiveRoom=genMapBuildMapRecursiveRoom;
    this.build=genMapBuild;
    
    this.addDecorationPillar=genMapAddDecorationPillar;
    this.addDecorationBox=genMapAddDecorationBox;
    this.addDecoration=genMapAddDecoration;
}
