"use strict";

//
// map platforms
//

function GenRoomLedge(map,genRandom,room)
{
    this.map=map;
    this.genRandom=genRandom;
    this.room=room;
    
        //
        // add ledge chunk
        //
        
    this.addLedgeChunk=function(x,z,ledgeBitmap)
    {
        var xPlatformBound=new wsBound((this.room.xBound.min+(x*ROOM_BLOCK_WIDTH)),(this.room.xBound.min+((x+1)*ROOM_BLOCK_WIDTH)));
        var yPlatformBound=new wsBound((this.room.yBound.max-2000),this.room.yBound.max);
        var zPlatformBound=new wsBound((this.room.zBound.min+(z*ROOM_BLOCK_WIDTH)),(this.room.zBound.min+((z+1)*ROOM_BLOCK_WIDTH)));

        this.map.addMesh(meshPrimitives.createMeshCube(ledgeBitmap,xPlatformBound,yPlatformBound,zPlatformBound,false,true,true,true,true,true,true,false,MESH_FLAG_ROOM_PLATFORM));

        //this.map.addOverlayPlatform(xPlatformBound,zPlatformBound);
    };
        
        //
        // create ledges
        // 
    
    this.createLedges=function()
    {
        var x,z,idx;
        var edgeGrid=this.room.edgeGrid;
        
        var ledgeBitmap=this.map.getBitmapById(TEXTURE_BOX);
        
            // left and right sides
            
        for (z=0;z!==this.room.zBlockSize;z++) {
            
            idx=z*this.room.zBlockSize;
            if (edgeGrid[idx]===0) {
                this.addLedgeChunk(0,z,ledgeBitmap);
            }
            
            idx=(z*this.room.zBlockSize)+(this.room.xBlockSize-1);
            if (edgeGrid[idx]===0) {
                this.addLedgeChunk((this.room.xBlockSize-1),z,ledgeBitmap);
            }
        }
        
            // top and bottom sides
            
        for (x=1;x<(this.room.xBlockSize-1);x++) {

            idx=x;
            if (edgeGrid[idx]===0) {
                this.addLedgeChunk(x,0,ledgeBitmap);
            }
            
            idx=(z*(this.room.zBlockSize-1))+x;
            if (edgeGrid[idx]===0) {
                this.addLedgeChunk(x,(this.room.zBlockSize-1),ledgeBitmap);
            }
        }
        
    };
    
}

