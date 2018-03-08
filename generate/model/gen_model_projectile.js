import * as constants from '../../code/main/constants.js';
import ModelClass from '../../code/model/model.js';
import GenModelBaseClass from '../../generate/model/gen_model_base.js';
import GenMeshProjectileClass from '../../generate/model/gen_mesh_projectile.js';
import GenBitmapItemClass from '../../generate/bitmap/gen_bitmap_item.js';

//
// generate a model
//

export default class GenModelProjectileClass extends GenModelBaseClass
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
        let genMesh;
        
            // new model
            
        model=new ModelClass(this.view,name);
        
            // bitmap

        modelBitmap=null;
        
        if (!inDebug) {
            genBitmap=new GenBitmapItemClass(this.view);
            modelBitmap=genBitmap.generate(false);
        }
        
            // skeleton and mesh
        
        genMesh=new GenMeshProjectileClass(this.view,model,modelBitmap);
        genMesh.build();

        return(model);
    }
    
}
