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
        var n;
        var count=this.xBlockSize*this.zBlockSize;
        
        this.blockGrid=new Uint8Array(count);
        this.platformGrid=new Uint8Array(count);
        
        for (n=0;n!==count;n++) {
            this.blockGrid[n]=0;
            this.platformGrid[n]=0;
        }
    };
    
    this.setupGrid();       // supergumba -- IMPORTANT!!!  Move all this after classes!
    
        //
        // flip bits on grid space
        //
        
    this.setBlockGrid=function(x,z)
    {
        this.blockGrid[(z*this.zBlockSize)+x]=1;
    };
    
    this.setPlatformGrid=function(x,z)
    {
        this.platformGrid[(z*this.zBlockSize)+x]=1;
    };
    
        //
        // find points in blocked grid space
        //
    
    this.findRandomEntityPosition=function(genRandom)
    {
        var x,z,bx,bz,idx;
        var findTry=0;
        
        while (findTry<25) {
            x=genRandom.randomInt(0,this.xBlockSize);
            z=genRandom.randomInt(0,this.zBlockSize);
            
                // position in middle of block
                
            bx=Math.floor((this.xBound.min+(ROOM_BLOCK_WIDTH*x))+(ROOM_BLOCK_WIDTH*0.5));
            bz=Math.floor((this.zBound.min+(ROOM_BLOCK_WIDTH*z))+(ROOM_BLOCK_WIDTH*0.5));
            
            idx=(z*this.zBlockSize)+x;
            
                // if the grid spot is blocked, then no
                // entity spawns at all
                
            if (this.blockGrid[idx]===0) {
                
                this.blockGrid[idx]=1;
                
                    // check to see if we can spawn
                    // to a platform first
                    
                if (this.platformGrid[idx]===1) {
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
        var x,z,bx,bz,idx;
        var findTry=0;
        
        while (findTry<25) {
            x=genRandom.randomInt(1,(this.xBlockSize-2));       // force pillars away from edge
            z=genRandom.randomInt(1,(this.zBlockSize-2));
            
                // position in middle of block
                
            bx=Math.floor((this.xBound.min+(ROOM_BLOCK_WIDTH*x))+(ROOM_BLOCK_WIDTH*0.5));
            bz=Math.floor((this.zBound.min+(ROOM_BLOCK_WIDTH*z))+(ROOM_BLOCK_WIDTH*0.5));
            
            idx=(z*this.zBlockSize)+x;
            
                // can only spawn pillars on non-blocked
                // grids where there are no platforms
                
            if ((this.blockGrid[idx]===0) && (this.platformGrid[idx]===0)) {
                
                    // and don't spawn close to anything else as
                    // pillars can block movement
                    
                if ((this.blockGrid[idx-this.zBlockSize]===0) && (this.blockGrid[idx+this.zBlockSize]===0) && (this.blockGrid[idx-1]===0) && (this.blockGrid[idx+1]===0)) {
                    this.blockGrid[idx]=1;
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
