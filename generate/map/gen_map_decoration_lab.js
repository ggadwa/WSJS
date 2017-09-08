import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';
import MoveClass from '../../code/map/move.js';
import MovementClass from '../../code/map/movement.js';
import GenBitmapMetalClass from '../../generate/bitmap/gen_bitmap_metal.js';
import GenBitmapPanelClass from '../../generate/bitmap/gen_bitmap_panel.js';
import GenBitmapGlassClass from '../../generate/bitmap/gen_bitmap_glass.js';
import GenBitmapGooClass from '../../generate/bitmap/gen_bitmap_goo.js';
import GenBitmapPipeClass from '../../generate/bitmap/gen_bitmap_pipe.js';
import genRandom from '../../generate/utility/random.js';

//
// generate room lab decoration class
//

export default class GenRoomDecorationLabClass
{
    constructor(view,map,platformBitmap)
    {
        let genBitmap;
        
        this.view=view;
        this.map=map;
        this.platformBitmap=platformBitmap;
        
        this.tubeHigh=constants.ROOM_FLOOR_HEIGHT;
        this.tubeCapHigh=genRandom.randomInt(constants.ROOM_FLOOR_DEPTH,Math.trunc(constants.ROOM_FLOOR_HEIGHT*0.25));
        
        this.smallTubeHigh=genRandom.randomInt(constants.ROOM_FLOOR_DEPTH,constants.ROOM_FLOOR_DEPTH);
        this.smallTubeCapHigh=Math.trunc(this.smallTubeHigh*genRandom.randomFloat(0.1,0.2));

            // bitmaps
            
        genBitmap=new GenBitmapMetalClass(this.view);
        this.metalBitmap=genBitmap.generate(false);
        
        genBitmap=new GenBitmapPanelClass(this.view);
        this.panelBitmap=genBitmap.generate(false);
        
        genBitmap=new GenBitmapGlassClass(this.view);
        this.glassBitmap=genBitmap.generate(false);
        
        genBitmap=new GenBitmapGooClass(this.view);
        this.gooBitmap=genBitmap.generate(false);
        
        genBitmap=new GenBitmapPipeClass(this.view);
        this.pipeBitmap=genBitmap.generate(false);
        
        Object.seal(this);
    }
    
        //
        // lab tubes
        //
        
    addTubeInternal(centerPnt,radius,topCapHigh,botCapHigh,tubeHigh)
    {
        let yBound,mesh,meshIdx;
        let yCapTop,yCapBottom,yBaseTop,yBaseBottom,yLiqHigh;
        let moveY,movement,msec;
        
            // the top and bottom base
        
        yCapTop=(centerPnt.y-tubeHigh);
        yCapBottom=yCapTop+topCapHigh;
        
        yBaseTop=centerPnt.y-botCapHigh;
        yBaseBottom=centerPnt.y;
        
        if (yBaseTop!==yBaseBottom) {
            yBound=new BoundClass(yBaseTop,yBaseBottom);
            mesh=MeshPrimitivesClass.createMeshCylinderSimple(this.view,this.pipeBitmap,centerPnt,yBound,radius,true,false,constants.MESH_FLAG_DECORATION);
            MeshPrimitivesClass.meshCylinderScaleU(mesh,5.0);
            this.map.meshList.add(mesh);
        }
        
        if (yCapTop!==yCapBottom) {
            yBound=new BoundClass(yCapTop,yCapBottom);
            mesh=MeshPrimitivesClass.createMeshCylinderSimple(this.view,this.pipeBitmap,centerPnt,yBound,radius,true,true,constants.MESH_FLAG_DECORATION);
            MeshPrimitivesClass.meshCylinderScaleU(mesh,5.0);
            this.map.meshList.add(mesh);
        }
        
            // the tube
        
        yBound=new BoundClass(yCapBottom,yBaseTop); 
        radius=Math.trunc(radius*0.9);

        mesh=MeshPrimitivesClass.createMeshCylinderSimple(this.view,this.glassBitmap,centerPnt,yBound,radius,false,false,constants.MESH_FLAG_DECORATION);
        MeshPrimitivesClass.meshCylinderScaleU(mesh,5.0);
        this.map.meshList.add(mesh);
        
            // the liquid in the tube
        
        yLiqHigh=genRandom.randomInt(constants.ROOM_FLOOR_DEPTH,(yBound.getSize()-constants.ROOM_FLOOR_DEPTH));    
        yBound=new BoundClass((yBaseTop-yLiqHigh),yBaseTop);
        
        radius=Math.trunc(radius*0.98);

        mesh=MeshPrimitivesClass.createMeshCylinderSimple(this.view,this.gooBitmap,centerPnt,yBound,radius,true,false,constants.MESH_FLAG_DECORATION);
        MeshPrimitivesClass.meshCylinderScaleU(mesh,5.0);
        meshIdx=this.map.meshList.add(mesh);
        
            // liquid movement
        
        moveY=Math.trunc(yLiqHigh*genRandom.randomFloat(0.1,0.7));
        msec=genRandom.randomInt(500,2000);
        
        movement=new MovementClass(meshIdx,true,0);
        movement.addMove(new MoveClass(msec,new PointClass(0,0,0)));
        movement.addMove(new MoveClass(msec,new PointClass(0,moveY,0)));
        
        this.map.movementList.add(movement);
    }
    
    addTube(room,x,z)
    {
        let centerPnt,radius;
        
        x=(room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH))+Math.trunc(constants.ROOM_BLOCK_WIDTH*0.5);
        z=(room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH))+Math.trunc(constants.ROOM_BLOCK_WIDTH*0.5);
        centerPnt=new PointClass(x,room.yBound.max,z);
        
        radius=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.35);
        
        this.addTubeInternal(centerPnt,radius,this.tubeCapHigh,this.tubeCapHigh,this.tubeHigh);
    }
    
        //
        // lab machinery
        //

    addMachineryItemPanel(xBound,zBound,y)
    {
        let mesh,yBound;
        
        yBound=new BoundClass((y-Math.trunc(constants.ROOM_FLOOR_DEPTH*0.5)),y);
        
        mesh=MeshPrimitivesClass.createMeshCube(this.view,this.panelBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION);
        MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
        MeshPrimitivesClass.meshCubeScaleUV(mesh,0,0.1,0.9,0.0,0.1);
        MeshPrimitivesClass.meshCubeScaleUV(mesh,1,0.1,0.9,0.0,0.1);
        MeshPrimitivesClass.meshCubeScaleUV(mesh,2,0.1,0.9,0.0,0.1);
        MeshPrimitivesClass.meshCubeScaleUV(mesh,3,0.1,0.9,0.0,0.1);
        MeshPrimitivesClass.meshCubeScaleUV(mesh,4,0.1,0.9,0.1,0.9);
        this.map.meshList.add(mesh);
    }
    
    addMachineryItem(xBound,zBound,y)
    {
        let centerPnt,radius,high,capHigh;
        
        switch (genRandom.randomIndex(3)) {
            
                // small tube
                
            case 0:
                centerPnt=new PointClass(xBound.getMidPoint(),y,zBound.getMidPoint());
                radius=Math.trunc(xBound.getSize()*0.3);

                high=genRandom.randomInt(constants.ROOM_FLOOR_DEPTH,constants.ROOM_FLOOR_DEPTH);
                capHigh=Math.trunc(high*genRandom.randomFloat(0.1,0.2));

                this.addTubeInternal(centerPnt,radius,this.smallTubeCapHigh,0,this.smallTubeHigh);
                break;
                
                // panel
                
            case 1:
                this.addMachineryItemPanel(xBound,zBound,y);
                break;
        }
    }
    
    addMachinery(room,x,z)
    {
        let xBound,yBound,zBound;
        let sz,xBoundItem,zBoundItem;
        let reduceSize;
        
            // the platform
            
        x=room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH);

        xBound=new BoundClass(x,(x+constants.ROOM_BLOCK_WIDTH));
        zBound=new BoundClass(z,(z+constants.ROOM_BLOCK_WIDTH));

        yBound=new BoundClass((room.yBound.max-constants.ROOM_FLOOR_DEPTH),room.yBound.max);
        this.map.meshList.add(MeshPrimitivesClass.createMeshCube(this.view,this.platformBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION));
        
            // the box
        
        reduceSize=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.1);
        xBound.min+=reduceSize;
        xBound.max-=reduceSize;
        zBound.min+=reduceSize;
        zBound.max-=reduceSize;

        yBound=new BoundClass((room.yBound.max-Math.trunc(constants.ROOM_FLOOR_HEIGHT*0.3)),(room.yBound.max-constants.ROOM_FLOOR_DEPTH));
        this.map.meshList.add(MeshPrimitivesClass.createMeshCube(this.view,this.metalBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
        
            // box items
        
        sz=Math.trunc((xBound.getSize()-(constants.ROOM_BLOCK_WIDTH*0.05))*0.5);
        
        xBoundItem=new BoundClass(xBound.min,(xBound.min+sz));
        zBoundItem=new BoundClass(zBound.min,(zBound.min+sz));
        this.addMachineryItem(xBoundItem,zBoundItem,yBound.min);
        
        xBoundItem=new BoundClass((xBound.max-sz),xBound.max);
        this.addMachineryItem(xBoundItem,zBoundItem,yBound.min);
        
        xBoundItem=new BoundClass(xBound.min,(xBound.min+sz));
        zBoundItem=new BoundClass((zBound.max-sz),zBound.max);
        this.addMachineryItem(xBoundItem,zBoundItem,yBound.min);
        
        xBoundItem=new BoundClass((xBound.max-sz),xBound.max);
        this.addMachineryItem(xBoundItem,zBoundItem,yBound.min);
    }
        
        //
        // lab
        //
    
    create(room,rect)
    {
        let x,z;
        
        for (z=rect.top;z!==rect.bot;z++) {
            for (x=rect.lft;x!==rect.rgt;x++) {
                switch (genRandom.randomIndex(3)) {
                    case 0:
                        this.addTube(room,x,z);
                        break;
                    case 1:
                        this.addMachinery(room,x,z);
                        break;
                }
            }
        }
    }
    
}
