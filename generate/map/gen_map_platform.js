"use strict";

//
// map platforms
//

class GenRoomPlatformClass
{
    constructor()
    {
        Object.seal(this);
    }
        
        //
        // add platform chunk
        //
        
    addPlatformChunk(room,x,z,platformBitmap)
    {
        var y=(room.yBound.max-(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH));
        
        var xPlatformBound=new wsBound((room.xBound.min+(x*config.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*config.ROOM_BLOCK_WIDTH)));
        var yPlatformBound=new wsBound(y,(y+config.ROOM_FLOOR_DEPTH));
        var zPlatformBound=new wsBound((room.zBound.min+(z*config.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*config.ROOM_BLOCK_WIDTH)));
        
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,null,false,true,true,true,true,true,true,false,MESH_FLAG_PLATFORM));

            // can now spawn items unto upper grid
            
        room.setPlatformGrid(x,z);

        map.addOverlayPlatform(xPlatformBound,zPlatformBound);
    }
    
        //
        // add lift chunk
        //
        
    addLiftChunk(room,x,z,extraY)
    {
        var meshIdx,movement;
        var liftBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
        var xLiftBound=new wsBound((room.xBound.min+(x*config.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*config.ROOM_BLOCK_WIDTH)));
        var yLiftBound=new wsBound((room.yBound.min-config.ROOM_FLOOR_DEPTH),(room.yBound.max+extraY));
        var zLiftBound=new wsBound((room.zBound.min+(z*config.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*config.ROOM_BLOCK_WIDTH)));

        meshIdx=map.addMesh(MeshPrimitivesClass.createMeshCube(liftBitmap,xLiftBound,yLiftBound,zLiftBound,null,false,true,true,true,true,true,false,false,MESH_FLAG_LIFT));

            // the movement
        
        movement=new MovementClass(meshIdx,true,0);
        movement.addMove(new MoveClass(1500,new wsPoint(0,0,0)));
        movement.addMove(new MoveClass(2000,new wsPoint(0,0,0)));
        movement.addMove(new MoveClass(1500,new wsPoint(0,(config.ROOM_FLOOR_HEIGHT+extraY),0)));
        movement.addMove(new MoveClass(2000,new wsPoint(0,(config.ROOM_FLOOR_HEIGHT+extraY),0)));
        
        map.addMovement(movement); 

            // can't span on this
            
        room.setBlockGrid(x,z);

        map.addOverlayPlatform(xLiftBound,zLiftBound);
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
        
        var platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        
            // random stair direction
            
        stairDir=genRandom.randomIndex(4);
        
            // find a spot for the steps or lifts and add
            // platforms are the first thing we do so we don't need
            // to check for open spots
            
            // liquid rooms always get lifts
        
        stairX=genRandom.randomInt(1,(room.xBlockSize-2));
        stairZ=genRandom.randomInt(1,(room.zBlockSize-2));
        
        if (room.liquid) {
            this.addLiftChunk(room,stairX,stairZ,config.ROOM_BLOCK_WIDTH);
        }
        else {
            this.addLiftChunk(room,stairX,stairZ,0);
        }
        
            // expand from the platform
            
        switch (stairDir) {
            
            case 0:
                x=this.addChunkWalkwayDirPosX(room,stairX,stairZ,platformBitmap);
                z=this.addChunkWalkwayDirPosZ(room,x,stairZ,platformBitmap);

                if (genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    x=this.addChunkWalkwayDirNegX(room,x,z,platformBitmap);
                    if (genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirNegZ(room,x,z,platformBitmap);
                }
                break;
                
            case 1:
                z=this.addChunkWalkwayDirPosZ(room,stairX,stairZ,platformBitmap);
                x=this.addChunkWalkwayDirPosX(room,stairX,z,platformBitmap);

                if (genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    z=this.addChunkWalkwayDirNegZ(room,x,z,platformBitmap);
                    if (genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirNegX(room,x,z,platformBitmap);
                }
                break;
                
            case 2:
                x=this.addChunkWalkwayDirNegX(room,stairX,stairZ,platformBitmap);
                z=this.addChunkWalkwayDirNegZ(room,x,stairZ,platformBitmap);

                if (genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    x=this.addChunkWalkwayDirPosX(room,x,z,platformBitmap);
                    if (genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirPosZ(room,x,z,platformBitmap);
                }
                break;
                
            case 3:
                z=this.addChunkWalkwayDirNegZ(room,stairX,stairZ,platformBitmap);
                x=this.addChunkWalkwayDirNegX(room,stairX,z,platformBitmap);

                if (genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    z=this.addChunkWalkwayDirPosZ(room,x,z,platformBitmap);
                    if (genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirPosX(room,x,z,platformBitmap);
                }
                break;
                
        }
        
    }
    
}

