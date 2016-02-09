"use strict";

//
// map platforms
//

function GenRoomLedgeObject(map,genRandom,room)
{
    this.map=map;
    this.genRandom=genRandom;
    this.room=room;
    
        //
        // add ledge chunk
        //
        
    this.addLedgeChunk=function(x,z,ledgeBitmap)
    {
        var xLedgeBound=new wsBound((this.room.xBound.min+(x*ROOM_BLOCK_WIDTH)),(this.room.xBound.min+((x+1)*ROOM_BLOCK_WIDTH)));
        var yLedgeBound=new wsBound((this.room.yBound.max-ROOM_LEDGE_HEIGHT),this.room.yBound.max);
        var zLedgeBound=new wsBound((this.room.zBound.min+(z*ROOM_BLOCK_WIDTH)),(this.room.zBound.min+((z+1)*ROOM_BLOCK_WIDTH)));

        this.map.addMesh(meshPrimitives.createMeshCube(ledgeBitmap,xLedgeBound,yLedgeBound,zLedgeBound,false,true,true,true,true,true,true,false,MESH_FLAG_ROOM_PLATFORM));

        this.map.addOverlayPlatform(xLedgeBound,zLedgeBound);
    };
        
        //
        // create ledges
        // 
    
    this.createLedges=function()
    {
        var x,z;
        var ledgeBitmap=this.map.getBitmapById(TEXTURE_LEDGE);
        
            // left and right sides
            
        for (z=0;z!==this.room.zBlockSize;z++) {
            if (this.room.getEdgeGridValue(0,z)===0) this.addLedgeChunk(0,z,ledgeBitmap);
            if (this.room.getEdgeGridValue((this.room.xBlockSize-1),z)===0) this.addLedgeChunk((this.room.xBlockSize-1),z,ledgeBitmap);
        }
        
            // top and bottom sides
            
        for (x=1;x<(this.room.xBlockSize-1);x++) {
            if (this.room.getEdgeGridValue(x,0)===0) this.addLedgeChunk(x,0,ledgeBitmap);
            if (this.room.getEdgeGridValue(x,(this.room.zBlockSize-1))===0) this.addLedgeChunk(x,(this.room.zBlockSize-1),ledgeBitmap);
        }
        
    };
    
}

