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
        // platform
        //
        
    addPlatform(room,rect)
    {
        let boundX,boundY,boundZ;
        
        boundX=new wsBound((room.xBound.min+(rect.lft*map.ROOM_BLOCK_WIDTH)),(room.xBound.min+(rect.rgt*map.ROOM_BLOCK_WIDTH)));
        boundZ=new wsBound((room.zBound.min+(rect.top*map.ROOM_BLOCK_WIDTH)),(room.zBound.min+(rect.bot*map.ROOM_BLOCK_WIDTH)));
        boundY=new wsBound((room.yBound.max-map.ROOM_FLOOR_DEPTH),room.yBound.max);

        map.addMesh(MeshPrimitivesClass.createMeshCube(map.getTexture(map.TEXTURE_TYPE_PLATFORM),boundX,boundY,boundZ,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
    }
        
        //
        // computers
        //
        
    addComputer(room,x,z,margin)
    {
        let wid;
        let boundX,boundY,boundZ;
       
            // computer

        wid=map.ROOM_BLOCK_WIDTH-(margin*2);
        
        x=room.xBound.min+(x*map.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*map.ROOM_BLOCK_WIDTH);
        
        boundX=new wsBound((x+margin),(x+wid));
        boundZ=new wsBound((z+margin),(z+wid));
        boundY=new wsBound((room.yBound.max-map.ROOM_FLOOR_HEIGHT),(room.yBound.max-map.ROOM_FLOOR_DEPTH));

        map.addMesh(MeshPrimitivesClass.createMeshCube(map.getTexture(map.TEXTURE_TYPE_COMPUTER),boundX,boundY,boundZ,null,true,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
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
        let baseBitmap,pipeBitmap,upperPipe,lowerPipe;
            
            // junction textures

        baseBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        pipeBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // junction sizes
            
        juncMargin=genRandom.randomInt(Math.trunc(map.ROOM_BLOCK_WIDTH/5),Math.trunc(map.ROOM_BLOCK_WIDTH/8));
        juncWid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.2);
        
        pipeRadius=Math.trunc(map.ROOM_BLOCK_WIDTH*0.05);
        pipeHigh=Math.trunc(map.ROOM_FLOOR_HEIGHT*0.3);

        boundY=new wsBound((pnt.y-pipeHigh),(pnt.y-map.ROOM_FLOOR_HEIGHT));
        
            // the junction
            
        switch (dir) {
            
            case mapRoomConstants.ROOM_SIDE_LEFT:
                boundX=new wsBound(pnt.x,(pnt.x+juncWid));
                boundZ=new wsBound((pnt.z+juncMargin),((pnt.z+map.ROOM_BLOCK_WIDTH)-juncMargin));
                map.addMesh(MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,false,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
                break;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                boundX=new wsBound((pnt.x+juncMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-juncMargin));
                boundZ=new wsBound(pnt.z,(pnt.z+juncWid));
                map.addMesh(MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,true,false,true,true,true,false,map.MESH_FLAG_DECORATION));
                break;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                boundX=new wsBound(((pnt.x+map.ROOM_BLOCK_WIDTH)-juncWid),(pnt.x+map.ROOM_BLOCK_WIDTH));
                boundZ=new wsBound((pnt.z+juncMargin),((pnt.z+map.ROOM_BLOCK_WIDTH)-juncMargin));
                map.addMesh(MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,false,true,true,true,true,false,map.MESH_FLAG_DECORATION));
                break;
                
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                boundX=new wsBound((pnt.x+juncMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-juncMargin));
                boundZ=new wsBound(((pnt.z+map.ROOM_BLOCK_WIDTH)-juncWid),(pnt.z+map.ROOM_BLOCK_WIDTH));
                map.addMesh(MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,null,true,true,true,true,false,true,true,false,map.MESH_FLAG_DECORATION));
                break;
        }
        
            // the pipes
            
        upperPipe=genRandom.randomPercentage(0.5);
        lowerPipe=((genRandom.randomPercentage(0.5))||(!upperPipe));
        
        centerPnt=new wsPoint(boundX.getMidPoint(),pnt.y,boundZ.getMidPoint());
        
        if (upperPipe) {
            pipeBoundY=new wsBound(room.yBound.min,boundY.min);
            map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(pipeBitmap,centerPnt,pipeBoundY,pipeRadius,map.MESH_FLAG_DECORATION));
        }
        if (lowerPipe) {
            pipeBoundY=new wsBound(boundY.max,pnt.y);
            map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(pipeBitmap,centerPnt,pipeBoundY,pipeRadius,map.MESH_FLAG_DECORATION));
        }
    }
    
        //
        // single spot piece
        //
        
    addPiece(room,x,z,margin,dir)
    {
        let pnt;
        
            // computer item
            
        pnt=new wsPoint((room.xBound.min+(x*map.ROOM_BLOCK_WIDTH)),room.yBound.max,(room.zBound.min+(z*map.ROOM_BLOCK_WIDTH)));
        
        switch (genRandom.randomIndex(4)) {
            case 0:
            case 1:
                this.addComputer(room,x,z,margin);         // appears twice as much as the others
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

    create(room,rect)
    {
        let x,z,margin;
        
            // the platform
            
        this.addPlatform(room,rect);
        
            // a margin for the items that use
            // the same margins
            
        margin=genRandom.randomInt(0,Math.trunc(map.ROOM_BLOCK_WIDTH/8));
        
            // computer pieces
            
        for (x=rect.lft;x!==rect.rgt;x++) {
            for (z=rect.top;z!==rect.bot;z++) {
                
                if (x===rect.lft) {
                    this.addPiece(room,x,z,margin,mapRoomConstants.ROOM_SIDE_RIGHT);
                }
                else {
                    if (x===(rect.rgt-1)) {
                        this.addPiece(room,x,z,margin,mapRoomConstants.ROOM_SIDE_LEFT);
                    }
                    else {
                        if (z===(rect.top)) {
                            this.addPiece(room,x,z,margin,mapRoomConstants.ROOM_SIDE_BOTTOM);
                        }
                        else {
                            if (z===(rect.bot-1)) {
                                this.addPiece(room,x,z,margin,mapRoomConstants.ROOM_SIDE_TOP);
                            }
                        }
                    }
                }
            }
        }
    }

}
