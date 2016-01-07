"use strict";

//
// mesh primitives class
//

function MeshPrimitivesObject()
{
        //
        // create cube
        //

    this.createMeshCube=function(bitmap,xBound,yBound,zBound,wholeUV,left,right,front,back,top,bottom,normalsIn,flags)
    {
            // get cube size
            // note: why duplicated vertexes?  Because light map UVs

        var count=0;
        if (left) count+=6;
        if (right) count+=6;
        if (front) count+=6;
        if (back) count+=6;
        if (top) count+=6;
        if (bottom) count+=6;
        if (count===0) return(null);

        var v;
        var vertexList=meshUtility.createMapVertexList(count);

            // left

        var idx=0;

        if (left) {
            vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min); 
            vertexList[idx++].position.set(xBound.min,yBound.min,zBound.max);        
            vertexList[idx++].position.set(xBound.min,yBound.max,zBound.max);     
            vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);    
            vertexList[idx++].position.set(xBound.min,yBound.max,zBound.max);  
            vertexList[idx++].position.set(xBound.min,yBound.max,zBound.min);
        }

             // right

        if (right) {
            vertexList[idx++].position.set(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.set(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.set(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.set(xBound.max,yBound.max,zBound.min);
        }

            // front

        if (front) {
            vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.set(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.set(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.set(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.set(xBound.min,yBound.max,zBound.min);
        }

            // back

        if (back) {
            vertexList[idx++].position.set(xBound.min,yBound.min,zBound.max);
            vertexList[idx++].position.set(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.set(xBound.min,yBound.min,zBound.max);
            vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.set(xBound.min,yBound.max,zBound.max);
        }

            // top

        if (top) {
            vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.set(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.set(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.set(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.set(xBound.min,yBound.min,zBound.max);
        }

            // bottom

        if (bottom) {
            vertexList[idx++].position.set(xBound.min,yBound.max,zBound.min);
            vertexList[idx++].position.set(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.set(xBound.min,yBound.max,zBound.min);
            vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.set(xBound.min,yBound.max,zBound.max);
        }

        var n;

        var indexes=new Uint16Array(count);

        for (n=0;n!==count;n++) {
            indexes[n]=n;
        }

            // build whole UVs

        if (wholeUV) {
            
            idx=0;
            var quadCount=Math.floor(count/6);

            for (n=0;n!==quadCount;n++) {
                v=vertexList[idx++];
                v.uv.x=0.0;
                v.uv.y=0.0;
                
                v=vertexList[idx++];
                v.uv.x=1.0;
                v.uv.y=0.0;
                
                v=vertexList[idx++];
                v.uv.x=1.0;
                v.uv.y=1.0;
                
                v=vertexList[idx++];
                v.uv.x=0.0;
                v.uv.y=0.0;
                
                v=vertexList[idx++];
                v.uv.x=1.0;
                v.uv.y=1.0;
                
                v=vertexList[idx++];
                v.uv.x=0.0;
                v.uv.y=1.0;
            }  
        }

            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        meshUtility.buildVertexListNormals(vertexList,indexes,null,normalsIn);
        if (!wholeUV) meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,vertexList,indexes,flags));
    };

        //
        // create pryamid
        //

    this.createMeshPryamid=function(bitmap,xBound,yBound,zBound,flags)
    {
        var x=xBound.getMidPoint();
        var z=zBound.getMidPoint();

        var vertexList=meshUtility.createMapVertexList(12);
        
        var idx=0;

        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.set(x,yBound.max,z);

        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.set(x,yBound.max,z);

        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.set(x,yBound.max,z);

        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.set(x,yBound.max,z);

        var n;
        var indexes=new Uint16Array(12);

        for (n=0;n!==12;n++) {
            indexes[n]=n;
        }

            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        meshUtility.buildVertexListNormals(vertexList,indexes,null,false);
        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,vertexList,indexes,flags));
    };
    
        //
        // cylinders
        //
        
    this.createMeshCylinderSegmentList=function(genRandom,radius,extraRadius,segmentCount,segmentExtra)
    {
        var n;
        var segCount=genRandom.randomInt(segmentCount,segmentExtra);
        var segments=[];
        
        segments.push(radius+extraRadius);      // top always biggest
        
        for (n=0;n!==segCount;n++) {
            segments.push(genRandom.randomInt(radius,extraRadius));
        }
        
        segments.push(radius+extraRadius);      // and bottom
        
        return(segments);
    };
        
    this.createMeshCylinder=function(bitmap,centerPt,yBound,segments,flags)
    {
        var n,k,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        var topRad,botRad;
        
            // get cylder size
        
        var sideCount=12;
        var segCount=segments.length-1;     // always one extra for top
        
        var vertexList=meshUtility.createMapVertexList(segCount*(sideCount*6));
        var indexes=new Uint16Array(segCount*(sideCount*6));

        var iCount=sideCount*6;
        
        var vIdx=0;
        var iIdx=0;
        
            // cylinder segments
            
        var yAdd=Math.floor(yBound.getSize()/segCount);
            
        var ySegBound=yBound.copy();
        ySegBound.min=ySegBound.max-yAdd;
        
        botRad=segments[0];
            
        for (k=0;k!==segCount;k++) {
            
                // new radius
                
            topRad=segments[k+1];

                // cyliner faces

            var ang=0.0;
            var ang2;
            var angAdd=360.0/sideCount;

            for (n=0;n!==sideCount;n++) {
                ang2=ang+angAdd;
                if (n===(sideCount-1)) ang2=0.0;

                rd=ang*DEGREE_TO_RAD;
                tx=centerPt.x+((topRad*Math.sin(rd))+(topRad*Math.cos(rd)));
                tz=centerPt.z+((topRad*Math.cos(rd))-(topRad*Math.sin(rd)));
                
                bx=centerPt.x+((botRad*Math.sin(rd))+(botRad*Math.cos(rd)));
                bz=centerPt.z+((botRad*Math.cos(rd))-(botRad*Math.sin(rd)));

                rd=ang2*DEGREE_TO_RAD;
                tx2=centerPt.x+((topRad*Math.sin(rd))+(topRad*Math.cos(rd)));
                tz2=centerPt.z+((topRad*Math.cos(rd))-(topRad*Math.sin(rd)));
                
                bx2=centerPt.x+((botRad*Math.sin(rd))+(botRad*Math.cos(rd)));
                bz2=centerPt.z+((botRad*Math.cos(rd))-(botRad*Math.sin(rd)));

                vertexList[vIdx++].position.set(tx,ySegBound.min,tz);
                vertexList[vIdx++].position.set(tx2,ySegBound.min,tz2);
                vertexList[vIdx++].position.set(bx,ySegBound.max,bz);
                vertexList[vIdx++].position.set(tx2,ySegBound.min,tz2);
                vertexList[vIdx++].position.set(bx2,ySegBound.max,bz2);
                vertexList[vIdx++].position.set(bx,ySegBound.max,bz);

                ang=ang2;
            }

            for (n=0;n!==iCount;n++) {
                indexes[iIdx+n]=iIdx+n;
            }
            
            iIdx+=iCount;
            botRad=topRad;
            
            ySegBound.max=ySegBound.min;
            ySegBound.min-=yAdd;
        }

            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        meshUtility.buildVertexListNormals(vertexList,indexes,null,false);
        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,vertexList,indexes,flags));
    };
    
}

var meshPrimitives=new MeshPrimitivesObject();