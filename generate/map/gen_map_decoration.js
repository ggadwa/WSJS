"use strict";

//
// generate room decoration class
//

class GenRoomDecorationClass
{
    constructor(view,bitmapList,map,genRandom)
    {    
        this.view=view;
        this.bitmapList=bitmapList;
        this.map=map;
        this.genRandom=genRandom;
    }
    
        //
        // random boxes
        //

    addBoxes(room)
    {
        var n,k,stackLevel,pos,boxPos,boxY,stackCount,boxCount,rotWid;
        var ang,angAdd;
        var wid,high,rotAngle;
        
        var boxBoundX=new wsBound(0,0);
        var boxBoundY=new wsBound(0,0);
        var boxBoundZ=new wsBound(0,0);
        
        var boxPos=new wsPoint(0,0,0);
        var rotAngle=new wsPoint(0.0,0.0,0.0);

        stackCount=this.genRandom.randomInt(ROOM_DECORATION_BOX_MIN_COUNT,ROOM_DECORATION_BOX_EXTRA_COUNT);

        for (n=0;n!==stackCount;n++) {
            
                // find the middle of the box spot
                // and box sizes
                
            pos=room.findRandomDecorationLocation(this.genRandom,false);
            if (pos===null) break;
            
            high=this.genRandom.randomInt(ROOM_DECORATION_BOX_MIN_WIDTH,ROOM_DECORATION_BOX_EXTRA_WIDTH);
            wid=Math.trunc(high/2);
            
                // count of boxes
                
            boxCount=this.genRandom.randomInt(ROOM_DECORATION_BOX_MIN_STACK_COUNT,ROOM_DECORATION_BOX_EXTRA_STACK_COUNT);
            boxY=room.yBound.max;
            rotWid=Math.trunc(wid*1.5);
            
                // build the boxes around a rotating axis
                
            for (stackLevel=0;stackLevel!==3;stackLevel++) {
                
                ang=0;
                angAdd=(360.0/boxCount);

                for (k=0;k!==boxCount;k++) {

                    boxPos.setFromValues(-rotWid,0,0);
                    boxPos.rotateY(null,ang);
                    boxPos.addPoint(pos);

                    boxBoundX.setFromValues((boxPos.x-wid),(boxPos.x+wid));
                    boxBoundY.setFromValues((boxY-high),boxY);
                    boxBoundZ.setFromValues((boxPos.z-wid),(boxPos.z+wid));

                    rotAngle.setFromValues(0.0,(this.genRandom.random()*360.0),0.0);

                    this.map.addMesh(MeshPrimitivesClass.createMeshCube(this.bitmapList.getBitmap('Map Box'),boxBoundX,boxBoundY,boxBoundZ,rotAngle,true,true,true,true,true,true,(stackLevel!==0),false,MESH_FLAG_DECORATION));

                    ang+=angAdd;
                }
                
                    // go up one level?
                    
                if ((boxCount===1) || (!this.genRandom.randomPercentage(ROOM_DECORATION_BOX_STACK_PERCENTAGE))) break;
                
                boxCount--;
                boxY-=high;
                rotWid=Math.trunc(rotWid*0.8);
            }
        }

    }
        
        //
        // machines
        //
        
    addMachine(room)
    {
        var n,machineCount;
        var pos,wid,high,margin;
        var machineBoundX,machineBoundY,machineBoundZ,topBoundY,midBoundY,botBoundY;
        var machineWid;
        var nPipe,pipeWid,radius;
        var ang,angAdd,rd;
        var machineBitmap,metalBitmap,pipeBitmap;
        var centerPt,yPipeBound;
            
            // machine size setup
            
        margin=this.genRandom.randomInt(0,Math.trunc(ROOM_BLOCK_WIDTH/8));

        wid=Math.trunc(ROOM_BLOCK_WIDTH/2);
        high=this.genRandom.randomInt(ROOM_BLOCK_WIDTH,1000);

        machineWid=wid-margin;
        
        machineBoundY=new wsBound((room.yBound.max-high),(room.yBound.max-ROOM_FLOOR_DEPTH));
        topBoundY=new wsBound(room.yStoryBound.min,(room.yStoryBound.min+ROOM_FLOOR_DEPTH));
        midBoundY=new wsBound((machineBoundY.min-ROOM_FLOOR_DEPTH),machineBoundY.min);
        botBoundY=new wsBound((room.yBound.max-ROOM_FLOOR_DEPTH),room.yBound.max);
            
            // the machine start location

        pos=room.findRandomDecorationLocation(this.genRandom,true);
        if (pos===null) return;
        
        machineBitmap=this.bitmapList.getBitmap('Map Machine');
        metalBitmap=this.bitmapList.getBitmap('Map Metal');
        pipeBitmap=this.bitmapList.getBitmap('Map Metal');
        
            // do row of machines
        
        machineCount=this.genRandom.randomInt(1,3);

        while (machineCount>0) {

            machineBoundX=new wsBound((pos.x-machineWid),(pos.x+machineWid));
            machineBoundZ=new wsBound((pos.z-machineWid),(pos.z+machineWid));
            
            this.map.addMesh(MeshPrimitivesClass.createMeshCube(machineBitmap,machineBoundX,machineBoundY,machineBoundZ,null,true,true,true,true,true,false,false,false,MESH_FLAG_DECORATION));

                // the top, mid, and bottom boxes
                
            machineBoundX=new wsBound((pos.x-wid),(pos.x+wid));
            machineBoundZ=new wsBound((pos.z-wid),(pos.z+wid));

            this.map.addMesh(MeshPrimitivesClass.createMeshCube(metalBitmap,machineBoundX,topBoundY,machineBoundZ,null,false,true,true,true,true,false,true,false,MESH_FLAG_DECORATION));
            this.map.addMesh(MeshPrimitivesClass.createMeshCube(metalBitmap,machineBoundX,midBoundY,machineBoundZ,null,false,true,true,true,true,true,true,false,MESH_FLAG_DECORATION));
            this.map.addMesh(MeshPrimitivesClass.createMeshCube(metalBitmap,machineBoundX,botBoundY,machineBoundZ,null,false,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));

                // the machine pipes

            nPipe=this.genRandom.randomInt(1,5);

            centerPt=new wsPoint(0,0,0);

            yPipeBound=new wsBound((room.yStoryBound.min+ROOM_FLOOR_DEPTH),(room.yBound.max-(high+ROOM_FLOOR_DEPTH)));

            ang=0.0;
            angAdd=360.0/nPipe;

            pipeWid=Math.trunc(machineWid*0.25);
            radius=Math.trunc(machineWid*0.1);

            for (n=0;n!==nPipe;n++) {
                rd=ang*DEGREE_TO_RAD;
                centerPt.x=pos.x+((pipeWid*Math.sin(rd))+(pipeWid*Math.cos(rd)));
                centerPt.z=pos.z+((pipeWid*Math.cos(rd))-(pipeWid*Math.sin(rd)));

                this.map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(pipeBitmap,centerPt,yPipeBound,radius,MESH_FLAG_DECORATION));

                ang+=angAdd;
            }
            
                // find next location
                
            pos=room.nextDecorationLocation(this.genRandom,true,pos);
            if (pos===null) return;
            
            machineCount--;
        }
    }
    
        //
        // furnature
        //
        
    addFurnature(room)
    {
        var n,pieceCount;
        var pos,wid,high;
        
        var boxBoundX=new wsBound(0,0);
        var boxBoundY=new wsBound(0,0);
        var boxBoundZ=new wsBound(0,0);
        
        wid=Math.trunc(ROOM_BLOCK_WIDTH/2);
        high=this.genRandom.randomInt(Math.trunc(ROOM_BLOCK_WIDTH/4),1000);

        pieceCount=this.genRandom.randomInt(ROOM_DECORATION_BOX_MIN_COUNT,ROOM_DECORATION_BOX_EXTRA_COUNT);

        for (n=0;n!==pieceCount;n++) {
            pos=room.findRandomDecorationLocation(this.genRandom,false);
            if (pos===null) return;
            
            boxBoundX=new wsBound((pos.x-wid),(pos.x+wid));
            boxBoundY=new wsBound((room.yBound.max-high),((room.yBound.max-high)+ROOM_FLOOR_DEPTH));
            boxBoundZ=new wsBound((pos.z-wid),(pos.z+wid));
            
            this.map.addMesh(MeshPrimitivesClass.createMeshCube(this.bitmapList.getBitmap('Map Box'),boxBoundX,boxBoundY,boxBoundZ,null,true,true,true,true,true,true,true,false,MESH_FLAG_DECORATION));
        }
    }
    
        //
        // decorations mainline
        //

    addDecorations(room)
    {
        this.addFurnature(room);
        return;
        
            // randomly pick a decoration
            // 0 = nothing
            
        switch (this.genRandom.randomIndex(4)) {
            case 1:
                this.addBoxes(room);
                break;
            case 2:
                this.addMachine(room);
                break;
            case 3:
                this.addFurnature(room);
                break;
        }
    }

}
