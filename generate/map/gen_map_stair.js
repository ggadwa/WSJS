import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import MapMeshClass from '../../code/map/map_mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';
import genRandom from '../../generate/utility/random.js';

//
// map stairs
//

export default class GenRoomStairsClass
{
    constructor(view,map,wallBitmap)
    {
        let genBitmap;
        
        this.view=view;
        this.map=map;
        this.wallBitmap=wallBitmap;
        
        Object.seal(this);
    }
    
        //
        // create a single wall in vertexes
        //
        
    createSingleWallX(idx,vertexList,x,yBoundBottom,yBoundTop,zBound)
    {
        vertexList[idx++].position.setFromValues(x,yBoundBottom.min,zBound.min);
        vertexList[idx++].position.setFromValues(x,yBoundTop.min,zBound.max);
        vertexList[idx++].position.setFromValues(x,yBoundTop.max,zBound.max);
        vertexList[idx++].position.setFromValues(x,yBoundBottom.max,zBound.min);
        return(idx);
    }
    
    createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,z)
    {
        vertexList[idx++].position.setFromValues(xBound.min,yBoundBottom.min,z);
        vertexList[idx++].position.setFromValues(xBound.max,yBoundTop.min,z);
        vertexList[idx++].position.setFromValues(xBound.max,yBoundTop.max,z);
        vertexList[idx++].position.setFromValues(xBound.min,yBoundBottom.max,z);
        return(idx);
    }
    
    createSingleCeilingX(idx,vertexList,xBound,yBoundBottom,yBoundTop,zBound)
    {
        vertexList[idx++].position.setFromValues(xBound.min,yBoundBottom.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBoundTop.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBoundTop.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBoundBottom.min,zBound.max);
        return(idx);
    }
    
    createSingleCeilingZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zBound)
    {
        vertexList[idx++].position.setFromValues(xBound.min,yBoundBottom.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.min,yBoundTop.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBoundTop.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBoundBottom.min,zBound.min);
        return(idx);
    }
    
        //
        // normal utilities
        //
        
    createNormalsForPolygon(nIdx,vertexList,nx,ny,nz)
    {
        let n;
        
        for (n=0;n!==4;n++) {
            vertexList[nIdx++].normal.setFromValues(nx,ny,nz);
        }
        
        return(nIdx);
    }
    
        //
        // utility routine to complete sets of
        // stair vertices into meshes
        //
        
    finishStairMesh(bitmap,vertexList,buildNormals,meshCenterPoint,normalsIn,flags)
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
        this.map.meshList.add(mesh);
    }

        //
        // create stairs
        //

    createStairsX(xBound,yBound,zBound,toPlatform,includeBack,flip)
    {
        let n,idx,stepAdd,yBoundFront,yBoundBack,nIdx;
        let vertexList;
        let xStepBound,yStepBound,yBoundTop,yBoundBottom,zStepBound,zThickBound;
        let meshCenterPoint,thickSize,stairHigh,stepDrop;
        let stairBitmap=this.map.getTexture(constants.BITMAP_TYPE_PLATFORM);
        
            // need a center point to better
            // create normals
            
        meshCenterPoint=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // stairs need to be pushed in on
            // the edges so they have a wall thickness
            
        thickSize=Math.trunc(zBound.getSize()*0.05);
        
            // height of stairs and steps
            
        stairHigh=yBound.getSize();
        stepDrop=stairHigh/constants.STAIR_STEP_COUNT;
        
            // the stair room

        if (!toPlatform) {
            
            if (!flip) {
                yBoundTop=yBound.copy();
                yBoundTop.add(-stairHigh);
                yBoundBottom=yBound;
            }
            else {
                yBoundTop=yBound;
                yBoundBottom=yBound.copy();
                yBoundBottom.add(-stairHigh);
            }
            
            yBoundTop.min+=constants.ROOM_FLOOR_DEPTH;
            yBoundBottom.min+=constants.ROOM_FLOOR_DEPTH;

                // internal walls

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(16);

            idx=this.createSingleWallX(idx,vertexList,xBound.min,yBoundTop,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertexList,xBound.max,yBoundBottom,yBoundBottom,zBound);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundTop,yBoundBottom,(zBound.min+thickSize));
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundTop,yBoundBottom,(zBound.max-thickSize));
            this.finishStairMesh(this.wallBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_WALL);
            
                // external walls

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(16);
            
            zThickBound=new BoundClass(zBound.min,(zBound.min+thickSize));
            idx=this.createSingleWallX(idx,vertexList,xBound.min,yBoundTop,yBoundTop,zThickBound);
            idx=this.createSingleWallX(idx,vertexList,xBound.max,yBoundBottom,yBoundBottom,zThickBound); 
            zThickBound=new BoundClass((zBound.max-thickSize),zBound.max);
            idx=this.createSingleWallX(idx,vertexList,xBound.min,yBoundTop,yBoundTop,zThickBound);
            idx=this.createSingleWallX(idx,vertexList,xBound.max,yBoundBottom,yBoundBottom,zThickBound);
            this.finishStairMesh(this.wallBitmap,vertexList,true,meshCenterPoint,false,constants.MESH_FLAG_ROOM_WALL);

               // the ceiling

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(4);

            zStepBound=new BoundClass((zBound.min+thickSize),(zBound.max-thickSize));
            this.createSingleCeilingX(idx,vertexList,xBound,yBoundTop,yBoundBottom,zStepBound);
            this.finishStairMesh(this.wallBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_CEILING);
        }
        
            // the stair edges
        
        if (toPlatform) {
            if (!flip) {
                yBoundTop=new BoundClass((yBound.max-stepDrop),yBound.max);
                yBoundBottom=new BoundClass((yBound.min-stepDrop),yBound.max);
            }
            else {
                yBoundTop=new BoundClass((yBound.min-stepDrop),yBound.max);
                yBoundBottom=new BoundClass((yBound.max-stepDrop),yBound.max);
            }
            
            yBoundFront=new BoundClass((yBound.max-stepDrop),yBound.max);
            yBoundBack=new BoundClass((yBound.max-stairHigh),yBound.max);
            
                // the edges
                
            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(20);
            
            zStepBound=new BoundClass(zBound.min,(zBound.min+thickSize));
            
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.max);
            idx=this.createSingleWallX(idx,vertexList,(flip?xBound.min:xBound.max),yBoundFront,yBoundFront,zStepBound);
            idx=this.createSingleWallX(idx,vertexList,(flip?xBound.max:xBound.min),yBoundBack,yBoundBack,zStepBound);
            this.createSingleCeilingX(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound);
            this.finishStairMesh(stairBitmap,vertexList,true,null,false,constants.MESH_FLAG_STAIR);

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(20);
            
            zStepBound=new BoundClass((zBound.max-thickSize),zBound.max);
            
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.max);
            idx=this.createSingleWallX(idx,vertexList,(flip?xBound.min:xBound.max),yBoundFront,yBoundFront,zStepBound);
            idx=this.createSingleWallX(idx,vertexList,(flip?xBound.max:xBound.min),yBoundBack,yBoundBack,zStepBound);
            this.createSingleCeilingX(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound);
            this.finishStairMesh(stairBitmap,vertexList,true,null,false,constants.MESH_FLAG_STAIR);
            
            if (includeBack) {
                idx=0;
                vertexList=MeshUtilityClass.createMapVertexList(4);
                
                zStepBound=new BoundClass((zBound.min+thickSize),(zBound.max-thickSize));

                this.createSingleWallX(idx,vertexList,(flip?xBound.max:xBound.min),yBoundBack,yBoundBack,zStepBound);
                this.finishStairMesh(stairBitmap,vertexList,true,meshCenterPoint,false,constants.MESH_FLAG_STAIR);
            }
        }
        
            // the steps
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList((constants.STAIR_STEP_COUNT*4)*2);
        
        nIdx=0;
        if (!flip) {
            stepAdd=xBound.getSize()/constants.STAIR_STEP_COUNT;
            xStepBound=new BoundClass(xBound.min,(xBound.min+stepAdd));
        }
        else {
            stepAdd=-(xBound.getSize()/constants.STAIR_STEP_COUNT);
            xStepBound=new BoundClass((xBound.max+stepAdd),xBound.max);
        }
        
        yStepBound=new BoundClass(yBound.min,(yBound.min+stepDrop));
        if (!toPlatform) yStepBound.add(-constants.ROOM_FLOOR_DEPTH);
        
        zStepBound=new BoundClass((zBound.min+thickSize),(zBound.max-thickSize));

        for (n=0;n!==constants.STAIR_STEP_COUNT;n++) {
            if (!flip) {
                idx=this.createSingleWallX(idx,vertexList,xStepBound.max,yStepBound,yStepBound,zStepBound);
                nIdx=this.createNormalsForPolygon(nIdx,vertexList,1.0,0.0,0.0);
            }
            else {
                idx=this.createSingleWallX(idx,vertexList,xStepBound.min,yStepBound,yStepBound,zStepBound);
                nIdx=this.createNormalsForPolygon(nIdx,vertexList,-1.0,0.0,0.0);
            }
            
            idx=this.createSingleCeilingX(idx,vertexList,xStepBound,yStepBound,yStepBound,zStepBound);
            nIdx=this.createNormalsForPolygon(nIdx,vertexList,0.0,-1.0,0.0);
           
            yStepBound.add(stepDrop);
            xStepBound.add(stepAdd);
        }
        
        this.finishStairMesh(stairBitmap,vertexList,false,meshCenterPoint,true,constants.MESH_FLAG_STAIR);
        
            // overlay
            
        this.map.overlay.addStair(xBound,zBound);
    }

    createStairsZ(xBound,yBound,zBound,toPlatform,includeBack,flip)
    {
        let n,idx,stepAdd,yBoundFront,yBoundBack,nIdx;
        let vertexList,meshCenterPoint,thickSize,stairHigh,stepDrop;
        let xStepBound,yStepBound,yBoundTop,yBoundBottom,zStepBound,xThickBound;
        let stairBitmap=this.map.getTexture(constants.BITMAP_TYPE_PLATFORM);
        
            // need a center point to better
            // create normals
            
        meshCenterPoint=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // stairs need to be pushed in on
            // the edges so they have a wall thickness
            
        thickSize=Math.trunc(zBound.getSize()*0.05);
        
            // height of stairs and steps
            
        stairHigh=yBound.getSize();
        stepDrop=stairHigh/constants.STAIR_STEP_COUNT;
        
            // the stair room
            
        if (!toPlatform) {
            
            if (!flip) {
                yBoundTop=yBound.copy();
                yBoundTop.add(-stairHigh);
                yBoundBottom=yBound;
            }
            else {
                yBoundTop=yBound;
                yBoundBottom=yBound.copy();
                yBoundBottom.add(-stairHigh);
            }
            
            yBoundTop.min+=constants.ROOM_FLOOR_DEPTH;
            yBoundBottom.min+=constants.ROOM_FLOOR_DEPTH;

                // internal walls

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(16);

            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundBottom,zBound.max);
            idx=this.createSingleWallX(idx,vertexList,(xBound.min+thickSize),yBoundTop,yBoundBottom,zBound);
            idx=this.createSingleWallX(idx,vertexList,(xBound.max-thickSize),yBoundTop,yBoundBottom,zBound);
            this.finishStairMesh(this.wallBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_WALL);

                // external walls
            
            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(16);
            
            xThickBound=new BoundClass(xBound.min,(xBound.min+thickSize));
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundBottom,yBoundBottom,zBound.max);
            xThickBound=new BoundClass((xBound.max-thickSize),xBound.max);
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundBottom,yBoundBottom,zBound.max);
            this.finishStairMesh(this.wallBitmap,vertexList,true,meshCenterPoint,false,constants.MESH_FLAG_ROOM_WALL);
           
               // the ceiling

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(4);

            xStepBound=new BoundClass((xBound.min+thickSize),(xBound.max-thickSize));
            this.createSingleCeilingZ(idx,vertexList,xStepBound,yBoundTop,yBoundBottom,zBound);
            this.finishStairMesh(this.wallBitmap,vertexList,true,meshCenterPoint,true,constants.MESH_FLAG_ROOM_CEILING);
        }
        
            // the stair edges
        
        if (toPlatform) {
            if (!flip) {
                yBoundTop=new BoundClass((yBound.max-stepDrop),yBound.max);
                yBoundBottom=new BoundClass((yBound.min-stepDrop),yBound.max);
            }
            else {
                yBoundTop=new BoundClass((yBound.min-stepDrop),yBound.max);
                yBoundBottom=new BoundClass((yBound.max-stepDrop),yBound.max);
            }
            
            yBoundFront=new BoundClass((yBound.max-stepDrop),yBound.max);
            yBoundBack=new BoundClass((yBound.max-stairHigh),yBound.max);
            
                // the edges
                
            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(20);
            
            xStepBound=new BoundClass(xBound.min,(xBound.min+thickSize));
            
            idx=this.createSingleWallX(idx,vertexList,xStepBound.min,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertexList,xStepBound.max,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallZ(idx,vertexList,xStepBound,yBoundFront,yBoundFront,(flip?zBound.min:zBound.max));
            idx=this.createSingleWallZ(idx,vertexList,xStepBound,yBoundBack,yBoundBack,(flip?zBound.max:zBound.min));
            this.createSingleCeilingZ(idx,vertexList,xStepBound,yBoundBottom,yBoundTop,zBound);
            this.finishStairMesh(stairBitmap,vertexList,true,null,false,constants.MESH_FLAG_STAIR);
            
            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(20);
            
            xStepBound=new BoundClass((xBound.max-thickSize),xBound.max);
            
            idx=this.createSingleWallX(idx,vertexList,xStepBound.min,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertexList,xStepBound.max,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallZ(idx,vertexList,xStepBound,yBoundFront,yBoundFront,(flip?zBound.min:zBound.max));
            idx=this.createSingleWallZ(idx,vertexList,xStepBound,yBoundBack,yBoundBack,(flip?zBound.max:zBound.min));
            this.createSingleCeilingZ(idx,vertexList,xStepBound,yBoundBottom,yBoundTop,zBound);
            this.finishStairMesh(stairBitmap,vertexList,true,null,false,constants.MESH_FLAG_STAIR);
            
            if (includeBack) {
                idx=0;
                vertexList=MeshUtilityClass.createMapVertexList(4);

                xStepBound=new BoundClass((xBound.min+thickSize),(xBound.max-thickSize));

                this.createSingleWallZ(idx,vertexList,xStepBound,yBoundBack,yBoundBack,(flip?zBound.max:zBound.min));
                this.finishStairMesh(stairBitmap,vertexList,true,meshCenterPoint,false,constants.MESH_FLAG_STAIR);
            }
        }
        
            // the steps
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList((constants.STAIR_STEP_COUNT*4)*2);
        
        nIdx=0;
        if (!flip) {
            stepAdd=zBound.getSize()/constants.STAIR_STEP_COUNT;
            zStepBound=new BoundClass(zBound.min,(zBound.min+stepAdd));

        }
        else {
            stepAdd=-(zBound.getSize()/constants.STAIR_STEP_COUNT);
            zStepBound=new BoundClass((zBound.max+stepAdd),zBound.max);
        }
        
        yStepBound=new BoundClass(yBound.min,(yBound.min+stepDrop));
        if (!toPlatform) yStepBound.add(-constants.ROOM_FLOOR_DEPTH);
        
        xStepBound=new BoundClass((xBound.min+thickSize),(xBound.max-thickSize));

        for (n=0;n!==constants.STAIR_STEP_COUNT;n++) {
            if (!flip) {
                idx=this.createSingleWallZ(idx,vertexList,xStepBound,yStepBound,yStepBound,zStepBound.max);
                nIdx=this.createNormalsForPolygon(nIdx,vertexList,0.0,0.0,1.0);
            }
            else {
                idx=this.createSingleWallZ(idx,vertexList,xStepBound,yStepBound,yStepBound,zStepBound.min);
                nIdx=this.createNormalsForPolygon(nIdx,vertexList,0.0,0.0,-1.0);
            }
            
            idx=this.createSingleCeilingZ(idx,vertexList,xStepBound,yStepBound,yStepBound,zStepBound);
            nIdx=this.createNormalsForPolygon(nIdx,vertexList,0.0,-1.0,0.0);
           
            yStepBound.add(stepDrop);
            zStepBound.add(stepAdd);
        }
        
        this.finishStairMesh(stairBitmap,vertexList,false,meshCenterPoint,true,constants.MESH_FLAG_STAIR);
        
            // overlay
            
        this.map.overlay.addStair(xBound,zBound);
    }
    
    createStairsExtension(room)
    {
        let x,z,min,max;
        let xBound,yBound,zBound;
        
            // find place for stairs based on connection side
            
        switch (room.mainPathSide) {

            case constants.ROOM_SIDE_RIGHT:
                x=room.mainPathConnectedRoom.xBlockSize-1;
                break;

            case constants.ROOM_SIDE_BOTTOM:
                z=room.mainPathConnectedRoom.zBlockSize-1;
                break;

            case constants.ROOM_SIDE_LEFT:
                x=0;
                break;

            case constants.ROOM_SIDE_TOP:
                z=0;
                break;

        }
        
        if ((room.mainPathSide===constants.ROOM_SIDE_LEFT) || (room.mainPathSide===constants.ROOM_SIDE_RIGHT)) {
            min=0;
            if (room.zBound.min>room.mainPathConnectedRoom.zBound.min) min=Math.trunc((room.zBound.min-room.mainPathConnectedRoom.zBound.min)/constants.ROOM_BLOCK_WIDTH);
            
            max=room.zBlockSize;
            if (room.zBound.max<room.mainPathConnectedRoom.zBound.max) max=Math.trunc((room.zBound.max-room.mainPathConnectedRoom.zBound.min)/constants.ROOM_BLOCK_WIDTH);
            
            z=genRandom.randomInBetween(min,(max-1));
        }
        else {
            min=0;
            if (room.xBound.min>room.mainPathConnectedRoom.xBound.min) min=Math.trunc((room.xBound.min-room.mainPathConnectedRoom.xBound.min)/constants.ROOM_BLOCK_WIDTH);
            
            max=room.xBlockSize;
            if (room.xBound.max<room.mainPathConnectedRoom.xBound.max) max=Math.trunc((room.xBound.max-room.mainPathConnectedRoom.xBound.min)/constants.ROOM_BLOCK_WIDTH);
            
            x=genRandom.randomInBetween(min,(max-1));
        }
        
            // create stairs
       
        xBound=new BoundClass((room.mainPathConnectedRoom.xBound.min+(x*constants.ROOM_BLOCK_WIDTH)),(room.mainPathConnectedRoom.xBound.min+((x+1)*constants.ROOM_BLOCK_WIDTH)));
        yBound=new BoundClass(room.yBound.max,room.mainPathConnectedRoom.yBound.max);
        zBound=new BoundClass((room.mainPathConnectedRoom.zBound.min+(z*constants.ROOM_BLOCK_WIDTH)),(room.mainPathConnectedRoom.zBound.min+((z+1)*constants.ROOM_BLOCK_WIDTH)));
        
        if ((room.mainPathSide===constants.ROOM_SIDE_LEFT) || (room.mainPathSide===constants.ROOM_SIDE_RIGHT)) {
            this.createStairsX(xBound,yBound,zBound,true,false,(room.mainPathSide===constants.ROOM_SIDE_RIGHT));
        }
        else {
            this.createStairsZ(xBound,yBound,zBound,true,false,(room.mainPathSide===constants.ROOM_SIDE_BOTTOM));
        }
        
            // block off from decorations
            
        room.mainPathConnectedRoom.setBlockGrid(0,x,z);
    }
}

