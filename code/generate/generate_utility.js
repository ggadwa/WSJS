import PointClass from '../utility/point.js';

export default class GenerateUtilityClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // build UVs for vertex lists
        //
            
    static buildUVs(vertexArray,normalArray,uvScale)
    {
        let n,k,nVertex,offset;
        let x,y,ang,mapUp;
        let minIntX,minIntY;
        let uvArray;
        
        let v=new PointClass(0.0,0.0,0.0);
        let normal=new PointClass(0.0,0.0,0.0);

        nVertex=Math.trunc(vertexArray.length/3);
        
        uvArray=new Float32Array(nVertex*2);

            // determine floor/wall like by
            // the dot product of the normal
            // and an up vector

        mapUp=new PointClass(0.0,1.0,0.0);

            // run through the vertices
            // remember, both this and normals
            // are packed arrays

        for (n=0;n!==nVertex;n++) {

            offset=n*3;
            v.x=vertexArray[offset];
            v.y=vertexArray[offset+1];
            v.z=vertexArray[offset+2];
            
            normal.x=normalArray[offset];
            normal.y=normalArray[offset+1];
            normal.z=normalArray[offset+2];

            ang=mapUp.dot(normal);

                // wall like
                // use longest of x/z coordinates + Y coordinates of vertex

            if (Math.abs(ang)<=0.4) {
                if (Math.abs(normal.x)<Math.abs(normal.z)) {
                    x=v.x;
                }
                else {
                    x=v.z;
                }
                y=v.y;
            }

                // floor/ceiling like
                // use x/z coordinates of vertex

            else {
                x=v.x;
                y=v.z;
            }
            
            offset=n*2;
            uvArray[offset]=x*uvScale;
            uvArray[offset+1]=y*uvScale;
        }
        
            // reduce all the UVs to
            // their minimum integers
         
        minIntX=Math.trunc(uvArray[0]);
        minIntY=Math.trunc(uvArray[1]);
        
        for (n=1;n!==nVertex;n++) {
            offset=n*2;
            
            k=Math.trunc(uvArray[offset]);
            if (k<minIntX) minIntX=k;
            k=Math.trunc(uvArray[offset+1]);
            if (k<minIntY) minIntY=k;
        }
        
        for (n=0;n!==nVertex;n++) {
            offset=n*2;
            uvArray[offset]-=minIntX;
            uvArray[offset+1]-=minIntY;
        }
        
        return(uvArray);
    }
    
        //
        // build normals
        //
        
    static buildNormals(vertexArray,indexArray,meshCenterPoint,normalsIn)
    {
        let n,flip,nTrig,nVertex,trigIdx,offset;
        let v0,v1,v2,normalArray;
        let meshCenter,trigCenter,faceVct;
        let p10,p20,normal;

        normalArray=new Float32Array(vertexArray.length);

            // determine the center of the vertices
            // this will be used later to determine if
            // normals should be flipped (for models
            // normals always face out)
        
        if (meshCenterPoint!==null) {
            meshCenter=meshCenterPoint;
        }
        else {
            nVertex=Math.trunc(vertexArray.length/3);
            meshCenter=new PointClass(0.0,0.0,0.0);
            
            for (n=0;n!==nVertex;n++) {
                trigIdx=n*3;
                meshCenter.addValues(vertexArray[trigIdx],vertexArray[trigIdx+1],vertexArray[trigIdx+2]);
            }

            meshCenter.x/=nVertex;
            meshCenter.y/=nVertex;
            meshCenter.z/=nVertex;
        }
        
        trigCenter=new PointClass(0.0,0.0,0.0);
        faceVct=new PointClass(0.0,0.0,0.0);

            // generate normals by the trigs
            // sometimes we will end up overwriting
            // but it depends on the mesh to have
            // constant shared vertices against
            // triangle normals

        v0=new PointClass(0.0,0.0,0.0);
        v1=new PointClass(0.0,0.0,0.0);
        v2=new PointClass(0.0,0.0,0.0);
        p10=new PointClass(0.0,0.0,0.0);
        p20=new PointClass(0.0,0.0,0.0);
        normal=new PointClass(0.0,0.0,0.0);

        nTrig=Math.trunc(indexArray.length/3);

        for (n=0;n!==nTrig;n++) {

                // get the vertex indexes and
                // the vertexes for the trig

            trigIdx=n*3;
            
            offset=indexArray[trigIdx]*3;
            v0.x=vertexArray[offset];
            v0.y=vertexArray[offset+1];
            v0.z=vertexArray[offset+2];
            
            offset=indexArray[trigIdx+1]*3;
            v1.x=vertexArray[offset];
            v1.y=vertexArray[offset+1];
            v1.z=vertexArray[offset+2];

            offset=indexArray[trigIdx+2]*3;
            v2.x=vertexArray[offset];
            v2.y=vertexArray[offset+1];
            v2.z=vertexArray[offset+2];

                // create vectors and calculate the normal
                // by the cross product

            p10.setFromSubPoint(v1,v0);
            p20.setFromSubPoint(v2,v0);
            normal.setFromCross(p10,p20);
            normal.normalize();

                // determine if we need to flip
                // we can use the dot product to tell
                // us if the normal is pointing
                // more towards the center or more
                // away from it

            trigCenter.setFromValues(((v0.x+v1.x+v2.x)/3),((v0.y+v1.y+v2.y)/3),((v0.z+v1.z+v2.z)/3));
            faceVct.setFromSubPoint(trigCenter,meshCenter);

            flip=(normal.dot(faceVct)>0.0);
            if (!normalsIn) flip=!flip;

            if (flip) normal.scale(-1.0);

                // and set the mesh normal
                // to all vertexes in this trig

            offset=indexArray[trigIdx]*3;
            normalArray[offset]=normal.x;
            normalArray[offset+1]=normal.y;
            normalArray[offset+2]=normal.z;

            offset=indexArray[trigIdx+1]*3;
            normalArray[offset]=normal.x;
            normalArray[offset+1]=normal.y;
            normalArray[offset+2]=normal.z;
            
            offset=indexArray[trigIdx+2]*3;
            normalArray[offset]=normal.x;
            normalArray[offset+1]=normal.y;
            normalArray[offset+2]=normal.z;
        }
        
        return(normalArray);
    }
    
        //
        // build tangents
        //

    static buildTangents(vertexArray,uvArray,indexArray)
    {
        let n,nTrig,trigIdx,offset;
        let u10,u20,v10,v20;
        let tangentArray;

            // generate tangents by the trigs
            // sometimes we will end up overwriting
            // but it depends on the mesh to have
            // constant shared vertices against
            // triangle tangents

            // note this recreates a bit of what
            // goes on to create the normal, because
            // we need that first to make the UVs

        let v0=new PointClass(0.0,0.0,0.0);
        let v1=new PointClass(0.0,0.0,0.0);
        let v2=new PointClass(0.0,0.0,0.0);
        let uv0=new PointClass(0.0,0.0,0.0);
        let uv1=new PointClass(0.0,0.0,0.0);
        let uv2=new PointClass(0.0,0.0,0.0);
        let p10=new PointClass(0.0,0.0,0.0);
        let p20=new PointClass(0.0,0.0,0.0);
        let vLeft=new PointClass(0.0,0.0,0.0);
        let vRight=new PointClass(0.0,0.0,0.0);
        let vNum=new PointClass(0.0,0.0,0.0);
        let denom;
        let tangent=new PointClass(0.0,0.0,0.0);

        nTrig=Math.trunc(indexArray.length/3);
        
        tangentArray=new Float32Array(vertexArray.length);

        for (n=0;n!==nTrig;n++) {

                // get the vertex indexes and
                // the vertexes for the trig

            trigIdx=n*3;
            
            offset=indexArray[trigIdx]*3;
            v0.x=vertexArray[offset];
            v0.y=vertexArray[offset+1];
            v0.z=vertexArray[offset+2];
            
            offset=indexArray[trigIdx]*2;
            uv0.x=uvArray[offset];
            uv0.y=uvArray[offset+1];
            
            offset=indexArray[trigIdx+1]*3;
            v1.x=vertexArray[offset];
            v1.y=vertexArray[offset+1];
            v1.z=vertexArray[offset+2];
            
            offset=indexArray[trigIdx+1]*2;
            uv1.x=uvArray[offset];
            uv1.y=uvArray[offset+1];

            offset=indexArray[trigIdx+2]*3;
            v2.x=vertexArray[offset];
            v2.y=vertexArray[offset+1];
            v2.z=vertexArray[offset+2];
            
            offset=indexArray[trigIdx+2]*2;
            uv2.x=uvArray[offset];
            uv2.y=uvArray[offset+1];

                // create vectors

            p10.setFromSubPoint(v1,v0);
            p20.setFromSubPoint(v2,v0);

                // get the UV scalars (u1-u0), (u2-u0), (v1-v0), (v2-v0)

            u10=uv1.x-uv0.x;        // x component
            u20=uv2.x-uv0.x;
            v10=uv1.y-uv0.y;        // y component
            v20=uv2.y-uv0.y;

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
                
            offset=indexArray[trigIdx]*3;
            tangentArray[offset]=tangent.x;
            tangentArray[offset+1]=tangent.y;
            tangentArray[offset+2]=tangent.z;

            offset=indexArray[trigIdx+1]*3;
            tangentArray[offset]=tangent.x;
            tangentArray[offset+1]=tangent.y;
            tangentArray[offset+2]=tangent.z;
            
            offset=indexArray[trigIdx+2]*3;
            tangentArray[offset]=tangent.x;
            tangentArray[offset+1]=tangent.y;
            tangentArray[offset+2]=tangent.z;
        }
        
        return(tangentArray);
    }
}
