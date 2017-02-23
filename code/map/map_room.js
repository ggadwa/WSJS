/* global config, genRandom, MeshUtilityClass, map */

"use strict";

//
// special class that contains some constants
// we can change this when we can get
// static properties on classes
//

class MapRoomConstantsClass
{
    constructor()
    {
        this.ROOM_SIDE_LEFT=0;
        this.ROOM_SIDE_TOP=1;
        this.ROOM_SIDE_RIGHT=2;
        this.ROOM_SIDE_BOTTOM=3;
        
        this.LEVEL_NORMAL=0;
        this.LEVEL_LOWER=1;
        this.LEVEL_HIGHER=2;
        this.LEVEL_COUNT=3;
        
        this.ROOM_EXTENSION_DIRECTION_LEFT_RIGHT=0;
        this.ROOM_EXTENSION_DIRECTION_TOP_BOTTOM=1;
        
        this.ROOM_PATH_TYPE_NORMAL=0;
        this.ROOM_PATH_TYPE_START=1;
        this.ROOM_PATH_TYPE_GOAL=2;

        this.ROOM_DECORATION_NONE=-1;
        this.ROOM_DECORATION_PILLARS=0;
        this.ROOM_DECORATION_STORAGE=1;
        this.ROOM_DECORATION_COMPUTER=2;
        this.ROOM_DECORATION_PIPE=3;
        this.ROOM_DECORATION_CUBICAL=4;
        this.ROOM_DECORATION_LAB=5;

        this.ROOM_DECORATION_PATH_LIST=[this.ROOM_DECORATION_PILLARS,this.ROOM_DECORATION_STORAGE,this.ROOM_DECORATION_COMPUTER,this.ROOM_DECORATION_PIPE,this.ROOM_DECORATION_CUBICAL,this.ROOM_DECORATION_LAB];
        this.ROOM_DECORATION_NORMAL_LIST=[this.ROOM_DECORATION_PILLARS,this.ROOM_DECORATION_STORAGE,this.ROOM_DECORATION_COMPUTER,this.ROOM_DECORATION_LAB,this.ROOM_DECORATION_PIPE];
        this.ROOM_DECORATION_LOWER_LIST=[this.ROOM_DECORATION_NONE,this.ROOM_DECORATION_PILLARS,this.ROOM_DECORATION_COMPUTER,this.ROOM_DECORATION_LAB];
        this.ROOM_DECORATION_HIGHER_LIST=[this.ROOM_DECORATION_NONE,this.ROOM_DECORATION_PILLARS,this.ROOM_DECORATION_STORAGE,this.ROOM_DECORATION_COMPUTER,this.ROOM_DECORATION_LAB];
        this.ROOM_DECORATION_LIQUID_LIST=[this.ROOM_DECORATION_NONE,this.ROOM_DECORATION_PILLARS,this.ROOM_DECORATION_PIPE];
    }
}

let mapRoomConstants=new MapRoomConstantsClass();

//
// utility class for determining distance and facing
// for certain items in room
//

class MapRoomFaceClass
{
    constructor(direction,len)
    {
        this.direction=direction;
        this.len=len;
        
        Object.seal(this);
    }
}

//
// map room class
// 
// this is used to track which meshes count as rooms for later placing
// entities or decorations or objectives
//

class MapRoomClass
{
    constructor(pathType,xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,extensionDirection,decorationType,mainPath,mainPathSide,mainPathConnectedRoom,level,liquid)
    {
        this.pathType=pathType;
        this.xBlockSize=xBlockSize;
        this.zBlockSize=zBlockSize;
        this.xBound=xBound;
        this.yBound=yBound;
        this.zBound=zBound;
        this.storyCount=storyCount;
        this.extensionDirection=extensionDirection;
        this.decorationType=decorationType;
        this.mainPath=mainPath;
        this.mainPathSide=mainPathSide;
        this.mainPathConnectedRoom=mainPathConnectedRoom;
        this.level=level;
        this.liquid=liquid;
        
        this.mainLight=null;                    // used to track main light for room
        
        this.blockGrid=null;
        this.edgeGrid=null;
        
        this.connectSideHasDoor=[false,false,false,false];      // track which connections had a door
        this.legalWindowSide=[true,true,true,true];             // track where windows can be
        
        this.yOpenBound=new wsBound(0,0);
        
        this.setupGrid();
        
        Object.seal(this);
    }
    
    setupGrid()
    {
        let n,x,z;
        
            // make two dimensional arrays of
            // xBlockSize * zBlockSize for each
            // story and one for determining room edges
        
        this.blockGrid=[];
        
        for (n=0;n!==this.storyCount;n++) {
            this.blockGrid.push(new wsGrid(this.xBlockSize,this.zBlockSize));
        }
        
        this.edgeGrid=new wsGrid(this.xBlockSize,this.zBlockSize);
        
            // the block grid has it's bottom floor outer
            // ring blocked off because we never want
            // to build pieces there
            
        for (x=0;x!==this.xBlockSize;x++) {
            this.blockGrid[0].setCell(x,0,1);
            this.blockGrid[0].setCell(x,(this.zBlockSize-1),1);
        }
            
        for (z=0;z!==this.zBlockSize;z++) {
            this.blockGrid[0].setCell(0,z,1);
            this.blockGrid[0].setCell((this.xBlockSize-1),z,1);
        }
        
            // and all stories above start as blocked
            // off because there's no platforms
            
        for (n=1;n!==this.storyCount;n++) {
            this.blockGrid[n].setCellAll(1);
        }
    }
    
        //
        // flip bits on grid space
        //
        
    setBlockGrid(story,x,z)
    {
        this.blockGrid[story].setCell(x,z,1);
    }
    
    checkBlockGrid(story,x,z)
    {
        return(this.blockGrid[story].getCell(x,z)===1);
    }
    
    clearBlockGrid(story,x,z)
    {
        this.blockGrid[story].setCell(x,z,0);
    }
    
    copyGrid(story)
    {
        return(this.blockGrid[story].copy());
    }
    
        //
        // mask edge grid based on collisions with other
        // rooms or bounds
        //
        
    maskEdgeGridBlockToBounds(xCollideBound,zCollideBound)
    {
        let x,z,x1,x2,z1,z2;
        
            // find the collision bounds within the block
            // width and mark off the edge grid
        
            // collide on our left
            
        if (xCollideBound.max===this.xBound.min) {
            z1=Math.trunc((zCollideBound.min-this.zBound.min)/map.ROOM_BLOCK_WIDTH);
            z2=z1+Math.trunc(zCollideBound.getSize()/map.ROOM_BLOCK_WIDTH);
            if (z1<0) z1=0;
            if (z2>this.zBlockSize) z2=this.zBlockSize;
            
            for (z=z1;z<z2;z++) {
                this.edgeGrid.setCell(0,z,1);
            }
            return;
        }
        
            // collide on our right
            
        if (xCollideBound.min===this.xBound.max) {
            z1=Math.trunc((zCollideBound.min-this.zBound.min)/map.ROOM_BLOCK_WIDTH);
            z2=z1+Math.trunc(zCollideBound.getSize()/map.ROOM_BLOCK_WIDTH);
            if (z1<0) z1=0;
            if (z2>this.zBlockSize) z2=this.zBlockSize;
            
            for (z=z1;z<z2;z++) {
                this.edgeGrid.setCell((this.xBlockSize-1),z,1);
            }
            return;
        }
        
            // collide on our top
            
        if (zCollideBound.max===this.zBound.min) {
            x1=Math.trunc((xCollideBound.min-this.xBound.min)/map.ROOM_BLOCK_WIDTH);
            x2=x1+Math.trunc(xCollideBound.getSize()/map.ROOM_BLOCK_WIDTH);
            if (x1<0) x1=0;
            if (x2>this.xBlockSize) x2=this.xBlockSize;
            
            for (x=x1;x<x2;x++) {
                this.edgeGrid.setCell(x,0,1);
            }
            return;
        }
        
            // collide on our bottom
            
        if (zCollideBound.min===this.zBound.max) {
            x1=Math.trunc((xCollideBound.min-this.xBound.min)/map.ROOM_BLOCK_WIDTH);
            x2=x1+Math.trunc(xCollideBound.getSize()/map.ROOM_BLOCK_WIDTH);
            if (x1<0) x1=0;
            if (x2>this.xBlockSize) x2=this.xBlockSize;
            
            for (x=x1;x<x2;x++) {
                this.edgeGrid.setCell(x,(this.zBlockSize-1),1);
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
        return(this.edgeGrid.getCell(x,z));
    }
    
        //
        // mark doors
        //
        
    markDoorOnConnectionSide(connectSide,flipSide)
    {
        switch (connectSide) {
            case mapRoomConstants.ROOM_SIDE_LEFT:
                this.connectSideHasDoor[flipSide?mapRoomConstants.ROOM_SIDE_RIGHT:mapRoomConstants.ROOM_SIDE_LEFT]=true;
                break;
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                this.connectSideHasDoor[flipSide?mapRoomConstants.ROOM_SIDE_LEFT:mapRoomConstants.ROOM_SIDE_RIGHT]=true;
                break;
            case mapRoomConstants.ROOM_SIDE_TOP:
                this.connectSideHasDoor[flipSide?mapRoomConstants.ROOM_SIDE_BOTTOM:mapRoomConstants.ROOM_SIDE_TOP]=true;
                break;
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                this.connectSideHasDoor[flipSide?mapRoomConstants.ROOM_SIDE_TOP:mapRoomConstants.ROOM_SIDE_BOTTOM]=true;
                break;
        }
    }
    
    isDoorOnConnectionSide(connectSide)
    {
        return(this.connectSideHasDoor[connectSide]);
    }
    
        //
        // window spots
        //
        
    markExtensionLegalWindowSide(connectSide,connectedPathRoom)
    {
        switch (connectSide) {
            
            case mapRoomConstants.ROOM_SIDE_LEFT:
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_LEFT]=true;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_TOP]=true;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_RIGHT]=false;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_BOTTOM]=true;
                
                connectedPathRoom.legalWindowSide[mapRoomConstants.ROOM_SIDE_LEFT]=false;
                return;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_LEFT]=true;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_TOP]=true;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_RIGHT]=true;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_BOTTOM]=false;
                
                connectedPathRoom.legalWindowSide[mapRoomConstants.ROOM_SIDE_TOP]=false;
                return;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_LEFT]=false;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_RIGHT]=true;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_TOP]=true;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_BOTTOM]=true;
                
                connectedPathRoom.legalWindowSide[mapRoomConstants.ROOM_SIDE_RIGHT]=false;
                return;
            
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_LEFT]=true;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_TOP]=false;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_RIGHT]=true;
                this.legalWindowSide[mapRoomConstants.ROOM_SIDE_BOTTOM]=true;
                
                connectedPathRoom.legalWindowSide[mapRoomConstants.ROOM_SIDE_BOTTOM]=false;
                return;
        }
    }
    
        //
        // find points in blocked grid space
        //
        
    findAndBlockSpawnPosition(groundFloorOnly)
    {
        let n,x,z,startX,startZ,bx,bz;
        
        x=startX=genRandom.randomInt(0,this.xBlockSize);
        z=startZ=genRandom.randomInt(0,this.zBlockSize);
        
        while (true) {
            
                // check all stories of the room
                
            for (n=0;n!==this.storyCount;n++) {
            
                if (this.blockGrid[n].getCell(x,z)===0) {
                    this.blockGrid[n].setCell(x,z,1);
                    bx=Math.trunc((this.xBound.min+(map.ROOM_BLOCK_WIDTH*x))+(map.ROOM_BLOCK_WIDTH/2));
                    bz=Math.trunc((this.zBound.min+(map.ROOM_BLOCK_WIDTH*z))+(map.ROOM_BLOCK_WIDTH/2));
                    return(new wsPoint(bx,(this.yBound.max-((map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)*n)),bz));
                }
                
                if (groundFloorOnly) break;
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
        
    checkGroundFloorSpawnAndBlock(x,z)
    {
        let bx,bz;
        
        if (this.blockGrid[0].getCell(x,z)===0) {
            this.blockGrid[0].setCell(x,z,1);
            bx=Math.trunc((this.xBound.min+(map.ROOM_BLOCK_WIDTH*x))+(map.ROOM_BLOCK_WIDTH/2));
            bz=Math.trunc((this.zBound.min+(map.ROOM_BLOCK_WIDTH*z))+(map.ROOM_BLOCK_WIDTH/2));
            return(new wsPoint(bx,this.yBound.max,bz));
        }

        return(null);
    }
    
    getGroundFloorSpawnToFirstPlatformOrTopBound(x,z)
    {
        let n,y;
        
        y=this.yBound.max-map.ROOM_FLOOR_HEIGHT;
        
        for (n=1;n<this.storyCount;n++) {
            if (this.blockGrid[n].getCell(x,z)===0) break;
            y-=(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH);
        }
        
        return(new wsBound(y,this.yBound.max));
    }
    
    getGroundFloorSpawnToFirstPlatformOrTopBoundByCoordinate(pos)
    {
        let x=Math.trunc(((pos.x-Math.trunc(map.ROOM_BLOCK_WIDTH/2))-this.xBound.min)/map.ROOM_BLOCK_WIDTH);
        let z=Math.trunc(((pos.z-Math.trunc(map.ROOM_BLOCK_WIDTH/2))-this.zBound.min)/map.ROOM_BLOCK_WIDTH);
        return(this.getGroundFloorSpawnToFirstPlatformOrTopBound(x,z));
    }
    
        //
        // position utilities
        //
        
    posInRoom(pos)
    {
        return((pos.x>=this.xBound.min) && (pos.x<this.xBound.max) && (pos.z>=this.zBound.min) && (pos.z<this.zBound.max));
    }
    
        //
        // find direction towards nearest wall
        //
    
    getDirectionTowardsNearestWall(pos)
    {
        let distLft=pos.x-this.xBound.min;
        let distRgt=this.xBound.max-pos.x;
        let distTop=pos.z-this.zBound.min;
        let distBot=this.zBound.max-pos.z;
        
        if ((distLft<distRgt) && (distLft<distTop) && (distLft<distBot)) {
            return(new MapRoomFaceClass(mapRoomConstants.ROOM_SIDE_LEFT,distLft));
        }
        else {
            if ((distRgt<distTop) && (distRgt<distBot)) {
                return(new MapRoomFaceClass(mapRoomConstants.ROOM_SIDE_RIGHT,distRgt));
            }
            else {
                if (distTop<distBot) {
                    return(new MapRoomFaceClass(mapRoomConstants.ROOM_SIDE_TOP,distTop));
                }
                else {
                    return(new MapRoomFaceClass(mapRoomConstants.ROOM_SIDE_BOTTOM,distBot));
                }
            }
        }
        
        return(null);
    }
    
    getDirectionTowardsCenter(pos)
    {
        let cx=this.xBound.getMidPoint();
        let distLft=Math.abs(pos.x-cx);
        let distRgt=Math.abs(pos.x-cx);
        
        let cz=this.zBound.getMidPoint();
        let distTop=Math.abs(pos.z-cz);
        let distBot=Math.abs(pos.z-cz);
        
        if ((distLft<distRgt) && (distLft<distTop) && (distLft<distBot)) {
            return(new MapRoomFaceClass(mapRoomConstants.ROOM_SIDE_RIGHT,distLft));
        }
        else {
            if ((distRgt<distTop) && (distRgt<distBot)) {
                return(new MapRoomFaceClass(mapRoomConstants.ROOM_SIDE_LEFT,distRgt));
            }
            else {
                if (distTop<distBot) {
                    return(new MapRoomFaceClass(mapRoomConstants.ROOM_SIDE_BOTTOM,distTop));
                }
                else {
                    return(new MapRoomFaceClass(mapRoomConstants.ROOM_SIDE_TOP,distBot));
                }
            }
        }
        
        return(null);
    }
    
        //
        // find if a side is a side that is connected to another room
        //
        
    isSideOpenToOtherRoom(connectSide)
    {
        let n,room;
        let nRoom=map.rooms.length;

        for (n=0;n!==nRoom;n++) {
            room=map.rooms[n];
            
            switch (connectSide) {
                case mapRoomConstants.ROOM_SIDE_LEFT:
                    if (room.xBound.max===this.xBound.min) return(true);
                    break;
                case mapRoomConstants.ROOM_SIDE_TOP:
                    if (room.zBound.max===this.zBound.min) return(true);
                    break;
                case mapRoomConstants.ROOM_SIDE_RIGHT:
                    if (room.xBound.min===this.xBound.max) return(true);
                    break;
                case mapRoomConstants.ROOM_SIDE_BOTTOM:
                    if (room.zBound.min===this.zBound.max) return(true);
                    break;
            }
        }
        
        return(false);
    }
    
        //
        // build array of random cubes for decorations
        //
        
    createRandomCubes()
    {
        let x,z,x2,z2,hit;
        let wid,high,startWid,startHigh;
        let xBlockStart,xBlockEnd,zBlockStart,zBlockEnd;
        let xSize=this.xBlockSize-2;
        let zSize=this.zBlockSize-2;
        let cubes=[];

            // create a grid to
            // build cubicals in
            // typed arrays initialize to 0

        let grid=new Uint16Array(xSize*zSize);

            // start making the cubicals

        while (true) {

                // find first open spot

            x=z=0;
            hit=false;

            while (true) {
                if (grid[(z*xSize)+x]===0) {
                    hit=true;
                    break;
                }
                x++;
                if (x===xSize) {
                    x=0;
                    z++;
                    if (z===zSize) break;
                }
            }

                // no more open spots!

            if (!hit) break;

                // random size

            startWid=genRandom.randomIndex(xSize-x);
            startHigh=genRandom.randomIndex(zSize-z);

                // determine what can fit

            wid=1;

            while (wid<startWid) {
                if (grid[(z*xSize)+(x+wid)]!==0) break;
                wid++;
            }

            high=1;

            while (high<startHigh) {
                if (grid[((z+high)*xSize)+x]!==0) break;
                high++;
            }

                // create the cubical which is always
                // 1 over because we are leaving a gutter
                // for the doors

            cubes.push(new wsRect((x+1),(z+1),((x+1)+wid),((z+1)+high)));
            
                // always block off +1 so there's a corridor
                // in between
            
            xBlockStart=(x===0)?0:(x-1);
            
            xBlockEnd=(x+1)+wid;
            if (xBlockEnd>xSize) xBlockEnd=xSize;
            
            zBlockStart=(z===0)?0:(z-1);
            
            zBlockEnd=(z+1)+high;
            if (zBlockEnd>zSize) zBlockEnd=zSize;
                
            for (z2=zBlockStart;z2<zBlockEnd;z2++) {
                for (x2=xBlockStart;x2<xBlockEnd;x2++) {
                    grid[(z2*xSize)+x2]=1;
                }
            }
        }

        return(cubes);
    }
    
        //
        // create polygon walls and floors
        //
        
    createMeshWalls(bitmap,yWallBound)
    {
        let n,nSegment,x,z,x2,z2;
        let vertexList,indexes,vIdx,iIdx;

            // build the vertices.  Each triangle gets it's
            // own vertices so normals and light map UVs work

        nSegment=(this.xBlockSize*2)+(this.zBlockSize*2);

        vertexList=MeshUtilityClass.createMapVertexList(nSegment*6);
        indexes=new Uint16Array(nSegment*6);
        
        vIdx=0;
        iIdx=0;
        
            // top square polygons
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+map.ROOM_BLOCK_WIDTH;
            
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
            z2=z+map.ROOM_BLOCK_WIDTH;
            
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
            x2=x+map.ROOM_BLOCK_WIDTH;
            
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
            z2=z+map.ROOM_BLOCK_WIDTH;
            
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
        return(new MapMeshClass(bitmap,vertexList,indexes,map.MESH_FLAG_ROOM_WALL));
    }
    
        //
        // overlay lines for room
        //
        
    createOverlayLineList()
    {
        let n,x,z,x2,z2;
        let lineList=[];
        
             // top lines
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+map.ROOM_BLOCK_WIDTH;
            lineList.push(new ws2DLine(new ws2DIntPoint(x,this.zBound.min),new ws2DIntPoint(x2,this.zBound.min)));
            x=x2;
        }

            // right lines
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+map.ROOM_BLOCK_WIDTH;
            lineList.push(new ws2DLine(new ws2DIntPoint(this.xBound.max,z),new ws2DIntPoint(this.xBound.max,z2)));
            z=z2;
        }
        
             // bottom lines
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+map.ROOM_BLOCK_WIDTH;
            lineList.push(new ws2DLine(new ws2DIntPoint(x,this.zBound.max),new ws2DIntPoint(x2,this.zBound.max)));
            x=x2;
        }

            // right lines
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+map.ROOM_BLOCK_WIDTH;
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
        let x,z,vx,vz,vx2,vz2;
        let v,nSegment;
        let vertexList,indexes,vIdx,iIdx;
        let y=this.yBound.max;
        
            // create mesh
            
        nSegment=this.xBlockSize*this.zBlockSize;
        
        vertexList=MeshUtilityClass.createMapVertexList(nSegment*6);
        indexes=new Uint16Array(nSegment*6);
        
        vIdx=0;
        iIdx=0;
        
        vz=this.zBound.min;
        
        for (z=0;z!==this.zBlockSize;z++) {
            vz2=vz+map.ROOM_BLOCK_WIDTH;
            
            vx=this.xBound.min;
            
            for (x=0;x!==this.xBlockSize;x++) {
                vx2=vx+map.ROOM_BLOCK_WIDTH;
                
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
        map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,map.MESH_FLAG_ROOM_FLOOR));
    }
    
    createMeshCeiling(bitmap)
    {
        let x,y,z,vx,vz,vx2,vz2;
        let v,nSegment;
        let vertexList,indexes,vIdx,iIdx;
        
            // create mesh
        
        nSegment=this.xBlockSize*this.zBlockSize;
        
        vertexList=MeshUtilityClass.createMapVertexList(nSegment*6);
        indexes=new Uint16Array(nSegment*6);
        
        vIdx=0;
        iIdx=0;
        
        y=this.yBound.min;
        
        vz=this.zBound.min;
        
        for (z=0;z!==this.zBlockSize;z++) {
            vz2=vz+map.ROOM_BLOCK_WIDTH;
            
            vx=this.xBound.min;
            
            for (x=0;x!==this.xBlockSize;x++) {
                vx2=vx+map.ROOM_BLOCK_WIDTH;
                
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
                
                vx=vx2;
            }
            
            vz=vz2;
        }
        
            // finish the mesh

        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,map.MESH_FLAG_ROOM_CEILING));
    }
    
        //
        // liquids
        //
        
    getLiquidY()
    {
        return(this.yBound.max-map.ROOM_FLOOR_HEIGHT);
    }
    
    addTintFromLiquidColor(col)
    {
        col.addFromValues(0.0,0.0,1.0);         // supergumba -- hard coded
    }

}
