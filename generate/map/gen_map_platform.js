import BoundClass from '../../code/utility/bound.js';
import genRandom from '../../generate/utility/random.js';

//
// map platforms
//

export default class GenRoomPlatformClass
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
        xBound=new BoundClass(rx,(rx+map.ROOM_BLOCK_WIDTH));
        
        yBound=new BoundClass((y-(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)),y);
        
        rz=room.zBound.min+(z*map.ROOM_BLOCK_WIDTH);
        zBound=new BoundClass(rz,(rz+map.ROOM_BLOCK_WIDTH));
        
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
            map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xBound,yBound,zBound,true,true,true,true,false,false,false,map.MESH_FLAG_STAIR));
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
        
        let xPlatformBound=new BoundClass((room.xBound.min+(x*map.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*map.ROOM_BLOCK_WIDTH)));
        let yPlatformBound=new BoundClass(y,(y+map.ROOM_FLOOR_DEPTH));
        let zPlatformBound=new BoundClass((room.zBound.min+(z*map.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*map.ROOM_BLOCK_WIDTH)));
        
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,true,true,true,true,true,true,false,map.MESH_FLAG_PLATFORM));

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
        // platform from connecting room to random platforms
        //
        
    createConnectRoomPlatform(room,platformBitmap,lastStairPos)
    {
        let x,z,x2,z2,min,max;
        let connectStory,dir,orgDir,dirStack,item;
        let hitGrid;
        
            // find place to start platform
            
        if ((room.mainPathSide===mapRoomConstants.ROOM_SIDE_LEFT) || (room.mainPathSide===mapRoomConstants.ROOM_SIDE_RIGHT)) {
            min=0;
            if (room.mainPathConnectedRoom.zBound.min>room.zBound.min) min=Math.trunc((room.mainPathConnectedRoom.zBound.min-room.zBound.min)/map.ROOM_BLOCK_WIDTH);
            
            max=room.zBlockSize;
            if (room.mainPathConnectedRoom.zBound.max<room.zBound.max) max=Math.trunc((room.mainPathConnectedRoom.zBound.max-room.zBound.min)/map.ROOM_BLOCK_WIDTH);
            
            x=(room.mainPathSide===mapRoomConstants.ROOM_SIDE_LEFT)?(room.xBlockSize-1):0;
            z=genRandom.randomInBetween(min,(max-1));
        }
        else {
            min=0;
            if (room.mainPathConnectedRoom.xBound.min>room.xBound.min) min=Math.trunc((room.mainPathConnectedRoom.xBound.min-room.xBound.min)/map.ROOM_BLOCK_WIDTH);
            
            max=room.xBlockSize;
            if (room.mainPathConnectedRoom.xBound.max<room.xBound.max) max=Math.trunc((room.mainPathConnectedRoom.xBound.max-room.xBound.min)/map.ROOM_BLOCK_WIDTH);
            
            x=genRandom.randomInBetween(min,(max-1));
            z=(room.mainPathSide===mapRoomConstants.ROOM_SIDE_TOP)?(room.zBlockSize-1):0;
        }
        
            // get story for this platform
            
        connectStory=Math.trunc((room.yBound.max-room.mainPathConnectedRoom.yBound.max)/(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH));
        
            // if this spot is already taken, then we've
            // already connected, so skip
            
        if (room.checkBlockGrid(connectStory,x2,z2)) return;
        
            // get the current grid for the connecting
            // story so we can see if we hit an old piece
            
        hitGrid=room.copyGrid(connectStory);
        
            // randomly move around until we hit a
            // previous block
        
        this.addPlatformChunk(room,x,z,connectStory,platformBitmap);
        
        dirStack=[];
        dirStack.push({x:x,z:z});
        
        while (true) {
                
                // find a place that's legal
                // don't cross over self or stairs

            item=null;
            dir=orgDir=genRandom.randomIndex(4);

            while (true) {
                x2=this.moveDirX(dir,x);
                z2=this.moveDirZ(dir,z);
                
                    // have we hit original grid?
                    // if so we are done
                
                if ((x2>=0) && (z2>=0) && (x2<room.xBlockSize) && (z2<room.zBlockSize)) {
                    if (hitGrid.getCell(x2,z2)===0) return;
                }
                
                    // see if we've cross ourselves
                    
                if (((lastStairPos.x===x2) && (lastStairPos.z===z2)) || (!room.checkBlockGrid(connectStory,x2,z2)) || (x2<0) || (z2<0) || (x2>(room.xBlockSize-1)) || (z2>(room.zBlockSize-1))) {
                    dir++;
                    if (dir>3) dir=0;

                        // if we get back to the original direction,
                        // then we've wrapped back in on ourselves
                        // so back one up on the list

                    if (dir===orgDir) {
                        if (dirStack.length===0)  return;       // completely out of options, bail
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
            
                // if we had to pop the stack, whatever the
                // last one we popped off the stack needs to
                // go back on so it isn't skipped if we have to
                // reverse again as it may have openings left
            
            if (item!==null) dirStack.push(item);

                // create the platform

            x=x2;
            z=z2;
            
            this.addPlatformChunk(room,x,z,connectStory,platformBitmap);

            dirStack.push({x:x,z:z});
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
                    
                    if (((x2===stairX) && (z2===stairZ)) || (!room.checkBlockGrid((n+1),x2,z2)) || (x2<0) || (z2<0) || (x2>(room.xBlockSize-1)) || (z2>(room.zBlockSize-1))) {
                        dir++;
                        if (dir>3) dir=0;
                        
                            // if we get back to the original direction,
                            // then we've wrapped back in on ourselves
                            // so back one up on the list
                            
                        if (dir===orgDir) {
                            if (dirStack.length===0) return({x:stairX,z:stairZ});        // completely out of options, bail
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
                // you need to turn if we are against a wall
                
            if ((x===0) || (x===(room.xBlockSize-1))) {
                dir=(z<Math.trunc(room.zBlockSize*0.5))?mapRoomConstants.ROOM_SIDE_BOTTOM:mapRoomConstants.ROOM_SIDE_TOP;
            }
            
            if ((z===0) || (z===(room.zBlockSize-1))) {
                dir=(x<Math.trunc(room.xBlockSize*0.5))?mapRoomConstants.ROOM_SIDE_RIGHT:mapRoomConstants.ROOM_SIDE_LEFT;
            }
                
            x=this.moveDirX(dir,x);
            z=this.moveDirZ(dir,z);
        }
        
            // always return the last stair position
            // so we can block that when connecting
            
        return({x:stairX,z:stairZ});
    }
    
        //
        // create mainline
        //
        
    create(room)
    {
        let lastStairPos;
        let platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);

        lastStairPos=this.createRandomPlatforms(room,platformBitmap);
        this.createConnectRoomPlatform(room,platformBitmap,lastStairPos);
    }
}

