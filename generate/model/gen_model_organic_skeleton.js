/* global modelLimbConstants, genRandom, config, modelConstants, map */

"use strict";

//
// gen organic skeleton class
//

class GenModelOrganicSkeletonClass
{
    constructor(model,sizeFactor)
    {
        this.model=model;
        this.sizeFactor=sizeFactor;
        
        Object.seal(this);
    }
    
        //
        // build chunks
        //
        
    buildLimbArm(side,index,nameSuffix,vct,torsoTopBoneIdx,armRadius,y,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength)
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

        skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_ARM,side,index,modelLimbConstants.LIMB_AXIS_X,8,5,null,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx]));
        
            // hand

        handRadius=Math.trunc(armRadius*1.2);
        
        handBoneIdx=bones.push(new ModelBoneClass(('Hand'+nameSuffix),wristBoneIdx,new wsPoint((handLength*vct.x),y,(handLength*vct.z))))-1;
        bones[handBoneIdx].gravityLockDistance=handRadius;
        bones[handBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HAND,side,index,modelLimbConstants.LIMB_AXIS_X,8,8,null,[handBoneIdx]));
        
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
            
            skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_FINGER,side,index,modelLimbConstants.LIMB_AXIS_X,4,4,null,[knuckleBoneIdx,fingerBoneIdx]));
            
            fy+=150;
        }
    }
    
    buildLimbLeg(side,index,nameSuffix,vct,boneIdx,hipHigh,kneeHigh,ankleHigh,legRadius,footLength,toeCount,toeLength)
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

        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_LEG,side,index,modelLimbConstants.LIMB_AXIS_Y,8,5,null,[legHipBoneIdx,kneeBoneIdx,ankleBoneIdx]));

            // foot

        vct2=new wsPoint(0.0,0.0,footLength);
        fz=vct.z+vct2.z;
        footBoneIdx=bones.push(new ModelBoneClass(('Foot'+nameSuffix),ankleBoneIdx,new wsPoint((vct.x+vct2.x),ankleHigh,fz)))-1;

        bones[footBoneIdx].gravityLockDistance=legRadius;
        bones[footBoneIdx].gravityScale.setFromValues(1.0,0.7,1.0);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_FOOT,side,index,modelLimbConstants.LIMB_AXIS_Z,8,8,null,[ankleBoneIdx,footBoneIdx]));
        
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
            
            skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_TOE,side,index,modelLimbConstants.LIMB_AXIS_Z,4,4,null,[knuckleBoneIdx,toeBoneIdx]));
            
            fx+=150;
        }
    }
    
    buildLimbLegSet(sideLeft,sideRight,boneIdx,legIndex,boneOffset,rotOffset,hipRadius,hipHigh,legRadius,footLength)
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
        this.buildLimbLeg(sideLeft,legIndex,('Left'+legIndex),vct,boneIdx,hipHigh,kneeHigh,ankleHigh,legRadius,footLength,toeCount,toeLength);

        vct=new wsPoint(-hipRadius,0.0,0.0);
        vct.rotateY(null,-rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(sideRight,legIndex,('Right'+legIndex),vct,boneIdx,hipHigh,kneeHigh,ankleHigh,legRadius,footLength,toeCount,toeLength);
    }
        
    buildLimbWhip(whipCount,parentBoneIdx,whipRadius,y,whipLength,rotOffset,pushBoneRadius)
    {
        let whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx;
        let vct,pushVct,pnt;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // direction
            
        vct=new wsPoint(whipLength,0.0,0.0);
        vct.rotateY(null,rotOffset);
        
            // starting point, some whips are pushed
            // past the radius (graviy lock distance) or their
            // host bones
            
        pnt=new wsPoint(bones[parentBoneIdx].position.x,bones[parentBoneIdx].position.y,bones[parentBoneIdx].position.z);
        if (pushBoneRadius) {
            pushVct=new wsPoint(Math.trunc(bones[parentBoneIdx].gravityLockDistance*0.75),0.0,0.0);
            pushVct.rotateY(null,rotOffset);
            pnt.addPoint(pushVct);
        }
        
            // the whip
            
        whip0BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_0'),parentBoneIdx,new wsPoint(pnt.x,y,pnt.z)))-1;
        whip1BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_1'),whip0BoneIdx,new wsPoint((pnt.x+(vct.x*0.33)),y,(pnt.z+(vct.z*0.33)))))-1;
        whip2BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_2'),whip1BoneIdx,new wsPoint((pnt.x+(vct.x*0.66)),y,(pnt.z+(vct.z*0.66)))))-1;
        whip3BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_3'),whip2BoneIdx,new wsPoint((pnt.x+vct.x),y,(pnt.z+vct.z))))-1;

        bones[whip0BoneIdx].gravityLockDistance=whipRadius;
        bones[whip1BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.8);
        bones[whip2BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.6);
        bones[whip3BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.1);

        skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_WHIP,modelLimbConstants.LIMB_SIDE_NONE,whipCount,modelLimbConstants.LIMB_AXIS_Z,8,5,null,[whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx]));
    }
    
        //
        // build humanoid skeletons
        //
        
    buildHumanoid()
    {
        let n,bones;
        let bodyLimb;
        let hipHigh,waistHigh,torsoHigh,torsoTopHigh;
        let jawHigh,headHigh,armLength;
        let baseBoneIdx,hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx;
        let jawBoneIdx,headBoneIdx;
        let y,rotOffset,vct;
        let armCount,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength;
        let legRadius,footLength;
        
        this.model.skeleton=new ModelSkeletonClass();
        bones=this.model.skeleton.bones;
        
            // random heights
            
        hipHigh=Math.trunc(genRandom.randomInt(600,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.4))*this.sizeFactor);
        waistHigh=hipHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.15))*this.sizeFactor);
        torsoHigh=waistHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.2))*this.sizeFactor);
        torsoTopHigh=torsoHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.15))*this.sizeFactor);
        jawHigh=torsoTopHigh+Math.trunc(genRandom.randomInt(100,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.1))*this.sizeFactor);
        headHigh=jawHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.2))*this.sizeFactor);
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limb
            
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-waistHigh,0)))-1;
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-torsoHigh,0)))-1;
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso Top',torsoBoneIdx,new wsPoint(0,-torsoTopHigh,0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[waistBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[torsoBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[torsoTopBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        
        bones[hipBoneIdx].gravityScale.setFromValues(1.0,0.3,0.7);
        bones[waistBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoTopBoneIdx].gravityScale.setFromValues(1.0,0.5,0.7);
        
        bodyLimb=new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,modelLimbConstants.LIMB_SIDE_NONE,0,modelLimbConstants.LIMB_AXIS_Y,10,10,null,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
        this.model.skeleton.limbs.push(bodyLimb);
        
        bodyLimb.hunchAngle=genRandom.randomInt(0,20);
        
            // create neck and head limb
        
        jawBoneIdx=bones.push(new ModelBoneClass('Jaw',torsoTopBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
        headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;

        bones[headBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,400)*this.sizeFactor);
        bones[jawBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,400)*this.sizeFactor);
        
        bones[headBoneIdx].gravityScale.setFromValues(1.0,0.7,0.8);
        bones[jawBoneIdx].gravityScale.setFromValues(1.0,0.7,0.8);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_NECK,modelLimbConstants.LIMB_SIDE_NONE,0,modelLimbConstants.LIMB_AXIS_Y,5,5,new wsPoint(0.3,1.0,0.3),[torsoTopBoneIdx,jawBoneIdx]));

        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD,modelLimbConstants.LIMB_SIDE_NONE,0,modelLimbConstants.LIMB_AXIS_Y,10,10,null,[headBoneIdx,jawBoneIdx]));
        
            // create arm limbs
            // arm length is about quarter body size + some random
        
        y=bones[torsoTopBoneIdx].position.y;
        
        armCount=genRandom.randomPercentage(0.8)?1:2;
        armLength=genRandom.randomInt((torsoTopHigh-hipHigh),Math.trunc(hipHigh*0.5));

        rotOffset=(genRandom.random()*20.0)-10.0;

        armRadius=Math.trunc(bones[torsoTopBoneIdx].gravityLockDistance*0.45);
        if (armRadius<250) armRadius=250;

        shoulderLength=Math.trunc(bones[torsoTopBoneIdx].gravityLockDistance*0.75);
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
            this.buildLimbArm(modelLimbConstants.LIMB_SIDE_LEFT,n,('Left'+n),vct,torsoTopBoneIdx,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength);

            vct=new wsPoint(-1.0,0.0,0.0);
            vct.rotateY(null,-rotOffset);
            this.buildLimbArm(modelLimbConstants.LIMB_SIDE_RIGHT,n,('Right'+n),vct,torsoTopBoneIdx,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength);

            y+=Math.trunc(armRadius*1.8);
        }
        
            // create leg limbs
        
        legRadius=Math.trunc(bones[hipBoneIdx].gravityLockDistance*0.45);
        if (legRadius<250) legRadius=250;
        footLength=Math.trunc(legRadius*1.5);
       
        rotOffset=(genRandom.random()*20.0)-10.0;
        
        this.buildLimbLegSet(modelLimbConstants.LIMB_SIDE_LEFT,modelLimbConstants.LIMB_SIDE_RIGHT,hipBoneIdx,0,0,rotOffset,Math.trunc(bones[hipBoneIdx].gravityLockDistance*0.5),bones[hipBoneIdx].position.y,legRadius,footLength);
    }

        //
        // build animal bones
        //

    buildAnimal()
    {
        let whipRadius,whipLength;
        let bones,baseBoneIdx;
        let high,totalHigh,bodyLength;
        let torsoBoneIdx,waistBoneIdx,hipBoneIdx,torsoTopBoneIdx;
        let headRadius,snoutRadius,neckLength,headLength,jawPivotLength,jawLength,jawHigh,headHigh;
        let headBoneIdx,snoutBoneIdx,jawPivotBoneIdx,jawBoneIdx;
        let rotOffset,legRadius,footLength;
        
        this.model.skeleton=new ModelSkeletonClass();
        bones=this.model.skeleton.bones;
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limbs
        
        totalHigh=Math.trunc(genRandom.randomInt(800,2500)*this.sizeFactor);
        bodyLength=Math.trunc(genRandom.randomInt(600,2000)*this.sizeFactor);
        high=totalHigh+Math.trunc(genRandom.randomInt(0,400)*this.sizeFactor);
        
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,-high,-Math.trunc(bodyLength*0.5))))-1;
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-high,-Math.trunc(bodyLength*0.25))))-1;
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-high,Math.trunc(bodyLength*0.25))))-1;
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso Top',torsoBoneIdx,new wsPoint(0,-high,Math.trunc(bodyLength*0.5))))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        bones[waistBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        bones[torsoBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        bones[torsoTopBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        
        bones[hipBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[waistBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoTopBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
                    
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,modelLimbConstants.LIMB_SIDE_NONE,0,modelLimbConstants.LIMB_AXIS_Z,10,10,null,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]));
        
            // create the head and jaw limbs

        headRadius=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        snoutRadius=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        
        high=-bones[torsoTopBoneIdx].position.y;
        neckLength=Math.trunc(bodyLength*0.5)+genRandom.randomInt(400,600);
        headLength=neckLength+genRandom.randomInt(300,800);
        jawPivotLength=neckLength+genRandom.randomInt(50,50);
        jawLength=jawPivotLength+genRandom.randomInt(headRadius,snoutRadius);
        jawHigh=high-genRandom.randomInt(Math.trunc(headRadius*0.4),100);
        headHigh=high;
        
        headBoneIdx=bones.push(new ModelBoneClass('Head',torsoTopBoneIdx,new wsPoint(0,-high,neckLength)))-1;
        snoutBoneIdx=bones.push(new ModelBoneClass('Snout',headBoneIdx,new wsPoint(0,-headHigh,headLength)))-1;
        jawPivotBoneIdx=bones.push(new ModelBoneClass('Jaw Pivot',headBoneIdx,new wsPoint(0,-jawHigh,jawPivotLength)))-1;
        jawBoneIdx=bones.push(new ModelBoneClass('Jaw',jawPivotBoneIdx,new wsPoint(0,-jawHigh,jawLength)))-1;
        
        bones[headBoneIdx].gravityLockDistance=headRadius;
        bones[snoutBoneIdx].gravityLockDistance=snoutRadius;
        bones[jawPivotBoneIdx].gravityLockDistance=bones[jawBoneIdx].gravityLockDistance=Math.trunc(headRadius*0.8);
        bones[jawBoneIdx].gravityLockDistance=genRandom.randomInt(100,150);
        
        bones[headBoneIdx].gravityScale.setFromValues(0.8,1.0,1.0);
        bones[snoutBoneIdx].gravityScale.setFromValues(0.8,0.6,1.0);
        bones[jawBoneIdx].gravityScale.setFromValues(0.8,0.3,1.0);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_NECK,modelLimbConstants.LIMB_SIDE_NONE,0,modelLimbConstants.LIMB_AXIS_Z,8,8,new wsPoint(0.4,0.4,1.0),[headBoneIdx,torsoTopBoneIdx]));
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD_SNOUT,modelLimbConstants.LIMB_SIDE_NONE,0,modelLimbConstants.LIMB_AXIS_Z,8,8,null,[headBoneIdx,snoutBoneIdx]));
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD_JAW,modelLimbConstants.LIMB_SIDE_NONE,0,modelLimbConstants.LIMB_AXIS_Z,8,8,null,[jawBoneIdx,jawPivotBoneIdx]));

            // create legs
        
        rotOffset=(genRandom.random()*20.0)-10.0;
        
        legRadius=Math.trunc(bones[hipBoneIdx].gravityLockDistance*0.45);
        if (legRadius<250) legRadius=250;
        footLength=Math.trunc(legRadius*1.5);
        
        this.buildLimbLegSet(modelLimbConstants.LIMB_SIDE_BACK_LEFT,modelLimbConstants.LIMB_SIDE_BACK_RIGHT,hipBoneIdx,0,bones[hipBoneIdx].position.z,rotOffset,Math.trunc(bones[hipBoneIdx].gravityLockDistance*0.8),bones[hipBoneIdx].position.y,legRadius,footLength);
        this.buildLimbLegSet(modelLimbConstants.LIMB_SIDE_FRONT_LEFT,modelLimbConstants.LIMB_SIDE_FRONT_RIGHT,torsoTopBoneIdx,0,bones[torsoTopBoneIdx].position.z,rotOffset,Math.trunc(bones[torsoTopBoneIdx].gravityLockDistance*0.5),bones[torsoTopBoneIdx].position.y,legRadius,footLength);

            // tail
            
        if (genRandom.randomPercentage(0.75)) {
            whipRadius=Math.trunc(genRandom.randomInt(250,300)*this.sizeFactor);
            whipLength=Math.trunc(genRandom.randomInt(400,2000)*this.sizeFactor);
            
            this.buildLimbWhip(0,hipBoneIdx,whipRadius,bones[hipBoneIdx].position.y,whipLength,90.0,true);
        }
    }
     
        //
        // build blob bones
        //

    buildBlob()
    {
        let n,bones,boneIdx,rotOffset;
        let bodyLimb,whipRadius,whipLength;
        let totalHigh,baseBoneIdx;
        let hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx;
        let xScale,zScale;
        let jawHigh,headHigh;
        let jawBoneIdx,headBoneIdx;
        let whipCount;
        
        this.model.skeleton=new ModelSkeletonClass();
        bones=this.model.skeleton.bones;
        
            // random height
            // can never be taller than a single floor height
            // and always shorter than humanoids (no legs)
        
        totalHigh=Math.trunc(genRandom.randomInt(Math.trunc(map.ROOM_FLOOR_HEIGHT*0.05),Math.trunc(map.ROOM_FLOOR_HEIGHT*0.8))*this.sizeFactor);
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limb
            
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,0,0)))-1;
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.25),0)))-1;
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.5),0)))-1;
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso Top',torsoBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.75),0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(200,2000)*this.sizeFactor);
        bones[waistBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(200,2000)*this.sizeFactor);
        bones[torsoBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(200,2000)*this.sizeFactor);
        bones[torsoTopBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(200,2000)*this.sizeFactor);
        
        xScale=(genRandom.randomInt(70,50)/100.0)*this.sizeFactor;
        zScale=(genRandom.randomInt(70,50)/100.0)*this.sizeFactor;
        bones[hipBoneIdx].gravityScale.setFromValues(xScale,0.5,zScale);
        bones[waistBoneIdx].gravityScale.setFromValues(xScale,1.0,zScale);
        bones[torsoBoneIdx].gravityScale.setFromValues(xScale,1.0,zScale);
        bones[torsoTopBoneIdx].gravityScale.setFromValues(xScale,0.8,zScale);
        
        bodyLimb=new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,modelLimbConstants.LIMB_SIDE_NONE,0,modelLimbConstants.LIMB_AXIS_Y,10,10,null,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
        this.model.skeleton.limbs.push(bodyLimb);
        
            // create head and neck limbs
        
        if (genRandom.randomPercentage(0.5)) {
            jawHigh=Math.abs(bones[torsoTopBoneIdx].position.y)+genRandom.randomInt((totalHigh*0.1),(totalHigh*0.1));
            headHigh=jawHigh+genRandom.randomInt((totalHigh*0.1),(totalHigh*0.2));

            jawBoneIdx=bones.push(new ModelBoneClass('Neck',torsoTopBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
            headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;

            bones[headBoneIdx].gravityLockDistance=genRandom.randomInt(200,1000);
            bones[jawBoneIdx].gravityLockDistance=genRandom.randomInt(200,1000);

            this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_NECK,modelLimbConstants.LIMB_SIDE_NONE,0,modelLimbConstants.LIMB_AXIS_Y,8,8,new wsPoint(0.6,1.0,0.6),[torsoTopBoneIdx,jawBoneIdx]));
            this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD,modelLimbConstants.LIMB_SIDE_NONE,0,modelLimbConstants.LIMB_AXIS_Y,8,8,null,[headBoneIdx,jawBoneIdx]));
        }
        
            // create any whips
            
        whipCount=genRandom.randomInt(0,8);
            
        for (n=0;n!==whipCount;n++) {
            boneIdx=bodyLimb.getRandomBoneIndex();
            rotOffset=genRandom.random()*360.0;
            
            whipRadius=Math.trunc(genRandom.randomInt(250,300)*this.sizeFactor);
            whipLength=Math.trunc(genRandom.randomInt(400,2000)*this.sizeFactor);
            
            this.buildLimbWhip(n,boneIdx,whipRadius,bones[boneIdx].position.y,whipLength,rotOffset,true);
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
