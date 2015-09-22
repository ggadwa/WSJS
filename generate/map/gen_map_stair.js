"use strict";

//
// mesh primitives class
//

function GenRoomStairs()
{
        // constants
        
    this.MESH_PRIMITIVE_STAIR_COUNT=10;

        //
        // create cube
        //
/*
    this.createMeshCube=function(bitmap,xBound,yBound,zBound,wholeUV,left,right,front,back,top,bottom,flags)
    {
            // get cube size

        var count=0;
        if (left) count+=18;
        if (right) count+=18;
        if (front) count+=18;
        if (back) count+=18;
        if (top) count+=18;
        if (bottom) count+=18;
        if (count===0) return(null);

        var vertices=new Float32Array(count);
        var uvs;

            // left

        var idx=0;

        if (left) {
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;
        }

             // right

        if (right) {
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;
        }

            // front

        if (front) {
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;
        }

            // back

        if (back) {
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;
        }

            // top

        if (top) {
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;    
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;
        }

            // bottom

        if (bottom) {
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;
        }

        var n;
        var iCount=Math.floor(count/3);

        var indexes=new Uint16Array(iCount);

        for (n=0;n!==iCount;n++) {
            indexes[n]=n;
        }

            // build whole UVs

        if (wholeUV) {
            uvs=new Float32Array(iCount*2);

            idx=0;
            var quadCount=Math.floor(iCount/6);

            for (n=0;n!==quadCount;n++) {
                uvs[idx++]=0.0;
                uvs[idx++]=0.0;
                uvs[idx++]=1.0;
                uvs[idx++]=0.0;
                uvs[idx++]=1.0;
                uvs[idx++]=1.0;

                uvs[idx++]=0.0;
                uvs[idx++]=0.0;
                uvs[idx++]=1.0;
                uvs[idx++]=1.0;
                uvs[idx++]=0.0;
                uvs[idx++]=1.0;
            }  
        }

            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        var meshUVTangents=new MeshUVTangentsObject();
        var normals=meshUVTangents.buildMeshNormals(vertices,indexes,false);
        if (!wholeUV) uvs=meshUVTangents.buildMeshUVs(bitmap,vertices,normals);
        var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,flags));
    };
*/    
    
    
    
        //
        // create a single wall in vertexes
        //
        
    this.createSingleWallX=function(idx,vertices,x,yBound,zBound)
    {
        vertices[idx++]=x;
        vertices[idx++]=yBound.min;
        vertices[idx++]=zBound.min;
        vertices[idx++]=x;
        vertices[idx++]=yBound.min;
        vertices[idx++]=zBound.max;
        vertices[idx++]=x;
        vertices[idx++]=yBound.max;
        vertices[idx++]=zBound.max;

        vertices[idx++]=x;
        vertices[idx++]=yBound.min;
        vertices[idx++]=zBound.min;
        vertices[idx++]=x;
        vertices[idx++]=yBound.max;
        vertices[idx++]=zBound.max;
        vertices[idx++]=x;
        vertices[idx++]=yBound.max;
        vertices[idx++]=zBound.min;
        
        return(idx);
    };
    
    this.createSingleWallZ=function(idx,vertices,xBound,yBound,z)
    {
        vertices[idx++]=xBound.min;
        vertices[idx++]=yBound.min;
        vertices[idx++]=z;
        vertices[idx++]=xBound.min;
        vertices[idx++]=yBound.min;
        vertices[idx++]=z;
        vertices[idx++]=xBound.min;
        vertices[idx++]=yBound.max;
        vertices[idx++]=z;

        vertices[idx++]=xBound.min;
        vertices[idx++]=yBound.min;
        vertices[idx++]=z;
        vertices[idx++]=xBound.min;
        vertices[idx++]=yBound.max;
        vertices[idx++]=z;
        vertices[idx++]=xBound.min;
        vertices[idx++]=yBound.max;
        vertices[idx++]=z;
        
        return(idx);
    };


        //
        // create stairs
        //

    this.createStairsPosX=function(map,xBound,yBound,zBound)
    {
        var n,idx,mesh,mesh2;
        var vertices;
        var uvs;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room
            
        vertices=new Float32Array(90);

            // left & right, these will be eliminated
            // by poly collision later but are needed
            // so correct holes are punched

        idx=0;
        idx=this.createSingleWallX(idx,vertices,xBound.min,yBound,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBound,zBound);
        

        
        
        
        
        
        
        var stepAdd=(xBound.max-xBound.min)/this.MESH_PRIMITIVE_STAIR_COUNT;
        var stepDrop=(yBound.max-yBound.min)/(this.MESH_PRIMITIVE_STAIR_COUNT+0);
        var xStepBound=new wsBound(xBound.min,(xBound.min+stepAdd));
        var yStepBound=yBound.copy();

        for (n=0;n!==this.MESH_PRIMITIVE_STAIR_COUNT;n++) {
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

    this.createStairsPosZ=function(map,xBound,yBound,zBound)
    {
        var n,idx,mesh,mesh2;
        var vertices;
        var uvs;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room
            
        vertices=new Float32Array(90);

            // left & right, these will be eliminated
            // by poly collision later but are needed
            // so correct holes are punched

        idx=0;
        idx=this.createSingleWallX(idx,vertices,xBound.min,yBound,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBound,zBound);

        
        
        
        var stepAdd=(zBound.max-zBound.min)/this.MESH_PRIMITIVE_STAIR_COUNT;
        var stepDrop=(yBound.max-yBound.min)/(this.MESH_PRIMITIVE_STAIR_COUNT+0);
        var zStepBound=new wsBound(zBound.min,zBound.min+stepAdd);
        var yStepBound=yBound.copy();

        for (n=0;n!==this.MESH_PRIMITIVE_STAIR_COUNT;n++) {
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

    this.createStairsNegX=function(map,xBound,yBound,zBound)
    {
        var n,idx,mesh,mesh2;
        var vertices;
        var uvs;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room
            
        vertices=new Float32Array(90);

            // left & right, these will be eliminated
            // by poly collision later but are needed
            // so correct holes are punched

        idx=0;
        idx=this.createSingleWallX(idx,vertices,xBound.min,yBound,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBound,zBound);

        
        
        var stepAdd=(xBound.max-xBound.min)/this.MESH_PRIMITIVE_STAIR_COUNT;
        var stepDrop=(yBound.max-yBound.min)/(this.MESH_PRIMITIVE_STAIR_COUNT+0);
        var xStepBound=new wsBound((xBound.max-stepAdd),xBound.max);
        var yStepBound=yBound.copy();

        for (n=0;n!==this.MESH_PRIMITIVE_STAIR_COUNT;n++) {
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

    this.createStairsNegZ=function(map,xBound,yBound,zBound)
    {
        var n,idx,mesh,mesh2;
        var vertices;
        var uvs;
        
            // height of stairs
            
        var stairHigh=yBound.getSize();
        
            // the stair room
            
        vertices=new Float32Array(90);

            // left & right, these will be eliminated
            // by poly collision later but are needed
            // so correct holes are punched

        idx=0;
        idx=this.createSingleWallX(idx,vertices,xBound.min,yBound,zBound);
        idx=this.createSingleWallX(idx,vertices,xBound.max,yBound,zBound);

        
        
        
        var stepAdd=(zBound.max-zBound.min)/this.MESH_PRIMITIVE_STAIR_COUNT;
        var stepDrop=(yBound.max-yBound.min)/(this.MESH_PRIMITIVE_STAIR_COUNT+0);
        var zStepBound=new wsBound((zBound.max-stepAdd),zBound.max);
        var yStepBound=yBound.copy();

        for (n=0;n!==this.MESH_PRIMITIVE_STAIR_COUNT;n++) {
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

