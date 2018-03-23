import * as constants from '../../code/main/constants.js';
import genRandom from '../../generate/utility/random.js';
import ModelClass from '../../code/model/model.js';
import GenModelBaseClass from '../../generate/model/gen_model_base.js';
import GenSkeletonMonsterClass from '../../generate/model/gen_skeleton_monster.js';
import GenMeshMonsterClass from '../../generate/model/gen_mesh_monster.js';
import GenBitmapMonsterClass from '../../generate/bitmap/gen_bitmap_monster.js';

//
// generate a model
//

export default class GenModelMonsterClass extends GenModelBaseClass
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
            genBitmap=new GenBitmapMonsterClass(this.view);
            modelBitmap=genBitmap.generate(false);
        }
        
            // mesh and skeleton
            
        genSkeleton=new GenSkeletonMonsterClass(this.view,model,sizeFactor);
        genSkeleton.build();
        
        genMesh=new GenMeshMonsterClass(this.view,model,modelBitmap);
        genMesh.build();
        
        return(model);
    }
    
}
