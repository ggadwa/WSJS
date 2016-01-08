"use strict";

//
// gen organic skeleton class
//

function GenModelOrganicSkeletonObject(model,genRandom)
{
    this.model=model;
    this.genRandom=genRandom;

        //
        // build skeleton bones
        //

    this.build=function()
    {
        var n,vct,vct2;
        
            // build empty skeleton
            
        this.model.skeleton=new ModelSkeletonObject();
        var bones=this.model.skeleton.bones;
        
            // counts
        
        var headCount,armCount,legCount;
        var armLength,legLength;
        var hipHigh,minHeadRadius,minBodyRadius,minWaistHigh,minTorsoHigh,minTorsoTopHigh;
        
        switch (this.model.modelType) {
            case MODEL_TYPE_HUMANOID:
                headCount=this.genRandom.randomInt(1,1);
                armCount=this.genRandom.randomInt(2,4);
                legCount=this.genRandom.randomInt(2,4);
                armLength=this.genRandom.randomInt(350,350);
                legLength=this.genRandom.randomInt(500,500);
                hipHigh=legLength*2;
                minHeadRadius=300;
                minBodyRadius=300;
                minWaistHigh=200;
                minTorsoHigh=350;
                minTorsoTopHigh=250;
                break;
            case MODEL_TYPE_ANIMAL:
                headCount=1;
                armCount=0;
                legCount=this.genRandom.randomInt(4,4);
                legLength=this.genRandom.randomInt(350,350);
                hipHigh=legLength*2;
                minHeadRadius=300;
                minBodyRadius=300;
                minWaistHigh=150;
                minTorsoHigh=150;
                minTorsoTopHigh=100;
                break;
            case MODEL_TYPE_BLOB:
                headCount=1;
                armCount=0;
                legCount=0;
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
        var waistHigh=hipHigh+this.genRandom.randomInt(minWaistHigh,250);
        var torsoHigh=waistHigh+this.genRandom.randomInt(minTorsoHigh,350);
        var torsoRadius=this.genRandom.randomInt(300,350);
        var torsoTopHigh=torsoHigh+this.genRandom.randomInt(minTorsoTopHigh,250);

        var neckHigh=torsoTopHigh+this.genRandom.randomInt(250,150);
        var headHigh=neckHigh+this.genRandom.randomInt(100,100)+400;
        
        var elbowRadius=torsoRadius+armLength;
        var wristRadius=elbowRadius+armLength;
        var handRadius=wristRadius+this.genRandom.randomInt(100,100);
        
        var kneeHigh=legLength;
        var ankleHigh=0;
        var footLength=this.genRandom.randomInt(150,150);
        
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
        
        var shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx;
        
        for (n=0;n!==armCount;n++) {
            vct=new wsPoint(1.0,0.0,0.0);
            vct.rotateY(null,(this.genRandom.random()*360.0));
            
            shoulderBoneIdx=bones.push(new ModelBoneObject(('Shoulder'+n),torsoTopBoneIdx,new wsPoint((torsoRadius*vct.x),-torsoTopHigh,(torsoRadius*vct.z))))-1;
            elbowBoneIdx=bones.push(new ModelBoneObject(('Elbow'+n),shoulderBoneIdx,new wsPoint((elbowRadius*vct.x),-torsoTopHigh,(elbowRadius*vct.z))))-1;
            wristBoneIdx=bones.push(new ModelBoneObject(('Wrist'+n),elbowBoneIdx,new wsPoint((wristRadius*vct.x),-torsoTopHigh,(wristRadius*vct.z))))-1;
            handBoneIdx=bones.push(new ModelBoneObject(('Hand'+n),wristBoneIdx,new wsPoint((handRadius*vct.x),-torsoTopHigh,(handRadius*vct.z))))-1;
            
            bones[shoulderBoneIdx].gravityLockDistance=250;
            bones[elbowBoneIdx].gravityLockDistance=200;
            bones[wristBoneIdx].gravityLockDistance=200;
            bones[handBoneIdx].gravityLockDistance=300;
            
            this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_ARM,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx]));
        }

            // create legs
        
        var boneIdx;
        var legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx;
        
        for (n=0;n!==legCount;n++) {
            vct=new wsPoint(hipRadius,0.0,0.0);
            vct.rotateY(null,(this.genRandom.random()*360.0));
            
            boneIdx=hipBoneIdx;
            
            if (this.model.modelType===MODEL_TYPE_ANIMAL) {
                if (this.genRandom.random()>0.5) {
                    boneIdx=torsoTopBoneIdx;
                    vct.z-=torsoTopHigh;
                }
            }
            
            legHipBoneIdx=bones.push(new ModelBoneObject(('LegHip'+n),boneIdx,new wsPoint(vct.x,-hipHigh,vct.z)))-1;
            kneeBoneIdx=bones.push(new ModelBoneObject(('Knee'+n),legHipBoneIdx,new wsPoint(vct.x,-kneeHigh,vct.z)))-1;
            ankleBoneIdx=bones.push(new ModelBoneObject(('Aknle'+n),kneeBoneIdx,new wsPoint(vct.x,-ankleHigh,vct.z)))-1;
            
            vct2=new wsPoint(footLength,0.0,0.0);
            vct2.rotateY(null,(this.genRandom.random()*360.0));
            
            footBoneIdx=bones.push(new ModelBoneObject(('Foot'+n),ankleBoneIdx,new wsPoint((vct.x+vct2.x),-ankleHigh,(vct.z+vct2.z))))-1;
            
            bones[legHipBoneIdx].gravityLockDistance=250;
            bones[kneeBoneIdx].gravityLockDistance=200;
            bones[ankleBoneIdx].gravityLockDistance=200;
            bones[footBoneIdx].gravityLockDistance=250;
            
            this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_LEG,[legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx]));
        }

            // finally setup the bones for animation
            
        this.model.skeleton.precalcAnimationValues();
     };
    
}
