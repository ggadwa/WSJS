/* global MeshUtilityClass, map, genRandom, config, mapRoomConstants */

"use strict";

//
// generate room closet class
//

class GenRoomClosetClass
{
    constructor()
    {
        this.CLOSET_MAX_COUNT=5;            // maximum number of possible closets in room
        
        Object.seal(this);
    }
    
        // build the closet cube
        
    createClosetCube(xBound,yBound,zBound)
    {
        let n,idx;
        let vertexList,indexes;
        let bitmap;
        
            // center point for normal creation
            
        let centerPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());

            // the walls
            
        bitmap=map.getTexture(map.TEXTURE_TYPE_WALL);

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(24);

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min); 
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);        
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);     
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);    
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);  
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);

        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);

        indexes=new Uint16Array(24);

        for (n=0;n!==24;n++) {
            indexes[n]=n;
        }
        
        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,centerPoint,true);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        
        map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,map.MESH_FLAG_ROOM_WALL));

            // ceiling
            
        bitmap=map.getTexture(map.TEXTURE_TYPE_CEILING);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(6);

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        
        indexes=new Uint16Array(6);

        for (n=0;n!==6;n++) {
            indexes[n]=n;
        }
        
        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,centerPoint,true);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        
        map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,map.MESH_FLAG_ROOM_CEILING));

            // floor
        
        bitmap=map.getTexture(map.TEXTURE_TYPE_FLOOR);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(6);

        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);

        indexes=new Uint16Array(6);

        for (n=0;n!==6;n++) {
            indexes[n]=n;
        }
        
        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,centerPoint,true);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        
        map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,map.MESH_FLAG_ROOM_FLOOR));
    }

        // closet mainline
        
    addCloset(room)
    {
        let n,k,x,z,xAdd,zAdd;
        let bottomStory,topStory,storyHigh;
        let connectSide,connectOffset,closetLen;
        let xClosetBound,yClosetBound,zClosetBound;
        
        let closetCount=genRandom.randomIndex(this.CLOSET_MAX_COUNT);
        if (closetCount===0) return;
        
            // story height
            
        storyHigh=map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH;
        
            // create closests
            
        for (n=0;n!==closetCount;n++) {
            
                // find a connection side, skip if
                // there's a door on this side
                
            connectSide=genRandom.randomIndex(4);
            
            if (room.isDoorOnConnectionSide(connectSide)) continue;
            
                // get length and offset
            
            if ((connectSide===mapRoomConstants.ROOM_SIDE_LEFT) || (connectSide===mapRoomConstants.ROOM_SIDE_RIGHT)) {
                closetLen=genRandom.randomInt(2,(room.zBlockSize-2));
                connectOffset=genRandom.randomInt(0,(room.zBlockSize-closetLen));
            }
            else {
                closetLen=genRandom.randomInt(2,(room.xBlockSize-2));
                connectOffset=genRandom.randomInt(0,(room.xBlockSize-closetLen));
            }
            
                // get the Y bound
                // always need to remove on floor depth for top of closet
                
            bottomStory=genRandom.randomInt(0,room.storyCount);
            topStory=bottomStory+1;   
            if ((room.storyCount-bottomStory)>1) topStory=bottomStory+genRandom.randomInt(1,(room.storyCount-bottomStory));

            yClosetBound=new wsBound(((room.yBound.max-(topStory*storyHigh))+map.ROOM_FLOOR_DEPTH),(room.yBound.max-(bottomStory*storyHigh)));
            
                // get the box
                
            switch (connectSide) {
                
                case mapRoomConstants.ROOM_SIDE_LEFT:
                    xAdd=0;
                    zAdd=map.ROOM_BLOCK_WIDTH;
                    z=room.zBound.min+(connectOffset*map.ROOM_BLOCK_WIDTH);
                    xClosetBound=new wsBound((room.xBound.min-map.ROOM_BLOCK_WIDTH),room.xBound.min);
                    zClosetBound=new wsBound(z,(z+map.ROOM_BLOCK_WIDTH));
                    break;
                    
                case mapRoomConstants.ROOM_SIDE_TOP:
                    xAdd=map.ROOM_BLOCK_WIDTH;
                    zAdd=0;
                    x=room.xBound.min+(connectOffset*map.ROOM_BLOCK_WIDTH);
                    xClosetBound=new wsBound(x,(x+map.ROOM_BLOCK_WIDTH));
                    zClosetBound=new wsBound((room.zBound.min-map.ROOM_BLOCK_WIDTH),room.zBound.min);
                    break;
                    
                case mapRoomConstants.ROOM_SIDE_RIGHT:
                    xAdd=0;
                    zAdd=map.ROOM_BLOCK_WIDTH;
                    z=room.zBound.min+(connectOffset*map.ROOM_BLOCK_WIDTH);
                    xClosetBound=new wsBound(room.xBound.max,(room.xBound.max+map.ROOM_BLOCK_WIDTH));
                    zClosetBound=new wsBound(z,(z+map.ROOM_BLOCK_WIDTH));
                    break;
                    
                case mapRoomConstants.ROOM_SIDE_BOTTOM:
                    xAdd=map.ROOM_BLOCK_WIDTH;
                    zAdd=0;
                    x=room.xBound.min+(connectOffset*map.ROOM_BLOCK_WIDTH);
                    xClosetBound=new wsBound(x,(x+map.ROOM_BLOCK_WIDTH));
                    zClosetBound=new wsBound(room.zBound.max,(room.zBound.max+map.ROOM_BLOCK_WIDTH));
                    break;
            }
            
                // build the blocks
            
            for (k=0;k!==closetLen;k++) {
                if (map.boxBoundCollision(xClosetBound,null,zClosetBound,map.MESH_FLAG_ROOM_WALL)!==-1) break;

                this.createClosetCube(xClosetBound,yClosetBound,zClosetBound);
                map.addOverlayCloset(xClosetBound,zClosetBound);
                
                room.maskEdgeGridBlockToBounds(xClosetBound,zClosetBound);    // block off ledges for edge grid
                
                xClosetBound.add(xAdd);
                zClosetBound.add(zAdd);
            }
        }
        
    }

}
