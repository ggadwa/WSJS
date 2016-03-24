"use strict";

//
// map platforms
//

class GenRoomPlatformClass
{
    constructor(bitmapList,map,genRandom)
    {
        this.bitmapList=bitmapList;
        this.map=map;
        this.genRandom=genRandom;
        
        Object.seal(this);
    }
    
        //
        // add stairs chunk
        //
        
    addStairChunk(room,stairX,stairZ,stairDir,platformBitmap)
    {
        var xStairBound=new wsBound((room.xBound.min+(stairX*ROOM_BLOCK_WIDTH)),(room.xBound.min+((stairX+1)*ROOM_BLOCK_WIDTH)));
        var zStairBound=new wsBound((room.zBound.min+(stairZ*ROOM_BLOCK_WIDTH)),(room.zBound.min+((stairZ+1)*ROOM_BLOCK_WIDTH)));

        var genRoomStairs=new GenRoomStairsClass(this.bitmapList,this.map,this.genRandom);
        
        switch (stairDir) {
            case 0:
                genRoomStairs.createStairsX(xStairBound,room.yBound,zStairBound,true,true,true);
                break;
            case 1:
                genRoomStairs.createStairsZ(xStairBound,room.yBound,zStairBound,true,true,true);
                break;
            case 2:
                genRoomStairs.createStairsX(xStairBound,room.yBound,zStairBound,true,true,false);
                break;
            case 3:
                genRoomStairs.createStairsZ(xStairBound,room.yBound,zStairBound,true,true,false);
                break;
        }
        
            // can't spawn items on this grid spot
            // or the spot where the stairs empties
            
        room.setBlockGrid(stairX,stairZ);
        
        switch (stairDir) {
            case 0:
                if (stairX>0) room.setBlockGrid((stairX-1),stairZ);
                break;
            case 1:
                if (stairZ>0) room.setBlockGrid(stairX,(stairZ-1));
                break;
            case 2:
                if (stairX<(room.xBlockSize-1)) room.setBlockGrid((stairX+1),stairZ);
                break;
            case 3:
                if (stairZ<(room.zBlockSize-1)) room.setBlockGrid(stairX,(stairZ+1));
                break;
        }
        
            // add to overlay
        
        this.map.addOverlayPlatform(xStairBound,zStairBound);
    }
    
        //
        // add platform chunk
        //
        
    addPlatformChunk(room,x,z,platformBitmap)
    {
        var xPlatformBound=new wsBound((room.xBound.min+(x*ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*ROOM_BLOCK_WIDTH)));
        var yPlatformBound=new wsBound((room.yBound.min-ROOM_FLOOR_DEPTH),room.yBound.min);
        var zPlatformBound=new wsBound((room.zBound.min+(z*ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*ROOM_BLOCK_WIDTH)));

        this.map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,null,false,true,true,true,true,true,true,false,MESH_FLAG_ROOM_PLATFORM));

            // can now spawn items unto upper grid
            
        room.setPlatformGrid(x,z);

        this.map.addOverlayPlatform(xPlatformBound,zPlatformBound);
    }
    
        //
        // walkways
        //
        
    addChunkWalkwayDirPosX(room,stairX,stairZ,platformBitmap)
    {
        var x;
        
        for (x=(stairX+1);x<room.xBlockSize;x++) {
            this.addPlatformChunk(room,x,stairZ,platformBitmap);
        }
        
        return(room.xBlockSize-1);
    }
    
    addChunkWalkwayDirPosZ(room,stairX,stairZ,platformBitmap)
    {
        var z;
        
        for (z=(stairZ+1);z<room.zBlockSize;z++) {
            this.addPlatformChunk(room,stairX,z,platformBitmap);
        }
        
        return(room.zBlockSize-1);
    }
    
    addChunkWalkwayDirNegX(room,stairX,stairZ,platformBitmap)
    {
        var x;
        
        for (x=(stairX-1);x>=0;x--) {
            this.addPlatformChunk(room,x,stairZ,platformBitmap);
        }
        
        return(0);
    }
    
    addChunkWalkwayDirNegZ(room,stairX,stairZ,platformBitmap)
    {
        var z;
        
        for (z=(stairZ-1);z>=0;z--) {
            this.addPlatformChunk(room,stairX,z,platformBitmap);
        }
        
        return(0);
    }
    
        //
        // create platforms
        // 
    
    createPlatforms(room)
    {
        var x,z,stairX,stairZ,stairDir;
        
        var platformBitmap=this.bitmapList.getBitmap('Map Platform');
        
            // random stair direction
            
        stairDir=this.genRandom.randomIndex(4);
        
            // find a spot for the steps and add
            // platforms are the first thing we do so we don't need
            // to check for open spots
        
        stairX=this.genRandom.randomInt(1,(room.xBlockSize-2));
        stairZ=this.genRandom.randomInt(1,(room.zBlockSize-2));
        
        this.addStairChunk(room,stairX,stairZ,stairDir,platformBitmap);
        
            // expand from the platform
            
        switch (stairDir) {
            
            case 0:
                x=this.addChunkWalkwayDirPosX(room,stairX,stairZ,platformBitmap);
                z=this.addChunkWalkwayDirPosZ(room,x,stairZ,platformBitmap);

                if (this.genRandom.randomPercentage(ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    x=this.addChunkWalkwayDirNegX(room,x,z,platformBitmap);
                    if (this.genRandom.randomPercentage(ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirNegZ(room,x,z,platformBitmap);
                }
                break;
                
            case 1:
                z=this.addChunkWalkwayDirPosZ(room,stairX,stairZ,platformBitmap);
                x=this.addChunkWalkwayDirPosX(room,stairX,z,platformBitmap);

                if (this.genRandom.randomPercentage(ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    z=this.addChunkWalkwayDirNegZ(room,x,z,platformBitmap);
                    if (this.genRandom.randomPercentage(ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirNegX(room,x,z,platformBitmap);
                }
                break;
                
            case 2:
                x=this.addChunkWalkwayDirNegX(room,stairX,stairZ,platformBitmap);
                z=this.addChunkWalkwayDirNegZ(room,x,stairZ,platformBitmap);

                if (this.genRandom.randomPercentage(ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    x=this.addChunkWalkwayDirPosX(room,x,z,platformBitmap);
                    if (this.genRandom.randomPercentage(ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirPosZ(room,x,z,platformBitmap);
                }
                break;
                
            case 3:
                z=this.addChunkWalkwayDirNegZ(room,stairX,stairZ,platformBitmap);
                x=this.addChunkWalkwayDirNegX(room,stairX,z,platformBitmap);

                if (this.genRandom.randomPercentage(ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    z=this.addChunkWalkwayDirPosZ(room,x,z,platformBitmap);
                    if (this.genRandom.randomPercentage(ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirPosX(room,x,z,platformBitmap);
                }
                break;
                
        }
        
    }
    
}

