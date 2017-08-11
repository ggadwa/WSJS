import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import genRandom from '../../generate/utility/random.js';
import map from '../../code/map/map.js';

//
// generate room computer decoration class
//

export default class GenRoomDecorationComputerClass
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
        let xBound,yBound,zBound;
        
        xBound=new BoundClass((room.xBound.min+(rect.lft*map.ROOM_BLOCK_WIDTH)),(room.xBound.min+(rect.rgt*map.ROOM_BLOCK_WIDTH)));
        zBound=new BoundClass((room.zBound.min+(rect.top*map.ROOM_BLOCK_WIDTH)),(room.zBound.min+(rect.bot*map.ROOM_BLOCK_WIDTH)));
        yBound=new BoundClass((room.yBound.max-map.ROOM_FLOOR_DEPTH),room.yBound.max);

        map.addMesh(MeshPrimitivesClass.createMeshCube(map.getTexture(map.TEXTURE_TYPE_PLATFORM),xBound,yBound,zBound,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
    }
        
        //
        // computer banks
        //
        
    addBank(room,x,z,margin,dir)
    {
        let wid,mesh;
        let xBound,yBound,zBound,xBound2,zBound2;
        let computerBitmap,metalBitmap;
        
            // textures
            
        computerBitmap=map.getTexture(map.TEXTURE_TYPE_COMPUTER);
        metalBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
       
            // computer

        wid=map.ROOM_BLOCK_WIDTH-(margin*2);
        
        x=room.xBound.min+(x*map.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*map.ROOM_BLOCK_WIDTH);
        
        xBound=new BoundClass((x+margin),(x+wid));
        zBound=new BoundClass((z+margin),(z+wid));
        yBound=new BoundClass((room.yBound.max-map.ROOM_FLOOR_HEIGHT),(room.yBound.max-map.ROOM_FLOOR_DEPTH));
        
            // create meshes that point right way
            
        switch (dir) {
            
            case mapRoomConstants.ROOM_SIDE_LEFT:
                xBound2=new BoundClass((xBound.min+map.ROOM_FLOOR_DEPTH),xBound.max);
                xBound.max=xBound2.min;
                
                mesh=MeshPrimitivesClass.createMeshCube(metalBitmap,xBound2,yBound,zBound,false,true,true,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(computerBitmap,xBound,yBound,zBound,true,false,true,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,2,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.0,0.1,0.0,1.0);
                map.addMesh(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                zBound2=new BoundClass((zBound.min+map.ROOM_FLOOR_DEPTH),zBound.max);
                zBound.max=zBound2.min;
                
                mesh=MeshPrimitivesClass.createMeshCube(metalBitmap,xBound,yBound,zBound2,true,true,false,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(computerBitmap,xBound,yBound,zBound,true,true,true,false,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,0,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.0,0.1,0.0,1.0);
                map.addMesh(mesh);
                
                break;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                xBound2=new BoundClass(xBound.min,(xBound.max-map.ROOM_FLOOR_DEPTH));
                xBound.min=xBound2.max;
                
                mesh=MeshPrimitivesClass.createMeshCube(metalBitmap,xBound2,yBound,zBound,true,false,true,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(computerBitmap,xBound,yBound,zBound,false,true,true,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,2,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.0,0.1,0.0,1.0);
                map.addMesh(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                zBound2=new BoundClass(zBound.min,(zBound.max-map.ROOM_FLOOR_DEPTH));
                zBound.min=zBound2.max;
                
                mesh=MeshPrimitivesClass.createMeshCube(metalBitmap,xBound,yBound,zBound2,true,true,true,false,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(computerBitmap,xBound,yBound,zBound,true,true,false,true,true,false,false,map.MESH_FLAG_DECORATION);
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
        let xBound,yBound,zBound;
        let computerBitmap,baseBitmap;
            
            // the machine location
        
        computerBitmap=map.getTexture(map.TEXTURE_TYPE_PANEL);
        baseBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // panel directions and size
            
        panelMargin=genRandom.randomInt(Math.trunc(map.ROOM_BLOCK_WIDTH/5),Math.trunc(map.ROOM_BLOCK_WIDTH/8));

        xBound=new BoundClass((pnt.x+panelMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-panelMargin));
        zBound=new BoundClass((pnt.z+panelMargin),((pnt.z+map.ROOM_BLOCK_WIDTH)-panelMargin));
        yBound=new BoundClass(pnt.y,(pnt.y-Math.trunc(map.ROOM_FLOOR_HEIGHT*0.3)));

        switch (dir) {
            
            case mapRoomConstants.ROOM_SIDE_LEFT:
                ang=new PointClass(0.0,90.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,xBound,yBound,zBound,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                ang=new PointClass(0.0,0.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,xBound,yBound,zBound,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                ang=new PointClass(0.0,270.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,xBound,yBound,zBound,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                ang=new PointClass(0.0,180.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,xBound,yBound,zBound,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                break;
        }

            // create top of panel
            
        yBound.max=yBound.min;
        yBound.min=yBound.max-map.ROOM_FLOOR_DEPTH;
        
        mesh2=MeshPrimitivesClass.createMeshWedge(baseBitmap,xBound,yBound,zBound,ang,false,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
        mesh.combineMesh(mesh2);
        map.addMesh(mesh);
        
        map.addMesh(MeshPrimitivesClass.createMeshWedge(computerBitmap,xBound,yBound,zBound,ang,true,false,false,false,true,true,false,map.MESH_FLAG_DECORATION));
    }
    
        //
        // junctions
        //
        
    addJunction(room,pnt,dir)
    {
        let juncMargin,juncWid,pipeRadius,pipeHigh,mesh;
        let xBound,yBound,zBound,pipeYBound,centerPnt;
        let baseBitmap,pipeBitmap,upperPipe,lowerPipe;
            
            // junction textures

        baseBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        pipeBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // junction sizes
            
        juncMargin=genRandom.randomInt(Math.trunc(map.ROOM_BLOCK_WIDTH/5),Math.trunc(map.ROOM_BLOCK_WIDTH/8));
        juncWid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.2);
        
        pipeRadius=Math.trunc(map.ROOM_BLOCK_WIDTH*0.05);
        pipeHigh=Math.trunc(map.ROOM_FLOOR_HEIGHT*0.3);

        yBound=new BoundClass((pnt.y-pipeHigh),(pnt.y-map.ROOM_FLOOR_HEIGHT));
        
            // the junction
            
        switch (dir) {
            
            case mapRoomConstants.ROOM_SIDE_LEFT:
                xBound=new BoundClass(pnt.x,(pnt.x+juncWid));
                zBound=new BoundClass((pnt.z+juncMargin),((pnt.z+map.ROOM_BLOCK_WIDTH)-juncMargin));
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                xBound=new BoundClass((pnt.x+juncMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-juncMargin));
                zBound=new BoundClass(pnt.z,(pnt.z+juncWid));
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                xBound=new BoundClass(((pnt.x+map.ROOM_BLOCK_WIDTH)-juncWid),(pnt.x+map.ROOM_BLOCK_WIDTH));
                zBound=new BoundClass((pnt.z+juncMargin),((pnt.z+map.ROOM_BLOCK_WIDTH)-juncMargin));
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                break;
                
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                xBound=new BoundClass((pnt.x+juncMargin),((pnt.x+map.ROOM_BLOCK_WIDTH)-juncMargin));
                zBound=new BoundClass(((pnt.z+map.ROOM_BLOCK_WIDTH)-juncWid),(pnt.z+map.ROOM_BLOCK_WIDTH));
                mesh=MeshPrimitivesClass.createMeshCube(baseBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                break;
        }
        
            // the pipes
            
        upperPipe=genRandom.randomPercentage(0.5);
        lowerPipe=((genRandom.randomPercentage(0.5))||(!upperPipe));
        
        centerPnt=new PointClass(xBound.getMidPoint(),pnt.y,zBound.getMidPoint());
        
        if (upperPipe) {
            pipeYBound=new BoundClass(room.yBound.min,yBound.min);
            map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(pipeBitmap,centerPnt,pipeYBound,pipeRadius,false,false,map.MESH_FLAG_DECORATION));
        }
        if (lowerPipe) {
            pipeYBound=new BoundClass(yBound.max,pnt.y);
            map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(pipeBitmap,centerPnt,pipeYBound,pipeRadius,false,false,map.MESH_FLAG_DECORATION));
        }
    }
    
        //
        // single spot piece
        //
        
    addPiece(room,x,z,margin,dir)
    {
        let pnt;
        
            // computer item
            
        pnt=new PointClass((room.xBound.min+(x*map.ROOM_BLOCK_WIDTH)),room.yBound.max,(room.zBound.min+(z*map.ROOM_BLOCK_WIDTH)));
        
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
