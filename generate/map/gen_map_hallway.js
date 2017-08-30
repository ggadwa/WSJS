import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import MapMeshClass from '../../code/map/map_mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';
import MoveClass from '../../code/map/move.js';
import MovementClass from '../../code/map/movement.js';

//
// map hallways and doors
//

export default class GenRoomHallwayClass
{
    constructor(view,map)
    {
        this.view=view;
        this.map=map;
        
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

        mesh=new MapMeshClass(this.view,bitmap,vertexList,indexes,flags);        
        return(this.map.meshList.add(mesh));
    }

        //
        // create doors
        //

    createDoorXSingle(x,yBound,zBound,thickSize)
    {
        let idx,meshIdx,xDoorBound;
        let vertexList,movement;
        let doorBitmap=this.map.getTexture(constants.BITMAP_TYPE_DOOR);
        
        xDoorBound=new BoundClass((x-thickSize),(x+thickSize));
            
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(12);
        
        idx=this.createSingleWallX(idx,vertexList,(x-thickSize),yBound,zBound);
        idx=this.createSingleWallX(idx,vertexList,(x+thickSize),yBound,zBound);
        this.createSingleCeilingX(idx,vertexList,xDoorBound,yBound.max,zBound);
        meshIdx=this.finishMesh(doorBitmap,vertexList,true,null,false,constants.MESH_FLAG_DOOR);
        
        this.map.addOverlayDoor(xDoorBound,zBound);
        
            // and the movement
        
        movement=new MovementClass(meshIdx,false,(constants.ROOM_BLOCK_WIDTH*2));
        movement.addMove(new MoveClass(1500,new PointClass(0,0,0)));
        movement.addMove(new MoveClass(1500,new PointClass(0,-(constants.ROOM_FLOOR_HEIGHT-constants.ROOM_FLOOR_DEPTH),0)));
        
        this.map.addMovement(movement);
    }
    
    createHallwayX(xBound,yBound,zBound,doubleDoor)
    {
        let idx,meshCenterPoint,thickSize;
        let vertexList;
        let zHallwayBound,zThickBound,xFrameBound,frameBitmap;
        
        let roomBitmap=this.map.getTexture(constants.BITMAP_TYPE_WALL);
        
            // need a center point to better
            // create normals
            
        meshCenterPoint=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // doors need to be pushed in on
            // the edges so they have a wall thickness
            
        thickSize=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.05);
        
            // the door room
            // internal walls

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        idx=this.createSingleWallX(idx,vertexList,xBound.min,yBound,zBound);
        idx=this.createSingleWallX(idx,vertexList,xBound.max,yBound,zBound);
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,(zBound.min+thickSize));
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,(zBound.max-thickSize));
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_WALL);

            // external walls

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        zThickBound=new BoundClass(zBound.min,(zBound.min+thickSize));
        idx=this.createSingleWallX(idx,vertexList,xBound.min,yBound,zThickBound);
        idx=this.createSingleWallX(idx,vertexList,xBound.max,yBound,zThickBound); 
        zThickBound=new BoundClass((zBound.max-thickSize),zBound.max);
        idx=this.createSingleWallX(idx,vertexList,xBound.min,yBound,zThickBound);
        idx=this.createSingleWallX(idx,vertexList,xBound.max,yBound,zThickBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,false,constants.MESH_FLAG_ROOM_WALL);

           // the ceiling and floor

        zHallwayBound=new BoundClass((zBound.min+thickSize),(zBound.max-thickSize));

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingX(idx,vertexList,xBound,yBound.min,zHallwayBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_CEILING);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingX(idx,vertexList,xBound,yBound.max,zHallwayBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_FLOOR);
        
            // the door
            
        if (doubleDoor) {
            this.createDoorXSingle((xBound.min+(thickSize*2)),yBound,zBound,thickSize);
            this.createDoorXSingle((xBound.max-(thickSize*2)),yBound,zBound,thickSize);
        }
        else {
            this.createDoorXSingle(xBound.getMidPoint(),yBound,zBound,thickSize);
        }
        
            // the frame
            
        frameBitmap=this.map.getTexture(constants.BITMAP_TYPE_FRAME);
        
        xFrameBound=new BoundClass(xBound.min,xBound.min);
        this.map.meshList.add(MeshPrimitivesClass.createFrameX(this.view,this.map.getTexture(constants.BITMAP_TYPE_FRAME),xFrameBound,yBound,zBound,true,false,true));
        
        xFrameBound=new BoundClass(xBound.max,xBound.max);
        this.map.meshList.add(MeshPrimitivesClass.createFrameX(this.view,this.map.getTexture(constants.BITMAP_TYPE_FRAME),xFrameBound,yBound,zBound,false,false,true));
    }
    
    createHallwayDoorZ(xBound,yBound,z,thickSize)
    {
        let idx,meshIdx,zDoorBound;
        let vertexList,movement;
        let doorBitmap=this.map.getTexture(constants.BITMAP_TYPE_DOOR);
        
        zDoorBound=new BoundClass((z-thickSize),(z+thickSize));
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(12);
        
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,(z-thickSize));
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,(z+thickSize));
        this.createSingleCeilingZ(idx,vertexList,xBound,yBound.max,zDoorBound);
        meshIdx=this.finishMesh(doorBitmap,vertexList,true,null,false,constants.MESH_FLAG_DOOR);
        
        this.map.addOverlayDoor(xBound,zDoorBound);
        
            // and the movement
        
        movement=new MovementClass(meshIdx,false,(constants.ROOM_BLOCK_WIDTH*2));
        movement.addMove(new MoveClass(1500,new PointClass(0,0,0)));
        movement.addMove(new MoveClass(1500,new PointClass(0,-(constants.ROOM_FLOOR_HEIGHT-constants.ROOM_FLOOR_DEPTH),0)));
        
        this.map.addMovement(movement); 
    }

    createHallwayZ(xBound,yBound,zBound,doubleDoor)
    {
        let idx,meshCenterPoint,thickSize;
        let vertexList;
        let xHallwayBound,xThickBound,zFrameBound,frameBitmap;
        
        let roomBitmap=this.map.getTexture(constants.BITMAP_TYPE_WALL);
        
            // need a center point to better
            // create normals
            
        meshCenterPoint=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // doors need to be pushed in on
            // the edges so they have a wall thickness
            
        thickSize=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.05);
         
            // the door room
            // internal walls
            
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,zBound.max);
        idx=this.createSingleWallX(idx,vertexList,(xBound.min+thickSize),yBound,zBound);
        idx=this.createSingleWallX(idx,vertexList,(xBound.max-thickSize),yBound,zBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_WALL);

            // external walls

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        xThickBound=new BoundClass(xBound.min,(xBound.min+thickSize));
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.max);
        xThickBound=new BoundClass((xBound.max-thickSize),xBound.max);
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBound,zBound.max);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,false,constants.MESH_FLAG_ROOM_WALL);

           // the ceiling
           
        xHallwayBound=new BoundClass((xBound.min+thickSize),(xBound.max-thickSize));

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingZ(idx,vertexList,xHallwayBound,yBound.min,zBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_CEILING);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingZ(idx,vertexList,xHallwayBound,yBound.max,zBound);
        this.finishMesh(roomBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_FLOOR);
        
            // the door
        
        if (doubleDoor) {
            this.createHallwayDoorZ(xBound,yBound,(zBound.min+(thickSize*2)),thickSize);
            this.createHallwayDoorZ(xBound,yBound,(zBound.max-(thickSize*2)),thickSize);
        }
        else {
            this.createHallwayDoorZ(xBound,yBound,zBound.getMidPoint(),thickSize);
        }
        
            // the frame
            
        frameBitmap=this.map.getTexture(constants.BITMAP_TYPE_FRAME);
        
        zFrameBound=new BoundClass(zBound.min,zBound.min);
        this.map.meshList.add(MeshPrimitivesClass.createFrameZ(this.view,frameBitmap,xBound,yBound,zFrameBound,true,false,true));
        
        zFrameBound=new BoundClass(zBound.max,zBound.max);
        this.map.meshList.add(MeshPrimitivesClass.createFrameZ(this.view,frameBitmap,xBound,yBound,zFrameBound,false,false,true));
    }
}

