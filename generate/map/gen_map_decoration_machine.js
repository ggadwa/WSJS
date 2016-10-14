"use strict";

//
// generate room machine decoration class
//

class GenRoomDecorationMachineClass
{
    constructor()
    {
        Object.seal(this);
    }
        
        //
        // machine
        //
        
    addMachine(room)
    {
        var n,pos,ty,by,platformBoundX,platformBoundY,platformBoundZ,pipeBoundY;
        var nPipe,pipeWid,radius,wid;
        var ang,angAdd,rd;
        var platformBitmap,pipeBitmap;
        var centerPt;
        
            // the pipes location

        pos=room.findRandomDecorationLocation(true);
        if (pos===null) return;
        
        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        pipeBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // the pipe platforms
            
        ty=room.yBound.min+genRandom.randomInt(config.ROOM_FLOOR_DEPTH,Math.trunc(config.ROOM_BLOCK_WIDTH/4));
        by=room.yBound.max-genRandom.randomInt(config.ROOM_FLOOR_DEPTH,Math.trunc(config.ROOM_BLOCK_WIDTH/4));
        
        wid=Math.trunc(config.ROOM_BLOCK_WIDTH*0.5);

        platformBoundX=new wsBound((pos.x-wid),(pos.x+wid));
        platformBoundZ=new wsBound((pos.z-wid),(pos.z+wid));

        platformBoundY=new wsBound(room.yBound.min,ty);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,platformBoundX,platformBoundY,platformBoundZ,null,false,true,true,true,true,false,true,false,MESH_FLAG_DECORATION));
        
        platformBoundY=new wsBound(by,room.yBound.max);
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
        // machine decorations mainline
        //

    create(room)
    {
        var n,pieceCount;
        
        pieceCount=genRandom.randomInt(config.ROOM_DECORATION_MIN_COUNT,config.ROOM_DECORATION_EXTRA_COUNT);

        for (n=0;n!==pieceCount;n++) {
            this.addMachine(room);
        }
    }

}
