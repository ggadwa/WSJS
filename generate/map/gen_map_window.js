/* global MeshUtilityClass, map, genRandom, config, mapRoomConstants */

"use strict";

//
// generate room window class
//

class GenRoomWindowClass
{
    constructor()
    {
        this.WINDOW_MAX_COUNT=5;            // maximum number of possible windows in room
        
        Object.seal(this);
    }
    
        // build the window cube
        
    createWindowMesh(xBound,yBound,zBound,connectSide)
    {
        let n,idx;
        let vertexList,indexes;
        let bitmap;
        
            // center point for normal creation
            
        let centerPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());

            // the walls
            
        bitmap=map.getTexture(map.TEXTURE_TYPE_WALL);

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(30);
        
            // sides
            
        if (connectSide!==mapRoomConstants.ROOM_SIDE_LEFT) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min); 
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);        
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);     
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);    
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);  
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        }
        
        if (connectSide!==mapRoomConstants.ROOM_SIDE_RIGHT) {
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        }
    
        if (connectSide!==mapRoomConstants.ROOM_SIDE_TOP) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        }
        
        if (connectSide!==mapRoomConstants.ROOM_SIDE_BOTTOM) {
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
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        
        map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,map.MESH_FLAG_WINDOW));
    }

        // windows mainline
        
    addWindow(room)
    {
        let n,x,z;
        let bottomStory,topStory,storyHigh;
        let connectSide,connectOffset;
        let xWindowBound,yWindowBound,zWindowBound;
        
        let windowCount=genRandom.randomIndex(this.WINDOW_MAX_COUNT);
        if (windowCount===0) return;
        
            // story height
            
        storyHigh=map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH;
        
            // create windows
            
        for (n=0;n!==windowCount;n++) {
            
                // find a connection side, skip if
                // there's a door on this side
                
            connectSide=genRandom.randomIndex(4);
            
            if (room.isDoorOnConnectionSide(connectSide)) continue;
            
                // get length and offset
            
            if ((connectSide===mapRoomConstants.ROOM_SIDE_LEFT) || (connectSide===mapRoomConstants.ROOM_SIDE_RIGHT)) {
                connectOffset=genRandom.randomInt(0,(room.zBlockSize-2));
            }
            else {
                connectOffset=genRandom.randomInt(0,(room.xBlockSize-2));
            }
            
                // get the Y bound
                // always need to remove on floor depth for top of window
                
            bottomStory=genRandom.randomInt(0,room.storyCount);
            topStory=bottomStory+1;   
            if ((room.storyCount-bottomStory)>1) topStory=bottomStory+genRandom.randomInt(1,(room.storyCount-bottomStory));

            yWindowBound=new wsBound(((room.yBound.max-(topStory*storyHigh))+map.ROOM_FLOOR_DEPTH),(room.yBound.max-(bottomStory*storyHigh)));
            
                // get the box
                
            switch (connectSide) {
                
                case mapRoomConstants.ROOM_SIDE_LEFT:
                    z=room.zBound.min+(connectOffset*map.ROOM_BLOCK_WIDTH);
                    xWindowBound=new wsBound((room.xBound.min-map.ROOM_BLOCK_WIDTH),room.xBound.min);
                    zWindowBound=new wsBound(z,(z+map.ROOM_BLOCK_WIDTH));
                    break;
                    
                case mapRoomConstants.ROOM_SIDE_TOP:
                    x=room.xBound.min+(connectOffset*map.ROOM_BLOCK_WIDTH);
                    xWindowBound=new wsBound(x,(x+map.ROOM_BLOCK_WIDTH));
                    zWindowBound=new wsBound((room.zBound.min-map.ROOM_BLOCK_WIDTH),room.zBound.min);
                    break;
                    
                case mapRoomConstants.ROOM_SIDE_RIGHT:
                    z=room.zBound.min+(connectOffset*map.ROOM_BLOCK_WIDTH);
                    xWindowBound=new wsBound(room.xBound.max,(room.xBound.max+map.ROOM_BLOCK_WIDTH));
                    zWindowBound=new wsBound(z,(z+map.ROOM_BLOCK_WIDTH));
                    break;
                    
                case mapRoomConstants.ROOM_SIDE_BOTTOM:
                    x=room.xBound.min+(connectOffset*map.ROOM_BLOCK_WIDTH);
                    xWindowBound=new wsBound(x,(x+map.ROOM_BLOCK_WIDTH));
                    zWindowBound=new wsBound(room.zBound.max,(room.zBound.max+map.ROOM_BLOCK_WIDTH));
                    break;
            }
            
                // build the blocks
            
            if (map.boxBoundCollision(xWindowBound,null,zWindowBound,map.MESH_FLAG_ROOM_WALL)===-1) this.createWindowMesh(xWindowBound,yWindowBound,zWindowBound,connectSide);
        }
        
    }

}