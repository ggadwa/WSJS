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

    this.addLedgeChunk=function(pts,nSide,high,skipSides,bitmap)
    {
        var n,k,idx;
        var vertexCount,vertexList;
        
            // height
            
        var by=this.room.yBound.max;
        var ty=by-high;
        
            // get vertex count
        
        vertexCount=(nSide-2)*3;          // the top
        
        for (n=0;n!==nSide;n++) {
            if (!skipSides[n]) vertexCount+=6;
        }
        
            // get cube size

        idx=0;
        vertexList=meshUtility.createMapVertexList(vertexCount);

            // sides

        for (n=0;n!==nSide;n++) {
            if (skipSides[n]) continue;
            
            k=n+1;
            if (k===nSide) k=0;

            vertexList[idx++].position.set(pts[n].x,ty,pts[n].z); 
            vertexList[idx++].position.set(pts[k].x,ty,pts[k].z);        
            vertexList[idx++].position.set(pts[k].x,by,pts[k].z);     
            vertexList[idx++].position.set(pts[n].x,ty,pts[n].z);    
            vertexList[idx++].position.set(pts[k].x,by,pts[k].z);  
            vertexList[idx++].position.set(pts[n].x,by,pts[n].z);
        }

            // top

        for (n=0;n!==(nSide-2);n++) {
            vertexList[idx++].position.set(pts[0].x,ty,pts[0].z);
            vertexList[idx++].position.set(pts[n+1].x,ty,pts[n+1].z);
            vertexList[idx++].position.set(pts[n+2].x,ty,pts[n+2].z);
        }

        var n;

        var indexes=new Uint16Array(vertexCount);

        for (n=0;n!==vertexCount;n++) {
            indexes[n]=n;
        }

            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        meshUtility.buildVertexListNormals(vertexList,indexes,null,false);
        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        this.map.addMesh(new MapMeshObject(bitmap,vertexList,indexes,MESH_FLAG_ROOM_PLATFORM));
    };
        
        //
        // create ledges
        // 
    
    this.createLedges=function()
    {
        var x,z;
        var ledgeBitmap=this.map.getBitmapById(TEXTURE_LEDGE);
        
            // ledge width and height
            
        var wid=this.genRandom.randomInt(ROOM_LEDGE_MIN_WIDTH,ROOM_LEDGE_EXTRA_WIDTH);
        var high=this.genRandom.randomInt(ROOM_LEDGE_MIN_HEIGHT,ROOM_LEDGE_EXTRA_HEIGHT);
        
        var xMax=this.room.xBlockSize*ROOM_BLOCK_WIDTH;
        var zMax=this.room.zBlockSize*ROOM_BLOCK_WIDTH;
        
        var pts=[new wsPoint(0,0,0),new wsPoint(0,0,0),new wsPoint(0,0,0),new wsPoint(0,0,0),new wsPoint(0,0,0)];

            // left and right sides
        
        for (z=1;z<(this.room.zBlockSize-1);z++) {
            
            if (this.room.getEdgeGridValue(0,z)===0) {
                pts[0].set(0,0,(z*ROOM_BLOCK_WIDTH));
                pts[0].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[1].set(wid,0,(z*ROOM_BLOCK_WIDTH));
                pts[1].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[2].set(wid,0,((z+1)*ROOM_BLOCK_WIDTH));
                pts[2].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[3].set(0,0,((z+1)*ROOM_BLOCK_WIDTH));
                pts[3].move(this.room.xBound.min,0,this.room.zBound.min);
                
                this.addLedgeChunk(pts,4,high,[false,false,false,true],ledgeBitmap);
            }
            
            if (this.room.getEdgeGridValue((this.room.xBlockSize-1),z)===0) {
                pts[0].set((xMax-wid),0,(z*ROOM_BLOCK_WIDTH));
                pts[0].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[1].set(xMax,0,(z*ROOM_BLOCK_WIDTH));
                pts[1].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[2].set(xMax,0,((z+1)*ROOM_BLOCK_WIDTH));
                pts[2].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[3].set((xMax-wid),0,((z+1)*ROOM_BLOCK_WIDTH));
                pts[3].move(this.room.xBound.min,0,this.room.zBound.min);
                
                this.addLedgeChunk(pts,4,high,[false,true,false,false],ledgeBitmap);
            }
        }
        
            // top and bottom sides
            
        for (x=1;x<(this.room.xBlockSize-1);x++) {
            
            if (this.room.getEdgeGridValue(x,0)===0) {
                pts[0].set((x*ROOM_BLOCK_WIDTH),0,0);
                pts[0].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[1].set((x*ROOM_BLOCK_WIDTH),0,wid);
                pts[1].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[2].set(((x+1)*ROOM_BLOCK_WIDTH),0,wid);
                pts[2].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[3].set(((x+1)*ROOM_BLOCK_WIDTH),0,0);
                pts[3].move(this.room.xBound.min,0,this.room.zBound.min);
                
                this.addLedgeChunk(pts,4,high,[false,false,false,true],ledgeBitmap);
            }
            
            if (this.room.getEdgeGridValue(x,(this.room.zBlockSize-1))===0) {
                pts[0].set((x*ROOM_BLOCK_WIDTH),0,(zMax-wid));
                pts[0].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[1].set((x*ROOM_BLOCK_WIDTH),0,zMax);
                pts[1].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[2].set(((x+1)*ROOM_BLOCK_WIDTH),0,zMax);
                pts[2].move(this.room.xBound.min,0,this.room.zBound.min);
                
                pts[3].set(((x+1)*ROOM_BLOCK_WIDTH),0,(zMax-wid));
                pts[3].move(this.room.xBound.min,0,this.room.zBound.min);
                
                this.addLedgeChunk(pts,4,high,[false,true,false,false],ledgeBitmap);
            }
        }
        
            // corners
            
        if (this.room.getEdgeGridValue(0,0)===0) {
            pts[0].set(0,0,0);
            pts[0].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[1].set(ROOM_BLOCK_WIDTH,0,0);
            pts[1].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[2].set(ROOM_BLOCK_WIDTH,0,wid);
            pts[2].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[3].set(wid,0,ROOM_BLOCK_WIDTH);
            pts[3].move(this.room.xBound.min,0,this.room.zBound.min);
            
            pts[4].set(0,0,ROOM_BLOCK_WIDTH);
            pts[4].move(this.room.xBound.min,0,this.room.zBound.min);

            this.addLedgeChunk(pts,5,high,[true,false,false,false,true],ledgeBitmap);
        }
        
        if (this.room.getEdgeGridValue((this.room.xBlockSize-1),0)===0) {
            pts[0].set((xMax-ROOM_BLOCK_WIDTH),0,0);
            pts[0].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[1].set(xMax,0,0);
            pts[1].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[2].set(xMax,0,ROOM_BLOCK_WIDTH);
            pts[2].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[3].set((xMax-wid),0,ROOM_BLOCK_WIDTH);
            pts[3].move(this.room.xBound.min,0,this.room.zBound.min);
            
            pts[4].set((xMax-ROOM_BLOCK_WIDTH),0,wid);
            pts[4].move(this.room.xBound.min,0,this.room.zBound.min);

            this.addLedgeChunk(pts,5,high,[true,true,false,false,false],ledgeBitmap);
        }
        
        if (this.room.getEdgeGridValue((this.room.xBlockSize-1),(this.room.zBlockSize-1))===0) {
            pts[0].set((xMax-wid),0,(zMax-ROOM_BLOCK_WIDTH));
            pts[0].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[1].set(xMax,0,(zMax-ROOM_BLOCK_WIDTH));
            pts[1].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[2].set(xMax,0,zMax);
            pts[2].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[3].set((xMax-ROOM_BLOCK_WIDTH),0,zMax);
            pts[3].move(this.room.xBound.min,0,this.room.zBound.min);
            
            pts[4].set((xMax-ROOM_BLOCK_WIDTH),0,(zMax-wid));
            pts[4].move(this.room.xBound.min,0,this.room.zBound.min);

            this.addLedgeChunk(pts,5,high,[false,true,true,false,false],ledgeBitmap);
        }
        
        if (this.room.getEdgeGridValue(0,(this.room.zBlockSize-1))===0) {
            pts[0].set(0,0,(zMax-ROOM_BLOCK_WIDTH));
            pts[0].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[1].set(wid,0,(zMax-ROOM_BLOCK_WIDTH));
            pts[1].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[2].set(ROOM_BLOCK_WIDTH,0,(zMax-wid));
            pts[2].move(this.room.xBound.min,0,this.room.zBound.min);

            pts[3].set(ROOM_BLOCK_WIDTH,0,zMax);
            pts[3].move(this.room.xBound.min,0,this.room.zBound.min);
            
            pts[4].set(0,0,zMax);
            pts[4].move(this.room.xBound.min,0,this.room.zBound.min);

            this.addLedgeChunk(pts,5,high,[false,false,false,true,true],ledgeBitmap);
        }
    };
    
}

