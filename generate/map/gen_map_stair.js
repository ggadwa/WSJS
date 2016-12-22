/* global MeshUtilityClass, config, map, MeshPrimitivesClass */

"use strict";

//
// map stairs
//

class GenRoomStairsClass
{
    constructor()
    {
        this.STAIR_STEP_COUNT=10;
        
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

        mesh=new MapMeshClass(bitmap,vertexList,indexes,flags);        
        map.addMesh(mesh);
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
        
        let roomBitmap=map.getTexture(map.TEXTURE_TYPE_WALL);
        let stairBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        
            // need a center point to better
            // create normals
            
        meshCenterPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // stairs need to be pushed in on
            // the edges so they have a wall thickness
            
        thickSize=Math.trunc(zBound.getSize()*0.05);
        
            // height of stairs and steps
            
        stairHigh=yBound.getSize();
        stepDrop=stairHigh/this.STAIR_STEP_COUNT;
        
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
            
            yBoundTop.min+=map.ROOM_FLOOR_DEPTH;
            yBoundBottom.min+=map.ROOM_FLOOR_DEPTH;

                // internal walls

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(16);

            idx=this.createSingleWallX(idx,vertexList,xBound.min,yBoundTop,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertexList,xBound.max,yBoundBottom,yBoundBottom,zBound);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundTop,yBoundBottom,(zBound.min+thickSize));
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundTop,yBoundBottom,(zBound.max-thickSize));
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,true,map.MESH_FLAG_ROOM_WALL);
            
                // external walls

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(16);
            
            zThickBound=new wsBound(zBound.min,(zBound.min+thickSize));
            idx=this.createSingleWallX(idx,vertexList,xBound.min,yBoundTop,yBoundTop,zThickBound);
            idx=this.createSingleWallX(idx,vertexList,xBound.max,yBoundBottom,yBoundBottom,zThickBound); 
            zThickBound=new wsBound((zBound.max-thickSize),zBound.max);
            idx=this.createSingleWallX(idx,vertexList,xBound.min,yBoundTop,yBoundTop,zThickBound);
            idx=this.createSingleWallX(idx,vertexList,xBound.max,yBoundBottom,yBoundBottom,zThickBound);
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,false,map.MESH_FLAG_ROOM_WALL);

               // the ceiling

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(4);

            zStepBound=new wsBound((zBound.min+thickSize),(zBound.max-thickSize));
            this.createSingleCeilingX(idx,vertexList,xBound,yBoundTop,yBoundBottom,zStepBound);
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,true,map.MESH_FLAG_ROOM_CEILING);
        }
        
            // the stair edges
        
        if (toPlatform) {
            if (!flip) {
                yBoundTop=new wsBound((yBound.max-stepDrop),yBound.max);
                yBoundBottom=new wsBound((yBound.min-stepDrop),yBound.max);
            }
            else {
                yBoundTop=new wsBound((yBound.min-stepDrop),yBound.max);
                yBoundBottom=new wsBound((yBound.max-stepDrop),yBound.max);
            }
            
            yBoundFront=new wsBound((yBound.max-stepDrop),yBound.max);
            yBoundBack=new wsBound((yBound.max-stairHigh),yBound.max);
            
                // the edges
                
            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(20);
            
            zStepBound=new wsBound(zBound.min,(zBound.min+thickSize));
            
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.max);
            idx=this.createSingleWallX(idx,vertexList,(flip?xBound.min:xBound.max),yBoundFront,yBoundFront,zStepBound);
            idx=this.createSingleWallX(idx,vertexList,(flip?xBound.max:xBound.min),yBoundBack,yBoundBack,zStepBound);
            this.createSingleCeilingX(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound);
            this.finishStairMesh(stairBitmap,vertexList,true,null,false,map.MESH_FLAG_STAIR);

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(20);
            
            zStepBound=new wsBound((zBound.max-thickSize),zBound.max);
            
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.max);
            idx=this.createSingleWallX(idx,vertexList,(flip?xBound.min:xBound.max),yBoundFront,yBoundFront,zStepBound);
            idx=this.createSingleWallX(idx,vertexList,(flip?xBound.max:xBound.min),yBoundBack,yBoundBack,zStepBound);
            this.createSingleCeilingX(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound);
            this.finishStairMesh(stairBitmap,vertexList,true,null,false,map.MESH_FLAG_STAIR);
            
            if (includeBack) {
                idx=0;
                vertexList=MeshUtilityClass.createMapVertexList(4);
                
                zStepBound=new wsBound((zBound.min+thickSize),(zBound.max-thickSize));

                this.createSingleWallX(idx,vertexList,(flip?xBound.max:xBound.min),yBoundBack,yBoundBack,zStepBound);
                this.finishStairMesh(stairBitmap,vertexList,true,meshCenterPoint,false,map.MESH_FLAG_STAIR);
            }
        }
        
            // the steps
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList((this.STAIR_STEP_COUNT*4)*2);
        
        nIdx=0;
        if (!flip) {
            stepAdd=xBound.getSize()/this.STAIR_STEP_COUNT;
            xStepBound=new wsBound(xBound.min,(xBound.min+stepAdd));
        }
        else {
            stepAdd=-(xBound.getSize()/this.STAIR_STEP_COUNT);
            xStepBound=new wsBound((xBound.max+stepAdd),xBound.max);
        }
        
        yStepBound=new wsBound(yBound.min,(yBound.min+stepDrop));
        if (!toPlatform) yStepBound.add(-map.ROOM_FLOOR_DEPTH);
        
        zStepBound=new wsBound((zBound.min+thickSize),(zBound.max-thickSize));

        for (n=0;n!==this.STAIR_STEP_COUNT;n++) {
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
        
        this.finishStairMesh(stairBitmap,vertexList,false,meshCenterPoint,true,map.MESH_FLAG_STAIR);
    }

    createStairsZ(xBound,yBound,zBound,toPlatform,includeBack,flip)
    {
        let n,idx,stepAdd,yBoundFront,yBoundBack,nIdx;
        let vertexList,meshCenterPoint,thickSize,stairHigh,stepDrop;
        let xStepBound,yStepBound,yBoundTop,yBoundBottom,zStepBound,xThickBound;
        let roomBitmap=map.getTexture(map.TEXTURE_TYPE_WALL);
        let stairBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        
            // need a center point to better
            // create normals
            
        meshCenterPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // stairs need to be pushed in on
            // the edges so they have a wall thickness
            
        thickSize=Math.trunc(zBound.getSize()*0.05);
        
            // height of stairs and steps
            
        stairHigh=yBound.getSize();
        stepDrop=stairHigh/this.STAIR_STEP_COUNT;
        
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
            
            yBoundTop.min+=map.ROOM_FLOOR_DEPTH;
            yBoundBottom.min+=map.ROOM_FLOOR_DEPTH;

                // internal walls

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(16);

            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundBottom,zBound.max);
            idx=this.createSingleWallX(idx,vertexList,(xBound.min+thickSize),yBoundTop,yBoundBottom,zBound);
            idx=this.createSingleWallX(idx,vertexList,(xBound.max-thickSize),yBoundTop,yBoundBottom,zBound);
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,true,map.MESH_FLAG_ROOM_WALL);

                // external walls
            
            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(16);
            
            xThickBound=new wsBound(xBound.min,(xBound.min+thickSize));
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundBottom,yBoundBottom,zBound.max);
            xThickBound=new wsBound((xBound.max-thickSize),xBound.max);
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundBottom,yBoundBottom,zBound.max);
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,false,map.MESH_FLAG_ROOM_WALL);
           
               // the ceiling

            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(4);

            xStepBound=new wsBound((xBound.min+thickSize),(xBound.max-thickSize));
            this.createSingleCeilingZ(idx,vertexList,xStepBound,yBoundTop,yBoundBottom,zBound);
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,true,map.MESH_FLAG_ROOM_CEILING);
        }
        
            // the stair edges
        
        if (toPlatform) {
            if (!flip) {
                yBoundTop=new wsBound((yBound.max-stepDrop),yBound.max);
                yBoundBottom=new wsBound((yBound.min-stepDrop),yBound.max);
            }
            else {
                yBoundTop=new wsBound((yBound.min-stepDrop),yBound.max);
                yBoundBottom=new wsBound((yBound.max-stepDrop),yBound.max);
            }
            
            yBoundFront=new wsBound((yBound.max-stepDrop),yBound.max);
            yBoundBack=new wsBound((yBound.max-stairHigh),yBound.max);
            
                // the edges
                
            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(20);
            
            xStepBound=new wsBound(xBound.min,(xBound.min+thickSize));
            
            idx=this.createSingleWallX(idx,vertexList,xStepBound.min,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertexList,xStepBound.max,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallZ(idx,vertexList,xStepBound,yBoundFront,yBoundFront,(flip?zBound.min:zBound.max));
            idx=this.createSingleWallZ(idx,vertexList,xStepBound,yBoundBack,yBoundBack,(flip?zBound.max:zBound.min));
            this.createSingleCeilingZ(idx,vertexList,xStepBound,yBoundBottom,yBoundTop,zBound);
            this.finishStairMesh(stairBitmap,vertexList,true,null,false,map.MESH_FLAG_STAIR);
            
            idx=0;
            vertexList=MeshUtilityClass.createMapVertexList(includeBack?20:16);
            
            xStepBound=new wsBound((xBound.max-thickSize),xBound.max);
            
            idx=this.createSingleWallX(idx,vertexList,xStepBound.min,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertexList,xStepBound.max,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallZ(idx,vertexList,xStepBound,yBoundFront,yBoundFront,(flip?zBound.min:zBound.max));
            idx=this.createSingleWallZ(idx,vertexList,xStepBound,yBoundBack,yBoundBack,(flip?zBound.max:zBound.min));
            this.createSingleCeilingZ(idx,vertexList,xStepBound,yBoundBottom,yBoundTop,zBound);
            this.finishStairMesh(stairBitmap,vertexList,true,null,false,map.MESH_FLAG_STAIR);
            
            if (includeBack) {
                idx=0;
                vertexList=MeshUtilityClass.createMapVertexList(includeBack?20:16);

                xStepBound=new wsBound((xBound.min+thickSize),(xBound.max-thickSize));

                this.createSingleWallZ(idx,vertexList,xStepBound,yBoundBack,yBoundBack,(flip?zBound.max:zBound.min));
                this.finishStairMesh(stairBitmap,vertexList,true,meshCenterPoint,false,map.MESH_FLAG_STAIR);
            }
        }
        
            // the steps
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList((this.STAIR_STEP_COUNT*4)*2);
        
        nIdx=0;
        if (!flip) {
            stepAdd=zBound.getSize()/this.STAIR_STEP_COUNT;
            zStepBound=new wsBound(zBound.min,(zBound.min+stepAdd));

        }
        else {
            stepAdd=-(zBound.getSize()/this.STAIR_STEP_COUNT);
            zStepBound=new wsBound((zBound.max+stepAdd),zBound.max);
        }
        
        yStepBound=new wsBound(yBound.min,(yBound.min+stepDrop));
        if (!toPlatform) yStepBound.add(-map.ROOM_FLOOR_DEPTH);
        
        xStepBound=new wsBound((xBound.min+thickSize),(xBound.max-thickSize));

        for (n=0;n!==this.STAIR_STEP_COUNT;n++) {
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
        
        this.finishStairMesh(stairBitmap,vertexList,false,meshCenterPoint,true,map.MESH_FLAG_STAIR);
    }
}

