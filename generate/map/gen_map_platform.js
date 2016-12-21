/* global map, config, MeshPrimitivesClass, genRandom, mapRoomConstants */

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
        let n,y;
        let meshIdx,movement,waitMSec;
        let liftBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
        let xLiftBound=new wsBound((room.xBound.min+(x*map.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*map.ROOM_BLOCK_WIDTH)));
        let yLiftBound=new wsBound((room.yBound.min+(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)),room.yBound.max);
        let zLiftBound=new wsBound((room.zBound.min+(z*map.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*map.ROOM_BLOCK_WIDTH)));

        meshIdx=map.addMesh(MeshPrimitivesClass.createMeshCube(liftBitmap,xLiftBound,yLiftBound,zLiftBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_LIFT));
        
            // random wait
            
        waitMSec=genRandom.randomInt(1000,1500);

            // the movement
        
        movement=new MovementClass(meshIdx,true,0);
        
            // going down
        
        y=0;
        
        for (n=0;n<(room.storyCount-1);n++) {
            movement.addMove(new MoveClass(1500,new wsPoint(0,y,0)));
            movement.addMove(new MoveClass(waitMSec,new wsPoint(0,y,0)));
            
            y+=(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH);
        }
        
            // the bottom

        y-=map.ROOM_FLOOR_DEPTH;
        
        movement.addMove(new MoveClass(1500,new wsPoint(0,y,0)));
        movement.addMove(new MoveClass(waitMSec,new wsPoint(0,y,0)));
        
            // going up
        
        y-=map.ROOM_FLOOR_HEIGHT;
        
        for (n=0;n<(room.storyCount-2);n++) {
            movement.addMove(new MoveClass(1500,new wsPoint(0,y,0)));
            movement.addMove(new MoveClass(waitMSec,new wsPoint(0,y,0)));
            
            y-=(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH);
        }
        
        map.addMovement(movement); 

            // can't span on this
            
        room.setBlockGrid(0,x,z);

        map.addOverlayPlatform(xLiftBound,zLiftBound);
    }
    
        //
        // add stair chunk
        //
        
    addStairChunk(room,dir,x,z,story)
    {
        let rx,rz,xBound,yBound,zBound;
        let y=(room.yBound.max-((map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)*story));
        let genRoomStairs=new GenRoomStairsClass();

        rx=room.xBound.min+(x*map.ROOM_BLOCK_WIDTH);
        xBound=new wsBound(rx,(rx+map.ROOM_BLOCK_WIDTH));
        
        yBound=new wsBound((y-(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)),y);
        
        rz=room.zBound.min+(z*map.ROOM_BLOCK_WIDTH);
        zBound=new wsBound(rz,(rz+map.ROOM_BLOCK_WIDTH));
        
        switch (dir) {
            case mapRoomConstants.ROOM_SIDE_LEFT:
                genRoomStairs.createStairsX(xBound,yBound,zBound,true,true,false);
                break;
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                genRoomStairs.createStairsX(xBound,yBound,zBound,true,true,true);
                break;
            case mapRoomConstants.ROOM_SIDE_TOP:
                genRoomStairs.createStairsZ(xBound,yBound,zBound,true,true,false);
                break;
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                genRoomStairs.createStairsZ(xBound,yBound,zBound,true,true,true);
                break;
        }
        
            // block the stairs off from any decorations
            
        room.setBlockGrid(0,x,z);
    }
        
        //
        // add platform chunk
        //
        
    addPlatformChunk(room,x,z,story,platformBitmap)
    {
        let y=(room.yBound.max-((map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)*story));
        
        let xPlatformBound=new wsBound((room.xBound.min+(x*map.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*map.ROOM_BLOCK_WIDTH)));
        let yPlatformBound=new wsBound(y,(y+map.ROOM_FLOOR_DEPTH));
        let zPlatformBound=new wsBound((room.zBound.min+(z*map.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*map.ROOM_BLOCK_WIDTH)));
        
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_PLATFORM));

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
        let x,z,sz,ez;
        
        if (liftZ<Math.trunc(room.zBlockSize/2)) {
            sz=0;
            ez=liftZ;
        }
        else {
            sz=liftZ+1;
            ez=room.zBlockSize;
        }
        
        for (z=sz;z<ez;z++) {
            for (x=0;x!==room.xBlockSize;x++) {
                this.addPlatformChunk(room,x,z,story,platformBitmap);
            }
        }
        
        for (x=0;x!==room.xBlockSize;x++) {
            if (x!==liftX) this.addPlatformChunk(room,x,liftZ,story,platformBitmap);
        }
    }
    
    addPlatformHalfFloorZ(room,liftX,liftZ,story,platformBitmap)
    {
        let x,z,sx,ex;
        
        if (liftX<Math.trunc(room.xBlockSize/2)) {
            sx=0;
            ex=liftX;
        }
        else {
            sx=liftX+1;
            ex=room.xBlockSize;
        }
        
        for (x=sx;x<ex;x++) {
            for (z=0;z!==room.zBlockSize;z++) {
                this.addPlatformChunk(room,x,z,story,platformBitmap);
            }
        }
        
        for (z=0;z!==room.zBlockSize;z++) {
            if (z!==liftZ) this.addPlatformChunk(room,liftX,z,story,platformBitmap);
        }
    }
    
    addPlatformOutsideCircle(room,liftX,liftZ,story,platformBitmap)
    {
        let x,z;
        
            // outside
            
        for (x=0;x!==room.xBlockSize;x++) {
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
        let x,z;
        
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
        let x,z;
        
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
        // utilities to move x/z for direction
        //
        
    moveDirX(dir,x)
    {
        if (dir===mapRoomConstants.ROOM_SIDE_LEFT) return(x-1);
        if (dir===mapRoomConstants.ROOM_SIDE_RIGHT) return(x+1);
        return(x);
    }
    
    moveDirZ(dir,z)
    {
        if (dir===mapRoomConstants.ROOM_SIDE_TOP) return(z-1);
        if (dir===mapRoomConstants.ROOM_SIDE_BOTTOM) return(z+1);
        return(z);
    }
    
        //
        // create platforms
        // 
    
    create(room,yBase)
    {
        let n,k,x,z,x2,z2,y,stairX,stairZ,dir,orgDir;
        let platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        
            // random stair direction
            
        
            // starting spot for first staircase
        
        x=genRandom.randomInt(2,(room.xBlockSize-3));
        z=genRandom.randomInt(2,(room.zBlockSize-3));
        
            // start with a random direction, the next
            // stairs up has to be same direction as platform
            // travel
            
        dir=genRandom.randomIndex(4);
        
            // build up the stories
        
        for (n=0;n!==(room.storyCount-1);n++) {
            
                // stair to next level
                // remember stairs so we don't cross it
                
            this.addStairChunk(room,dir,x,z,n);
            
            stairX=x;
            stairZ=z;
            
                // platform connected to stairs
                
            x=this.moveDirX(dir,x);
            z=this.moveDirZ(dir,z);
            
            this.addPlatformChunk(room,x,z,(n+1),platformBitmap);
            
                // random platform chunks
            
            for (k=0;k!==8;k++) {
                
                    // find a place that's legal
                    // don't cross over self or stairs
                    
                dir=orgDir=genRandom.randomIndex(4);
                
                while (true) {
                    x2=this.moveDirX(dir,x);
                    z2=this.moveDirZ(dir,z);

                    if (((x2===stairX) && (z2===stairZ)) || (!room.checkBlockGrid((n+1),x2,z2)) || (x2<2) || (z2<2) || (x2>(room.xBlockSize-3)) || (z2>(room.zBlockSize-3))) {
                        dir++;
                        if (dir>3) dir=0;
                        if (dir===orgDir) return;           // we failed here, the platform wrapped in on itself
                        
                        continue;
                    }
                    
                    break;
                }
                
                    // create the platform
                    
                x=x2;
                z=z2;
                
                this.addPlatformChunk(room,x,z,(n+1),platformBitmap);
                
                    // if this platform is at the base level
                    // then try to connect to left/right
                /*    
                y=(room.yBound.max-((map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)*(n+1)));
                if (y===yBase) {
                    for (x2=0;x2<x;x2++) {
                        this.addPlatformChunk(room,x2,z,(n+1),platformBitmap);
                    }
                }
                */
            }
            
                // move forward for the next stairs
                
            x=this.moveDirX(dir,x);
            z=this.moveDirZ(dir,z);
        }
        
    }
    
}

