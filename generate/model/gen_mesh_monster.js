import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import ModelMeshClass from '../../code/model/model_mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';
import GenMeshBaseClass from '../../generate/model/gen_mesh_base.js';
import genRandom from '../../generate/utility/random.js';

//
// gen monster mesh class
//

export default class GenMeshMonsterClass extends GenMeshBaseClass
{
    constructor(view,model,bitmap)
    {
        super(view,model,bitmap);
        Object.seal(this);
    }
    
        //
        // build mesh around skeleton
        //

    build()
    {
        let n,limb,indexOffset;
        let fullBodyScale;
        let skeleton=this.model.skeleton;

        let limbVertexList=[];
        let limbIndexes=[];
        let vertexList,indexes;
        let modelVertexList=null;
        let modelIndexes=null;
        
            // random body scaling
            
        fullBodyScale=new PointClass(1.0,(1.0-genRandom.randomFloat(0.0,0.3)),(1.0-genRandom.randomFloat(0.0,0.2)));
        
            // wrap all the limbs
            
        for (n=0;n!==skeleton.limbs.length;n++) {
            limb=skeleton.limbs[n];
            
                // counts
                
            vertexList=MeshUtilityClass.createModelVertexList(((limb.aroundSurfaceCount+1)*(limb.acrossSurfaceCount-2))+2);    // (around+1)*(across-2) for quads, + 2 for top and bottom point (around+1 for extra vertexes to stop UV wrapping)
            indexes=new Uint16Array(((limb.aroundSurfaceCount*(limb.acrossSurfaceCount-3))*6)+((limb.aroundSurfaceCount*2)*3));   // (around*(across-3))*6 for quads, (around*2)*3 for top and bottom trigs
            
            this.buildAroundBoneLimb(limb,vertexList,indexes);
            if (limb.randomize) this.randomScaleVertexToBones(vertexList);
            
            limbVertexList.push(vertexList);
            limbIndexes.push(indexes);
        }
       
            // combine all the lists into one
            
        modelVertexList=limbVertexList[0];
        modelIndexes=limbIndexes[0];
            
        for (n=1;n<skeleton.limbs.length;n++) {
            indexOffset=modelVertexList.length;
            modelVertexList=MeshUtilityClass.combineVertexLists(modelVertexList,limbVertexList[n]);
            modelIndexes=MeshUtilityClass.combineIndexes(modelIndexes,limbIndexes[n],indexOffset);
        }
        
            // do the tangent space
            
        this.buildNormalsToBones(modelVertexList);
        MeshUtilityClass.buildVertexListTangents(modelVertexList,modelIndexes);
        
            // add mesh to model
            
        this.model.mesh=new ModelMeshClass(this.view,this.bitmap,modelVertexList,modelIndexes,0);
        this.model.mesh.precalcAnimationValues(this.model.skeleton);
    }
    
}
