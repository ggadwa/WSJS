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
        // leg limb
        //
        
    buildLimbLeg(limbIdx,parentBoneIdx)
    {
        let pnt,vct,vct2,pushVct,legRadius,rotOffset;
        let hipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx,heelBoneIdx,knuckleBoneIdx,toeBoneIdx;
        let n,knuckleLength,toeRadius,toeTotalLength,fx,fz,legLimbIdx,footLimbIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let parentBone=bones[parentBoneIdx];
        
            // size and position around body

        legRadius=Math.trunc(genRandom.randomInt(250,300)*this.sizeFactor);
        rotOffset=genRandom.randomFloat(0.0,360.0);
        
        pushVct=new wsPoint(0.0,0.0,(parentBone.gravityLockDistance-Math.trunc(legRadius*0.5)));
        pushVct.rotateY(null,rotOffset);
        
        pnt=parentBone.position.copy();
        pnt.addPoint(pushVct);
        
            // legs always face down
            
        vct=new wsPoint(0.0,-parentBone.position.y,0.0);
        rotOffset=genRandom.randomInt(0,20)-10;
        vct.rotateX(null,rotOffset);
        
            // leg bones
            // we might already have a hip, so don't rebuild if we do
        
        hipBoneIdx=bones.push(new ModelBoneClass(('Hip_'+limbIdx),parentBoneIdx,new wsPoint(pnt.x,pnt.y,pnt.z)))-1;
        kneeBoneIdx=bones.push(new ModelBoneClass(('Knee_'+limbIdx),hipBoneIdx,new wsPoint((pnt.x+(vct.x*0.4)),(pnt.y+(vct.y*0.4)),(pnt.z+(vct.z*0.4)))))-1;
        ankleBoneIdx=bones.push(new ModelBoneClass(('Ankle_'+limbIdx),kneeBoneIdx,new wsPoint((pnt.x+(vct.x*0.8)),(pnt.y+(vct.y*0.8)),(pnt.z+(vct.z*0.8)))))-1;
        heelBoneIdx=bones.push(new ModelBoneClass(('Heel_'+limbIdx),ankleBoneIdx,new wsPoint((pnt.x+(vct.x*0.95)),(pnt.y+(vct.y*0.95)),(pnt.z+(vct.z*0.95)))))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(legRadius*1.1);
        bones[kneeBoneIdx].gravityLockDistance=legRadius;
        bones[ankleBoneIdx].gravityLockDistance=legRadius;
        bones[heelBoneIdx].gravityLockDistance=legRadius;
        
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_LEG,limbIdx,modelLimbConstants.LIMB_AXIS_Y,8,5,[hipBoneIdx,kneeBoneIdx,ankleBoneIdx,heelBoneIdx]))-1;
        
            // the foot bones
            // feet are always parallel to ground, towards front
       
        vct2=new wsPoint(0.0,0.0,genRandom.randomInt(legRadius,(legRadius*2)));
        vct2.rotateY(null,genRandom.randomFloat(0.0,360.0));
        footBoneIdx=bones.push(new ModelBoneClass(('Foot_'+limbIdx),heelBoneIdx,new wsPoint((bones[heelBoneIdx].position.x+vct2.x),(bones[heelBoneIdx].position.y+vct2.y),(bones[heelBoneIdx].position.z+vct2.z))))-1;

        bones[footBoneIdx].gravityLockDistance=legRadius;
        
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_FOOT,limbIdx,modelLimbConstants.LIMB_AXIS_Z,5,5,[heelBoneIdx,footBoneIdx]))-1;

/*
        
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
        */
    }

        //
        // arm limb
        //
    
    buildLimbArm(limbIdx,parentBoneIdx)
    {
        let armRadius,rotOffset,length,axis,pnt,vct,pushVct;
        let shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx,knuckleBoneIdx,fingerBoneIdx;
        let handPnt,handRadius,armLimbIdx,handLimbIdx;
        let n,fy,fingerCount,fingerRadius,fingerDistance;
        let knucklePnt,knuckleVct,fingerPnt,fingerVct;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let parentBone=bones[parentBoneIdx];
        
            // size and position around body
            
        armRadius=Math.trunc(genRandom.randomInt(250,300)*this.sizeFactor);
        length=Math.trunc(genRandom.randomInt(400,2000)*this.sizeFactor);
        
        if (genRandom.randomPercentage(0.5)) {
            axis=modelLimbConstants.LIMB_AXIS_Z;
            rotOffset=genRandom.randomInt(0,30)-15;
        }
        else {
            axis=modelLimbConstants.LIMB_AXIS_X;
            rotOffset=genRandom.randomInt(90,30)-15;
        }
        if (genRandom.randomPercentage(0.5)) rotOffset+=180;
        
        pushVct=new wsPoint(0.0,0.0,(parentBone.gravityLockDistance-Math.trunc(armRadius*0.5)));
        pushVct.rotateY(null,rotOffset);
        
        pnt=parentBone.position.copy();
        pnt.addPoint(pushVct);
        
            // arms face out
            
        vct=new wsPoint(0.0,0.0,length);
        vct.rotateY(null,rotOffset);
       
            // arm limb
            
        shoulderBoneIdx=bones.push(new ModelBoneClass(('Shoulder_'+limbIdx),parentBoneIdx,new wsPoint(pnt.x,pnt.y,pnt.z)))-1;
        elbowBoneIdx=bones.push(new ModelBoneClass(('Elbow_'+limbIdx),shoulderBoneIdx,new wsPoint((pnt.x+(vct.x*0.45)),(pnt.y+(vct.y*0.45)),(pnt.z+(vct.z*0.45)))))-1;
        wristBoneIdx=bones.push(new ModelBoneClass(('Wrist_'+limbIdx),elbowBoneIdx,new wsPoint((pnt.x+(vct.x*0.9)),(pnt.y+(vct.y*0.9)),(pnt.z+(vct.z*0.9)))))-1;
        
        bones[shoulderBoneIdx].gravityLockDistance=Math.trunc(armRadius*1.1);
        bones[elbowBoneIdx].gravityLockDistance=armRadius;
        bones[wristBoneIdx].gravityLockDistance=armRadius;
        
        armLimbIdx=skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_ARM,limbIdx,axis,8,5,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx]))-1;
        
            // limb
            
        handRadius=Math.trunc(armRadius*1.3);
        handPnt=new wsPoint((pnt.x+vct.x),(pnt.y+vct.y),(pnt.z+vct.z));
        
        handBoneIdx=bones.push(new ModelBoneClass(('Hand_'+limbIdx),wristBoneIdx,handPnt))-1;
        
        bones[handBoneIdx].gravityLockDistance=handRadius;
        
        handLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HAND,limbIdx,axis,5,5,[handBoneIdx],-1,-1))-1;

            // finger limbs
        
        fingerCount=genRandom.randomInt(0,5);
        if (fingerCount===0) return;
        
        fingerRadius=Math.trunc((armRadius/fingerCount)*0.8);
        if (fingerRadius<100) fingerRadius=100;
        
        fingerDistance=Math.trunc(fingerRadius*1.1);
        
        knuckleVct=vct.copy();
        knuckleVct.normalize();
        knuckleVct.scale(Math.trunc(handRadius*0.4));
        knucklePnt=new wsPoint((handPnt.x+knuckleVct.x),(handPnt.y+knuckleVct.y),(handPnt.z+knuckleVct.z));
        
        fingerVct=vct.copy();
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
    
    buildLimbWhip(limbIdx,parentBoneIdx)
    {
        let whipRadius,rotOffset,length,axis,pnt,vct,pushVct;
        let whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let parentBone=bones[parentBoneIdx];
        
            // size and position around body
            
        whipRadius=Math.trunc(genRandom.randomInt(250,300)*this.sizeFactor);
        length=Math.trunc(genRandom.randomInt(400,2000)*this.sizeFactor);
        
        if (genRandom.randomPercentage(0.5)) {
            axis=modelLimbConstants.LIMB_AXIS_Z;
            rotOffset=genRandom.randomInt(0,30)-15;
        }
        else {
            axis=modelLimbConstants.LIMB_AXIS_X;
            rotOffset=genRandom.randomInt(90,30)-15;
        }
        if (genRandom.randomPercentage(0.5)) rotOffset+=180;
        
        pushVct=new wsPoint(0.0,0.0,(parentBone.gravityLockDistance-Math.trunc(whipRadius*0.5)));
        pushVct.rotateY(null,rotOffset);
        
        pnt=parentBone.position.copy();
        pnt.addPoint(pushVct);
        
            // whips face out
            
        vct=new wsPoint(0.0,0.0,length);
        vct.rotateY(null,rotOffset);
        
            // whip limb
            
        whip0BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_0'),parentBoneIdx,new wsPoint(pnt.x,pnt.y,pnt.z)))-1;
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
        let baseBoneIdx,hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx;
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

            // the body limb
            
        bodyLimb=new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,0,modelLimbConstants.LIMB_AXIS_Y,12,12,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
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
        let bone,boneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let bodyLimb=skeleton.limbs[bodyLimbIdx];
        
        let randomLimbType=[modelLimbConstants.LIMB_TYPE_HEAD,modelLimbConstants.LIMB_TYPE_ARM,modelLimbConstants.LIMB_TYPE_LEG,modelLimbConstants.LIMB_TYPE_WHIP];
        
            // random limb count
            
        limbCount=genRandom.randomInt(2,10);
            
        for (n=0;n!==limbCount;n++) {
            boneIdx=bodyLimb.getRandomBoneIndex();
            bone=bones[boneIdx];
            
            switch (randomLimbType[genRandom.randomIndex(randomLimbType.length)]) {
                case modelLimbConstants.LIMB_TYPE_ARM:
                    this.buildLimbArm(n,boneIdx);
                    break;
                case modelLimbConstants.LIMB_TYPE_LEG:
                    this.buildLimbLeg(n,boneIdx);
                    break;
                case modelLimbConstants.LIMB_TYPE_WHIP:
                    this.buildLimbWhip(n,boneIdx);
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
