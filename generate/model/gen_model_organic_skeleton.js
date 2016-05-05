"use strict";

//
// gen organic skeleton class
//

class GenModelOrganicSkeletonClass
{
    constructor(model,genRandom)
    {
        this.model=model;
        this.genRandom=genRandom;
        
        Object.seal(this);
    }
    
        //
        // build chunks
        //
        
    buildLimbArm(vct,nameSuffix,torsoTopBoneIdx,armRadius,y,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength,leftLimb)
    {
        var shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx,knuckleBoneIdx,fingerBoneIdx;
        var n,fy,fingerRadius,knuckleLength,fingerTotalLength,handRadius;
        var skeleton=this.model.skeleton;
        var bones=skeleton.bones;
        
            // arm
            
        shoulderBoneIdx=bones.push(new ModelBoneClass(('Shoulder'+nameSuffix),torsoTopBoneIdx,new wsPoint((shoulderLength*vct.x),y,(shoulderLength*vct.z))))-1;
        elbowBoneIdx=bones.push(new ModelBoneClass(('Elbow'+nameSuffix),shoulderBoneIdx,new wsPoint((elbowLength*vct.x),y,(elbowLength*vct.z))))-1;
        wristBoneIdx=bones.push(new ModelBoneClass(('Wrist'+nameSuffix),elbowBoneIdx,new wsPoint((wristLength*vct.x),y,(wristLength*vct.z))))-1;
        
        bones[shoulderBoneIdx].gravityLockDistance=armRadius+50;
        bones[elbowBoneIdx].gravityLockDistance=armRadius;
        bones[wristBoneIdx].gravityLockDistance=armRadius;

        skeleton.limbs.push(new ModelLimbClass((leftLimb?LIMB_TYPE_ARM_LEFT:LIMB_TYPE_ARM_RIGHT),LIMB_AXIS_X,8,5,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx]));
        
            // hand

        handRadius=Math.trunc(armRadius*1.2);
        
        handBoneIdx=bones.push(new ModelBoneClass(('Hand'+nameSuffix),wristBoneIdx,new wsPoint((handLength*vct.x),y,(handLength*vct.z))))-1;
        bones[handBoneIdx].gravityLockDistance=handRadius;
        bones[handBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        
        this.model.skeleton.limbs.push(new ModelLimbClass((leftLimb?LIMB_TYPE_HAND_LEFT:LIMB_TYPE_HAND_RIGHT),LIMB_AXIS_X,5,5,[handBoneIdx]));
        
            // add fingers to hand
            
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
            
            skeleton.limbs.push(new ModelLimbClass((leftLimb?LIMB_TYPE_FINGER_LEFT:LIMB_TYPE_FINGER_RIGHT),LIMB_AXIS_X,4,4,[knuckleBoneIdx,fingerBoneIdx]));
            
            fy+=150;
        }
    }
    
    buildLimbLeg(vct,boneIdx,nameSuffix,hipHigh,kneeHigh,ankleHigh,legRadius,footLength,toeCount,toeLength,leftLimb)
    {
        var legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx,knuckleBoneIdx,toeBoneIdx;
        var n,knuckleLength,toeRadius,toeTotalLength,fx,fz,vct;
        var skeleton=this.model.skeleton;
        var bones=skeleton.bones;
        
            // leg
            
        legHipBoneIdx=bones.push(new ModelBoneClass(('LegHip'+nameSuffix),boneIdx,new wsPoint(vct.x,hipHigh,vct.z)))-1;
        kneeBoneIdx=bones.push(new ModelBoneClass(('Knee'+nameSuffix),legHipBoneIdx,new wsPoint(vct.x,kneeHigh,vct.z)))-1;
        ankleBoneIdx=bones.push(new ModelBoneClass(('Ankle'+nameSuffix),kneeBoneIdx,new wsPoint(vct.x,ankleHigh,vct.z)))-1;

        bones[legHipBoneIdx].gravityLockDistance=legRadius;
        bones[kneeBoneIdx].gravityLockDistance=legRadius;
        bones[ankleBoneIdx].gravityLockDistance=legRadius;

        this.model.skeleton.limbs.push(new ModelLimbClass((leftLimb?LIMB_TYPE_LEG_LEFT:LIMB_TYPE_LEG_RIGHT),LIMB_AXIS_Y,8,5,[legHipBoneIdx,kneeBoneIdx,ankleBoneIdx]));

            // foot

        var vct2=new wsPoint(0.0,0.0,-footLength);
        fz=vct.z+vct2.z;
        footBoneIdx=bones.push(new ModelBoneClass(('Foot'+nameSuffix),ankleBoneIdx,new wsPoint((vct.x+vct2.x),ankleHigh,fz)))-1;

        bones[footBoneIdx].gravityLockDistance=legRadius;
        bones[footBoneIdx].gravityScale.setFromValues(1.0,0.7,1.0);
        
        this.model.skeleton.limbs.push(new ModelLimbClass((leftLimb?LIMB_TYPE_FOOT_LEFT:LIMB_TYPE_FOOT_RIGHT),LIMB_AXIS_Z,5,5,[ankleBoneIdx,footBoneIdx]));
        
            // add toes to foot
            
        toeRadius=Math.trunc(legRadius*0.5);
        if (toeRadius<100) toeRadius=100;
        
        knuckleLength=Math.trunc(footLength*0.5);
        toeTotalLength=knuckleLength+toeLength;

        fx=(vct.x-Math.trunc((toeCount/2)*150))+75;
        
        for (n=0;n!==toeCount;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneClass(('Toe Knuckle'+n+nameSuffix),footBoneIdx,new wsPoint(fx,ankleHigh,(fz-knuckleLength))))-1;
            toeBoneIdx=bones.push(new ModelBoneClass(('Toe'+n+nameSuffix),knuckleBoneIdx,new wsPoint(fx,ankleHigh,(fz-toeTotalLength))))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=toeRadius;
            bones[toeBoneIdx].gravityLockDistance=toeRadius;
            
            bones[knuckleBoneIdx].gravityScale.setFromValues(1.0,0.7,1.0);
            bones[toeBoneIdx].gravityScale.setFromValues(1.0,0.7,1.0);
            
            skeleton.limbs.push(new ModelLimbClass((leftLimb?LIMB_TYPE_TOE_LEFT:LIMB_TYPE_TOE_RIGHT),LIMB_AXIS_Z,4,4,[knuckleBoneIdx,toeBoneIdx]));
            
            fx+=150;
        }
    }
    
    buildLimbLegSet(boneIdx,legIndex,boneOffset,rotOffset,hipRadius,hipHigh,legRadius,footLength)
    {
        var kneeHigh=Math.trunc(hipHigh*0.5);
        var ankleHigh=Math.trunc(hipHigh*0.05);
        
        var toeCount=this.genRandom.randomInt(1,3);
        var toeLength=this.genRandom.randomInt(Math.trunc(legRadius*0.5),legRadius);
        
        var vct=new wsPoint(hipRadius,0.0,0.0);
        vct.rotateY(null,rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Left'+legIndex),hipHigh,kneeHigh,ankleHigh,legRadius,footLength,toeCount,toeLength,true);

        vct=new wsPoint(-hipRadius,0.0,0.0);
        vct.rotateY(null,-rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Right'+legIndex),hipHigh,kneeHigh,ankleHigh,legRadius,footLength,toeCount,toeLength,false);
    }
        
    buildLimbWhip(whipCount,parentBoneIdx,whipRadius,y,whipLength,rotOffset)
    {
        var whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx;
        var skeleton=this.model.skeleton;
        var bones=skeleton.bones;
        
            // direction
            
        var vct=new wsPoint(whipLength,0.0,0.0);
        vct.rotateY(null,rotOffset);
        
            // the whip
            
        whip0BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_0'),parentBoneIdx,new wsPoint((vct.x*0.25),y,(vct.z*0.25))))-1;
        whip1BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_1'),whip0BoneIdx,new wsPoint((vct.x*0.50),y,(vct.z*0.50))))-1;
        whip2BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_2'),whip1BoneIdx,new wsPoint((vct.x*0.75),y,(vct.z*0.75))))-1;
        whip3BoneIdx=bones.push(new ModelBoneClass(('Whip'+whipCount+'_3'),whip2BoneIdx,new wsPoint(vct.x,y,vct.z)))-1;

        bones[whip0BoneIdx].gravityLockDistance=whipRadius;
        bones[whip1BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.8);
        bones[whip2BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.6);
        bones[whip3BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.1);

        skeleton.limbs.push(new ModelLimbClass(LIMB_TYPE_WHIP,LIMB_AXIS_Z,8,5,[whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx]));
    }
    
        //
        // build humanoid skeletons
        //
        
    buildHumanoid()
    {
        var n,boneIdx;
        var bodyLimb;
        var hipHigh,waistHigh,torsoHigh,torsoTopHigh;
        var neckHigh,jawHigh,headHigh,armLength;
        var topBodyRadius,botBodyRadius;
        
        this.model.skeleton=new ModelSkeletonClass();
        var bones=this.model.skeleton.bones;
        
            // some radius
            
        topBodyRadius=this.genRandom.randomInt(300,1000);
        botBodyRadius=this.genRandom.randomInt(300,1000);
        
            // random heights
            // can never be taller than a single floor height
            
        hipHigh=this.genRandom.randomInt(600,Math.trunc(config.ROOM_FLOOR_HEIGHT*0.4));
        waistHigh=hipHigh+this.genRandom.randomInt(200,Math.trunc(config.ROOM_FLOOR_HEIGHT*0.15));
        torsoHigh=waistHigh+this.genRandom.randomInt(200,Math.trunc(config.ROOM_FLOOR_HEIGHT*0.2));
        torsoTopHigh=torsoHigh+this.genRandom.randomInt(200,Math.trunc(config.ROOM_FLOOR_HEIGHT*0.15));
        neckHigh=torsoTopHigh+Math.trunc(topBodyRadius*0.25);
        jawHigh=neckHigh+this.genRandom.randomInt(100,Math.trunc(config.ROOM_FLOOR_HEIGHT*0.1));
        headHigh=jawHigh+this.genRandom.randomInt(200,Math.trunc(config.ROOM_FLOOR_HEIGHT*0.2));
        
        while (true) {
            if (headHigh<config.ROOM_FLOOR_HEIGHT) break;
            
            hipHigh-=5;
            waistHigh-=10;
            torsoHigh-=15;
            torsoTopHigh-=20;
            neckHigh-=25;
            jawHigh-=30;
            headHigh-=35;
        }
        
            // some lengths
            
        topBodyRadius=this.genRandom.randomInt(300,1000);
        botBodyRadius=this.genRandom.randomInt(300,1000);
        
        armLength=this.genRandom.randomInt(Math.trunc(hipHigh*0.5),torsoTopHigh);
        
            // the base bone
            
        var baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limb
            
        var hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
        var waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-waistHigh,0)))-1;
        var torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-torsoHigh,0)))-1;
        var torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso Top',torsoBoneIdx,new wsPoint(0,-torsoTopHigh,0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=botBodyRadius;
        bones[waistBoneIdx].gravityLockDistance=botBodyRadius+Math.trunc((topBodyRadius-botBodyRadius)*0.33);
        bones[torsoBoneIdx].gravityLockDistance=botBodyRadius+Math.trunc((topBodyRadius-botBodyRadius)*0.66);
        bones[torsoTopBoneIdx].gravityLockDistance=topBodyRadius;
        
        bones[hipBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[waistBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoTopBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        
        bodyLimb=new ModelLimbClass(LIMB_TYPE_BODY,LIMB_AXIS_Y,8,8,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
        this.model.skeleton.limbs.push(bodyLimb);
        
            // create head limbs
        
        if (this.genRandom.randomPercentage(0.9)) {
            var neckBoneIdx=bones.push(new ModelBoneClass('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
            var jawBoneIdx=bones.push(new ModelBoneClass('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
            var headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;

            bones[headBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
            bones[jawBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
            bones[neckBoneIdx].gravityLockDistance=this.genRandom.randomInt(100,150);

            this.model.skeleton.limbs.push(new ModelLimbClass(LIMB_TYPE_HEAD,LIMB_AXIS_Y,10,10,[headBoneIdx,jawBoneIdx,neckBoneIdx]));
        }
        
            // create arm limbs
            // arm length is about quarter body size + some random
        
        var y=bones[torsoTopBoneIdx].position.y-Math.trunc(topBodyRadius*0.5);
        var rotOffset,vct,y;
        
        if (this.genRandom.randomPercentage(0.9)) {
            var armCount=this.genRandom.randomPercentage(0.8)?1:2;
            var armRadius,armY;
            var shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength;

            rotOffset=(this.genRandom.random()*20.0)-10.0;

            armRadius=Math.trunc(botBodyRadius*0.35);
            if (armRadius<250) armRadius=250;
            if (armRadius>350) armRadius=350;

            shoulderLength=Math.trunc(topBodyRadius*0.75);
            elbowLength=shoulderLength+Math.trunc(armLength*0.42);
            wristLength=shoulderLength+Math.trunc(armLength*0.84);
            handLength=shoulderLength+Math.trunc(armLength*0.9);

            fingerCount=this.genRandom.randomInt(1,3);
            fingerLength=this.genRandom.randomInt(500,500);

            for (n=0;n!==armCount;n++) {
                armY=y+Math.trunc(armRadius*0.5);

                vct=new wsPoint(1.0,0.0,0.0);
                vct.rotateY(null,rotOffset);
                this.buildLimbArm(vct,('Left'+n),torsoTopBoneIdx,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength,true);

                vct=new wsPoint(-1.0,0.0,0.0);
                vct.rotateY(null,-rotOffset);
                this.buildLimbArm(vct,('Right'+n),torsoTopBoneIdx,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength,false);

                y+=Math.trunc(armRadius*2.2);
            }
        }
        
            // create leg limbs
        
        var legRadius=Math.trunc(botBodyRadius*0.35);
        if (legRadius<250) legRadius=250;
        var footLength=Math.trunc(legRadius*1.5);
       
        rotOffset=(this.genRandom.random()*20.0)-10.0;
        
        this.buildLimbLegSet(hipBoneIdx,0,0,rotOffset,Math.trunc(botBodyRadius*0.5),bones[hipBoneIdx].position.y,legRadius,footLength);
    }

        //
        // build animal bones
        //

    buildAnimal()
    {
        var whipRadius,whipLength;
        this.model.skeleton=new ModelSkeletonClass();
        var bones=this.model.skeleton.bones;
        
            // the base bone
            
        var baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limbs
        
        var high;
        var totalHigh=this.genRandom.randomInt(800,2500);
        var bodyLength=this.genRandom.randomInt(600,1000);
        
        var leftBodyRadius=this.genRandom.randomInt(300,700);
        var rightBodyRadius=this.genRandom.randomInt(300,700);

        high=totalHigh+this.genRandom.randomInt(0,300);
        var torsoBoneIdx=bones.push(new ModelBoneClass('Torso',baseBoneIdx,new wsPoint(0,-high,-Math.trunc(bodyLength*0.25))))-1;
        
        high=totalHigh+this.genRandom.randomInt(0,400);
        var waistBoneIdx=bones.push(new ModelBoneClass('Waist',torsoBoneIdx,new wsPoint(0,-high,Math.trunc(bodyLength*0.25))))-1;
        
        high=totalHigh+this.genRandom.randomInt(0,400);
        var hipBoneIdx=bones.push(new ModelBoneClass('Hip',waistBoneIdx,new wsPoint(0,-high,Math.trunc(bodyLength*0.5))))-1;
        
        high=totalHigh+this.genRandom.randomInt(0,300);
        var torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso Top',torsoBoneIdx,new wsPoint(0,-high,-Math.trunc(bodyLength*0.5))))-1;
        
        bones[hipBoneIdx].gravityLockDistance=rightBodyRadius;
        bones[waistBoneIdx].gravityLockDistance=rightBodyRadius+Math.trunc((leftBodyRadius-rightBodyRadius)*0.33);
        bones[torsoBoneIdx].gravityLockDistance=rightBodyRadius+Math.trunc((leftBodyRadius-rightBodyRadius)*0.66);
        bones[torsoTopBoneIdx].gravityLockDistance=leftBodyRadius;
        
        bones[hipBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[waistBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoTopBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
                    
        this.model.skeleton.limbs.push(new ModelLimbClass(LIMB_TYPE_BODY,LIMB_AXIS_Z,10,10,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]));
        
            // create the head limbs

        var headRadius=this.genRandom.randomInt(300,300);
        
        var jawLength=Math.trunc(bodyLength*(this.genRandom.randomInt(95,20)/100.0));
        var jawHigh=totalHigh+this.genRandom.randomInt(50,300);
        var headHigh=jawHigh+Math.trunc(headRadius*0.5);
            
        var neckBoneIdx=bones.push(new ModelBoneClass('Neck',torsoTopBoneIdx,new wsPoint(0,-totalHigh,-Math.trunc(bodyLength*0.55))))-1;
        var jawBoneIdx=bones.push(new ModelBoneClass('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,-jawLength)))-1;
        var headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new wsPoint(0,-headHigh,-jawLength)))-1;
        
        bones[headBoneIdx].gravityLockDistance=headRadius;
        bones[jawBoneIdx].gravityLockDistance=headRadius;
        bones[neckBoneIdx].gravityLockDistance=this.genRandom.randomInt(100,150);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(LIMB_TYPE_HEAD,LIMB_AXIS_Z,8,8,[headBoneIdx,jawBoneIdx,neckBoneIdx]));

            // create legs
        
        var rotOffset=(this.genRandom.random()*20.0)-10.0;
        var footLength=this.genRandom.randomInt(150,150);
        
        this.buildLimbLegSet(hipBoneIdx,0,bones[hipBoneIdx].position.z,rotOffset,Math.trunc(bones[hipBoneIdx].gravityLockDistance*0.7),bones[hipBoneIdx].position.y,200,footLength);
        if (this.genRandom.randomPercentage(0.3)) this.buildLimbLegSet(waistBoneIdx,0,bones[waistBoneIdx].position.z,rotOffset,Math.trunc(bones[waistBoneIdx].gravityLockDistance*0.7),bones[waistBoneIdx].position.y,200,footLength);
        if (this.genRandom.randomPercentage(0.3)) this.buildLimbLegSet(torsoBoneIdx,0,bones[torsoBoneIdx].position.z,rotOffset,Math.trunc(bones[torsoBoneIdx].gravityLockDistance*0.7),bones[torsoBoneIdx].position.y,200,footLength);
        this.buildLimbLegSet(torsoTopBoneIdx,0,bones[torsoTopBoneIdx].position.z,rotOffset,Math.trunc(bones[torsoTopBoneIdx].gravityLockDistance*0.7),bones[torsoTopBoneIdx].position.y,200,footLength);

            // tail
            
        if (this.genRandom.randomPercentage(0.75)) {
            whipRadius=this.genRandom.randomInt(Math.trunc(rightBodyRadius*0.35),Math.trunc(rightBodyRadius*0.2));
            whipLength=this.genRandom.randomInt(bodyLength,(bodyLength*3));
            
            this.buildLimbWhip(0,hipBoneIdx,whipRadius,bones[hipBoneIdx].position.y,whipLength,270.0);
        }
    }
     
        //
        // build blob bones
        //

    buildBlob()
    {
        var n,boneIdx,rotOffset;
        var bodyLimb,whipCount,whipRadius,whipLength;
        this.model.skeleton=new ModelSkeletonClass();
        var bones=this.model.skeleton.bones;
        
            // random height
            // can never be taller than a single floor height
            // and always shorter than humanoids (no legs)
        
        var totalHigh=this.genRandom.randomInt(Math.trunc(config.ROOM_FLOOR_HEIGHT*0.1),Math.trunc(config.ROOM_FLOOR_HEIGHT*0.4));
        
            // the base bone
            
        var baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limb
            
        var topBodyRadius=this.genRandom.randomInt(300,1000);
        var botBodyRadius=this.genRandom.randomInt(300,1000);

        var hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,0,0)))-1;
        var waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.25),0)))-1;
        var torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.5),0)))-1;
        var torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso Top',torsoBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.75),0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=botBodyRadius;
        bones[waistBoneIdx].gravityLockDistance=botBodyRadius+Math.trunc((topBodyRadius-botBodyRadius)*0.33);
        bones[torsoBoneIdx].gravityLockDistance=botBodyRadius+Math.trunc((topBodyRadius-botBodyRadius)*0.66);
        bones[torsoTopBoneIdx].gravityLockDistance=topBodyRadius;
        
        var xScale=this.genRandom.randomInt(70,50)/100.0;
        var zScale=this.genRandom.randomInt(70,50)/100.0;
        bones[hipBoneIdx].gravityScale.setFromValues(xScale,1.0,zScale);
        bones[waistBoneIdx].gravityScale.setFromValues(xScale,1.0,zScale);
        bones[torsoBoneIdx].gravityScale.setFromValues(xScale,1.0,zScale);
        bones[torsoTopBoneIdx].gravityScale.setFromValues(xScale,1.0,zScale);
        
        bodyLimb=new ModelLimbClass(LIMB_TYPE_BODY,LIMB_AXIS_Y,10,10,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
        this.model.skeleton.limbs.push(bodyLimb);
        
            // create head limbs
            
        var neckHigh=Math.trunc(totalHigh*0.76);
        var jawHigh=neckHigh+this.genRandom.randomInt(topBodyRadius,(totalHigh*0.05));
        var headHigh=jawHigh+this.genRandom.randomInt(topBodyRadius,(totalHigh*0.1));
            
        var neckBoneIdx=bones.push(new ModelBoneClass('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
        var jawBoneIdx=bones.push(new ModelBoneClass('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
        var headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;
        
        bones[headBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[jawBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[neckBoneIdx].gravityLockDistance=this.genRandom.randomInt(100,150);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(LIMB_TYPE_HEAD,LIMB_AXIS_Y,8,8,[headBoneIdx,jawBoneIdx,neckBoneIdx]));
        
            // create any whips
            
        var whipCount=this.genRandom.randomInt(0,8);
        var whipMinLength=Math.trunc((botBodyRadius+topBodyRadius)*0.7);
        var whipExtraLength=Math.trunc((botBodyRadius+topBodyRadius)*0.8);
            
        for (n=0;n!==whipCount;n++) {
            boneIdx=bodyLimb.getRandomBoneIndex(this.genRandom);
            rotOffset=this.genRandom.random()*360.0;
            
            whipRadius=Math.trunc(botBodyRadius*0.35);
            if (whipRadius<250) whipRadius=250;
            if (whipRadius>350) whipRadius=350;
            whipLength=this.genRandom.randomInt(whipMinLength,whipExtraLength);
            
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
            case MODEL_TYPE_HUMANOID:
                this.buildHumanoid();
                break;
            case MODEL_TYPE_ANIMAL:
                this.buildAnimal();
                break;
            case MODEL_TYPE_BLOB:
                this.buildBlob();
                break;
        }
        
            // setup the bones for animation
            
        this.model.skeleton.precalcAnimationValues();
     }
    
}
