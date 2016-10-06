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
        // add lift chunk
        //
        
    addLiftChunk(room,x,z)
    {
        var n,y;
        var meshIdx,movement,waitMSec;
        var liftBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
        var xLiftBound=new wsBound((room.xBound.min+(x*config.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*config.ROOM_BLOCK_WIDTH)));
        var yLiftBound=new wsBound((room.yBound.min+(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH)),room.yBound.max);
        var zLiftBound=new wsBound((room.zBound.min+(z*config.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*config.ROOM_BLOCK_WIDTH)));

        meshIdx=map.addMesh(MeshPrimitivesClass.createMeshCube(liftBitmap,xLiftBound,yLiftBound,zLiftBound,null,false,true,true,true,true,true,false,false,MESH_FLAG_LIFT));
        
            // random wait
            
        waitMSec=genRandom.randomInt(1000,1500);

            // the movement
        
        movement=new MovementClass(meshIdx,true,0);
        
            // going down
        
        y=0;
        
        for (n=0;n<(room.storyCount-1);n++) {
            movement.addMove(new MoveClass(1500,new wsPoint(0,y,0)));
            movement.addMove(new MoveClass(waitMSec,new wsPoint(0,y,0)));
            
            y+=(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH);
        }
        
            // the bottom

        y-=config.ROOM_FLOOR_DEPTH;
        
        movement.addMove(new MoveClass(1500,new wsPoint(0,y,0)));
        movement.addMove(new MoveClass(waitMSec,new wsPoint(0,y,0)));
        
            // going up
        
        y-=config.ROOM_FLOOR_HEIGHT;
        
        for (n=0;n<(room.storyCount-2);n++) {
            movement.addMove(new MoveClass(1500,new wsPoint(0,y,0)));
            movement.addMove(new MoveClass(waitMSec,new wsPoint(0,y,0)));
            
            y-=(config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH);
        }
        
        map.addMovement(movement); 

            // can't span on this
            
        room.setBlockGrid(x,z);

        map.addOverlayPlatform(xLiftBound,zLiftBound);
    }
        
        //
        // add platform chunk
        //
        
    addPlatformChunk(room,x,z,story,platformBitmap)
    {
        var y=(room.yBound.max-((config.ROOM_FLOOR_HEIGHT+config.ROOM_FLOOR_DEPTH)*story));
        
        var xPlatformBound=new wsBound((room.xBound.min+(x*config.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*config.ROOM_BLOCK_WIDTH)));
        var yPlatformBound=new wsBound(y,(y+config.ROOM_FLOOR_DEPTH));
        var zPlatformBound=new wsBound((room.zBound.min+(z*config.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*config.ROOM_BLOCK_WIDTH)));
        
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,null,false,true,true,true,true,true,true,false,MESH_FLAG_PLATFORM));

            // can now spawn items unto upper grid
            
        room.setPlatformGrid(x,z);

        map.addOverlayPlatform(xPlatformBound,zPlatformBound);
    }
    
        //
        // walkways
        //
        
    addChunkWalkwayDirPosX(room,liftX,liftZ,story,platformBitmap)
    {
        var x;
        
        for (x=(liftX+1);x<room.xBlockSize;x++) {
            this.addPlatformChunk(room,x,liftZ,story,platformBitmap);
        }
        
        return(room.xBlockSize-1);
    }
    
    addChunkWalkwayDirPosZ(room,liftX,liftZ,story,platformBitmap)
    {
        var z;
        
        for (z=(liftZ+1);z<room.zBlockSize;z++) {
            this.addPlatformChunk(room,liftX,z,story,platformBitmap);
        }
        
        return(room.zBlockSize-1);
    }
    
    addChunkWalkwayDirNegX(room,liftX,liftZ,story,platformBitmap)
    {
        var x;
        
        for (x=(liftX-1);x>=0;x--) {
            this.addPlatformChunk(room,x,liftZ,story,platformBitmap);
        }
        
        return(0);
    }
    
    addChunkWalkwayDirNegZ(room,liftX,liftZ,story,platformBitmap)
    {
        var z;
        
        for (z=(liftZ-1);z>=0;z--) {
            this.addPlatformChunk(room,liftX,z,story,platformBitmap);
        }
        
        return(0);
    }
    
    addWalkwayOuterPath(room,liftX,liftZ,story,platformBitmap)
    {
        var x,z;
        
        switch (genRandom.randomIndex(4)) {
            
            case 0:
                x=this.addChunkWalkwayDirPosX(room,liftX,liftZ,story,platformBitmap);
                z=this.addChunkWalkwayDirPosZ(room,x,liftZ,story,platformBitmap);

                if (genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    x=this.addChunkWalkwayDirNegX(room,x,z,story,platformBitmap);
                    if (genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirNegZ(room,x,z,story,platformBitmap);
                }
                break;
                
            case 1:
                z=this.addChunkWalkwayDirPosZ(room,liftX,liftZ,story,platformBitmap);
                x=this.addChunkWalkwayDirPosX(room,liftX,z,story,platformBitmap);

                if (genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    z=this.addChunkWalkwayDirNegZ(room,x,z,story,platformBitmap);
                    if (genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirNegX(room,x,z,story,platformBitmap);
                }
                break;
                
            case 2:
                x=this.addChunkWalkwayDirNegX(room,liftX,liftZ,story,platformBitmap);
                z=this.addChunkWalkwayDirNegZ(room,x,liftZ,story,platformBitmap);

                if (genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    x=this.addChunkWalkwayDirPosX(room,x,z,story,platformBitmap);
                    if (genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirPosZ(room,x,z,story,platformBitmap);
                }
                break;
                
            case 3:
                z=this.addChunkWalkwayDirNegZ(room,liftX,liftZ,story,platformBitmap);
                x=this.addChunkWalkwayDirNegX(room,liftX,z,story,platformBitmap);

                if (genRandom.randomPercentage(config.ROOM_PLATFORM_2ND_PERCENTAGE)) {
                    z=this.addChunkWalkwayDirPosZ(room,x,z,story,platformBitmap);
                    if (genRandom.randomPercentage(config.ROOM_PLATFORM_3RD_PERCENTAGE)) this.addChunkWalkwayDirPosX(room,x,z,story,platformBitmap);
                }
                break;

        }
    }
    
    addWalkwayRadial(room,liftX,liftZ,story,platformBitmap)
    {
        switch (genRandom.randomIndex(3)) {
            case 0:
                this.addChunkWalkwayDirPosX(room,liftX,liftZ,story,platformBitmap);
                this.addChunkWalkwayDirNegX(room,liftX,liftZ,story,platformBitmap);
                break;
            case 1:
                this.addChunkWalkwayDirPosZ(room,liftX,liftZ,story,platformBitmap);
                this.addChunkWalkwayDirNegZ(room,liftX,liftZ,story,platformBitmap);
                break;
            case 2:
                this.addChunkWalkwayDirPosX(room,liftX,liftZ,story,platformBitmap);
                this.addChunkWalkwayDirNegX(room,liftX,liftZ,story,platformBitmap);
                this.addChunkWalkwayDirPosZ(room,liftX,liftZ,story,platformBitmap);
                this.addChunkWalkwayDirNegZ(room,liftX,liftZ,story,platformBitmap);
                break;
        }
    }
    
        //
        // create platforms
        // 
    
    createPlatforms(room)
    {
        var n,liftX,liftZ;
        
        var platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        
            // random stair direction
            
        
            // find a spot for the lifts and add
            // platforms are the first thing we do so we don't need
            // to check for open spots
        
        liftX=genRandom.randomInt(1,(room.xBlockSize-2));
        liftZ=genRandom.randomInt(1,(room.zBlockSize-2));
        
        this.addLiftChunk(room,liftX,liftZ);
        
            // expand walkways from the lift
        
        for (n=0;n!=(room.storyCount-1);n++) {
            if (genRandom.randomPercentage(0.5)) {
                this.addWalkwayOuterPath(room,liftX,liftZ,(n+1),platformBitmap);
            }
            else {
                this.addWalkwayRadial(room,liftX,liftZ,(n+1),platformBitmap);
            }
        }
        
    }
    
}

