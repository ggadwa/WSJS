"use strict";

//
// generate room closet class
//

class GenRoomClosetClass
{
    constructor(view,bitmapList,map,genRandom)
    {    
        this.view=view;
        this.bitmapList=bitmapList;
        this.map=map;
        this.genRandom=genRandom;
    }
    
        // build the closet cube
        
    createClosetCube(xBound,yBound,zBound)
    {
        var n,idx;
        var vertexList,indexes;
        var bitmap=this.bitmapList.getBitmap('Map Closet');
        
            // center point for normal creation
            
        var centerPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());

            // the walls

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
        
        this.map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,MESH_FLAG_ROOM_WALL));

            // ceiling
            
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
        
        this.map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,MESH_FLAG_ROOM_CEILING));

            // floor
            
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
        
        this.map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,MESH_FLAG_ROOM_FLOOR));
    }

        // closet mainline
        
    addCloset(room)
    {
        var n,k,x,z,xAdd,zAdd;
        var connectSide,connectOffset,closetLen;
        var xClosetBound,yClosetBound,zClosetBound;
        
        var closetCount=this.genRandom.randomIndex(ROOM_CLOSET_MAX_COUNT);
        if (closetCount===0) return;
        
            // create closests
            
        for (n=0;n!==closetCount;n++) {
            
                // find a connection side, offset, and
                // closet length
                
            connectSide=this.genRandom.randomIndex(4);
            
            if ((connectSide===ROOM_SIDE_LEFT) || (connectSide===ROOM_SIDE_RIGHT)) {
                closetLen=this.genRandom.randomInt(2,(room.zBlockSize-2));
                connectOffset=this.genRandom.randomInt(0,(room.zBlockSize-closetLen));
            }
            else {
                closetLen=this.genRandom.randomInt(2,(room.xBlockSize-2));
                connectOffset=this.genRandom.randomInt(0,(room.xBlockSize-closetLen));
            }
            
                // get the Y bound

            yClosetBound=room.yBound.copy();
            if (room.hasStories) {
                if (this.genRandom.randomPercentage(ROOM_CLOSET_UP_PERCENTAGE)) yClosetBound.add(-(room.yBound.getSize()+ROOM_FLOOR_DEPTH));
            }
            
                // get the box
                
            switch (connectSide) {
                
                case ROOM_SIDE_LEFT:
                    xAdd=0;
                    zAdd=ROOM_BLOCK_WIDTH;
                    z=room.zBound.min+(connectOffset*ROOM_BLOCK_WIDTH);
                    xClosetBound=new wsBound((room.xBound.min-ROOM_BLOCK_WIDTH),room.xBound.min);
                    zClosetBound=new wsBound(z,(z+ROOM_BLOCK_WIDTH));
                    break;
                    
                case ROOM_SIDE_TOP:
                    xAdd=ROOM_BLOCK_WIDTH;
                    zAdd=0;
                    x=room.xBound.min+(connectOffset*ROOM_BLOCK_WIDTH);
                    xClosetBound=new wsBound(x,(x+ROOM_BLOCK_WIDTH));
                    zClosetBound=new wsBound((room.zBound.min-ROOM_BLOCK_WIDTH),room.zBound.min);
                    break;
                    
                case ROOM_SIDE_RIGHT:
                    xAdd=0;
                    zAdd=ROOM_BLOCK_WIDTH;
                    z=room.zBound.min+(connectOffset*ROOM_BLOCK_WIDTH);
                    xClosetBound=new wsBound(room.xBound.max,(room.xBound.max+ROOM_BLOCK_WIDTH));
                    zClosetBound=new wsBound(z,(z+ROOM_BLOCK_WIDTH));
                    break;
                    
                case ROOM_SIDE_BOTTOM:
                    xAdd=ROOM_BLOCK_WIDTH;
                    zAdd=0;
                    x=room.xBound.min+(connectOffset*ROOM_BLOCK_WIDTH);
                    xClosetBound=new wsBound(x,(x+ROOM_BLOCK_WIDTH));
                    zClosetBound=new wsBound(room.zBound.max,(room.zBound.max+ROOM_BLOCK_WIDTH));
                    break;
            }
            
                // build the blocks
            
            for (k=0;k!==closetLen;k++) {
                if (this.map.boxBoundCollision(xClosetBound,null,zClosetBound,MESH_FLAG_ROOM_WALL)!==-1) break;

                this.createClosetCube(xClosetBound,yClosetBound,zClosetBound);
                this.map.addOverlayCloset(xClosetBound,zClosetBound);
                
                room.maskEdgeGridBlockToBounds(xClosetBound,yClosetBound,zClosetBound);    // block off ledges for edge grid
                
                xClosetBound.add(xAdd);
                zClosetBound.add(zAdd);
            }
        }
        
    }

}
