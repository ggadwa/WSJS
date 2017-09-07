import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import ModelBoneClass from '../../code/model/model_bone.js';
import ModelLimbClass from '../../code/model/model_limb.js';
import ModelSkeletonClass from '../../code/model/model_skeleton.js';
import GenSkeletonBaseClass from '../../generate/model/gen_skeleton_base.js';
import genRandom from '../../generate/utility/random.js';

//
// gen human skeleton class
//

export default class GenSkeletonHumanClass extends GenSkeletonBaseClass
{
    constructor(view,model,sizeFactor)
    {
        super(view,model,sizeFactor);
        Object.seal(this);
    }
            
        //
        // build skeleton bones
        //

    build()
    {
        let bodyLimbIdx,boneIdx;
        let armLength;
        
            // build the skeleton

        this.model.skeleton=new ModelSkeletonClass(this.view);
        
        bodyLimbIdx=this.buildBody(3000,500,2000,500,1000,100,0.9);
        
        boneIdx=this.model.skeleton.findBoneIndex('Torso_Top');
        this.buildLimbHead(0,boneIdx,300,300,600,700);
        
        armLength=Math.trunc(genRandom.randomInt(1500,500));
        
        this.buildLimbArm(1,boneIdx,300,armLength,90.0,false);
        this.buildLimbArm(2,boneIdx,300,armLength,270.0,false);

        boneIdx=this.model.skeleton.findBoneIndex('Hip');
        this.buildLimbLeg(3,boneIdx,300,90.0,10.0);
        this.buildLimbLeg(4,boneIdx,300,270.0,-10.0);
        
            // setup the bones for animation
            
        this.model.skeleton.precalcAnimationValues();
     }
    
}
