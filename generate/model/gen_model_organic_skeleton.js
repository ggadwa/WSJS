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
            
        var armCount=this.genRandom.randomInt(1,4);
        var legCount=this.genRandom.randomInt(0,5);
        
            // some random lengths
            
        var armLength=this.genRandom.randomInt(350,350);
        var legLength=this.genRandom.randomInt(500,500);
        
            // hip height
            
        var hipHigh=0;
        if (legCount>0) hipHigh=legLength*2;
        
            // random radius

        var hipRadius=this.genRandom.randomInt(200,250);
        var waistHigh=hipHigh+this.genRandom.randomInt(200,250);
        var torsoHigh=waistHigh+this.genRandom.randomInt(350,350);
        var torsoRadius=this.genRandom.randomInt(300,350);
        var torsoTopHigh=torsoHigh+this.genRandom.randomInt(250,250);

        var neckHigh=torsoTopHigh+this.genRandom.randomInt(250,150);
        var headHigh=neckHigh+this.genRandom.randomInt(100,100)+400;
        
        var elbowRadius=torsoRadius+armLength;
        var wristRadius=elbowRadius+armLength;
        var handRadius=wristRadius+this.genRandom.randomInt(100,100);
        
        var kneeHigh=legLength;
        var ankleHigh=0;
        var footLength=this.genRandom.randomInt(150,150);

            // create body and head bones

        var baseBoneIdx=bones.push(new ModelBoneObject('Base',-1,new wsPoint(0,0,0)))-1;
        var hipBoneIdx=bones.push(new ModelBoneObject('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
        var waistBoneIdx=bones.push(new ModelBoneObject('Waist',hipBoneIdx,new wsPoint(0,-waistHigh,0)))-1;
        var torsoBoneIdx=bones.push(new ModelBoneObject('Torso',waistBoneIdx,new wsPoint(0,-torsoHigh,0)))-1;
        var torsoTopBoneIdx=bones.push(new ModelBoneObject('Torso Top',torsoBoneIdx,new wsPoint(0,-torsoTopHigh,0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,300);
        bones[waistBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,300);
        bones[torsoBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,300);
        bones[torsoTopBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,300);
        
        var neckBoneIdx=bones.push(new ModelBoneObject('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
        var headBoneIdx=bones.push(new ModelBoneObject('Head',neckBoneIdx,new wsPoint(0,-headHigh,0)))-1;
        
        bones[headBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,300);
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
        
        var legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx;
        
        for (n=0;n!==armCount;n++) {
            vct=new wsPoint(hipRadius,0.0,0.0);
            vct.rotateY(null,(this.genRandom.random()*360.0));
            
            legHipBoneIdx=bones.push(new ModelBoneObject(('LegHip'+n),hipBoneIdx,new wsPoint(vct.x,-hipHigh,vct.z)))-1;
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
