import * as constants from '../../code/main/constants.js';
import ModelClass from '../../code/model/model.js';
import GenModelBaseClass from '../../generate/model/gen_model_base.js';
import GenSkeletonHumanClass from '../../generate/model/gen_skeleton_human.js';
import GenMeshHumanClass from '../../generate/model/gen_mesh_human.js';
import GenBitmapPlayerClass from '../../generate/bitmap/gen_bitmap_player.js';

//
// generate a model
//

export default class GenModelHumanClass extends GenModelBaseClass
{
    constructor(view)
    {
        super(view);
        Object.seal(this);
    }
    
    generate(name,sizeFactor,inDebug)
    {
        let model;
        let genBitmap,modelBitmap;
        let genSkeleton,genMesh;
        
            // new model
            
        model=new ModelClass(this.view,name);
        
            // bitmap

        modelBitmap=null;
        
        if (!inDebug) {
            genBitmap=new GenBitmapPlayerClass(this.view);
            modelBitmap=genBitmap.generate(false);
        }
            
            // mesh and skeleton
            
        genSkeleton=new GenSkeletonHumanClass(this.view,model,sizeFactor);
        genSkeleton.build();
        
        genMesh=new GenMeshHumanClass(this.view,model,modelBitmap);
        genMesh.build();
        
        return(model);
    }
    
}
