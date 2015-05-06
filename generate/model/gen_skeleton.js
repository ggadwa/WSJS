"use strict";

//
// bone rotate/move utilities
//

function genSkeletonGetRandomRotateAngle(rotX,rotY,rotZ)
{
    var ang=new wsAngle(0.0,0.0,0.0);
    
	if (rotX!==0) ang.x=this.genRandom.randomInt(0,rotX);
	if (rotY!==0) ang.y=this.genRandom.randomInt(0,rotY);
	if (rotZ!==0) ang.z=this.genRandom.randomInt(0,rotZ);
    
    return(ang);
}

function genSkeletonRotateBone(bones,boneIdx,ang)
{
	var bone=bones[boneIdx];
	var parentBone=bones[bone.parentBoneIdx];

	var offsetPnt=bone.position.copy();
    bone.position.rotateAroundPoint(parentBone.position,ang);
    offsetPnt.subPoint(bone.position);
    
    return(offsetPnt);
}

function genSkeletonMoveBone(bones,boneIdx,offsetPnt)
{
    bones[boneIdx].position.subPoint(offsetPnt);
}

//
// build skeleton bones
//

function genSkeletonBuild()
{
    var ang;
    var bones=this.model.skeleton.bones;
    
		// random sizes

	var hipHigh=this.genRandom.randomInt(1000,1500);
	var torsoHigh=hipHigh+this.genRandom.randomInt(500,500);
	var torsoRadius=this.genRandom.randomInt(300,350);
	var armSwing=this.genRandom.randomInt(40,40);
	var headHigh=torsoHigh+this.genRandom.randomInt(50,100);
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

	var baseBoneIdx=bones.push(new modelBoneObject('Base',-1,new wsPoint(0,0,0)))-1;
	var hipBoneIdx=bones.push(new modelBoneObject('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
	var torsoBoneIdx=bones.push(new modelBoneObject('Torso',hipBoneIdx,new wsPoint(0,-torsoHigh,0)))-1;

	var leftShoulderBoneIdx=bones.push(new modelBoneObject('Left Shoulder',torsoBoneIdx,new wsPoint(torsoRadius,-torsoHigh,60)))-1;
	var rightShoulderBoneIdx=bones.push(new modelBoneObject('Right Shoulder',torsoBoneIdx,new wsPoint(-torsoRadius,-torsoHigh,60)))-1;

	var leftElbowBoneIdx=bones.push(new modelBoneObject('Left Elbow',leftShoulderBoneIdx,new wsPoint((torsoRadius+armSwing),-elbowHigh,60)))-1;
	var rightElbowBoneIdx=bones.push(new modelBoneObject('Right Elbow',rightShoulderBoneIdx,new wsPoint(-(torsoRadius+armSwing),-elbowHigh,60)))-1;

	var leftWristBoneIdx=bones.push(new modelBoneObject('Left Wrist',leftElbowBoneIdx,new wsPoint(((torsoRadius+armSwing)+30),-(handHigh+150),0)))-1;
	var rightWristBoneIdx=bones.push(new modelBoneObject('Right Wrist',rightElbowBoneIdx,new wsPoint(-((torsoRadius+armSwing)+30),-(handHigh+150),0)))-1;

	var leftHandBoneIdx=bones.push(new modelBoneObject('Left Hand',leftWristBoneIdx,new wsPoint(((torsoRadius+armSwing)+30),-handHigh,0)))-1;
	var rightHandBoneIdx=bones.push(new modelBoneObject('Right Hand',rightWristBoneIdx,new wsPoint(-((torsoRadius+armSwing)+30),-handHigh,0)))-1;

	var rightHipBoneIdx=bones.push(new modelBoneObject('Right Hip',hipBoneIdx,new wsPoint(-150,-(hipHigh-200),0)))-1;
	var leftHipBoneIdx=bones.push(new modelBoneObject('Left Hip',hipBoneIdx,new wsPoint(150,-(hipHigh-200),0)))-1;

	var leftKneeBoneIdx=bones.push(new modelBoneObject('Left Knee',leftHipBoneIdx,new wsPoint(120,-(hipHigh>>1),45)))-1;
	var rightKneeBoneIdx=bones.push(new modelBoneObject('Right Knee',rightHipBoneIdx,new wsPoint(-120,-(hipHigh>>1),45)))-1;

	var leftAnkleBoneIdx=bones.push(new modelBoneObject('Left Ankle',leftKneeBoneIdx,new wsPoint(120,-ankleHigh,90)))-1;
	var rightAnkleBoneIdx=bones.push(new modelBoneObject('Right Ankle',rightKneeBoneIdx,new wsPoint(-120,-ankleHigh,90)))-1;

	var leftFootBoneIdx=bones.push(new modelBoneObject('Left Foot',leftAnkleBoneIdx,new wsPoint(120,-60,0)))-1;
	var rightFootBoneIdx=bones.push(new modelBoneObject('Right Foot',rightAnkleBoneIdx,new wsPoint(-120,-60,0)))-1;

	var headBoneIdx=bones.push(new modelBoneObject('Head',torsoBoneIdx,new wsPoint(0,-headHigh,0)))-1;

		// some random rotations

	ang=this.getRandomRotateAngle(20,0,0);
	ang.x=-ang.x;
	var torsoOffsetPnt=this.rotateBone(bones,torsoBoneIdx,ang);
	this.moveBone(bones,headBoneIdx,torsoOffsetPnt);
	this.rotateBone(bones,headBoneIdx,ang);

	ang=this.getRandomRotateAngle(5,0,10);
	this.moveBone(bones,rightShoulderBoneIdx,torsoOffsetPnt);
	this.rotateBone(bones,rightShoulderBoneIdx,ang);
	ang.z=-ang.z;
	this.moveBone(bones,leftShoulderBoneIdx,torsoOffsetPnt);
	this.rotateBone(bones,leftShoulderBoneIdx,ang);

	ang=this.getRandomRotateAngle(0,0,20);
	var leftOffsetPnt=this.rotateBone(bones,leftKneeBoneIdx,ang);
	this.moveBone(bones,leftAnkleBoneIdx,leftOffsetPnt);
	this.moveBone(bones,leftFootBoneIdx,leftOffsetPnt);

	ang.z=-ang.z;
	var rightOffsetPnt=this.rotateBone(bones,rightKneeBoneIdx,ang);
	this.moveBone(bones,rightAnkleBoneIdx,rightOffsetPnt);
	this.moveBone(bones,rightFootBoneIdx,rightOffsetPnt);
}
    
//
// gen skeleton object
//

function genSkeletonObject(model,genRandom)
{
    this.model=model;
    this.genRandom=genRandom;
    
        // functions

    this.getRandomRotateAngle=genSkeletonGetRandomRotateAngle;
    this.rotateBone=genSkeletonRotateBone;
    this.moveBone=genSkeletonMoveBone;
    
    this.build=genSkeletonBuild;
}
