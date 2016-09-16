"use strict";

//
// gen projectile mesh class
//

class GenModelProjectileMeshClass
{
    constructor(model,bitmap)
    {
        this.model=model;
        this.bitmap=bitmap;
        
        Object.seal(this);
    }
    
    buildBoxAroundPoint(centerPt,sz,vertexList,indexes)
    {
        var n,v;
        var idx=0;
        
        var xBound=new wsBound((centerPt.x-sz),(centerPt.x+sz));
        var yBound=new wsBound((centerPt.y-(sz*2)),centerPt.y);
        var zBound=new wsBound((centerPt.z-sz),(centerPt.z+sz));
        
            // left
            
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min); 
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);        
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);     
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);    
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);  
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);

             // right

        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);

            // front

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);

            // back

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);

            // top

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);

            // bottom

        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);
        
        for (n=0;n!==36;n++) {
            indexes[n]=n;
        }

            // build whole UVs

        idx=0;

        for (n=0;n!==6;n++) {
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
        
            // finish with normals and tangents
        
        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,centerPt,false);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
    }
        
        //
        // build projectile mesh
        //

    build()
    {
        var vertexList=MeshUtilityClass.createModelVertexList(36);
        var indexes=new Uint16Array(36);
        
        this.buildBoxAroundPoint(new wsPoint(0,0,0),200,vertexList,indexes);
        
            // add mesh to model
            
        this.model.mesh=new ModelMeshClass(this.bitmap,vertexList,indexes,0);
        this.model.mesh.setupBuffers();
    }
    
}
