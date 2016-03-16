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
    }
    
        //
        // build chunks
        //
        
    buildLimbArm(vct,nameSuffix,torsoTopBoneIdx,armRadius,y,shoulderLength,elbowLength,wristLength,handLength,leftLimb)
    {
        var shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx,knuckleBoneIdx,fingerBoneIdx;
        var n,nFinger,fy,fingerRadius,knuckleLength,fingerLength;
        var skeleton=this.model.skeleton;
        var bones=skeleton.bones;
        
            // arm to hand
            
        shoulderBoneIdx=bones.push(new ModelBoneClass(('Shoulder'+nameSuffix),torsoTopBoneIdx,new wsPoint((shoulderLength*vct.x),y,(shoulderLength*vct.z))))-1;
        elbowBoneIdx=bones.push(new ModelBoneClass(('Elbow'+nameSuffix),shoulderBoneIdx,new wsPoint((elbowLength*vct.x),y,(elbowLength*vct.z))))-1;
        wristBoneIdx=bones.push(new ModelBoneClass(('Wrist'+nameSuffix),elbowBoneIdx,new wsPoint((wristLength*vct.x),y,(wristLength*vct.z))))-1;
        handBoneIdx=bones.push(new ModelBoneClass(('Hand'+nameSuffix),wristBoneIdx,new wsPoint((handLength*vct.x),y,(handLength*vct.z))))-1;

        bones[shoulderBoneIdx].gravityLockDistance=armRadius+50;
        bones[elbowBoneIdx].gravityLockDistance=armRadius;
        bones[wristBoneIdx].gravityLockDistance=armRadius;
        bones[handBoneIdx].gravityLockDistance=armRadius*2;

        skeleton.limbs.push(new ModelLimbClass((leftLimb?LIMB_TYPE_ARM_LEFT:LIMB_TYPE_ARM_RIGHT),LIMB_AXIS_X,8,5,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx]));
        
            // add fingers to hand
            
        nFinger=this.genRandom.randomInt(3,3);
        
        fingerRadius=Math.trunc(armRadius*0.5);
        if (fingerRadius<100) fingerRadius=100;
        
        knuckleLength=this.genRandom.randomInt((handLength+armRadius),500);
        fingerLength=knuckleLength+this.genRandom.randomInt(500,500);

        fy=y-Math.trunc((nFinger/2)*150);
        
        for (n=0;n!==nFinger;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneClass(('Knuckle'+n+nameSuffix),handBoneIdx,new wsPoint((knuckleLength*vct.x),fy,(knuckleLength*vct.z))))-1;
            fingerBoneIdx=bones.push(new ModelBoneClass(('Finger'+n+nameSuffix),knuckleBoneIdx,new wsPoint((fingerLength*vct.x),fy,(fingerLength*vct.z))))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=fingerRadius;
            bones[fingerBoneIdx].gravityLockDistance=fingerRadius;
            
            skeleton.limbs.push(new ModelLimbClass((leftLimb?LIMB_TYPE_FINGER_LEFT:LIMB_TYPE_FINGER_RIGHT),LIMB_AXIS_X,4,4,[handBoneIdx,knuckleBoneIdx,fingerBoneIdx]));
            
            fy+=150;
        }
    }
    
    buildLimbLeg(vct,boneIdx,nameSuffix,hipHigh,kneeHigh,ankleHigh,legRadius,footLength,leftLimb)
    {
        var legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx,toeBoneIdx;
        var n,nToe,toeRadius,toeLength,fx,fz,vct;
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
        
        this.model.skeleton.limbs.push(new ModelLimbClass((leftLimb?LIMB_TYPE_FOOT_LEFT:LIMB_TYPE_FOOT_RIGHT),LIMB_AXIS_Z,5,5,[ankleBoneIdx,footBoneIdx]));
        
            // add toes to foot
            
        nToe=this.genRandom.randomInt(3,3);
        
        toeRadius=Math.trunc(legRadius*0.5);
        if (toeRadius<100) toeRadius=100;
        
        toeLength=this.genRandom.randomInt(legRadius,500);

        fx=vct.x-Math.trunc((nToe/2)*150);
        
        for (n=0;n!==nToe;n++) {
            toeBoneIdx=bones.push(new ModelBoneClass(('Finger'+n+nameSuffix),footBoneIdx,new wsPoint(fx,ankleHigh,(fz-toeLength))))-1;
            
            bones[toeBoneIdx].gravityLockDistance=toeRadius;
            
            skeleton.limbs.push(new ModelLimbClass((leftLimb?LIMB_TYPE_TOE_LEFT:LIMB_TYPE_TOE_RIGHT),LIMB_AXIS_Z,4,4,[footBoneIdx,toeBoneIdx]));
            
            fx+=150;
        }
    }
    
    buildLimbLegSet(boneIdx,legIndex,boneOffset,rotOffset,hipRadius,hipHigh,legRadius,footLength)
    {
        var kneeHigh=Math.trunc(hipHigh*0.5);
        var ankleHigh=Math.trunc(hipHigh*0.05);
        
        var vct=new wsPoint(hipRadius,0.0,0.0);
        vct.rotateY(null,rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Left'+legIndex),hipHigh,kneeHigh,ankleHigh,legRadius,footLength,true);

        vct=new wsPoint(-hipRadius,0.0,0.0);
        vct.rotateY(null,-rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Right'+legIndex),hipHigh,kneeHigh,ankleHigh,legRadius,footLength,false);
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
        var bodyLimb,whipRadius,whipLength;
        
        this.model.skeleton=new ModelSkeletonClass();
        var bones=this.model.skeleton.bones;
        
            // random height
            // can never be taller than a single floor height
        
        var totalHigh=this.genRandom.randomInt(Math.trunc(ROOM_FLOOR_HEIGHT*0.4),Math.trunc(ROOM_FLOOR_HEIGHT*0.6));
        
            // the base bone
            
        var baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limb
            
        var topBodyRadius=this.genRandom.randomInt(300,1000);
        var botBodyRadius=this.genRandom.randomInt(300,1000);
        
        var hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.5),0)))-1;
        var waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.55),0)))-1;
        var torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.65),0)))-1;
        var torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso Top',torsoBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.75),0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=botBodyRadius;
        bones[waistBoneIdx].gravityLockDistance=botBodyRadius+Math.trunc((topBodyRadius-botBodyRadius)*0.33);
        bones[torsoBoneIdx].gravityLockDistance=botBodyRadius+Math.trunc((topBodyRadius-botBodyRadius)*0.66);
        bones[torsoTopBoneIdx].gravityLockDistance=topBodyRadius;
        
        bones[hipBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[waistBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        bones[torsoTopBoneIdx].gravityScale.setFromValues(1.0,1.0,0.7);
        
        bodyLimb=new ModelLimbClass(LIMB_TYPE_BODY,LIMB_AXIS_Y,10,10,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
        this.model.skeleton.limbs.push(bodyLimb);
        
            // create head limbs
            
        var neckHigh=Math.trunc(totalHigh*0.76);
        var jawHigh=neckHigh+this.genRandom.randomInt(topBodyRadius,(totalHigh*0.05));
        var headHigh=jawHigh+this.genRandom.randomInt((totalHigh*0.05),(totalHigh*0.05));
            
        var neckBoneIdx=bones.push(new ModelBoneClass('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
        var jawBoneIdx=bones.push(new ModelBoneClass('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
        var headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;
        
        bones[headBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[jawBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[neckBoneIdx].gravityLockDistance=this.genRandom.randomInt(100,150);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(LIMB_TYPE_HEAD,LIMB_AXIS_Y,8,8,[headBoneIdx,jawBoneIdx,neckBoneIdx]));
        
            // create arm limbs
            // arm length is about quarter body size + some random
        
        var y=bones[torsoTopBoneIdx].position.y-Math.trunc(topBodyRadius*0.5);
        var rotOffset,vct,y;
        
        var armCount=1;
        if (this.genRandom.randomPercentage(0.25)) armCount=this.genRandom.randomInt(1,3);
        
        var armRadius,armY,armLength;
        
        var shoulderLength,elbowLength,wristLength,handLength;
        
        for (n=0;n!==armCount;n++) {
            rotOffset=(this.genRandom.random()*20.0)-10.0;
            
            armRadius=Math.trunc(botBodyRadius*0.35);
            if (armRadius<250) armRadius=250;
            if (armRadius>350) armRadius=350;
            armLength=this.genRandom.randomInt(Math.trunc(totalHigh*0.3),Math.trunc(totalHigh*0.2));
        
            shoulderLength=Math.trunc(topBodyRadius*0.75);
            elbowLength=shoulderLength+Math.trunc(armLength*0.42);
            wristLength=shoulderLength+Math.trunc(armLength*0.84);
            handLength=shoulderLength+Math.trunc(armLength*0.9);
            
            armY=y+Math.trunc(armRadius*0.5);
            
            vct=new wsPoint(1.0,0.0,0.0);
            vct.rotateY(null,rotOffset);
            this.buildLimbArm(vct,('Left'+n),torsoTopBoneIdx,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,true);
        
            vct=new wsPoint(-1.0,0.0,0.0);
            vct.rotateY(null,-rotOffset);
            this.buildLimbArm(vct,('Right'+n),torsoTopBoneIdx,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,false);
        
            y+=(armRadius+Math.trunc(armRadius*0.1));
        }

            // create leg limbs
        
        var legRadius=Math.trunc(botBodyRadius*0.35);
        if (legRadius<250) legRadius=250;
        var footLength=Math.trunc(legRadius*1.5);
       
        rotOffset=(this.genRandom.random()*20.0)-10.0;
        
        this.buildLimbLegSet(hipBoneIdx,0,0,rotOffset,Math.trunc(botBodyRadius*0.5),bones[hipBoneIdx].position.y,legRadius,footLength);
        
            // create any whips
            
        for (n=0;n!==3;n++) {
            boneIdx=bodyLimb.getRandomBoneIndex(this.genRandom);
            rotOffset=90.0+((this.genRandom.random()*90.0)-45.0);
            
            whipRadius=Math.trunc(botBodyRadius*0.35);
            if (whipRadius<250) whipRadius=250;
            if (whipRadius>350) whipRadius=350;
            whipLength=this.genRandom.randomInt(Math.trunc(totalHigh*0.3),Math.trunc(totalHigh*0.2));
            
            this.buildLimbWhip(n,boneIdx,whipRadius,bones[boneIdx].position.y,whipLength,rotOffset);
        }
    }

        //
        // build animal bones
        //

    buildAnimal()
    {
        this.model.skeleton=new ModelSkeletonClass();
        var bones=this.model.skeleton.bones;
        
            // the base bone
            
        var baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limbs
        
        var high;
        var totalHigh=this.genRandom.randomInt(500,1500);
        var bodyLength=this.genRandom.randomInt(600,800);
        
        var leftBodyRadius=this.genRandom.randomInt(300,500);
        var rightBodyRadius=this.genRandom.randomInt(300,500);

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
     }
     
        //
        // build blob bones
        //

    buildBlob()
    {
        this.model.skeleton=new ModelSkeletonClass();
        var bones=this.model.skeleton.bones;
        
            // random height
            // can never be taller than a single floor height
            // and always shorter than humanoids (no legs)
        
        var totalHigh=this.genRandom.randomInt(Math.trunc(ROOM_FLOOR_HEIGHT*0.1),Math.trunc(ROOM_FLOOR_HEIGHT*0.4));
        
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
            
        this.model.skeleton.limbs.push(new ModelLimbClass(LIMB_TYPE_BODY,LIMB_AXIS_Y,10,10,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]));
        
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
