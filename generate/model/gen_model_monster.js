import * as constants from '../../code/main/constants.js';
import genRandom from '../../generate/utility/random.js';
import ModelClass from '../../code/model/model.js';
import GenModelBaseClass from '../../generate/model/gen_model_base.js';
import GenSkeletonMonsterClass from '../../generate/model/gen_skeleton_monster.js';
import GenMeshMonsterClass from '../../generate/model/gen_mesh_monster.js';
import GenBitmapSkinFurClass from '../../generate/bitmap/gen_bitmap_skin_fur.js';
import GenBitmapSkinLeatherClass from '../../generate/bitmap/gen_bitmap_skin_leather.js';
import GenBitmapSkinScaleClass from '../../generate/bitmap/gen_bitmap_skin_scale.js';

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
            
        model=new ModelClass(name);
        
            // bitmap

        modelBitmap=null;
        
        if (!inDebug) {
            
            switch(genRandom.randomIndex(3)) {
                case 0:
                    genBitmap=new GenBitmapSkinFurClass(this.view);
                    break;
                case 1:
                    genBitmap=new GenBitmapSkinLeatherClass(this.view);
                    break;
                case 2:
                    genBitmap=new GenBitmapSkinScaleClass(this.view);
                    break;
            }
            
            modelBitmap=genBitmap.generate(false);
        }
        
            // mesh and skeleton
            
        genSkeleton=new GenSkeletonMonsterClass(this.view,model,sizeFactor);
        genSkeleton.build();
        
        genMesh=new GenMeshMonsterClass(this.view,model,modelBitmap);
        genMesh.build(inDebug);
        
        return(model);
    }
    
}
