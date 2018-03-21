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
        // random limbs for monster
        //
    
    buildRandomLimbs(bodyLimbIdx,hunchAng)
    {
        let n,limbCount,limbType,limbRadius,limbAng,armLength,whipLength,angIdx;
        let neckLength,neckRadius,jawRadius,headRadius,footRotAdd,maxLegPair;
        let boneIdx,fingerCount,toeCount;
        let skeleton=this.model.skeleton;
        let bodyLimb=skeleton.limbs[bodyLimbIdx];
        let legSweepList=[75,80,85,90,95,100,105];
        let legBoneList=[0,1,2,3];
        let armSweepList=[70,80,90,100,110,250,260,270,280,290];
        let armBoneList=[1,2,3];
        let whipSweepList=[320,330,340,350,0,10,20,30,40];
        let whipBoneList=[0,1,2,3];
        
        let randomLimbType=[constants.LIMB_TYPE_ARM,constants.LIMB_TYPE_WHIP];
        
            // random limb count
            
        limbCount=genRandom.randomInt(3,10);
        
            // limb sizes
            
        limbRadius=genRandom.randomInt(250,300);
        armLength=genRandom.randomInt(400,2000);
        whipLength=genRandom.randomInt(1000,1500);
        
        neckLength=genRandom.randomInt(250,300);
        neckRadius=genRandom.randomInt(150,200);
        
        jawRadius=genRandom.randomInt((neckRadius+200),500);
        headRadius=genRandom.randomInt((neckRadius+200),500);
        
            // extra piece counts

        fingerCount=genRandom.randomInt(0,5);
        toeCount=genRandom.randomInt(0,5);
        
            // max pairs of legs
            
        maxLegPair=(hunchAng>30.0)?2:1;
        
            // the random limbs
        
        for (n=0;n!==limbCount;n++) {
            
                // always need two legs
                
            if (n<maxLegPair) {
                limbType=constants.LIMB_TYPE_LEG;
            }
            else {
                limbType=randomLimbType[genRandom.randomIndex(randomLimbType.length)];
                limbType=constants.LIMB_TYPE_ARM;
            }
            
                // create the limb
                
            switch (limbType) {
                
                case constants.LIMB_TYPE_ARM:
                    if (armSweepList.length===0) break;
                    
                    boneIdx=bodyLimb.boneIndexes[armBoneList[genRandom.randomIndex(armBoneList.length)]];
                    
                    angIdx=genRandom.randomIndex(armSweepList.length);
                    limbAng=armSweepList[angIdx];
                    armSweepList.splice(angIdx,1);
                    this.buildLimbArm(n,boneIdx,limbRadius,armLength,limbAng,fingerCount,(limbAng>=250));
                    break;
                    
                case constants.LIMB_TYPE_LEG:
                    if (legSweepList.length===0) break;
                    
                    if (hunchAng>30.0) {
                        boneIdx=bodyLimb.boneIndexes[legBoneList[genRandom.randomIndex(legBoneList.length)]];
                    }
                    else {
                        boneIdx=bodyLimb.boneIndexes[0];
                    }
                    
                    angIdx=genRandom.randomIndex(legSweepList.length);
                    limbAng=legSweepList[angIdx];
                    legSweepList.splice(angIdx,1);
                    footRotAdd=20.0-genRandom.randomFloat(0.0,40.0);
                    this.buildLimbLeg(n,boneIdx,limbRadius,limbAng,(90.0+footRotAdd),toeCount,true,false);
                    this.buildLimbLeg(n,boneIdx,limbRadius,(limbAng+180.0),(90.0+footRotAdd),toeCount,true,true);
                    break;
                    
                case constants.LIMB_TYPE_WHIP:
                    if (whipSweepList.length===0) break;
                    
                    boneIdx=bodyLimb.boneIndexes[whipBoneList[genRandom.randomIndex(whipBoneList.length)]];
                    
                    angIdx=genRandom.randomIndex(whipSweepList.length);
                    limbAng=whipSweepList[angIdx];
                    whipSweepList.splice(angIdx,1);
                    this.buildLimbWhip(n,boneIdx,limbRadius,whipLength,limbAng);
                    break;
            }
        }
        
            // the head
        
        boneIdx=bodyLimb.boneIndexes[3];
        this.buildLimbHead((limbCount+1),boneIdx,neckLength,neckRadius,jawRadius,headRadius);
    }
    
        //
        // build skeleton bones
        //

    build()
    {
        let bodyLimbIdx,hunchAng;
        
            // get a hunch angle which determines
            // where the legs go
            
        if (genRandom.randomPercentage(0.3)) {        
            hunchAng=genRandom.randomFloat(30.0,60.0);
        }
        else {
            hunchAng=genRandom.randomFloat(0.0,30.0);
        }
        
            // build the skeleton

        this.model.skeleton=new ModelSkeletonClass(this.view);
        
        bodyLimbIdx=this.buildBody(1500,1500,1500,1500,300,1000,1.0,hunchAng);
        //this.buildRandomLimbs(bodyLimbIdx,hunchAng);
        
            // setup the bones for animation
            
        this.model.skeleton.precalcAnimationValues();
     }
    
}
