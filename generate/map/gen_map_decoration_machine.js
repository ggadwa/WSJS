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
        let pos,wid,y,computerWid;
        let boundX,boundY,boundZ,baseBoundY;
        let computerBitmap,baseBitmap,platformBitmap;
            
            // computer size setup
            
        wid=Math.trunc(config.ROOM_BLOCK_WIDTH/2);
        
            // the machine location

        pos=room.findAndBlockSpawnPosition(true);
        if (pos===null) return;
        
        computerBitmap=map.getTexture(map.TEXTURE_TYPE_COMPUTER);
        baseBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        
        baseBoundY=new wsBound(pos.y,(pos.y-config.ROOM_FLOOR_DEPTH));
        
            // computer
            
        if (genRandom.randomPercentage(0.5)) {
            computerWid=wid-genRandom.randomInt(0,Math.trunc(config.ROOM_BLOCK_WIDTH/8));
            
            boundX=new wsBound((pos.x-computerWid),(pos.x+computerWid));
            boundY=new wsBound((pos.y-config.ROOM_FLOOR_DEPTH),((pos.y-config.ROOM_FLOOR_HEIGHT)+config.ROOM_FLOOR_DEPTH));
            boundZ=new wsBound((pos.z-computerWid),(pos.z+computerWid));
            
            map.addMesh(MeshPrimitivesClass.createMeshCube(computerBitmap,boundX,boundY,boundZ,null,true,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));
        }
        
            // panel
            
        else {
            computerWid=wid-genRandom.randomInt(Math.trunc(config.ROOM_BLOCK_WIDTH/5),Math.trunc(config.ROOM_BLOCK_WIDTH/8));
            
            boundX=new wsBound((pos.x-computerWid),(pos.x+computerWid));
            boundZ=new wsBound((pos.z-computerWid),(pos.z+computerWid));

            y=pos.y-Math.trunc(config.ROOM_FLOOR_HEIGHT*0.3);

            boundY=new wsBound((pos.y-config.ROOM_FLOOR_DEPTH),y);
            map.addMesh(MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));
            
            boundY.max=boundY.min;
            boundY.min=boundY.max-config.ROOM_FLOOR_DEPTH;
            map.addMesh(MeshPrimitivesClass.createMeshWedge(computerBitmap,boundX,boundY,boundZ,null,false,MESH_FLAG_DECORATION));
        }
        
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
        let n,pieceCount;
        
        pieceCount=room.getDecorationCount();

        for (n=0;n!==pieceCount;n++) {
            this.addComputer(room);
        }
    }

}
