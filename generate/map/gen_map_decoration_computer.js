import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import genRandom from '../../generate/utility/random.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';

//
// generate room computer decoration class
//

export default class GenRoomDecorationComputerClass
{
    constructor(view,map)
    {
        this.view=view;
        this.map=map;
        
        Object.seal(this);
    }
    
        //
        // platform
        //
        
    addPlatform(room,rect)
    {
        let xBound,yBound,zBound;
        
        xBound=new BoundClass((room.xBound.min+(rect.lft*constants.ROOM_BLOCK_WIDTH)),(room.xBound.min+(rect.rgt*constants.ROOM_BLOCK_WIDTH)));
        zBound=new BoundClass((room.zBound.min+(rect.top*constants.ROOM_BLOCK_WIDTH)),(room.zBound.min+(rect.bot*constants.ROOM_BLOCK_WIDTH)));
        yBound=new BoundClass((room.yBound.max-constants.ROOM_FLOOR_DEPTH),room.yBound.max);

        this.map.addMesh(MeshPrimitivesClass.createMeshCube(this.view,this.map.getTexture(constants.BITMAP_TYPE_PLATFORM),xBound,yBound,zBound,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION));
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
            
        computerBitmap=this.map.getTexture(constants.BITMAP_TYPE_MACHINE);
        metalBitmap=this.map.getTexture(constants.BITMAP_TYPE_METAL);
       
            // computer

        wid=constants.ROOM_BLOCK_WIDTH-(margin*2);
        
        x=room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH);
        
        xBound=new BoundClass((x+margin),(x+wid));
        zBound=new BoundClass((z+margin),(z+wid));
        yBound=new BoundClass((room.yBound.max-constants.ROOM_FLOOR_HEIGHT),(room.yBound.max-constants.ROOM_FLOOR_DEPTH));
        
            // create meshes that point right way
            
        switch (dir) {
            
            case constants.ROOM_SIDE_LEFT:
                xBound2=new BoundClass((xBound.min+constants.ROOM_FLOOR_DEPTH),xBound.max);
                xBound.max=xBound2.min;
                
                mesh=MeshPrimitivesClass.createMeshCube(this.view,metalBitmap,xBound2,yBound,zBound,false,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                this.map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(this.view,computerBitmap,xBound,yBound,zBound,true,false,true,true,true,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,2,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.0,0.1,0.0,1.0);
                this.map.addMesh(mesh);
                break;
                
            case constants.ROOM_SIDE_TOP:
                zBound2=new BoundClass((zBound.min+constants.ROOM_FLOOR_DEPTH),zBound.max);
                zBound.max=zBound2.min;
                
                mesh=MeshPrimitivesClass.createMeshCube(this.view,metalBitmap,xBound,yBound,zBound2,true,true,false,true,true,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                this.map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(this.view,computerBitmap,xBound,yBound,zBound,true,true,true,false,true,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,0,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.0,0.1,0.0,1.0);
                this.map.addMesh(mesh);
                
                break;
                
            case constants.ROOM_SIDE_RIGHT:
                xBound2=new BoundClass(xBound.min,(xBound.max-constants.ROOM_FLOOR_DEPTH));
                xBound.min=xBound2.max;
                
                mesh=MeshPrimitivesClass.createMeshCube(this.view,metalBitmap,xBound2,yBound,zBound,true,false,true,true,true,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                this.map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(this.view,computerBitmap,xBound,yBound,zBound,false,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,2,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.0,0.1,0.0,1.0);
                this.map.addMesh(mesh);
                break;
                
            case constants.ROOM_SIDE_BOTTOM:
                zBound2=new BoundClass(zBound.min,(zBound.max-constants.ROOM_FLOOR_DEPTH));
                zBound.min=zBound2.max;
                
                mesh=MeshPrimitivesClass.createMeshCube(this.view,metalBitmap,xBound,yBound,zBound2,true,true,true,false,true,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                this.map.addMesh(mesh);
                
                mesh=MeshPrimitivesClass.createMeshCube(this.view,computerBitmap,xBound,yBound,zBound,true,true,false,true,true,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,0,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.0,0.1,0.0,1.0);
                MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.0,0.1,0.0,1.0);
                this.map.addMesh(mesh);
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
        
        computerBitmap=this.map.getTexture(constants.BITMAP_TYPE_PANEL);
        baseBitmap=this.map.getTexture(constants.BITMAP_TYPE_METAL);
        
            // panel directions and size
            
        panelMargin=genRandom.randomInt(Math.trunc(constants.ROOM_BLOCK_WIDTH/5),Math.trunc(constants.ROOM_BLOCK_WIDTH/8));

        xBound=new BoundClass((pnt.x+panelMargin),((pnt.x+constants.ROOM_BLOCK_WIDTH)-panelMargin));
        zBound=new BoundClass((pnt.z+panelMargin),((pnt.z+constants.ROOM_BLOCK_WIDTH)-panelMargin));
        yBound=new BoundClass(pnt.y,(pnt.y-Math.trunc(constants.ROOM_FLOOR_HEIGHT*0.3)));

        switch (dir) {
            
            case constants.ROOM_SIDE_LEFT:
                ang=new PointClass(0.0,90.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(this.view,baseBitmap,xBound,yBound,zBound,true,true,true,true,false,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                break;
                
            case constants.ROOM_SIDE_TOP:
                ang=new PointClass(0.0,0.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(this.view,baseBitmap,xBound,yBound,zBound,true,true,true,true,false,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                break;
                
            case constants.ROOM_SIDE_RIGHT:
                ang=new PointClass(0.0,270.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(this.view,baseBitmap,xBound,yBound,zBound,true,true,true,true,false,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                break;
                
            case constants.ROOM_SIDE_BOTTOM:
                ang=new PointClass(0.0,180.0,0.0);
                mesh=MeshPrimitivesClass.createMeshCube(this.view,baseBitmap,xBound,yBound,zBound,true,true,true,true,false,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                break;
        }

            // create top of panel
            
        yBound.max=yBound.min;
        yBound.min=yBound.max-constants.ROOM_FLOOR_DEPTH;
        
        mesh2=MeshPrimitivesClass.createMeshWedge(this.view,baseBitmap,xBound,yBound,zBound,ang,false,true,true,true,false,false,false,constants.MESH_FLAG_DECORATION);
        mesh.combineMesh(mesh2);
        this.map.addMesh(mesh);
        
        this.map.addMesh(MeshPrimitivesClass.createMeshWedge(this.view,computerBitmap,xBound,yBound,zBound,ang,true,false,false,false,true,true,false,constants.MESH_FLAG_DECORATION));
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

        baseBitmap=this.map.getTexture(constants.BITMAP_TYPE_METAL);
        pipeBitmap=this.map.getTexture(constants.BITMAP_TYPE_PIPE);
        
            // junction sizes
            
        juncMargin=genRandom.randomInt(Math.trunc(constants.ROOM_BLOCK_WIDTH/5),Math.trunc(constants.ROOM_BLOCK_WIDTH/8));
        juncWid=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.2);
        
        pipeRadius=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.05);
        pipeHigh=Math.trunc(constants.ROOM_FLOOR_HEIGHT*0.3);

        yBound=new BoundClass((pnt.y-pipeHigh),(pnt.y-constants.ROOM_FLOOR_HEIGHT));
        
            // the junction
            
        switch (dir) {
            
            case constants.ROOM_SIDE_LEFT:
                xBound=new BoundClass(pnt.x,(pnt.x+juncWid));
                zBound=new BoundClass((pnt.z+juncMargin),((pnt.z+constants.ROOM_BLOCK_WIDTH)-juncMargin));
                mesh=MeshPrimitivesClass.createMeshCube(this.view,baseBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                this.map.addMesh(mesh);
                break;
                
            case constants.ROOM_SIDE_TOP:
                xBound=new BoundClass((pnt.x+juncMargin),((pnt.x+constants.ROOM_BLOCK_WIDTH)-juncMargin));
                zBound=new BoundClass(pnt.z,(pnt.z+juncWid));
                mesh=MeshPrimitivesClass.createMeshCube(this.view,baseBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                this.map.addMesh(mesh);
                break;
                
            case constants.ROOM_SIDE_RIGHT:
                xBound=new BoundClass(((pnt.x+constants.ROOM_BLOCK_WIDTH)-juncWid),(pnt.x+constants.ROOM_BLOCK_WIDTH));
                zBound=new BoundClass((pnt.z+juncMargin),((pnt.z+constants.ROOM_BLOCK_WIDTH)-juncMargin));
                mesh=MeshPrimitivesClass.createMeshCube(this.view,baseBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                this.map.addMesh(mesh);
                break;
                
            case constants.ROOM_SIDE_BOTTOM:
                xBound=new BoundClass((pnt.x+juncMargin),((pnt.x+constants.ROOM_BLOCK_WIDTH)-juncMargin));
                zBound=new BoundClass(((pnt.z+constants.ROOM_BLOCK_WIDTH)-juncWid),(pnt.z+constants.ROOM_BLOCK_WIDTH));
                mesh=MeshPrimitivesClass.createMeshCube(this.view,baseBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                this.map.addMesh(mesh);
                break;
        }
        
            // the pipes
            
        upperPipe=genRandom.randomPercentage(0.5);
        lowerPipe=((genRandom.randomPercentage(0.5))||(!upperPipe));
        
        centerPnt=new PointClass(xBound.getMidPoint(),pnt.y,zBound.getMidPoint());
        
        if (upperPipe) {
            pipeYBound=new BoundClass(room.yBound.min,yBound.min);
            this.map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(this.view,pipeBitmap,centerPnt,pipeYBound,pipeRadius,false,false,constants.MESH_FLAG_DECORATION));
        }
        if (lowerPipe) {
            pipeYBound=new BoundClass(yBound.max,pnt.y);
            this.map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(this.view,pipeBitmap,centerPnt,pipeYBound,pipeRadius,false,false,constants.MESH_FLAG_DECORATION));
        }
    }
    
        //
        // single spot piece
        //
        
    addPiece(room,x,z,margin,dir)
    {
        let pnt;
        
            // computer item
            
        pnt=new PointClass((room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH)),room.yBound.max,(room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH)));
        
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
            
        margin=genRandom.randomInt(0,Math.trunc(constants.ROOM_BLOCK_WIDTH/8));
        
            // computer pieces
            
        for (x=rect.lft;x!==rect.rgt;x++) {
            for (z=rect.top;z!==rect.bot;z++) {
                
                if (x===rect.lft) {
                    this.addPiece(room,x,z,margin,constants.ROOM_SIDE_LEFT);
                }
                else {
                    if (x===(rect.rgt-1)) {
                        this.addPiece(room,x,z,margin,constants.ROOM_SIDE_RIGHT);
                    }
                    else {
                        if (z===(rect.top)) {
                            this.addPiece(room,x,z,margin,constants.ROOM_SIDE_TOP);
                        }
                        else {
                            if (z===(rect.bot-1)) {
                                this.addPiece(room,x,z,margin,constants.ROOM_SIDE_BOTTOM);
                            }
                        }
                    }
                }
            }
        }
    }

}
