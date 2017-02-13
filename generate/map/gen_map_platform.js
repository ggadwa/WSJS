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
            // and block off in front of the stairs
            
        room.setBlockGrid(0,x,z);
        
        switch (dir) {
            case mapRoomConstants.ROOM_SIDE_LEFT:
                x++;
                if (x<room.xBlockSize) room.setBlockGrid(0,x,z);
                break;
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                x--;
                if (x>=0) room.setBlockGrid(0,x,z);
                break;
            case mapRoomConstants.ROOM_SIDE_TOP:
                z++;
                if (z<room.zBlockSize) room.setBlockGrid(0,x,z);
                break;
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                z--;
                if (z>=0) room.setBlockGrid(0,x,z);
                break;
        }
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
        // platform from connecting room
        //
        
    createConnectRoomPlatform(room,platformBitmap)
    {
        let x,z,min,max;
        let xAdd,zAdd,xEnd,zEnd;
        let connectStory;
        
            // find place to start platform
            
        switch (room.mainPathSide) {

            case mapRoomConstants.ROOM_SIDE_LEFT:
                x=room.xBlockSize-1;
                xAdd=-1;
                zAdd=0;
                xEnd=0;
                zEnd=0;
                break;

            case mapRoomConstants.ROOM_SIDE_TOP:
                z=room.zBlockSize-1;
                xAdd=0;
                zAdd=-1;
                xEnd=0;
                zEnd=0;
                break;

            case mapRoomConstants.ROOM_SIDE_RIGHT:
                x=0;
                xAdd=1;
                zAdd=0;
                xEnd=room.xBlockSize-1;
                zEnd=0;
                break;

            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                z=0;
                xAdd=0;
                zAdd=1;
                xEnd=0;
                zEnd=room.zBlockSize-1;
                break;

        }
        
        if ((room.mainPathSide===mapRoomConstants.ROOM_SIDE_LEFT) || (room.mainPathSide===mapRoomConstants.ROOM_SIDE_RIGHT)) {
            min=0;
            if (room.mainPathConnectedRoom.zBound.min>room.zBound.min) min=Math.trunc((room.mainPathConnectedRoom.zBound.min-room.zBound.min)/map.ROOM_BLOCK_WIDTH);
            
            max=room.zBlockSize;
            if (room.mainPathConnectedRoom.zBound.max<room.zBound.max) max=Math.trunc((room.mainPathConnectedRoom.zBound.max-room.zBound.min)/map.ROOM_BLOCK_WIDTH);
            
            z=genRandom.randomInBetween(min,(max-1));
        }
        else {
            min=0;
            if (room.mainPathConnectedRoom.xBound.min>room.xBound.min) min=Math.trunc((room.mainPathConnectedRoom.xBound.min-room.xBound.min)/map.ROOM_BLOCK_WIDTH);
            
            max=room.xBlockSize;
            if (room.mainPathConnectedRoom.xBound.max<room.xBound.max) max=Math.trunc((room.mainPathConnectedRoom.xBound.max-room.xBound.min)/map.ROOM_BLOCK_WIDTH);
            
            x=genRandom.randomInBetween(min,(max-1));
        }
        
            // get story for this platform
            
        connectStory=Math.trunc((room.yBound.max-room.mainPathConnectedRoom.yBound.max)/(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH));
        
            // now build towards other side
            
        while (true) {
           if  (!room.checkBlockGrid(connectStory,x,z)) break;
           
            this.addPlatformChunk(room,x,z,connectStory,platformBitmap);
            x+=xAdd;
            if (x===xEnd) break;
            z+=zAdd;
            if (z===zEnd) break;
        }
    }
    
        //
        // create random platforms
        // 
    
    createRandomPlatforms(room,platformBitmap)
    {
        let n,k,x,z,x2,z2,stairX,stairZ,dir,orgDir,dirCount;
        let dirStack,item,connectStory;
        
            // starting spot for first staircase
        
        x=genRandom.randomInBetween(2,(room.xBlockSize-2));
        z=genRandom.randomInBetween(2,(room.zBlockSize-2));
        
            // the story that the connecting room is on
            
        connectStory=Math.trunc((room.yBound.max-room.mainPathConnectedRoom.yBound.max)/(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH));
        
            // start with a random direction, the next
            // stairs up has to be same direction as platform
            // travel
            
        dir=genRandom.randomIndex(4);
        
            // build up the stories
        
        for (n=0;n<connectStory;n++) {
            
                // stair to next level
                // remember stairs so we don't cross it
                
            this.addStairChunk(room,dir,x,z,n,platformBitmap);
            
            stairX=x;
            stairZ=z;
            
                // platform connected to stairs
                
            x=this.moveDirX(dir,x);
            z=this.moveDirZ(dir,z);
            
            this.addPlatformChunk(room,x,z,(n+1),platformBitmap);
            
                // we keep a list of the platform
                // chunks we've made so we can backup
                // the stack if we get caught
                
            dirStack=[];
            dirStack.push({x:x,z:z});
            
                // random platform chunks
                
            dirCount=genRandom.randomInt(4,8);
            
            for (k=0;k!==dirCount;k++) {
                
                    // find a place that's legal
                    // don't cross over self or stairs
                    
                dir=orgDir=genRandom.randomIndex(4);
                
                while (true) {
                    x2=this.moveDirX(dir,x);
                    z2=this.moveDirZ(dir,z);

                    if (((x2===stairX) && (z2===stairZ)) || (!room.checkBlockGrid((n+1),x2,z2)) || (room.checkBlockGrid(0,x2,z2)) || (x2<0) || (z2<0) || (x2>(room.xBlockSize-1)) || (z2>(room.zBlockSize-1))) {
                        dir++;
                        if (dir>3) dir=0;
                        
                            // if we get back to the original direction,
                            // then we've wrapped back in on ourselves
                            // so back one up on the list
                            
                        if (dir===orgDir) {
                            if (dirStack.length===0) return;        // completely out of options, bail
                            item=dirStack.pop();
                            x=item.x;
                            z=item.z;
                            dir=orgDir;
                            continue;
                        }
                        
                        continue;
                    }
                    
                    break;
                }
                
                    // create the platform
                    
                x=x2;
                z=z2;
                
                this.addPlatformChunk(room,x,z,(n+1),platformBitmap);
                
                dirStack.push({x:x,z:z});
            }
            
                // move forward for the next stairs
                
            x=this.moveDirX(dir,x);
            z=this.moveDirZ(dir,z);
            
                // if the stairs will head into a wall, put down an extra platform
                // chunk and turn the stairs against the wall
            
            switch (dir) {
                case mapRoomConstants.ROOM_SIDE_LEFT:
                    if (x===0) {
                        this.addPlatformChunk(room,x,z,(n+1),platformBitmap);
                        dir=(z>Math.trunc(room.zBlockSize*0.5))?mapRoomConstants.ROOM_SIDE_TOP:mapRoomConstants.ROOM_SIDE_BOTTOM;
                        x=this.moveDirX(dir,x);
                        z=this.moveDirZ(dir,z);
                    }
                    break;
                case mapRoomConstants.ROOM_SIDE_RIGHT:
                    if (x===(room.xBlockSize-1)) {
                        this.addPlatformChunk(room,x,z,(n+1),platformBitmap);
                        dir=(z>Math.trunc(room.zBlockSize*0.5))?mapRoomConstants.ROOM_SIDE_TOP:mapRoomConstants.ROOM_SIDE_BOTTOM;
                        x=this.moveDirX(dir,x);
                        z=this.moveDirZ(dir,z);
                    }
                    break;
                case mapRoomConstants.ROOM_SIDE_TOP:
                    if (z===0) {
                        this.addPlatformChunk(room,x,z,(n+1),platformBitmap);
                        dir=(x>Math.trunc(room.xBlockSize*0.5))?mapRoomConstants.ROOM_SIDE_LEFT:mapRoomConstants.ROOM_SIDE_RIGHT;
                        x=this.moveDirX(dir,x);
                        z=this.moveDirZ(dir,z);
                    }
                    break;
                case mapRoomConstants.ROOM_SIDE_BOTTOM:
                    if (z===(room.zBlockSize-1)) {
                        this.addPlatformChunk(room,x,z,(n+1),platformBitmap);
                        dir=(x>Math.trunc(room.xBlockSize*0.5))?mapRoomConstants.ROOM_SIDE_LEFT:mapRoomConstants.ROOM_SIDE_RIGHT;
                        x=this.moveDirX(dir,x);
                        z=this.moveDirZ(dir,z);
                    }
                    break;
            }
        }
    }
    
        //
        // create mainline
        //
        
    create(room)
    {
        let platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);

        this.createRandomPlatforms(room,platformBitmap);
        this.createConnectRoomPlatform(room,platformBitmap);
    }
}

