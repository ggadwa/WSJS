"use strict";

//
// map doors
//

class GenRoomDoorClass
{
    constructor(bitmapList,map,genRandom)
    {    
        this.bitmapList=bitmapList;
        this.map=map;
        this.genRandom=genRandom;
        
        Object.seal(this);
    }
    
        //
        // create a single wall in vertexes
        //
        
    createSingleWallX(idx,vertexList,x,yBound,zBound)
    {
        vertexList[idx++].position.setFromValues(x,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(x,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(x,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(x,yBound.max,zBound.min);
        return(idx);
    }
    
    createSingleWallZ(idx,vertexList,xBound,yBound,z)
    {
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,z);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,z);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,z);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,z);
        return(idx);
    }
    
    createSingleCeilingX(idx,vertexList,xBound,top,zBound)
    {
        vertexList[idx++].position.setFromValues(xBound.min,top,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,top,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,top,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,top,zBound.max);
        return(idx);
    }
    
    createSingleCeilingZ(idx,vertexList,xBound,bottom,zBound)
    {
        vertexList[idx++].position.setFromValues(xBound.min,bottom,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.min,bottom,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,bottom,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,bottom,zBound.min);
        return(idx);
    }
    
        //
        // utility routine to complete sets of
        // vertices into meshes
        //
        
    finishDoorMesh(bitmap,vertexList,buildNormals,meshCenterPoint,normalsIn,flags)
    {
            // build the indexes
            // everything we build is a quad so
            // we have 6 * # of quads in indexes
            
        var n;
        var iCount=Math.trunc(Math.trunc(vertexList.length)/4)*6;

        var indexes=new Uint16Array(iCount);
        
        var vIdx=0;

        for (n=0;n!==iCount;n+=6) {
            indexes[n]=vIdx;
            indexes[n+1]=vIdx+1;
            indexes[n+2]=vIdx+2;
            
            indexes[n+3]=vIdx;
            indexes[n+4]=vIdx+2;
            indexes[n+5]=vIdx+3;
            
            vIdx+=4;
        }
        
            // create the mesh and
            // add to map
               
        if (buildNormals) MeshUtilityClass.buildVertexListNormals(vertexList,indexes,meshCenterPoint,normalsIn);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

        var mesh=new MapMeshClass(bitmap,vertexList,indexes,flags);        
        return(this.map.addMesh(mesh));
    }

        //
        // create doors
        //

    createDoorX(xBound,yBound,zBound)
    {
        var n,idx,meshIdx;
        var vertexList,movement;
        var x,xDoorBound,zDoorBound,zThickBound;
        
        var roomBitmap=this.bitmapList.getBitmap('Map Closet');
        var doorBitmap=this.bitmapList.getBitmap('Map Metal');
        
            // need a center point to better
            // create normals
            
        var meshCenterPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // doors need to be pushed in on
            // the edges so they have a wall thickness
            
        var thickSize=Math.trunc(zBound.getSize()*0.05);
        
            // the door room
            // internal walls

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        idx=this.createSingleWallX(idx,vertexList,xBound.min,yBound,zBound);
        idx=this.createSingleWallX(idx,vertexList,xBound.max,yBound,zBound);
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,(zBound.min+thickSize));
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,(zBound.max-thickSize));
        this.finishDoorMesh(roomBitmap,vertexList,true,meshCenterPoint,true,MESH_FLAG_ROOM_WALL);

            // external walls

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        zThickBound=new wsBound(zBound.min,(zBound.min+thickSize));
        idx=this.createSingleWallX(idx,vertexList,xBound.min,yBound,zThickBound);
        idx=this.createSingleWallX(idx,vertexList,xBound.max,yBound,zThickBound); 
        zThickBound=new wsBound((zBound.max-thickSize),zBound.max);
        idx=this.createSingleWallX(idx,vertexList,xBound.min,yBound,zThickBound);
        idx=this.createSingleWallX(idx,vertexList,xBound.max,yBound,zThickBound);
        this.finishDoorMesh(roomBitmap,vertexList,true,meshCenterPoint,false,MESH_FLAG_ROOM_WALL);

           // the ceiling and floor

        zDoorBound=new wsBound((zBound.min+thickSize),(zBound.max-thickSize));

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingX(idx,vertexList,xBound,yBound.min,zDoorBound);
        this.finishDoorMesh(roomBitmap,vertexList,true,meshCenterPoint,true,MESH_FLAG_ROOM_CEILING);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingX(idx,vertexList,xBound,yBound.max,zDoorBound);
        this.finishDoorMesh(roomBitmap,vertexList,true,meshCenterPoint,true,MESH_FLAG_ROOM_FLOOR);
        
            // the door
            
        x=xBound.getMidPoint();
        xDoorBound=new wsBound((x-thickSize),(x+thickSize));
            
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(12);
        
        idx=this.createSingleWallX(idx,vertexList,(x-thickSize),yBound,zDoorBound);
        idx=this.createSingleWallX(idx,vertexList,(x+thickSize),yBound,zDoorBound);
        this.createSingleCeilingX(idx,vertexList,xDoorBound,yBound.max,zDoorBound);
        meshIdx=this.finishDoorMesh(doorBitmap,vertexList,true,meshCenterPoint,false,MESH_FLAG_DOOR);
        
            // and the movement
        
        movement=new MovementClass(meshIdx);
        movement.addMove(new MoveClass(1500,new wsPoint(0,0,0)));
        movement.addMove(new MoveClass(1500,new wsPoint(0,-7000,0)));
        
        this.map.addMovement(movement); 
    }

    createDoorZ(xBound,yBound,zBound)
    {
        var n,idx,meshIdx;
        var vertexList,movement;
        var z,xDoorBound,zDoorBound,xThickBound;
        
        var roomBitmap=this.bitmapList.getBitmap('Map Closet');
        var doorBitmap=this.bitmapList.getBitmap('Map Metal');
        
            // need a center point to better
            // create normals
            
        var meshCenterPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // doors need to be pushed in on
            // the edges so they have a wall thickness
            
        var thickSize=Math.trunc(zBound.getSize()*0.05);
         
            // the door room
            // internal walls

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,zBound.max);
        idx=this.createSingleWallX(idx,vertexList,(xBound.min+thickSize),yBound,zBound);
        idx=this.createSingleWallX(idx,vertexList,(xBound.max-thickSize),yBound,zBound);
        this.finishDoorMesh(roomBitmap,vertexList,true,meshCenterPoint,true,MESH_FLAG_ROOM_WALL);

            // external walls

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        xThickBound=new wsBound(xBound.min,(xBound.min+thickSize));
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.max);
        xThickBound=new wsBound((xBound.max-thickSize),xBound.max);
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.max);
        this.finishDoorMesh(roomBitmap,vertexList,true,meshCenterPoint,false,MESH_FLAG_ROOM_WALL);

           // the ceiling
           
        xDoorBound=new wsBound((xBound.min+thickSize),(xBound.max-thickSize));

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingZ(idx,vertexList,xDoorBound,yBound.min,zBound);
        this.finishDoorMesh(roomBitmap,vertexList,true,meshCenterPoint,true,MESH_FLAG_ROOM_CEILING);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingZ(idx,vertexList,xDoorBound,yBound.max,zBound);
        this.finishDoorMesh(roomBitmap,vertexList,true,meshCenterPoint,true,MESH_FLAG_ROOM_FLOOR);
        
            // the door
            
        z=zBound.getMidPoint();
        zDoorBound=new wsBound((z-thickSize),(z+thickSize));
            
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(12);
        
        idx=this.createSingleWallZ(idx,vertexList,xDoorBound,yBound,(z-thickSize));
        idx=this.createSingleWallZ(idx,vertexList,xDoorBound,yBound,(z+thickSize));
        this.createSingleCeilingZ(idx,vertexList,xDoorBound,yBound.max,zDoorBound);
        meshIdx=this.finishDoorMesh(doorBitmap,vertexList,true,meshCenterPoint,false,MESH_FLAG_DOOR);
        
            // and the movement
        
        movement=new MovementClass(meshIdx);
        movement.addMove(new MoveClass(1500,new wsPoint(0,0,0)));
        movement.addMove(new MoveClass(1500,new wsPoint(0,0,0)));
        movement.addMove(new MoveClass(1500,new wsPoint(0,-7000,0)));
        
        this.map.addMovement(movement); 
    }
}

