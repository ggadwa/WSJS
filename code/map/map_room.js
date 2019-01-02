import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import Point2DIntClass from '../../code/utility/2D_int_point.js';
import Line2DClass from '../../code/utility/2D_line.js';
import BoundClass from '../../code/utility/bound.js';
import RectClass from '../../code/utility/rect.js';
import GridClass from '../../code/utility/grid.js';
import MeshClass from '../../code/mesh/mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';
import genRandom from '../../generate/utility/random.js';

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

export default class MapRoomClass
{
    constructor(view,map,pathType,xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,extensionDirection,mainPath,mainPathSide,mainPathConnectedRoom,level,liquid,outdoor)
    {
        this.view=view;
        this.map=map;
        
        this.pathType=pathType;
        this.xBlockSize=xBlockSize;
        this.zBlockSize=zBlockSize;
        this.xBound=xBound;
        this.yBound=yBound;
        this.zBound=zBound;
        this.storyCount=storyCount;
        this.extensionDirection=extensionDirection;
        this.mainPath=mainPath;
        this.mainPathSide=mainPathSide;
        this.mainPathConnectedRoom=mainPathConnectedRoom;
        this.level=level;
        this.liquid=liquid;
        this.outdoor=outdoor;
        
        this.mainLight=null;                    // used to track main light for room
        
        this.blockGrid=null;
        this.edgeGrid=null;
        
        this.connectSideHasDoor=[false,false,false,false];      // track which connections had a door
        this.connectSideHasStair=[false,false,false,false];     // track which connections had a (possible) stair
        this.legalWindowSide=[true,true,true,true];             // track where windows can be
        
        this.yOpenBound=new BoundClass(0,0);
        
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
            this.blockGrid.push(new GridClass(this.xBlockSize,this.zBlockSize));
        }
        
        this.edgeGrid=new GridClass(this.xBlockSize,this.zBlockSize);
        
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
            z1=Math.trunc((zCollideBound.min-this.zBound.min)/constants.ROOM_BLOCK_WIDTH);
            z2=z1+Math.trunc(zCollideBound.getSize()/constants.ROOM_BLOCK_WIDTH);
            if (z1<0) z1=0;
            if (z2>this.zBlockSize) z2=this.zBlockSize;
            
            for (z=z1;z<z2;z++) {
                this.edgeGrid.setCell(0,z,1);
            }
            return;
        }
        
            // collide on our right
            
        if (xCollideBound.min===this.xBound.max) {
            z1=Math.trunc((zCollideBound.min-this.zBound.min)/constants.ROOM_BLOCK_WIDTH);
            z2=z1+Math.trunc(zCollideBound.getSize()/constants.ROOM_BLOCK_WIDTH);
            if (z1<0) z1=0;
            if (z2>this.zBlockSize) z2=this.zBlockSize;
            
            for (z=z1;z<z2;z++) {
                this.edgeGrid.setCell((this.xBlockSize-1),z,1);
            }
            return;
        }
        
            // collide on our top
            
        if (zCollideBound.max===this.zBound.min) {
            x1=Math.trunc((xCollideBound.min-this.xBound.min)/constants.ROOM_BLOCK_WIDTH);
            x2=x1+Math.trunc(xCollideBound.getSize()/constants.ROOM_BLOCK_WIDTH);
            if (x1<0) x1=0;
            if (x2>this.xBlockSize) x2=this.xBlockSize;
            
            for (x=x1;x<x2;x++) {
                this.edgeGrid.setCell(x,0,1);
            }
            return;
        }
        
            // collide on our bottom
            
        if (zCollideBound.min===this.zBound.max) {
            x1=Math.trunc((xCollideBound.min-this.xBound.min)/constants.ROOM_BLOCK_WIDTH);
            x2=x1+Math.trunc(xCollideBound.getSize()/constants.ROOM_BLOCK_WIDTH);
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
            case constants.ROOM_SIDE_LEFT:
                this.connectSideHasDoor[flipSide?constants.ROOM_SIDE_RIGHT:constants.ROOM_SIDE_LEFT]=true;
                break;
            case constants.ROOM_SIDE_RIGHT:
                this.connectSideHasDoor[flipSide?constants.ROOM_SIDE_LEFT:constants.ROOM_SIDE_RIGHT]=true;
                break;
            case constants.ROOM_SIDE_TOP:
                this.connectSideHasDoor[flipSide?constants.ROOM_SIDE_BOTTOM:constants.ROOM_SIDE_TOP]=true;
                break;
            case constants.ROOM_SIDE_BOTTOM:
                this.connectSideHasDoor[flipSide?constants.ROOM_SIDE_TOP:constants.ROOM_SIDE_BOTTOM]=true;
                break;
        }
    }
    
    isDoorOnConnectionSide(connectSide)
    {
        return(this.connectSideHasDoor[connectSide]);
    }
    
        //
        // mark stairs
        //
        
    markStairOnConnectionSide(connectionSide)
    {
        this.connectSideHasStair[connectionSide]=true;
    }
    
    isStairOnConnectionSide(connectionSide)
    {
        return(this.connectSideHasStair[connectionSide]);
    }
    
        //
        // window spots
        //
        
    markExtensionLegalWindowSide(connectSide,connectedPathRoom)
    {
        switch (connectSide) {
            
            case constants.ROOM_SIDE_LEFT:
                this.legalWindowSide[constants.ROOM_SIDE_LEFT]=true;
                this.legalWindowSide[constants.ROOM_SIDE_TOP]=true;
                this.legalWindowSide[constants.ROOM_SIDE_RIGHT]=false;
                this.legalWindowSide[constants.ROOM_SIDE_BOTTOM]=true;
                
                connectedPathRoom.legalWindowSide[constants.ROOM_SIDE_LEFT]=false;
                return;
                
            case constants.ROOM_SIDE_TOP:
                this.legalWindowSide[constants.ROOM_SIDE_LEFT]=true;
                this.legalWindowSide[constants.ROOM_SIDE_TOP]=true;
                this.legalWindowSide[constants.ROOM_SIDE_RIGHT]=true;
                this.legalWindowSide[constants.ROOM_SIDE_BOTTOM]=false;
                
                connectedPathRoom.legalWindowSide[constants.ROOM_SIDE_TOP]=false;
                return;
                
            case constants.ROOM_SIDE_RIGHT:
                this.legalWindowSide[constants.ROOM_SIDE_LEFT]=false;
                this.legalWindowSide[constants.ROOM_SIDE_RIGHT]=true;
                this.legalWindowSide[constants.ROOM_SIDE_TOP]=true;
                this.legalWindowSide[constants.ROOM_SIDE_BOTTOM]=true;
                
                connectedPathRoom.legalWindowSide[constants.ROOM_SIDE_RIGHT]=false;
                return;
            
            case constants.ROOM_SIDE_BOTTOM:
                this.legalWindowSide[constants.ROOM_SIDE_LEFT]=true;
                this.legalWindowSide[constants.ROOM_SIDE_TOP]=false;
                this.legalWindowSide[constants.ROOM_SIDE_RIGHT]=true;
                this.legalWindowSide[constants.ROOM_SIDE_BOTTOM]=true;
                
                connectedPathRoom.legalWindowSide[constants.ROOM_SIDE_BOTTOM]=false;
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
                    bx=Math.trunc((this.xBound.min+(constants.ROOM_BLOCK_WIDTH*x))+(constants.ROOM_BLOCK_WIDTH/2));
                    bz=Math.trunc((this.zBound.min+(constants.ROOM_BLOCK_WIDTH*z))+(constants.ROOM_BLOCK_WIDTH/2));
                    return(new PointClass(bx,(this.yBound.max-((constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH)*n)),bz));
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
            bx=Math.trunc((this.xBound.min+(constants.ROOM_BLOCK_WIDTH*x))+(constants.ROOM_BLOCK_WIDTH/2));
            bz=Math.trunc((this.zBound.min+(constants.ROOM_BLOCK_WIDTH*z))+(constants.ROOM_BLOCK_WIDTH/2));
            return(new PointClass(bx,this.yBound.max,bz));
        }

        return(null);
    }
    
    getGroundFloorSpawnToFirstPlatformOrTopBound(x,z)
    {
        let n,y;
        
        y=this.yBound.max-constants.ROOM_FLOOR_HEIGHT;
        
        for (n=1;n<this.storyCount;n++) {
            if (this.blockGrid[n].getCell(x,z)===0) break;
            y-=(constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH);
        }
        
        return(new BoundClass(y,this.yBound.max));
    }
    
    getGroundFloorSpawnToFirstPlatformOrTopBoundByCoordinate(x,z)
    {
        x=Math.trunc(((x-Math.trunc(constants.ROOM_BLOCK_WIDTH/2))-this.xBound.min)/constants.ROOM_BLOCK_WIDTH);
        z=Math.trunc(((z-Math.trunc(constants.ROOM_BLOCK_WIDTH/2))-this.zBound.min)/constants.ROOM_BLOCK_WIDTH);
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
    
    getDirectionTowardsNearestWall(x,z)
    {
        let distLft=x-this.xBound.min;
        let distRgt=this.xBound.max-x;
        let distTop=z-this.zBound.min;
        let distBot=this.zBound.max-z;
        
        if ((distLft<distRgt) && (distLft<distTop) && (distLft<distBot)) {
            return(new MapRoomFaceClass(constants.ROOM_SIDE_LEFT,distLft));
        }
        else {
            if ((distRgt<distTop) && (distRgt<distBot)) {
                return(new MapRoomFaceClass(constants.ROOM_SIDE_RIGHT,distRgt));
            }
            else {
                if (distTop<distBot) {
                    return(new MapRoomFaceClass(constants.ROOM_SIDE_TOP,distTop));
                }
                else {
                    return(new MapRoomFaceClass(constants.ROOM_SIDE_BOTTOM,distBot));
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
            return(new MapRoomFaceClass(constants.ROOM_SIDE_RIGHT,distLft));
        }
        else {
            if ((distRgt<distTop) && (distRgt<distBot)) {
                return(new MapRoomFaceClass(constants.ROOM_SIDE_LEFT,distRgt));
            }
            else {
                if (distTop<distBot) {
                    return(new MapRoomFaceClass(constants.ROOM_SIDE_BOTTOM,distTop));
                }
                else {
                    return(new MapRoomFaceClass(constants.ROOM_SIDE_TOP,distBot));
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
        let nRoom=this.map.roomList.count();

        for (n=0;n!==nRoom;n++) {
            room=this.map.roomList.get(n);
            
            switch (connectSide) {
                case constants.ROOM_SIDE_LEFT:
                    if (room.xBound.max===this.xBound.min) return(true);
                    break;
                case constants.ROOM_SIDE_TOP:
                    if (room.zBound.max===this.zBound.min) return(true);
                    break;
                case constants.ROOM_SIDE_RIGHT:
                    if (room.xBound.min===this.xBound.max) return(true);
                    break;
                case constants.ROOM_SIDE_BOTTOM:
                    if (room.zBound.min===this.zBound.max) return(true);
                    break;
            }
        }
        
        return(false);
    }
    
        //
        // build array of random rectangles for decorations
        //
        
    createRandomRects()
    {
        let n,x,z,x2,z2,hit,rect,delSkip;
        let wid,high,startWid,startHigh;
        let xBlockStart,xBlockEnd,zBlockStart,zBlockEnd;
        let xSize=this.xBlockSize-2;
        let zSize=this.zBlockSize-2;
        let rects=[];

            // create a grid to
            // build cubicals in
            // typed arrays initialize to 0

        let grid=new Uint16Array(xSize*zSize);
        
            // if it's possible for a side to have
            // stairs, then stay further away from it
            
        if (this.connectSideHasStair[constants.ROOM_SIDE_LEFT]) {
            for (z=0;z!=zSize;z++) {
                grid[z*xSize]=1;
            }
        }
        if (this.connectSideHasStair[constants.ROOM_SIDE_RIGHT]) {
            for (z=0;z!=zSize;z++) {
                grid[(z*xSize)+(xSize-1)]=1;
            }
        }
        if (this.connectSideHasStair[constants.ROOM_SIDE_TOP]) {
            for (x=0;x!=xSize;x++) {
                grid[x]=1;
            }
        }
        if (this.connectSideHasStair[constants.ROOM_SIDE_BOTTOM]) {
            for (x=0;x!=xSize;x++) {
                grid[((zSize-1)*xSize)+x]=1;
            }
        }

            // start making the random rects

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

                // create the rectangle which is always
                // 1 over because we are leaving a gutter
                // for the doors

            rects.push(new RectClass((x+1),(z+1),((x+1)+wid),((z+1)+high)));
            
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
        
            // remove any rects that have a section
            // blocked off
  
        n=0;
        
        while (n<rects.length) {
            rect=rects[n];
            
            delSkip=false;
            
            for (x=rect.lft;x!==rect.rgt;x++) {
                for (z=rect.top;z!==rect.bot;z++) {
                    if (this.checkBlockGrid(0,x,z)) {
                        rects.splice(n,1);
                        delSkip=true;
                        break;
                    }
                }
                
                if (delSkip) break;
            }
            
            if (!delSkip) n++;
        }

        return(rects);
    }
    
    blockGridForRect(rect)
    {
        let x,z;
        
        for (x=rect.lft;x!==rect.rgt;x++) {
            for (z=rect.top;z!==rect.bot;z++) {
                this.setBlockGrid(0,x,z);
            }
        }
    }
    
        //
        // create polygon walls and floors
        //
        
    createMeshWalls(bitmap,yWallBound,meshFlag)
    {
        let n,nSegment,x,z,x2,z2;
        let vertexList,indexes,vIdx,iIdx;

            // build the vertices.  Each triangle gets it's
            // own vertices so normals work

        nSegment=(this.xBlockSize*2)+(this.zBlockSize*2);

        vertexList=MeshUtilityClass.createMapVertexList(nSegment*6);
        indexes=new Uint16Array(nSegment*6);
        
        vIdx=0;
        iIdx=0;
        
            // top square polygons
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+constants.ROOM_BLOCK_WIDTH;
            
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
            z2=z+constants.ROOM_BLOCK_WIDTH;
            
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
            x2=x+constants.ROOM_BLOCK_WIDTH;
            
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
            z2=z+constants.ROOM_BLOCK_WIDTH;
            
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
        return(new MeshClass(this.view,bitmap,vertexList,indexes,meshFlag));
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
            x2=x+constants.ROOM_BLOCK_WIDTH;
            lineList.push(new Line2DClass(new Point2DIntClass(x,this.zBound.min),new Point2DIntClass(x2,this.zBound.min)));
            x=x2;
        }

            // right lines
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+constants.ROOM_BLOCK_WIDTH;
            lineList.push(new Line2DClass(new Point2DIntClass(this.xBound.max,z),new Point2DIntClass(this.xBound.max,z2)));
            z=z2;
        }
        
             // bottom lines
        
        x=this.xBound.min;
        
        for (n=0;n!==this.xBlockSize;n++) {
            x2=x+constants.ROOM_BLOCK_WIDTH;
            lineList.push(new Line2DClass(new Point2DIntClass(x,this.zBound.max),new Point2DIntClass(x2,this.zBound.max)));
            x=x2;
        }

            // right lines
            
        z=this.zBound.min;
        
        for (n=0;n!==this.zBlockSize;n++) {
            z2=z+constants.ROOM_BLOCK_WIDTH;
            lineList.push(new Line2DClass(new Point2DIntClass(this.xBound.min,z),new Point2DIntClass(this.xBound.min,z2)));
            z=z2;
        }

        return(lineList);
    }
    
        //
        // create polygon floors or ceilings
        //
        
    createMeshFloor(bitmap,meshFlag)
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
            vz2=vz+constants.ROOM_BLOCK_WIDTH;
            
            vx=this.xBound.min;
            
            for (x=0;x!==this.xBlockSize;x++) {
                vx2=vx+constants.ROOM_BLOCK_WIDTH;
                
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
        return(new MeshClass(this.view,bitmap,vertexList,indexes,meshFlag));
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
            vz2=vz+constants.ROOM_BLOCK_WIDTH;
            
            vx=this.xBound.min;
            
            for (x=0;x!==this.xBlockSize;x++) {
                vx2=vx+constants.ROOM_BLOCK_WIDTH;
                
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
        return(new MeshClass(this.view,bitmap,vertexList,indexes,constants.MESH_FLAG_ROOM_CEILING));
    }
    
        //
        // liquids
        //
        
    getLiquidY()
    {
        return(this.yBound.max-constants.ROOM_FLOOR_HEIGHT);
    }
    
    addTintFromLiquidColor(col)
    {
        col.addFromValues(0.0,0.0,1.0);         // supergumba -- hard coded
    }

}
