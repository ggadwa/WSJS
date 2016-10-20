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
            
        room.setBlockGrid(0,x,z);

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
            // a cleared spot is a spot that's open
            
        room.clearBlockGrid(story,x,z);

        map.addOverlayPlatform(xPlatformBound,zPlatformBound);
    }
        
        //
        // platform types
        //
    
    addPlatformHalfFloorX(room,liftX,liftZ,story,platformBitmap)
    {
        var x,z,sz,ez;
        
        if (liftZ<Math.trunc(room.zBlockSize/2)) {
            sz=0;
            ez=liftZ;
        }
        else {
            sz=liftZ+1;
            ez=room.zBlockSize;
        }
        
        for (z=sz;z<ez;z++) {
            for (x=0;x!=room.xBlockSize;x++) {
                this.addPlatformChunk(room,x,z,story,platformBitmap);
            }
        }
        
        for (x=0;x!=room.xBlockSize;x++) {
            if (x!==liftX) this.addPlatformChunk(room,x,liftZ,story,platformBitmap);
        }
    }
    
    addPlatformHalfFloorZ(room,liftX,liftZ,story,platformBitmap)
    {
        var x,z,sx,ex;
        
        if (liftX<Math.trunc(room.xBlockSize/2)) {
            sx=0;
            ex=liftX;
        }
        else {
            sx=liftX+1;
            ex=room.xBlockSize;
        }
        
        for (x=sx;x<ex;x++) {
            for (z=0;z!=room.zBlockSize;z++) {
                this.addPlatformChunk(room,x,z,story,platformBitmap);
            }
        }
        
        for (z=0;z!=room.zBlockSize;z++) {
            if (z!==liftZ) this.addPlatformChunk(room,liftX,z,story,platformBitmap);
        }
    }
    
    addPlatformOutsideCircle(room,liftX,liftZ,story,platformBitmap)
    {
        var x,z;
        
            // outside
            
        for (x=0;x!=room.xBlockSize;x++) {
            this.addPlatformChunk(room,x,0,story,platformBitmap);
            this.addPlatformChunk(room,x,(room.zBlockSize-1),story,platformBitmap);
        }
        for (z=1;z<(room.zBlockSize-1);z++) {
            this.addPlatformChunk(room,0,z,story,platformBitmap);
            this.addPlatformChunk(room,(room.xBlockSize-1),z,story,platformBitmap);
        }
        
            // possible connections
            
        if (genRandom.randomPercentage(0.5)) {
            for (x=1;x<liftX;x++) {
                this.addPlatformChunk(room,x,liftZ,story,platformBitmap);
            }
        }
        if (genRandom.randomPercentage(0.5)) {
            for (x=(liftX+1);x<(room.xBlockSize-1);x++) {
                this.addPlatformChunk(room,x,liftZ,story,platformBitmap);
            }
        }
        if (genRandom.randomPercentage(0.5)) {
            for (z=1;z<liftZ;z++) {
                this.addPlatformChunk(room,liftX,z,story,platformBitmap);
            }
        }
        if (genRandom.randomPercentage(0.5)) {
            for (z=(liftZ+1);z<(room.zBlockSize-1);z++) {
                this.addPlatformChunk(room,liftX,z,story,platformBitmap);
            }
        }
    }
    
    addPlatformCrossRoomX(room,liftX,liftZ,story,platformBitmap)
    {
        var x,z;
        
        for (x=1;x<liftX;x++) {
            this.addPlatformChunk(room,x,liftZ,story,platformBitmap);
        }
        for (x=(liftX+1);x<(room.xBlockSize-1);x++) {
            this.addPlatformChunk(room,x,liftZ,story,platformBitmap);
        }
        
        for (z=0;z<room.zBlockSize;z++) {
            this.addPlatformChunk(room,0,z,story,platformBitmap);
            this.addPlatformChunk(room,(room.xBlockSize-1),z,story,platformBitmap);
        }
    }
    
    addPlatformCrossRoomZ(room,liftX,liftZ,story,platformBitmap)
    {
        var x,z;
        
        for (z=1;z<liftZ;z++) {
            this.addPlatformChunk(room,liftX,z,story,platformBitmap);
        }
        for (z=(liftZ+1);z<(room.zBlockSize-1);z++) {
            this.addPlatformChunk(room,liftX,z,story,platformBitmap);
        }
        
        for (x=0;x<room.xBlockSize;x++) {
            this.addPlatformChunk(room,x,0,story,platformBitmap);
            this.addPlatformChunk(room,x,(room.zBlockSize-1),story,platformBitmap);
        }
    }
    
        //
        // create platforms
        // 
    
    create(room)
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
            
            switch (genRandom.randomIndex(5)) {
                case 0:
                    this.addPlatformHalfFloorX(room,liftX,liftZ,(n+1),platformBitmap);
                    break;
                case 1:
                    this.addPlatformHalfFloorZ(room,liftX,liftZ,(n+1),platformBitmap);
                    break;
                case 2:
                    this.addPlatformOutsideCircle(room,liftX,liftZ,(n+1),platformBitmap);
                    break;
                case 3:
                    this.addPlatformCrossRoomX(room,liftX,liftZ,(n+1),platformBitmap);
                    break;
                case 4:
                    this.addPlatformCrossRoomZ(room,liftX,liftZ,(n+1),platformBitmap);
                    break;
            }
        }
        
    }
    
}

