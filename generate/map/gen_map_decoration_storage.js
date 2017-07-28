/* global map, genRandom, MeshPrimitivesClass, config */

"use strict";

//
// generate room storage decoration class
//

class GenRoomDecorationStorageClass
{
    constructor()
    {
            // give all these decorations the same general
            // width and height no matter where in the map
            
        this.shelfHigh=genRandom.randomInt(Math.trunc(map.ROOM_BLOCK_WIDTH*0.2),Math.trunc(map.ROOM_BLOCK_WIDTH*0.3));
            
        this.xShelfMargin=genRandom.randomInt(0,Math.trunc(map.ROOM_BLOCK_WIDTH/8));
        this.zShelfMargin=genRandom.randomInt(0,Math.trunc(map.ROOM_BLOCK_WIDTH/8));
        
        this.boxMargin=genRandom.randomInt(0,Math.trunc(map.ROOM_BLOCK_WIDTH/8));
        this.boxHigh=genRandom.randomInt(Math.trunc(map.ROOM_BLOCK_WIDTH*0.3),Math.trunc(map.ROOM_BLOCK_WIDTH*0.3));

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
        let boxBitmap=map.getTexture(map.TEXTURE_TYPE_BOX);
        
            // box size
            
        x=room.xBound.min+(x*map.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*map.ROOM_BLOCK_WIDTH);
            
        boxXBound=new wsBound((x+this.boxMargin),((x+map.ROOM_BLOCK_WIDTH)-this.boxMargin));
        boxYBound=new wsBound((room.yBound.max-this.boxHigh),room.yBound.max);
        boxZBound=new wsBound((z+this.boxMargin),((z+map.ROOM_BLOCK_WIDTH)-this.boxMargin));
        
        boxPos=new wsPoint(0,0,0);
        rotAngle=new wsPoint(0.0,0.0,0.0);
        
            // stacks of boxes
            
        stackCount=genRandom.randomInt(1,3);
            
            // the stacked shelves
            
        for (stackLevel=0;stackLevel!==stackCount;stackLevel++) {
            
            rotAngle.setFromValues(0.0,(genRandom.randomFloat(-10.0,20.0)),0.0);
            mesh=MeshPrimitivesClass.createMeshRotatedCube(boxBitmap,boxXBound,boxYBound,boxZBound,rotAngle,true,true,true,true,true,(stackLevel!==0),false,map.MESH_FLAG_DECORATION);
            MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
            map.addMesh(mesh);

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
        let shelfBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        let boxBitmap=map.getTexture(map.TEXTURE_TYPE_BOX);
        
        x=room.xBound.min+(x*map.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*map.ROOM_BLOCK_WIDTH);
        
        legWid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.1);

            // height and width

        stackCount=genRandom.randomInt(1,3);
        
            // some preset bounds
            
        mesh=null;
        rotAngle=new wsPoint(0,0,0);
        
        tableXBound=new wsBound((x+this.xShelfMargin),((x+map.ROOM_BLOCK_WIDTH)-this.xShelfMargin));
        tableYBound=new wsBound((room.yBound.max-this.shelfHigh),((room.yBound.max-this.shelfHigh)+map.ROOM_FLOOR_DEPTH));
        tableZBound=new wsBound((z+this.zShelfMargin),((z+map.ROOM_BLOCK_WIDTH)-this.zShelfMargin));

        legXMinBound=new wsBound((x+this.xShelfMargin),((x+this.xShelfMargin)+legWid));
        legXMaxBound=new wsBound((((x+map.ROOM_BLOCK_WIDTH)-this.xShelfMargin)-legWid),((x+map.ROOM_BLOCK_WIDTH)-this.xShelfMargin));
        legZMinBound=new wsBound((z+this.zShelfMargin),((z+this.zShelfMargin)+legWid));
        legZMaxBound=new wsBound((((z+map.ROOM_BLOCK_WIDTH)-this.zShelfMargin)-legWid),((z+map.ROOM_BLOCK_WIDTH)-this.zShelfMargin));
        
        legYBound=new wsBound(((room.yBound.max-this.shelfHigh)+map.ROOM_FLOOR_DEPTH),room.yBound.max);
        
        boxXBound=new wsBound(0,0,0);
        boxYBound=new wsBound(0,0,0);
        boxZBound=new wsBound(0,0,0);
        
        minBoxHigh=Math.trunc(this.shelfHigh*0.5);
        extraBoxHigh=Math.trunc(this.shelfHigh*0.25);
        
        minBoxSize=Math.trunc(map.ROOM_BLOCK_WIDTH*0.05);
        extraBoxSize=Math.trunc(map.ROOM_BLOCK_WIDTH*0.15);

            // the stacked shelves
            
        for (stackLevel=0;stackLevel!==stackCount;stackLevel++) {

                // the table

            mesh2=MeshPrimitivesClass.createMeshCube(shelfBitmap,tableXBound,tableYBound,tableZBound,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
            if (mesh===null) {
                mesh=mesh2;
            }
            else {
                mesh.combineMesh(mesh2);
            }
            
                // legs

            mesh2=MeshPrimitivesClass.createMeshCube(shelfBitmap,legXMinBound,legYBound,legZMinBound,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
            mesh.combineMesh(mesh2);

            mesh2=MeshPrimitivesClass.createMeshCube(shelfBitmap,legXMinBound,legYBound,legZMaxBound,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
            mesh.combineMesh(mesh2);

            mesh2=MeshPrimitivesClass.createMeshCube(shelfBitmap,legXMaxBound,legYBound,legZMinBound,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
            mesh.combineMesh(mesh2);

            mesh2=MeshPrimitivesClass.createMeshCube(shelfBitmap,legXMaxBound,legYBound,legZMaxBound,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
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
                boxMesh=MeshPrimitivesClass.createMeshRotatedCube(boxBitmap,boxXBound,boxYBound,boxZBound,rotAngle,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(boxMesh);
                map.addMesh(boxMesh);
            }

                // go up one level

            tableYBound.add(-this.shelfHigh);
            if (tableYBound.min<room.yBound.min) break;
            
            legYBound.add(-this.shelfHigh);
        }
        
        map.addMesh(mesh);
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
                
                if (genRandom.randomPercentage(0.5)) {
                    this.addBoxes(room,x,z);
                }
                else {
                    this.addShelf(room,x,z);
                }
            }
        }
    }

}
