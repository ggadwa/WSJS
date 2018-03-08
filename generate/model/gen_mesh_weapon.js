import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import ModelMeshClass from '../../code/model/model_mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';
import GenMeshBaseClass from '../../generate/model/gen_mesh_base.js';

//
// gen weapon mesh class
//

export default class GenModelWeaponMeshClass extends GenMeshBaseClass
{
    constructor(view,model,bitmap)
    {
        super(view,model,bitmap);

            //
            // counts for vertex/uvs/indexes
            //

        this.BOX_VERTEX_COUNT=24;
        this.BOX_NORMAL_COUNT=this.BOX_VERTEX_COUNT;
        this.BOX_UV_COUNT=16;
        this.BOX_INDEX_COUNT=24;

        this.CYLINDER_SIDE_COUNT=12;
        this.CYLINDER_VERTEX_COUNT=((this.CYLINDER_SIDE_COUNT*3)*2);
        this.CYLINDER_INDEX_COUNT=(this.CYLINDER_SIDE_COUNT*6);
        
        Object.seal(this);
    }
       
        //
        // build cylinders around two points
        //
        
    buildCylinderAroundTwoPoints(pt1,pt2,radius1,radius2,vertexList,indexes)
    {
        let n,v,rd,vIdx,iIdx,v2Idx;
        let tx,ty,bx,by;
        let uAng,ang,angAdd;
        
            // build the vertexes and uvs
            // around the two points
            
        vIdx=0;
            
        ang=0.0;
        angAdd=360.0/this.CYLINDER_SIDE_COUNT;

        for (n=0;n!==this.CYLINDER_SIDE_COUNT;n++) {
            rd=ang*constants.DEGREE_TO_RAD;
            tx=pt1.x+((radius1*Math.sin(rd))+(radius1*Math.cos(rd)));
            ty=pt1.y+((radius1*Math.cos(rd))-(radius1*Math.sin(rd)));

            bx=pt2.x+((radius2*Math.sin(rd))+(radius2*Math.cos(rd)));
            by=pt2.y+((radius2*Math.cos(rd))-(radius2*Math.sin(rd)));
            
            uAng=ang/360.0;
            
            v=vertexList[vIdx++];
            v.position.setFromValues(tx,ty,pt1.z);
            v.uv.setFromValues(uAng,0.0);
            v.normal.setFromSubPoint(v.position,pt1);
            v.normal.normalize();
            
            v=vertexList[vIdx++];
            v.position.setFromValues(bx,by,pt2.z);
            v.uv.setFromValues(uAng,1.0);
            v.normal.setFromSubPoint(v.position,pt2);
            v.normal.normalize();

            ang+=angAdd;
        }
        
            // build the triangles to
            // complete the cylinder
            
        vIdx=0;
        iIdx=0;
        
        for (n=0;n!==this.CYLINDER_SIDE_COUNT;n++) {
            v2Idx=vIdx+2;
            if (n===(this.CYLINDER_SIDE_COUNT-1)) v2Idx=0;
            
            indexes[iIdx++]=vIdx;
            indexes[iIdx++]=v2Idx;
            indexes[iIdx++]=vIdx+1;
            
            indexes[iIdx++]=v2Idx;
            indexes[iIdx++]=v2Idx+1;
            indexes[iIdx++]=vIdx+1;
            
            vIdx+=2;
        }
        
            // finish with the tagents
            
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
    }
    
   
        //
        // build weapon mesh
        //

    build()
    {
        let vertexList=MeshUtilityClass.createModelVertexList(this.CYLINDER_VERTEX_COUNT);
        let indexes=new Uint16Array(this.CYLINDER_INDEX_COUNT);
        
        let pos1=new PointClass(0,0,1500);
        let pos2=new PointClass(0,0,-1500);
        
        this.buildCylinderAroundTwoPoints(pos1,pos2,500,500,vertexList,indexes);
        
            // add mesh to model
            
        this.model.mesh=new ModelMeshClass(this.view,this.bitmap,vertexList,indexes,0);
    }
    
}
