"use strict";

//
// mesh utility class
//

function MeshUtilityObject()
{
        //
        // utility to create vertex list of certain size
        //
        
    this.createMapVertexList=function(nVertex)
    {
        var n;
        var vertexList=[];
        
        for (n=0;n!==nVertex;n++) {
            vertexList.push(new MapMeshVertexObject());
        }
        
        return(vertexList);
    };
    
        //
        // build normals for map meshes
        // 

    this.buildMapMeshNormalsFromChunk=function(vertices,vIdxStart,vIdxLength,indexes,iIdxStart,iIdxLength,normals,normalsIn)
    {
        var n,nTrig,nVertex,trigIdx;
        var idx,v0Idx,v1Idx,v2Idx;
        var v0=new wsPoint(0.0,0.0,0.0);
        var v1=new wsPoint(0.0,0.0,0.0);
        var v2=new wsPoint(0.0,0.0,0.0);
        var flat;

            // default all the normals
            // remember that these are opengl lists
            // so they are just packed arrays of floats

        nVertex=Math.floor(vIdxLength/3);

            // determine the center of the vertices
            // this will be used later to determine if
            // normals should be flipped (i.e., normals in
            // or out, a mesh is meant to be inside or
            // outside

        var meshCenter=new wsPoint(0.0,0.0,0.0);

        idx=vIdxStart;

        for (n=0;n!==nVertex;n++) {
            meshCenter.x+=vertices[idx++];
            meshCenter.y+=vertices[idx++];
            meshCenter.z+=vertices[idx++];
        }

        meshCenter.x/=nVertex;
        meshCenter.y/=nVertex;
        meshCenter.z/=nVertex;

        var trigCenter=new wsPoint(0.0,0.0,0.0);
        var faceVct=new wsPoint(0.0,0.0,0.0);
        var flip;

            // generate normals by the trigs
            // sometimes we will end up overwriting
            // but it depends on the mesh to have
            // constant shared vertices against
            // triangle normals

        var p10=new wsPoint(0.0,0.0,0.0);
        var p20=new wsPoint(0.0,0.0,0.0);
        var normal=new wsPoint(0.0,0.0,0.0);

        nTrig=Math.floor(iIdxLength/3);

        for (n=0;n!==nTrig;n++) {

                // get the vertex indexes and
                // the vertexes for the trig

                // again, packed arrays, need to
                // find vertex start in them

            trigIdx=iIdxStart+(n*3);

            v0Idx=indexes[trigIdx]*3;
            v1Idx=indexes[trigIdx+1]*3;
            v2Idx=indexes[trigIdx+2]*3;

            v0.set(vertices[v0Idx],vertices[v0Idx+1],vertices[v0Idx+2]);
            v1.set(vertices[v1Idx],vertices[v1Idx+1],vertices[v1Idx+2]);
            v2.set(vertices[v2Idx],vertices[v2Idx+1],vertices[v2Idx+2]);

                // detect special flat surfaces that have
                // predictable normals

            flat=false;

            if ((v0.x===v1.x) && (v0.x===v2.x)) {
                flat=true;
                normal.set(-1.0,0.0,0.0);
            }
            else {
                if ((v0.y===v1.y) && (v0.y===v2.y)) {
                    flat=true;
                    normal.set(0.0,-1.0,0.0);
                }
                else {
                    if ((v0.z===v1.z) && (v0.z===v2.z)) {
                        flat=true;
                        normal.set(0.0,0.0,-1.0);
                    }   
                }
            }

                // create vectors and calculate the normal
                // by the cross product

            if (!flat) {
                p10.setFromSubPoint(v1,v0);
                p20.setFromSubPoint(v2,v0);
                normal.setFromCross(p10,p20);
                normal.normalize();
            }

                // determine if we need to flip
                // we can use the dot product to tell
                // us if the normal is pointing
                // more towards the center or more
                // away from it

            trigCenter.set(((v0.x+v1.x+v2.x)/3),((v0.y+v1.y+v2.y)/3),((v0.z+v1.z+v2.z)/3));
            faceVct.setFromSubPoint(trigCenter,meshCenter);

            flip=(normal.dot(faceVct)>0.0);
            if (!normalsIn) flip=!flip;

            if (flip) normal.scale(-1.0);

                // and set the mesh normal
                // to all vertexes in this trig

            normals[v0Idx]=normal.x;
            normals[v0Idx+1]=normal.y;
            normals[v0Idx+2]=normal.z;

            normals[v1Idx]=normal.x;
            normals[v1Idx+1]=normal.y;
            normals[v1Idx+2]=normal.z;

            normals[v2Idx]=normal.x;
            normals[v2Idx+1]=normal.y;
            normals[v2Idx+2]=normal.z;
        }

        return(normals);
    };
    
    this.buildMapMeshNormals=function(vertices,indexes,normalsIn)
    {
        var normals=new Float32Array(vertices.length);
        this.buildMapMeshNormalsFromChunk(vertices,0,vertices.length,indexes,0,indexes.length,normals,normalsIn);
        
        return(normals);
    };
    
        //
        // build normals for model meshes
        //
    
    this.buildModelMeshNormals=function(vertexList,indexes,normalsIn)
    {
        var n,flip,nTrig,nVertex,trigIdx;
        var v0,v1,v2;

        nVertex=vertexList.length;

            // determine the center of the vertices
            // this will be used later to determine if
            // normals should be flipped (for models
            // normals always face out)

        var meshCenter=new wsPoint(0.0,0.0,0.0);

        for (n=0;n!==nVertex;n++) {
            meshCenter.addPoint(vertexList[n].position);
        }

        meshCenter.x/=nVertex;
        meshCenter.y/=nVertex;
        meshCenter.z/=nVertex;

        var trigCenter=new wsPoint(0.0,0.0,0.0);
        var faceVct=new wsPoint(0.0,0.0,0.0);

            // generate normals by the trigs
            // sometimes we will end up overwriting
            // but it depends on the mesh to have
            // constant shared vertices against
            // triangle normals

        var p10=new wsPoint(0.0,0.0,0.0);
        var p20=new wsPoint(0.0,0.0,0.0);
        var normal=new wsPoint(0.0,0.0,0.0);

        nTrig=Math.floor(indexes.length/3);

        for (n=0;n!==nTrig;n++) {

                // get the vertex indexes and
                // the vertexes for the trig

            trigIdx=n*3;

            v0=vertexList[indexes[trigIdx]];
            v1=vertexList[indexes[trigIdx+1]];
            v2=vertexList[indexes[trigIdx+2]];

                // create vectors and calculate the normal
                // by the cross product

            p10.setFromSubPoint(v1.position,v0.position);
            p20.setFromSubPoint(v2.position,v0.position);
            normal.setFromCross(p10,p20);
            normal.normalize();

                // determine if we need to flip
                // we can use the dot product to tell
                // us if the normal is pointing
                // more towards the center or more
                // away from it

            trigCenter.set(((v0.position.x+v1.position.x+v2.position.x)/3),((v0.position.y+v1.position.y+v2.position.y)/3),((v0.position.z+v1.position.z+v2.position.z)/3));
            faceVct.setFromSubPoint(trigCenter,meshCenter);

            flip=(normal.dot(faceVct)>0.0);
            if (!normalsIn) flip=!flip;

            if (flip) normal.scale(-1.0);

                // and set the mesh normal
                // to all vertexes in this trig

            v0.normal.setFromPoint(normal);
            v1.normal.setFromPoint(normal);
            v2.normal.setFromPoint(normal);
        }
    };
    
        //
        // build UVs for map meshes
        //
        
    this.buildMapMeshUVs=function(bitmap,vertices,normals)
    {
        var n,nVertex,vIdx,arrIdx;
        var x,y,ang;

        nVertex=Math.floor(vertices.length/3);
        var uvs=new Float32Array(nVertex*2);

        arrIdx=0;

            // get the UV scale for this
            // bitmap

        var uvScale=bitmap.uvScale;

            // determine floor/wall like by
            // the dot product of the normal
            // and an up vector

        var normal=new wsPoint(0.0,0.0,0.0);
        var mapUp=new wsPoint(0.0,-1.0,0.0);

            // run through the vertices
            // remember, both this and normals
            // are packed arrays

        for (n=0;n!==nVertex;n++) {

            vIdx=n*3;

            normal.set(normals[vIdx],normals[vIdx+1],normals[vIdx+2]);
            ang=mapUp.dot(normal);

                // wall like
                // use longest of x/z coordinates + Y coordinates of vertex

            if (Math.abs(ang)<=0.4) {
                if (Math.abs(normal.x)<Math.abs(normal.z)) {
                    x=vertices[vIdx];
                }
                else {
                    x=vertices[vIdx+2];
                }
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
        
            // reduce all the UVs to
            // their minimum integers
            
        arrIdx=0;
        var i;
        var minIntX=Math.floor(uvs[arrIdx++]);
        var minIntY=Math.floor(uvs[arrIdx++]);
        
        for (n=1;n!==nVertex;n++) {
            i=Math.floor(uvs[arrIdx++]);
            if (i<minIntX) minIntX=i;
            i=Math.floor(uvs[arrIdx++]);
            if (i<minIntY) minIntY=i;
        }
        
        arrIdx=0;
        for (n=0;n!==nVertex;n++) {
            uvs[arrIdx++]-=minIntX;
            uvs[arrIdx++]-=minIntY;
        }

        return(uvs);
    };
    
    this.buildModelMeshUVs=function(bitmap,vertexList)
    {
        var n,v,nVertex;
        var x,y,ang;

        nVertex=vertexList.length;

            // get the UV scale for this
            // bitmap

        var uvScale=bitmap.uvScale;

            // determine floor/wall like by
            // the dot product of the normal
            // and an up vector

        var mapUp=new wsPoint(0.0,-1.0,0.0);

            // run through the vertices
            // remember, both this and normals
            // are packed arrays

        for (n=0;n!==nVertex;n++) {

            v=vertexList[n];

            ang=mapUp.dot(v.normal);

                // wall like
                // use longest of x/z coordinates + Y coordinates of vertex

            if (Math.abs(ang)<=0.4) {
                if (Math.abs(v.normal.x)<Math.abs(v.normal.z)) {
                    x=v.position.x;
                }
                else {
                    x=v.position.z;
                }
                y=v.position.y;
            }

                // floor/ceiling like
                // use x/z coordinates of vertex

            else {
                x=v.position.x;
                y=v.position.z;
            }

            v.uv.x=x*uvScale[0];
            v.uv.y=y*uvScale[1];
        }
        
            // reduce all the UVs to
            // their minimum integers
            
        var i;
        
        v=vertexList[0];
        var minIntX=Math.floor(v.uv.x);
        var minIntY=Math.floor(v.uv.y);
        
        for (n=1;n!==nVertex;n++) {
            v=vertexList[n];
            
            i=Math.floor(v.uv.x);
            if (i<minIntX) minIntX=i;
            i=Math.floor(v.uv.y);
            if (i<minIntY) minIntY=i;
        }
        
        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            v.uv.x-=minIntX;
            v.uv.y-=minIntY;
        }
    };

        //
        // build tangents from map meshes
        //

    this.buildMapMeshTangents=function(vertices,uvs,indexes)
    {
        var n,nTrig,nVertex,trigIdx;
        var v0Idx,v1Idx,v2Idx;
        var v0=new wsPoint(0.0,0.0,0.0);
        var v1=new wsPoint(0.0,0.0,0.0);
        var v2=new wsPoint(0.0,0.0,0.0);
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

        var p10=new wsPoint(0.0,0.0,0.0);
        var p20=new wsPoint(0.0,0.0,0.0);
        var vLeft=new wsPoint(0.0,0.0,0.0);
        var vRight=new wsPoint(0.0,0.0,0.0);
        var vNum=new wsPoint(0.0,0.0,0.0);
        var denom;
        var tangent=new wsPoint(0.0,0.0,0.0);

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

            v0.set(vertices[v0Idx],vertices[v0Idx+1],vertices[v0Idx+2]);
            v1.set(vertices[v1Idx],vertices[v1Idx+1],vertices[v1Idx+2]);
            v2.set(vertices[v2Idx],vertices[v2Idx+1],vertices[v2Idx+2]);

                // create vectors

            p10.setFromSubPoint(v1,v0);
            p20.setFromSubPoint(v2,v0);

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

            vLeft.setFromScale(p10,v20);
            vRight.setFromScale(p20,v10);
            vNum.setFromSubPoint(vLeft,vRight);

            denom=(u10*v20)-(v10*u20);
            if (denom!==0.0) denom=1.0/denom;
            tangent.setFromScale(vNum,denom);
            tangent.normalize();

                // and set the mesh normal
                // to all vertexes in this trig

            tangents[v0Idx]=tangent.x;
            tangents[v0Idx+1]=tangent.y;
            tangents[v0Idx+2]=tangent.z;

            tangents[v1Idx]=tangent.x;
            tangents[v1Idx+1]=tangent.y;
            tangents[v1Idx+2]=tangent.z;

            tangents[v2Idx]=tangent.x;
            tangents[v2Idx+1]=tangent.y;
            tangents[v2Idx+2]=tangent.z;
        }

        return(tangents);
    };
    
        //
        // build tangents from model meshes
        //

    this.buildModelMeshTangents=function(vertexList,indexes)
    {
        var n,nTrig,nVertex,trigIdx;
        var v0,v1,v2;
        var u10,u20,v10,v20;

        nVertex=vertexList.length;

            // generate tangents by the trigs
            // sometimes we will end up overwriting
            // but it depends on the mesh to have
            // constant shared vertices against
            // triangle tangents

            // note this recreates a bit of what
            // goes on to create the normal, because
            // we need that first to make the UVs

        var p10=new wsPoint(0.0,0.0,0.0);
        var p20=new wsPoint(0.0,0.0,0.0);
        var vLeft=new wsPoint(0.0,0.0,0.0);
        var vRight=new wsPoint(0.0,0.0,0.0);
        var vNum=new wsPoint(0.0,0.0,0.0);
        var denom;
        var tangent=new wsPoint(0.0,0.0,0.0);

        nTrig=Math.floor(indexes.length/3);

        for (n=0;n!==nTrig;n++) {

                // get the vertex indexes and
                // the vertexes for the trig

            trigIdx=n*3;

            v0=vertexList[indexes[trigIdx]];
            v1=vertexList[indexes[trigIdx+1]];
            v2=vertexList[indexes[trigIdx+2]];

                // create vectors

            p10.setFromSubPoint(v1.position,v0.position);
            p20.setFromSubPoint(v2.position,v0.position);

                // get the UV scalars (u1-u0), (u2-u0), (v1-v0), (v2-v0)
                // uvs are packed lists of 2, so different here

            u10=v1.uv.x-v0.uv.x;        // x component
            u20=v2.uv.x-v0.uv.x;
            v10=v1.uv.y-v0.uv.y;        // y component
            v20=v2.uv.y-v0.uv.y;

                // calculate the tangent
                // (v20xp10)-(v10xp20) / (u10*v20)-(v10*u20)

            vLeft.setFromScale(p10,v20);
            vRight.setFromScale(p20,v10);
            vNum.setFromSubPoint(vLeft,vRight);

            denom=(u10*v20)-(v10*u20);
            if (denom!==0.0) denom=1.0/denom;
            tangent.setFromScale(vNum,denom);
            tangent.normalize();

                // and set the mesh normal
                // to all vertexes in this trig

            v0.tangent.setFromPoint(tangent);
            v1.tangent.setFromPoint(tangent);
            v2.tangent.setFromPoint(tangent);
        }
    };
    
}

var meshUtility=new MeshUtilityObject();