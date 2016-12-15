/* global modelLimbConstants, genRandom, config, modelConstants */

"use strict";

//
// gen organic skeleton class
//

class GenModelOrganicSkeletonClass
{
    constructor(model)
    {
        this.model=model;
        
        Object.seal(this);
    }
    
        //
        // build chunks
        //
        
    buildLimbArm(vct,nameSuffix,torsoTopBoneIdx,armRadius,y,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength,limbType)
    {
        let shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx,knuckleBoneIdx,fingerBoneIdx;
        let n,fy,fingerRadius,knuckleLength,fingerTotalLength,handRadius;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // arm
            
        shoulderBoneIdx=bones.push(new ModelBoneClass(('Shoulder'+nameSuffix),torsoTopBoneIdx,new wsPoint((shoulderLength*vct.x),y,(shoulderLength*vct.z))))-1;
        elbowBoneIdx=bones.push(new ModelBoneClass(('Elbow'+nameSuffix),shoulderBoneIdx,new wsPoint((elbowLength*vct.x),y,(elbowLength*vct.z))))-1;
        wristBoneIdx=bones.push(new ModelBoneClass(('Wrist'+nameSuffix),elbowBoneIdx,new wsPoint((wristLength*vct.x),y,(wristLength*vct.z))))-1;
        
        bones[shoulderBoneIdx].gravityLockDistance=armRadius+50;
        bones[elbowBoneIdx].gravityLockDistance=armRadius;
        bones[wristBoneIdx].gravityLockDistance=armRadius;

        skeleton.limbs.push(new ModelLimbClass(limbType,modelLimbConstants.LIMB_AXIS_X,8,5,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx]));
        
            // hand

        handRadius=Math.trunc(armRadius*1.2);
        
        handBoneIdx=bones.push(new ModelBoneClass(('Hand'+nameSuffix),wristBoneIdx,new wsPoint((handLength*vct.x),y,(handLength*vct.z))))-1;
        bones[handBoneIdx].gravityLockDistance=handRadius;
        bones[handBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HAND,modelLimbConstants.LIMB_AXIS_X,5,5,[handBoneIdx]));
        
            // add fingers to hand
            
        if (fingerCount===0) return;
            
        fingerRadius=Math.trunc(armRadius*0.5);
        if (fingerRadius<100) fingerRadius=100;
        
        knuckleLength=handLength+Math.trunc(handRadius*0.5);
        fingerTotalLength=knuckleLength+fingerLength;

        fy=y-Math.trunc((fingerCount/2)*150)+75;
        
        for (n=0;n!==fingerCount;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneClass(('Finger Knuckle'+n+nameSuffix),handBoneIdx,new wsPoint((knuckleLength*vct.x),fy,(knuckleLength*vct.z))))-1;
            fingerBoneIdx=bones.push(new ModelBoneClass(('Finger'+n+nameSuffix),knuckleBoneIdx,new wsPoint((fingerTotalLength*vct.x),fy,(fingerTotalLength*vct.z))))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=fingerRadius;
            bones[fingerBoneIdx].gravityLockDistance=fingerRadius;
            
            skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_FINGER,modelLimbConstants.LIMB_AXIS_X,4,4,[knuckleBoneIdx,fingerBoneIdx]));
            
            fy+=150;
        }
    }
    
    buildLimbLeg(vct,boneIdx,nameSuffix,hipHigh,kneeHigh,ankleHigh,legRadius,footLength,toeCount,toeLength,limbType)
    {
        let legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx,knuckleBoneIdx,toeBoneIdx;
        let n,knuckleLength,toeRadius,toeTotalLength,fx,fz,vct2;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // leg
            
        legHipBoneIdx=bones.push(new ModelBoneClass(('LegHip'+nameSuffix),boneIdx,new wsPoint(vct.x,hipHigh,vct.z)))-1;
        kneeBoneIdx=bones.push(new ModelBoneClass(('Knee'+nameSuffix),legHipBoneIdx,new wsPoint(vct.x,kneeHigh,vct.z)))-1;
        ankleBoneIdx=bones.push(new ModelBoneClass(('Ankle'+nameSuffix),kneeBoneIdx,new wsPoint(vct.x,ankleHigh,vct.z)))-1;

        bones[legHipBoneIdx].gravityLockDistance=legRadius;
        bones[kneeBoneIdx].gravityLockDistance=legRadius;
        bones[ankleBoneIdx].gravityLockDistance=legRadius;

        this.model.skeleton.limbs.push(new ModelLimbClass(limbType,modelLimbConstants.LIMB_AXIS_Y,8,5,[legHipBoneIdx,kneeBoneIdx,ankleBoneIdx]));

            // foot

        vct2=new wsPoint(0.0,0.0,footLength);
        fz=vct.z+vct2.z;
        footBoneIdx=bones.push(new ModelBoneClass(('Foot'+nameSuffix),ankleBoneIdx,new wsPoint((vct.x+vct2.x),ankleHigh,fz)))-1;

        bones[footBoneIdx].gravityLockDistance=legRadius;
        bones[footBoneIdx].gravityScale.setFromValues(1.0,0.7,1.0);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_FOOT,modelLimbConstants.LIMB_AXIS_Z,5,5,[ankleBoneIdx,footBoneIdx]));
        
            // add toes to foot
            
        if (toeCount===0) return;
            
        toeRadius=Math.trunc(legRadius*0.5);
        if (toeRadius<100) toeRadius=100;
        
        knuckleLength=Math.trunc(footLength*0.5);
        toeTotalLength=knuckleLength+toeLength;

        fx=(vct.x-Math.trunc((toeCount/2)*150))+75;
        
        for (n=0;n!==toeCount;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneClass(('Toe Knuckle'+n+nameSuffix),footBoneIdx,new wsPoint(fx,ankleHigh,(fz+knuckleLength))))-1;
            toeBoneIdx=bones.push(new ModelBoneClass(('Toe'+n+nameSuffix),knuckleBoneIdx,new wsPoint(fx,ankleHigh,(fz+toeTotalLength))))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=toeRadius;
            bones[toeBoneIdx].gravityLockDistance=toeRadius;
            
            bones[knuckleBoneIdx].gravityScale.setFromValues(1.0,0.7,1.0);
            bones[toeBoneIdx].gravityScale.setFromValues(1.0,0.7,1.0);
            
            skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_TOE,modelLimbConstants.LIMB_AXIS_Z,4,4,[knuckleBoneIdx,toeBoneIdx]));
            
            fx+=150;
        }
    }
    
    buildLimbLegSet(boneIdx,legIndex,boneOffset,rotOffset,hipRadius,hipHigh,legRadius,footLength,leftLimbType,rightLimbType)
    {
        let toeCount,toeLength;
        let vct;
        let kneeHigh=Math.trunc(hipHigh*0.5);
        let ankleHigh=Math.trunc(hipHigh*0.05);
        
        if (genRandom.randomPercentage(0.2)) {
            toeCount=0;
            toeLength=0;
        }
        else {
            toeCount=genRandom.randomInt(1,3);
            toeLength=genRandom.randomInt(Math.trunc(legRadius*0.5),legRadius);
        }
        
        vct=new wsPoint(hipRadius,0.0,0.0);
        vct.rotateY(null,rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Left'+legIndex),hipHigh,kneeHigh,ankleHigh,legRadius,footLength,toeCount,toeLength,leftLimbType);

        vct=new wsPoint(-hipRadius,0.0,0.0);
        vct.rotateY(null,-rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Right'+legIndex),hipHigh,kneeHigh,ankleHigh,legRadius,footLength,toeCount,toeLength,rightLimbType);
    }
        
    buildLimbWhip(whipCount,parentBoneIdx,whipRadius,y,whipLength,rotOffset)
    {
        let whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx;
        let vct;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // direction
            
        vct=new wsPoint(whipLength,0.0,0.0);
        vct.rotateY(null,rotOffset);
        
            // the whip
            
        whip0BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_0'),parentBoneIdx,new wsPoint(0,y,0)))-1;
        whip1BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_1'),whip0BoneIdx,new wsPoint((vct.x*0.33),y,(vct.z*0.33))))-1;
        whip2BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_2'),whip1BoneIdx,new wsPoint((vct.x*0.66),y,(vct.z*0.66))))-1;
        whip3BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_3'),whip2BoneIdx,new wsPoint(vct.x,y,vct.z)))-1;

        bones[whip0BoneIdx].gravityLockDistance=whipRadius;
        bones[whip1BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.8);
        bones[whip2BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.6);
        bones[whip3BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.1);

        skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_WHIP,modelLimbConstants.LIMB_AXIS_Z,8,5,[whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx]));
    }
    
        //
        // build humanoid skeletons
        //
        
    buildHumanoid()
    {
        let n,bones;
        let bodyLimb;
        let hipHigh,waistHigh,torsoHigh,torsoTopHigh;
        let neckHigh,jawHigh,headHigh,armLength;
        let topBodyRadius,botBodyRadius;
        let baseBoneIdx,hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx;
        let neckBoneIdx,jawBoneIdx,headBoneIdx;
        let y,rotOffset,vct;
        let armCount,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength;
        let legRadius,footLength;
        
        this.model.skeleton=new ModelSkeletonClass();
        bones=this.model.skeleton.bones;
        
            // some radius
            
        topBodyRadius=genRandom.randomInt(300,1000);
        botBodyRadius=genRandom.randomInt(300,1000);
        
            // random heights
            // can never be taller than a single floor height
            
        hipHigh=genRandom.randomInt(600,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.4));
        waistHigh=hipHigh+genRandom.randomInt(200,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.15));
        torsoHigh=waistHigh+genRandom.randomInt(200,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.2));
        torsoTopHigh=torsoHigh+genRandom.randomInt(200,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.15));
        neckHigh=torsoTopHigh+Math.trunc(topBodyRadius*0.25);
        jawHigh=neckHigh+genRandom.randomInt(100,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.1));
        headHigh=jawHigh+genRandom.randomInt(200,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.2));
        
        while (true) {
            if (headHigh<map.ROOM_FLOOR_HEIGHT) break;
            
            hipHigh-=5;
            waistHigh-=10;
            torsoHigh-=15;
            torsoTopHigh-=20;
            neckHigh-=25;
            jawHigh-=30;
            headHigh-=35;
        }
        
            // some lengths
            
        topBodyRadius=genRandom.randomInt(300,1000);
        botBodyRadius=genRandom.randomInt(300,1000);
        
        armLength=genRandom.randomInt(Math.trunc(hipHigh*0.5),torsoTopHigh);
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limb
            
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-waistHigh,0)))-1;
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-torsoHigh,0)))-1;
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso Top',torsoBoneIdx,new wsPoint(0,-torsoTopHigh,0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=botBodyRadius;
        bones[waistBoneIdx].gravityLockDistance=botBodyRadius+Math.trunc((topBodyRadius-botBodyRadius)*0.33);
        bones[torsoBoneIdx].gravityLockDistance=botBodyRadius+Math.trunc((topBodyRadius-botBodyRadius)*0.66);
        bones[torsoTopBoneIdx].gravityLockDistance=topBodyRadius;
        
        bones[hipBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[waistBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoTopBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        
        bodyLimb=new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,modelLimbConstants.LIMB_AXIS_Y,8,8,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
        this.model.skeleton.limbs.push(bodyLimb);
        
        bodyLimb.hunchAngle=genRandom.randomInt(0,20);
        
            // create head limbs
        
        neckBoneIdx=bones.push(new ModelBoneClass('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
        jawBoneIdx=bones.push(new ModelBoneClass('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
        headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;

        bones[headBoneIdx].gravityLockDistance=genRandom.randomInt(300,400);
        bones[jawBoneIdx].gravityLockDistance=genRandom.randomInt(300,400);
        bones[neckBoneIdx].gravityLockDistance=genRandom.randomInt(100,150);

        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD,modelLimbConstants.LIMB_AXIS_Y,10,10,[headBoneIdx,jawBoneIdx,neckBoneIdx]));
        
            // create arm limbs
            // arm length is about quarter body size + some random
        
        y=bones[torsoTopBoneIdx].position.y-Math.trunc(topBodyRadius*0.5);
        
        if (genRandom.randomPercentage(0.9)) {
            armCount=genRandom.randomPercentage(0.8)?1:2;

            rotOffset=(genRandom.random()*20.0)-10.0;

            armRadius=Math.trunc(botBodyRadius*0.35);
            if (armRadius<250) armRadius=250;
            if (armRadius>350) armRadius=350;

            shoulderLength=Math.trunc(topBodyRadius*0.75);
            elbowLength=shoulderLength+Math.trunc(armLength*0.42);
            wristLength=shoulderLength+Math.trunc(armLength*0.84);
            handLength=shoulderLength+Math.trunc(armLength*0.9);

            if (genRandom.randomPercentage(0.2)) {
                fingerCount=0;
                fingerLength=0;
            }
            else {
                fingerCount=genRandom.randomInt(1,3);
                fingerLength=genRandom.randomInt(500,500);
            }
            
            for (n=0;n!==armCount;n++) {
                armY=y+Math.trunc(armRadius*0.5);

                vct=new wsPoint(1.0,0.0,0.0);
                vct.rotateY(null,rotOffset);
                this.buildLimbArm(vct,('Left'+n),torsoTopBoneIdx,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength,modelLimbConstants.LIMB_TYPE_ARM_LEFT);

                vct=new wsPoint(-1.0,0.0,0.0);
                vct.rotateY(null,-rotOffset);
                this.buildLimbArm(vct,('Right'+n),torsoTopBoneIdx,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength,modelLimbConstants.LIMB_TYPE_ARM_RIGHT);

                y+=Math.trunc(armRadius*2.2);
            }
        }
        
            // create leg limbs
        
        legRadius=Math.trunc(botBodyRadius*0.35);
        if (legRadius<250) legRadius=250;
        footLength=Math.trunc(legRadius*1.5);
       
        rotOffset=(genRandom.random()*20.0)-10.0;
        
        this.buildLimbLegSet(hipBoneIdx,0,0,rotOffset,Math.trunc(botBodyRadius*0.5),bones[hipBoneIdx].position.y,legRadius,footLength,modelLimbConstants.LIMB_TYPE_LEG_LEFT,modelLimbConstants.LIMB_TYPE_LEG_RIGHT);
    }

        //
        // build animal bones
        //

    buildAnimal()
    {
        let whipRadius,whipLength;
        let bones,baseBoneIdx;
        let high,totalHigh,bodyLength;
        let leftBodyRadius,rightBodyRadius;
        let torsoBoneIdx,waistBoneIdx,hipBoneIdx,torsoTopBoneIdx;
        let headRadius,neckLength,headLength,jawPivotLength,jawLength,jawHigh,headHigh;
        let neckPivotBoneIdx,neckBoneIdx,jawPivotBoneIdx,jawBoneIdx,headBoneIdx;
        let rotOffset,footLength;
        
        this.model.skeleton=new ModelSkeletonClass();
        bones=this.model.skeleton.bones;
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limbs
        
        totalHigh=genRandom.randomInt(800,2500);
        bodyLength=genRandom.randomInt(600,2000);
        
        leftBodyRadius=genRandom.randomInt(300,700);
        rightBodyRadius=genRandom.randomInt(300,700);

        high=totalHigh+genRandom.randomInt(0,300);
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',baseBoneIdx,new wsPoint(0,-high,Math.trunc(bodyLength*0.25))))-1;
        
        high=totalHigh+genRandom.randomInt(0,400);
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',torsoBoneIdx,new wsPoint(0,-high,-Math.trunc(bodyLength*0.25))))-1;
        
        high=totalHigh+genRandom.randomInt(0,400);
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',waistBoneIdx,new wsPoint(0,-high,-Math.trunc(bodyLength*0.5))))-1;
        
        high=totalHigh+genRandom.randomInt(0,300);
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso Top',torsoBoneIdx,new wsPoint(0,-high,Math.trunc(bodyLength*0.5))))-1;
        
        bones[hipBoneIdx].gravityLockDistance=rightBodyRadius;
        bones[waistBoneIdx].gravityLockDistance=rightBodyRadius+Math.trunc((leftBodyRadius-rightBodyRadius)*0.33);
        bones[torsoBoneIdx].gravityLockDistance=rightBodyRadius+Math.trunc((leftBodyRadius-rightBodyRadius)*0.66);
        bones[torsoTopBoneIdx].gravityLockDistance=leftBodyRadius;
        
        bones[hipBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[waistBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoTopBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
                    
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,modelLimbConstants.LIMB_AXIS_Z,10,10,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]));
        
            // create the head and jaw limbs

        headRadius=genRandom.randomInt(300,700);
        
        high=-bones[torsoTopBoneIdx].position.y;
        neckLength=Math.trunc(bodyLength*0.5)+genRandom.randomInt(400,600);
        headLength=neckLength+genRandom.randomInt(300,800);
        jawPivotLength=neckLength+genRandom.randomInt(50,50);
        jawLength=jawPivotLength+genRandom.randomInt(300,800);
        jawHigh=high-genRandom.randomInt(50,100);
        headHigh=high;
        
        neckPivotBoneIdx=bones.push(new ModelBoneClass('Neck Pivot',torsoTopBoneIdx,new wsPoint(0,-high,Math.trunc(bodyLength*0.5))))-1;
        neckBoneIdx=bones.push(new ModelBoneClass('Neck',neckPivotBoneIdx,new wsPoint(0,-high,neckLength)))-1;
        jawPivotBoneIdx=bones.push(new ModelBoneClass('Jaw Pivot',neckBoneIdx,new wsPoint(0,-jawHigh,jawPivotLength)))-1;
        jawBoneIdx=bones.push(new ModelBoneClass('Jaw',jawPivotBoneIdx,new wsPoint(0,-jawHigh,jawLength)))-1;
        headBoneIdx=bones.push(new ModelBoneClass('Head',neckBoneIdx,new wsPoint(0,-headHigh,headLength)))-1;
        
        bones[headBoneIdx].gravityLockDistance=headRadius;
        bones[jawPivotBoneIdx].gravityLockDistance=bones[jawBoneIdx].gravityLockDistance=Math.trunc(headRadius*0.8);
        bones[neckBoneIdx].gravityLockDistance=bones[neckPivotBoneIdx].gravityLockDistance=genRandom.randomInt(100,150);
        
        bones[headBoneIdx].gravityScale.setFromValues(1.0,0.8,1.0);
        bones[jawBoneIdx].gravityScale.setFromValues(1.0,0.3,1.0);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD_SNOUT,modelLimbConstants.LIMB_AXIS_Z,8,8,[headBoneIdx,neckBoneIdx,neckPivotBoneIdx]));
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD_JAW,modelLimbConstants.LIMB_AXIS_Z,8,8,[jawBoneIdx,jawPivotBoneIdx]));

            // create legs
        
        rotOffset=(genRandom.random()*20.0)-10.0;
        footLength=genRandom.randomInt(150,150);
        
        this.buildLimbLegSet(hipBoneIdx,0,bones[hipBoneIdx].position.z,rotOffset,Math.trunc(bones[hipBoneIdx].gravityLockDistance*0.8),bones[hipBoneIdx].position.y,200,footLength,modelLimbConstants.LIMB_TYPE_LEG_BACK,modelLimbConstants.LIMB_TYPE_LEG_BACK);
        this.buildLimbLegSet(torsoTopBoneIdx,0,bones[torsoTopBoneIdx].position.z,rotOffset,Math.trunc(bones[torsoTopBoneIdx].gravityLockDistance*0.5),bones[torsoTopBoneIdx].position.y,200,footLength,modelLimbConstants.LIMB_TYPE_LEG_FRONT,modelLimbConstants.LIMB_TYPE_LEG_FRONT);

            // tail
            
        if (genRandom.randomPercentage(0.75)) {
            whipRadius=genRandom.randomInt(Math.trunc(rightBodyRadius*0.35),Math.trunc(rightBodyRadius*0.2));
            whipLength=genRandom.randomInt(bodyLength,(bodyLength*3));
            
            this.buildLimbWhip(0,hipBoneIdx,whipRadius,bones[hipBoneIdx].position.y,whipLength,90.0);
        }
    }
     
        //
        // build blob bones
        //

    buildBlob()
    {
        let n,bones,boneIdx,rotOffset;
        let bodyLimb,whipRadius,whipLength;
        let totalHigh,baseBoneIdx,topBodyRadius,botBodyRadius;
        let hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx;
        let xScale,zScale;
        let neckHigh,jawHigh,headHigh;
        let neckBoneIdx,jawBoneIdx,headBoneIdx;
        let whipCount,whipMinLength,whipExtraLength;
        
        this.model.skeleton=new ModelSkeletonClass();
        bones=this.model.skeleton.bones;
        
            // random height
            // can never be taller than a single floor height
            // and always shorter than humanoids (no legs)
        
        totalHigh=genRandom.randomInt(Math.trunc(map.ROOM_FLOOR_HEIGHT*0.05),Math.trunc(map.ROOM_FLOOR_HEIGHT*0.8));
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limb
            
        topBodyRadius=genRandom.randomInt(200,2000);
        botBodyRadius=genRandom.randomInt(200,2000);

        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,0,0)))-1;
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.25),0)))-1;
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.5),0)))-1;
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso Top',torsoBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.75),0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=botBodyRadius;
        bones[waistBoneIdx].gravityLockDistance=botBodyRadius+Math.trunc((topBodyRadius-botBodyRadius)*0.33);
        bones[torsoBoneIdx].gravityLockDistance=botBodyRadius+Math.trunc((topBodyRadius-botBodyRadius)*0.66);
        bones[torsoTopBoneIdx].gravityLockDistance=topBodyRadius;
        
        xScale=genRandom.randomInt(70,50)/100.0;
        zScale=genRandom.randomInt(70,50)/100.0;
        bones[hipBoneIdx].gravityScale.setFromValues(xScale,1.0,zScale);
        bones[waistBoneIdx].gravityScale.setFromValues(xScale,1.0,zScale);
        bones[torsoBoneIdx].gravityScale.setFromValues(xScale,1.0,zScale);
        bones[torsoTopBoneIdx].gravityScale.setFromValues(xScale,1.0,zScale);
        
        bodyLimb=new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,modelLimbConstants.LIMB_AXIS_Y,10,10,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
        this.model.skeleton.limbs.push(bodyLimb);
        
            // create head limbs
        
        if (genRandom.randomPercentage(0.5)) {
            neckHigh=Math.trunc(totalHigh*0.76);
            jawHigh=neckHigh+genRandom.randomInt((topBodyRadius*0.5),(totalHigh*0.1));
            headHigh=jawHigh+genRandom.randomInt((topBodyRadius*0.5),(totalHigh*0.2));

            neckBoneIdx=bones.push(new ModelBoneClass('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
            jawBoneIdx=bones.push(new ModelBoneClass('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
            headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;

            bones[headBoneIdx].gravityLockDistance=genRandom.randomInt(100,800);
            bones[jawBoneIdx].gravityLockDistance=genRandom.randomInt(100,800);
            bones[neckBoneIdx].gravityLockDistance=genRandom.randomInt(100,800);

            this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD,modelLimbConstants.LIMB_AXIS_Y,8,8,[headBoneIdx,jawBoneIdx,neckBoneIdx]));
        }
        
            // create any whips
            
        whipCount=genRandom.randomInt(0,8);
        whipMinLength=Math.trunc((botBodyRadius+topBodyRadius)*0.7);
        whipExtraLength=Math.trunc((botBodyRadius+topBodyRadius)*0.8);
            
        for (n=0;n!==whipCount;n++) {
            boneIdx=bodyLimb.getRandomBoneIndex();
            rotOffset=genRandom.random()*360.0;
            
            whipRadius=Math.trunc(botBodyRadius*0.35);
            if (whipRadius<250) whipRadius=250;
            if (whipRadius>500) whipRadius=500;
            whipLength=genRandom.randomInt(whipMinLength,whipExtraLength);
            
            this.buildLimbWhip(n,boneIdx,whipRadius,bones[boneIdx].position.y,whipLength,rotOffset);
        }
     }

        //
        // build skeleton bones
        //

    build()
    {
            // build each type of skeleton
            
        switch (this.model.modelType) {
            case modelConstants.MODEL_TYPE_HUMANOID:
                this.buildHumanoid();
                break;
            case modelConstants.MODEL_TYPE_ANIMAL:
                this.buildAnimal();
                break;
            case modelConstants.MODEL_TYPE_BLOB:
                this.buildBlob();
                break;
        }
        
            // setup the bones for animation
            
        this.model.skeleton.precalcAnimationValues();
     }
    
}
