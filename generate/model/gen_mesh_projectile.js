import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import ModelMeshClass from '../../code/model/model_mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';
import GenMeshBaseClass from '../../generate/model/gen_mesh_base.js';

//
// gen projectile mesh class
//

export default class GenModelProjectileMeshClass extends GenMeshBaseClass
{
    constructor(view,model,bitmap)
    {
        super(view,model,bitmap);
        Object.seal(this);
    }
    
    buildBoxAroundPoint(centerPt,sz,vertexList,indexes)
    {
        let n,v;
        let idx=0;
        
        let xBound=new BoundClass((centerPt.x-sz),(centerPt.x+sz));
        let yBound=new BoundClass((centerPt.y-(sz*2)),centerPt.y);
        let zBound=new BoundClass((centerPt.z-sz),(centerPt.z+sz));
        
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
        let vertexList=MeshUtilityClass.createModelVertexList(36);
        let indexes=new Uint16Array(36);
        
        this.buildBoxAroundPoint(new PointClass(0,0,0),200,vertexList,indexes);
        
            // add mesh to model
            
        this.model.mesh=new ModelMeshClass(this.view,this.bitmap,vertexList,indexes,0);
    }
    
}
