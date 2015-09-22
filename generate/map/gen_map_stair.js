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
    
        //
        // utility routine to compile stair room
        // into a mesh
        //
        
    this.finishStairRoom=function(map,bitmap,vertices,flags)
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
               
        var meshUVTangents=new MeshUVTangentsObject();
        var normals=meshUVTangents.buildMeshNormals(vertices,indexes,false);
        var uvs=meshUVTangents.buildMeshUVs(bitmap,vertices,normals);
        var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);

        var mesh=new MapMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,flags);        
        map.addMesh(mesh);
    };


        //
        // create stairs
        //

    this.createStairsPosX=function(map,roomBitmap,xBound,yBound,zBound)
    {
        var n,idx,mesh,mesh2;
        var vertices;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room
            
        vertices=new Float32Array(72);      // 90 with ceiling

            // left & right, these will be eliminated
            // by poly collision later but are needed
            // so correct holes are punched

        idx=0;
        var yBoundTop=yBound.copy();
        yBoundTop.add(-stairHigh);

        idx=this.createSingleWallX(idx,vertices,xBound.min,yBoundTop,yBoundTop,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBound,yBound,zBound);
        
            // the slanted walls
        
        idx=this.createSingleWallZ(idx,vertices,xBound,yBoundTop,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertices,xBound,yBoundTop,yBound,zBound.max);
        
        this.finishStairRoom(map,roomBitmap,vertices,map.MESH_FLAG_ROOM_WALL);
        return;
        
        
        
        
        
        var stepAdd=(xBound.max-xBound.min)/this.STEP_COUNT;
        var stepDrop=(yBound.max-yBound.min)/(this.STEP_COUNT+0);
        var xStepBound=new wsBound(xBound.min,(xBound.min+stepAdd));
        var yStepBound=yBound.copy();

        for (n=0;n!==this.STEP_COUNT;n++) {
            if (n===0) {
                mesh=this.createMeshCube(map.getBitmapById(BITMAP_STAIR_TILE),xStepBound,yStepBound,zBound,false,false,true,true,true,true,false,map.MESH_FLAG_STAIR);
            }
            else {
                mesh2=this.createMeshCube(map.getBitmapById(BITMAP_STAIR_TILE),xStepBound,yStepBound,zBound,false,false,true,true,true,true,false,map.MESH_FLAG_STAIR);
                mesh.combineMesh(mesh2);
            }
            yStepBound.min+=stepDrop;
            xStepBound.add(stepAdd);
        }

        map.addMesh(mesh);
    };

    this.createStairsPosZ=function(map,roomBitmap,xBound,yBound,zBound)
    {
        var n,idx,mesh,mesh2;
        var vertices;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room
            
        vertices=new Float32Array(72);      // 90 with ceiling

            // left & right, these will be eliminated
            // by poly collision later but are needed
            // so correct holes are punched

        idx=0;
        var yBoundTop=yBound.copy();
        yBoundTop.add(-stairHigh);

        idx=this.createSingleWallZ(idx,vertices,xBound,yBoundTop,yBoundTop,zBound.min);
        idx=this.createSingleWallZ(idx,vertices,xBound,yBound,yBound,zBound.max);
        
            // the slanted walls
        
        idx=this.createSingleWallX(idx,vertices,xBound.min,yBound,yBoundTop,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBound,yBoundTop,zBound);
        
        this.finishStairRoom(map,roomBitmap,vertices,map.MESH_FLAG_ROOM_WALL);
        return;

        
        
        
        var stepAdd=(zBound.max-zBound.min)/this.STEP_COUNT;
        var stepDrop=(yBound.max-yBound.min)/(this.STEP_COUNT+0);
        var zStepBound=new wsBound(zBound.min,zBound.min+stepAdd);
        var yStepBound=yBound.copy();

        for (n=0;n!==this.STEP_COUNT;n++) {
            if (n===0) {
                mesh=this.createMeshCube(map.getBitmapById(BITMAP_STAIR_TILE),xBound,yStepBound,zStepBound,false,true,true,false,true,true,false,map.MESH_FLAG_STAIR);
            }
            else {
                mesh2=this.createMeshCube(map.getBitmapById(BITMAP_STAIR_TILE),xBound,yStepBound,zStepBound,false,true,true,false,true,true,false,map.MESH_FLAG_STAIR);
                mesh.combineMesh(mesh2);
            }
            yStepBound.min+=stepDrop;
            zStepBound.add(stepAdd);
        }

        map.addMesh(mesh);
    };

    this.createStairsNegX=function(map,roomBitmap,xBound,yBound,zBound)
    {
        var n,idx,mesh,mesh2;
        var vertices;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room
            
        vertices=new Float32Array(72);      // 90 with ceiling

            // left & right, these will be eliminated
            // by poly collision later but are needed
            // so correct holes are punched

        idx=0;
        var yBoundTop=yBound.copy();
        yBoundTop.add(-stairHigh);

        idx=this.createSingleWallX(idx,vertices,xBound.min,yBound,yBound,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBoundTop,yBoundTop,zBound);
        
            // the slanted walls
        
        idx=this.createSingleWallZ(idx,vertices,xBound,yBound,yBoundTop,zBound.min);
        idx=this.createSingleWallZ(idx,vertices,xBound,yBound,yBoundTop,zBound.max);
        
        this.finishStairRoom(map,roomBitmap,vertices,map.MESH_FLAG_ROOM_WALL);
        return;




        
        
        var stepAdd=(xBound.max-xBound.min)/this.STEP_COUNT;
        var stepDrop=(yBound.max-yBound.min)/(this.STEP_COUNT+0);
        var xStepBound=new wsBound((xBound.max-stepAdd),xBound.max);
        var yStepBound=yBound.copy();

        for (n=0;n!==this.STEP_COUNT;n++) {
            if (n===0) {
                mesh=this.createMeshCube(map.getBitmapById(BITMAP_STAIR_TILE),xStepBound,yStepBound,zBound,false,true,false,true,true,true,false,map.MESH_FLAG_STAIR);
            }
            else {
                mesh2=this.createMeshCube(map.getBitmapById(BITMAP_STAIR_TILE),xStepBound,yStepBound,zBound,false,true,false,true,true,true,false,map.MESH_FLAG_STAIR);
                mesh.combineMesh(mesh2);
            }
            yStepBound.min+=stepDrop;
            xStepBound.add(-stepAdd);
        }

        map.addMesh(mesh);
    };

    this.createStairsNegZ=function(map,roomBitmap,xBound,yBound,zBound)
    {
        var n,idx,mesh,mesh2;
        var vertices;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room
            
        vertices=new Float32Array(72);      // 90 with ceiling

            // left & right, these will be eliminated
            // by poly collision later but are needed
            // so correct holes are punched

        idx=0;
        var yBoundTop=yBound.copy();
        yBoundTop.add(-stairHigh);
        
        idx=this.createSingleWallZ(idx,vertices,xBound,yBound,yBound,zBound.min);
        idx=this.createSingleWallZ(idx,vertices,xBound,yBoundTop,yBoundTop,zBound.max);
        
            // the slanted walls
        
        idx=this.createSingleWallX(idx,vertices,xBound.min,yBound,yBoundTop,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBound,yBoundTop,zBound);
        
        this.finishStairRoom(map,roomBitmap,vertices,map.MESH_FLAG_ROOM_WALL);
        return;

        
        
        
        var stepAdd=(zBound.max-zBound.min)/this.STEP_COUNT;
        var stepDrop=(yBound.max-yBound.min)/(this.STEP_COUNT+0);
        var zStepBound=new wsBound((zBound.max-stepAdd),zBound.max);
        var yStepBound=yBound.copy();

        for (n=0;n!==this.STEP_COUNT;n++) {
            if (n===0) {
                mesh=this.createMeshCube(map.getBitmapById(BITMAP_STAIR_TILE),xBound,yStepBound,zStepBound,false,true,true,true,false,true,false,map.MESH_FLAG_STAIR);
            }
            else {
                mesh2=this.createMeshCube(map.getBitmapById(BITMAP_STAIR_TILE),xBound,yStepBound,zStepBound,false,true,true,true,false,true,false,map.MESH_FLAG_STAIR);
                mesh.combineMesh(mesh2);
            }
            yStepBound.min+=stepDrop;
            zStepBound.add(-stepAdd);
        }

        map.addMesh(mesh);
    };
    
}

