"use strict";

//
// mesh primitives class
//

function GenRoomStairs()
{
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
        vertices[idx++]=yBoundBottom.min;
        vertices[idx++]=zBound.min;
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
        vertices[idx++]=yBoundBottom.min;
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

        vertices[idx++]=xBound.min;
        vertices[idx++]=yBoundBottom.min;
        vertices[idx++]=zBound.min;
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
        
        for (n=0;n!==6;n++) {
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
        
    this.finishStairMesh=function(map,bitmap,vertices,normals,flags)
    {
            // build the indexes
            
        var n;
        var iCount=Math.floor(vertices.length/3);

        var indexes=new Uint16Array(iCount);

        for (n=0;n!==iCount;n++) {
            indexes[n]=n;
        }
        
            // create the mesh and
            // add to map
               
        var calcNormals;
        if (normals!==null) {
            calcNormals=normals;
        }
        else {
            calcNormals=meshUVTangents.buildMeshNormals(vertices,indexes,true);
        }
        
        var uvs=meshUVTangents.buildMeshUVs(bitmap,vertices,calcNormals);
        var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);

        var mesh=new MapMeshObject(bitmap,vertices,calcNormals,tangents,uvs,indexes,flags);        
        map.addMesh(mesh);
    };

        //
        // create stairs
        //

    this.createStairsPosX=function(map,roomBitmap,xBound,yBound,zBound)
    {
        var n,idx;
        var vertices;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room

        var yBoundTop=yBound.copy();
        yBoundTop.add(-stairHigh);
        
            // walls
            
        idx=0;
        vertices=new Float32Array(72);

        idx=this.createSingleWallX(idx,vertices,xBound.min,yBoundTop,yBoundTop,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBound,yBound,zBound);
        idx=this.createSingleWallZ(idx,vertices,xBound,yBoundTop,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertices,xBound,yBoundTop,yBound,zBound.max);
        this.finishStairMesh(map,roomBitmap,vertices,null,map.MESH_FLAG_ROOM_WALL);
        
           // the ceiling
           
        idx=0;
        vertices=new Float32Array(18);
            
        this.createSingleCeilingX(idx,vertices,xBound,yBoundTop,yBound,zBound);
        this.finishStairMesh(map,roomBitmap,vertices,null,map.MESH_FLAG_ROOM_CEILING);
        
            // the steps
        
        idx=0;
        vertices=new Float32Array(((this.STEP_COUNT*6)*3)*2);
        var normals=new Float32Array(((this.STEP_COUNT*6)*3)*2);
        
        var nIdx=0;
        var stepAdd=xBound.getSize()/this.STEP_COUNT;
        var stepDrop=stairHigh/(this.STEP_COUNT+0);
        var xStepBound=new wsBound(xBound.min,(xBound.min+stepAdd));
        var yStepBound=yBound.copy();
        
        for (n=0;n!==this.STEP_COUNT;n++) {
            idx=this.createSingleWallX(idx,vertices,xStepBound.max,yStepBound,yStepBound,zBound);
            nIdx=this.createNormalsForPolygon(nIdx,normals,1.0,0.0,0.0);
            
            idx=this.createSingleCeilingX(idx,vertices,xStepBound,yStepBound,yStepBound,zBound);
            nIdx=this.createNormalsForPolygon(nIdx,normals,0.0,-1.0,0.0);
           
            yStepBound.min+=stepDrop;
            xStepBound.add(stepAdd);
        }
        
        this.finishStairMesh(map,map.getBitmapById(BITMAP_STAIR_TILE),vertices,normals,map.MESH_FLAG_STAIR);
    };

    this.createStairsPosZ=function(map,roomBitmap,xBound,yBound,zBound)
    {
        var n,idx;
        var vertices;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room

        var yBoundTop=yBound.copy();
        yBoundTop.add(-stairHigh);

            // walls
        
        idx=0;
        vertices=new Float32Array(72);
        
        idx=this.createSingleWallZ(idx,vertices,xBound,yBoundTop,yBoundTop,zBound.min);
        idx=this.createSingleWallZ(idx,vertices,xBound,yBound,yBound,zBound.max);
        idx=this.createSingleWallX(idx,vertices,xBound.min,yBoundTop,yBound,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBoundTop,yBound,zBound);
        this.finishStairMesh(map,roomBitmap,vertices,null,map.MESH_FLAG_ROOM_WALL);
        
           // the ceiling
           
        idx=0;
        vertices=new Float32Array(18);
            
        this.createSingleCeilingZ(idx,vertices,xBound,yBoundTop,yBound,zBound);
        this.finishStairMesh(map,roomBitmap,vertices,null,map.MESH_FLAG_ROOM_CEILING);
        
            // the steps
            
        idx=0;
        vertices=new Float32Array(((this.STEP_COUNT*6)*3)*2);
        var normals=new Float32Array(((this.STEP_COUNT*6)*3)*2);
        
        var nIdx=0;
        var stepAdd=zBound.getSize()/this.STEP_COUNT;
        var stepDrop=stairHigh/(this.STEP_COUNT+0);
        var zStepBound=new wsBound(zBound.min,(zBound.min+stepAdd));
        var yStepBound=yBound.copy();

        for (n=0;n!==this.STEP_COUNT;n++) {
            idx=this.createSingleWallZ(idx,vertices,xBound,yStepBound,yStepBound,zStepBound.max);
            nIdx=this.createNormalsForPolygon(nIdx,normals,0.0,0.0,1.0);
            
            idx=this.createSingleCeilingZ(idx,vertices,xBound,yStepBound,yStepBound,zStepBound);
            nIdx=this.createNormalsForPolygon(nIdx,normals,0.0,-1.0,0.0);
           
            yStepBound.min+=stepDrop;
            zStepBound.add(stepAdd);
        }
        
        this.finishStairMesh(map,map.getBitmapById(BITMAP_STAIR_TILE),vertices,normals,map.MESH_FLAG_STAIR);

        //map.addMesh(mesh);
    };

    this.createStairsNegX=function(map,roomBitmap,xBound,yBound,zBound)
    {
        var n,idx;
        var vertices;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room
            
        var yBoundTop=yBound.copy();
        yBoundTop.add(-stairHigh);
        
            // walls
            
        idx=0;
        vertices=new Float32Array(72);

        idx=this.createSingleWallX(idx,vertices,xBound.min,yBound,yBound,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBoundTop,yBoundTop,zBound);
        idx=this.createSingleWallZ(idx,vertices,xBound,yBound,yBoundTop,zBound.min);
        idx=this.createSingleWallZ(idx,vertices,xBound,yBound,yBoundTop,zBound.max);
        this.finishStairMesh(map,roomBitmap,vertices,null,map.MESH_FLAG_ROOM_WALL);
        
           // the ceiling
           
        idx=0;
        vertices=new Float32Array(18);
            
        this.createSingleCeilingX(idx,vertices,xBound,yBound,yBoundTop,zBound);
        this.finishStairMesh(map,roomBitmap,vertices,null,map.MESH_FLAG_ROOM_CEILING);
        
            // the steps
            
        idx=0;
        vertices=new Float32Array(((this.STEP_COUNT*6)*3)*2);
        var normals=new Float32Array(((this.STEP_COUNT*6)*3)*2);
        
        var nIdx=0;
        var stepAdd=xBound.getSize()/this.STEP_COUNT;
        var stepDrop=stairHigh/(this.STEP_COUNT+0);
        var xStepBound=new wsBound((xBound.max-stepAdd),xBound.max);
        var yStepBound=yBound.copy();

        for (n=0;n!==this.STEP_COUNT;n++) {
            idx=this.createSingleWallX(idx,vertices,xStepBound.min,yStepBound,yStepBound,zBound);
            nIdx=this.createNormalsForPolygon(nIdx,normals,-1.0,0.0,0.0);
            
            idx=this.createSingleCeilingX(idx,vertices,xStepBound,yStepBound,yStepBound,zBound);
            nIdx=this.createNormalsForPolygon(nIdx,normals,0.0,-1.0,0.0);
           
            yStepBound.min+=stepDrop;
            xStepBound.add(-stepAdd);
        }
        
        this.finishStairMesh(map,map.getBitmapById(BITMAP_STAIR_TILE),vertices,normals,map.MESH_FLAG_STAIR);
    };

    this.createStairsNegZ=function(map,roomBitmap,xBound,yBound,zBound)
    {
        var n,idx;
        var vertices;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room
            
        var yBoundTop=yBound.copy();
        yBoundTop.add(-stairHigh);
        
            // walls
            
        idx=0;
        vertices=new Float32Array(72);
        
        idx=this.createSingleWallZ(idx,vertices,xBound,yBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertices,xBound,yBoundTop,yBoundTop,zBound.max);
        idx=this.createSingleWallX(idx,vertices,xBound.min,yBound,yBoundTop,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBound,yBoundTop,zBound);
        this.finishStairMesh(map,roomBitmap,vertices,null,map.MESH_FLAG_ROOM_WALL);
        
           // the ceiling
           
        idx=0;
        vertices=new Float32Array(18);

        this.createSingleCeilingZ(idx,vertices,xBound,yBound,yBoundTop,zBound);        
        this.finishStairMesh(map,roomBitmap,vertices,null,map.MESH_FLAG_ROOM_CEILING);
        
            // the steps
        
        idx=0;
        vertices=new Float32Array(((this.STEP_COUNT*6)*3)*2);
        var normals=new Float32Array(((this.STEP_COUNT*6)*3)*2);
        
        var nIdx=0;
        var stepAdd=zBound.getSize()/this.STEP_COUNT;
        var stepDrop=stairHigh/(this.STEP_COUNT+0);
        var zStepBound=new wsBound((zBound.max-stepAdd),zBound.max);
        var yStepBound=yBound.copy();

        for (n=0;n!==this.STEP_COUNT;n++) {
            idx=this.createSingleWallZ(idx,vertices,xBound,yStepBound,yStepBound,zStepBound.min);
            nIdx=this.createNormalsForPolygon(nIdx,normals,0.0,0.0,-1.0);
            
            idx=this.createSingleCeilingZ(idx,vertices,xBound,yStepBound,yStepBound,zStepBound);
            nIdx=this.createNormalsForPolygon(nIdx,normals,0.0,-1.0,0.0);
           
            yStepBound.min+=stepDrop;
            zStepBound.add(-stepAdd);
        }
        
        this.finishStairMesh(map,map.getBitmapById(BITMAP_STAIR_TILE),vertices,normals,map.MESH_FLAG_STAIR);
    };
    
}

