"use strict";

//
// gen skeleton class
//

function GenSkeletonObject(model,genRandom)
{
    this.model=model;
    this.genRandom=genRandom;

        //
        // bone rotate/move utilities
        //

    this.getRandomRotateAngle=function(rotX,rotY,rotZ)
    {
        var ang=new wsAngle(0.0,0.0,0.0);

        if (rotX!==0) ang.x=this.genRandom.randomInt(0,rotX)-Math.floor(rotX/2);
        if (rotY!==0) ang.y=this.genRandom.randomInt(0,rotY)-Math.floor(rotY/2);
        if (rotZ!==0) ang.z=this.genRandom.randomInt(0,rotZ)-Math.floor(rotZ/2);

        return(ang);
    };

    this.rotateBone=function(bones,boneIdx,ang)
    {
        var bone=bones[boneIdx];
        var parentBone=bones[bone.parentBoneIdx];

        var offsetPnt=bone.position.copy();
        bone.position.rotateAroundPoint(parentBone.position,ang);
        offsetPnt.subPoint(bone.position);

        return(offsetPnt);
    };

    this.moveBone=function(bones,boneIdx,offsetPnt)
    {
        bones[boneIdx].position.subPoint(offsetPnt);
    };
    
    this.rotateBoneAndAllChildren=function(bones,boneIdx,ang,offsetPnt)
    {
        var n,bone;
        
            // move this bone from the last
            // rotational offset
            
        this.moveBone(bones,boneIdx,offsetPnt);
        
            // rotate bone and update the offset
            // point for further children
        
        var nextOffsetPnt=this.rotateBone(bones,boneIdx,ang);
        nextOffsetPnt.addPoint(offsetPnt);
        
            // now move all children
            
        for (n=0;n!==bones.length;n++) {
            if (n===boneIdx) continue;
            
            bone=bones[n];
            if (bone.parentBoneIdx===boneIdx) this.rotateBoneAndAllChildren(bones,n,ang,nextOffsetPnt);
        }
    };

        //
        // build skeleton bones
        //

    this.build=function()
    {
            // build empty skeleton
            
        this.model.skeleton=new ModelSkeletonObject();
        var bones=this.model.skeleton.bones;

            // random sizes

        var hipHigh=this.genRandom.randomInt(1000,1500);
        var hipRadius=this.genRandom.randomInt(150,150);
        var waistHigh=hipHigh+this.genRandom.randomInt(150,150);
        var torsoHigh=waistHigh+this.genRandom.randomInt(500,500);
        var torsoRadius=this.genRandom.randomInt(300,350);
        var torsoTopHigh=torsoHigh+this.genRandom.randomInt(20,30);
        var armSwing=this.genRandom.randomInt(100,100);
        var wristSwing=this.genRandom.randomInt(0,50);
        var kneeSwing=this.genRandom.randomInt(100,100);
        var ankleSwing=this.genRandom.randomInt(0,50);
        var neckHigh=torsoTopHigh+this.genRandom.randomInt(50,100);
        var headHigh=neckHigh+this.genRandom.randomInt(100,100)+500;
        var handHigh=this.genRandom.randomInt(800,1000);
        var elbowHigh=Math.floor((torsoHigh-handHigh)/2)+handHigh;
        var ankleHigh=this.genRandom.randomInt(100,200);

            // fix some extreme sizes

        if (Math.abs(elbowHigh-torsoHigh)<300) {
            elbowHigh-=300;
            handHigh-=300;
        }
        if (Math.abs(handHigh-elbowHigh)<150) {
            handHigh-=250;
        }

        if (handHigh<0) handHigh=0;

            // create bones

        var baseBoneIdx=bones.push(new ModelBoneObject('Base',-1,new wsPoint(0,0,0)))-1;
        var hipBoneIdx=bones.push(new ModelBoneObject('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
        var waistBoneIdx=bones.push(new ModelBoneObject('Waist',hipBoneIdx,new wsPoint(0,-waistHigh,0)))-1;
        var torsoBoneIdx=bones.push(new ModelBoneObject('Torso',waistBoneIdx,new wsPoint(0,-torsoHigh,0)))-1;
        var torsoTopBoneIdx=bones.push(new ModelBoneObject('Torso Top',torsoBoneIdx,new wsPoint(0,-torsoTopHigh,0)))-1;
        var neckBoneIdx=bones.push(new ModelBoneObject('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
        var headBoneIdx=bones.push(new ModelBoneObject('Head',neckBoneIdx,new wsPoint(0,-headHigh,0)))-1;

        var leftShoulderBoneIdx=bones.push(new ModelBoneObject('Left Shoulder',torsoBoneIdx,new wsPoint(torsoRadius,-torsoHigh,60)))-1;
        var rightShoulderBoneIdx=bones.push(new ModelBoneObject('Right Shoulder',torsoBoneIdx,new wsPoint(-torsoRadius,-torsoHigh,60)))-1;

        var leftElbowBoneIdx=bones.push(new ModelBoneObject('Left Elbow',leftShoulderBoneIdx,new wsPoint((torsoRadius+armSwing),-elbowHigh,60)))-1;
        var rightElbowBoneIdx=bones.push(new ModelBoneObject('Right Elbow',rightShoulderBoneIdx,new wsPoint(-(torsoRadius+armSwing),-elbowHigh,60)))-1;

        var leftWristBoneIdx=bones.push(new ModelBoneObject('Left Wrist',leftElbowBoneIdx,new wsPoint(((torsoRadius+armSwing)+wristSwing),-(handHigh+150),0)))-1;
        var rightWristBoneIdx=bones.push(new ModelBoneObject('Right Wrist',rightElbowBoneIdx,new wsPoint(-((torsoRadius+armSwing)+wristSwing),-(handHigh+150),0)))-1;

        var leftHandBoneIdx=bones.push(new ModelBoneObject('Left Hand',leftWristBoneIdx,new wsPoint(((torsoRadius+armSwing)+30),-handHigh,0)))-1;
        var rightHandBoneIdx=bones.push(new ModelBoneObject('Right Hand',rightWristBoneIdx,new wsPoint(-((torsoRadius+armSwing)+30),-handHigh,0)))-1;

        var rightHipBoneIdx=bones.push(new ModelBoneObject('Right Hip',hipBoneIdx,new wsPoint(-hipRadius,-(hipHigh-200),0)))-1;
        var leftHipBoneIdx=bones.push(new ModelBoneObject('Left Hip',hipBoneIdx,new wsPoint(hipRadius,-(hipHigh-200),0)))-1;

        var leftKneeBoneIdx=bones.push(new ModelBoneObject('Left Knee',leftHipBoneIdx,new wsPoint((hipRadius+kneeSwing),-(hipHigh>>1),45)))-1;
        var rightKneeBoneIdx=bones.push(new ModelBoneObject('Right Knee',rightHipBoneIdx,new wsPoint(-(hipRadius+kneeSwing),-(hipHigh>>1),45)))-1;

        var leftAnkleBoneIdx=bones.push(new ModelBoneObject('Left Ankle',leftKneeBoneIdx,new wsPoint(((hipRadius+kneeSwing)+ankleSwing),-ankleHigh,90)))-1;
        var rightAnkleBoneIdx=bones.push(new ModelBoneObject('Right Ankle',rightKneeBoneIdx,new wsPoint(-((hipRadius+kneeSwing)+ankleSwing),-ankleHigh,90)))-1;

        var leftFootBoneIdx=bones.push(new ModelBoneObject('Left Foot',leftAnkleBoneIdx,new wsPoint(((hipRadius+kneeSwing)+ankleSwing),-60,0)))-1;
        var rightFootBoneIdx=bones.push(new ModelBoneObject('Right Foot',rightAnkleBoneIdx,new wsPoint(-((hipRadius+kneeSwing)+ankleSwing),-60,0)))-1;

            // spine rotations
            
        var waistAng=this.getRandomRotateAngle(80,0,0);
        this.rotateBoneAndAllChildren(bones,waistBoneIdx,waistAng,new wsPoint(0,0,0));
        
        var torsoAng=this.getRandomRotateAngle(60,0,0);
        this.rotateBoneAndAllChildren(bones,torsoBoneIdx,torsoAng,new wsPoint(0,0,0));
        
        var neckAng=new wsAngle(-((waistAng.x+torsoAng.x)*(this.genRandom.random()*0.5)),0.0,0.0);
        this.rotateBoneAndAllChildren(bones,neckBoneIdx,neckAng,new wsPoint(0,0,0));

            // arm rotations
        
        
/*
        ang=this.getRandomRotateAngle(0,10,20);
        this.moveBone(bones,rightShoulderBoneIdx,torsoOffsetPnt);
        this.rotateBone(bones,rightShoulderBoneIdx,ang);
        
        ang.z=-ang.z;
        ang.y=-ang.y;
        this.moveBone(bones,leftShoulderBoneIdx,torsoOffsetPnt);
        this.rotateBone(bones,leftShoulderBoneIdx,ang);

        ang=this.getRandomRotateAngle(0,40,0);
        var leftOffsetPnt=this.rotateBone(bones,leftKneeBoneIdx,ang);
        this.moveBone(bones,leftAnkleBoneIdx,leftOffsetPnt);
        this.moveBone(bones,leftFootBoneIdx,leftOffsetPnt);

        ang.y=-ang.y;
        var rightOffsetPnt=this.rotateBone(bones,rightKneeBoneIdx,ang);
        this.moveBone(bones,rightAnkleBoneIdx,rightOffsetPnt);
        this.moveBone(bones,rightFootBoneIdx,rightOffsetPnt);
        */
    };
    
}
