"use strict";

//
// map room class
// 
// this is used to track which meshes count as rooms for later placing
// entities or decorations or objectives
//

function MapRoomObject(xBlockSize,zBlockSize,xBound,yBound,zBound,hasStories,level)
{
    this.xBlockSize=xBlockSize;
    this.zBlockSize=zBlockSize;
    this.xBound=xBound;
    this.yBound=yBound;
    this.zBound=zBound;
    this.hasStories=hasStories;
    this.level=level;
    
    this.blockGrid=null;
    this.platformGrid=null;
    
    this.setupGrid=function()
    {
        var x,z;
        
            // make two dimensional arrays or
            // xBlockSize * zBlockSize
            
        this.blockGrid=[];
        this.edgeGrid=[];
        this.platformGrid=[];
        
        for (z=0;z!==this.zBlockSize;z++) {
            this.blockGrid.push(new Uint8Array(this.xBlockSize));
            this.edgeGrid.push(new Uint8Array(this.xBlockSize));
            this.platformGrid.push(new Uint8Array(this.xBlockSize));
        }
        
            // the block grid has it's outer
            // ring blocked off because we never want
            // to build pieces there
            
        for (x=0;x!==this.xBlockSize;x++) {
            this.blockGrid[0][x]=1;
            this.blockGrid[this.zBlockSize-1][x]=1;
        }
            
        for (z=0;z!==this.zBlockSize;z++) {
            this.blockGrid[z][0]=1;
            this.blockGrid[z][this.xBlockSize-1]=1;
        }
        
    };
    
    this.setupGrid();       // supergumba -- IMPORTANT!!!  Move all this after classes!
    
        //
        // flip bits on grid space
        //
        
    this.setBlockGrid=function(x,z)
    {
        this.blockGrid[z][x]=1;
    };
    
    this.setPlatformGrid=function(x,z)
    {
        this.platformGrid[z][x]=1;
    };
    
        //
        // mask edge grid based on collisions with other
        // rooms or bounds
        //
        
    this.maskEdgeGridBlockToBounds=function(xCollideBound,yCollideBound,zCollideBound)
    {
        var x,z,x1,x2,z1,z2;
        
            // no blocking if this collision starts above
            // the current room
            
        if (yCollideBound.min<this.yBound.min) return;
        
            // find the collision bounds within the block
            // width and mark off the edge grid
        
            // collide on our left
            
        if (xCollideBound.max===this.xBound.min) {
            z1=Math.floor((zCollideBound.min-this.zBound.min)/ROOM_BLOCK_WIDTH);
            z2=z1+Math.floor(zCollideBound.getSize()/ROOM_BLOCK_WIDTH);
            if (z1<0) z1=0;
            if (z2>this.zBlockSize) z2=this.zBlockSize;
            
            for (z=z1;z<z2;z++) {
                this.edgeGrid[z][0]=1;
            }
            return;
        }
        
            // collide on our right
            
        if (xCollideBound.min===this.xBound.max) {
            z1=Math.floor((zCollideBound.min-this.zBound.min)/ROOM_BLOCK_WIDTH);
            z2=z1+Math.floor(zCollideBound.getSize()/ROOM_BLOCK_WIDTH);
            if (z1<0) z1=0;
            if (z2>this.zBlockSize) z2=this.zBlockSize;
            
            for (z=z1;z<z2;z++) {
                this.edgeGrid[z][this.xBlockSize-1]=1;
            }
            return;
        }
        
            // collide on our top
            
        if (zCollideBound.max===this.zBound.min) {
            x1=Math.floor((xCollideBound.min-this.xBound.min)/ROOM_BLOCK_WIDTH);
            x2=x1+Math.floor(xCollideBound.getSize()/ROOM_BLOCK_WIDTH);
            if (x1<0) x1=0;
            if (x2>this.xBlockSize) x2=this.xBlockSize;
            
            for (x=x1;x<x2;x++) {
                this.edgeGrid[0][x]=1;
            }
            return;
        }
        
            // collide on our bottom
            
        if (zCollideBound.min===this.zBound.max) {
            x1=Math.floor((xCollideBound.min-this.xBound.min)/ROOM_BLOCK_WIDTH);
            x2=x1+Math.floor(xCollideBound.getSize()/ROOM_BLOCK_WIDTH);
            if (x1<0) x1=0;
            if (x2>this.xBlockSize) x2=this.xBlockSize;
            
            for (x=x1;x<x2;x++) {
                this.edgeGrid[this.zBlockSize-1][x]=1;
            }
            return;
        }
    };
    
    this.maskEdgeGridBlockToRoom=function(collideRoom)
    {
        this.maskEdgeGridBlockToBounds(collideRoom.xBound,collideRoom.yBound,collideRoom.zBound);
    };
    
    this.getEdgeGridValue=function(x,z)
    {
        return(this.edgeGrid[z][x]);
    };
    
        //
        // find points in blocked grid space
        //
    
    this.findRandomEntityPosition=function(genRandom)
    {
        var x,z,bx,bz;
        var findTry=0;
        
        while (findTry<25) {
            x=genRandom.randomInt(0,this.xBlockSize);
            z=genRandom.randomInt(0,this.zBlockSize);
            
                // position in middle of block
                
            bx=Math.floor((this.xBound.min+(ROOM_BLOCK_WIDTH*x))+(ROOM_BLOCK_WIDTH*0.5));
            bz=Math.floor((this.zBound.min+(ROOM_BLOCK_WIDTH*z))+(ROOM_BLOCK_WIDTH*0.5));
            
                // if the grid spot is blocked, then no
                // entity spawns at all
                
            if (this.blockGrid[z][x]===0) {
                
                this.blockGrid[z][x]=1;
                
                    // check to see if we can spawn
                    // to a platform first
                    
                if (this.platformGrid[z][x]===1) {
                    this.platformGrid[z][x]=2;
                    return(new wsPoint(bx,(this.yBound.min-ROOM_FLOOR_DEPTH),bz));
                }
                else {
                    return(new wsPoint(bx,this.yBound.max,bz));
                }
            }
            
            findTry++;
        }
        
        return(null);
    };
    
    this.findRandomPillarLocation=function(genRandom)
    {
        var x,z,bx,bz;
        var findTry=0;
        
        while (findTry<25) {
            x=genRandom.randomInt(0,this.xBlockSize);
            z=genRandom.randomInt(0,this.zBlockSize);
            
                // position in middle of block
                
            bx=Math.floor((this.xBound.min+(ROOM_BLOCK_WIDTH*x))+(ROOM_BLOCK_WIDTH*0.5));
            bz=Math.floor((this.zBound.min+(ROOM_BLOCK_WIDTH*z))+(ROOM_BLOCK_WIDTH*0.5));
            
                // can only spawn pillars on non-blocked
                // grids where there are no platforms
                
            if ((this.blockGrid[z][x]===0) && (this.platformGrid[z][x]===0)) {
                
                    // and don't spawn close to anything else as
                    // pillars can block movement
                    
                if ((this.blockGrid[z][x-1]===0) && (this.blockGrid[z][x+1]===0) && (this.blockGrid[z-1][x]===0) && (this.blockGrid[z+1][x]===0)) {
                    this.blockGrid[z][x]=1;
                    return(new wsPoint(bx,this.yBound.max,bz));
                }
            }
            
            findTry++;
        }
        
        return(null);
    };
    
        //
        // create polygon walls and floors
        //
        
    this.createMeshWalls=function(bitmap,yStoryBound,flag)
    {
        var n,nSegment,x,z,x2,z2;

            // build the vertices.  Each triangle gets it's
            // own vertices so normals and light map UVs work

        nSegment=(this.xBlockSize*2)+(this.zBlockSize*2);

        var vertexList=meshUtility.createMapVertexList(nSegment*6);
        var indexes=new Uint16Array(nSegment*6);
        
        var vIdx=0;
        var iIdx=0;
        
            // top square polygons
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+ROOM_BLOCK_WIDTH;
            
            vertexList[vIdx].position.set(x,yStoryBound.min,this.zBound.min);
            vertexList[vIdx+1].position.set(x2,yStoryBound.min,this.zBound.min);
            vertexList[vIdx+2].position.set(x2,yStoryBound.max,this.zBound.min);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;

            vertexList[vIdx].position.set(x,yStoryBound.min,this.zBound.min);
            vertexList[vIdx+1].position.set(x2,yStoryBound.max,this.zBound.min);
            vertexList[vIdx+2].position.set(x,yStoryBound.max,this.zBound.min);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            
            x=x2;
        }

            // right square polygons
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+ROOM_BLOCK_WIDTH;
            
            vertexList[vIdx].position.set(this.xBound.max,yStoryBound.min,z);
            vertexList[vIdx+1].position.set(this.xBound.max,yStoryBound.min,z2);
            vertexList[vIdx+2].position.set(this.xBound.max,yStoryBound.max,z2);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;

            vertexList[vIdx].position.set(this.xBound.max,yStoryBound.min,z);
            vertexList[vIdx+1].position.set(this.xBound.max,yStoryBound.max,z2);
            vertexList[vIdx+2].position.set(this.xBound.max,yStoryBound.max,z);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            
            z=z2;
        }
        
            // bottom square polygons
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+ROOM_BLOCK_WIDTH;
            
            vertexList[vIdx].position.set(x,yStoryBound.min,this.zBound.max);
            vertexList[vIdx+1].position.set(x2,yStoryBound.min,this.zBound.max);
            vertexList[vIdx+2].position.set(x2,yStoryBound.max,this.zBound.max);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;

            vertexList[vIdx].position.set(x,yStoryBound.min,this.zBound.max);
            vertexList[vIdx+1].position.set(x2,yStoryBound.max,this.zBound.max);
            vertexList[vIdx+2].position.set(x,yStoryBound.max,this.zBound.max);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            
            x=x2;
        }

            // left square polygons
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+ROOM_BLOCK_WIDTH;
            
            vertexList[vIdx].position.set(this.xBound.min,yStoryBound.min,z);
            vertexList[vIdx+1].position.set(this.xBound.min,yStoryBound.min,z2);
            vertexList[vIdx+2].position.set(this.xBound.min,yStoryBound.max,z2);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;

            vertexList[vIdx].position.set(this.xBound.min,yStoryBound.min,z);
            vertexList[vIdx+1].position.set(this.xBound.min,yStoryBound.max,z2);
            vertexList[vIdx+2].position.set(this.xBound.min,yStoryBound.max,z);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            
            z=z2;
        }

            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        meshUtility.buildVertexListNormals(vertexList,indexes,null,true);
        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        var mesh=new MapMeshObject(bitmap,vertexList,indexes,flag);

        return(mesh);
    };
    
        //
        // overlay lines for room
        //
        
    this.createOverlayLineList=function()
    {
        var n,x,z,x2,z2;
        var lineList=[];
        
             // top lines
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+ROOM_BLOCK_WIDTH;
            lineList.push(new ws2DLine(new ws2DIntPoint(x,this.zBound.min),new ws2DIntPoint(x2,this.zBound.min)));
            x=x2;
        }

            // right lines
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+ROOM_BLOCK_WIDTH;
            lineList.push(new ws2DLine(new ws2DIntPoint(this.xBound.max,z),new ws2DIntPoint(this.xBound.max,z2)));
            z=z2;
        }
        
             // bottom lines
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+ROOM_BLOCK_WIDTH;
            lineList.push(new ws2DLine(new ws2DIntPoint(x,this.zBound.max),new ws2DIntPoint(x2,this.zBound.max)));
            x=x2;
        }

            // right lines
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+ROOM_BLOCK_WIDTH;
            lineList.push(new ws2DLine(new ws2DIntPoint(this.xBound.min,z),new ws2DIntPoint(this.xBound.min,z2)));
            z=z2;
        }

        return(lineList);
    };
    
        //
        // create polygon floors or ceilings
        //
        
    this.createMeshFloorOrCeiling=function(bitmap,yStoryBound,isFloor,flag)
    {
        var x,z,vx,vz,vx2,vz2;
        var v,nSegment;
        
            // create mesh
            
        nSegment=this.xBlockSize*this.zBlockSize;
        
        var vertexList=meshUtility.createMapVertexList(nSegment*6);
        var indexes=new Uint16Array(nSegment*6);
        
        var vIdx=0;
        var iIdx=0;
        
        var y=isFloor?yStoryBound.max:yStoryBound.min;
        var ny=isFloor?-1.0:1.0;
        
        vz=this.zBound.min;
        
        for (z=0;z!==this.zBlockSize;z++) {
            vz2=vz+ROOM_BLOCK_WIDTH;
            
            vx=this.xBound.min;
            
            for (x=0;x!==this.xBlockSize;x++) {
                vx2=vx+ROOM_BLOCK_WIDTH;
                
                v=vertexList[vIdx];
                v.position.set(vx,y,vz);
                v.normal.set(0.0,ny,0.0);
                
                v=vertexList[vIdx+1];
                v.position.set(vx2,y,vz);
                v.normal.set(0.0,ny,0.0);
                
                v=vertexList[vIdx+2];
                v.position.set(vx2,y,vz2);
                v.normal.set(0.0,ny,0.0);
                
                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
                
                v=vertexList[vIdx];
                v.position.set(vx,y,vz);
                v.normal.set(0.0,ny,0.0);
                
                v=vertexList[vIdx+1];
                v.position.set(vx2,y,vz2);
                v.normal.set(0.0,ny,0.0);
                
                v=vertexList[vIdx+2];
                v.position.set(vx,y,vz2);
                v.normal.set(0.0,ny,0.0);

                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
                
                vx=vx2;
            }
            
            vz=vz2;
        }
        
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,vertexList,indexes,flag));
    };

}
