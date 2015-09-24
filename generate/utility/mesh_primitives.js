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

        var normals=meshUVTangents.buildMeshNormals(vertices,indexes,false);
        if (!wholeUV) uvs=meshUVTangents.buildMeshUVs(bitmap,vertices,normals);
        var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,flags));
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

        var normals=meshUVTangents.buildMeshNormals(vertices,indexes,false);
        var uvs=meshUVTangents.buildMeshUVs(bitmap,vertices,normals);
        var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,flags));
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

        var normals=meshUVTangents.buildMeshNormals(vertices,indexes,false);
        var uvs=meshUVTangents.buildMeshUVs(bitmap,vertices,normals);
        var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,flags));
    };
    
}

var meshPrimitives=new MeshPrimitivesObject();