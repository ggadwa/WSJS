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
        // add stair chunk
        //
        
    addStairChunk(room,dir,x,z,story,platformBitmap)
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
        
            // if not at the bottom story, then we need to build a
            // tower to the stairs
            
        if (story!==0) {
            yBound.min=yBound.max;
            yBound.max=room.yBound.max;
            map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xBound,yBound,zBound,null,false,true,true,true,true,false,false,false,map.MESH_FLAG_STAIR));
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
    
    create(room)
    {
        let n,k,x,z,x2,z2,y,stairX,stairZ,dir,orgDir,dirCount;
        let platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        
            // starting spot for first staircase
        
        x=genRandom.randomInBetween(2,(room.xBlockSize-2));
        z=genRandom.randomInBetween(2,(room.zBlockSize-2));
        
            // start with a random direction, the next
            // stairs up has to be same direction as platform
            // travel
            
        dir=genRandom.randomIndex(4);
        
            // build up the stories
        
        for (n=0;n!==(room.storyCount-1);n++) {
            
                // stair to next level
                // remember stairs so we don't cross it
                
            this.addStairChunk(room,dir,x,z,n,platformBitmap);
            
            stairX=x;
            stairZ=z;
            
                // platform connected to stairs
                
            x=this.moveDirX(dir,x);
            z=this.moveDirZ(dir,z);
            
            this.addPlatformChunk(room,x,z,(n+1),platformBitmap);
            
                // random platform chunks
                
            dirCount=genRandom.randomInt(3,6);
            
            for (k=0;k!==dirCount;k++) {
                
                    // find a place that's legal
                    // don't cross over self, or stairs, or lifts
                    
                dir=orgDir=genRandom.randomIndex(4);
                
                while (true) {
                    x2=this.moveDirX(dir,x);
                    z2=this.moveDirZ(dir,z);

                    if (((x2===stairX) && (z2===stairZ)) || (!room.checkBlockGrid((n+1),x2,z2)) || (room.checkBlockGrid(0,x2,z2)) || (x2<0) || (z2<0) || (x2>(room.xBlockSize-1)) || (z2>(room.zBlockSize-1))) {
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
            }
            
                // move forward for the next stairs
                
            x=this.moveDirX(dir,x);
            z=this.moveDirZ(dir,z);
        }
        
    }
    
}

