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
        // computers
        //
        
    addComputer(room)
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
        topBoundY=new wsBound(room.yBound.min,(room.yBound.min+config.ROOM_FLOOR_DEPTH));
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

        yPipeBound=new wsBound((room.yBound.min+config.ROOM_FLOOR_DEPTH),(room.yBound.max-(high+config.ROOM_FLOOR_DEPTH)));

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
        // computer decorations mainline
        //

    create(room)
    {
        var n,pieceCount;
        
        pieceCount=10;//genRandom.randomInt(config.ROOM_DECORATION_MIN_COUNT,config.ROOM_DECORATION_EXTRA_COUNT);

        for (n=0;n!==pieceCount;n++) {
            this.addComputer(room);
        }
    }

}
