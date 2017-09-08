import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';
import GenBitmapMetalClass from '../../generate/bitmap/gen_bitmap_metal.js';
import GenBitmapWoodClass from '../../generate/bitmap/gen_bitmap_wood.js';
import genRandom from '../../generate/utility/random.js';

//
// generate room storage decoration class
//

export default class GenRoomDecorationStorageClass
{
    constructor(view,map)
    {
        let genBitmap;
        
        this.view=view;
        this.map=map;
        
            // bitmaps
            
        genBitmap=new GenBitmapWoodClass(this.view);
        this.woodBitmap=genBitmap.generate(false);
        
        genBitmap=new GenBitmapMetalClass(this.view);
        this.metalBitmap=genBitmap.generate(false);
        
            // give all these decorations the same general
            // width and height no matter where in the map
            
        this.shelfHigh=genRandom.randomInt(Math.trunc(constants.ROOM_BLOCK_WIDTH*0.2),Math.trunc(constants.ROOM_BLOCK_WIDTH*0.3));
            
        this.xShelfMargin=genRandom.randomInt(0,Math.trunc(constants.ROOM_BLOCK_WIDTH/8));
        this.zShelfMargin=genRandom.randomInt(0,Math.trunc(constants.ROOM_BLOCK_WIDTH/8));
        
        this.boxMargin=genRandom.randomInt(0,Math.trunc(constants.ROOM_BLOCK_WIDTH/8));
        this.boxHigh=genRandom.randomInt(Math.trunc(constants.ROOM_BLOCK_WIDTH*0.2),Math.trunc(constants.ROOM_BLOCK_WIDTH*0.3));

        Object.seal(this);
    }
    
        //
        // boxes
        //

    addBoxes(room,x,z)
    {
        let stackLevel,stackCount,mesh;
        let boxXBound,boxYBound,boxZBound;
        let boxPos,rotAngle;
        
            // box size
            
        x=room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH);
            
        boxXBound=new BoundClass((x+this.boxMargin),((x+constants.ROOM_BLOCK_WIDTH)-this.boxMargin));
        boxYBound=new BoundClass((room.yBound.max-this.boxHigh),room.yBound.max);
        boxZBound=new BoundClass((z+this.boxMargin),((z+constants.ROOM_BLOCK_WIDTH)-this.boxMargin));
        
        boxPos=new PointClass(0,0,0);
        rotAngle=new PointClass(0.0,0.0,0.0);
        
            // stacks of boxes
            
        stackCount=genRandom.randomInt(1,3);
            
            // the stacked shelves
            
        for (stackLevel=0;stackLevel!==stackCount;stackLevel++) {
            
            rotAngle.setFromValues(0.0,(genRandom.randomFloat(-10.0,20.0)),0.0);
            mesh=MeshPrimitivesClass.createMeshRotatedCube(this.view,this.woodBitmap,boxXBound,boxYBound,boxZBound,rotAngle,true,true,true,true,true,(stackLevel!==0),false,constants.MESH_FLAG_DECORATION);
            MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
            this.map.meshList.add(mesh);

                // go up one level

            boxYBound.add(-this.boxHigh);
            if (boxYBound.min<room.yBound.min) break;
        }
    }
            
        //
        // shelves
        //
        
    addShelf(room,x,z)
    {
        let legWid,mesh,mesh2;
        let stackLevel,stackCount;
        let n,nItem,bx,bz,boxSize,rotAngle,boxMesh,minBoxSize,extraBoxSize,minBoxHigh,extraBoxHigh;
        let tableXBound,tableYBound,tableZBound;
        let legXMinBound,legXMaxBound,legZMinBound,legZMaxBound,legYBound;
        let boxXBound,boxYBound,boxZBound;
        
        x=room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH);
        
        legWid=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.1);

            // height and width

        stackCount=genRandom.randomInt(1,3);
        
            // some preset bounds
            
        mesh=null;
        rotAngle=new PointClass(0,0,0);
        
        tableXBound=new BoundClass((x+this.xShelfMargin),((x+constants.ROOM_BLOCK_WIDTH)-this.xShelfMargin));
        tableYBound=new BoundClass((room.yBound.max-this.shelfHigh),((room.yBound.max-this.shelfHigh)+constants.ROOM_FLOOR_DEPTH));
        tableZBound=new BoundClass((z+this.zShelfMargin),((z+constants.ROOM_BLOCK_WIDTH)-this.zShelfMargin));

        legXMinBound=new BoundClass((x+this.xShelfMargin),((x+this.xShelfMargin)+legWid));
        legXMaxBound=new BoundClass((((x+constants.ROOM_BLOCK_WIDTH)-this.xShelfMargin)-legWid),((x+constants.ROOM_BLOCK_WIDTH)-this.xShelfMargin));
        legZMinBound=new BoundClass((z+this.zShelfMargin),((z+this.zShelfMargin)+legWid));
        legZMaxBound=new BoundClass((((z+constants.ROOM_BLOCK_WIDTH)-this.zShelfMargin)-legWid),((z+constants.ROOM_BLOCK_WIDTH)-this.zShelfMargin));
        
        legYBound=new BoundClass(((room.yBound.max-this.shelfHigh)+constants.ROOM_FLOOR_DEPTH),room.yBound.max);
        
        boxXBound=new BoundClass(0,0,0);
        boxYBound=new BoundClass(0,0,0);
        boxZBound=new BoundClass(0,0,0);
        
        minBoxHigh=Math.trunc(this.shelfHigh*0.5);
        extraBoxHigh=Math.trunc(this.shelfHigh*0.25);
        
        minBoxSize=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.05);
        extraBoxSize=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.15);

            // the stacked shelves
            
        for (stackLevel=0;stackLevel!==stackCount;stackLevel++) {

                // the table

            mesh2=MeshPrimitivesClass.createMeshCube(this.view,this.metalBitmap,tableXBound,tableYBound,tableZBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION);
            if (mesh===null) {
                mesh=mesh2;
            }
            else {
                mesh.combineMesh(mesh2);
            }
            
                // legs

            mesh2=MeshPrimitivesClass.createMeshCube(this.view,this.metalBitmap,legXMinBound,legYBound,legZMinBound,true,true,true,true,false,false,false,constants.MESH_FLAG_DECORATION);
            mesh.combineMesh(mesh2);

            mesh2=MeshPrimitivesClass.createMeshCube(this.view,this.metalBitmap,legXMinBound,legYBound,legZMaxBound,true,true,true,true,false,false,false,constants.MESH_FLAG_DECORATION);
            mesh.combineMesh(mesh2);

            mesh2=MeshPrimitivesClass.createMeshCube(this.view,this.metalBitmap,legXMaxBound,legYBound,legZMinBound,true,true,true,true,false,false,false,constants.MESH_FLAG_DECORATION);
            mesh.combineMesh(mesh2);

            mesh2=MeshPrimitivesClass.createMeshCube(this.view,this.metalBitmap,legXMaxBound,legYBound,legZMaxBound,true,true,true,true,false,false,false,constants.MESH_FLAG_DECORATION);
            mesh.combineMesh(mesh2);
            
                // items on self
                
            nItem=genRandom.randomIndex(3);
            
            for (n=0;n!==nItem;n++) {
                boxSize=genRandom.randomInt(minBoxSize,extraBoxSize);
                bx=genRandom.randomInt((tableXBound.min+boxSize),(tableXBound.getSize()-(boxSize*2)));
                bz=genRandom.randomInt((tableZBound.min+boxSize),(tableZBound.getSize()-(boxSize*2)));
                
                boxXBound.setFromValues((bx-boxSize),(bx+boxSize));
                boxYBound.setFromValues((tableYBound.min-genRandom.randomInt(minBoxHigh,extraBoxHigh)),tableYBound.min);
                boxZBound.setFromValues((bz-boxSize),(bz+boxSize));

                rotAngle.setFromValues(0.0,(genRandom.randomFloat(-10.0,20.0)),0.0);
                boxMesh=MeshPrimitivesClass.createMeshRotatedCube(this.view,this.woodBitmap,boxXBound,boxYBound,boxZBound,rotAngle,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(boxMesh);
                this.map.meshList.add(boxMesh);
            }

                // go up one level

            tableYBound.add(-this.shelfHigh);
            if (tableYBound.min<room.yBound.min) break;
            
            legYBound.add(-this.shelfHigh);
        }
        
        this.map.meshList.add(mesh);
    }
    
        //
        // storage mainline
        //

    create(room,rect)
    {
        let x,z;

            // create the pieces
            
        for (x=rect.lft;x!==rect.rgt;x++) {
            for (z=rect.top;z!==rect.bot;z++) {
                
                switch (genRandom.randomIndex(3)) {
                    case 0:
                        this.addBoxes(room,x,z);
                        break;
                    case 1:
                        this.addShelf(room,x,z);
                        break;
                }
            }
        }
    }

}
