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
        
    this.addLedgeChunk=function(xMin,zMin,xMax,zMax,high,ledgeBitmap)
    {
        var xLedgeBound=new wsBound((this.room.xBound.min+xMin),(this.room.xBound.min+xMax));
        var yLedgeBound=new wsBound((this.room.yBound.max-high),this.room.yBound.max);
        var zLedgeBound=new wsBound((this.room.zBound.min+zMin),(this.room.zBound.min+zMax));

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
        
            // ledge width and height
            
        var wid=this.genRandom.randomInt(ROOM_LEDGE_MIN_HEIGHT,ROOM_LEDGE_EXTRA_HEIGHT);
        var high=this.genRandom.randomInt(ROOM_LEDGE_MIN_WIDTH,ROOM_LEDGE_EXTRA_WIDTH);

            // left and right sides
            
        for (z=0;z!==this.room.zBlockSize;z++) {
            if (this.room.getEdgeGridValue(0,z)===0) this.addLedgeChunk(0,(z*ROOM_BLOCK_WIDTH),wid,((z+1)*ROOM_BLOCK_WIDTH),high,ledgeBitmap);
            if (this.room.getEdgeGridValue((this.room.xBlockSize-1),z)===0) this.addLedgeChunk(((this.room.xBlockSize*ROOM_BLOCK_WIDTH)-wid),(z*ROOM_BLOCK_WIDTH),(this.room.xBlockSize*ROOM_BLOCK_WIDTH),((z+1)*ROOM_BLOCK_WIDTH),high,ledgeBitmap);
        }
        
            // top and bottom sides
            
        for (x=0;x!==this.room.xBlockSize;x++) {
            if (this.room.getEdgeGridValue(x,0)===0) this.addLedgeChunk((x*ROOM_BLOCK_WIDTH),0,((x+1)*ROOM_BLOCK_WIDTH),wid,high,ledgeBitmap);
            if (this.room.getEdgeGridValue(x,(this.room.zBlockSize-1))===0) this.addLedgeChunk((x*ROOM_BLOCK_WIDTH),((this.room.zBlockSize*ROOM_BLOCK_WIDTH)-wid),((x+1)*ROOM_BLOCK_WIDTH),(this.room.zBlockSize*ROOM_BLOCK_WIDTH),high,ledgeBitmap);
        }
        
    };
    
}

