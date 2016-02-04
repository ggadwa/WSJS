"use strict";

//
// map room class
// 
// this is used to track which meshes count as rooms for later placing
// entities or decorations or objectives
//

function MapRoomObject(piece,xBound,yBound,zBound,hasStories,level)
{
    this.piece=piece;
    this.xBound=xBound;
    this.yBound=yBound;
    this.zBound=zBound;
    this.hasStories=hasStories;
    this.level=level;
    
    this.xBlockSize=10;
    this.zBlockSize=10;
    
    this.lowerGrid=new Uint8Array(ROOM_MAX_DIVISIONS*ROOM_MAX_DIVISIONS);
    this.upperGrid=new Uint8Array(ROOM_MAX_DIVISIONS*ROOM_MAX_DIVISIONS);
    
    this.setupGrid=function()
    {
        var n;
        var count=ROOM_MAX_DIVISIONS*ROOM_MAX_DIVISIONS;
        
            // lower grid starts all unblocked
            // and upper grid starts blocked until we add platforms
        
        for (n=0;n!==count;n++) {
            this.lowerGrid[n]=0;
            this.upperGrid[n]=1;
        }
    };
    
    this.setupGrid();       // supergumba -- IMPORTANT!!!  Move all this after classes!
    
        //
        // block or unblock off a grid space
        //
        
    this.blockLowerGrid=function(x,z)
    {
        this.lowerGrid[(z*ROOM_MAX_DIVISIONS)+x]=1;
    };
    
    this.blockUpperGrid=function(x,z)
    {
        this.upperGrid[(z*ROOM_MAX_DIVISIONS)+x]=1;
    };
    
    this.unblockUpperGrid=function(x,z)
    {
        this.upperGrid[(z*ROOM_MAX_DIVISIONS)+x]=0;
    };
    
        //
        // find points in blocked grid space
        //
    
    this.findRandomFreeLocation=function(genRandom)
    {
        var x,z,sx,sz,bx,bz,idx;
        var findTry=0;
        
        while (findTry<25) {
            x=genRandom.randomInt(0,ROOM_MAX_DIVISIONS);
            z=genRandom.randomInt(0,ROOM_MAX_DIVISIONS);
            
                // see if lower, than upper is OK
                
            sx=this.xBound.getSize()/ROOM_MAX_DIVISIONS;
            sz=this.zBound.getSize()/ROOM_MAX_DIVISIONS;
                
            bx=Math.floor((this.xBound.min+(sx*x))+(sx*0.5));
            bz=Math.floor((this.zBound.min+(sz*z))+(sz*0.5));
            
            idx=(z*ROOM_MAX_DIVISIONS)+x;
                
            if (this.lowerGrid[idx]===0) {
                this.lowerGrid[idx]=1;
                return(new wsPoint(bx,this.yBound.max,bz));
            }
            else {
                if (ROOM_PLATFORMS) {
                    if (this.upperGrid[idx]===0) {
                        this.upperGrid[idx]=1;
                        return(new wsPoint(bx,(this.yBound.min-ROOM_FLOOR_DEPTH),bz));
                    }
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

}
