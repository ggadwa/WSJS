"use strict";

//
// generate room decoration class
//

class GenRoomDecorationClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // random boxes
        //

    addBoxes(room)
    {
        var n,stackLevel,pos,boxPos,boxY,boxCount,rotWid;
        var ang,angAdd;
        var wid,high,rotAngle;
        var boxBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
        var boxBoundX=new wsBound(0,0);
        var boxBoundY=new wsBound(0,0);
        var boxBoundZ=new wsBound(0,0);
        
        var boxPos=new wsPoint(0,0,0);
        var rotAngle=new wsPoint(0.0,0.0,0.0);
        
        var minWidth=Math.trunc(config.ROOM_BLOCK_WIDTH*0.2);
        var extraWidth=Math.trunc(config.ROOM_BLOCK_WIDTH*0.25);

            // find the middle of the box spot
            // and box sizes

        pos=room.findRandomDecorationLocation(false);
        if (pos===null) return;

        high=genRandom.randomInt(minWidth,extraWidth);
        wid=Math.trunc(high/2);

            // count of boxes, up to 4 levels

        boxCount=genRandom.randomInt(1,4);
        boxY=room.yBound.max;
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
        // machines
        //
        
    addMachine(room)
    {
        var n,pos,wid,high,margin;
        var machineBoundX,machineBoundY,machineBoundZ,topBoundY,midBoundY,botBoundY;
        var machineWid;
        var nPipe,pipeWid,radius;
        var ang,angAdd,rd;
        var machineBitmap,platformBitmap,pipeBitmap;
        var centerPt,yPipeBound;
            
            // machine size setup
            
        margin=genRandom.randomInt(0,Math.trunc(config.ROOM_BLOCK_WIDTH/8));

        wid=Math.trunc(config.ROOM_BLOCK_WIDTH/2);
        high=genRandom.randomInt(config.ROOM_BLOCK_WIDTH,1000);

        machineWid=wid-margin;
        
        machineBoundY=new wsBound((room.yBound.max-high),(room.yBound.max-config.ROOM_FLOOR_DEPTH));
        topBoundY=new wsBound(room.yStoryBound.min,(room.yStoryBound.min+config.ROOM_FLOOR_DEPTH));
        midBoundY=new wsBound((machineBoundY.min-config.ROOM_FLOOR_DEPTH),machineBoundY.min);
        botBoundY=new wsBound((room.yBound.max-config.ROOM_FLOOR_DEPTH),room.yBound.max);
            
            // the machine location

        pos=room.findRandomDecorationLocation(true);
        if (pos===null) return;
        
        machineBitmap=map.getTexture(map.TEXTURE_TYPE_MACHINE);
        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        pipeBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // do machine
        
        machineBoundX=new wsBound((pos.x-machineWid),(pos.x+machineWid));
        machineBoundZ=new wsBound((pos.z-machineWid),(pos.z+machineWid));

        map.addMesh(MeshPrimitivesClass.createMeshCube(machineBitmap,machineBoundX,machineBoundY,machineBoundZ,null,true,true,true,true,true,false,false,false,MESH_FLAG_DECORATION));

            // the top, mid, and bottom boxes

        machineBoundX=new wsBound((pos.x-wid),(pos.x+wid));
        machineBoundZ=new wsBound((pos.z-wid),(pos.z+wid));

        if (!room.openCeiling) map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,machineBoundX,topBoundY,machineBoundZ,null,false,true,true,true,true,false,true,false,MESH_FLAG_DECORATION));
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,machineBoundX,midBoundY,machineBoundZ,null,false,true,true,true,true,true,true,false,MESH_FLAG_DECORATION));
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,machineBoundX,botBoundY,machineBoundZ,null,false,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));

            // no pipes if open ceiling

        if (room.openCeiling) return;
        
            // the machine pipes

        nPipe=genRandom.randomInt(1,5);

        centerPt=new wsPoint(0,0,0);

        yPipeBound=new wsBound((room.yStoryBound.min+config.ROOM_FLOOR_DEPTH),(room.yBound.max-(high+config.ROOM_FLOOR_DEPTH)));

        ang=0.0;
        angAdd=360.0/nPipe;

        pipeWid=Math.trunc(machineWid*0.25);
        radius=Math.trunc(machineWid*0.1);

        for (n=0;n!==nPipe;n++) {
            rd=ang*DEGREE_TO_RAD;
            centerPt.x=pos.x+((pipeWid*Math.sin(rd))+(pipeWid*Math.cos(rd)));
            centerPt.z=pos.z+((pipeWid*Math.cos(rd))-(pipeWid*Math.sin(rd)));

            map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(pipeBitmap,centerPt,yPipeBound,radius,MESH_FLAG_DECORATION));

            ang+=angAdd;
        }
    }
    
        //
        // shelves
        //
        
    addShelf(room)
    {
        var pos,xWid,zWid,legWid,high;
        var stackLevel,stackCount,boxY;
        var bitmap;
        
        var boxBoundX=new wsBound(0,0);
        var boxBoundY=new wsBound(0,0);
        var boxBoundZ=new wsBound(0,0);
        
        legWid=Math.trunc(config.ROOM_BLOCK_WIDTH*0.1);
        bitmap=map.getTexture(map.TEXTURE_TYPE_METAL);

        pos=room.findRandomDecorationLocation(false);
        if (pos===null) return;

            // height and width

        if (genRandom.randomPercentage(0.5)) {
            xWid=Math.trunc(config.ROOM_BLOCK_WIDTH/2);
            zWid=xWid-Math.trunc(0,Math.trunc(config.ROOM_BLOCK_WIDTH*0.2));
        }
        else {
            zWid=Math.trunc(config.ROOM_BLOCK_WIDTH/2);
            xWid=zWid-Math.trunc(0,Math.trunc(config.ROOM_BLOCK_WIDTH*0.2));
        }
        high=genRandom.randomInt(Math.trunc(config.ROOM_BLOCK_WIDTH*0.25),1000);

        stackCount=1;
        if (genRandom.randomPercentage(0.75)) stackCount=genRandom.randomInt(2,2);

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
        // pipes
        //
        
    addPipes(room)
    {
        var n,pos,ty,by,platformBoundX,platformBoundY,platformBoundZ,pipeBoundY;
        var nPipe,pipeWid,radius,wid;
        var ang,angAdd,rd;
        var platformBitmap,pipeBitmap;
        var centerPt;
        
            // can't have pipes in open ceiling rooms
            
        if (room.openCeiling) return;
            
            // the pipes location

        pos=room.findRandomDecorationLocation(true);
        if (pos===null) return;
        
        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        pipeBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // the pipe platforms
            
        ty=room.yStoryBound.min+genRandom.randomInt(config.ROOM_FLOOR_DEPTH,Math.trunc(config.ROOM_BLOCK_WIDTH/4));
        by=room.yStoryBound.max-genRandom.randomInt(config.ROOM_FLOOR_DEPTH,Math.trunc(config.ROOM_BLOCK_WIDTH/4));
        
        wid=Math.trunc(config.ROOM_BLOCK_WIDTH*0.5);

        platformBoundX=new wsBound((pos.x-wid),(pos.x+wid));
        platformBoundZ=new wsBound((pos.z-wid),(pos.z+wid));

        platformBoundY=new wsBound(room.yStoryBound.min,ty);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,platformBoundX,platformBoundY,platformBoundZ,null,false,true,true,true,true,false,true,false,MESH_FLAG_DECORATION));
        
        platformBoundY=new wsBound(by,room.yStoryBound.max);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,platformBoundX,platformBoundY,platformBoundZ,null,false,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));

        pipeBoundY=new wsBound(ty,by);
        
            // create the pipes
            
        nPipe=genRandom.randomInt(1,5);

        centerPt=new wsPoint(0,0,0);

        ang=0.0;
        angAdd=360.0/nPipe;

        pipeWid=Math.trunc(config.ROOM_BLOCK_WIDTH*0.25);
        radius=Math.trunc(config.ROOM_BLOCK_WIDTH*0.1);

        for (n=0;n!==nPipe;n++) {
            rd=ang*DEGREE_TO_RAD;
            centerPt.x=pos.x+((pipeWid*Math.sin(rd))+(pipeWid*Math.cos(rd)));
            centerPt.z=pos.z+((pipeWid*Math.cos(rd))-(pipeWid*Math.sin(rd)));

            map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(pipeBitmap,centerPt,pipeBoundY,radius,MESH_FLAG_DECORATION));

            ang+=angAdd;
        }
    }
    
        //
        // decorations mainline
        //

    addDecorations(room)
    {
        var n,pieceCount;
        
        pieceCount=genRandom.randomInt(config.ROOM_DECORATION_MIN_COUNT,config.ROOM_DECORATION_EXTRA_COUNT);

        for (n=0;n!==pieceCount;n++) {
            
                // randomly pick a decoration
                // 0 = nothing

            switch (genRandom.randomIndex(5)) {
                case 1:
                    this.addBoxes(room);
                    break;
                case 2:
                    this.addMachine(room);
                    break;
                case 3:
                    this.addShelf(room);
                    break;
                case 4:
                    this.addPipes(room);
                    break;
            }
        }
    }

}
