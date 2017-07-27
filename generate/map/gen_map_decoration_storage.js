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

        Object.seal(this);
    }
    
        //
        // random boxes
        //

    addBoxes(room,x,z,yOffset,high)
    {
        let n,stackLevel,boxY,boxCount,rotWid,mesh;
        let ang,angAdd;
        let wid,boxPos,rotAngle;
        let boxBitmap=map.getTexture(map.TEXTURE_TYPE_BOX);
        
        let boxBoundX=new wsBound(0,0);
        let boxBoundY=new wsBound(0,0);
        let boxBoundZ=new wsBound(0,0);
        
        boxPos=new wsPoint(0,0,0);
        rotAngle=new wsPoint(0.0,0.0,0.0);
        
            // find the middle of the box spot
            // and box sizes

        wid=Math.trunc(high/2);

            // count of boxes, up to 4 levels

        boxCount=genRandom.randomInt(1,4);
        boxY=room.yBound.max+yOffset;
        rotWid=Math.trunc(wid*1.5);

            // build the boxes around a rotating axis

        for (stackLevel=0;stackLevel!==3;stackLevel++) {

            ang=0;
            angAdd=(360.0/boxCount);

            for (n=0;n!==boxCount;n++) {

                boxPos.setFromValues(-rotWid,0,0);
                boxPos.rotateY(null,ang);
                boxPos.addPoint(pos);

                boxBoundX.setFromValues((boxPos.x-wid),(boxPos.x+wid));
                boxBoundY.setFromValues((boxY-high),boxY);
                boxBoundZ.setFromValues((boxPos.z-wid),(boxPos.z+wid));

                rotAngle.setFromValues(0.0,(genRandom.random()*360.0),0.0);

                mesh=MeshPrimitivesClass.createMeshRotatedCube(boxBitmap,boxBoundX,boxBoundY,boxBoundZ,rotAngle,true,true,true,true,true,(stackLevel!==0),false,map.MESH_FLAG_DECORATION);
                MeshPrimitivesClass.meshCubeSetWholeUV(mesh);
                map.addMesh(mesh);
                
                ang+=angAdd;
            }

                // go up one level?

            if (boxCount===1) return;

            boxCount--;
            boxY-=high;
            rotWid=Math.trunc(rotWid*0.8);

                // never go above ceiling

            if ((boxY-high)<room.yBound.min) return;
        }
    }
            
        //
        // shelves
        //
        
    addShelf(room,x,z)
    {
        let legWid,mesh,mesh2;
        let stackLevel,stackCount;
        let tableBoundX,tableBoundY,tableBoundZ;
        let legMinBoundX,legMaxBoundX,legMinBoundZ,legMaxBoundZ,legBoundY;
        let bitmap;
        
        x=room.xBound.min+(x*map.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*map.ROOM_BLOCK_WIDTH);
        
        legWid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.1);
        bitmap=map.getTexture(map.TEXTURE_TYPE_METAL);

            // height and width

        stackCount=genRandom.randomInt(1,3);
        
            // some preset bounds
            
        mesh=null;
        
        tableBoundX=new wsBound((x+this.xShelfMargin),((x+map.ROOM_BLOCK_WIDTH)-this.xShelfMargin));
        tableBoundY=new wsBound((room.yBound.max-this.shelfHigh),((room.yBound.max-this.shelfHigh)+map.ROOM_FLOOR_DEPTH));
        tableBoundZ=new wsBound((z+this.zShelfMargin),((z+map.ROOM_BLOCK_WIDTH)-this.zShelfMargin));

        legMinBoundX=new wsBound((x+this.xShelfMargin),((x+this.xShelfMargin)+legWid));
        legMaxBoundX=new wsBound((((x+map.ROOM_BLOCK_WIDTH)-this.xShelfMargin)-legWid),((x+map.ROOM_BLOCK_WIDTH)-this.xShelfMargin));
        legMinBoundZ=new wsBound((z+this.zShelfMargin),((z+this.zShelfMargin)+legWid));
        legMaxBoundZ=new wsBound((((z+map.ROOM_BLOCK_WIDTH)-this.zShelfMargin)-legWid),((z+map.ROOM_BLOCK_WIDTH)-this.zShelfMargin));
        
        legBoundY=new wsBound(((room.yBound.max-this.shelfHigh)+map.ROOM_FLOOR_DEPTH),room.yBound.max);

            // the stacked shelves
            
        for (stackLevel=0;stackLevel!==stackCount;stackLevel++) {

                // the table

            mesh2=MeshPrimitivesClass.createMeshCube(bitmap,tableBoundX,tableBoundY,tableBoundZ,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
            if (mesh===null) {
                mesh=mesh2;
            }
            else {
                mesh.combineMesh(mesh2);
            }
            
                // legs

            mesh2=MeshPrimitivesClass.createMeshCube(bitmap,legMinBoundX,legBoundY,legMinBoundZ,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
            mesh.combineMesh(mesh2);

            mesh2=MeshPrimitivesClass.createMeshCube(bitmap,legMinBoundX,legBoundY,legMaxBoundZ,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
            mesh.combineMesh(mesh2);

            mesh2=MeshPrimitivesClass.createMeshCube(bitmap,legMaxBoundX,legBoundY,legMinBoundZ,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
            mesh.combineMesh(mesh2);

            mesh2=MeshPrimitivesClass.createMeshCube(bitmap,legMaxBoundX,legBoundY,legMaxBoundZ,true,true,true,true,false,false,false,map.MESH_FLAG_DECORATION);
            mesh.combineMesh(mesh2);

                // go up one level

            tableBoundY.add(-this.shelfHigh);
            if (tableBoundY.min<room.yBound.min) break;
            
            legBoundY.add(-this.shelfHigh);
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
                
                this.addShelf(room,x,z);
            
                    // randomly pick a storage type
/*
                switch (genRandom.randomIndex(3)) {
                    case 0:
                        this.addBoxes(room,pos,0,high);
                        break;
                    case 1:
                        this.addShelf(room,pos,high);
                        break;
                    case 2:
                        this.addShelf(room,pos,high,true);
                        this.addBoxes(room,pos,-high,high);
                        break;

                }
               */
            }
        }
    }

}
