"use strict";

//
// gen organic skeleton class
//

function GenModelOrganicSkeletonObject(model,genRandom)
{
    this.model=model;
    this.genRandom=genRandom;

        //
        // build skeleton bones
        //

    this.build=function()
    {
            // build empty skeleton
            
        this.model.skeleton=new ModelSkeletonObject();
        var bones=this.model.skeleton.bones;

            // random sizes

        var ankleHigh=this.genRandom.randomInt(100,100);
        var kneeHigh=ankleHigh+this.genRandom.randomInt(500,500);
        var hipHigh=kneeHigh+this.genRandom.randomInt(500,500);
        var hipRadius=this.genRandom.randomInt(300,350);
        var waistHigh=hipHigh+this.genRandom.randomInt(150,150);
        var torsoHigh=waistHigh+this.genRandom.randomInt(250,250);
        var torsoRadius=this.genRandom.randomInt(300,350);
        var torsoTopHigh=torsoHigh+this.genRandom.randomInt(250,250);
        var shoulderRadius=torsoRadius+this.genRandom.randomInt(150,150);
        var elbowRadius=shoulderRadius+this.genRandom.randomInt(250,250);
        var wristRadius=elbowRadius+this.genRandom.randomInt(250,250);
        var handRadius=wristRadius+this.genRandom.randomInt(50,50);
        var neckHigh=torsoTopHigh+this.genRandom.randomInt(50,100);
        var headHigh=neckHigh+this.genRandom.randomInt(100,100)+500;

            // create bones

        var baseBoneIdx=bones.push(new ModelBoneObject('Base',-1,new wsPoint(0,0,0)))-1;
        var hipBoneIdx=bones.push(new ModelBoneObject('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
        var waistBoneIdx=bones.push(new ModelBoneObject('Waist',hipBoneIdx,new wsPoint(0,-waistHigh,0)))-1;
        var torsoBoneIdx=bones.push(new ModelBoneObject('Torso',waistBoneIdx,new wsPoint(0,-torsoHigh,0)))-1;
        var torsoTopBoneIdx=bones.push(new ModelBoneObject('Torso Top',torsoBoneIdx,new wsPoint(0,-torsoTopHigh,0)))-1;
        var neckBoneIdx=bones.push(new ModelBoneObject('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
        var headBoneIdx=bones.push(new ModelBoneObject('Head',neckBoneIdx,new wsPoint(0,-headHigh,0)))-1;

        var leftShoulderBoneIdx=bones.push(new ModelBoneObject('Left Shoulder',torsoTopBoneIdx,new wsPoint(shoulderRadius,-torsoTopHigh,60)))-1;
        var rightShoulderBoneIdx=bones.push(new ModelBoneObject('Right Shoulder',torsoTopBoneIdx,new wsPoint(-shoulderRadius,-torsoTopHigh,60)))-1;

        var leftElbowBoneIdx=bones.push(new ModelBoneObject('Left Elbow',leftShoulderBoneIdx,new wsPoint(elbowRadius,-torsoTopHigh,60)))-1;
        var rightElbowBoneIdx=bones.push(new ModelBoneObject('Right Elbow',rightShoulderBoneIdx,new wsPoint(-elbowRadius,-torsoTopHigh,60)))-1;

        var leftWristBoneIdx=bones.push(new ModelBoneObject('Left Wrist',leftElbowBoneIdx,new wsPoint(wristRadius,-torsoTopHigh,0)))-1;
        var rightWristBoneIdx=bones.push(new ModelBoneObject('Right Wrist',rightElbowBoneIdx,new wsPoint(-wristRadius,-torsoTopHigh,0)))-1;

        var leftHandBoneIdx=bones.push(new ModelBoneObject('Left Hand',leftWristBoneIdx,new wsPoint(handRadius,-torsoTopHigh,0)))-1;
        var rightHandBoneIdx=bones.push(new ModelBoneObject('Right Hand',rightWristBoneIdx,new wsPoint(-handRadius,-torsoTopHigh,0)))-1;

        var leftHipBoneIdx=bones.push(new ModelBoneObject('Left Hip',hipBoneIdx,new wsPoint(hipRadius,-hipHigh,0)))-1;
        var rightHipBoneIdx=bones.push(new ModelBoneObject('Right Hip',hipBoneIdx,new wsPoint(-hipRadius,-hipHigh,0)))-1;

        var leftKneeBoneIdx=bones.push(new ModelBoneObject('Left Knee',leftHipBoneIdx,new wsPoint(hipRadius,-kneeHigh,0)))-1;
        var rightKneeBoneIdx=bones.push(new ModelBoneObject('Right Knee',rightHipBoneIdx,new wsPoint(-hipRadius,-kneeHigh,0)))-1;

        var leftAnkleBoneIdx=bones.push(new ModelBoneObject('Left Ankle',leftKneeBoneIdx,new wsPoint(hipRadius,-ankleHigh,0)))-1;
        var rightAnkleBoneIdx=bones.push(new ModelBoneObject('Right Ankle',rightKneeBoneIdx,new wsPoint(-hipRadius,-ankleHigh,0)))-1;

        var leftFootBoneIdx=bones.push(new ModelBoneObject('Left Foot',leftAnkleBoneIdx,new wsPoint(hipRadius,0,0)))-1;
        var rightFootBoneIdx=bones.push(new ModelBoneObject('Right Foot',rightAnkleBoneIdx,new wsPoint(-hipRadius,0,0)))-1;
     };
    
}
