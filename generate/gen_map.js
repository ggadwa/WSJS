"use strict";

//
// generate map object
//

var genMap={};

//
// constants
// 

genMap.MESH_FLAG_ROOM_WALL=0;
genMap.MESH_FLAG_ROOM_FLOOR=1;
genMap.MESH_FLAG_ROOM_CEILING=2;
genMap.MESH_FLAG_STAIR=3;
genMap.MESH_FLAG_LIGHT=4;

genMap.STAIR_LENGTH=5000;

//
// setup
//

function buildMapSetupObject(maxRecurseCount,maxRoomSize,maxStoryCount,connectionPercentage,storyChangePercentage)
{
    this.maxRecurseCount=maxRecurseCount;
    this.maxRoomSize=maxRoomSize;
    this.maxStoryCount=maxStoryCount;
    this.connectionPercentage=connectionPercentage;
    this.storyChangePercentage=storyChangePercentage;
}

//
// remove shared triangles
//

genMap.removeSharedTriangles=function(map)
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
        
    nMesh=map.meshes.length;
    
    for (n=0;n!==nMesh;n++) {
        mesh=map.meshes[n];
        if (mesh.flag!==this.MESH_FLAG_ROOM_WALL) continue;
    
        for (t1=0;t1!==mesh.trigCount;t1++) {
            
            bounds=mesh.getTriangleBounds(t1);
            
            hit=false;
            
            for (k=(n+1);k<nMesh;k++) {
                otherMesh=map.meshes[k];
                if (otherMesh.flag!==this.MESH_FLAG_ROOM_WALL) continue;
            
                for (t2=0;t2!==otherMesh.trigCount;t2++) {
                    
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
        map.meshes[aTrig[0]].removeTriangle(aTrig[1]);
        
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

genMap.addRoomMesh=function(map,piece,storyCount,xBound,yBound,zBound,nextWallBitmap)
{
    var n;
    
    map.addMesh(piece.createMeshFloor(SHADER_NORMAL,BITMAP_TILE,xBound,yBound,zBound,this.MESH_FLAG_ROOM_FLOOR));
    
    var yStoryAdd=yBound.max-yBound.min;
    var yStoryBound=yBound.copy();
    
    for (n=0;n!==storyCount;n++) {
        if (n!==0) yStoryBound.add(-yStoryAdd);
        map.addMesh(piece.createMeshWalls(SHADER_NORMAL,nextWallBitmap,xBound,yStoryBound,zBound,this.MESH_FLAG_ROOM_WALL));
    }
    
    map.addMesh(piece.createMeshCeiling(SHADER_NORMAL,BITMAP_WOOD_PLANK,xBound,yStoryBound,zBound,this.MESH_FLAG_ROOM_CEILING));

    return(yStoryBound);
};

genMap.addStairMesh=function(map,piece,connectType,xStairBound,yStairBound,zStairBound)
{
        // no stair if collide with another staircase
        
    if (map.boxBoundCollision(xStairBound,yStairBound,zStairBound,this.MESH_FLAG_STAIR)!==-1) return;

    switch (connectType) {
        case piece.CONNECT_TYPE_LEFT:
            genMapUtil.createStairsPosX(map,SHADER_NORMAL,BITMAP_CONCRETE,xStairBound,yStairBound,zStairBound);
            break;
        case piece.CONNECT_TYPE_TOP:
            genMapUtil.createStairsPosZ(map,SHADER_NORMAL,BITMAP_CONCRETE,xStairBound,yStairBound,zStairBound);
            break;
        case piece.CONNECT_TYPE_RIGHT:
            genMapUtil.createStairsNegX(map,SHADER_NORMAL,BITMAP_CONCRETE,xStairBound,yStairBound,zStairBound);
            break;
        case piece.CONNECT_TYPE_BOTTOM:
            genMapUtil.createStairsNegZ(map,SHADER_NORMAL,BITMAP_CONCRETE,xStairBound,yStairBound,zStairBound);
            break;
    }
};

genMap.addLight=function(map,xBound,yBound,zBound)
{
        // light point
        
    var lightX=xBound.getMidPoint();
    var lightZ=zBound.getMidPoint();
    
        // light fixture
        
    var xLightBound=new wsBound((lightX-400),(lightX+400));
    var yLightBound=new wsBound(yBound.min,(yBound.min+1000));
    var zLightBound=new wsBound((lightZ-400),(lightZ+400));
    map.addMesh(genMapUtil.createMeshPryamid(SHADER_NORMAL,BITMAP_METAL,xLightBound,yLightBound,zLightBound,genMap.MESH_FLAG_LIGHT));
    
        // the color
        // 
    var red=0.8+(genRandom.random()*0.2);
    var green=0.8+(genRandom.random()*0.2);
    var blue=0.8+(genRandom.random()*0.2);
    
        // light
        
    var intensity=(xBound.max-xBound.min)*0.5;//0.95; //supergumba -- for testing
    map.addLight(new wsLight(new wsPoint(lightX,(yBound.min+1200),lightZ),new wsColor(red,green,blue),true,intensity,1.0));
};

//
// build map recursive room
//

genMap.buildMapRecursiveRoom=function(map,setup,recurseCount,connectPieceIdx,connectLineIdx,connectStoryCount,needStairs,xConnectBound,yConnectBound,zConnectBound,nextWallBitmap)
{
    var n;
    
        // get random piece
        
    var pieceIdx=Math.floor(genMapPieces.length*genRandom.random());
    var piece=genMapPieces[pieceIdx];
    
    var nConnectLine=piece.connectLines.length;
    
        // get mesh location
        // if we don't have a connecting piece,
        // then it's the first mesh and it's
        // centered in the map
    
    var xBound,yBound,zBound;
    var xStairBound,yStairBound,zStairBound;
    var usedConnectLineIdx=-1;
    
    if (connectPieceIdx===-1) {
        var mapMid=view.OPENGL_FAR_Z/2;
        
        var halfSize=Math.floor(setup.maxRoomSize[0]/2);
        xBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));
        
        var halfSize=Math.floor(setup.maxRoomSize[1]/2);
        yBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));
        
        var halfSize=Math.floor(setup.maxRoomSize[2]/2);
        zBound=new wsBound((mapMid-halfSize),(mapMid+halfSize));
    }
    
        // otherwise connect it to
        // connecting piece by finding a piece
        // that's on the opposite connection type
        // and lining up the lines
        
    else {
        
            // find a opposite piece
        
        var connectPiece=genMapPieces[connectPieceIdx];
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
                    xBound=new wsBound((xConnectBound.min-setup.maxRoomSize[0]),xConnectBound.min);
                    zBound=new wsBound((zConnectBound.min+zAdd),(zConnectBound.max+zAdd));
                    xStairBound=new wsBound(xConnectBound.min,(xConnectBound.min+this.STAIR_LENGTH));
                    zStairBound=new wsBound((zConnectBound.min+connectOffset[1]),((zConnectBound.min+connectOffset[1])+connectLength[1]));
                    break;

                case piece.CONNECT_TYPE_TOP:
                    xBound=new wsBound((xConnectBound.min+xAdd),(xConnectBound.max+xAdd));
                    zBound=new wsBound((zConnectBound.min-setup.maxRoomSize[2]),zConnectBound.min);
                    xStairBound=new wsBound((xConnectBound.min+connectOffset[0]),((xConnectBound.min+connectOffset[0])+connectLength[0]));
                    zStairBound=new wsBound(zConnectBound.min,(zConnectBound.min+this.STAIR_LENGTH));
                    break;

                case piece.CONNECT_TYPE_RIGHT:
                    xBound=new wsBound(xConnectBound.max,(xConnectBound.max+setup.maxRoomSize[0]));
                    zBound=new wsBound((zConnectBound.min+zAdd),(zConnectBound.max+zAdd));
                    xStairBound=new wsBound((xConnectBound.max-this.STAIR_LENGTH),xConnectBound.max);
                    zStairBound=new wsBound((zConnectBound.min+connectOffset[1]),((zConnectBound.min+connectOffset[1])+connectLength[1]));
                    break;

                case piece.CONNECT_TYPE_BOTTOM:
                    xBound=new wsBound((xConnectBound.min+xAdd),(xConnectBound.max+xAdd));
                    zBound=new wsBound(zConnectBound.max,(zConnectBound.max+setup.maxRoomSize[2]));
                    xStairBound=new wsBound((xConnectBound.min+connectOffset[0]),((xConnectBound.min+connectOffset[0])+connectLength[0]));
                    zStairBound=new wsBound((zConnectBound.max-this.STAIR_LENGTH),zConnectBound.max);
                    break;

            }

            yBound=yConnectBound.copy();
            
                // is it blocked by other pieces?
                // we ignore the Y so upper stories don't
                // go over current stories
            
            if (map.boxBoundCollision(xBound,null,zBound,this.MESH_FLAG_ROOM_WALL)===-1) {
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
        this.addStairMesh(map,piece,connectType,xStairBound,yStairBound,zStairBound);
    }
    
        // how many stories?
        
    var storyCount=1+Math.floor(setup.maxStoryCount*genRandom.random());

        // add the room mesh
        
    var yStoryBound=genMap.addRoomMesh(map,piece,storyCount,xBound,yBound,zBound,nextWallBitmap);

        // add the light
        
    this.addLight(map,xBound,yStoryBound,zBound);
    
        // have we recursed too far?
        
    if (recurseCount>=setup.maxRecurseCount) return;
    
        // always need to force at least
        // one connection.  if that one
        // was already used, move on to the next one
        
    var forceConnectLineIdx=Math.floor(nConnectLine*genRandom.random());
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
        
            // determine if this line will go off
            // on another recursion
            
        if (n===usedConnectLineIdx) continue;
        if (n!==forceConnectLineIdx) {
            if (genRandom.random()>=setup.connectionPercentage) continue;
        }
        
            // if we are connecting to a room
            // with more than one story, we
            // can change the Y
        
        var nextNeedStairs=false;
        yStoryBound=yBound.copy();
        
        if (storyCount>1) {
            if (genRandom.random()<setup.storyChangePercentage) {
                
                    // move new room up
                    // and switch bitmap
                    
                yStoryBound.add(-yStoryAdd);
                nextWallBitmap=(nextWallBitmap===BITMAP_BRICK_RANDOM)?BITMAP_BRICK_STACK:BITMAP_BRICK_RANDOM;
                
                    // and tell next room that
                    // we might need stairs to it
                    
                nextNeedStairs=true;
            }
        }
        
            // recurse on to build the new room
            
        this.buildMapRecursiveRoom(map,setup,(recurseCount+1),pieceIdx,n,storyCount,nextNeedStairs,xBound,yStoryBound,zBound,nextWallBitmap);
    }
};

//
// build map mainline
//

genMap.build=function(map,setup)
{
    var n,nMesh;
    
        // start the recursive
        // room adding
        
    this.buildMapRecursiveRoom(map,setup,0,-1,-1,-1,false,null,null,null,BITMAP_BRICK_RANDOM);
    
        // delete any shared triangles
        
    this.removeSharedTriangles(map);
};



