/* global config, genRandom, map, MeshPrimitivesClass, MESH_FLAG_DECORATION */

"use strict";

//
// generate room machine decoration class
//

class GenRoomDecorationMachineClass
{
    constructor()
    {
        Object.seal(this);
    }
        
        //
        // computers
        //
        
    addComputer(room)
    {
        var n,pos,wid,computerWid;
        var boundX,boundY,boundZ,baseBoundY;
        var computerBitmap,platformBitmap;
            
            // computer size setup
            
        wid=Math.trunc(config.ROOM_BLOCK_WIDTH/2);
        computerWid=wid-genRandom.randomInt(0,Math.trunc(config.ROOM_BLOCK_WIDTH/8));
        
            // the machine location

        pos=room.findAndBlockSpawnPosition();
        if (pos===null) return;
        
        computerBitmap=map.getTexture(map.TEXTURE_TYPE_COMPUTER);
        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        
        boundX=new wsBound((pos.x-computerWid),(pos.x+computerWid));
        boundZ=new wsBound((pos.z-computerWid),(pos.z+computerWid));

        baseBoundY=new wsBound(pos.y,(pos.y-config.ROOM_FLOOR_DEPTH));
        boundY=new wsBound((pos.y-config.ROOM_FLOOR_DEPTH),((pos.y-config.ROOM_FLOOR_HEIGHT)+config.ROOM_FLOOR_DEPTH));
        
            // computer
        
        map.addMesh(MeshPrimitivesClass.createMeshCube(computerBitmap,boundX,boundY,boundZ,null,true,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));

            // the base

        boundX=new wsBound((pos.x-wid),(pos.x+wid));
        boundZ=new wsBound((pos.z-wid),(pos.z+wid));

        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,boundX,baseBoundY,boundZ,null,false,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));
    }
    
        //
        // computer decorations mainline
        //

    create(room)
    {
        var n,pieceCount;
        
        pieceCount=room.getDecorationCount();

        for (n=0;n!==pieceCount;n++) {
            this.addComputer(room);
        }
    }

}
