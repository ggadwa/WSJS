import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import Point2DClass from '../../code/utility/2D_point.js';
import BoundClass from '../../code/utility/bound.js';
import ModelMeshVertexClass from '../../code/model/model_mesh_vertex.js';

//
// model mesh class
//

export default class ModelMeshClass
{
    constructor(view,bitmap,vertexList,indexes,flag)
    {
        this.view=view;
        this.bitmap=bitmap;
        this.vertexList=vertexList;
        this.indexes=indexes;
        this.flag=flag;

        this.vertexCount=this.vertexList.length;
        this.indexCount=this.indexes.length;
        this.trigCount=Math.trunc(this.indexCount/3);
        
            // cache the radius and height calcs
            
        this.cacheRadius=-1;
        this.cacheHigh=-1;

        Object.seal(this);
    }
    
        //
        // close model mesh
        //

    close()
    {
        this.bitmap.close();
    }
    
        //
        // information
        //
        
    calculateRadius(skeleton)
    {
        let n,v,limbType;
        let xBound,zBound;
        
        if (this.cacheRadius===-1) {
            xBound=new BoundClass(0,0);
            zBound=new BoundClass(0,0);
            
                // no skeleton, do all vertexes
                
            if (skeleton===null) {
                for (n=0;n!==this.vertexCount;n++) {
                    v=this.vertexList[n];
                    xBound.adjust(v.position.x);
                    zBound.adjust(v.position.z);
                }
            }

                // has a skeleton, eliminate some
                // limbs that bulk up the collision radius
                
            else {
                for (n=0;n!==this.vertexCount;n++) {
                    v=this.vertexList[n];
                    limbType=skeleton.getBoneLimbType(v.boneIdx);

                    if ((limbType===constants.LIMB_TYPE_BODY) || (limbType===constants.LIMB_TYPE_HEAD) || (limbType===constants.LIMB_TYPE_LEG)) {
                        xBound.adjust(v.position.x);
                        zBound.adjust(v.position.z);
                    }
                }
            }
            
            this.cacheRadius=Math.trunc((xBound.getSize()+zBound.getSize())*0.25);       // average, then /2 for half (radius)
        }
        
        return(this.cacheRadius);
    }
    
    calculateHeight()
    {
        let n,v;
        let high;
        
        if (this.cacheHigh===-1) {
            high=0;

            for (n=0;n!==this.vertexCount;n++) {
                v=this.vertexList[n];
                if (v.position.y<high) high=v.position.y;
            }

            this.cacheHigh=-high;
        }
        
        return(this.cacheHigh);
    }
    
        //
        // precalcs the vector from the bone animations
        //
        
    precalcAnimationValues(skeleton)
    {
        let n,v,bone,parentBone;

        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            bone=skeleton.bones[v.boneIdx];
            v.vectorFromBone.setFromSubPoint(v.position,bone.position);
            
            if (bone.parentBoneIdx!==-1) {
                parentBone=skeleton.bones[bone.parentBoneIdx];
                
                v.parentBoneIdx=bone.parentBoneIdx;
                v.vectorFromParentBone.setFromSubPoint(v.position,parentBone.position);
            }
        }
    }

}
