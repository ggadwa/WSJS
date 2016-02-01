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
        
    this.buildLimbArm=function(vct,nameSuffix,torsoTopBoneIdx,torsoRadius,torsoTopHigh,elbowRadius,wristRadius,handRadius)
    {
        var shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx;
        var skeleton=this.model.skeleton;
        var bones=skeleton.bones;
            
        shoulderBoneIdx=bones.push(new ModelBoneObject(('Shoulder'+nameSuffix),torsoTopBoneIdx,new wsPoint((torsoRadius*vct.x),-torsoTopHigh,(torsoRadius*vct.z))))-1;
        elbowBoneIdx=bones.push(new ModelBoneObject(('Elbow'+nameSuffix),shoulderBoneIdx,new wsPoint((elbowRadius*vct.x),-torsoTopHigh,(elbowRadius*vct.z))))-1;
        wristBoneIdx=bones.push(new ModelBoneObject(('Wrist'+nameSuffix),elbowBoneIdx,new wsPoint((wristRadius*vct.x),-torsoTopHigh,(wristRadius*vct.z))))-1;
        handBoneIdx=bones.push(new ModelBoneObject(('Hand'+nameSuffix),wristBoneIdx,new wsPoint((handRadius*vct.x),-torsoTopHigh,(handRadius*vct.z))))-1;

        bones[shoulderBoneIdx].gravityLockDistance=250;
        bones[elbowBoneIdx].gravityLockDistance=200;
        bones[wristBoneIdx].gravityLockDistance=200;
        bones[handBoneIdx].gravityLockDistance=300;

        skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_ARM,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx]));
    };
    
    this.buildLimbLeg=function(vct,boneIdx,nameSuffix,hipHigh,kneeHigh,ankleHigh,footLength)
    {
        var legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx;
        var skeleton=this.model.skeleton;
        var bones=skeleton.bones;
        
        legHipBoneIdx=bones.push(new ModelBoneObject(('LegHip'+nameSuffix),boneIdx,new wsPoint(vct.x,-hipHigh,vct.z)))-1;
        kneeBoneIdx=bones.push(new ModelBoneObject(('Knee'+nameSuffix),legHipBoneIdx,new wsPoint(vct.x,-kneeHigh,vct.z)))-1;
        ankleBoneIdx=bones.push(new ModelBoneObject(('Ankle'+nameSuffix),kneeBoneIdx,new wsPoint(vct.x,-ankleHigh,vct.z)))-1;

        var vct2=new wsPoint(0.0,0.0,-footLength);

        footBoneIdx=bones.push(new ModelBoneObject(('Foot'+nameSuffix),ankleBoneIdx,new wsPoint((vct.x+vct2.x),-ankleHigh,(vct.z+vct2.z))))-1;

        bones[legHipBoneIdx].gravityLockDistance=250;
        bones[kneeBoneIdx].gravityLockDistance=200;
        bones[ankleBoneIdx].gravityLockDistance=200;
        bones[footBoneIdx].gravityLockDistance=250;

        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_LEG,[legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx]));
    };
    
    this.buildLimbLegSet=function(boneIdx,legIndex,boneOffset,rotOffset,hipRadius,hipHigh,kneeHigh,ankleHigh,footLength)
    {
        var vct=new wsPoint(hipRadius,0.0,0.0);
        vct.rotateY(null,rotOffset);
        vct.z-=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Left'+legIndex),hipHigh,kneeHigh,ankleHigh,footLength);

        vct=new wsPoint(-hipRadius,0.0,0.0);
        vct.rotateY(null,-rotOffset);
        vct.z-=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Right'+legIndex),hipHigh,kneeHigh,ankleHigh,footLength);
    };

        //
        // build skeleton bones
        //

    this.build=function()
    {
        var n,y,vct;
        
            // build empty skeleton
            
        this.model.skeleton=new ModelSkeletonObject();
        var bones=this.model.skeleton.bones;
        
            // counts
        
        var headCount,armCount;
        var armLength,legLength,footLength;
        var hipHigh,minHeadRadius,minBodyRadius,minWaistHigh,minTorsoHigh,minTorsoTopHigh;
        
        switch (this.model.modelType) {
            case MODEL_TYPE_HUMANOID:
                headCount=this.genRandom.randomInt(1,1);
                armCount=this.genRandom.randomInt(1,3);
                armLength=this.genRandom.randomInt(350,350);
                legLength=this.genRandom.randomInt(500,500);
                hipHigh=legLength*2;
                minHeadRadius=300;
                minBodyRadius=300;
                minWaistHigh=200;
                minTorsoHigh=350;
                minTorsoTopHigh=250;
                footLength=this.genRandom.randomInt(250,200);
                break;
            case MODEL_TYPE_ANIMAL:
                headCount=1;
                armCount=0;
                legLength=this.genRandom.randomInt(350,350);
                hipHigh=legLength*2;
                minHeadRadius=300;
                minBodyRadius=300;
                minWaistHigh=200;
                minTorsoHigh=100;
                minTorsoTopHigh=100;
                footLength=this.genRandom.randomInt(150,150);
                break;
            case MODEL_TYPE_BLOB:
                headCount=1;
                armCount=0;
                hipHigh=0;
                minHeadRadius=400;
                minBodyRadius=600;
                minWaistHigh=350;
                minTorsoHigh=450;
                minTorsoTopHigh=250;
                break;
        }
        
            // random radius

        var hipRadius=this.genRandom.randomInt(200,250);
        var torsoRadius=this.genRandom.randomInt(300,350);
        
        var waistHigh,torsoHigh,torsoTopHigh;
        
        if (this.model.modelType!==MODEL_TYPE_ANIMAL) {
            waistHigh=hipHigh+this.genRandom.randomInt(minWaistHigh,250);
            torsoHigh=waistHigh+this.genRandom.randomInt(minTorsoHigh,350);
            torsoTopHigh=torsoHigh+this.genRandom.randomInt(minTorsoTopHigh,250);
        }
        else {
            var high=this.genRandom.randomInt(minWaistHigh,250);
            waistHigh=high;
            torsoHigh=waistHigh+high;
            torsoTopHigh=torsoHigh+high;
        }
        
        var neckHigh=torsoTopHigh+this.genRandom.randomInt(250,150);
        var headHigh=neckHigh+this.genRandom.randomInt(100,100)+400;
        
        var elbowRadius=torsoRadius+armLength;
        var wristRadius=elbowRadius+armLength;
        var handRadius=wristRadius+this.genRandom.randomInt(100,100);
        
        var kneeHigh=legLength;
        var ankleHigh=0;
        
            // the base bone
            
        var baseBoneIdx=bones.push(new ModelBoneObject('Base',-1,new wsPoint(0,0,0)))-1;

            // create body and head bones
            
        var hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx,neckBoneIdx,headBoneIdx;

        switch (this.model.modelType) {
            case MODEL_TYPE_HUMANOID:
            case MODEL_TYPE_BLOB:
                hipBoneIdx=bones.push(new ModelBoneObject('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
                waistBoneIdx=bones.push(new ModelBoneObject('Waist',hipBoneIdx,new wsPoint(0,-waistHigh,0)))-1;
                torsoBoneIdx=bones.push(new ModelBoneObject('Torso',waistBoneIdx,new wsPoint(0,-torsoHigh,0)))-1;
                torsoTopBoneIdx=bones.push(new ModelBoneObject('Torso Top',torsoBoneIdx,new wsPoint(0,-torsoTopHigh,0)))-1;
                neckBoneIdx=bones.push(new ModelBoneObject('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
                headBoneIdx=bones.push(new ModelBoneObject('Head',neckBoneIdx,new wsPoint(0,-headHigh,0)))-1;
                break;
            case MODEL_TYPE_ANIMAL:
                hipBoneIdx=bones.push(new ModelBoneObject('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
                waistBoneIdx=bones.push(new ModelBoneObject('Waist',hipBoneIdx,new wsPoint(0,-hipHigh,-waistHigh)))-1;
                torsoBoneIdx=bones.push(new ModelBoneObject('Torso',waistBoneIdx,new wsPoint(0,-hipHigh,-torsoHigh)))-1;
                torsoTopBoneIdx=bones.push(new ModelBoneObject('Torso Top',torsoBoneIdx,new wsPoint(0,-hipHigh,-torsoTopHigh)))-1;
                neckBoneIdx=bones.push(new ModelBoneObject('Neck',torsoTopBoneIdx,new wsPoint(0,-hipHigh,-neckHigh)))-1;
                headBoneIdx=bones.push(new ModelBoneObject('Head',neckBoneIdx,new wsPoint(0,-hipHigh,-headHigh)))-1;
                break;
        }
        
        bones[hipBoneIdx].gravityLockDistance=this.genRandom.randomInt(minBodyRadius,300);
        bones[waistBoneIdx].gravityLockDistance=this.genRandom.randomInt(minBodyRadius,300);
        bones[torsoBoneIdx].gravityLockDistance=this.genRandom.randomInt(minBodyRadius,300);
        bones[torsoTopBoneIdx].gravityLockDistance=this.genRandom.randomInt(minBodyRadius,300);
        
        bones[headBoneIdx].gravityLockDistance=this.genRandom.randomInt(minHeadRadius,300);
        bones[neckBoneIdx].gravityLockDistance=this.genRandom.randomInt(100,150);
        
            // add bones to body and head lists
            
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_HEAD,[headBoneIdx,neckBoneIdx]));
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_BODY,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]));
        
            // create arms
        
        var y=torsoTopHigh;
        var rotOffset;
        
        for (n=0;n!==armCount;n++) {
            rotOffset=(this.genRandom.random()*20.0)-10.0;
            
            vct=new wsPoint(1.0,0.0,0.0);
            vct.rotateY(null,rotOffset);
            this.buildLimbArm(vct,('Left'+n),torsoTopBoneIdx,torsoRadius,y,elbowRadius,wristRadius,handRadius);
        
            vct=new wsPoint(-1.0,0.0,0.0);
            vct.rotateY(null,-rotOffset);
            this.buildLimbArm(vct,('Right'+n),torsoTopBoneIdx,torsoRadius,y,elbowRadius,wristRadius,handRadius);
        
            y-=250;
        }

            // create legs
        
        rotOffset=(this.genRandom.random()*20.0)-10.0;
        
        switch (this.model.modelType) {
            
            case MODEL_TYPE_HUMANOID:
                this.buildLimbLegSet(hipBoneIdx,0,0,rotOffset,hipRadius,hipHigh,kneeHigh,ankleHigh,footLength);
                break;
                
            case MODEL_TYPE_ANIMAL:
                this.buildLimbLegSet(hipBoneIdx,0,0,rotOffset,hipRadius,hipHigh,kneeHigh,ankleHigh,footLength);
                if (this.genRandom.random()<0.3) this.buildLimbLegSet(waistBoneIdx,0,waistHigh,rotOffset,hipRadius,hipHigh,kneeHigh,ankleHigh,footLength);
                if (this.genRandom.random()<0.3) this.buildLimbLegSet(torsoBoneIdx,0,torsoHigh,rotOffset,hipRadius,hipHigh,kneeHigh,ankleHigh,footLength);
                this.buildLimbLegSet(torsoTopBoneIdx,0,torsoTopHigh,rotOffset,hipRadius,hipHigh,kneeHigh,ankleHigh,footLength);
                break;
                
                
        }

            // finally setup the bones for animation
            
        this.model.skeleton.precalcAnimationValues();
     };
    
}
