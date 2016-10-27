/* global map, config, MeshPrimitivesClass, MESH_FLAG_DECORATION, genRandom, DEGREE_TO_RAD */

"use strict";

//
// generate room equipment decoration class
//

class GenRoomDecorationEquipmentClass
{
    constructor()
    {
        Object.seal(this);
    }
        
        //
        // pipes
        //
        
    addPipes(room)
    {
        var n,pos,yBound,platformBoundX,platformBoundY,platformBoundZ,pipeBoundY;
        var nPipe,pipeWid,radius,wid;
        var ang,angAdd,rd;
        var platformBitmap,pipeBitmap;
        var centerPt;
        
            // the pipes location

        pos=room.findAndBlockSpawnPosition();
        if (pos===null) return;
        
        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        pipeBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // the pipe platforms
        
        yBound=room.getSpawnToFirstPlatformOrTopBound(Math.trunc(pos.x/config.ROOM_BLOCK_WIDTH),Math.trunc(pos.z/config.ROOM_BLOCK_WIDTH));
        
        wid=Math.trunc(config.ROOM_BLOCK_WIDTH*0.5);

        platformBoundX=new wsBound((pos.x-wid),(pos.x+wid));
        platformBoundZ=new wsBound((pos.z-wid),(pos.z+wid));

        platformBoundY=new wsBound(yBound.min,(yBound.min+config.ROOM_FLOOR_DEPTH));
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,platformBoundX,platformBoundY,platformBoundZ,null,false,true,true,true,true,false,true,false,MESH_FLAG_DECORATION));
        
        platformBoundY=new wsBound((yBound.max-config.ROOM_FLOOR_DEPTH),room.yBound.max);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,platformBoundX,platformBoundY,platformBoundZ,null,false,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));

        pipeBoundY=new wsBound((yBound.min+config.ROOM_FLOOR_DEPTH),(yBound.max-config.ROOM_FLOOR_DEPTH));
        
            // create the pipes
            
        nPipe=genRandom.randomInt(2,5);

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
        
        pieceCount=room.getDecorationCount();

        for (n=0;n!==pieceCount;n++) {
            this.addPipes(room);
        }
    }

}
