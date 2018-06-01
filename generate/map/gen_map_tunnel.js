import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import MapMeshClass from '../../code/map/map_mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';

//
// map tunnels
//

export default class GenRoomTunnelClass
{
    constructor(view,map,tunnelBitmap,floorBitmap)
    {
        this.view=view;
        this.map=map;
        
        this.tunnelBitmap=tunnelBitmap;
        this.floorBitmap=floorBitmap;
        
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
        // create tunnels
        //

    createTunnelX(xBound,yBound,zBound)
    {
        let idx,meshCenterPoint;
        let vertexList;
        let zTunnelBound;
        
            // need a center point to better
            // create normals
            
        meshCenterPoint=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // the door room
            // internal walls

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        idx=this.createSingleWallX(idx,vertexList,xBound.min,yBound,zBound);
        idx=this.createSingleWallX(idx,vertexList,xBound.max,yBound,zBound);
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,zBound.max);
        this.finishMesh(this.tunnelBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_TUNNEL);

           // the ceiling and floor

        zTunnelBound=new BoundClass(zBound.min,zBound.max);

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingX(idx,vertexList,xBound,yBound.min,zTunnelBound);
        this.finishMesh(this.tunnelBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_CEILING);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingX(idx,vertexList,xBound,yBound.max,zTunnelBound);
        this.finishMesh(this.floorBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_FLOOR);
    }
    
    createTunnelZ(xBound,yBound,zBound)
    {
        let idx,meshCenterPoint;
        let vertexList;
        let xTunnelBound;
        
            // need a center point to better
            // create normals
            
        meshCenterPoint=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // the door room
            // internal walls
     
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(16);

        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertexList,xBound,yBound,zBound.max);
        idx=this.createSingleWallX(idx,vertexList,xBound.min,yBound,zBound);
        idx=this.createSingleWallX(idx,vertexList,xBound.max,yBound,zBound);
        this.finishMesh(this.tunnelBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_TUNNEL);

           // the ceiling
           
        xTunnelBound=new BoundClass(xBound.min,xBound.max);

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingZ(idx,vertexList,xTunnelBound,yBound.min,zBound);
        this.finishMesh(this.tunnelBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_CEILING);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(4);
        this.createSingleCeilingZ(idx,vertexList,xTunnelBound,yBound.max,zBound);
        this.finishMesh(this.floorBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_FLOOR);
    }
}

