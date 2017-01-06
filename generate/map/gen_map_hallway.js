/* global map, MeshUtilityClass, config */

"use strict";

//
// map hallways and doors
//

class GenRoomHallwayClass
{
    constructor()
    {
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
        
    finishMesh(bitmap,vertexList,buildNormals,meshCenterPoint,normalsIn,flags)
    {
            // build the indexes
            // everything we build is a quad so
            // we have 6 * # of quads in indexes
            
        let n,mesh;
        let iCount=Math.trunc(Math.trunc(vertexList.length)/4)*6;

        let indexes=new Uint16Array(iCount);
        
        let vIdx=0;

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

        mesh=new MapMeshClass(bitmap,vertexList,indexes,flags);        
        return(map.addMesh(mesh));
    }

        //
        // create doors
        //

    createDoorXSingle(x,yBound,zBound,thickSize)
    {
        let idx,meshIdx,xDoorBound;
        let vertexList,movement;
        let doorBitmap=map.getTexture(map.TEXTURE_TYPE_DOOR);
        
        xDoorBound=new wsBound((x-thickSize),(x+thickSize));
            
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(12);
        
        idx=this.createSingleWallX(idx,vertexList,(x-thickSize),yBound,zBound);
        idx=this.createSingleWallX(idx,vertexList,(x+thickSize),yBound,zBound);
        this.createSingleCeilingX(idx,vertexList,xDoorBound,yBound.max,zBound);
        meshIdx=this.finishMesh(doorBitmap,vertexList,true,null,false,map.MESH_FLAG_DOOR);
        
            // and the movement
        
        movement=new MovementClass(meshIdx,false,(map.ROOM_BLOCK_WIDTH*2));
        movement.addMove(new MoveClass(1500,new wsPoint(0,0,0)));
        movement.addMove(new MoveClass(1500,new wsPoint(0,-(map.ROOM_FLOOR_HEIGHT-map.ROOM_FLOOR_DEPTH),0)));
        
        map.addMovement(movement); 
    }
    
    createHallwayX(xBound,yBound,zBound,doubleDoor)
    {
        let idx,meshCenterPoint,thickSize;
        let vertexList;
        let zHallwayBound,zThickBound;
        
        let roomBitmap=map.getTexture(map.TEXTURE_TYPE_WALL);
        
            // need a center point to better
            // create normals
            
        meshCenterPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // doors need to be pushed in on
            // the edges so they have a wall thickness
            
        thickSize=Math.trunc(map.ROOM_BLOCK_WIDTH*0.05);
        
            // the door room
            // internal walls

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        idx=this.createSingleWallX(idx,vertexList,xBound.min,yBound,zBound);
        idx=this.createSingleWallX(idx,vertexList,xBound.max,yBound,zBound);
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,(zBound.min+thickSize));
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,(zBound.max-thickSize));
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,map.MESH_FLAG_ROOM_WALL);

            // external walls

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        zThickBound=new wsBound(zBound.min,(zBound.min+thickSize));
        idx=this.createSingleWallX(idx,vertexList,xBound.min,yBound,zThickBound);
        idx=this.createSingleWallX(idx,vertexList,xBound.max,yBound,zThickBound); 
        zThickBound=new wsBound((zBound.max-thickSize),zBound.max);
        idx=this.createSingleWallX(idx,vertexList,xBound.min,yBound,zThickBound);
        idx=this.createSingleWallX(idx,vertexList,xBound.max,yBound,zThickBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,false,map.MESH_FLAG_ROOM_WALL);

           // the ceiling and floor

        zHallwayBound=new wsBound((zBound.min+thickSize),(zBound.max-thickSize));

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingX(idx,vertexList,xBound,yBound.min,zHallwayBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,map.MESH_FLAG_ROOM_CEILING);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingX(idx,vertexList,xBound,yBound.max,zHallwayBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,map.MESH_FLAG_ROOM_FLOOR);
        
            // the door
            
        if (doubleDoor) {
            this.createDoorXSingle((xBound.min+(thickSize*2)),yBound,zBound,thickSize);
            this.createDoorXSingle((xBound.max-(thickSize*2)),yBound,zBound,thickSize);
        }
        else {
            this.createDoorXSingle(xBound.getMidPoint(),yBound,zBound,thickSize);
        }
    }
    
    createHallwayDoorZ(xBound,yBound,z,thickSize)
    {
        let idx,meshIdx,zDoorBound;
        let vertexList,movement;
        let doorBitmap=map.getTexture(map.TEXTURE_TYPE_DOOR);
        
        zDoorBound=new wsBound((z-thickSize),(z+thickSize));
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(12);
        
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,(z-thickSize));
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,(z+thickSize));
        this.createSingleCeilingZ(idx,vertexList,xBound,yBound.max,zDoorBound);
        meshIdx=this.finishMesh(doorBitmap,vertexList,true,null,false,map.MESH_FLAG_DOOR);
        
            // and the movement
        
        movement=new MovementClass(meshIdx,false,(map.ROOM_BLOCK_WIDTH*2));
        movement.addMove(new MoveClass(1500,new wsPoint(0,0,0)));
        movement.addMove(new MoveClass(1500,new wsPoint(0,-(map.ROOM_FLOOR_HEIGHT-map.ROOM_FLOOR_DEPTH),0)));
        
        map.addMovement(movement); 
    }

    createHallwayZ(xBound,yBound,zBound,doubleDoor)
    {
        let idx,meshCenterPoint,thickSize;
        let vertexList;
        let xHallwayBound,xThickBound;
        
        let roomBitmap=map.getTexture(map.TEXTURE_TYPE_WALL);
        
            // need a center point to better
            // create normals
            
        meshCenterPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // doors need to be pushed in on
            // the edges so they have a wall thickness
            
        thickSize=Math.trunc(map.ROOM_BLOCK_WIDTH*0.05);
         
            // the door room
            // internal walls
            
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,zBound.max);
        idx=this.createSingleWallX(idx,vertexList,(xBound.min+thickSize),yBound,zBound);
        idx=this.createSingleWallX(idx,vertexList,(xBound.max-thickSize),yBound,zBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,map.MESH_FLAG_ROOM_WALL);

            // external walls

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        xThickBound=new wsBound(xBound.min,(xBound.min+thickSize));
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.max);
        xThickBound=new wsBound((xBound.max-thickSize),xBound.max);
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.max);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,false,map.MESH_FLAG_ROOM_WALL);

           // the ceiling
           
        xHallwayBound=new wsBound((xBound.min+thickSize),(xBound.max-thickSize));

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingZ(idx,vertexList,xHallwayBound,yBound.min,zBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,map.MESH_FLAG_ROOM_CEILING);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingZ(idx,vertexList,xHallwayBound,yBound.max,zBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,map.MESH_FLAG_ROOM_FLOOR);
        
            // the door
        
        if (doubleDoor) {
            this.createHallwayDoorZ(xBound,yBound,(zBound.min+(thickSize*2)),thickSize);
            this.createHallwayDoorZ(xBound,yBound,(zBound.max-(thickSize*2)),thickSize);
        }
        else {
            this.createHallwayDoorZ(xBound,yBound,zBound.getMidPoint(),thickSize);
        }
    }
}

