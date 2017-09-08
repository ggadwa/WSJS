import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import ModelBoneClass from '../../code/model/model_bone.js';
import ModelLimbClass from '../../code/model/model_limb.js';
import ModelSkeletonClass from '../../code/model/model_skeleton.js';
import genRandom from '../../generate/utility/random.js';

//
// gen human skeleton class
//

export default class GenSkeletonBaseClass
{
    constructor(view,model,sizeFactor)
    {
        this.view=view;
        this.model=model;
        this.sizeFactor=sizeFactor;
    }
    
        //
        // leg limb
        //
        
    buildLimbLeg(limbIdx,parentBoneIdx,radius,rotOffset,footRot)
    {
        let pnt,vct,vct2,pushVct,legRadius;
        let hipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx,heelBoneIdx,knuckleBoneIdx,toeBoneIdx;
        let n,knuckleLength,toeRadius,toeTotalLength,fx,fz,legLimbIdx,footLimbIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let parentBone=bones[parentBoneIdx];
        
        legRadius=radius*this.sizeFactor;
        
            // size and position around body

        pushVct=new PointClass(0.0,0.0,((parentBone.gravityLockDistance*0.8)-(legRadius*0.5)));
        pushVct.rotateY(null,rotOffset);
        
        pnt=parentBone.position.copy();
        pnt.addPoint(pushVct);
        
            // legs always face down
            
        vct=new PointClass(0.0,-parentBone.position.y,0.0);
        rotOffset=genRandom.randomInt(0,20)-10;
        vct.rotateX(null,rotOffset);
        
            // leg bones
            // we might already have a hip, so don't rebuild if we do
        
        hipBoneIdx=bones.push(new ModelBoneClass(('Hip_'+limbIdx),parentBoneIdx,new PointClass(pnt.x,pnt.y,pnt.z)))-1;
        kneeBoneIdx=bones.push(new ModelBoneClass(('Knee_'+limbIdx),hipBoneIdx,new PointClass((pnt.x+(vct.x*0.4)),(pnt.y+(vct.y*0.4)),(pnt.z+(vct.z*0.4)))))-1;
        ankleBoneIdx=bones.push(new ModelBoneClass(('Ankle_'+limbIdx),kneeBoneIdx,new PointClass((pnt.x+(vct.x*0.8)),(pnt.y+(vct.y*0.8)),(pnt.z+(vct.z*0.8)))))-1;
        heelBoneIdx=bones.push(new ModelBoneClass(('Heel_'+limbIdx),ankleBoneIdx,new PointClass((pnt.x+(vct.x*0.95)),(pnt.y+(vct.y*0.95)),(pnt.z+(vct.z*0.95)))))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(legRadius*1.1);
        bones[kneeBoneIdx].gravityLockDistance=legRadius;
        bones[ankleBoneIdx].gravityLockDistance=legRadius;
        bones[heelBoneIdx].gravityLockDistance=legRadius;
        
        this.model.skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_LEG,limbIdx,constants.LIMB_AXIS_Y,8,5,[hipBoneIdx,kneeBoneIdx,ankleBoneIdx,heelBoneIdx]))-1;
        
            // the foot bones
            // feet are always parallel to ground, towards front
       
        vct2=new PointClass(0.0,0.0,genRandom.randomInt(legRadius,(legRadius*2)));
        vct2.rotateY(null,footRot);
        footBoneIdx=bones.push(new ModelBoneClass(('Foot_'+limbIdx),heelBoneIdx,new PointClass((bones[heelBoneIdx].position.x+vct2.x),(bones[heelBoneIdx].position.y+vct2.y),(bones[heelBoneIdx].position.z+vct2.z))))-1;

        bones[footBoneIdx].gravityLockDistance=legRadius;
        
        this.model.skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_FOOT,limbIdx,constants.LIMB_AXIS_Z,5,5,[heelBoneIdx,footBoneIdx]))-1;

/*
        
            // toe bones and limbs
            
        if (toeCount===0) return;
            
        toeRadius=Math.trunc(legRadius*0.5);
        if (toeRadius<100) toeRadius=100;
        
        knuckleLength=Math.trunc(footLength*0.5);
        toeTotalLength=knuckleLength+toeLength;

        fx=(vct.x-Math.trunc((toeCount/2)*150))+75;
        
        for (n=0;n!==toeCount;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneClass(('Toe Knuckle'+n+nameSuffix),footBoneIdx,new PointClass(fx,footHigh,(fz+knuckleLength))))-1;
            toeBoneIdx=bones.push(new ModelBoneClass(('Toe'+n+nameSuffix),knuckleBoneIdx,new PointClass(fx,footHigh,(fz+toeTotalLength))))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=toeRadius;
            bones[toeBoneIdx].gravityLockDistance=toeRadius;
            
            skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_TOE,index,constants.LIMB_AXIS_Z,4,4,[knuckleBoneIdx,toeBoneIdx]));
            
            fx+=150;
        }
        */
    }

        //
        // arm limb
        //
    
    buildLimbArm(limbIdx,parentBoneIdx,radius,length,rotOffset,hasFingers)
    {
        let armRadius,armLength,axis,pnt,vct,pushVct;
        let shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx,knuckleBoneIdx,fingerBoneIdx;
        let handPnt,handRadius,armLimbIdx,handLimbIdx;
        let n,fy,fingerCount,fingerRadius,fingerDistance;
        let knucklePnt,knuckleVct,fingerPnt,fingerVct;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let parentBone=bones[parentBoneIdx];
        
            // size and position around body
            
        armRadius=radius*this.sizeFactor;
        armLength=length*this.sizeFactor;
        
        axis=(((rotOffset>315)||(rotOffset<45))||((rotOffset>135)&&(rotOffset<225)))?constants.LIMB_AXIS_Z:constants.LIMB_AXIS_X;
        
        pushVct=new PointClass(0.0,0.0,(parentBone.gravityLockDistance-Math.trunc(armRadius*0.5)));
        pushVct.rotateY(null,rotOffset);
        
        pnt=parentBone.position.copy();
        pnt.addPoint(pushVct);
        
            // arms face out
            
        vct=new PointClass(0.0,0.0,armLength);
        vct.rotateY(null,rotOffset);
       
            // arm limb
            
        shoulderBoneIdx=bones.push(new ModelBoneClass(('Shoulder_'+limbIdx),parentBoneIdx,new PointClass(pnt.x,pnt.y,pnt.z)))-1;
        elbowBoneIdx=bones.push(new ModelBoneClass(('Elbow_'+limbIdx),shoulderBoneIdx,new PointClass((pnt.x+(vct.x*0.45)),(pnt.y+(vct.y*0.45)),(pnt.z+(vct.z*0.45)))))-1;
        wristBoneIdx=bones.push(new ModelBoneClass(('Wrist_'+limbIdx),elbowBoneIdx,new PointClass((pnt.x+(vct.x*0.9)),(pnt.y+(vct.y*0.9)),(pnt.z+(vct.z*0.9)))))-1;
        
        bones[shoulderBoneIdx].gravityLockDistance=Math.trunc(armRadius*1.1);
        bones[elbowBoneIdx].gravityLockDistance=armRadius;
        bones[wristBoneIdx].gravityLockDistance=armRadius;
        
        armLimbIdx=skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_ARM,limbIdx,axis,8,5,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx]))-1;
        
            // limb
            
        handRadius=Math.trunc(armRadius*1.3);
        handPnt=new PointClass((pnt.x+vct.x),(pnt.y+vct.y),(pnt.z+vct.z));
        
        handBoneIdx=bones.push(new ModelBoneClass(('Hand_'+limbIdx),wristBoneIdx,handPnt))-1;
        
        bones[handBoneIdx].gravityLockDistance=handRadius;
        
        handLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_HAND,limbIdx,axis,5,5,[handBoneIdx],-1,-1))-1;

            // finger limbs
            
        if (!hasFingers) return;
        
        fingerCount=genRandom.randomInt(0,5);
        if (fingerCount===0) return;
        
        fingerRadius=Math.trunc((armRadius/fingerCount)*0.8);
        if (fingerRadius<100) fingerRadius=100;
        
        fingerDistance=Math.trunc(fingerRadius*1.1);
        
        knuckleVct=vct.copy();
        knuckleVct.normalize();
        knuckleVct.scale(Math.trunc(handRadius*0.4));
        knucklePnt=new PointClass((handPnt.x+knuckleVct.x),(handPnt.y+knuckleVct.y),(handPnt.z+knuckleVct.z));
        
        fingerVct=vct.copy();
        fingerVct.normalize();
        fingerVct.scale(genRandom.randomInt(armRadius,armRadius));
        fingerPnt=new PointClass((knucklePnt.x+fingerVct.x),(knucklePnt.y+fingerVct.y),(knucklePnt.z+fingerVct.z));

        fy=knucklePnt.y-Math.trunc(fingerCount*0.5)*fingerDistance;
        
        for (n=0;n!==fingerCount;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneClass(('Finger_Knuckle_'+limbIdx+'_'+n),handBoneIdx,new PointClass(knucklePnt.x,fy,knucklePnt.z)))-1;
            fingerBoneIdx=bones.push(new ModelBoneClass(('Finger'+limbIdx+'_'+n),knuckleBoneIdx,new PointClass(fingerPnt.x,fy,fingerPnt.z)))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=fingerRadius;
            bones[fingerBoneIdx].gravityLockDistance=fingerRadius;
            
            skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_FINGER,limbIdx,axis,4,4,[knuckleBoneIdx,fingerBoneIdx]));
            
            fy+=fingerDistance;
        }
    }
    
        //
        // whip limbs
        //
    
    buildLimbWhip(limbIdx,parentBoneIdx,radius,length)
    {
        let whipRadius,rotOffset,whipLength,axis,pnt,vct,pushVct;
        let whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let parentBone=bones[parentBoneIdx];
        
            // size and position around body
            
        whipRadius=radius*this.sizeFactor;
        whipLength=length*this.sizeFactor;
        
        if (genRandom.randomPercentage(0.5)) {
            axis=constants.LIMB_AXIS_Z;
            rotOffset=genRandom.randomInt(0,30)-15;
        }
        else {
            axis=constants.LIMB_AXIS_X;
            rotOffset=genRandom.randomInt(90,30)-15;
        }
        if (genRandom.randomPercentage(0.5)) rotOffset+=180;
        
        pushVct=new PointClass(0.0,0.0,(parentBone.gravityLockDistance-Math.trunc(whipRadius*0.5)));
        pushVct.rotateY(null,rotOffset);
        
        pnt=parentBone.position.copy();
        pnt.addPoint(pushVct);
        
            // whips face out
            
        vct=new PointClass(0.0,0.0,whipLength);
        vct.rotateY(null,rotOffset);
        
            // whip limb
            
        whip0BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_0'),parentBoneIdx,new PointClass(pnt.x,pnt.y,pnt.z)))-1;
        whip1BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_1'),whip0BoneIdx,new PointClass((pnt.x+(vct.x*0.33)),(pnt.y+(vct.y*0.33)),(pnt.z+(vct.z*0.33)))))-1;
        whip2BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_2'),whip1BoneIdx,new PointClass((pnt.x+(vct.x*0.66)),(pnt.y+(vct.y*0.66)),(pnt.z+(vct.z*0.66)))))-1;
        whip3BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_3'),whip2BoneIdx,new PointClass((pnt.x+vct.x),(pnt.y+vct.y),(pnt.z+vct.z))))-1;

        bones[whip0BoneIdx].gravityLockDistance=whipRadius;
        bones[whip1BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.8);
        bones[whip2BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.6);
        bones[whip3BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.3);

        skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_WHIP,limbIdx,axis,8,5,[whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx]));
    }
    
        //
        // head
        //
        
    buildLimbHead(limbIdx,parentBoneIdx,neckLength,neckRadius,jawRadius,headRadius)
    {
        let pnt,pushVct;
        let neckStartBoneIdx,neckEndBoneIdx,jawBoneIdx,headBoneIdx;
        let jawLength,headLength;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let parentBone=bones[parentBoneIdx];
        
        neckLength*=this.sizeFactor;
        neckRadius*=this.sizeFactor;
        jawRadius*=this.sizeFactor;
        headRadius*=this.sizeFactor;
        
            // size and position around body

        pushVct=new PointClass(0.0,-(parentBone.gravityLockDistance-Math.trunc(neckRadius*0.5)),0.0);
        
        pnt=parentBone.position.copy();
        pnt.addPoint(pushVct);
        
            // create the neck
            
        neckStartBoneIdx=bones.push(new ModelBoneClass(('Neck_Start_'+limbIdx),parentBoneIdx,new PointClass(pnt.x,pnt.y,pnt.z)))-1;
        neckEndBoneIdx=bones.push(new ModelBoneClass(('Neck_End_'+limbIdx),neckStartBoneIdx,new PointClass(pnt.x,(pnt.y-neckLength),pnt.z)))-1;
        
        bones[neckStartBoneIdx].gravityLockDistance=neckRadius;
        bones[neckEndBoneIdx].gravityLockDistance=neckRadius;

        this.model.skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_NECK,0,constants.LIMB_AXIS_Y,5,5,[neckStartBoneIdx,neckEndBoneIdx]));
        
            // create the head
            
        jawLength=neckLength+Math.trunc(jawRadius*0.5);
        headLength=jawLength+Math.trunc(headRadius*0.5);
        
        jawBoneIdx=bones.push(new ModelBoneClass('Jaw',neckEndBoneIdx,new PointClass(pnt.x,(pnt.y-jawLength),pnt.z)))-1;
        headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new PointClass(pnt.x,(pnt.y-headLength),pnt.z)))-1;
        
        bones[jawBoneIdx].gravityLockDistance=jawRadius;
        bones[headBoneIdx].gravityLockDistance=headRadius;
        
        this.model.skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_HEAD,0,constants.LIMB_AXIS_Y,10,10,[jawBoneIdx,headBoneIdx]));
    }
    
        //
        // general body for human
        //
        
    buildBody(minHipHigh,extraHipHigh,minBodyHigh,extraBodyHigh,minRadius,extraRadius,waistReduce,hasHunch)
    {
        let hipPnt,waistPnt,torsoPnt,topTorsoPnt,hunchAng;
        let bodyLimb,bodyLimbIdx;
        let bodyHigh,hipHigh,waistHigh,torsoHigh,torsoTopHigh;
        let baseBoneIdx,hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // random heights
            
        bodyHigh=Math.trunc(genRandom.randomInt(minBodyHigh,extraBodyHigh)*this.sizeFactor)
            
        hipHigh=Math.trunc(genRandom.randomInt(minHipHigh,extraHipHigh)*this.sizeFactor);
        waistHigh=hipHigh+Math.trunc(bodyHigh*0.33);
        torsoHigh=waistHigh+Math.trunc(bodyHigh*0.33);
        torsoTopHigh=torsoHigh+Math.trunc(bodyHigh*0.33);
        
            // random hunch
        
        hunchAng=-genRandom.randomFloat(0.0,70.0);
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new PointClass(0,0,0)))-1;

            // the spine
        
        hipPnt=new PointClass(0,-hipHigh,0);
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,hipPnt))-1;
        
        waistPnt=new PointClass(0,-waistHigh,hipPnt.z);
        if (hasHunch) waistPnt.rotateX(hipPnt,(hunchAng*genRandom.randomFloat(0.5,0.05)));
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,waistPnt))-1;
        
        torsoPnt=new PointClass(0,-torsoHigh,waistPnt.z);
        if (hasHunch) torsoPnt.rotateX(waistPnt,(hunchAng*genRandom.randomFloat(0.7,0.05)));
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,torsoPnt))-1;
        
        topTorsoPnt=new PointClass(0,-torsoTopHigh,torsoPnt.z);
        if (hasHunch) topTorsoPnt.rotateX(torsoPnt,(hunchAng*genRandom.randomFloat(0.9,0.05)));
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso_Top',torsoBoneIdx,topTorsoPnt))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(minRadius,extraRadius)*this.sizeFactor);
        bones[waistBoneIdx].gravityLockDistance=Math.trunc((genRandom.randomInt(minRadius,extraRadius)*waistReduce)*this.sizeFactor);
        bones[torsoBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(minRadius,extraRadius)*this.sizeFactor);
        bones[torsoTopBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(minRadius,extraRadius)*this.sizeFactor);

            // the body limb
            
        bodyLimb=new ModelLimbClass(constants.LIMB_TYPE_BODY,0,constants.LIMB_AXIS_Y,12,12,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
        bodyLimbIdx=skeleton.limbs.push(bodyLimb)-1;
        
        return(bodyLimbIdx);
    }
    
        //
        // build mainline
        //
        
    build()
    {
    }
}
