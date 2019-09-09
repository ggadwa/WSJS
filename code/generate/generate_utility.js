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
            
    static buildUVs(vertexArray,normalArray,uvArray,uvScale)
    {
        let n,k,nVertex,offset;
        let x,y,ang,mapUp;
        let minIntX,minIntY;
        
        let v=new PointClass(0.0,0.0,0.0);
        let normal=new PointClass(0.0,0.0,0.0);

        nVertex=Math.trunc(vertexArray.length/3);

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
    }
    
        //
        // build tangents
        //

    static buildTangents(vertexArray,uvArray,tangentArray,indexArray)
    {
        let n,nTrig,trigIdx,offset;
        let u10,u20,v10,v20;

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
    }
    
        //
        // deleted shared triangles
        //
        
    static deleteTriangleFromIndexes(indexArray,iIdx)
    {
        let n,idx;
        let nIndex=indexArray.length;
        let clippedIndexes=new Uint16Array(nIndex-3);
        
        idx=0;
        
        for (n=0;n!==iIdx;n++) {
            clippedIndexes[idx++]=indexArray[n];
        }
        
        for (n=(iIdx+3);n<nIndex;n++) {
            clippedIndexes[idx++]=indexArray[n];
        }
        
        return(clippedIndexes);
    }
    
    static deleteSharedTriangles(meshList)
    {
        let n,k,nMesh;
        let mesh,mesh2;
        let iIdx,iIdx2,nIndex,nIndex2;
        let x0,y0,z0,x1,y1,z1,x2,y2,z2,hit;
        
        nMesh=meshList.meshes.length;
        
        for (n=0;n!==nMesh;n++) {
            mesh=meshList.meshes[n];
            
            for (k=(n+1);k<nMesh;k++) {
                mesh2=meshList.meshes[k];
                
                    // run through all the trigs, pulling
                    // out batches of indexes that are shared
                    
                nIndex=mesh.indexArray.length;
                nIndex2=mesh2.indexArray.length;
                
                iIdx=0;
                
                while (iIdx<nIndex) {
                    
                    x0=mesh.vertexArray[(mesh.indexArray[iIdx]*3)];
                    y0=mesh.vertexArray[(mesh.indexArray[iIdx]*3)+1];
                    z0=mesh.vertexArray[(mesh.indexArray[iIdx]*3)+2];
                    
                    x1=mesh.vertexArray[(mesh.indexArray[iIdx+1]*3)];
                    y1=mesh.vertexArray[(mesh.indexArray[iIdx+1]*3)+1];
                    z1=mesh.vertexArray[(mesh.indexArray[iIdx+1]*3)+2];
                    
                    x2=mesh.vertexArray[(mesh.indexArray[iIdx+2]*3)];
                    y2=mesh.vertexArray[(mesh.indexArray[iIdx+2]*3)+1];
                    z2=mesh.vertexArray[(mesh.indexArray[iIdx+2]*3)+2];
                    
                    iIdx+=3;
                    continue;
                    
                    iIdx2=0;
                    hit=false;
                    
                    while (iIdx2<nIndex2) {
                        
                        if ((x0===mesh2.vertexArray[(mesh2.indexArray[iIdx2]*3)]) && (x1===mesh2.vertexArray[(mesh2.indexArray[iIdx2+1]*3)]) && (x2===mesh2.vertexArray[(mesh2.indexArray[iIdx2+2]*3)]) &&
                            (y0===mesh2.vertexArray[(mesh2.indexArray[iIdx2]*3)+1]) && (y1===mesh2.vertexArray[(mesh2.indexArray[iIdx2+1]*3)+1]) && (y2===mesh2.vertexArray[(mesh2.indexArray[iIdx2+2]*3)+1]) &&
                            (z0===mesh2.vertexArray[(mesh2.indexArray[iIdx2]*3)+2]) && (z1===mesh2.vertexArray[(mesh2.indexArray[iIdx2+1]*3)+2]) && (z2===mesh2.vertexArray[(mesh2.indexArray[iIdx2+2]*3)+2])) {

                                // delete them
                                
                            mesh.replaceIndexArray(this.deleteTriangleFromIndexes(mesh.indexArray,iIdx));
                            mesh2.replaceIndexArray(this.deleteTriangleFromIndexes(mesh2.indexArray,iIdx2));
                            
                            hit=true;
                            
                            break;
                        }
                        
                        iIdx2+=3;
                    }
                    
                    if (hit) break;
                    
                    iIdx+=3;
                }
                
            }
            
        }
    }
}
