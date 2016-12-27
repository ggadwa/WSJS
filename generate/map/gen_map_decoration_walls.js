/* global config, genRandom, map, MeshPrimitivesClass */

"use strict";

//
// generate room wall decoration class
//

class GenRoomDecorationWallsClass
{
    constructor()
    {
        Object.seal(this);
    }
        
        //
        // wall
        //
        
    addWall(room,high)
    {
        let n,x,z,wid;
        let xBound,yBound,zBound;
        let bitmap;
            
            // the wall location

        x=genRandom.randomInt(1,(room.xBlockSize-2));
        z=genRandom.randomInt(1,(room.zBlockSize-2));
        
        if (room.checkBlockGrid(0,x,z)) return;
        
        for (n=1;n!==room.storyCount;n++) {
            if (!room.checkBlockGrid(n,x,z)) return;
        }
        
        x=room.xBound.min+(x*map.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*map.ROOM_BLOCK_WIDTH);

            // size and bitmap
            
        wid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.1);
        yBound=new wsBound((room.yBound.max-high),room.yBound.max);

        bitmap=map.getTexture(map.TEXTURE_TYPE_PILLAR);
        
            // the walls
        
        if (genRandom.randomPercentage(0.5)) {
            xBound=new wsBound(x,(x+wid));
            zBound=new wsBound(z,(z+map.ROOM_BLOCK_WIDTH));
            map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
        }
        
        if (genRandom.randomPercentage(0.5)) {
            xBound=new wsBound(((x+map.ROOM_BLOCK_WIDTH)-wid),(x+map.ROOM_BLOCK_WIDTH));
            zBound=new wsBound(z,(z+map.ROOM_BLOCK_WIDTH));
            map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
        }
        
        if (genRandom.randomPercentage(0.5)) {
            xBound=new wsBound(x,(x+map.ROOM_BLOCK_WIDTH));
            zBound=new wsBound(z,(z+wid));
            map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
        }
        
        if (genRandom.randomPercentage(0.5)) {
            xBound=new wsBound(x,(x+map.ROOM_BLOCK_WIDTH));
            zBound=new wsBound(((z+map.ROOM_BLOCK_WIDTH)-wid),(z+map.ROOM_BLOCK_WIDTH));
            map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
        }
    }
    
        //
        // wall decorations mainline
        //

    create(room)
    {
        let n,storyAdd,high,pieceCount;
        
            // get random height
        
        storyAdd=(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH);
        if (room.storyCount<=1) {
            high=storyAdd;
        }
        else {
            high=genRandom.randomInt(storyAdd,(storyAdd*(room.storyCount-1)));
        }
        
            // wall panels
            
        pieceCount=room.getDecorationCount();
        
        for (n=0;n!==pieceCount;n++) {
            this.addWall(room,high);
        }
    }

}
