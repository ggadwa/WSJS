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
        
    this.buildLimbArm=function(vct,nameSuffix,torsoTopBoneIdx,armRadius,y,shoulderLength,elbowLength,wristLength,handLength)
    {
        var shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx;
        var skeleton=this.model.skeleton;
        var bones=skeleton.bones;
            
        shoulderBoneIdx=bones.push(new ModelBoneObject(('Shoulder'+nameSuffix),torsoTopBoneIdx,new wsPoint((shoulderLength*vct.x),y,(shoulderLength*vct.z))))-1;
        elbowBoneIdx=bones.push(new ModelBoneObject(('Elbow'+nameSuffix),shoulderBoneIdx,new wsPoint((elbowLength*vct.x),y,(elbowLength*vct.z))))-1;
        wristBoneIdx=bones.push(new ModelBoneObject(('Wrist'+nameSuffix),elbowBoneIdx,new wsPoint((wristLength*vct.x),y,(wristLength*vct.z))))-1;
        handBoneIdx=bones.push(new ModelBoneObject(('Hand'+nameSuffix),wristBoneIdx,new wsPoint((handLength*vct.x),y,(handLength*vct.z))))-1;

        bones[shoulderBoneIdx].gravityLockDistance=250;
        bones[elbowBoneIdx].gravityLockDistance=200;
        bones[wristBoneIdx].gravityLockDistance=200;
        bones[handBoneIdx].gravityLockDistance=300;

        skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_ARM,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx]));
    };
    
    this.buildLimbLeg=function(vct,boneIdx,nameSuffix,hipHigh,kneeHigh,ankleHigh,legRadius,footLength)
    {
        var legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx;
        var skeleton=this.model.skeleton;
        var bones=skeleton.bones;
        
        legHipBoneIdx=bones.push(new ModelBoneObject(('LegHip'+nameSuffix),boneIdx,new wsPoint(vct.x,hipHigh,vct.z)))-1;
        kneeBoneIdx=bones.push(new ModelBoneObject(('Knee'+nameSuffix),legHipBoneIdx,new wsPoint(vct.x,kneeHigh,vct.z)))-1;
        ankleBoneIdx=bones.push(new ModelBoneObject(('Ankle'+nameSuffix),kneeBoneIdx,new wsPoint(vct.x,ankleHigh,vct.z)))-1;

        var vct2=new wsPoint(0.0,0.0,-footLength);

        footBoneIdx=bones.push(new ModelBoneObject(('Foot'+nameSuffix),ankleBoneIdx,new wsPoint((vct.x+vct2.x),ankleHigh,(vct.z+vct2.z))))-1;

        bones[legHipBoneIdx].gravityLockDistance=legRadius;
        bones[kneeBoneIdx].gravityLockDistance=legRadius;
        bones[ankleBoneIdx].gravityLockDistance=legRadius;
        bones[footBoneIdx].gravityLockDistance=legRadius;

        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_LEG,[legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx]));
    };
    
    this.buildLimbLegSet=function(boneIdx,legIndex,boneOffset,rotOffset,hipRadius,hipHigh,legRadius,footLength)
    {
        var kneeHigh=Math.floor(hipHigh*0.5);
        var ankleHigh=Math.floor(hipHigh*0.05);
        
        var vct=new wsPoint(hipRadius,0.0,0.0);
        vct.rotateY(null,rotOffset);
        vct.z-=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Left'+legIndex),hipHigh,kneeHigh,ankleHigh,legRadius,footLength);

        vct=new wsPoint(-hipRadius,0.0,0.0);
        vct.rotateY(null,-rotOffset);
        vct.z-=boneOffset;
        this.buildLimbLeg(vct,boneIdx,('Right'+legIndex),hipHigh,kneeHigh,ankleHigh,legRadius,footLength);
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
            
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_BODY,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]));
        
            // create head limbs
            
        var neckHigh=Math.floor(totalHigh*0.76);
        var jawAdd=this.genRandom.randomInt(83,10)/100.0;
        var jawHigh=Math.floor(totalHigh*jawAdd);
        var headHigh=jawHigh+Math.floor(totalHigh*0.1);
            
        var neckBoneIdx=bones.push(new ModelBoneObject('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
        var jawBoneIdx=bones.push(new ModelBoneObject('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
        var headBoneIdx=bones.push(new ModelBoneObject('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;
        
        bones[headBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[jawBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[neckBoneIdx].gravityLockDistance=this.genRandom.randomInt(100,150);
        
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_HEAD,[headBoneIdx,jawBoneIdx,neckBoneIdx]));
        
            // create arm limbs
            // arm length is about quarter body size + some random
        
        var y=bones[torsoTopBoneIdx].position.y;
        var rotOffset,vct,y;
        
        var armCount=1;
        if (this.genRandom.randomPercentage(0.25)) armCount=this.genRandom.randomInt(1,3);
        
        var armRadius,armLength;
        
        var shoulderLength,elbowLength,wristLength,handLength;
        
        for (n=0;n!==armCount;n++) {
            rotOffset=(this.genRandom.random()*20.0)-10.0;
            
            armRadius=Math.floor(botBodyRadius*0.35);
            if (armRadius<250) armRadius=250;
            armLength=this.genRandom.randomInt(Math.floor(totalHigh*0.2),Math.floor(totalHigh*0.2));
        
            shoulderLength=Math.floor(topBodyRadius*0.75);
            elbowLength=shoulderLength+Math.floor(armLength*0.42);
            wristLength=shoulderLength+Math.floor(armLength*0.84);
            handLength=shoulderLength+Math.floor(armLength*0.9);
            
            vct=new wsPoint(1.0,0.0,0.0);
            vct.rotateY(null,rotOffset);
            this.buildLimbArm(vct,('Left'+n),torsoTopBoneIdx,armRadius,y,shoulderLength,elbowLength,wristLength,handLength);
        
            vct=new wsPoint(-1.0,0.0,0.0);
            vct.rotateY(null,-rotOffset);
            this.buildLimbArm(vct,('Right'+n),torsoTopBoneIdx,armRadius,y,shoulderLength,elbowLength,wristLength,handLength);
        
            y+=(armRadius+Math.floor(armRadius*0.1));
        }

            // create leg limbs
        
        var legRadius=Math.floor(botBodyRadius*0.35);
        if (legRadius<250) legRadius=250;
        var footLength=Math.floor(legRadius*2.5);
       
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
        
            // counts
        
        var legLength=this.genRandom.randomInt(350,350);
        var hipHigh=legLength*2;


                

        
            // random radius

        var hipRadius=this.genRandom.randomInt(200,250);
        
        
        
            // the base bone
            
        var baseBoneIdx=bones.push(new ModelBoneObject('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limbs
            
        var bodyLength=this.genRandom.randomInt(400,700);
        
        var leftBodyRadius=this.genRandom.randomInt(300,300);
        var rightBodyRadius=this.genRandom.randomInt(300,300);

        var hipBoneIdx=bones.push(new ModelBoneObject('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,-Math.floor(bodyLength*0.5))))-1;
        var waistBoneIdx=bones.push(new ModelBoneObject('Waist',hipBoneIdx,new wsPoint(0,-hipHigh,-Math.floor(bodyLength*0.25))))-1;
        var torsoBoneIdx=bones.push(new ModelBoneObject('Torso',waistBoneIdx,new wsPoint(0,-hipHigh,Math.floor(bodyLength*0.25))))-1;
        var torsoTopBoneIdx=bones.push(new ModelBoneObject('Torso Top',torsoBoneIdx,new wsPoint(0,-hipHigh,Math.floor(bodyLength*0.5))))-1;
        
        bones[hipBoneIdx].gravityLockDistance=rightBodyRadius;
        bones[waistBoneIdx].gravityLockDistance=rightBodyRadius+Math.floor((leftBodyRadius-rightBodyRadius)*0.33);
        bones[torsoBoneIdx].gravityLockDistance=rightBodyRadius+Math.floor((leftBodyRadius-rightBodyRadius)*0.66);
        bones[torsoTopBoneIdx].gravityLockDistance=leftBodyRadius;
                    
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_BODY,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]));
        
            // create the head limbs
        
        var headRadius=this.genRandom.randomInt(300,300);
        
        var jawLength=Math.floor(bodyLength*(this.genRandom.randomInt(65,10)/100.0));
        var jawHigh=hipHigh+this.genRandom.randomInt(20,200);
        var headHigh=jawHigh+Math.floor(headRadius*0.5);
            
        var neckBoneIdx=bones.push(new ModelBoneObject('Neck',torsoTopBoneIdx,new wsPoint(0,-hipHigh,Math.floor(bodyLength*0.55))))-1;
        var jawBoneIdx=bones.push(new ModelBoneObject('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,jawLength)))-1;
        var headBoneIdx=bones.push(new ModelBoneObject('Head',jawBoneIdx,new wsPoint(0,-headHigh,jawLength)))-1;
        
        bones[headBoneIdx].gravityLockDistance=headRadius;
        bones[jawBoneIdx].gravityLockDistance=headRadius;
        bones[neckBoneIdx].gravityLockDistance=this.genRandom.randomInt(100,150);
        
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_HEAD,[headBoneIdx,jawBoneIdx,neckBoneIdx]));
        
            // create legs
        
        var rotOffset=(this.genRandom.random()*20.0)-10.0;
        var footLength=this.genRandom.randomInt(150,150);
        
        this.buildLimbLegSet(hipBoneIdx,0,bones[hipBoneIdx].position.z,rotOffset,hipRadius,bones[hipBoneIdx].position.y,200,footLength);
        if (this.genRandom.random()<0.3) this.buildLimbLegSet(waistBoneIdx,0,hipRadius,bones[waistBoneIdx].position.z,rotOffset,hipRadius,bones[waistBoneIdx].position.y,200,footLength);
        if (this.genRandom.random()<0.3) this.buildLimbLegSet(torsoBoneIdx,0,bones[torsoBoneIdx].position.z,rotOffset,hipRadius,bones[torsoBoneIdx].position.y,200,footLength);
        this.buildLimbLegSet(torsoTopBoneIdx,0,bones[torsoTopBoneIdx].position.z,rotOffset,hipRadius,bones[torsoTopBoneIdx].position.y,200,footLength);
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
        
        var totalHigh=this.genRandom.randomInt(Math.floor(ROOM_FLOOR_HEIGHT*0.2),Math.floor(ROOM_FLOOR_HEIGHT*0.4));
        
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
            
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_BODY,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]));
        
            // create head limbs
            
        var neckHigh=Math.floor(totalHigh*0.76);
        var jawAdd=this.genRandom.randomInt(83,10)/100.0;
        var jawHigh=Math.floor(totalHigh*jawAdd);
        var headHigh=jawHigh+Math.floor(totalHigh*0.1);
            
        var neckBoneIdx=bones.push(new ModelBoneObject('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
        var jawBoneIdx=bones.push(new ModelBoneObject('Neck',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
        var headBoneIdx=bones.push(new ModelBoneObject('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;
        
        bones[headBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[jawBoneIdx].gravityLockDistance=this.genRandom.randomInt(300,400);
        bones[neckBoneIdx].gravityLockDistance=this.genRandom.randomInt(100,150);
        
        this.model.skeleton.limbs.push(new ModelLimbObject(LIMB_TYPE_HEAD,[headBoneIdx,jawBoneIdx,neckBoneIdx]));
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
