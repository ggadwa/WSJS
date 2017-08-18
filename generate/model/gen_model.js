import * as constants from '../../code/main/constants.js';

//
// generate a model
//

export default class GenModelClass
{
    constructor()
    {
    }
    
    build(model,modelBitmap,sizeFactor,inDebug)
    {
        let genSkeleton,genMesh;
        
        switch (model.modelType) {
        
            case constants.MODEL_TYPE_CREATURE:
                genSkeleton=new GenModelCreatureSkeletonClass(model,sizeFactor);
                genSkeleton.build();
                genMesh=new GenModelCreatureMeshClass(model,modelBitmap);
                genMesh.build(inDebug);
                break;
                
            case constants.MODEL_TYPE_WEAPON:
                genMesh=new GenModelWeaponMeshClass(model,modelBitmap);
                genMesh.build(inDebug);
                break;
                
            case constants.MODEL_TYPE_PROJECTILE:
                genMesh=new GenModelProjectileMeshClass(model,modelBitmap);
                genMesh.build(inDebug);
                break;
        }
    }
    
}
