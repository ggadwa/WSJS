"use strict";

//
// generate room storage decoration class
//

class GenRoomDecorationStorageClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // random boxes
        //

    addBoxes(room,pos,yOffset,high)
    {
        var n,stackLevel,boxPos,boxY,boxCount,rotWid;
        var ang,angAdd;
        var wid,rotAngle;
        var boxBitmap=map.getTexture(map.TEXTURE_TYPE_BOX);
        
        var boxBoundX=new wsBound(0,0);
        var boxBoundY=new wsBound(0,0);
        var boxBoundZ=new wsBound(0,0);
        
        var boxPos=new wsPoint(0,0,0);
        var rotAngle=new wsPoint(0.0,0.0,0.0);
        
        var minWidth=Math.trunc(config.ROOM_BLOCK_WIDTH*0.2);
        var extraWidth=Math.trunc(config.ROOM_BLOCK_WIDTH*0.25);

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

                map.addMesh(MeshPrimitivesClass.createMeshCube(boxBitmap,boxBoundX,boxBoundY,boxBoundZ,rotAngle,true,true,true,true,true,true,(stackLevel!==0),false,MESH_FLAG_DECORATION));

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
        
    addShelf(room,pos,high,singleStack)
    {
        var xWid,zWid,legWid;
        var stackLevel,stackCount,boxY;
        var bitmap;
        
        var boxBoundX=new wsBound(0,0);
        var boxBoundY=new wsBound(0,0);
        var boxBoundZ=new wsBound(0,0);
        
        legWid=Math.trunc(config.ROOM_BLOCK_WIDTH*0.1);
        bitmap=map.getTexture(map.TEXTURE_TYPE_METAL);

            // height and width

        if (genRandom.randomPercentage(0.5)) {
            xWid=Math.trunc(config.ROOM_BLOCK_WIDTH/2);
            zWid=xWid-Math.trunc(0,Math.trunc(config.ROOM_BLOCK_WIDTH*0.2));
        }
        else {
            zWid=Math.trunc(config.ROOM_BLOCK_WIDTH/2);
            xWid=zWid-Math.trunc(0,Math.trunc(config.ROOM_BLOCK_WIDTH*0.2));
        }

        stackCount=1;
        if (!singleStack) {
            if (genRandom.randomPercentage(0.75)) stackCount=genRandom.randomInt(2,2);
        }
        
        boxY=room.yBound.max;

        for (stackLevel=0;stackLevel!==stackCount;stackLevel++) {

                // the table

            boxBoundX=new wsBound((pos.x-xWid),(pos.x+xWid));
            boxBoundY=new wsBound((boxY-high),((boxY-high)+config.ROOM_FLOOR_DEPTH));
            boxBoundZ=new wsBound((pos.z-zWid),(pos.z+zWid));

            map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,boxBoundX,boxBoundY,boxBoundZ,null,true,true,true,true,true,true,true,false,MESH_FLAG_DECORATION));

                // legs

            boxBoundY=new wsBound(((boxY-high)+config.ROOM_FLOOR_DEPTH),boxY);

            boxBoundX=new wsBound((pos.x-xWid),((pos.x-xWid)+legWid));
            boxBoundZ=new wsBound((pos.z-zWid),((pos.z-zWid)+legWid));            
            map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,boxBoundX,boxBoundY,boxBoundZ,null,true,true,true,true,true,false,false,false,MESH_FLAG_DECORATION));

            boxBoundZ=new wsBound(((pos.z+zWid)-legWid),(pos.z+zWid));            
            map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,boxBoundX,boxBoundY,boxBoundZ,null,true,true,true,true,true,false,false,false,MESH_FLAG_DECORATION));

            boxBoundX=new wsBound(((pos.x+xWid)-legWid),(pos.x+xWid));
            boxBoundZ=new wsBound((pos.z-zWid),((pos.z-zWid)+legWid));            
            map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,boxBoundX,boxBoundY,boxBoundZ,null,true,true,true,true,true,false,false,false,MESH_FLAG_DECORATION));

            boxBoundZ=new wsBound(((pos.z+zWid)-legWid),(pos.z+zWid));            
            map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,boxBoundX,boxBoundY,boxBoundZ,null,true,true,true,true,true,false,false,false,MESH_FLAG_DECORATION));

                // go up one level

            boxY-=high;
            if ((boxY-high)<room.yBound.min) return;
        }
    }
    
        //
        // storage mainline
        //

    create(room)
    {
        var n,pos,high,pieceCount;
        
        pieceCount=genRandom.randomInt(config.ROOM_DECORATION_MIN_COUNT,config.ROOM_DECORATION_EXTRA_COUNT);
        
            // make all pieces in the room have
            // the same size based on height
            
        high=genRandom.randomInt(Math.trunc(config.ROOM_BLOCK_WIDTH*0.2),Math.trunc(config.ROOM_BLOCK_WIDTH*0.25));

            // create the pieces
            
        for (n=0;n!==pieceCount;n++) {
            
                // location
                
            pos=room.findRandomDecorationLocation(false);
            if (pos===null) continue;
            
                // randomly pick a storage type

            switch (genRandom.randomIndex(3)) {
                case 0:
                    this.addBoxes(room,pos,0,high);
                    break;
                case 1:
                    this.addShelf(room,pos,high,false);
                    break;
                case 2:
                    this.addShelf(room,pos,high,true);
                    this.addBoxes(room,pos,-high,high);
                    break;
                    
            }
        }
    }

}
