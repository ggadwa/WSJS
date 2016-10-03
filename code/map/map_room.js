"use strict";

//
// map room class
// 
// this is used to track which meshes count as rooms for later placing
// entities or decorations or objectives
//

class MapRoomClass
{
    constructor(xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,liquid,level)
    {
        this.xBlockSize=xBlockSize;
        this.zBlockSize=zBlockSize;
        this.xBound=xBound;
        this.yBound=yBound;
        this.zBound=zBound;
        this.storyCount=storyCount;
        this.liquid=liquid;
        this.level=level;
        
        this.openCeiling=false;
        
        this.blockGrid=null;
        this.platformGrid=null;
        
        this.connectSideHasDoor=[false,false,false,false];      // track which connections had a door
        
        this.yOpenBound=new wsBound(0,0);
        
        this.setupGrid();
        
        Object.seal(this);
    }
    
    setupGrid()
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
        
    }
    
        //
        // flip bits on grid space
        //
        
    setBlockGrid(x,z)
    {
        this.blockGrid[z][x]=1;
    }
    
    setPlatformGrid(x,z)
    {
        this.platformGrid[z][x]=1;
    }
    
        //
        // mask edge grid based on collisions with other
        // rooms or bounds
        //
        
    maskEdgeGridBlockToBounds(xCollideBound,zCollideBound)
    {
        var x,z,x1,x2,z1,z2;
        
            // find the collision bounds within the block
            // width and mark off the edge grid
        
            // collide on our left
            
        if (xCollideBound.max===this.xBound.min) {
            z1=Math.trunc((zCollideBound.min-this.zBound.min)/config.ROOM_BLOCK_WIDTH);
            z2=z1+Math.trunc(zCollideBound.getSize()/config.ROOM_BLOCK_WIDTH);
            if (z1<0) z1=0;
            if (z2>this.zBlockSize) z2=this.zBlockSize;
            
            for (z=z1;z<z2;z++) {
                this.edgeGrid[z][0]=1;
            }
            return;
        }
        
            // collide on our right
            
        if (xCollideBound.min===this.xBound.max) {
            z1=Math.trunc((zCollideBound.min-this.zBound.min)/config.ROOM_BLOCK_WIDTH);
            z2=z1+Math.trunc(zCollideBound.getSize()/config.ROOM_BLOCK_WIDTH);
            if (z1<0) z1=0;
            if (z2>this.zBlockSize) z2=this.zBlockSize;
            
            for (z=z1;z<z2;z++) {
                this.edgeGrid[z][this.xBlockSize-1]=1;
            }
            return;
        }
        
            // collide on our top
            
        if (zCollideBound.max===this.zBound.min) {
            x1=Math.trunc((xCollideBound.min-this.xBound.min)/config.ROOM_BLOCK_WIDTH);
            x2=x1+Math.trunc(xCollideBound.getSize()/config.ROOM_BLOCK_WIDTH);
            if (x1<0) x1=0;
            if (x2>this.xBlockSize) x2=this.xBlockSize;
            
            for (x=x1;x<x2;x++) {
                this.edgeGrid[0][x]=1;
            }
            return;
        }
        
            // collide on our bottom
            
        if (zCollideBound.min===this.zBound.max) {
            x1=Math.trunc((xCollideBound.min-this.xBound.min)/config.ROOM_BLOCK_WIDTH);
            x2=x1+Math.trunc(xCollideBound.getSize()/config.ROOM_BLOCK_WIDTH);
            if (x1<0) x1=0;
            if (x2>this.xBlockSize) x2=this.xBlockSize;
            
            for (x=x1;x<x2;x++) {
                this.edgeGrid[this.zBlockSize-1][x]=1;
            }
            return;
        }
    }
    
    maskEdgeGridBlockToRoom(collideRoom)
    {
        this.maskEdgeGridBlockToBounds(collideRoom.xBound,collideRoom.zBound);
    }
    
    getEdgeGridValue(x,z)
    {
        return(this.edgeGrid[z][x]);
    }
    
        //
        // mark doors
        //
        
    markDoorOnConnectionSide(connectSide,flipSide)
    {
        switch (connectSide) {
            case ROOM_SIDE_LEFT:
                this.connectSideHasDoor[flipSide?ROOM_SIDE_RIGHT:ROOM_SIDE_LEFT]=true;
                break;
            case ROOM_SIDE_RIGHT:
                this.connectSideHasDoor[flipSide?ROOM_SIDE_LEFT:ROOM_SIDE_RIGHT]=true;
                break;
            case ROOM_SIDE_TOP:
                this.connectSideHasDoor[flipSide?ROOM_SIDE_BOTTOM:ROOM_SIDE_TOP]=true;
                break;
            case ROOM_SIDE_BOTTOM:
                this.connectSideHasDoor[flipSide?ROOM_SIDE_TOP:ROOM_SIDE_BOTTOM]=true;
                break;
        }
    }
    
    isDoorOnConnectionSide(connectSide)
    {
        return(this.connectSideHasDoor[connectSide]);
    }
    
        //
        // find points in blocked grid space
        //
    
    findRandomEntityPosition()
    {
        var x,z,startX,startZ,bx,bz;
        
        x=startX=genRandom.randomInt(0,this.xBlockSize);
        z=startZ=genRandom.randomInt(0,this.zBlockSize);
        
        while (true) {
            
                // if the grid spot is blocked, then no
                // entity spawns at all
                
            if (this.blockGrid[z][x]===0) {
                
                this.blockGrid[z][x]=1;
                
                    // check to see if we can spawn
                    // to a platform first
                    
                bx=Math.trunc((this.xBound.min+(config.ROOM_BLOCK_WIDTH*x))+(config.ROOM_BLOCK_WIDTH/2));
                bz=Math.trunc((this.zBound.min+(config.ROOM_BLOCK_WIDTH*z))+(config.ROOM_BLOCK_WIDTH/2));
                    
                if (this.platformGrid[z][x]===1) {
                    this.platformGrid[z][x]=2;
                    return(new wsPoint(bx,(this.yBound.min-config.ROOM_FLOOR_DEPTH),bz));
                }
                else {
                    return(new wsPoint(bx,this.yBound.max,bz));
                }
            }
            
                // move a square over and try again
                
            x++;
            if (x>=this.xBlockSize) {
                x=0;
                z++;
                if (z>=this.zBlockSize) z=0;
            }
            
            if ((x===startX) && (z===startZ)) break;
        }
        
        return(null);
    }
    
    findRandomDecorationLocation(checkPlatform)
    {
        var x,z,startX,startZ,bx,bz,gridSpot;
        
        x=startX=genRandom.randomInt(0,this.xBlockSize);
        z=startZ=genRandom.randomInt(0,this.zBlockSize);
        
        while (true) {
            
                // decorations only spawn on bottom
            
            gridSpot=this.blockGrid[z][x];
            if (checkPlatform) gridSpot+=this.platformGrid[z][x];
            
                // if we are checking platforms, always
                // skip center grid spot because there's a light there
                
            if (checkPlatform) {
                if ((x===Math.trunc(this.xBlockSize/2)) && (z===Math.trunc(this.zBlockSize/2))) gridSpot=1;
            }    
            
            if (gridSpot===0) {
                this.blockGrid[z][x]=1;
                bx=Math.trunc((this.xBound.min+(config.ROOM_BLOCK_WIDTH*x))+(config.ROOM_BLOCK_WIDTH/2));
                bz=Math.trunc((this.zBound.min+(config.ROOM_BLOCK_WIDTH*z))+(config.ROOM_BLOCK_WIDTH/2));
                return(new wsPoint(bx,this.yBound.max,bz));
            }
            
                // move a square over and try again
                
            x++;
            if (x>=this.xBlockSize) {
                x=0;
                z++;
                if (z>=this.zBlockSize) z=0;
            }
            
            if ((x===startX) && (z===startZ)) break;
        }
        
        return(null);
    }
    
    nextDecorationLocation(checkPlatform,curPnt)
    {
        var x,z,bx,bz;
        var gridSpot;
        
        x=Math.trunc((curPnt.x-this.xBound.min)/config.ROOM_BLOCK_WIDTH);
        z=Math.trunc((curPnt.z-this.zBound.min)/config.ROOM_BLOCK_WIDTH);
        
            // check four locations
            
        if (x>0) {
            gridSpot=this.blockGrid[z][x-1];
            if (checkPlatform) gridSpot+=this.platformGrid[z][x-1];
            
            if (gridSpot===0) {
                this.blockGrid[z][x-1]=1;
                bx=Math.trunc((this.xBound.min+(config.ROOM_BLOCK_WIDTH*(x-1)))+(config.ROOM_BLOCK_WIDTH/2));
                bz=Math.trunc((this.zBound.min+(config.ROOM_BLOCK_WIDTH*z))+(config.ROOM_BLOCK_WIDTH/2));
                return(new wsPoint(bx,this.yBound.max,bz));
            }
        }
        
        if (z>0) {
            gridSpot=this.blockGrid[z-1][x];
            if (checkPlatform) gridSpot+=this.platformGrid[z-1][x];
            
            if (gridSpot===0) {
                this.blockGrid[z-1][x]=1;
                bx=Math.trunc((this.xBound.min+(config.ROOM_BLOCK_WIDTH*x))+(config.ROOM_BLOCK_WIDTH/2));
                bz=Math.trunc((this.zBound.min+(config.ROOM_BLOCK_WIDTH*(z-1)))+(config.ROOM_BLOCK_WIDTH/2));
                return(new wsPoint(bx,this.yBound.max,bz));
            }
        }
        
        if (x<(this.xBlockSize-1)) {
            gridSpot=this.blockGrid[z][x+1];
            if (checkPlatform) gridSpot+=this.platformGrid[z][x+1];
            
            if (gridSpot===0) {
                this.blockGrid[z][x+1]=1;
                bx=Math.trunc((this.xBound.min+(config.ROOM_BLOCK_WIDTH*(x+1)))+(config.ROOM_BLOCK_WIDTH/2));
                bz=Math.trunc((this.zBound.min+(config.ROOM_BLOCK_WIDTH*z))+(config.ROOM_BLOCK_WIDTH/2));
                return(new wsPoint(bx,this.yBound.max,bz));
            }
        }
        
        if (z<(this.zBlockSize-1)) {
            gridSpot=this.blockGrid[z+1][x];
            if (checkPlatform) gridSpot+=this.platformGrid[z+1][x];
            
            if (gridSpot===0) {
                this.blockGrid[z+1][x]=1;
                bx=Math.trunc((this.xBound.min+(config.ROOM_BLOCK_WIDTH*x))+(config.ROOM_BLOCK_WIDTH/2));
                bz=Math.trunc((this.zBound.min+(config.ROOM_BLOCK_WIDTH*(z+1)))+(config.ROOM_BLOCK_WIDTH/2));
                return(new wsPoint(bx,this.yBound.max,bz));
            }
        }

        return(null);
    }
    
    checkLocationFreeAndBlock(x,z)
    {
        var bx,bz;
        
        if ((this.blockGrid[z][x]===0) && (this.platformGrid[z][x]===0)) {
            this.blockGrid[z][x]=1;
            bx=Math.trunc((this.xBound.min+(config.ROOM_BLOCK_WIDTH*x))+(config.ROOM_BLOCK_WIDTH/2));
            bz=Math.trunc((this.zBound.min+(config.ROOM_BLOCK_WIDTH*z))+(config.ROOM_BLOCK_WIDTH/2));
            return(new wsPoint(bx,this.yBound.max,bz));
        }
        
        return(null);
    }
    
        //
        // position utilities
        //
        
    posInRoom(pos)
    {
        return((pos.x>=this.xBound.min) && (pos.x<this.xBound.max) && (pos.z>=this.zBound.min) && (pos.z<this.zBound.max));
    }
    
        //
        // create polygon walls and floors
        //
        
    createMeshWalls(bitmap,yWallBound)
    {
        var n,nSegment,x,z,x2,z2;

            // build the vertices.  Each triangle gets it's
            // own vertices so normals and light map UVs work

        nSegment=(this.xBlockSize*2)+(this.zBlockSize*2);

        var vertexList=MeshUtilityClass.createMapVertexList(nSegment*6);
        var indexes=new Uint16Array(nSegment*6);
        
        var vIdx=0;
        var iIdx=0;
        
            // top square polygons
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+config.ROOM_BLOCK_WIDTH;
            
            vertexList[vIdx].position.setFromValues(x,yWallBound.min,this.zBound.min);
            vertexList[vIdx+1].position.setFromValues(x2,yWallBound.min,this.zBound.min);
            vertexList[vIdx+2].position.setFromValues(x2,yWallBound.max,this.zBound.min);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;

            vertexList[vIdx].position.setFromValues(x,yWallBound.min,this.zBound.min);
            vertexList[vIdx+1].position.setFromValues(x2,yWallBound.max,this.zBound.min);
            vertexList[vIdx+2].position.setFromValues(x,yWallBound.max,this.zBound.min);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            
            x=x2;
        }

            // right square polygons
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+config.ROOM_BLOCK_WIDTH;
            
            vertexList[vIdx].position.setFromValues(this.xBound.max,yWallBound.min,z);
            vertexList[vIdx+1].position.setFromValues(this.xBound.max,yWallBound.min,z2);
            vertexList[vIdx+2].position.setFromValues(this.xBound.max,yWallBound.max,z2);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;

            vertexList[vIdx].position.setFromValues(this.xBound.max,yWallBound.min,z);
            vertexList[vIdx+1].position.setFromValues(this.xBound.max,yWallBound.max,z2);
            vertexList[vIdx+2].position.setFromValues(this.xBound.max,yWallBound.max,z);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            
            z=z2;
        }
        
            // bottom square polygons
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+config.ROOM_BLOCK_WIDTH;
            
            vertexList[vIdx].position.setFromValues(x,yWallBound.min,this.zBound.max);
            vertexList[vIdx+1].position.setFromValues(x2,yWallBound.min,this.zBound.max);
            vertexList[vIdx+2].position.setFromValues(x2,yWallBound.max,this.zBound.max);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;

            vertexList[vIdx].position.setFromValues(x,yWallBound.min,this.zBound.max);
            vertexList[vIdx+1].position.setFromValues(x2,yWallBound.max,this.zBound.max);
            vertexList[vIdx+2].position.setFromValues(x,yWallBound.max,this.zBound.max);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            
            x=x2;
        }

            // left square polygons
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+config.ROOM_BLOCK_WIDTH;
            
            vertexList[vIdx].position.setFromValues(this.xBound.min,yWallBound.min,z);
            vertexList[vIdx+1].position.setFromValues(this.xBound.min,yWallBound.min,z2);
            vertexList[vIdx+2].position.setFromValues(this.xBound.min,yWallBound.max,z2);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;

            vertexList[vIdx].position.setFromValues(this.xBound.min,yWallBound.min,z);
            vertexList[vIdx+1].position.setFromValues(this.xBound.min,yWallBound.max,z2);
            vertexList[vIdx+2].position.setFromValues(this.xBound.min,yWallBound.max,z);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            
            z=z2;
        }

            // finish the mesh

        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,null,true);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        return(new MapMeshClass(bitmap,vertexList,indexes,MESH_FLAG_ROOM_WALL));
    }
    
        //
        // overlay lines for room
        //
        
    createOverlayLineList()
    {
        var n,x,z,x2,z2;
        var lineList=[];
        
             // top lines
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+config.ROOM_BLOCK_WIDTH;
            lineList.push(new ws2DLine(new ws2DIntPoint(x,this.zBound.min),new ws2DIntPoint(x2,this.zBound.min)));
            x=x2;
        }

            // right lines
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+config.ROOM_BLOCK_WIDTH;
            lineList.push(new ws2DLine(new ws2DIntPoint(this.xBound.max,z),new ws2DIntPoint(this.xBound.max,z2)));
            z=z2;
        }
        
             // bottom lines
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+config.ROOM_BLOCK_WIDTH;
            lineList.push(new ws2DLine(new ws2DIntPoint(x,this.zBound.max),new ws2DIntPoint(x2,this.zBound.max)));
            x=x2;
        }

            // right lines
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+config.ROOM_BLOCK_WIDTH;
            lineList.push(new ws2DLine(new ws2DIntPoint(this.xBound.min,z),new ws2DIntPoint(this.xBound.min,z2)));
            z=z2;
        }

        return(lineList);
    }
    
        //
        // create polygon floors or ceilings
        //
        
    createMeshFloor(bitmap)
    {
        var x,z,vx,vz,vx2,vz2;
        var v,nSegment;
        
        var y=this.yBound.max;
        
            // create mesh
            
        nSegment=this.xBlockSize*this.zBlockSize;
        
        var vertexList=MeshUtilityClass.createMapVertexList(nSegment*6);
        var indexes=new Uint16Array(nSegment*6);
        
        var vIdx=0;
        var iIdx=0;
        
        vz=this.zBound.min;
        
        for (z=0;z!==this.zBlockSize;z++) {
            vz2=vz+config.ROOM_BLOCK_WIDTH;
            
            vx=this.xBound.min;
            
            for (x=0;x!==this.xBlockSize;x++) {
                vx2=vx+config.ROOM_BLOCK_WIDTH;
                
                v=vertexList[vIdx];
                v.position.setFromValues(vx,y,vz);
                v.normal.setFromValues(0.0,-1.0,0.0);
                
                v=vertexList[vIdx+1];
                v.position.setFromValues(vx2,y,vz);
                v.normal.setFromValues(0.0,-1.0,0.0);
                
                v=vertexList[vIdx+2];
                v.position.setFromValues(vx2,y,vz2);
                v.normal.setFromValues(0.0,-1.0,0.0);
                
                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
                
                v=vertexList[vIdx];
                v.position.setFromValues(vx,y,vz);
                v.normal.setFromValues(0.0,-1.0,0.0);
                
                v=vertexList[vIdx+1];
                v.position.setFromValues(vx2,y,vz2);
                v.normal.setFromValues(0.0,-1.0,0.0);
                
                v=vertexList[vIdx+2];
                v.position.setFromValues(vx,y,vz2);
                v.normal.setFromValues(0.0,-1.0,0.0);

                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
                
                vx=vx2;
            }
            
            vz=vz2;
        }
        
            // finish the mesh

        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,MESH_FLAG_ROOM_FLOOR));
    }
    
    createMeshCeiling(bitmap)
    {
        var x,z,vx,vz,vx2,vz2;
        var v,nSegment,doBlock,yOpenBound;
        
            // create mesh
        
        if (!this.openCeiling) {
            nSegment=this.xBlockSize*this.zBlockSize;
        }
        else {
            nSegment=(this.xBlockSize*2)+((this.zBlockSize-2)*2);
        }
        
        var vertexList=MeshUtilityClass.createMapVertexList(nSegment*6);
        var indexes=new Uint16Array(nSegment*6);
        
        var vIdx=0;
        var iIdx=0;
        
        var y=this.yBound.min;
        
        vz=this.zBound.min;
        
        for (z=0;z!==this.zBlockSize;z++) {
            vz2=vz+config.ROOM_BLOCK_WIDTH;
            
            vx=this.xBound.min;
            
            for (x=0;x!==this.xBlockSize;x++) {
                vx2=vx+config.ROOM_BLOCK_WIDTH;
                
                doBlock=true;
                if (this.openCeiling) {
                    doBlock=((z===0) || (z===(this.zBlockSize-1)) || (x===0) || (x===(this.xBlockSize-1)));
                }
                
                if (doBlock) {
                    v=vertexList[vIdx];
                    v.position.setFromValues(vx,y,vz);
                    v.normal.setFromValues(0.0,1.0,0.0);

                    v=vertexList[vIdx+1];
                    v.position.setFromValues(vx2,y,vz);
                    v.normal.setFromValues(0.0,1.0,0.0);

                    v=vertexList[vIdx+2];
                    v.position.setFromValues(vx2,y,vz2);
                    v.normal.setFromValues(0.0,1.0,0.0);

                    indexes[iIdx++]=vIdx++;
                    indexes[iIdx++]=vIdx++;
                    indexes[iIdx++]=vIdx++;

                    v=vertexList[vIdx];
                    v.position.setFromValues(vx,y,vz);
                    v.normal.setFromValues(0.0,1.0,0.0);

                    v=vertexList[vIdx+1];
                    v.position.setFromValues(vx2,y,vz2);
                    v.normal.setFromValues(0.0,1.0,0.0);

                    v=vertexList[vIdx+2];
                    v.position.setFromValues(vx,y,vz2);
                    v.normal.setFromValues(0.0,1.0,0.0);

                    indexes[iIdx++]=vIdx++;
                    indexes[iIdx++]=vIdx++;
                    indexes[iIdx++]=vIdx++;
                }
                
                vx=vx2;
            }
            
            vz=vz2;
        }
        
            // finish the mesh

        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,MESH_FLAG_ROOM_CEILING));
        
            // if open ceiling, create the walls
        
        if (this.openCeiling) {
            this.xBlockSize-=2;
            this.xBound.min+=config.ROOM_BLOCK_WIDTH;
            this.xBound.max-=config.ROOM_BLOCK_WIDTH;
            
            this.zBlockSize-=2;
            this.zBound.min+=config.ROOM_BLOCK_WIDTH;
            this.zBound.max-=config.ROOM_BLOCK_WIDTH;
            
            this.yOpenBound.setFromValues((y-config.ROOM_BLOCK_WIDTH),y);
            
            map.addMesh(this.createMeshWalls(bitmap,this.yOpenBound));

            this.xBlockSize+=2;
            this.xBound.min-=config.ROOM_BLOCK_WIDTH;
            this.xBound.max+=config.ROOM_BLOCK_WIDTH;
            
            this.zBlockSize+=2;
            this.zBound.min-=config.ROOM_BLOCK_WIDTH;
            this.zBound.max+=config.ROOM_BLOCK_WIDTH;
        }
    }
    
        //
        // liquids
        //
        
    getLiquidY()
    {
        return(this.yBound.max-config.ROOM_FLOOR_HEIGHT);
    }
    
    addTintFromLiquidColor(col)
    {
        col.addFromValues(0.0,0.0,1.0);         // supergumba -- hard coded
    }

}
