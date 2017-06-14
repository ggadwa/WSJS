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
        
        console.log('in build!');
        
        switch (model.modelType) {
        
            case modelConstants.TYPE_CREATURE:
                genSkeleton=new GenModelCreatureSkeletonClass(model,sizeFactor);
                genSkeleton.build();
                genMesh=new GenModelCreatureMeshClass(model,modelBitmap);
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
