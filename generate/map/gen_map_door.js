"use strict";

//
// generate room door class
//

class GenRoomDoorClass
{
    constructor(view,bitmapList,map,genRandom)
    {    
        this.view=view;
        this.bitmapList=bitmapList;
        this.map=map;
        this.genRandom=genRandom;
        
        Object.seal(this);
    }
    
        // build any cubes for doors
        
    createCube(bitmap,xBound,yBound,zBound,normalsIn)
    {
        var n,idx;
        var vertexList,indexes;
        
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
        
        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,centerPoint,normalsIn);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        
        this.map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,MESH_FLAG_ROOM_FLOOR));
    }

        // door mainline
        
    createDoor(connectSide,xDoorBound,yDoorBound,zDoorBound)
    {
        var x,z,xSliderBound,zSliderBound,ySliderBound;
        var doorDepth=Math.trunc(ROOM_BLOCK_WIDTH*0.1);
        
        this.createCube(this.bitmapList.getBitmap('Map Closet'),xDoorBound,yDoorBound,zDoorBound,true);
        
        if ((connectSide===ROOM_SIDE_LEFT) || (connectSide===ROOM_SIDE_RIGHT)) {
            x=xDoorBound.getMidPoint();
            xSliderBound=new wsBound((x-doorDepth),(x+doorDepth));
            zSliderBound=zDoorBound.copy();
        }
        else {
            xSliderBound=xDoorBound.copy();
            z=zDoorBound.getMidPoint();
            zSliderBound=new wsBound((z-doorDepth),(z+doorDepth));
        }
        
        ySliderBound=new wsBound((yDoorBound.min+1000),yDoorBound.min);
        
        this.createCube(this.bitmapList.getBitmap('Map Metal'),xSliderBound,ySliderBound,zSliderBound,false);
    }

}
