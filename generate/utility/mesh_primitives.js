"use strict";

//
// mesh primitives class
//

function MeshPrimitivesObject()
{
        //
        // create cube
        //

    this.createMeshCube=function(bitmap,xBound,yBound,zBound,wholeUV,left,right,front,back,top,bottom,flags)
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
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.min;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.min;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.max;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.min;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.max;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.max;
            v.position.z=zBound.min;
        }

             // right

        if (right) {
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.min;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.min;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.max;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.min;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.max;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.max;
            v.position.z=zBound.min;
        }

            // front

        if (front) {
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.min;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.min;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.max;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.min;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.max;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.max;
            v.position.z=zBound.min;
        }

            // back

        if (back) {
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.min;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.min;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.max;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.min;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.max;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.max;
            v.position.z=zBound.max;
        }

            // top

        if (top) {
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.min;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.min;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.min;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.min;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.min;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.min;
            v.position.z=zBound.max;
        }

            // bottom

        if (bottom) {
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.max;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.max;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.max;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.max;
            v.position.z=zBound.min;
            
            v=vertexList[idx++];
            v.position.x=xBound.max;
            v.position.y=yBound.max;
            v.position.z=zBound.max;
            
            v=vertexList[idx++];
            v.position.x=xBound.min;
            v.position.y=yBound.max;
            v.position.z=zBound.max;
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

        meshUtility.buildModelMeshNormals(vertexList,indexes,false);
        if (!wholeUV) meshUtility.buildModelMeshUVs(bitmap,vertexList);
        meshUtility.buildModelMeshTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,vertexList,null,null,null,null,indexes,flags));
    };

        //
        // create pryamid
        //

    this.createMeshPryamid=function(bitmap,xBound,yBound,zBound,flags)
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

        var normals=meshUtility.buildMapMeshNormals(vertices,indexes,false);
        var uvs=meshUtility.buildMapMeshUVs(bitmap,vertices,normals);
        var tangents=meshUtility.buildMapMeshTangents(vertices,uvs,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,null,vertices,normals,tangents,uvs,indexes,flags));
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
        
        var vertexCount=segCount*(sideCount*18);
        var indexCount=segCount*(sideCount*6);
        var iCount=sideCount*6;

        var vertices=new Float32Array(vertexCount);
        var indexes=new Uint16Array(indexCount);
        
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

                vertices[vIdx++]=tx;
                vertices[vIdx++]=ySegBound.min;
                vertices[vIdx++]=tz;
                vertices[vIdx++]=tx2;
                vertices[vIdx++]=ySegBound.min;
                vertices[vIdx++]=tz2;
                vertices[vIdx++]=bx;
                vertices[vIdx++]=ySegBound.max;
                vertices[vIdx++]=bz;

                vertices[vIdx++]=tx2;
                vertices[vIdx++]=ySegBound.min;
                vertices[vIdx++]=tz2;
                vertices[vIdx++]=bx2;
                vertices[vIdx++]=ySegBound.max;
                vertices[vIdx++]=bz2;
                vertices[vIdx++]=bx;
                vertices[vIdx++]=ySegBound.max;
                vertices[vIdx++]=bz;

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

        var normals=meshUtility.buildMapMeshNormals(vertices,indexes,false);
        var uvs=meshUtility.buildMapMeshUVs(bitmap,vertices,normals);
        var tangents=meshUtility.buildMapMeshTangents(vertices,uvs,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,null,vertices,normals,tangents,uvs,indexes,flags));
    };
    
}

var meshPrimitives=new MeshPrimitivesObject();