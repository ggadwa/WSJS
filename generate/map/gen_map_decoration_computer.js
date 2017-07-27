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

        map.addMesh(MeshPrimitivesClass.createMeshCube(map.getTexture(map.TEXTURE_TYPE_PLATFORM),boundX,boundY,boundZ,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
    }
        
        //
        // computer banks
        //
        
    addBank(room,x,z,margin,dir)
    {
        let wid,mesh;
        let boundX,boundY,boundZ,boundX2,boundZ2;
        let computerBitmap,metalBitmap;
        
            // textures
            
        computerBitmap=map.getTexture(map.TEXTURE_TYPE_COMPUTER);
        metalBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
       
            // computer

        wid=map.ROOM_BLOCK_WIDTH-(margin*2);
        
        x=room.xBound.min+(x*map.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*map.ROOM_BLOCK_WIDTH);
        
        boundX=new wsBound((x+margin),(x+wid));
        boundZ=new wsBound((z+margin),(z+wid));
        boundY=new wsBound((room.yBound.max-map.ROOM_FLOOR_HEIGHT),(room.yBound.max-map.ROOM_FLOOR_DEPTH));
        
            // create meshes that point right way
            
        switch (dir) {
            
            case mapRoomConstants.ROOM_SIDE_LEFT:
                boundX2=new wsBound((boundX.min+map.ROOM_FLOOR_DEPTH),boundX.max);
                boundX.max=boundX2.min;
                
                mesh=MeshPrimitivesClass.createMeshCube(metalBitmap,boundX2,boundY,boundZ,false,true,true,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(computerBitmap,boundX,boundY,boundZ,true,false,true,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,2,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.0,0.1,0.0,1.0);
                map.addMesh(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                boundZ2=new wsBound((boundZ.min+map.ROOM_FLOOR_DEPTH),boundZ.max);
                boundZ.max=boundZ2.min;
                
                mesh=MeshPrimitivesClass.createMeshCube(metalBitmap,boundX,boundY,boundZ2,true,true,false,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(computerBitmap,boundX,boundY,boundZ,true,true,true,false,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,0,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.0,0.1,0.0,1.0);
                map.addMesh(mesh);
                
                break;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                boundX2=new wsBound(boundX.min,(boundX.max-map.ROOM_FLOOR_DEPTH));
                boundX.min=boundX2.max;
                
                mesh=MeshPrimitivesClass.createMeshCube(metalBitmap,boundX2,boundY,boundZ,true,false,true,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(computerBitmap,boundX,boundY,boundZ,false,true,true,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,2,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.0,0.1,0.0,1.0);
                map.addMesh(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                boundZ2=new wsBound(boundZ.min,(boundZ.max-map.ROOM_FLOOR_DEPTH));
                boundZ.min=boundZ2.max;
                
                mesh=MeshPrimitivesClass.createMeshCube(metalBitmap,boundX,boundY,boundZ2,true,true,true,false,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(computerBitmap,boundX,boundY,boundZ,true,true,false,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,0,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.0,0.1,0.0,1.0);
                map.addMesh(mesh);
                break;

        }
    }
    
        //
        // terminals
        //
        
    addTerminal(room,pnt,dir)
    {
        let panelMargin,ang,mesh,mesh2;
        let boundX,boundY,boundZ;
        let computerBitmap,baseBitmap;
            
            // the machine location
        
        computerBitmap=map.getTexture(map.TEXTURE_TYPE_PANEL);
        baseBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // panel directions and size
            
        panelMargin=genRandom.randomInt(Math.trunc(map.ROOM_BLOCK_WIDTH/5),Math.trunc(map.ROOM_BLOCK_WIDTH/8));

        boundX=new wsBound((pnt.x+panelMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-panelMargin));
        boundZ=new wsBound((pnt.z+panelMargin),((pnt.z+map.ROOM_BLOCK_WIDTH)-panelMargin));
        boundY=new wsBound(pnt.y,(pnt.y-Math.trunc(map.ROOM_FLOOR_HEIGHT*0.3)));

        switch (dir) {
            
            case mapRoomConstants.ROOM_SIDE_LEFT:
                ang=new wsPoint(0.0,90.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                ang=new wsPoint(0.0,0.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                ang=new wsPoint(0.0,270.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                ang=new wsPoint(0.0,180.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
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
        let juncMargin,juncWid,pipeRadius,pipeHigh,mesh;
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
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                boundX=new wsBound((pnt.x+juncMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-juncMargin));
                boundZ=new wsBound(pnt.z,(pnt.z+juncWid));
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                boundX=new wsBound(((pnt.x+map.ROOM_BLOCK_WIDTH)-juncWid),(pnt.x+map.ROOM_BLOCK_WIDTH));
                boundZ=new wsBound((pnt.z+juncMargin),((pnt.z+map.ROOM_BLOCK_WIDTH)-juncMargin));
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                boundX=new wsBound((pnt.x+juncMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-juncMargin));
                boundZ=new wsBound(((pnt.z+map.ROOM_BLOCK_WIDTH)-juncWid),(pnt.z+map.ROOM_BLOCK_WIDTH));
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,boundX,boundY,boundZ,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
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
                this.addBank(room,x,z,margin,dir);         // appears twice as much as the others
                break;
            case 2:
                this.addTerminal(room,pnt,dir);
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
                    this.addPiece(room,x,z,margin,mapRoomConstants.ROOM_SIDE_LEFT);
                }
                else {
                    if (x===(rect.rgt-1)) {
                        this.addPiece(room,x,z,margin,mapRoomConstants.ROOM_SIDE_RIGHT);
                    }
                    else {
                        if (z===(rect.top)) {
                            this.addPiece(room,x,z,margin,mapRoomConstants.ROOM_SIDE_TOP);
                        }
                        else {
                            if (z===(rect.bot-1)) {
                                this.addPiece(room,x,z,margin,mapRoomConstants.ROOM_SIDE_BOTTOM);
                            }
                        }
                    }
                }
            }
        }
    }

}
