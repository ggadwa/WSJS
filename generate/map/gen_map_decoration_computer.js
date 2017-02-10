/* global config, genRandom, map, MeshPrimitivesClass, mapRoomConstants */

"use strict";

//
// generate room computer decoration class
//

class GenRoomDecorationComputerClass
{
    constructor()
    {
        Object.seal(this);
    }
        
        //
        // computers
        //
        
    addComputer(room,pnt,dir)
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

        map.addMesh(MeshPrimitivesClass.createMeshCube(computerBitmap,boundX,boundY,boundZ,null,true,(dir!==mapRoomConstants.ROOM_SIDE_LEFT),(dir!==mapRoomConstants.ROOM_SIDE_RIGHT),(dir!==mapRoomConstants.ROOM_SIDE_TOP),(dir!==mapRoomConstants.ROOM_SIDE_BOTTOM),true,false,false,map.MESH_FLAG_DECORATION));
        
            // the base

        boundX=new wsBound(pnt.x,(pnt.x+map.ROOM_BLOCK_WIDTH));
        boundY=new wsBound(pnt.y,(pnt.y-map.ROOM_FLOOR_DEPTH));
        boundZ=new wsBound(pnt.z,(pnt.z+map.ROOM_BLOCK_WIDTH));

        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,boundX,boundY,boundZ,null,false,(dir!==mapRoomConstants.ROOM_SIDE_LEFT),(dir!==mapRoomConstants.ROOM_SIDE_RIGHT),(dir!==mapRoomConstants.ROOM_SIDE_TOP),(dir!==mapRoomConstants.ROOM_SIDE_BOTTOM),true,false,false,map.MESH_FLAG_DECORATION));
    }
    
        //
        // control panels
        //
        
    addPanel(room,pnt,dir)
    {
        let panelMargin,ang,mesh,mesh2;
        let boundX,boundY,boundZ;
        let computerBitmap,baseBitmap;
            
            // the machine location
        
        computerBitmap=map.getTexture(map.TEXTURE_TYPE_PANEL);
        baseBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // panel directions and size
            
        panelMargin=genRandom.randomInt(Math.trunc(map.ROOM_BLOCK_WIDTH/5),Math.trunc(map.ROOM_BLOCK_WIDTH/8));

        boundY=new wsBound(pnt.y,(pnt.y-Math.trunc(map.ROOM_FLOOR_HEIGHT*0.3)));

        switch (dir) {
            
            case mapRoomConstants.ROOM_SIDE_LEFT:
                ang=new wsPoint(0.0,270.0,0.0);
                boundX=new wsBound(pnt.x,((pnt.x+map.ROOM_BLOCK_WIDTH)-(panelMargin*2)));
                boundZ=new wsBound((pnt.z+panelMargin),((pnt.z+map.ROOM_BLOCK_WIDTH)-panelMargin));
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,false,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
                break;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                ang=new wsPoint(0.0,180.0,0.0);
                boundX=new wsBound((pnt.x+panelMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-panelMargin));
                boundZ=new wsBound(pnt.z,((pnt.z+map.ROOM_BLOCK_WIDTH)-(panelMargin*2)));
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,true,false,true,false,false,false,map.MESH_FLAG_DECORATION);
                break;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                ang=new wsPoint(0.0,90.0,0.0);
                boundX=new wsBound(((pnt.x+map.ROOM_BLOCK_WIDTH)-(panelMargin*2)),(pnt.x+map.ROOM_BLOCK_WIDTH));
                boundZ=new wsBound((pnt.z+panelMargin),((pnt.z+map.ROOM_BLOCK_WIDTH)-panelMargin));
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,false,true,true,false,false,false,map.MESH_FLAG_DECORATION);
                break;
                
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                ang=new wsPoint(0.0,0.0,0.0);
                boundX=new wsBound((pnt.x+panelMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-panelMargin));
                boundZ=new wsBound(((pnt.z+map.ROOM_BLOCK_WIDTH)-(panelMargin*2)),(pnt.z+map.ROOM_BLOCK_WIDTH));
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,true,true,false,false,false,false,map.MESH_FLAG_DECORATION);
                break;
        }

            // create top of panel
            
        boundY.max=boundY.min;
        boundY.min=boundY.max-map.ROOM_FLOOR_DEPTH;
        
        mesh2=MeshPrimitivesClass.createMeshWedge(baseBitmap,boundX,boundY,boundZ,ang,false,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
        mesh.combineMesh(mesh2);
        map.addMesh(mesh);
        
        map.addMesh(MeshPrimitivesClass.createMeshWedge(computerBitmap,boundX,boundY,boundZ,ang,true,false,false,false,true,true,false,map.MESH_FLAG_DECORATION));
    }
    
        //
        // junctions
        //
        
    addJunction(room,pnt,dir)
    {
        let juncMargin,juncWid,pipeRadius,pipeHigh;
        let boundX,boundY,boundZ,pipeBoundY,centerPnt;
        let baseBitmap,pipeBitmap;
            
            // junction textures

        baseBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        pipeBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // junction sizes
            
        juncMargin=genRandom.randomInt(Math.trunc(map.ROOM_BLOCK_WIDTH/5),Math.trunc(map.ROOM_BLOCK_WIDTH/8));
        juncWid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.2);
        
        pipeRadius=Math.trunc(map.ROOM_BLOCK_WIDTH*0.05);
        pipeHigh=Math.trunc(map.ROOM_FLOOR_HEIGHT*0.3);

        boundY=new wsBound((pnt.y-pipeHigh),(pnt.y-map.ROOM_FLOOR_HEIGHT));
        
        if (genRandom.randomPercentage(0.5)) {
            pipeBoundY=new wsBound((pnt.y-pipeHigh),pnt.y);
        }
        else {
            pipeBoundY=new wsBound(room.yBound.min,(pnt.y-pipeHigh));
        }
        
            // the junction
            
        switch (dir) {
            
            case mapRoomConstants.ROOM_SIDE_LEFT:
                boundX=new wsBound(pnt.x,(pnt.x+juncWid));
                boundZ=new wsBound((pnt.z+juncMargin),((pnt.z+map.ROOM_BLOCK_WIDTH)-juncMargin));
                map.addMesh(MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,false,true,true,true,false,false,false,map.MESH_FLAG_DECORATION));
                break;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                boundX=new wsBound((pnt.x+juncMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-juncMargin));
                boundZ=new wsBound(pnt.z,(pnt.z+juncWid));
                map.addMesh(MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,true,false,true,false,false,false,map.MESH_FLAG_DECORATION));
                break;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                boundX=new wsBound(((pnt.x+map.ROOM_BLOCK_WIDTH)-juncWid),(pnt.x+map.ROOM_BLOCK_WIDTH));
                boundZ=new wsBound((pnt.z+juncMargin),((pnt.z+map.ROOM_BLOCK_WIDTH)-juncMargin));
                map.addMesh(MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,false,true,true,false,false,false,map.MESH_FLAG_DECORATION));
                break;
                
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                boundX=new wsBound((pnt.x+juncMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-juncMargin));
                boundZ=new wsBound(((pnt.z+map.ROOM_BLOCK_WIDTH)-juncWid),(pnt.z+map.ROOM_BLOCK_WIDTH));
                map.addMesh(MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,true,true,false,false,false,false,map.MESH_FLAG_DECORATION));
                break;
        }
        
            // the pipe
        
        centerPnt=new wsPoint(boundX.getMidPoint(),pnt.y,boundZ.getMidPoint());
        map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(pipeBitmap,centerPnt,pipeBoundY,pipeRadius,map.MESH_FLAG_DECORATION));
    }
    
        //
        // single spot piece
        //
        
    addPiece(room,x,z,dir)
    {
        let pnt;
        
            // only put on legal edges
        
        if (room.getEdgeGridValue(x,z)!==0) return;
        
            // machine item
            
        pnt=new wsPoint((room.xBound.min+(x*map.ROOM_BLOCK_WIDTH)),room.yBound.max,(room.zBound.min+(z*map.ROOM_BLOCK_WIDTH)));
                
        room.setBlockGrid(0,x,z);
        
        switch (genRandom.randomIndex(4)) {
            case 0:
            case 1:
                this.addComputer(room,pnt,dir);         // appears twice as much as others
                break;
            case 2:
                this.addPanel(room,pnt,dir);
                break;
            case 3:
                this.addJunction(room,pnt,dir);
                break;
        }
    }
    
        //
        // computer decorations mainline
        //

    create(room)
    {
        let x,z;
        
        let leftOpen=room.isSideOpenToOtherRoom(mapRoomConstants.ROOM_SIDE_LEFT);
        let topOpen=room.isSideOpenToOtherRoom(mapRoomConstants.ROOM_SIDE_TOP);
        let rightOpen=room.isSideOpenToOtherRoom(mapRoomConstants.ROOM_SIDE_RIGHT);
        let bottomOpen=room.isSideOpenToOtherRoom(mapRoomConstants.ROOM_SIDE_BOTTOM);
        
            // machines are against the edges
            
        for (z=1;z<(room.zBlockSize-1);z++) {
            if (!leftOpen) this.addPiece(room,0,z,mapRoomConstants.ROOM_SIDE_LEFT);
            if (!rightOpen) this.addPiece(room,(room.xBlockSize-1),z,mapRoomConstants.ROOM_SIDE_RIGHT);
        }
        
        for (x=1;x<(room.xBlockSize-1);x++) {
            if (!topOpen) this.addPiece(room,x,0,mapRoomConstants.ROOM_SIDE_TOP);
            if (!bottomOpen) this.addPiece(room,x,(room.zBlockSize-1),mapRoomConstants.ROOM_SIDE_BOTTOM);
        }
    }

}
