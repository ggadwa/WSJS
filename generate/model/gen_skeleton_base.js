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
        
    buildLimbLeg(limbIdx,parentBoneIdx,radius,rotOffset,footLength,footRot,toeCount,flipped)
    {
        let pnt,vct,pushVct,legRadius;
        let hipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx,heelBoneIdx,knuckleBoneIdx,toeBoneIdx;
        let n,toeRadius,toeDistance,fx,meshScale;
        let footVct,footPnt,knuckleVct,knucklePnt,toePnt;
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
        
            // leg bones
            // we might already have a hip, so don't rebuild if we do
        
        hipBoneIdx=bones.push(new ModelBoneClass(('Hip_'+limbIdx),parentBoneIdx,new PointClass(pnt.x,pnt.y,pnt.z)))-1;
        kneeBoneIdx=bones.push(new ModelBoneClass(('Knee_'+limbIdx),hipBoneIdx,new PointClass((pnt.x+(vct.x*0.4)),(pnt.y+(vct.y*0.4)),(pnt.z+(vct.z*0.4)))))-1;
        ankleBoneIdx=bones.push(new ModelBoneClass(('Ankle_'+limbIdx),kneeBoneIdx,new PointClass((pnt.x+(vct.x*0.8)),(pnt.y+(vct.y*0.8)),(pnt.z+(vct.z*0.8)))))-1;
        heelBoneIdx=bones.push(new ModelBoneClass(('Heel_'+limbIdx),ankleBoneIdx,new PointClass((pnt.x+(vct.x*0.95)),(pnt.y+(vct.y*0.95)),(pnt.z+(vct.z*0.95)))))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(legRadius*genRandom.randomFloat(1.0,0.3));
        bones[kneeBoneIdx].gravityLockDistance=legRadius;
        bones[ankleBoneIdx].gravityLockDistance=legRadius;
        bones[heelBoneIdx].gravityLockDistance=legRadius;
        
        meshScale=genRandom.randomFloat(0.7,0.3);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_LEG,limbIdx,constants.LIMB_AXIS_Y,flipped,8,5,false,new PointClass(1.0,1.0,meshScale),new PointClass(1.0,0.0,meshScale),[hipBoneIdx,kneeBoneIdx,ankleBoneIdx,heelBoneIdx]));
        
            // the foot bones
            // feet are always parallel to ground, towards front
       
        footVct=new PointClass(0.0,0.0,footLength);
        footVct.rotateY(null,footRot);
        
        footPnt=bones[heelBoneIdx].position.copy();
        footPnt.addPoint(footVct);
        footPnt.y=0.0;
        footBoneIdx=bones.push(new ModelBoneClass(('Foot_'+limbIdx),heelBoneIdx,footPnt))-1;

        bones[footBoneIdx].gravityLockDistance=legRadius*genRandom.randomFloat(1.2,0.3);
        
        this.model.skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_FOOT,limbIdx,constants.LIMB_AXIS_Z,flipped,5,5,false,new PointClass(1.0,0.7,1.0),new PointClass(1.0,0.0,1.0),[heelBoneIdx,footBoneIdx]));

            // toe limbs
            
        if (toeCount===0) return;
        
        toeRadius=Math.trunc((legRadius/toeCount)*0.8);
        if (toeRadius<100) toeRadius=100;
        
        toeDistance=Math.trunc(toeRadius*1.1);
        
        knuckleVct=footVct.copy();
        knuckleVct.normalize();
        knuckleVct.scale(Math.trunc(footLength*0.4));
        knucklePnt=new PointClass((footPnt.x+knuckleVct.x),0,(footPnt.z+knuckleVct.z));
        
        toePnt=new PointClass((knucklePnt.x+knuckleVct.x),0,(knucklePnt.z+knuckleVct.z));

        fx=knucklePnt.x-Math.trunc(toeCount*0.5)*toeDistance;

        for (n=0;n!==toeCount;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneClass(('Toe_Knuckle_'+limbIdx+'_'+n),footBoneIdx,new PointClass(fx,knucklePnt.y,knucklePnt.z)))-1;
            toeBoneIdx=bones.push(new ModelBoneClass(('Toe_'+limbIdx+'_'+n),knuckleBoneIdx,new PointClass(fx,toePnt.y,toePnt.z)))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=toeRadius;
            bones[toeBoneIdx].gravityLockDistance=toeRadius;
            
            skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_FINGER,limbIdx,constants.LIMB_AXIS_Z,flipped,4,4,false,new PointClass(1.0,0.7,1.0),new PointClass(1.0,0.0,1.0),[knuckleBoneIdx,toeBoneIdx]));
            
            fx+=toeDistance;
        }
    }

        //
        // arm limb
        //
    
    buildLimbArm(limbIdx,parentBoneIdx,radius,length,rotOffset,fingerCount,flipped)
    {
        let armRadius,armLength,axis,pnt,vct,pushVct;
        let shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx,knuckleBoneIdx,fingerBoneIdx;
        let handPnt,handRadius,armLimbIdx,handLimbIdx;
        let n,fy,fingerRadius,fingerDistance,meshScale;
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
        
        bones[shoulderBoneIdx].gravityLockDistance=Math.trunc(armRadius*1.5);
        bones[elbowBoneIdx].gravityLockDistance=armRadius;
        bones[wristBoneIdx].gravityLockDistance=armRadius;
        
        meshScale=genRandom.randomFloat(0.7,0.3);
        
        armLimbIdx=skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_ARM,limbIdx,axis,flipped,8,5,false,new PointClass(1.0,1.0,meshScale),new PointClass(1.0,1.0,meshScale),[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx]))-1;
        
            // hand limb
            
        handRadius=Math.trunc(armRadius*genRandom.randomFloat(1.0,0.3));
        handPnt=new PointClass((pnt.x+vct.x),(pnt.y+vct.y),(pnt.z+vct.z));
        
        handBoneIdx=bones.push(new ModelBoneClass(('Hand_'+limbIdx),wristBoneIdx,handPnt))-1;
        
        bones[handBoneIdx].gravityLockDistance=handRadius;
        
        handLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_HAND,limbIdx,axis,flipped,5,5,false,new PointClass(1.0,1.0,meshScale),new PointClass(1.0,1.0,meshScale),[handBoneIdx]))-1;

            // finger limbs
            
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
            
            skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_FINGER,limbIdx,axis,flipped,4,4,false,new PointClass(1.0,1.0,meshScale),new PointClass(1.0,1.0,meshScale),[knuckleBoneIdx,fingerBoneIdx]));
            
            fy+=fingerDistance;
        }
    }
    
        //
        // whip limbs
        //
    
    buildLimbWhip(limbIdx,parentBoneIdx,radius,length,rotOffset)
    {
        let whipRadius,whipLength,axis,pnt,vct,pushVct;
        let whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let parentBone=bones[parentBoneIdx];
        
            // size and position around body
            
        whipRadius=radius*this.sizeFactor;
        whipLength=length*this.sizeFactor;
        
        pushVct=new PointClass(0.0,0.0,(parentBone.gravityLockDistance-Math.trunc(whipRadius*0.5)));
        pushVct.rotateY(null,rotOffset);
        
        pnt=parentBone.position.copy();
        pnt.addPoint(pushVct);
        
            // whips face out
            
        axis=(((rotOffset>315)||(rotOffset<45))||((rotOffset>135)&&(rotOffset<225)))?constants.LIMB_AXIS_Z:constants.LIMB_AXIS_X;
            
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

        skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_WHIP,limbIdx,axis,false,8,5,false,null,null,[whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx]));
    }
    
        //
        // head
        //
        
    buildLimbHead(limbIdx,parentBoneIdx,neckLength,neckRadius,jawRadius,headRadius,hasJaw)
    {
        let pnt,jawBackPnt,jawFrontPnt,neckPnt,vct;
        let neckStartBoneIdx,neckEndBoneIdx;
        let jawBackBoneIdx,jawFrontBoneIdx;
        let headBottomBoneIdx,headTopBoneIdx;
        let neckStartLength,headOffset,headLength,headRot;
        let scaleMin,scaleMax;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let parentBone=bones[parentBoneIdx];
        
        neckLength*=this.sizeFactor;
        neckRadius*=this.sizeFactor;
        jawRadius*=this.sizeFactor;
        headRadius*=this.sizeFactor;
        
            // create the neck
            
        neckStartLength=(parentBone.gravityLockDistance-(neckLength*0.5))*this.sizeFactor;
        
        pnt=parentBone.position.copy();
        vct=new PointClass(0,-neckStartLength,0);
        vct.rotateX(null,-genRandom.randomFloat(0,25.0));
        pnt.addPoint(vct);
            
        neckStartBoneIdx=bones.push(new ModelBoneClass(('Neck_Bottom_'+limbIdx),parentBoneIdx,pnt))-1;
        
        neckPnt=pnt.copy();
        vct=new PointClass(0,-neckLength,0);
        vct.rotateX(null,-genRandom.randomFloat(0,25.0));
        neckPnt.addPoint(vct);
        
        neckEndBoneIdx=bones.push(new ModelBoneClass(('Neck_Top_'+limbIdx),neckStartBoneIdx,neckPnt))-1;
        
        bones[neckStartBoneIdx].gravityLockDistance=neckRadius*genRandom.randomFloat(0.8,0.2);
        bones[neckEndBoneIdx].gravityLockDistance=neckRadius;

        this.model.skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_NECK,0,constants.LIMB_AXIS_Y,false,5,5,false,new PointClass(1.0,0.3,1.0),new PointClass(1.0,0.1,1.0),[neckStartBoneIdx,neckEndBoneIdx]));
        
            // default placements
            
        headOffset=10;
        headRot=-genRandom.randomFloat(0,25.0);
        
            // create the jaw
            
        if (hasJaw) {
            jawRadius=Math.trunc(headRadius*genRandom.randomFloat(0.3,0.3));
            
            jawBackPnt=neckPnt.copy();
            vct=new PointClass(0,-headOffset,-((headRadius*0.6)-(jawRadius*0.5)));
            jawBackPnt.addPoint(vct);
            
            jawBackBoneIdx=bones.push(new ModelBoneClass(('Jaw_Back_'+limbIdx),neckEndBoneIdx,jawBackPnt))-1;
            
            bones[jawBackBoneIdx].gravityLockDistance=jawRadius;

            jawFrontPnt=neckPnt.copy();
            vct=new PointClass(0,-headOffset,((headRadius*genRandom.randomFloat(0.5,0.3))-(jawRadius*0.5)));
            jawFrontPnt.addPoint(vct);

            jawFrontBoneIdx=bones.push(new ModelBoneClass(('Jaw_Front_'+limbIdx),jawBackBoneIdx,jawFrontPnt))-1;
            
            bones[jawFrontBoneIdx].gravityLockDistance=jawRadius;
            
            scaleMax=new PointClass(genRandom.randomFloat(0.7,0.3),genRandom.randomFloat(0.7,0.3),genRandom.randomFloat(0.7,0.3));
            scaleMin=scaleMax.copy();
            scaleMin.y=0.1;
            
            this.model.skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_JAW,0,constants.LIMB_AXIS_Z,false,6,6,false,scaleMin,scaleMax,[jawBackBoneIdx,jawFrontBoneIdx]));
        }
        
            // create the head
        
        headLength=Math.trunc(headRadius*genRandom.randomFloat(0.4,0.4));
        
        pnt=neckPnt.copy();
        vct=new PointClass(0,-headOffset,0);        // no rot here
        pnt.addPoint(vct);
        
        headBottomBoneIdx=bones.push(new ModelBoneClass(('Head_Bottom_'+limbIdx),neckEndBoneIdx,pnt))-1;
        
        pnt=pnt.copy();
        vct=new PointClass(0,-headLength,0);
        vct.rotateX(null,headRot);
        pnt.addPoint(vct);
        
        headTopBoneIdx=bones.push(new ModelBoneClass(('Head_Top_'+limbIdx),headBottomBoneIdx,pnt))-1;
        
        bones[headBottomBoneIdx].gravityLockDistance=headRadius;
        bones[headTopBoneIdx].gravityLockDistance=headRadius;
        
        scaleMin=new PointClass(genRandom.randomFloat(0.7,0.3),genRandom.randomFloat(0.7,0.3),genRandom.randomFloat(0.7,0.3));
        scaleMax=scaleMin.copy();
        if (hasJaw) scaleMax.y=0.1;
        
        this.model.skeleton.limbs.push(new ModelLimbClass(constants.LIMB_TYPE_HEAD,0,constants.LIMB_AXIS_Y,false,10,10,false,scaleMin,scaleMax,[headBottomBoneIdx,headTopBoneIdx]));
    }
    
        //
        // general body for human
        //
        
    buildBody(minHipHigh,extraHipHigh,minBodyHigh,extraBodyHigh,minRadius,extraRadius,waistReduce,hunchAng)
    {
        let hipPnt,waistPnt,torsoPnt,topTorsoPnt;
        let bodyLimb,bodyLimbIdx;
        let bodyHigh,hipHigh,waistHigh,torsoHigh,torsoTopHigh,meshScale;
        let baseBoneIdx,hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // random heights
            
        bodyHigh=Math.trunc(genRandom.randomInt(minBodyHigh,extraBodyHigh)*this.sizeFactor)
            
        hipHigh=Math.trunc(genRandom.randomInt(minHipHigh,extraHipHigh)*this.sizeFactor);
        waistHigh=hipHigh+Math.trunc(bodyHigh*0.33);
        torsoHigh=waistHigh+Math.trunc(bodyHigh*0.33);
        torsoTopHigh=torsoHigh+Math.trunc(bodyHigh*0.33);
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new PointClass(0,0,0)))-1;

            // the spine
        
        hipPnt=new PointClass(0,-hipHigh,0);
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,hipPnt))-1;
        
        waistPnt=new PointClass(0,-waistHigh,hipPnt.z);
        if (hunchAng!==0.0) waistPnt.rotateX(hipPnt,-(hunchAng*genRandom.randomFloat(0.5,0.05)));
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,waistPnt))-1;
        
        torsoPnt=new PointClass(0,-torsoHigh,waistPnt.z);
        if (hunchAng!==0.0) torsoPnt.rotateX(waistPnt,-(hunchAng*genRandom.randomFloat(0.7,0.05)));
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,torsoPnt))-1;
        
        topTorsoPnt=new PointClass(0,-torsoTopHigh,torsoPnt.z);
        if (hunchAng!==0.0) topTorsoPnt.rotateX(torsoPnt,-(hunchAng*genRandom.randomFloat(0.9,0.05)));
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso_Top',torsoBoneIdx,topTorsoPnt))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(minRadius,extraRadius)*this.sizeFactor);
        bones[waistBoneIdx].gravityLockDistance=Math.trunc((genRandom.randomInt(minRadius,extraRadius)*waistReduce)*this.sizeFactor);
        bones[torsoBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(minRadius,extraRadius)*this.sizeFactor);
        bones[torsoTopBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(minRadius,extraRadius)*this.sizeFactor);

            // the body limb
            
        meshScale=genRandom.randomFloat(0.7,0.3);
            
        bodyLimb=new ModelLimbClass(constants.LIMB_TYPE_BODY,0,constants.LIMB_AXIS_Y,false,12,12,true,new PointClass(1.0,1.0,meshScale),new PointClass(1.0,1.0,meshScale),[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
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
