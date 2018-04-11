import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import ModelBoneClass from '../../code/model/model_bone.js';
import ModelLimbClass from '../../code/model/model_limb.js';
import ModelSkeletonClass from '../../code/model/model_skeleton.js';
import GenSkeletonBaseClass from '../../generate/model/gen_skeleton_base.js';
import genRandom from '../../generate/utility/random.js';

//
// gen monster skeleton class
//

export default class GenSkeletonMonsterClass extends GenSkeletonBaseClass
{
    constructor(view,model,sizeFactor)
    {
        super(view,model,sizeFactor);
        Object.seal(this);
    }
    
        //
        // monster arms
        //
        
    buildArms(standing)
    {
        let boneIdx,topArms,midArms;
        let armRadius=genRandom.randomInt(200,300);
        let armLength=genRandom.randomInt(2000,1000);
        let fingerCount=genRandom.randomInt(0,5);
        
            // determine number of arms
        
        topArms=false;
        midArms=false;
        
        if (!standing) {
            topArms=genRandom.randomPercentage(0.3);
        }
        else {
            topArms=genRandom.randomPercentage(0.9);
            midArms=genRandom.randomPercentage(0.2);
        }
        
            // the arm pairs
            
        if (topArms) {
            boneIdx=this.model.skeleton.findBoneIndex('Torso_Top');
        
            if (genRandom.randomPercentage(0.8)) {
                this.buildLimbArm(1,boneIdx,armRadius,armLength,90.0,fingerCount,false);
                this.buildLimbArm(2,boneIdx,armRadius,armLength,270.0,fingerCount,true);
            }
            else {
                this.buildLimbWhip(1,boneIdx,armRadius,armLength,90.0);
                this.buildLimbWhip(2,boneIdx,armRadius,armLength,270.0);
            }
        }
        
        if (midArms) {
            boneIdx=this.model.skeleton.findBoneIndex('Torso');
        
            if (genRandom.randomPercentage(0.8)) {
                this.buildLimbArm(3,boneIdx,armRadius,armLength,90.0,fingerCount,false);
                this.buildLimbArm(4,boneIdx,armRadius,armLength,270.0,fingerCount,true);
            }
            else {
                this.buildLimbWhip(3,boneIdx,armRadius,armLength,90.0);
                this.buildLimbWhip(4,boneIdx,armRadius,armLength,270.0);
            }
        }
    }
    
        //
        // monster legs
        //
        
    buildLegs(standing)
    {
        let boneIdx;
        let legRadius=genRandom.randomInt(200,300);
        let footRot=genRandom.randomInt(0,15);
        let footLength=genRandom.randomInt(legRadius,legRadius);
        let toeCount=genRandom.randomInt(0,5);

        boneIdx=this.model.skeleton.findBoneIndex('Hip');
        this.buildLimbLeg(1,boneIdx,legRadius,90.0,footLength,footRot,toeCount,false);
        this.buildLimbLeg(2,boneIdx,legRadius,270.0,footLength,-footRot,toeCount,true);

        if (!standing) {
            boneIdx=this.model.skeleton.findBoneIndex('Torso_Top');
            this.buildLimbLeg(3,boneIdx,legRadius,90.0,footLength,footRot,toeCount,false);
            this.buildLimbLeg(4,boneIdx,legRadius,270.0,footLength,-footRot,toeCount,true);
        }
    }
    
        //
        // monster tails
        //
        
    buildTail(stranding)
    {
        let boneIdx;
        let whipRadius=genRandom.randomInt(200,500);
        let whipLength=genRandom.randomInt(1000,2500);
        
        if (genRandom.randomPercentage(0.7)) return;
        
        boneIdx=this.model.skeleton.findBoneIndex('Hip');
        this.buildLimbWhip(3,boneIdx,whipRadius,whipLength,180.0);
    }
    
        //
        // monster heads
        //
        
    buildHead()
    {
        let boneIdx;
        let neckLength=genRandom.randomInt(200,600);
        let headRadius=genRandom.randomInt(500,400);
        let jawRadius=headRadius*genRandom.randomFloat(0.9,0.3);
        let neckRadius=headRadius*genRandom.randomFloat(0.3,0.5);
        
        boneIdx=this.model.skeleton.findBoneIndex('Torso_Top');
        this.buildLimbHead(0,boneIdx,neckLength,neckRadius,jawRadius,headRadius,true);
    }
    
        //
        // build skeleton bones
        //

    build()
    {
        let standing;
        let bodyLimbIdx,hunchAng;
        
            // get a hunch angle which determines
            // if we are on 2 or 4 feet
        
        standing=genRandom.randomPercentage(0.7);
        if (!standing) {        
            hunchAng=genRandom.randomFloat(60.0,95.0);
        }
        else {
            hunchAng=genRandom.randomFloat(0.0,30.0);
        }
        
            // build the skeleton

        this.model.skeleton=new ModelSkeletonClass(this.view);
        
        bodyLimbIdx=this.buildBody(1500,1500,1500,1500,300,1000,1.0,hunchAng);
        this.buildLegs(standing);
        this.buildArms(standing);
        this.buildTail(standing);
        this.buildHead();
        
            // setup the bones for animation
            
        this.model.skeleton.precalcAnimationValues();
     }
    
}
