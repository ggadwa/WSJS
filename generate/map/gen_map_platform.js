"use strict";

//
// map platforms
//

function GenRoomPlatform(map,genRandom,room)
{
    this.map=map;
    this.genRandom=genRandom;
    this.room=room;
    
        //
        // add stairs chunk
        //
        
    this.addStairChunk=function(xBound,yBound,zBound,stairX,stairZ,stairDir,platformBitmap)
    {
        var xAdd=Math.floor(xBound.getSize()/ROOM_MAX_DIVISIONS);
        var zAdd=Math.floor(zBound.getSize()/ROOM_MAX_DIVISIONS);
        var xStairBound=new wsBound((xBound.min+(stairX*xAdd)),(xBound.min+((stairX+1)*xAdd)));
        var zStairBound=new wsBound((zBound.min+(stairZ*zAdd)),(zBound.min+((stairZ+1)*zAdd)));

        var stairBitmap=this.map.getBitmapById(TEXTURE_STAIR);
        
        var genRoomStairs=new GenRoomStairs(this.map,this.genRandom);
        
        switch (stairDir) {
            case 0:
                genRoomStairs.createStairsX(platformBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,true,true);
                break;
            case 1:
                genRoomStairs.createStairsZ(platformBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,true,true);
                break;
            case 2:
                genRoomStairs.createStairsX(platformBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,true,false);
                break;
            case 3:
                genRoomStairs.createStairsZ(platformBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,true,false);
                break;
        }
        
            // can't spawn items on upper or lower grid
            
        this.room.blockLowerGrid(stairX,stairZ);
        this.room.blockUpperGrid(stairX,stairZ);
        
        this.map.addOverlayPlatform(xStairBound,zStairBound);
    };
    
        //
        // add platform chunk
        //
        
    this.addPlatformChunk=function(xBound,yBound,zBound,x,z,platformBitmap)
    {
        var xAdd=Math.floor(xBound.getSize()/ROOM_MAX_DIVISIONS);
        var zAdd=Math.floor(zBound.getSize()/ROOM_MAX_DIVISIONS);
        
        var xPlatformBound=new wsBound((xBound.min+(x*xAdd)),(xBound.min+((x+1)*xAdd)));
        var yPlatformBound=new wsBound((yBound.min-ROOM_FLOOR_DEPTH),yBound.min);
        var zPlatformBound=new wsBound((zBound.min+(z*zAdd)),(zBound.min+((z+1)*zAdd)));

        this.map.addMesh(meshPrimitives.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,false,true,true,true,true,true,true,false,MESH_FLAG_ROOM_PLATFORM));

            // can now spawn items unto upper grid
            
        this.room.unblockUpperGrid(x,z);

        this.map.addOverlayPlatform(xPlatformBound,zPlatformBound);
    };
    
        //
        // walkways
        //
        
    this.addChunkWalkwayDirPosX=function(xBound,yBound,zBound,stairX,stairZ,platformBitmap)
    {
        var x;
        
        for (x=(stairX+1);x<ROOM_MAX_DIVISIONS;x++) {
            this.addPlatformChunk(xBound,yBound,zBound,x,stairZ,platformBitmap);
        }
        
        return(ROOM_MAX_DIVISIONS-1);
    };
    
    this.addChunkWalkwayDirPosZ=function(xBound,yBound,zBound,stairX,stairZ,platformBitmap)
    {
        var z;
        
        for (z=(stairZ+1);z<ROOM_MAX_DIVISIONS;z++) {
            this.addPlatformChunk(xBound,yBound,zBound,stairX,z,platformBitmap);
        }
        
        return(ROOM_MAX_DIVISIONS-1);
    };
    
    this.addChunkWalkwayDirNegX=function(xBound,yBound,zBound,stairX,stairZ,platformBitmap)
    {
        var x;
        
        for (x=(stairX-1);x>=0;x--) {
            this.addPlatformChunk(xBound,yBound,zBound,x,stairZ,platformBitmap);
        }
        
        return(0);
    };
    
    this.addChunkWalkwayDirNegZ=function(xBound,yBound,zBound,stairX,stairZ,platformBitmap)
    {
        var z;
        
        for (z=(stairZ-1);z>=0;z--) {
            this.addPlatformChunk(xBound,yBound,zBound,stairX,z,platformBitmap);
        }
        
        return(0);
    };
    
        //
        // create platforms
        // 
    
    this.createPlatforms=function(xBound,yBound,zBound)
    {
        var x,z,stairX,stairZ,stairDir,tryCount;
        var midDiv=Math.floor(ROOM_MAX_DIVISIONS/2);
        
        var platformBitmap=this.map.getBitmapById(TEXTURE_PLATFORM);
        
            // random stair direction
            
        stairDir=this.genRandom.randomInt(0,3);
        
            // find a spot for the steps and add
        
        tryCount=0;
        
        while (true) {
            
            stairX=this.genRandom.randomInt(1,(ROOM_MAX_DIVISIONS-2));
            stairZ=this.genRandom.randomInt(1,(ROOM_MAX_DIVISIONS-2));
            
                // skip middle as player spawns there
                
            if (!((stairX===midDiv) && (stairZ===midDiv))) break;
            
            tryCount++;
            if (tryCount>PLATFORM_MAX_OPEN_BLOCK_TRY) return;
        }
        
        this.addStairChunk(xBound,yBound,zBound,stairX,stairZ,stairDir,platformBitmap);
        
            // expand from the platform
            
        switch (stairDir) {
            
            case 0:
                x=this.addChunkWalkwayDirPosX(xBound,yBound,zBound,stairX,stairZ,platformBitmap);
                z=this.addChunkWalkwayDirPosZ(xBound,yBound,zBound,x,stairZ,platformBitmap);

                if (this.genRandom.random()<ROOM_PLATFORM_2ND_PERCENTAGE) {
                    x=this.addChunkWalkwayDirNegX(xBound,yBound,zBound,x,z,platformBitmap);
                    if (this.genRandom.random()<ROOM_PLATFORM_3RD_PERCENTAGE) this.addChunkWalkwayDirNegZ(xBound,yBound,zBound,x,z,platformBitmap);
                }
                break;
                
            case 1:
                z=this.addChunkWalkwayDirPosZ(xBound,yBound,zBound,stairX,stairZ,platformBitmap);
                x=this.addChunkWalkwayDirPosX(xBound,yBound,zBound,stairX,z,platformBitmap);

                if (this.genRandom.random()<ROOM_PLATFORM_2ND_PERCENTAGE) {
                    z=this.addChunkWalkwayDirNegZ(xBound,yBound,zBound,x,z,platformBitmap);
                    if (this.genRandom.random()<ROOM_PLATFORM_3RD_PERCENTAGE) this.addChunkWalkwayDirNegX(xBound,yBound,zBound,x,z,platformBitmap);
                }
                break;
                
            case 2:
                x=this.addChunkWalkwayDirNegX(xBound,yBound,zBound,stairX,stairZ,platformBitmap);
                z=this.addChunkWalkwayDirNegZ(xBound,yBound,zBound,x,stairZ,platformBitmap);

                if (this.genRandom.random()<ROOM_PLATFORM_2ND_PERCENTAGE) {
                    x=this.addChunkWalkwayDirPosX(xBound,yBound,zBound,x,z,platformBitmap);
                    if (this.genRandom.random()<ROOM_PLATFORM_3RD_PERCENTAGE) this.addChunkWalkwayDirPosZ(xBound,yBound,zBound,x,z,platformBitmap);
                }
                break;
                
            case 3:
                z=this.addChunkWalkwayDirNegZ(xBound,yBound,zBound,stairX,stairZ,platformBitmap);
                x=this.addChunkWalkwayDirNegX(xBound,yBound,zBound,stairX,z,platformBitmap);

                if (this.genRandom.random()<ROOM_PLATFORM_2ND_PERCENTAGE) {
                    z=this.addChunkWalkwayDirPosZ(xBound,yBound,zBound,x,z,platformBitmap);
                    if (this.genRandom.random()<ROOM_PLATFORM_3RD_PERCENTAGE) this.addChunkWalkwayDirPosX(xBound,yBound,zBound,x,z,platformBitmap);
                }
                break;
                
        }
        
    };
    
}

