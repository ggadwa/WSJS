import * as constants from '../../code/main/constants.js';
import GenModelCreatureSkeletonClass from '../../generate/model/gen_model_creature_skeleton.js';
import GenModelCreatureMeshClass from '../../generate/model/gen_model_creature_mesh.js';
import GenModelWeaponMeshClass from '../../generate/model/gen_model_weapon_mesh.js';
import GenModelProjectileMeshClass from '../../generate/model/gen_model_projectile_mesh.js';

//
// generate a model
//

export default class GenModelClass
{
    constructor()
    {
        this.TYPE_CREATURE=0;
        this.TYPE_WEAPON=1;
        this.TYPE_PROJECTILE=2;
        
        this.TYPE_NAMES=
            [
                'Creature','Weapon','Projectile'
            ];
    }
    
    build(model,modelBitmap,modelType,sizeFactor,inDebug)
    {
        let genSkeleton,genMesh;
        
        switch (modelType) {
        
            case this.TYPE_CREATURE:
                genSkeleton=new GenModelCreatureSkeletonClass(model,sizeFactor);
                genSkeleton.build();
                genMesh=new GenModelCreatureMeshClass(model,modelBitmap);
                genMesh.build(inDebug);
                break;
                
            case this.TYPE_WEAPON:
                genMesh=new GenModelWeaponMeshClass(model,modelBitmap);
                genMesh.build(inDebug);
                break;
                
            case this.TYPE_PROJECTILE:
                genMesh=new GenModelProjectileMeshClass(model,modelBitmap);
                genMesh.build(inDebug);
                break;
        }
    }
    
}
