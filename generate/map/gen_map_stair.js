"use strict";

//
// map stairs
//

function GenRoomStairs(map,genRandom)
{
    this.map=map;
    this.genRandom=genRandom;
    
        // constants
        
    this.STEP_COUNT=10;
    
        //
        // create a single wall in vertexes
        //
        
    this.createSingleWallX=function(idx,vertices,x,yBoundBottom,yBoundTop,zBound)
    {
        vertices[idx++]=x;
        vertices[idx++]=yBoundBottom.min;
        vertices[idx++]=zBound.min;
        vertices[idx++]=x;
        vertices[idx++]=yBoundTop.min;
        vertices[idx++]=zBound.max;
        vertices[idx++]=x;
        vertices[idx++]=yBoundTop.max;
        vertices[idx++]=zBound.max;
        vertices[idx++]=x;
        vertices[idx++]=yBoundBottom.max;
        vertices[idx++]=zBound.min;
        
        return(idx);
    };
    
    this.createSingleWallZ=function(idx,vertices,xBound,yBoundBottom,yBoundTop,z)
    {
        vertices[idx++]=xBound.min;
        vertices[idx++]=yBoundBottom.min;
        vertices[idx++]=z;
        vertices[idx++]=xBound.max;
        vertices[idx++]=yBoundTop.min;
        vertices[idx++]=z;
        vertices[idx++]=xBound.max;
        vertices[idx++]=yBoundTop.max;
        vertices[idx++]=z;
        vertices[idx++]=xBound.min;
        vertices[idx++]=yBoundBottom.max;
        vertices[idx++]=z;

        return(idx);
    };
    
    this.createSingleCeilingX=function(idx,vertices,xBound,yBoundBottom,yBoundTop,zBound)
    {
        vertices[idx++]=xBound.min;
        vertices[idx++]=yBoundBottom.min;
        vertices[idx++]=zBound.min;
        vertices[idx++]=xBound.max;
        vertices[idx++]=yBoundTop.min;
        vertices[idx++]=zBound.min;
        vertices[idx++]=xBound.max;
        vertices[idx++]=yBoundTop.min;
        vertices[idx++]=zBound.max;
        vertices[idx++]=xBound.min;
        vertices[idx++]=yBoundBottom.min;
        vertices[idx++]=zBound.max;
        
        return(idx);
    };
    
    this.createSingleCeilingZ=function(idx,vertices,xBound,yBoundBottom,yBoundTop,zBound)
    {
        vertices[idx++]=xBound.min;
        vertices[idx++]=yBoundBottom.min;
        vertices[idx++]=zBound.min;
        vertices[idx++]=xBound.min;
        vertices[idx++]=yBoundTop.min;
        vertices[idx++]=zBound.max;
        vertices[idx++]=xBound.max;
        vertices[idx++]=yBoundTop.min;
        vertices[idx++]=zBound.max;
        vertices[idx++]=xBound.max;
        vertices[idx++]=yBoundBottom.min;
        vertices[idx++]=zBound.min;
        
        return(idx);
    };
    
        //
        // normal utilities
        //
        
    this.createNormalsForPolygon=function(nIdx,normals,nx,ny,nz)
    {
        var n;
        
        for (n=0;n!==4;n++) {
            normals[nIdx++]=nx;
            normals[nIdx++]=ny;
            normals[nIdx++]=nz;
        }
        
        return(nIdx);
    };
    
        //
        // utility routine to complete sets of
        // stair vertices into meshes
        //
        
    this.finishStairMesh=function(bitmap,vertices,normals,normalsIn,flags)
    {
            // build the indexes
            // everything we build is a quad so
            // we have 6 * # of quads in indexes
            
        var n;
        var iCount=Math.floor(Math.floor(vertices.length/3)/4)*6;

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
               
        var calcNormals;
        if (normals!==null) {
            calcNormals=normals;
        }
        else {
            calcNormals=meshUtility.buildMapMeshNormals(vertices,indexes,normalsIn);
        }
        
        var uvs=meshUtility.buildMapMeshUVs(bitmap,vertices,calcNormals);
        var tangents=meshUtility.buildMapMeshTangents(vertices,uvs,indexes);

        var mesh=new MapMeshObject(bitmap,null,vertices,calcNormals,tangents,uvs,indexes,flags);        
        this.map.addMesh(mesh);
    };

        //
        // create stairs
        //

    this.createStairsX=function(roomBitmap,stairBitmap,xBound,yBound,zBound,toPlatform,includeBack,flip)
    {
        var n,idx,stepAdd;
        var vertices;
        var xStepBound,yStepBound,yBoundTop,yBoundBottom,zStepBound,zThickBound;
        
            // stairs need to be pushed in on
            // the edges so they have a wall thickness
            
        var thickSize=Math.floor(zBound.getSize()*0.05);
        
            // height of stairs and steps
            
        var stairHigh=yBound.getSize();
        var stepDrop=stairHigh/this.STEP_COUNT;
        
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
            
            yBoundTop.min+=settings.roomFloorDepth;
            yBoundBottom.min+=settings.roomFloorDepth;

                // internal walls

            idx=0;
            vertices=new Float32Array(48);

            idx=this.createSingleWallX(idx,vertices,xBound.min,yBoundTop,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertices,xBound.max,yBoundBottom,yBoundBottom,zBound);
            idx=this.createSingleWallZ(idx,vertices,xBound,yBoundTop,yBoundBottom,(zBound.min+thickSize));
            idx=this.createSingleWallZ(idx,vertices,xBound,yBoundTop,yBoundBottom,(zBound.max-thickSize));
            this.finishStairMesh(roomBitmap,vertices,null,true,this.map.MESH_FLAG_ROOM_WALL);
            
                // external walls
  
            idx=0;
            vertices=new Float32Array(48);
            
            zThickBound=new wsBound(zBound.min,(zBound.min+thickSize));
            idx=this.createSingleWallX(idx,vertices,xBound.min,yBoundTop,yBoundTop,zThickBound);
            idx=this.createSingleWallX(idx,vertices,xBound.max,yBoundBottom,yBoundBottom,zThickBound); 
            zThickBound=new wsBound((zBound.max-thickSize),zBound.max);
            idx=this.createSingleWallX(idx,vertices,xBound.min,yBoundTop,yBoundTop,zThickBound);
            idx=this.createSingleWallX(idx,vertices,xBound.max,yBoundBottom,yBoundBottom,zThickBound);
            this.finishStairMesh(roomBitmap,vertices,null,false,this.map.MESH_FLAG_ROOM_WALL);

               // the ceiling

            idx=0;
            vertices=new Float32Array(12);

            zStepBound=new wsBound((zBound.min+thickSize),(zBound.max-thickSize));
            this.createSingleCeilingX(idx,vertices,xBound,yBoundTop,yBoundBottom,zStepBound);
            this.finishStairMesh(roomBitmap,vertices,null,true,this.map.MESH_FLAG_ROOM_CEILING);
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
            
            var yBoundFront=new wsBound((yBound.max-stepDrop),yBound.max);
            
                // the edges
                
            idx=0;
            vertices=new Float32Array(48);
            
            zStepBound=new wsBound(zBound.min,(zBound.min+thickSize));
            
            idx=this.createSingleWallZ(idx,vertices,xBound,yBoundBottom,yBoundTop,zStepBound.min);
            idx=this.createSingleWallZ(idx,vertices,xBound,yBoundBottom,yBoundTop,zStepBound.max);
            idx=this.createSingleWallX(idx,vertices,(flip?xBound.min:xBound.max),yBoundFront,yBoundFront,zStepBound);
            this.createSingleCeilingX(idx,vertices,xBound,yBoundBottom,yBoundTop,zStepBound);
            this.finishStairMesh(stairBitmap,vertices,null,false,this.map.MESH_FLAG_STAIR);
            
            idx=0;
            vertices=new Float32Array(48);
            
            zStepBound=new wsBound((zBound.max-thickSize),zBound.max);
            
            idx=this.createSingleWallZ(idx,vertices,xBound,yBoundBottom,yBoundTop,zStepBound.min);
            idx=this.createSingleWallZ(idx,vertices,xBound,yBoundBottom,yBoundTop,zStepBound.max);
            idx=this.createSingleWallX(idx,vertices,(flip?xBound.min:xBound.max),yBoundFront,yBoundFront,zStepBound);
            this.createSingleCeilingX(idx,vertices,xBound,yBoundBottom,yBoundTop,zStepBound);
            this.finishStairMesh(stairBitmap,vertices,null,false,this.map.MESH_FLAG_STAIR);
            
                // the behind box brace
            
            if (includeBack) {
                var xBraceBound;
                var braceSize=Math.floor(xBound.getSize()*0.4);

                if (!flip) {
                    xBraceBound=new wsBound((xBound.min-braceSize),xBound.min);
                }
                else {
                    xBraceBound=new wsBound(xBound.max,(xBound.max+braceSize));
                }
                this.map.addMesh(meshPrimitives.createMeshCube(stairBitmap,xBraceBound,yBound,zBound,false,!flip,flip,true,true,false,false,this.map.MESH_FLAG_STAIR));
            }
        }
        
            // the steps
        
        idx=0;
        vertices=new Float32Array(((this.STEP_COUNT*4)*3)*2);
        var normals=new Float32Array(((this.STEP_COUNT*4)*3)*2);
        
        var nIdx=0;
        if (!flip) {
            stepAdd=xBound.getSize()/this.STEP_COUNT;
            xStepBound=new wsBound(xBound.min,(xBound.min+stepAdd));
        }
        else {
            stepAdd=-(xBound.getSize()/this.STEP_COUNT);
            xStepBound=new wsBound((xBound.max+stepAdd),xBound.max);
        }
        
        yStepBound=new wsBound(yBound.min,(yBound.min+stepDrop));
        if (!toPlatform) yStepBound.add(-settings.roomFloorDepth);
        
        zStepBound=new wsBound((zBound.min+thickSize),(zBound.max-thickSize));
        
        for (n=0;n!==this.STEP_COUNT;n++) {
            if (!flip) {
                idx=this.createSingleWallX(idx,vertices,xStepBound.max,yStepBound,yStepBound,zStepBound);
                nIdx=this.createNormalsForPolygon(nIdx,normals,1.0,0.0,0.0);
            }
            else {
                idx=this.createSingleWallX(idx,vertices,xStepBound.min,yStepBound,yStepBound,zStepBound);
                nIdx=this.createNormalsForPolygon(nIdx,normals,-1.0,0.0,0.0);
            }
            
            idx=this.createSingleCeilingX(idx,vertices,xStepBound,yStepBound,yStepBound,zStepBound);
            nIdx=this.createNormalsForPolygon(nIdx,normals,0.0,-1.0,0.0);
           
            yStepBound.add(stepDrop);
            xStepBound.add(stepAdd);
        }
        
        this.finishStairMesh(stairBitmap,vertices,normals,true,this.map.MESH_FLAG_STAIR);
    };

    this.createStairsZ=function(roomBitmap,stairBitmap,xBound,yBound,zBound,toPlatform,includeBack,flip)
    {
        var n,idx,stepAdd;
        var vertices;
        var xStepBound,yStepBound,yBoundTop,yBoundBottom,zStepBound,xThickBound;
        
            // stairs need to be pushed in on
            // the edges so they have a wall thickness
            
        var thickSize=Math.floor(zBound.getSize()*0.05);
        
            // height of stairs and steps
            
        var stairHigh=yBound.getSize();
        var stepDrop=stairHigh/this.STEP_COUNT;
        
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
            
            yBoundTop.min+=settings.roomFloorDepth;
            yBoundBottom.min+=settings.roomFloorDepth;

                // internal walls

            idx=0;
            vertices=new Float32Array(48);

            idx=this.createSingleWallZ(idx,vertices,xBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertices,xBound,yBoundBottom,yBoundBottom,zBound.max);
            idx=this.createSingleWallX(idx,vertices,(xBound.min+thickSize),yBoundTop,yBoundBottom,zBound);
            idx=this.createSingleWallX(idx,vertices,(xBound.max-thickSize),yBoundTop,yBoundBottom,zBound);
            this.finishStairMesh(roomBitmap,vertices,null,true,this.map.MESH_FLAG_ROOM_WALL);

                // external walls
            
            idx=0;
            vertices=new Float32Array(48);
            
            xThickBound=new wsBound(xBound.min,(xBound.min+thickSize));
            idx=this.createSingleWallZ(idx,vertices,xThickBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertices,xThickBound,yBoundBottom,yBoundBottom,zBound.max);
            xThickBound=new wsBound((xBound.max-thickSize),xBound.max);
            idx=this.createSingleWallZ(idx,vertices,xThickBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertices,xThickBound,yBoundBottom,yBoundBottom,zBound.max);
            this.finishStairMesh(roomBitmap,vertices,null,false,this.map.MESH_FLAG_ROOM_WALL);
           
               // the ceiling

            idx=0;
            vertices=new Float32Array(12);

            xStepBound=new wsBound((xBound.min+thickSize),(xBound.max-thickSize));
            this.createSingleCeilingZ(idx,vertices,xStepBound,yBoundTop,yBoundBottom,zBound);
            this.finishStairMesh(roomBitmap,vertices,null,true,this.map.MESH_FLAG_ROOM_CEILING);
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
            
            var yBoundFront=new wsBound((yBound.max-stepDrop),yBound.max);
            
                // the edges
                
            idx=0;
            vertices=new Float32Array(48);
            
            xStepBound=new wsBound(xBound.min,(xBound.min+thickSize));
            
            idx=this.createSingleWallX(idx,vertices,xStepBound.min,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertices,xStepBound.max,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallZ(idx,vertices,xStepBound,yBoundFront,yBoundFront,(flip?zBound.min:zBound.max));
            this.createSingleCeilingZ(idx,vertices,xStepBound,yBoundBottom,yBoundTop,zBound);
            this.finishStairMesh(stairBitmap,vertices,null,false,this.map.MESH_FLAG_STAIR);
            
            idx=0;
            vertices=new Float32Array(48);
            
            xStepBound=new wsBound((xBound.max-thickSize),xBound.max);
            
            idx=this.createSingleWallX(idx,vertices,xStepBound.min,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertices,xStepBound.max,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallZ(idx,vertices,xStepBound,yBoundFront,yBoundFront,(flip?zBound.min:zBound.max));
            this.createSingleCeilingZ(idx,vertices,xStepBound,yBoundBottom,yBoundTop,zBound);
            this.finishStairMesh(stairBitmap,vertices,null,false,this.map.MESH_FLAG_STAIR);
            
                // the behind box brace
            
            if (includeBack) {
                var zBraceBound;
                var braceSize=Math.floor(zBound.getSize()*0.4);

                if (!flip) {
                    zBraceBound=new wsBound((zBound.min-braceSize),zBound.min);
                }
                else {
                    zBraceBound=new wsBound(zBound.max,(zBound.max+braceSize));
                }
                this.map.addMesh(meshPrimitives.createMeshCube(stairBitmap,xBound,yBound,zBraceBound,false,true,true,!flip,flip,false,false,this.map.MESH_FLAG_STAIR));
            }
        }
        
            // the steps
        
        idx=0;
        vertices=new Float32Array(((this.STEP_COUNT*4)*3)*2);
        var normals=new Float32Array(((this.STEP_COUNT*4)*3)*2);
        
        var nIdx=0;
        if (!flip) {
            stepAdd=zBound.getSize()/this.STEP_COUNT;
            zStepBound=new wsBound(zBound.min,(zBound.min+stepAdd));

        }
        else {
            stepAdd=-(zBound.getSize()/this.STEP_COUNT);
            zStepBound=new wsBound((zBound.max+stepAdd),zBound.max);
        }
        
        yStepBound=new wsBound(yBound.min,(yBound.min+stepDrop));
        if (!toPlatform) yStepBound.add(-settings.roomFloorDepth);
        
        xStepBound=new wsBound((xBound.min+thickSize),(xBound.max-thickSize));

        for (n=0;n!==this.STEP_COUNT;n++) {
            if (!flip) {
                idx=this.createSingleWallZ(idx,vertices,xStepBound,yStepBound,yStepBound,zStepBound.max);
                nIdx=this.createNormalsForPolygon(nIdx,normals,0.0,0.0,1.0);
            }
            else {
                idx=this.createSingleWallZ(idx,vertices,xStepBound,yStepBound,yStepBound,zStepBound.min);
                nIdx=this.createNormalsForPolygon(nIdx,normals,0.0,0.0,-1.0);
            }
            
            idx=this.createSingleCeilingZ(idx,vertices,xStepBound,yStepBound,yStepBound,zStepBound);
            nIdx=this.createNormalsForPolygon(nIdx,normals,0.0,-1.0,0.0);
           
            yStepBound.add(stepDrop);
            zStepBound.add(stepAdd);
        }
        
        this.finishStairMesh(stairBitmap,vertices,normals,true,this.map.MESH_FLAG_STAIR);
    };
    
}

