/* global config, genRandom, map, MeshPrimitivesClass */

"use strict";

//
// generate room wall decoration class
//

class GenRoomDecorationWallsClass
{
    constructor()
    {
        this.WALL_LEFT_FLAG=0x1;
        this.WALL_TOP_FLAG=0x2;
        this.WALL_RIGHT_FLAG=0x4;
        this.WALL_BOTTOM_FLAG=0x8;
        
        Object.seal(this);
    }
        
        //
        // wall
        //
        
    addWall(room,bitmap,x,z,wid,yBound,grid)
    {
        let dx,dz,wallDirection;
        let xBound,zBound;
            
            // the wall location

        dx=room.xBound.min+(x*map.ROOM_BLOCK_WIDTH);
        dz=room.zBound.min+(z*map.ROOM_BLOCK_WIDTH);
        
        wallDirection=genRandom.randomIndex(4);
        
            // the walls
            
        switch (wallDirection) {
            case mapRoomConstants.ROOM_SIDE_LEFT:
                xBound=new wsBound(dx,(dx+wid));
                zBound=new wsBound(dz,(dz+map.ROOM_BLOCK_WIDTH));
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall(dx,dz,dx,(dz+map.ROOM_BLOCK_WIDTH));
                break;
            case mapRoomConstants.ROOM_SIDE_TOP:
                xBound=new wsBound(((dx+map.ROOM_BLOCK_WIDTH)-wid),(dx+map.ROOM_BLOCK_WIDTH));
                zBound=new wsBound(dz,(dz+map.ROOM_BLOCK_WIDTH));
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall((dx+map.ROOM_BLOCK_WIDTH),dz,(dx+map.ROOM_BLOCK_WIDTH),(dz+map.ROOM_BLOCK_WIDTH));
                break;
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                xBound=new wsBound(dx,(dx+map.ROOM_BLOCK_WIDTH));
                zBound=new wsBound(dz,(dz+wid));
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall(dx,dz,(dx+map.ROOM_BLOCK_WIDTH),dz);
                break;
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                xBound=new wsBound(dx,(dx+map.ROOM_BLOCK_WIDTH));
                zBound=new wsBound(((dz+map.ROOM_BLOCK_WIDTH)-wid),(dz+map.ROOM_BLOCK_WIDTH));
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall(dx,(dz+map.ROOM_BLOCK_WIDTH),(dx+map.ROOM_BLOCK_WIDTH),(dz+map.ROOM_BLOCK_WIDTH));
                break;
        }
        
        grid[(z*room.xBlockSize)+x]=1;
    }
    
        //
        // wall decorations mainline
        //

    create(room)
    {
        let storyAdd,wid,high,yBound;
        let x,z,grid,failCount,runCount,bitmap;
        
            // get width and height
            
        wid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.1);
        
        storyAdd=(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH);
        if (room.storyCount<=1) {
            high=storyAdd;
        }
        else {
            high=genRandom.randomInt(storyAdd,(storyAdd*(room.storyCount-1)));
        }

        yBound=new wsBound((room.yBound.max-high),room.yBound.max);
        
            // wall bitmap
            
        bitmap=map.getTexture(map.TEXTURE_TYPE_PILLAR);
        
            // wall panels
            
        failCount=0;
        runCount=0;
        
        grid=new Uint8Array(room.xBlockSize*room.zBlockSize);
            
        while (true) {
            x=genRandom.randomInt(1,(room.xBlockSize-2));
            z=genRandom.randomInt(1,(room.zBlockSize-2));
            
                // if it's an already used grid, it's
                // a failure of a wall start, 10 failures
                // and we stop building
                
            if (grid[(z*room.xBlockSize)+x]!==0) {
                failCount++;
                if (failCount>=10) break;
            }
            
                // build the wall
                
            this.addWall(room,bitmap,x,z,wid,yBound,grid);
            
                // only a couple runs
                
            runCount++;
            if (runCount>4) break;
        }
    }

}
