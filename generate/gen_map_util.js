"use strict";

//
// generate map utility object
//

var genMapUtil={};

//
// constants
//

genMapUtil.STAIR_COUNT=10;

//
// create cube
//

genMapUtil.createMeshCube=function(shaderIdx,bitmapIdx,xBound,yBound,zBound,flags)
{
    var vertices=new Float32Array(108);
    
        // left
        
    vertices[0]=xBound.min;
    vertices[1]=yBound.min;
    vertices[2]=zBound.min;
    vertices[3]=xBound.min;
    vertices[4]=yBound.min;
    vertices[5]=zBound.max;
    vertices[6]=xBound.min;
    vertices[7]=yBound.max;
    vertices[8]=zBound.max;

    vertices[9]=xBound.min;
    vertices[10]=yBound.min;
    vertices[11]=zBound.min;
    vertices[12]=xBound.min;
    vertices[13]=yBound.max;
    vertices[14]=zBound.max;
    vertices[15]=xBound.min;
    vertices[16]=yBound.max;
    vertices[17]=zBound.min;
    
         // left
        
    vertices[18]=xBound.max;
    vertices[19]=yBound.min;
    vertices[20]=zBound.min;
    vertices[21]=xBound.max;
    vertices[22]=yBound.min;
    vertices[23]=zBound.max;
    vertices[24]=xBound.max;
    vertices[25]=yBound.max;
    vertices[26]=zBound.max;

    vertices[27]=xBound.max;
    vertices[28]=yBound.min;
    vertices[29]=zBound.min;
    vertices[30]=xBound.max;
    vertices[31]=yBound.max;
    vertices[32]=zBound.max;
    vertices[33]=xBound.max;
    vertices[34]=yBound.max;
    vertices[35]=zBound.min;
    
        // front
        
    vertices[36]=xBound.min;
    vertices[37]=yBound.min;
    vertices[38]=zBound.min;
    vertices[39]=xBound.max;
    vertices[40]=yBound.min;
    vertices[41]=zBound.min;
    vertices[42]=xBound.max;
    vertices[43]=yBound.max;
    vertices[44]=zBound.min;

    vertices[45]=xBound.min;
    vertices[46]=yBound.min;
    vertices[47]=zBound.min;
    vertices[48]=xBound.max;
    vertices[49]=yBound.max;
    vertices[50]=zBound.min;
    vertices[51]=xBound.min;
    vertices[52]=yBound.max;
    vertices[53]=zBound.min;
    
        // back
        
    vertices[54]=xBound.min;
    vertices[55]=yBound.min;
    vertices[56]=zBound.max;
    vertices[57]=xBound.max;
    vertices[58]=yBound.min;
    vertices[59]=zBound.max;
    vertices[60]=xBound.max;
    vertices[61]=yBound.max;
    vertices[62]=zBound.max;

    vertices[63]=xBound.min;
    vertices[64]=yBound.min;
    vertices[65]=zBound.max;
    vertices[66]=xBound.max;
    vertices[67]=yBound.max;
    vertices[68]=zBound.max;
    vertices[69]=xBound.min;
    vertices[70]=yBound.max;
    vertices[71]=zBound.max;
   
        // top
        
    vertices[72]=xBound.min;
    vertices[73]=yBound.min;
    vertices[74]=zBound.min;
    vertices[75]=xBound.max;
    vertices[76]=yBound.min;
    vertices[77]=zBound.min;
    vertices[78]=xBound.max;
    vertices[79]=yBound.min;
    vertices[80]=zBound.max;

    vertices[81]=xBound.min;
    vertices[82]=yBound.min;
    vertices[83]=zBound.min;
    vertices[84]=xBound.max;
    vertices[85]=yBound.min;
    vertices[86]=zBound.max;    
    vertices[87]=xBound.min;
    vertices[88]=yBound.min;
    vertices[89]=zBound.max;
     
        // bottom
        
    vertices[90]=xBound.min;
    vertices[91]=yBound.max;
    vertices[92]=zBound.min;
    vertices[93]=xBound.max;
    vertices[94]=yBound.max;
    vertices[95]=zBound.min;
    vertices[96]=xBound.max;
    vertices[97]=yBound.max;
    vertices[98]=zBound.max;

    vertices[99]=xBound.min;
    vertices[100]=yBound.max;
    vertices[101]=zBound.min;
    vertices[102]=xBound.max;
    vertices[103]=yBound.max;
    vertices[104]=zBound.max;
    vertices[105]=xBound.min;
    vertices[106]=yBound.max;
    vertices[107]=zBound.max;

    var n;
    var indexes=new Uint16Array(36);
    
    for (n=0;n!==36;n++) {
        indexes[n]=n;
    }
    
        // calculate the normals, then use those to
        // calcualte the uvs, and finally the UVs to
        // calculate the tangents
        
    var normals=genMeshUtility.buildMeshNormals(vertices,indexes,true);
    var uvs=genMeshUtility.buildMeshUVs(bitmapIdx,vertices,normals);
    var tangents=genMeshUtility.buildMeshTangents(vertices,uvs,indexes);
    
        // finally create the mesh
        
    return(new meshObject(shaderIdx,bitmapIdx,vertices,normals,tangents,uvs,indexes,flags));
};

//
// create pryamid
//

genMapUtil.createMeshPryamid=function(shaderIdx,bitmapIdx,xBound,yBound,zBound,flags)
{
    var x=xBound.getMidPoint();
    var z=zBound.getMidPoint();
    
    var vertices=new Float32Array(36);
    
    vertices[0]=xBound.min;
    vertices[1]=yBound.min;
    vertices[2]=zBound.min;
    vertices[3]=xBound.max;
    vertices[4]=yBound.min;
    vertices[5]=zBound.min;
    vertices[6]=x;
    vertices[7]=yBound.max;
    vertices[8]=z;

    vertices[9]=xBound.max;
    vertices[10]=yBound.min;
    vertices[11]=zBound.min;
    vertices[12]=xBound.max;
    vertices[13]=yBound.min;
    vertices[14]=zBound.max;
    vertices[15]=x;
    vertices[16]=yBound.max;
    vertices[17]=z;
    
    vertices[18]=xBound.max;
    vertices[19]=yBound.min;
    vertices[20]=zBound.max;
    vertices[21]=xBound.min;
    vertices[22]=yBound.min;
    vertices[23]=zBound.max;
    vertices[24]=x;
    vertices[25]=yBound.max;
    vertices[26]=z;
    
    vertices[27]=xBound.min;
    vertices[28]=yBound.min;
    vertices[29]=zBound.max;
    vertices[30]=xBound.min;
    vertices[31]=yBound.min;
    vertices[32]=zBound.min;
    vertices[33]=x;
    vertices[34]=yBound.max;
    vertices[35]=z;
    
    var n;
    var indexes=new Uint16Array(12);
    
    for (n=0;n!==12;n++) {
        indexes[n]=n;
    }
    
        // calculate the normals, then use those to
        // calcualte the uvs, and finally the UVs to
        // calculate the tangents
        
    var normals=genMeshUtility.buildMeshNormals(vertices,indexes,true);
    var uvs=genMeshUtility.buildMeshUVs(bitmapIdx,vertices,normals);
    var tangents=genMeshUtility.buildMeshTangents(vertices,uvs,indexes);
    
        // finally create the mesh
        
    return(new meshObject(shaderIdx,bitmapIdx,vertices,normals,tangents,uvs,indexes,flags));
};

//
// create stairs
//

genMapUtil.createStairsPosX=function(map,shaderIdx,bitmapIdx,xBound,yBound,zBound)
{
    var n;
    var stepAdd=(xBound.max-xBound.min)/this.STAIR_COUNT;
    var stepDrop=(yBound.max-yBound.min)/(this.STAIR_COUNT+1);
    var xStepBound=new wsBound(xBound.min,(xBound.min+stepAdd));
    var yStepBound=yBound.copy();
    
    for (n=0;n!==this.STAIR_COUNT;n++) {
        yStepBound.min+=stepDrop;
        map.addMesh(this.createMeshCube(shaderIdx,bitmapIdx,xStepBound,yStepBound,zBound,genMap.MESH_FLAG_STAIR));
        xStepBound.add(stepAdd);
    }
};

genMapUtil.createStairsPosZ=function(map,shaderIdx,bitmapIdx,xBound,yBound,zBound)
{
    var n;
    var stepAdd=(zBound.max-zBound.min)/this.STAIR_COUNT;
    var stepDrop=(yBound.max-yBound.min)/(this.STAIR_COUNT+1);
    var zStepBound=new wsBound(zBound.min,zBound.min+stepAdd);
    var yStepBound=yBound.copy();
    
    for (n=0;n!==this.STAIR_COUNT;n++) {
        yStepBound.min+=stepDrop;
        map.addMesh(this.createMeshCube(shaderIdx,bitmapIdx,xBound,yStepBound,zStepBound,genMap.MESH_FLAG_STAIR));
        zStepBound.add(stepAdd);
    }
};

genMapUtil.createStairsNegX=function(map,shaderIdx,bitmapIdx,xBound,yBound,zBound)
{
    var n;
    var stepAdd=(xBound.max-xBound.min)/this.STAIR_COUNT;
    var stepDrop=(yBound.max-yBound.min)/(this.STAIR_COUNT+1);
    var xStepBound=new wsBound((xBound.max-stepAdd),xBound.max);
    var yStepBound=yBound.copy();
    
    for (n=0;n!==this.STAIR_COUNT;n++) {
        yStepBound.min+=stepDrop;
        map.addMesh(this.createMeshCube(shaderIdx,bitmapIdx,xStepBound,yStepBound,zBound,genMap.MESH_FLAG_STAIR));
        xStepBound.add(-stepAdd);
    }
};

genMapUtil.createStairsNegZ=function(map,shaderIdx,bitmapIdx,xBound,yBound,zBound)
{
    var n;
    var stepAdd=(zBound.max-zBound.min)/this.STAIR_COUNT;
    var stepDrop=(yBound.max-yBound.min)/(this.STAIR_COUNT+1);
    var zStepBound=new wsBound((zBound.max-stepAdd),zBound.max);
    var yStepBound=yBound.copy();
    
    for (n=0;n!==this.STAIR_COUNT;n++) {
        yStepBound.min+=stepDrop;
        map.addMesh(this.createMeshCube(shaderIdx,bitmapIdx,xBound,yStepBound,zStepBound,genMap.MESH_FLAG_STAIR));
        zStepBound.add(-stepAdd);
    }
};
