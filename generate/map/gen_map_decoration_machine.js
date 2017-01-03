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
        
    addComputer(room,pnt)
    {
        let computerWid;
        let boundX,boundY,boundZ;
        let computerBitmap,platformBitmap;
            
            // the machine textures

        computerBitmap=map.getTexture(map.TEXTURE_TYPE_COMPUTER);
        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        
            // computer
            
        computerWid=map.ROOM_BLOCK_WIDTH-genRandom.randomInt(0,Math.trunc(map.ROOM_BLOCK_WIDTH/8));

        boundX=new wsBound(pnt.x,(pnt.x+computerWid));
        boundY=new wsBound((pnt.y-map.ROOM_FLOOR_DEPTH),((pnt.y-map.ROOM_FLOOR_HEIGHT)+map.ROOM_FLOOR_DEPTH));
        boundZ=new wsBound(pnt.z,(pnt.z+computerWid));

        map.addMesh(MeshPrimitivesClass.createMeshCube(computerBitmap,boundX,boundY,boundZ,null,true,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
        
            // the base

        boundX=new wsBound(pnt.x,(pnt.x+map.ROOM_BLOCK_WIDTH));
        boundY=new wsBound(pnt.y,(pnt.y-map.ROOM_FLOOR_DEPTH));
        boundZ=new wsBound(pnt.z,(pnt.z+map.ROOM_BLOCK_WIDTH));

        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,boundX,boundY,boundZ,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
    }
    
        //
        // panels
        //
        
    addPanel(room,pnt,dir)
    {
        let panelWid,ang,mesh,mesh2;
        let boundX,boundY,boundZ;
        let computerBitmap,baseBitmap;
            
            // the machine location
        
        computerBitmap=map.getTexture(map.TEXTURE_TYPE_PANEL);
        baseBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // panel directions and size
            
        panelWid=map.ROOM_BLOCK_WIDTH-genRandom.randomInt(Math.trunc(map.ROOM_BLOCK_WIDTH/5),Math.trunc(map.ROOM_BLOCK_WIDTH/8));

        ang=null;
        
        boundX=new wsBound(pnt.x,(pnt.x+panelWid));
        boundY=new wsBound(pnt.y,(pnt.y-Math.trunc(map.ROOM_FLOOR_HEIGHT*0.3)));
        boundZ=new wsBound(pnt.z,(pnt.z+panelWid));

        switch (dir) {
            case mapRoomConstants.ROOM_SIDE_LEFT:
                ang=new wsPoint(0.0,90.0,0.0);
                boundX.max=boundX.min+Math.trunc(map.ROOM_BLOCK_WIDTH*0.5);
                break;
            case mapRoomConstants.ROOM_SIDE_TOP:
                boundZ.max=boundZ.min+Math.trunc(map.ROOM_BLOCK_WIDTH*0.5);
                break;
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                ang=new wsPoint(0.0,270.0,0.0);
                
                boundX.min=boundX.max-Math.trunc(map.ROOM_BLOCK_WIDTH*0.5);
                break;
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                ang=new wsPoint(0.0,180.0,0.0);
                boundZ.min=boundZ.max-Math.trunc(map.ROOM_BLOCK_WIDTH*0.5);
                break;
        }

            // create mesh
            
        mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);

        boundY.max=boundY.min;
        boundY.min=boundY.max-map.ROOM_FLOOR_DEPTH;
        mesh2=MeshPrimitivesClass.createMeshWedge(baseBitmap,boundX,boundY,boundZ,ang,false,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);

        mesh.combineMesh(mesh2);
        map.addMesh(mesh);

        map.addMesh(MeshPrimitivesClass.createMeshWedge(computerBitmap,boundX,boundY,boundZ,ang,true,false,false,false,true,true,false,map.MESH_FLAG_DECORATION));
    }
    
        //
        // single spot machine
        //
        
    addMachine(room,x,z,xAdd,zAdd,dir)
    {
        let pnt;
        
            // skip any doors or other such blocks
        
        //if (room.checkBlockGrid(0,x,z)) return;
        
            // machine item
            
        pnt=new wsPoint(((room.xBound.min+(x*map.ROOM_BLOCK_WIDTH))+xAdd),room.yBound.max,((room.zBound.min+(z*map.ROOM_BLOCK_WIDTH))+zAdd));
                
        room.setBlockGrid(0,x,z);
                    
        if (genRandom.randomPercentage(0.5)) {
            this.addComputer(room,pnt);
        }
        else {
            this.addPanel(room,pnt,dir);
        }
    }
    
        //
        // computer decorations mainline
        //

    create(room)
    {
        let x,z,pushAdd;
        
        pushAdd=Math.trunc(map.ROOM_BLOCK_WIDTH/2);
        
            // machines are against the edges
            
        for (z=1;z<(room.zBlockSize-1);z++) {
            this.addMachine(room,0,z,-pushAdd,0,mapRoomConstants.ROOM_SIDE_RIGHT);
            this.addMachine(room,(room.xBlockSize-1),z,pushAdd,0,mapRoomConstants.ROOM_SIDE_LEFT);
        }
        
        for (x=1;x<(room.xBlockSize-1);x++) {
            this.addMachine(room,x,0,0,-pushAdd,mapRoomConstants.ROOM_SIDE_BOTTOM);
            this.addMachine(room,x,(room.zBlockSize-1),0,pushAdd,mapRoomConstants.ROOM_SIDE_TOP);
        }
    }

}
