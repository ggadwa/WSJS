"use strict";

//
// map platforms
//

class GenRoomPlatformClass
{
    constructor(map,genRandom)
    {
        this.map=map;
        this.genRandom=genRandom;
        
        Object.seal(this);
    }
    
        //
        // add stairs chunk
        //
        
    addStairChunk(room,stairX,stairZ,stairDir,platformBitmap)
    {
        var xStairBound=new wsBound((room.xBound.min+(stairX*config.ROOM_BLOCK_WIDTH)),(room.xBound.min+((stairX+1)*config.ROOM_BLOCK_WIDTH)));
        var zStairBound=new wsBound((room.zBound.min+(stairZ*config.ROOM_BLOCK_WIDTH)),(room.zBound.min+((stairZ+1)*config.ROOM_BLOCK_WIDTH)));

        var genRoomStairs=new GenRoomStairsClass(this.map,this.genRandom);
        
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
        var xPlatformBound=new wsBound((room.xBound.min+(x*config.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*config.ROOM_BLOCK_WIDTH)));
        var yPlatformBound=new wsBound((room.yBound.min-config.ROOM_FLOOR_DEPTH),room.yBound.min);
        var zPlatformBound=new wsBound((room.zBound.min+(z*config.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*config.ROOM_BLOCK_WIDTH)));

        this.map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,null,false,true,true,true,true,true,true,false,MESH_FLAG_PLATFORM));

            // can now spawn items unto upper grid
            
        room.setPlatformGrid(x,z);

        this.map.addOverlayPlatform(xPlatformBound,zPlatformBound);
    }
    
        //
        // add lift chunk
        //
        
    addLiftChunk(room,x,z,extraY)
    {
        var meshIdx,movement;
        var liftBitmap=bitmapList.getBitmap('Map Metal');
        
        var xLiftBound=new wsBound((room.xBound.min+(x*config.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*config.ROOM_BLOCK_WIDTH)));
        var yLiftBound=new wsBound((room.yBound.min-config.ROOM_FLOOR_DEPTH),(room.yBound.max+extraY));
        var zLiftBound=new wsBound((room.zBound.min+(z*config.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*config.ROOM_BLOCK_WIDTH)));

        meshIdx=this.map.addMesh(MeshPrimitivesClass.createMeshCube(liftBitmap,xLiftBound,yLiftBound,zLiftBound,null,false,true,true,true,true,true,true,false,MESH_FLAG_LIFT));

            // the movement
        
        movement=new MovementClass(meshIdx,true,0);
        movement.addMove(new MoveClass(1500,new wsPoint(0,0,0)));
        movement.addMove(new MoveClass(2000,new wsPoint(0,0,0)));
        movement.addMove(new MoveClass(1500,new wsPoint(0,(config.ROOM_FLOOR_HEIGHT+extraY),0)));
        movement.addMove(new MoveClass(2000,new wsPoint(0,(config.ROOM_FLOOR_HEIGHT+extraY),0)));
        
        this.map.addMovement(movement); 

            // can't span on this
            
        room.setBlockGrid(x,z);

        this.map.addOverlayPlatform(xLiftBound,zLiftBound);
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
        
        var platformBitmap=bitmapList.getBitmap('Map Platform');
        
            // random stair direction
            
        stairDir=this.genRandom.randomIndex(4);
        
            // find a spot for the steps or lifts and add
            // platforms are the first thing we do so we don't need
            // to check for open spots
            
            // liquid rooms always get lifts
        
        stairX=this.genRandom.randomInt(1,(room.xBlockSize-2));
        stairZ=this.genRandom.randomInt(1,(room.zBlockSize-2));
        
        if (room.liquid) {
            this.addLiftChunk(room,stairX,stairZ,config.ROOM_BLOCK_WIDTH);
        }
        else {
            if (this.genRandom.randomPercentage(0.5)) {
                this.addStairChunk(room,stairX,stairZ,stairDir,platformBitmap);
            }
            else {
                this.addLiftChunk(room,stairX,stairZ,0);
            }
        }
        
            // expand from the platform
            
        switch (stairDir) {
            
            case 0:
                x=this.addChunkWalkwayDirPosX(room,stairX,stairZ,platformBitmap);
                z=this.addChunkWalkwayDirPosZ(room,x,stairZ,platformBitmap);

                if (this.genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    x=this.addChunkWalkwayDirNegX(room,x,z,platformBitmap);
                    if (this.genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirNegZ(room,x,z,platformBitmap);
                }
                break;
                
            case 1:
                z=this.addChunkWalkwayDirPosZ(room,stairX,stairZ,platformBitmap);
                x=this.addChunkWalkwayDirPosX(room,stairX,z,platformBitmap);

                if (this.genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    z=this.addChunkWalkwayDirNegZ(room,x,z,platformBitmap);
                    if (this.genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirNegX(room,x,z,platformBitmap);
                }
                break;
                
            case 2:
                x=this.addChunkWalkwayDirNegX(room,stairX,stairZ,platformBitmap);
                z=this.addChunkWalkwayDirNegZ(room,x,stairZ,platformBitmap);

                if (this.genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    x=this.addChunkWalkwayDirPosX(room,x,z,platformBitmap);
                    if (this.genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirPosZ(room,x,z,platformBitmap);
                }
                break;
                
            case 3:
                z=this.addChunkWalkwayDirNegZ(room,stairX,stairZ,platformBitmap);
                x=this.addChunkWalkwayDirNegX(room,stairX,z,platformBitmap);

                if (this.genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    z=this.addChunkWalkwayDirPosZ(room,x,z,platformBitmap);
                    if (this.genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirPosX(room,x,z,platformBitmap);
                }
                break;
                
        }
        
    }
    
}

