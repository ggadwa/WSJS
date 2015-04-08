"use strict";

//
// generate mesh utility object
//

var meshUVTangents={};
 
//
// create normals from verticies and triangles
//

meshUVTangents.buildMeshNormals=function(vertices,indexes,normalsIn)
{
    var n,nTrig,nVertex,trigIdx;
    var idx,v0Idx,v1Idx,v2Idx;
    var v0,v1,v2;
    var flat;
    
        // default all the normals
        // remember that these are opengl lists
        // so they are just packed arrays of floats
        
        // we default all normals to being up in
        // case we have stray normals without a trig
    
    nVertex=Math.floor(vertices.length/3);
    var normals=new Float32Array(nVertex*3);
    
        // determine the center of the vertices
        // this will be used later to determine if
        // normals should be flipped (i.e., normals in
        // or out, a mesh is meant to be inside or
        // outside
    
    var meshCenter=vec3.fromValues(0.0,0.0,0.0);
    
    idx=0;
    
    for (n=0;n!==nVertex;n++) {
        meshCenter[0]+=vertices[idx++];
        meshCenter[1]+=vertices[idx++];
        meshCenter[2]+=vertices[idx++];
    }
    
    meshCenter[0]/=nVertex;
    meshCenter[1]/=nVertex;
    meshCenter[2]/=nVertex;
    
    var trigCenter=vec3.create();
    var faceVct=vec3.create();
    var flip;

        // generate normals by the trigs
        // sometimes we will end up overwriting
        // but it depends on the mesh to have
        // constant shared vertices against
        // triangle normals
    
    var p10=vec3.create();
    var p20=vec3.create();
    var normal=vec3.create();
        
    nTrig=Math.floor(indexes.length/3);
    
    for (n=0;n!==nTrig;n++) {
        
            // get the vertex indexes and
            // the vertexes for the trig
            
            // again, packed arrays, need to
            // find vertex start in them
        
        trigIdx=n*3;
        
        v0Idx=indexes[trigIdx]*3;
        v1Idx=indexes[trigIdx+1]*3;
        v2Idx=indexes[trigIdx+2]*3;
        
        v0=vec3.fromValues(vertices[v0Idx],vertices[v0Idx+1],vertices[v0Idx+2]);
        v1=vec3.fromValues(vertices[v1Idx],vertices[v1Idx+1],vertices[v1Idx+2]);
        v2=vec3.fromValues(vertices[v2Idx],vertices[v2Idx+1],vertices[v2Idx+2]);
        
            // detect special flat surfaces that have
            // predictable normals

        flat=false;
        
        if ((v0[0]===v1[0]) && (v0[0]===v2[0])) {
            flat=true;
            normal=vec3.fromValues(-1.0,0.0,0.0);
        }
        else {
            if ((v0[1]===v1[1]) && (v0[1]===v2[1])) {
                flat=true;
                normal=vec3.fromValues(0.0,-1.0,0.0);
            }
            else {
                if ((v0[2]===v1[2]) && (v0[2]===v2[2])) {
                    flat=true;
                    normal=vec3.fromValues(0.0,0.0,-1.0);
                }   
            }
        }

            // create vectors and calculate the normal
            // by the cross product
        
        if (!flat) {
            vec3.sub(p10,v1,v0);
            vec3.sub(p20,v2,v0);
            vec3.cross(normal,p10,p20);
            vec3.normalize(normal,normal);
        }
        
            // determine if we need to flip
            // we can use the dot product to tell
            // us if the normal is pointing
            // more towards the center or more
            // away from it
            
        trigCenter=vec3.fromValues(((v0[0]+v1[0]+v2[0])/3),((v0[1]+v1[1]+v2[1])/3),((v0[2]+v1[2]+v2[2])/3));
        vec3.sub(faceVct,trigCenter,meshCenter);
        
        flip=(vec3.dot(normal,faceVct)>0.0);
        if (!normalsIn) flip=!flip;

        if (flip) vec3.scale(normal,normal,-1.0);
        
            // and set the mesh normal
            // to all vertexes in this trig
            
        normals[v0Idx]=normal[0];
        normals[v0Idx+1]=normal[1];
        normals[v0Idx+2]=normal[2];
            
        normals[v1Idx]=normal[0];
        normals[v1Idx+1]=normal[1];
        normals[v1Idx+2]=normal[2];
        
        normals[v2Idx]=normal[0];
        normals[v2Idx+1]=normal[1];
        normals[v2Idx+2]=normal[2];
    }
    
    return(normals);
};

//
// create UVs from vertices and normals
//

meshUVTangents.buildMeshUVs=function(bitmapIdx,vertices,normals)
{
    var n,nVertex,vIdx,arrIdx;
    var x,y,ang;
    
    nVertex=Math.floor(vertices.length/3);
    var uvs=new Float32Array(nVertex*2);
    
    arrIdx=0;
    
        // get the texture map until
        // to uv scale
        
    var uvScale=bitmap.getUVScale(bitmapIdx);
    
        // determine floor/wall like by
        // the dot product of the normal
        // and an up vector
    
    var normal=vec3.create();
    var mapUp=vec3.fromValues(0.0,-1.0,0.0);
    
        // run through the vertices
        // remember, both this and normals
        // are packed arrays
        
    for (n=0;n!==nVertex;n++) {
        
        vIdx=n*3;
        
        normal=vec3.fromValues(normals[vIdx],normals[vIdx+1],normals[vIdx+2]);
        ang=vec3.dot(mapUp,normal);
        
            // wall like
            // use longest of x/z coordinates + Y coordinates of vertex
            
        if (Math.abs(ang)<=0.4) {
            if (Math.abs(normal[0])<Math.abs(normal[2])) {
                x=vertices[vIdx];
            }
            else {
                x=vertices[vIdx+2];
            }
            //x=vertices[vIdx]+vertices[vIdx+2];
            y=vertices[vIdx+1];
        }
        
            // floor/ceiling like
            // use x/z coordinates of vertex
            
        else {
            x=vertices[vIdx];
            y=vertices[vIdx+2];
        }
        
        uvs[arrIdx++]=x*uvScale[0];
        uvs[arrIdx++]=y*uvScale[1];
    }
    
    return(uvs);
};

//
// create tangents from vertices, uvs, and normals
//

meshUVTangents.buildMeshTangents=function(vertices,uvs,indexes)
{
    var n,nTrig,nVertex,trigIdx;
    var v0Idx,v1Idx,v2Idx;
    var v0,v1,v2;
    var uv0Idx,uv1Idx,uv2Idx;
    var u10,u20,v10,v20;
    
        // default all the tangents
        // remember that these are opengl lists
        // so they are just packed arrays of floats
    
    nVertex=Math.floor(vertices.length/3);
    var tangents=new Float32Array(nVertex*3);

        // generate tangents by the trigs
        // sometimes we will end up overwriting
        // but it depends on the mesh to have
        // constant shared vertices against
        // triangle tangents
        
        // note this recreates a bit of what
        // goes on to create the normal, because
        // we need that first to make the UVs
    
    var p10=vec3.create();
    var p20=vec3.create();
    var vLeft=vec3.create();
    var vRight=vec3.create();
    var vNum=vec3.create();
    var denom;
    var tangent=vec3.create();
        
    nTrig=Math.floor(indexes.length/3);
    
    for (n=0;n!==nTrig;n++) {
        
            // get the vertex indexes and
            // the vertexes for the trig
            
            // again, packed arrays, need to
            // find vertex start in them
            
        trigIdx=n*3;
        
        v0Idx=indexes[trigIdx]*3;
        v1Idx=indexes[trigIdx+1]*3;
        v2Idx=indexes[trigIdx+2]*3;
        
        v0=vec3.fromValues(vertices[v0Idx],vertices[v0Idx+1],vertices[v0Idx+2]);
        v1=vec3.fromValues(vertices[v1Idx],vertices[v1Idx+1],vertices[v1Idx+2]);
        v2=vec3.fromValues(vertices[v2Idx],vertices[v2Idx+1],vertices[v2Idx+2]);
        
            // create vectors
            
        vec3.sub(p10,v1,v0);
        vec3.sub(p20,v2,v0);
        
            // get the UV scalars (u1-u0), (u2-u0), (v1-v0), (v2-v0)
            // uvs are packed lists of 2, so different here
        
        uv0Idx=indexes[trigIdx]*2;
        uv1Idx=indexes[trigIdx+1]*2;
        uv2Idx=indexes[trigIdx+2]*2;
        
        u10=uvs[uv1Idx]-uvs[uv0Idx];      // x component
        u20=uvs[uv2Idx]-uvs[uv0Idx];
        v10=uvs[uv1Idx+1]-uvs[uv0Idx+1];  // y component
        v20=uvs[uv2Idx+1]-uvs[uv0Idx+1];
        
			// calculate the tangent
			// (v20xp10)-(v10xp20) / (u10*v20)-(v10*u20)
            
        vec3.scale(vLeft,p10,v20);
        vec3.scale(vRight,p20,v10);
        vec3.sub(vNum,vLeft,vRight);

        denom=(u10*v20)-(v10*u20);
        if (denom!==0.0) denom=1.0/denom;
        vec3.scale(tangent,vNum,denom);
        vec3.normalize(tangent,tangent);

            // and set the mesh normal
            // to all vertexes in this trig
            
        tangents[v0Idx]=tangent[0];
        tangents[v0Idx+1]=tangent[1];
        tangents[v0Idx+2]=tangent[2];
            
        tangents[v1Idx]=tangent[0];
        tangents[v1Idx+1]=tangent[1];
        tangents[v1Idx+2]=tangent[2];
        
        tangents[v2Idx]=tangent[0];
        tangents[v2Idx+1]=tangent[1];
        tangents[v2Idx+2]=tangent[2];
    }

    return(tangents);
};
