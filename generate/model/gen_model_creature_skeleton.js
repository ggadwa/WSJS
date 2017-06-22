/* global modelLimbConstants, genRandom, config, modelConstants, map */

"use strict";

//
// gen creature skeleton class
//

class GenModelCreatureSkeletonClass
{
    constructor(model,sizeFactor)
    {
        this.model=model;
        this.sizeFactor=sizeFactor;
        
        this.SKELETON_GENERAL_HEIGHT=8000;
        
        Object.seal(this);
    }
    
        //
        // build chunks
        //
        
    
    buildLimbLeg(side,index,nameSuffix,vct,boneIdx,hipHigh,kneeHigh,ankleHigh,footHigh,legRadius,footLength,toeCount,toeLength,bodyLimbIdx)
    {
        let legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx,heelBoneIdx,knuckleBoneIdx,toeBoneIdx;
        let n,knuckleLength,toeRadius,toeTotalLength,fx,fz,vct2,legLimbIdx,footLimbIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // leg bones
            
        legHipBoneIdx=bones.push(new ModelBoneClass(('LegHip'+nameSuffix),boneIdx,new wsPoint(vct.x,hipHigh,vct.z)))-1;
        kneeBoneIdx=bones.push(new ModelBoneClass(('Knee'+nameSuffix),legHipBoneIdx,new wsPoint(vct.x,kneeHigh,vct.z)))-1;
        ankleBoneIdx=bones.push(new ModelBoneClass(('Ankle'+nameSuffix),kneeBoneIdx,new wsPoint(vct.x,ankleHigh,vct.z)))-1;
        heelBoneIdx=bones.push(new ModelBoneClass(('Heel'+nameSuffix),ankleBoneIdx,new wsPoint(vct.x,footHigh,vct.z)))-1;

        bones[legHipBoneIdx].gravityLockDistance=legRadius; //Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[kneeBoneIdx].gravityLockDistance=legRadius;
        bones[ankleBoneIdx].gravityLockDistance=legRadius;
        bones[heelBoneIdx].gravityLockDistance=legRadius;

            // foot bones and limb

        vct2=new wsPoint(0.0,0.0,footLength);
        fz=vct.z+vct2.z;
        footBoneIdx=bones.push(new ModelBoneClass(('Foot'+nameSuffix),heelBoneIdx,new wsPoint((vct.x+vct2.x),footHigh,fz)))-1;

        bones[footBoneIdx].gravityLockDistance=legRadius;
        
        footLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_FOOT,index,modelLimbConstants.LIMB_AXIS_Z,5,5,[heelBoneIdx,footBoneIdx]))-1;

            // create leg limb as it connects to both
            // body and foot
            
        legLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_LEG,index,modelLimbConstants.LIMB_AXIS_Y,8,5,[legHipBoneIdx,kneeBoneIdx,ankleBoneIdx]))-1;
        
            // toe bones and limbs
            
        if (toeCount===0) return;
            
        toeRadius=Math.trunc(legRadius*0.5);
        if (toeRadius<100) toeRadius=100;
        
        knuckleLength=Math.trunc(footLength*0.5);
        toeTotalLength=knuckleLength+toeLength;

        fx=(vct.x-Math.trunc((toeCount/2)*150))+75;
        
        for (n=0;n!==toeCount;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneClass(('Toe Knuckle'+n+nameSuffix),footBoneIdx,new wsPoint(fx,footHigh,(fz+knuckleLength))))-1;
            toeBoneIdx=bones.push(new ModelBoneClass(('Toe'+n+nameSuffix),knuckleBoneIdx,new wsPoint(fx,footHigh,(fz+toeTotalLength))))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=toeRadius;
            bones[toeBoneIdx].gravityLockDistance=toeRadius;
            
            skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_TOE,index,modelLimbConstants.LIMB_AXIS_Z,4,4,[knuckleBoneIdx,toeBoneIdx]));
            
            fx+=150;
        }
    }
    
    buildLimbLegSet(sideLeft,sideRight,boneIdx,legIndex,boneOffset,rotOffset,hipRadius,hipHigh,legRadius,footLength,bodyLimbIdx)
    {
        let toeCount,toeLength;
        let vct;
        let kneeHigh=Math.trunc(hipHigh*0.5);
        let ankleHigh=-(legRadius*2);
        let footHigh=-Math.trunc(legRadius*0.5);
        
        if (genRandom.randomPercentage(0.2)) {
            toeCount=0;
            toeLength=0;
        }
        else {
            toeCount=genRandom.randomInt(1,3);
            toeLength=genRandom.randomInt(Math.trunc(legRadius*0.5),legRadius);
        }
        
        hipHigh+=hipRadius;         // need legs to start below body so they can be connected later
        
        vct=new wsPoint(hipRadius,0.0,0.0);
        vct.rotateY(null,rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(sideLeft,legIndex,('Left'+legIndex),vct,boneIdx,hipHigh,kneeHigh,ankleHigh,footHigh,legRadius,footLength,toeCount,toeLength,bodyLimbIdx);

        vct=new wsPoint(-hipRadius,0.0,0.0);
        vct.rotateY(null,-rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(sideRight,legIndex,('Right'+legIndex),vct,boneIdx,hipHigh,kneeHigh,ankleHigh,footHigh,legRadius,footLength,toeCount,toeLength,bodyLimbIdx);
    }

        //
        // arm limb
        //
    
    buildLimbArm(limbIdx,parentBoneIdx,pnt,vct,axis,armRadius,needConnectBone)
    {
        let shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx,knuckleBoneIdx,fingerBoneIdx;
        let handPnt,handRadius,armLimbIdx,handLimbIdx;
        let n,fy,fingerCount,fingerRadius,fingerDistance;
        let knucklePnt,knuckleVct,fingerPnt,fingerVct;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // arm bones
            // we might already have a shoulder, so don't rebuild if we do
            
        if (needConnectBone) {
            shoulderBoneIdx=bones.push(new ModelBoneClass(('Shoulder_'+limbIdx),parentBoneIdx,new wsPoint(pnt.x,pnt.y,pnt.z)))-1;
        }
        else {
            shoulderBoneIdx=parentBoneIdx;
        }
        elbowBoneIdx=bones.push(new ModelBoneClass(('Elbow_'+limbIdx),shoulderBoneIdx,new wsPoint((pnt.x+(vct.x*0.45)),(pnt.y+(vct.y*0.45)),(pnt.z+(vct.z*0.45)))))-1;
        wristBoneIdx=bones.push(new ModelBoneClass(('Wrist_'+limbIdx),elbowBoneIdx,new wsPoint((pnt.x+(vct.x*0.9)),(pnt.y+(vct.y*0.9)),(pnt.z+(vct.z*0.9)))))-1;
        
        bones[shoulderBoneIdx].gravityLockDistance=Math.trunc(armRadius*1.1);
        bones[elbowBoneIdx].gravityLockDistance=armRadius;
        bones[wristBoneIdx].gravityLockDistance=armRadius;
        
            // hand bone and hand limb
            
        handRadius=Math.trunc(armRadius*1.3);
        handPnt=new wsPoint((pnt.x+vct.x),(pnt.y+vct.y),(pnt.z+vct.z));
        
        handBoneIdx=bones.push(new ModelBoneClass(('Hand_'+limbIdx),wristBoneIdx,handPnt))-1;
        
        bones[handBoneIdx].gravityLockDistance=handRadius;
        
        handLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HAND,limbIdx,axis,5,5,[handBoneIdx],-1,-1))-1;
        
            // now create the arm limb because it connects
            // to both the hand and body
            
        armLimbIdx=skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_ARM,limbIdx,axis,8,5,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx]))-1;

            // finger bones and limbs
        
        fingerCount=genRandom.randomInt(0,5);
        if (fingerCount===0) return;
        
        fingerRadius=Math.trunc((armRadius/fingerCount)*0.8);
        if (fingerRadius<100) fingerRadius=100;
        
        fingerDistance=Math.trunc(fingerRadius*1.1);
        
        knuckleVct=new wsPoint(vct.x,vct.y,vct.z);
        knuckleVct.normalize();
        knuckleVct.scale(Math.trunc(handRadius*0.4));
        knucklePnt=new wsPoint((handPnt.x+knuckleVct.x),(handPnt.y+knuckleVct.y),(handPnt.z+knuckleVct.z));
        
        fingerVct=new wsPoint(vct.x,vct.y,vct.z);
        fingerVct.normalize();
        fingerVct.scale(genRandom.randomInt(armRadius,armRadius));
        fingerPnt=new wsPoint((knucklePnt.x+fingerVct.x),(knucklePnt.y+fingerVct.y),(knucklePnt.z+fingerVct.z));

        fy=knucklePnt.y-Math.trunc(fingerCount*0.5)*fingerDistance;
        
        for (n=0;n!==fingerCount;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneClass(('Finger_Knuckle_'+limbIdx+'_'+n),handBoneIdx,new wsPoint(knucklePnt.x,fy,knucklePnt.z)))-1;
            fingerBoneIdx=bones.push(new ModelBoneClass(('Finger'+limbIdx+'_'+n),knuckleBoneIdx,new wsPoint(fingerPnt.x,fy,fingerPnt.z)))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=fingerRadius;
            bones[fingerBoneIdx].gravityLockDistance=fingerRadius;
            
            skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_FINGER,limbIdx,axis,4,4,[knuckleBoneIdx,fingerBoneIdx]));
            
            fy+=fingerDistance;
        }
    }
    
        //
        // whip limbs
        //
    
    buildLimbWhip(limbIdx,parentBoneIdx,pnt,vct,axis,whipRadius,needConnectBone)
    {
        let whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // the whip
            
        if (needConnectBone) {
            whip0BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_0'),parentBoneIdx,new wsPoint(pnt.x,pnt.y,pnt.z)))-1;
        }
        else {
            whip0BoneIdx=parentBoneIdx;
        }
        whip1BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_1'),whip0BoneIdx,new wsPoint((pnt.x+(vct.x*0.33)),(pnt.y+(vct.y*0.33)),(pnt.z+(vct.z*0.33)))))-1;
        whip2BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_2'),whip1BoneIdx,new wsPoint((pnt.x+(vct.x*0.66)),(pnt.y+(vct.y*0.66)),(pnt.z+(vct.z*0.66)))))-1;
        whip3BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_3'),whip2BoneIdx,new wsPoint((pnt.x+vct.x),(pnt.y+vct.y),(pnt.z+vct.z))))-1;

        bones[whip0BoneIdx].gravityLockDistance=whipRadius;
        bones[whip1BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.8);
        bones[whip2BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.6);
        bones[whip3BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.3);

        skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_WHIP,limbIdx,axis,8,5,[whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx]));
    }
    
        //
        // head
        //
        
    buildLimbHead(limbIdx,parentBoneIdx,pnt,vct,axis,neckRadius,needConnectBone)
    {
        let neckStartBoneIdx,neckEndBoneIdx,headBoneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // create the neck
            
        if (needConnectBone) {
            neckStartBoneIdx=bones.push(new ModelBoneClass(('Neck_Start_'+limbIdx),parentBoneIdx,new wsPoint(pnt.x,pnt.y,pnt.z)))-1;
            bones[neckStartBoneIdx].gravityLockDistance=neckRadius;
        }
        else {
            neckStartBoneIdx=parentBoneIdx;
        }
        
        neckEndBoneIdx=bones.push(new ModelBoneClass(('Neck_End_'+limbIdx),neckStartBoneIdx,new wsPoint((pnt.x+(vct.x*0.33)),(pnt.y+(vct.y*0.33)),(pnt.z+(vct.z*0.33)))))-1;
        bones[neckEndBoneIdx].gravityLockDistance=neckRadius;

        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_NECK,0,axis,5,5,[neckStartBoneIdx,neckEndBoneIdx]));
        
            // create the head
            
        headBoneIdx=bones.push(new ModelBoneClass('Head',neckEndBoneIdx,new wsPoint((pnt.x+(vct.x*0.66)),(pnt.y+(vct.y*0.66)),(pnt.z+(vct.z*0.66)))))-1;
        bones[headBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(neckRadius,Math.trunc(400*this.sizeFactor)));
        
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD,0,axis,10,10,[headBoneIdx]));
    }
    
        //
        // general body for creature
        //
        
    buildBody()
    {
        let bodyLimb,bodyLimbIdx;
        let hipHigh,waistHigh,torsoHigh,torsoTopHigh;
        let shoulderSize,hipSize;
        let baseBoneIdx,hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx;
        let leftShoulderBoneIdx,rightShoulderBoneIdx,leftHipBoneIdx,rightHipBoneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // random heights
            
        hipHigh=Math.trunc(genRandom.randomInt(600,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.4))*this.sizeFactor);
        waistHigh=hipHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.15))*this.sizeFactor);
        torsoHigh=waistHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.2))*this.sizeFactor);
        torsoTopHigh=torsoHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.15))*this.sizeFactor);
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // the spine
            
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-waistHigh,0)))-1;
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-torsoHigh,0)))-1;
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso_Top',torsoBoneIdx,new wsPoint(0,-torsoTopHigh,0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[waistBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[torsoBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[torsoTopBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        
            // the shoulders
            
        leftShoulderBoneIdx=bones.push(new ModelBoneClass('Left_Shoulder',torsoTopBoneIdx,new wsPoint(500,-torsoTopHigh,0)))-1;
        rightShoulderBoneIdx=bones.push(new ModelBoneClass('Right_Shoulder',torsoTopBoneIdx,new wsPoint(-500,-torsoTopHigh,0)))-1;
        
        shoulderSize=genRandom.randomInt(300,300)*this.sizeFactor;
        bones[leftShoulderBoneIdx].gravityLockDistance=Math.trunc(shoulderSize);
        bones[rightShoulderBoneIdx].gravityLockDistance=Math.trunc(shoulderSize);
        
            // the hips
            
        leftHipBoneIdx=bones.push(new ModelBoneClass('Left_Hip',hipBoneIdx,new wsPoint(500,-hipHigh,0)))-1;
        rightHipBoneIdx=bones.push(new ModelBoneClass('Right_Hip',hipBoneIdx,new wsPoint(-500,-hipHigh,0)))-1;
        
        hipSize=genRandom.randomInt(300,300)*this.sizeFactor;
        bones[leftHipBoneIdx].gravityLockDistance=Math.trunc(hipSize);
        bones[rightHipBoneIdx].gravityLockDistance=Math.trunc(hipSize);

            // the body limb
            
        bodyLimb=new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,0,modelLimbConstants.LIMB_AXIS_Y,12,12,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx,leftShoulderBoneIdx,rightShoulderBoneIdx,leftHipBoneIdx,rightHipBoneIdx]);
        bodyLimbIdx=skeleton.limbs.push(bodyLimb)-1;
        
        bodyLimb.hunchAngle=genRandom.randomInt(0,20);
        
        return(bodyLimbIdx);
    }
    
        //
        // limbs for creature
        //
    
    buildLimbs(bodyLimbIdx)
    {
        let n,limbCount;
        let bone,boneIdx,rotOffset,pushPastParentBoneGravity;
        let axis,radius,length,needConnectBone;
        let vct,pushVct,pnt;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let bodyLimb=skeleton.limbs[bodyLimbIdx];

                // random limb count
            
        limbCount=genRandom.randomInt(2,10);
        
        limbCount=3;        // supergumba -- testing
            
        for (n=0;n!==limbCount;n++) {
            boneIdx=bodyLimb.getRandomBoneIndex();
            
                // random positioning
                
            radius=Math.trunc(genRandom.randomInt(250,300)*this.sizeFactor);
            length=Math.trunc(genRandom.randomInt(400,2000)*this.sizeFactor);
            
            needConnectBone=true;                 // turn this off if connecting to something that already has an extra bone, like shoulders and hips
            pushPastParentBoneGravity=false;
            
                // special directions for bone types
                
            bone=bones[boneIdx];
            
            switch (bone.name) {
                
                case 'Torso_Top':
                    axis=modelLimbConstants.LIMB_AXIS_Y;
                    rotOffset=genRandom.randomInt(180,15)-30;
                    break;
                
                case 'Left_Shoulder':
                    axis=modelLimbConstants.LIMB_AXIS_X;
                    rotOffset=rotOffset=genRandom.randomInt(0,15)-30;
                    needConnectBone=false;
                    break;
                    
                case 'Right_Shoulder':
                    axis=modelLimbConstants.LIMB_AXIS_X;
                    rotOffset=rotOffset=genRandom.randomInt(180,15)-30;
                    needConnectBone=false;
                    break;
                    
                case 'Left_Hip':
                    axis=modelLimbConstants.LIMB_AXIS_Y;
                    rotOffset=genRandom.randomInt(0,15)-30;
                    length=-bone.position.y;
                    needConnectBone=false;
                    break;
                    
                case 'Right_Hip':
                    axis=modelLimbConstants.LIMB_AXIS_Y;
                    rotOffset=genRandom.randomInt(0,15)-30;
                    length=-bone.position.y;
                    needConnectBone=false;
                    break;
                    
                default:
                    if (genRandom.randomPercentage(0.5)) {
                        axis=modelLimbConstants.LIMB_AXIS_X;
                        rotOffset=genRandom.randomInt(0,15)-30;
                    }
                    else {
                        axis=modelLimbConstants.LIMB_AXIS_Z;
                        rotOffset=genRandom.randomInt(90,15)-30;
                    }
                    if (genRandom.randomPercentage(0.5)) rotOffset+=180;
                    
                    pushPastParentBoneGravity=true;
                    break;
            }
            
                // get starting point, limb vector,
                // and any necessary push off of original bone
            
            if (axis!==modelLimbConstants.LIMB_AXIS_Y) {
                vct=new wsPoint(length,0.0,0.0);
                vct.rotateY(null,rotOffset);

                pushVct=new wsPoint(Math.trunc(bone.gravityLockDistance*0.95),0.0,0.0);
                pushVct.rotateY(null,rotOffset);
            }
            else {
                vct=new wsPoint(0.0,length,0.0);
                vct.rotateX(null,rotOffset);

                pushVct=new wsPoint(0.0,Math.trunc(bone.gravityLockDistance*0.95),0.0);
                pushVct.rotateX(null,rotOffset);
            }
            
            pnt=new wsPoint(bone.position.x,bone.position.y,bone.position.z);
            if (pushPastParentBoneGravity) pnt.addPoint(pushVct);
            
                // create the limb

            switch (genRandom.randomIndex(3)) {
                case 0:
                    this.buildLimbHead(n,boneIdx,pnt,vct,axis,radius,needConnectBone);
                    break;
                case 1:
                    this.buildLimbArm(n,boneIdx,pnt,vct,axis,radius,needConnectBone);
                    break;
                case 2:
                    this.buildLimbWhip(n,boneIdx,pnt,vct,axis,radius,needConnectBone);
                    break;
            }
            
        }
    }
    
        //
        // build skeleton bones
        //

    build()
    {
        let bodyLimbIdx;
        
            // build the skeleton

        this.model.skeleton=new ModelSkeletonClass();
        
        bodyLimbIdx=this.buildBody();
        this.buildLimbs(bodyLimbIdx);
        
            // setup the bones for animation
            
        this.model.skeleton.precalcAnimationValues();
     }
    
}
