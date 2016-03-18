"use strict";

//
// mesh utility class (static)
//

class MeshUtilityClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // utility to create vertex lists
        //
        
    static createMapVertexList(nVertex)
    {
        var n;
        var vertexList=[];
        
        for (n=0;n!==nVertex;n++) {
            vertexList.push(new MapMeshVertexClass());
        }
        
        return(vertexList);
    }
    
    static createModelVertexList(nVertex)
    {
        var n;
        var vertexList=[];
        
        for (n=0;n!==nVertex;n++) {
            vertexList.push(new ModelMeshVertexClass());
        }
        
        return(vertexList);
    }
    
        //
        // combine vertex lists and indexes
        //
    
    static combineVertexLists(vertexList1,vertexList2)
    {
        var n;
        var vertexList=[];
        
        for (n=0;n!==vertexList1.length;n++) {
            vertexList.push(vertexList1[n]);
        }
        for (n=0;n!==vertexList2.length;n++) {
            vertexList.push(vertexList2[n]);
        }
        
        return(vertexList);
    }
    
    static combineIndexes(indexes1,indexes2,index2Offset)
    {
        var n;
        var indexes=new Uint16Array(indexes1.length+indexes2.length);
        
        var idx=0;
        
        for (n=0;n!==indexes1.length;n++) {
            indexes[idx++]=indexes1[n];
        }
        
        for (n=0;n!==indexes2.length;n++) {
            indexes[idx++]=indexes2[n]+index2Offset;
        }
        
        return(indexes);
    }
        
        //
        // build normals for vertex lists
        //
    
    static buildVertexListNormals(vertexList,indexes,meshCenterPoint,normalsIn)
    {
        var n,flip,nTrig,nVertex,trigIdx;
        var v0,v1,v2;

        nVertex=vertexList.length;

            // determine the center of the vertices
            // this will be used later to determine if
            // normals should be flipped (for models
            // normals always face out)

        var meshCenter;
        
        if (meshCenterPoint!==null) {
            meshCenter=meshCenterPoint;
        }
        else {
            meshCenter=new wsPoint(0.0,0.0,0.0);
            
            for (n=0;n!==nVertex;n++) {
                meshCenter.addPoint(vertexList[n].position);
            }

            meshCenter.x/=nVertex;
            meshCenter.y/=nVertex;
            meshCenter.z/=nVertex;
        }
        
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

        nTrig=Math.trunc(indexes.length/3);

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

            trigCenter.setFromValues(((v0.position.x+v1.position.x+v2.position.x)/3),((v0.position.y+v1.position.y+v2.position.y)/3),((v0.position.z+v1.position.z+v2.position.z)/3));
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
    }
    
        //
        // build UVs for vertex lists
        //
            
    static buildVertexListUVs(bitmap,vertexList)
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
        var minIntX=Math.trunc(v.uv.x);
        var minIntY=Math.trunc(v.uv.y);
        
        for (n=1;n!==nVertex;n++) {
            v=vertexList[n];
            
            i=Math.trunc(v.uv.x);
            if (i<minIntX) minIntX=i;
            i=Math.trunc(v.uv.y);
            if (i<minIntY) minIntY=i;
        }
        
        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            v.uv.x-=minIntX;
            v.uv.y-=minIntY;
        }
    }
    
        //
        // transform UVs
        //
        
    static transformUVs(vertexList,uAdd,vAdd,uReduce,vReduce)
    {
        var n,nVertex;
        var v;
        
        nVertex=vertexList.length;
        
        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            v.uv.x=(v.uv.x*uReduce)+uAdd;
            v.uv.y=(v.uv.y*vReduce)+vAdd;
        }
    }

        //
        // build tangents from vertex lists
        //

    static buildVertexListTangents(vertexList,indexes)
    {
        var n,nTrig,trigIdx;
        var v0,v1,v2;
        var u10,u20,v10,v20;

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

        nTrig=Math.trunc(indexes.length/3);

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
    }
    
        //
        // rotate vertexes
        //
        
    static rotateVertexes(vertexList,centerPt,ang)
    {
        var n,nVertex;
        
        nVertex=vertexList.length;
        
        for (n=0;n!==nVertex;n++) {
            vertexList[n].position.rotateAroundPoint(centerPt,ang);
        }
    }
    
}
