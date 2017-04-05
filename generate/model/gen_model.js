/* global modelConstants */

"use strict";

//
// generate a model
//

class GenModelClass
{
    constructor()
    {
    }
    
    build(model,modelBitmap,sizeFactor,inDebug)
    {
        let genSkeleton,genMesh;
        
        switch (model.modelType) {
        
            case modelConstants.TYPE_HUMANOID:
            case modelConstants.TYPE_ANIMAL:
            case modelConstants.TYPE_BLOB:
                genSkeleton=new GenModelOrganicSkeletonClass(model,sizeFactor);
                genSkeleton.build();

                genMesh=new GenModelOrganicMeshClass(model,modelBitmap);
                genMesh.build(inDebug);
                break;
                
            case modelConstants.TYPE_WEAPON:
                genMesh=new GenModelWeaponMeshClass(model,modelBitmap);
                genMesh.build(inDebug);
                break;
                
            case modelConstants.TYPE_PROJECTILE:
                genMesh=new GenModelProjectileMeshClass(model,modelBitmap);
                genMesh.build(inDebug);
                break;
        }
    }
    
}
