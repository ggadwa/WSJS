"use strict";

//
// gen organic skeleton class
//

function GenModelOrganicSkeletonObject(model,genRandom)
{
    this.model=model;
    this.genRandom=genRandom;
    
        //
        // build chunks
        //
        
    this.buildLimbArm=function(vct,nameSuffix,torsoTopBoneIdx,armRadius,y,shoulderLength,elbowLength,wristLength,handLength,leftLimb)
    {
        var shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx,knuckleBoneIdx,fingerBoneIdx;
        var n,nFinger,fy,fingerRadius,knuckleLength,fingerLength;
        var skeleton=this.model.skeleton;
        var bones=skeleton.bones;
        
            // arm to hand
            
        shoulderBoneIdx=bones.push(new ModelBoneObject(('Shoulder'+nameSuffix),torsoTopBoneIdx,new wsPoint((shoulderLength*vct.x),y,(shoulderLength*vct.z))))-1;
        elbowBoneIdx=bones.push(new ModelBoneObject(('Elbow'+nameSuffix),shoulderBoneIdx,new wsPoint((elbowLength*vct.x),y,(elbowLength*vct.z))))-1;
        wristBoneIdx=bones.push(new ModelBoneObject(('Wrist'+nameSuffix),elbowBoneIdx,new wsPoint((wristLength*vct.x),y,(wristLength*vct.z))))-1;
        handBoneIdx=bones.push(new ModelBoneObject(('Hand'+nameSuffix),wristBoneIdx,new wsPoint((handLength*vct.x),y,(handLength*vct.z))))-1;

        bones[shoulderBoneIdx].gravityLockDistance=armRadius+50;
        bones[elbowBoneIdx].gravityLockDistance=armRadius;
        bones[wristBoneIdx].gravityLockDistance=armRadius;
        bones[handBoneIdx].gravityLockDistance=armRadius*2;

        skeleton.limbs.push(new ModelLimbObject((leftLimb?LIMB_TYPE_ARM_LEFT:LIMB_TYPE_ARM_RIGHT),10,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx]));
        
            // add fingers to hand
            
        nFinger=this.genRandom.randomInt(3,3);
        
        fingerRadius=Math.trunc(armRadius*0.5);
        if (fingerRadius<100) fingerRadius=100;
        
        knuckleLength=this.genRandom.randomInt((handLength+armRadius),500);
        fingerLength=knuckleLength+this.genRandom.randomInt(500,500);

        fy=y-Math.trunc((nFinger/2)*150);
        
        for (n=0;n!==nFinger;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneObject(('Knuckle'+n+nameSuffix),handBoneIdx,new wsPoint((knuckleLength*vct.x),fy,(knuckleLength*vct.z))))-1;
            fingerBoneIdx=bones.push(new ModelBoneObject(('Finger'+n+nameSuffix),knuckleBoneIdx,new wsPoint((fingerLength*vct.x),fy,(fingerLength*vct.z))))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=fingerRadius;
            bones[fingerBoneIdx].gravityLockDistance=fingerRadius;
            
            skeleton.limbs.push(new ModelLimbObject((leftLimb?LIMB_TYPE_FINGER_LEFT:LIMB_TYPE_FINGER_RIGHT),5,[handBoneIdx,knuckleBoneIdx,fingerBoneIdx]));
            
            fy+=150;
        }
    };
    
    this.buildLimbLeg=function(vct,boneIdx,nameSuffix,hipHigh,kneeHigh,ankleHigh,legRadius,footLength,leftLimb)
    {
        var legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx,toeBoneIdx;
        var n,nToe,toeRadius,toeLength,fx,fz,vct;
        var skeleton=this.model.skeleton;
        var bones=skeleton.bones;
        
            // leg
            
        legHipBoneIdx=bones.push(new ModelBoneObject(('LegHip'+nameSuffix),boneIdx,new wsPoint(vct.x,hipHigh,vct.z)))-1;
        kneeBoneIdx=bones.push(new ModelBoneObject(('Knee'+nameSuffix),legHipBoneIdx,new wsPoint(vct.x,kneeHigh,vct.z)))-1;
        ankleBoneIdx=bones.push(new ModelBoneObject(('Ankle'+nameSuffix),kneeBoneIdx,new wsPoint(vct.x,ankleHigh,vct.z)))-1;

        bones[legHipBoneIdx].gravityLockDistance=legRadius;
        bones[kneeBoneIdx].gravityLockDistance=legRadius;
        bones[ankleBoneIdx].gravityLockDistance=legRadius;

        this.model.skeleton.limbs.push(new ModelLimbObject((leftLimb?LIMB_TYPE_LEG_LEFT:LIMB_TYPE_LEG_RIGHT),10,[legHipBoneIdx,kneeBoneIdx,ankleBoneIdx]));

            // foot

        var vct2=new wsPoint(0.0,0.0,-footLength);
        fz=vct.z+vct2.z;
        footBoneIdx=bones.push(new ModelBoneObject(('Foot'+nameSuffix),ankleBoneIdx,new wsPoint((vct.x+vct2.x),ankleHigh,fz)))-1;

        bones[footBoneIdx].gravityLockDistance=legRadius;
        
        this.model.skeleton.limbs.push(new ModelLimbObject((leftLimb?LIMB_TYPE_FOOT_LEFT:LIMB_TYPE_FOOT_RIGHT),5,[ankleBoneIdx,footBoneIdx]));
        
            // add toes to foot
            
        nToe=this.genRandom.randomInt(3,3);
        
        toeRadius=Math.trunc(legRadius*0.5);
        if (toeRadius<100) toeRadius=100;
        
        toeLength=this.genRandom.randomInt(legRadius,500);

        fx=vct.x-Math.trunc((nToe/2)*150);
        
        for (n=0;n!==nToe;n++) {
            toeBoneIdx=bones.push(new ModelBoneObject(('Finger'+n+nameSuffix),footBoneIdx,new wsPoint(fx,ankleHigh,(fz-toeLength))))-1;
            
            bones[toeBoneIdx].gravityLockDistance=toeRadius;
            
            skeleton.limbs.push(new ModelLimbObject((leftLimb?LIMB_TYPE_TOE_LEFT:LIMB_TYPE_TOE_RIGHT),5,[footBoneIdx,toeBoneIdx]));
            
            fx+=150;
        }
    };
    
    this.buildLimbLegSet=function(boneIdx,legIndex,boneOffset,rotOffset,hipRadius,hipHigh,legRadius,footLength)
    {
        var kneeHigh=Math.floor(hipHigh*0.5);
        var ankleHigh=Math.floor(hipHigh*0.05);
        
        var vct=new wsPoint(hipRadius,0.0,0.0);
        vct.rotateY(null,rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Left'+legIndex),hipHigh,kneeHigh,ankleHigh,legRadius,footLength,true);

        vct=new wsPoint(-hipRadius,0.0,0.0);
        vct.rotateY(null,-rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Right'+legIndex),hipHigh,kneeHigh,ankleHigh,legRadius,footLength,false);
    };
    
        //
        // build humanoid skeletons
        //
        
    this.buildHumanoid=function()
    {
        var n;
        
        this.model.skeleton=new ModelSkeletonObject();
        var bones=this.model.skeleton.bones;
        
            // random height
            // can never be taller than a single floor height
        
        var totalHigh=this.genRandom.randomInt(Math.floor(ROOM_FLOOR_HEIGHT*0.4),Math.floor(ROOM_FLOOR_HEIGHT*0.6));
        
            // the base bone
            
        var baseBoneIdx=bones.push(new ModelBoneObject('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limb
            
        var topBodyRadius=this.genRandom.randomInt(300,1000);
        var botBodyRadius=this.genRandom.randomInt(300,1000);
        
        var hipBoneIdx=bones.push(new ModelBoneObject('Hip',baseBoneIdx,new wsPoint(0,-Math.floor(totalHigh*0.5),0)))-1;
        var waistBoneIdx=bones.push(new ModelBoneObject('Waist',hipBoneIdx,new wsPoint(0,-Math.floor(totalHigh*0.55),0)))-1;
        var torsoBoneIdx=bones.push(new ModelBoneObject('Torso',waistBoneIdx,new wsPoint(0,-Math.floor(totalHigh*0.65),0)))-1;
        var torsoTopBoneIdx=bones.push(new ModelBoneObject('Torso Top',torsoBoneIdx,new wsPoint(0,-Math.floor(totalHigh*0.75),0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=botBodyRadius;
        bones[waistBoneIdx].gravityLockDistance=botBodyRadius+Math.floor((topBodyRadius-botBodyRadius)*0.33);
        bones[torsoBoneIdx].gravityLockDistance=botBodyRadius+Math.floor((topBodyRadius-botBodyRadius)*0.66);
        bones[torsoTopBoneIdx].gravityLockDistance=topBodyRadius;
        
        bones[hipBoneIdx].gravityScale.set(1.0,1.0,0.7);
        bones[waistBoneIdx].gravityScale.set(1.0,1.0,0.7);
        bones[torsoBoneIdx].gravityScale.set(1.0,1.0,0.7);
        bones[torsoTopBoneIdx].gravityScale.set(1.0,1.0,0.7);
            
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_BODY,16,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]));
        
            // create head limbs
            
        var neckHigh=Math.floor(totalHigh*0.76);
        var jawHigh=neckHigh+this.genRandom.randomInt(topBodyRadius,(totalHigh*0.05));
        var headHigh=jawHigh+this.genRandom.randomInt((totalHigh*0.05),(totalHigh*0.05));
            
        var neckBoneIdx=bones.push(new ModelBoneObject('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
        var jawBoneIdx=bones.push(new ModelBoneObject('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
        var headBoneIdx=bones.push(new ModelBoneObject('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;
        
        bones[headBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[jawBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[neckBoneIdx].gravityLockDistance=this.genRandom.randomInt(100,150);
        
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_HEAD,12,[headBoneIdx,jawBoneIdx,neckBoneIdx]));
        
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
            
            armRadius=Math.floor(botBodyRadius*0.35);
            if (armRadius<250) armRadius=250;
            if (armRadius>350) armRadius=350;
            armLength=this.genRandom.randomInt(Math.floor(totalHigh*0.3),Math.floor(totalHigh*0.2));
        
            shoulderLength=Math.floor(topBodyRadius*0.75);
            elbowLength=shoulderLength+Math.floor(armLength*0.42);
            wristLength=shoulderLength+Math.floor(armLength*0.84);
            handLength=shoulderLength+Math.floor(armLength*0.9);
            
            armY=y+Math.trunc(armRadius*0.5);
            
            vct=new wsPoint(1.0,0.0,0.0);
            vct.rotateY(null,rotOffset);
            this.buildLimbArm(vct,('Left'+n),torsoTopBoneIdx,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,true);
        
            vct=new wsPoint(-1.0,0.0,0.0);
            vct.rotateY(null,-rotOffset);
            this.buildLimbArm(vct,('Right'+n),torsoTopBoneIdx,armRadius,armY,shoulderLength,elbowLength,wristLength,handLength,false);
        
            y+=(armRadius+Math.floor(armRadius*0.1));
        }

            // create leg limbs
        
        var legRadius=Math.floor(botBodyRadius*0.35);
        if (legRadius<250) legRadius=250;
        var footLength=Math.floor(legRadius*1.5);
       
        rotOffset=(this.genRandom.random()*20.0)-10.0;
        
        this.buildLimbLegSet(hipBoneIdx,0,0,rotOffset,Math.floor(botBodyRadius*0.5),bones[hipBoneIdx].position.y,legRadius,footLength);
     };

        //
        // build animal bones
        //

    this.buildAnimal=function()
    {
        this.model.skeleton=new ModelSkeletonObject();
        var bones=this.model.skeleton.bones;
        
            // the base bone
            
        var baseBoneIdx=bones.push(new ModelBoneObject('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limbs
        
        var high;
        var totalHigh=this.genRandom.randomInt(500,1500);
        var bodyLength=this.genRandom.randomInt(600,800);
        
        var leftBodyRadius=this.genRandom.randomInt(300,500);
        var rightBodyRadius=this.genRandom.randomInt(300,500);

        high=totalHigh+this.genRandom.randomInt(0,300);
        var torsoBoneIdx=bones.push(new ModelBoneObject('Torso',baseBoneIdx,new wsPoint(0,-high,-Math.floor(bodyLength*0.25))))-1;
        
        high=totalHigh+this.genRandom.randomInt(0,400);
        var waistBoneIdx=bones.push(new ModelBoneObject('Waist',torsoBoneIdx,new wsPoint(0,-high,Math.floor(bodyLength*0.25))))-1;
        
        high=totalHigh+this.genRandom.randomInt(0,400);
        var hipBoneIdx=bones.push(new ModelBoneObject('Hip',waistBoneIdx,new wsPoint(0,-high,Math.floor(bodyLength*0.5))))-1;
        
        high=totalHigh+this.genRandom.randomInt(0,300);
        var torsoTopBoneIdx=bones.push(new ModelBoneObject('Torso Top',torsoBoneIdx,new wsPoint(0,-high,-Math.floor(bodyLength*0.5))))-1;
        
        bones[hipBoneIdx].gravityLockDistance=rightBodyRadius;
        bones[waistBoneIdx].gravityLockDistance=rightBodyRadius+Math.floor((leftBodyRadius-rightBodyRadius)*0.33);
        bones[torsoBoneIdx].gravityLockDistance=rightBodyRadius+Math.floor((leftBodyRadius-rightBodyRadius)*0.66);
        bones[torsoTopBoneIdx].gravityLockDistance=leftBodyRadius;
        
        bones[hipBoneIdx].gravityScale.set(1.0,1.0,0.7);
        bones[waistBoneIdx].gravityScale.set(1.0,1.0,0.7);
        bones[torsoBoneIdx].gravityScale.set(1.0,1.0,0.7);
        bones[torsoTopBoneIdx].gravityScale.set(1.0,1.0,0.7);
                    
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_BODY,16,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]));
        
            // create the head limbs

        var headRadius=this.genRandom.randomInt(300,300);
        
        var jawLength=Math.floor(bodyLength*(this.genRandom.randomInt(95,20)/100.0));
        var jawHigh=totalHigh+this.genRandom.randomInt(50,300);
        var headHigh=jawHigh+Math.floor(headRadius*0.5);
            
        var neckBoneIdx=bones.push(new ModelBoneObject('Neck',torsoTopBoneIdx,new wsPoint(0,-totalHigh,-Math.floor(bodyLength*0.55))))-1;
        var jawBoneIdx=bones.push(new ModelBoneObject('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,-jawLength)))-1;
        var headBoneIdx=bones.push(new ModelBoneObject('Head',jawBoneIdx,new wsPoint(0,-headHigh,-jawLength)))-1;
        
        bones[headBoneIdx].gravityLockDistance=headRadius;
        bones[jawBoneIdx].gravityLockDistance=headRadius;
        bones[neckBoneIdx].gravityLockDistance=this.genRandom.randomInt(100,150);
        
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_HEAD,12,[headBoneIdx,jawBoneIdx,neckBoneIdx]));

            // create legs
        
        var rotOffset=(this.genRandom.random()*20.0)-10.0;
        var footLength=this.genRandom.randomInt(150,150);
        
        this.buildLimbLegSet(hipBoneIdx,0,bones[hipBoneIdx].position.z,rotOffset,Math.floor(bones[hipBoneIdx].gravityLockDistance*0.7),bones[hipBoneIdx].position.y,200,footLength);
        if (this.genRandom.randomPercentage(0.3)) this.buildLimbLegSet(waistBoneIdx,0,bones[waistBoneIdx].position.z,rotOffset,Math.floor(bones[waistBoneIdx].gravityLockDistance*0.7),bones[waistBoneIdx].position.y,200,footLength);
        if (this.genRandom.randomPercentage(0.3)) this.buildLimbLegSet(torsoBoneIdx,0,bones[torsoBoneIdx].position.z,rotOffset,Math.floor(bones[torsoBoneIdx].gravityLockDistance*0.7),bones[torsoBoneIdx].position.y,200,footLength);
        this.buildLimbLegSet(torsoTopBoneIdx,0,bones[torsoTopBoneIdx].position.z,rotOffset,Math.floor(bones[torsoTopBoneIdx].gravityLockDistance*0.7),bones[torsoTopBoneIdx].position.y,200,footLength);
     };
     
        //
        // build blob bones
        //

    this.buildBlob=function()
    {
        this.model.skeleton=new ModelSkeletonObject();
        var bones=this.model.skeleton.bones;
        
            // random height
            // can never be taller than a single floor height
            // and always shorter than humanoids (no legs)
        
        var totalHigh=this.genRandom.randomInt(Math.floor(ROOM_FLOOR_HEIGHT*0.1),Math.floor(ROOM_FLOOR_HEIGHT*0.4));
        
            // the base bone
            
        var baseBoneIdx=bones.push(new ModelBoneObject('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limb
            
        var topBodyRadius=this.genRandom.randomInt(300,1000);
        var botBodyRadius=this.genRandom.randomInt(300,1000);

        var hipBoneIdx=bones.push(new ModelBoneObject('Hip',baseBoneIdx,new wsPoint(0,0,0)))-1;
        var waistBoneIdx=bones.push(new ModelBoneObject('Waist',hipBoneIdx,new wsPoint(0,-Math.floor(totalHigh*0.25),0)))-1;
        var torsoBoneIdx=bones.push(new ModelBoneObject('Torso',waistBoneIdx,new wsPoint(0,-Math.floor(totalHigh*0.5),0)))-1;
        var torsoTopBoneIdx=bones.push(new ModelBoneObject('Torso Top',torsoBoneIdx,new wsPoint(0,-Math.floor(totalHigh*0.75),0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=botBodyRadius;
        bones[waistBoneIdx].gravityLockDistance=botBodyRadius+Math.floor((topBodyRadius-botBodyRadius)*0.33);
        bones[torsoBoneIdx].gravityLockDistance=botBodyRadius+Math.floor((topBodyRadius-botBodyRadius)*0.66);
        bones[torsoTopBoneIdx].gravityLockDistance=topBodyRadius;
        
        var xScale=this.genRandom.randomInt(70,50)/100.0;
        var zScale=this.genRandom.randomInt(70,50)/100.0;
        bones[hipBoneIdx].gravityScale.set(xScale,1.0,zScale);
        bones[waistBoneIdx].gravityScale.set(xScale,1.0,zScale);
        bones[torsoBoneIdx].gravityScale.set(xScale,1.0,zScale);
        bones[torsoTopBoneIdx].gravityScale.set(xScale,1.0,zScale);
            
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_BODY,16,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]));
        
            // create head limbs
            
        var neckHigh=Math.floor(totalHigh*0.76);
        var jawHigh=neckHigh+this.genRandom.randomInt(topBodyRadius,(totalHigh*0.05));
        var headHigh=jawHigh+this.genRandom.randomInt(topBodyRadius,(totalHigh*0.1));
            
        var neckBoneIdx=bones.push(new ModelBoneObject('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
        var jawBoneIdx=bones.push(new ModelBoneObject('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
        var headBoneIdx=bones.push(new ModelBoneObject('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;
        
        bones[headBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[jawBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[neckBoneIdx].gravityLockDistance=this.genRandom.randomInt(100,150);
        
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_HEAD,12,[headBoneIdx,jawBoneIdx,neckBoneIdx]));
     };

        //
        // build skeleton bones
        //

    this.build=function()
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
     };
    
}
