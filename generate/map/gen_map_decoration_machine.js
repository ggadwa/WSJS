/* global config, genRandom, map, MeshPrimitivesClass, mapRoomConstants */

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
        let computerBitmap,platformBitmap;
            
            // computer size setup
            
        wid=Math.trunc(map.ROOM_BLOCK_WIDTH/2);
        
            // the machine location

        pos=room.findAndBlockSpawnPosition(true);
        if (pos===null) return;
        
        computerBitmap=map.getTexture(map.TEXTURE_TYPE_COMPUTER);
        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        
        baseBoundY=new wsBound(pos.y,(pos.y-map.ROOM_FLOOR_DEPTH));
        
            // computer
            
        computerWid=wid-genRandom.randomInt(0,Math.trunc(map.ROOM_BLOCK_WIDTH/8));

        boundX=new wsBound((pos.x-computerWid),(pos.x+computerWid));
        boundY=new wsBound((pos.y-map.ROOM_FLOOR_DEPTH),((pos.y-map.ROOM_FLOOR_HEIGHT)+map.ROOM_FLOOR_DEPTH));
        boundZ=new wsBound((pos.z-computerWid),(pos.z+computerWid));

        map.addMesh(MeshPrimitivesClass.createMeshCube(computerBitmap,boundX,boundY,boundZ,null,true,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
        
            // the base

        boundX=new wsBound((pos.x-wid),(pos.x+wid));
        boundZ=new wsBound((pos.z-wid),(pos.z+wid));

        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,boundX,baseBoundY,boundZ,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
    }
    
        //
        // panels
        //
        
    addPanel(room)
    {
        let pos,y,panelWid,ang,dir,mesh,mesh2;
        let boundX,boundY,boundZ;
        let computerBitmap,baseBitmap;
            
            // the machine location

        pos=room.findAndBlockSpawnPosition(true);
        if (pos===null) return;
        
        computerBitmap=map.getTexture(map.TEXTURE_TYPE_PANEL);
        baseBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // panel
            
        panelWid=Math.trunc(map.ROOM_BLOCK_WIDTH/2)-genRandom.randomInt(Math.trunc(map.ROOM_BLOCK_WIDTH/5),Math.trunc(map.ROOM_BLOCK_WIDTH/8));

        ang=null;
        dir=room.getDirectionTowardsCenter(pos);

        switch (dir.direction) {
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                ang=new wsPoint(0.0,180.0,0.0);
                break;
            case mapRoomConstants.ROOM_SIDE_LEFT:
                ang=new wsPoint(0.0,270.0,0.0);
                break;
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                ang=new wsPoint(0.0,90.0,0.0);
                break;
        }

        boundX=new wsBound((pos.x-panelWid),(pos.x+panelWid));
        boundZ=new wsBound((pos.z-panelWid),(pos.z+panelWid));

        y=pos.y-Math.trunc(map.ROOM_FLOOR_HEIGHT*0.3);

        boundY=new wsBound(pos.y,y);
        mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);

        boundY.max=boundY.min;
        boundY.min=boundY.max-map.ROOM_FLOOR_DEPTH;
        mesh2=MeshPrimitivesClass.createMeshWedge(baseBitmap,boundX,boundY,boundZ,ang,false,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);

        mesh.combineMesh(mesh2);
        map.addMesh(mesh);

        map.addMesh(MeshPrimitivesClass.createMeshWedge(computerBitmap,boundX,boundY,boundZ,ang,true,false,false,false,true,true,false,map.MESH_FLAG_DECORATION));
    }
    
        //
        // computer decorations mainline
        //

    create(room)
    {
        let n,pieceCount;
        
        pieceCount=room.getDecorationCount();

        for (n=0;n!==pieceCount;n++) {
            if (genRandom.randomPercentage(0.5)) {
                this.addComputer(room);
            }
            else {
                this.addPanel(room);
            }
        }
    }

}
