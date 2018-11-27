import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import MapMeshClass from '../../code/map/map_mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';
import genRandom from '../../generate/utility/random.js';

//
// generate room window class
//

export default class GenRoomWindowClass
{
    constructor(view,map,wallBitmap,frameBitmap)
    {
        this.view=view;
        this.map=map;
        this.wallBitmap=wallBitmap;
        this.frameBitmap=frameBitmap;
        
        Object.seal(this);
    }
    
        // build the window cube
        
    createWindowMesh(xBound,yBound,zBound,connectSide)
    {
        let n,idx;
        let vertexList,indexes;

            // center point for normal creation
            
        let centerPoint=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());

            // the inside walls
            
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(30);
            
        if (connectSide!==constants.ROOM_SIDE_LEFT) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min); 
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);        
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);     
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);    
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);  
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        }
        
        if (connectSide!==constants.ROOM_SIDE_RIGHT) {
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        }
    
        if (connectSide!==constants.ROOM_SIDE_TOP) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        }
        
        if (connectSide!==constants.ROOM_SIDE_BOTTOM) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);
        }
        
            // top & bottom
            
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);
    
        indexes=new Uint16Array(30);

        for (n=0;n!==30;n++) {
            indexes[n]=n;
        }
        
        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,centerPoint,true);
        MeshUtilityClass.buildVertexListUVs(this.wallBitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        
        this.map.meshList.add(new MapMeshClass(this.view,this.wallBitmap,vertexList,indexes,constants.MESH_FLAG_ROOM_WALL));

            // the window casing
            
        switch (connectSide) {
            case constants.ROOM_SIDE_LEFT:
                this.map.meshList.add(MeshPrimitivesClass.createFrameX(this.view,this.frameBitmap,xBound,yBound,zBound,false,true,false));
                break;
            case constants.ROOM_SIDE_RIGHT:
                this.map.meshList.add(MeshPrimitivesClass.createFrameX(this.view,this.frameBitmap,xBound,yBound,zBound,true,true,false));
                break;
            case constants.ROOM_SIDE_TOP:
                this.map.meshList.add(MeshPrimitivesClass.createFrameZ(this.view,this.frameBitmap,xBound,yBound,zBound,false,true,false));
                break;
            case constants.ROOM_SIDE_BOTTOM:
                this.map.meshList.add(MeshPrimitivesClass.createFrameZ(this.view,this.frameBitmap,xBound,yBound,zBound,true,true,false));
                break;
        }
    }

        // windows mainline
        
    addWindow(genMap,room)
    {
        let x,z,count,failCount;
        let wid,story,storyHigh;
        let connectSide,connectOffset;
        let xWindowBound,yWindowBound,zWindowBound;
        let lightPos;
        
        let windowCount=genRandom.randomIndex(constants.WINDOW_MAX_COUNT);
        if (windowCount===0) return;
        
            // story height
        
        wid=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.1);
        storyHigh=constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH;
            
            // get the Y bound
            // always need to remove on floor depth for top of window
            // if story > 1, then we never put window on lowest story

        if (room.storyCount>1) {
            story=genRandom.randomInt(1,(room.storyCount-1));
        }
        else {
            story=genRandom.randomInt(0,room.storyCount);
        }
        yWindowBound=new BoundClass(((room.yBound.max-((story+1)*storyHigh))+constants.ROOM_FLOOR_DEPTH),(room.yBound.max-(story*storyHigh)));
        
            // create windows
            
        count=0;
        failCount=0;
        
        while ((count<windowCount) && (failCount<(windowCount*10))) {
            
                // find a connection side, skip if
                // there's a door or windows no legal on this side
                
            connectSide=genRandom.randomIndex(4);
            
            if (!room.legalWindowSide[connectSide]) {
                failCount++;
                continue;
            }
            
            if (room.isDoorOnConnectionSide(connectSide)) {
                failCount++;
                continue;
            }
            
                // get position
                // never put in corner
            
            if ((connectSide===constants.ROOM_SIDE_LEFT) || (connectSide===constants.ROOM_SIDE_RIGHT)) {
                connectOffset=genRandom.randomInt(1,(room.zBlockSize-3));
            }
            else {
                connectOffset=genRandom.randomInt(1,(room.xBlockSize-3));
            }
            
                // get the box
                
            switch (connectSide) {
                
                case constants.ROOM_SIDE_LEFT:
                    z=room.zBound.min+(connectOffset*constants.ROOM_BLOCK_WIDTH);
                    xWindowBound=new BoundClass((room.xBound.min-wid),room.xBound.min);
                    zWindowBound=new BoundClass(z,(z+constants.ROOM_BLOCK_WIDTH));
                    lightPos=new PointClass((room.xBound.min-(wid*2)),yWindowBound.getMidPoint(),(z+Math.trunc(constants.ROOM_BLOCK_WIDTH*0.5)));
                    break;
                    
                case constants.ROOM_SIDE_TOP:
                    x=room.xBound.min+(connectOffset*constants.ROOM_BLOCK_WIDTH);
                    xWindowBound=new BoundClass(x,(x+constants.ROOM_BLOCK_WIDTH));
                    zWindowBound=new BoundClass((room.zBound.min-wid),room.zBound.min);
                    lightPos=new PointClass((x+Math.trunc(constants.ROOM_BLOCK_WIDTH*0.5)),yWindowBound.getMidPoint(),(room.zBound.min-(wid*2)));
                    break;
                    
                case constants.ROOM_SIDE_RIGHT:
                    z=room.zBound.min+(connectOffset*constants.ROOM_BLOCK_WIDTH);
                    xWindowBound=new BoundClass(room.xBound.max,(room.xBound.max+wid));
                    zWindowBound=new BoundClass(z,(z+constants.ROOM_BLOCK_WIDTH));
                    lightPos=new PointClass((room.xBound.max+(wid*2)),yWindowBound.getMidPoint(),(z+Math.trunc(constants.ROOM_BLOCK_WIDTH*0.5)));
                    break;
                    
                case constants.ROOM_SIDE_BOTTOM:
                    x=room.xBound.min+(connectOffset*constants.ROOM_BLOCK_WIDTH);
                    xWindowBound=new BoundClass(x,(x+constants.ROOM_BLOCK_WIDTH));
                    zWindowBound=new BoundClass(room.zBound.max,(room.zBound.max+wid));
                    lightPos=new PointClass((x+Math.trunc(constants.ROOM_BLOCK_WIDTH*0.5)),yWindowBound.getMidPoint(),(room.zBound.max+(wid*2)));
                    break;
            }
            
                // build the blocks
            
            if (this.map.meshList.boxBoundCollision(xWindowBound,null,zWindowBound,constants.MESH_FLAG_ROOM_WALL)!==-1) {
                failCount++;
                continue;
            }
            
            this.createWindowMesh(xWindowBound,yWindowBound,zWindowBound,connectSide);
            
                // light from window
                // cut the main light if there's extra lights
                
            genMap.addGeneralLight(room,lightPos,null,null,genMap.WINDOW_LIGHT_INTENSITY,false);
            room.mainLight.changeIntensity(-genMap.WINDOW_MAIN_LIGHT_INTENSITY_CUT);
            
                // if window at bottom, mask off
                
            if (story===0) room.maskEdgeGridBlockToBounds(xWindowBound,zWindowBound);
            
            count++;
        }
    }

}
