/* global genRandom, view, modelConstants */

"use strict";

//
// model bone class
//

class ModelBoneClass
{
    constructor(name,parentBoneIdx,position)
    {
        this.name=name;
        this.parentBoneIdx=parentBoneIdx;
        this.position=position;

            // parenting

        this.vectorFromParent=new wsPoint(0.0,0,0,0,0);
        this.childBoneIndexes=[];

            // mesh creation

        this.gravityLockDistance=500;

            // pose

        this.curPoseAngle=new wsPoint(0.0,0.0,0.0);
        this.curPosePosition=this.position.copy();

        this.prevPoseAngle=new wsPoint(0.0,0.0,0.0);
        this.nextPoseAngle=new wsPoint(0.0,0.0,0.0);
        
        Object.seal(this);
    }
    
        //
        // bone types and flags
        //
        
    isBase()
    {
        return(this.name==='Base');
    }
    
    hasParent()
    {
        return(this.parentBoneIdx!==-1);
    }
}

//
// limb class constants, redo this when
// we get static properties for classes
//

class ModelLimbConstantsClass
{
    constructor()
    {
        this.LIMB_TYPE_BODY=0;
        this.LIMB_TYPE_NECK=1;
        this.LIMB_TYPE_HEAD=2;
        this.LIMB_TYPE_HEAD_SNOUT=3;
        this.LIMB_TYPE_HEAD_JAW=4;
        this.LIMB_TYPE_ARM=5;
        this.LIMB_TYPE_HAND=6;
        this.LIMB_TYPE_FINGER=7;
        this.LIMB_TYPE_LEG=8;
        this.LIMB_TYPE_FOOT=9;
        this.LIMB_TYPE_TOE=10;
        this.LIMB_TYPE_WHIP=11;

        this.LIMB_AXIS_X=0;
        this.LIMB_AXIS_Y=1;
        this.LIMB_AXIS_Z=2;
    }
}

let modelLimbConstants=new ModelLimbConstantsClass();

//
// limb class
//

class ModelLimbClass
{
    constructor(limbType,index,axis,acrossSurfaceCount,aroundSurfaceCount,boneIndexes)
    {
        this.limbType=limbType;
        this.index=index;
        this.axis=axis;
        this.acrossSurfaceCount=acrossSurfaceCount;
        this.aroundSurfaceCount=aroundSurfaceCount;
        this.boneIndexes=boneIndexes;
        
        this.hunchAngle=0.0;
        
        Object.seal(this);
    }
    
    getRandomBoneIndex()
    {
        return(this.boneIndexes[genRandom.randomIndex(this.boneIndexes.length)]);
    }
};

//
// model skeleton class
//

class ModelSkeletonClass
{
    constructor()
    {
        this.bones=[];

        this.baseBoneIdx=0;

            // lists of bones that are
            // used for animation and
            // mesh building

        this.limbs=[];

            // animations

        this.lastAnimationTick=0;
        this.lastAnimationMillisec=1;
        this.lastAnimationFlip=false;          // supergumba -- temporary for random animations
        
        Object.seal(this);
    }
    
        //
        // close skeleton
        //

    close()
    {
        this.bones=[];
    }
    
        //
        // clone
        //
        
    clone()
    {
        let n,bone;
        let nBone=this.bones.length;
        
        let skeleton=new ModelSkeletonClass();
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            skeleton.bones.push(new ModelBoneClass(bone.name,bone.parentBoneIdx,bone.position));
        }
        
            // these list can just be copied,
            // they are read only
        
        skeleton.limbs=this.limbs;
        
            // recalc the bone animation values
            
        skeleton.precalcAnimationValues();
        
        return(skeleton);
    }
    
        //
        // find bone
        //
        
    findBoneIndex(name)
    {
        let n;
        let nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            if (this.bones[n].name===name) return(n);
        }
        
        return(-1);
    }
    
    findBone(name)
    {
        let idx=this.findBoneIndex(name);
        if (idx===-1) return(null);
        return(this.bones[idx]);
    }
    
    getDistanceBetweenBones(name1,name2)
    {
        let bone1=this.findBone(name1);
        let bone2=this.findBone(name2);
        
        if ((bone1===null) || (bone2===null)) return(null);
        return(new wsPoint(Math.abs(bone1.position.x-bone2.position.x),Math.abs(bone1.position.y-bone2.position.y),Math.abs(bone1.position.z-bone2.position.z)));
    }
    
    getBoneLimbType(boneIdx)
    {
        let n,limb;
        let nLimb=this.limbs.length;
        
        if (boneIdx===-1) return(-1);
        
        for (n=0;n!==nLimb;n++) {
            limb=this.limbs[n];
            if (limb.boneIndexes.indexOf(boneIdx)!==-1) return(limb.limbType);
        }
        
        return(-1);
    }
    
        //
        // bounds and center
        //
        
    getBounds(xBound,yBound,zBound)
    {
        let n,pos;
        let nBone=this.bones.length;
        
        xBound.min=xBound.max=0;
        yBound.min=yBound.max=0;
        zBound.min=zBound.max=0;
        
        for (n=0;n!==nBone;n++) {
            pos=this.bones[n].position;
            xBound.adjust(pos.x);
            yBound.adjust(pos.y);
            zBound.adjust(pos.z);
        }
    }
    
    getCenter()
    {
        let n;
        let nBone=this.bones.length;
        
        let pt=new wsPoint(0,0,0);
        
        for (n=0;n!==nBone;n++) {
            pt.addPoint(this.bones[n].position);
        }
        
        if (nBone===0) return(pt);
        
        pt.x=Math.trunc(pt.x/nBone);
        pt.y=Math.trunc(pt.y/nBone);
        pt.z=Math.trunc(pt.z/nBone);
        
        return(pt);
    }
    
        //
        // this runs a number of pre-calcs to setup
        // the skeleton for animation
        //
        
    precalcAnimationValues()
    {
        let n,k,bone,parentBone;
        let nBone=this.bones.length;
        
            // get the base bone
            
        this.baseBoneIdx=this.findBoneIndex('Base');
        if (this.baseBoneIdx===-1) this.baseBoneIdx=0;
        
            // build the vectors and children
            // lists
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            
                // vector to parent
                
            if (bone.parentBoneIdx!==-1) {
                parentBone=this.bones[bone.parentBoneIdx];
                bone.vectorFromParent.setFromSubPoint(bone.position,parentBone.position);
            }
            
                // children
                
            for (k=0;k!==nBone;k++) {
                if (n!==k) {
                    if (this.bones[k].parentBoneIdx===n) bone.childBoneIndexes.push(k);
                }
            }
        }
    }
    
        //
        // functions to handle clear, moving
        // and tweening the prev, next, and current
        // pose
        //
        
    moveNextPoseToPrevPose()
    {
        let n,bone;
        let nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            bone.prevPoseAngle.setFromPoint(bone.nextPoseAngle);
        }
    }
    
    clearNextPose()
    {
        let n,bone;
        let nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            bone.nextPoseAngle.setFromValues(0.0,0.0,0.0);
        }
    }
    
        //
        // animate bones
        //
    
    rotatePoseBoneRecursive(boneIdx,ang)
    {
        let n,nChild,bone,parentBone;
        let rotVector;
        
            // get the bone
            
        bone=this.bones[boneIdx];
        
            // if it has a parent, then rotate around
            // the parent, otherwise, the bone remains
            // at it's neutral position
            
        if (bone.parentBoneIdx!==-1) {
            parentBone=this.bones[bone.parentBoneIdx];
            
            rotVector=new wsPoint(bone.vectorFromParent.x,bone.vectorFromParent.y,bone.vectorFromParent.z);
            rotVector.rotate(ang);
            
            bone.curPosePosition.setFromAddPoint(parentBone.curPosePosition,rotVector);
        }
        else {
            bone.curPosePosition.setFromPoint(bone.position);
        }
        
            // need to pass this bone's rotation on
            // to it's children
            
        bone.curPoseAngle.addPoint(ang);
        
            // now move all children
        
        nChild=bone.childBoneIndexes.length;
        
        for (n=0;n!==nChild;n++) {
            this.rotatePoseBoneRecursive(bone.childBoneIndexes[n],bone.curPoseAngle);
        }
    }
    
    animate()
    {
        let n,bone;
        let nBone=this.bones.length;
        
            // the current factor
            
        let factor=1.0-((this.lastAnimationTick-view.timeStamp)/this.lastAnimationMillisec);

            // tween the current angles
            
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            bone.curPoseAngle.tween(bone.prevPoseAngle,bone.nextPoseAngle,factor);
        }
        
            // now move all the bones, starting at
            // the base
            
        this.rotatePoseBoneRecursive(this.baseBoneIdx,new wsPoint(0.0,0.0,0.0));
    }
    
    resetAnimation()
    {
        this.lastAnimationTick=0;
        this.lastAnimationMillisec=1;
        this.lastAnimationFlip=false;
    }
    
        //
        // pose utilities
        //
        
    poseSetLeg(limb,legOffset,walking)
    {
        let r,flipLeg;

        r=0.0;
        if (walking) r=genRandom.randomInBetween(20.0,40.0);
        
        flipLeg=((legOffset&0x1)!==0x0);
        if (this.lastAnimationFlip) flipLeg=!flipLeg;
        
        if (flipLeg) {
            this.bones[limb.boneIndexes[0]].nextPoseAngle.setFromValues(r,0.0,0.0);
            this.bones[limb.boneIndexes[1]].nextPoseAngle.setFromValues((r*0.7),0.0,0.0);
            this.bones[limb.boneIndexes[2]].nextPoseAngle.setFromValues(-(r*0.8),0.0,0.0);
        }
        else {
            this.bones[limb.boneIndexes[0]].nextPoseAngle.setFromValues(-r,0.0,0.0);
            this.bones[limb.boneIndexes[1]].nextPoseAngle.setFromValues(-(r*2.0),0.0,0.0);
            this.bones[limb.boneIndexes[2]].nextPoseAngle.setFromValues(0.0,0.0,0.0);
        }
    }
    
    poseSetArm(limb,armAngle,walking)
    {
        let r,z;
        
        r=0.0;
        if (walking) r=genRandom.randomInBetween(20.0,40.0);
        
        z=-armAngle;
        if (limb.side===modelLimbConstants.LIMB_SIDE_LEFT) z=-z;
        
        if (this.lastAnimationFlip) r=-r;
        
        this.bones[limb.boneIndexes[0]].nextPoseAngle.setFromValues(0.0,-r,z);
        this.bones[limb.boneIndexes[1]].nextPoseAngle.setFromValues(0.0,-(r*0.5),(z*0.9));
    }
    
    poseSetBody(limb,startAng,extraAng,hunchAngle)
    {
        let n,x;
        let nBone=limb.boneIndexes.length;

        x=genRandom.randomInBetween(startAng,extraAng);
        if (this.lastAnimationFlip) x=-x;
        
        x-=hunchAngle;
        
            // always start past hip bone as we don't
            // want to rotate against the base bone
            
        for (n=1;n!==nBone;n++) {
            this.bones[limb.boneIndexes[n]].nextPoseAngle.setFromValues(x,0.0,0.0);
            x*=0.75;
        }
    }
    
    poseSetWhip(limb)
    {
        let n,x,z;
        let nBone=limb.boneIndexes.length;

        if (this.lastAnimationFlip) {
            x=genRandom.randomInBetween(5,10);
            z=genRandom.randomInBetween(5,10);
        }
        else {
            x=-genRandom.randomInBetween(15,45);
            z=-genRandom.randomInBetween(15,45);
        }
            
        for (n=0;n!==nBone;n++) {
            this.bones[limb.boneIndexes[n]].nextPoseAngle.setFromValues(x,0.0,z);
            x*=1.1;
            z*=1.1;
        }
    }
    
    poseSetHeadSnout(limb)
    {
        let n,y;
        let nBone=limb.boneIndexes.length;

        y=genRandom.randomInBetween(5,10);
        if (this.lastAnimationFlip) y=-y;
            
        for (n=0;n!==nBone;n++) {
            this.bones[limb.boneIndexes[n]].nextPoseAngle.setFromValues(0.0,y,0.0);
            y*=1.1;
        }
    }
    
    poseSetHeadJaw(limb)
    {
        let n,x;
        let nBone=limb.boneIndexes.length;

        x=-genRandom.randomInBetween(25,40);
        if (this.lastAnimationFlip) x=-10;
            
        for (n=0;n!==nBone;n++) {
            this.bones[limb.boneIndexes[n]].nextPoseAngle.setFromValues(x,0.0,0.0);
        }
    }
   
        //
        // walk poses
        //
        
    walkNextPose()
    {
        let n,limb;
        let legOffset=0;
        let nLimb=this.limbs.length;
        
        let armLeftZAngle=45.0;
        let armRightZAngle=45.0;
        
        for (n=0;n!==nLimb;n++) {
            limb=this.limbs[n];
            
            switch (limb.limbType) {
                case modelLimbConstants.LIMB_TYPE_BODY:
                    this.poseSetBody(limb,5.0,5.0,limb.hunchAngle);
                    break;
                case modelLimbConstants.LIMB_TYPE_HEAD:
                    this.poseSetBody(limb,5.0,15.0,0.0);
                    break;
                case modelLimbConstants.LIMB_TYPE_LEG:
                    this.poseSetLeg(limb,legOffset,true);
                    legOffset++;
                    break;
                case modelLimbConstants.LIMB_TYPE_ARM:
                    if (limb.side===modelLimbConstants.LIMB_SIDE_LEFT) {
                        this.poseSetArm(limb,armLeftZAngle,true);
                        armLeftZAngle+=5.0;
                    }
                    else {
                        this.poseSetArm(limb,armRightZAngle,true);
                        armRightZAngle+=5.0;
                    }
                    break;
                case modelLimbConstants.LIMB_TYPE_WHIP:
                    this.poseSetWhip(limb);
                    break;
                case modelLimbConstants.LIMB_TYPE_HEAD_SNOUT:
                    this.poseSetHeadSnout(limb);
                    break;
                case modelLimbConstants.LIMB_TYPE_HEAD_JAW:
                    this.poseSetHeadJaw(limb);
                    break;
            }
        }
        
        this.lastAnimationFlip=!this.lastAnimationFlip;
    }
    
    walkPose()
    {
            // time for a new pose?
            
        if (view.timeStamp<this.lastAnimationTick) return;
        
            // next pose 3 seconds away (testing)
        
        this.lastAnimationMillisec=2000;
        this.lastAnimationTick=view.timeStamp+this.lastAnimationMillisec;
        
            // move current next pose to last pose
            
        this.moveNextPoseToPrevPose();
        
            // construct new pose

        this.clearNextPose();
        this.walkNextPose();
    }
    
        //
        // idle poses
        //
        
    idleNextPose()
    {
        let n,limb;
        let legOffset=0;
        let nLimb=this.limbs.length;
        
        let armLeftZAngle=45.0;
        let armRightZAngle=45.0;
        
        for (n=0;n!==nLimb;n++) {
            limb=this.limbs[n];
            
            switch (limb.limbType) {
                case modelLimbConstants.LIMB_TYPE_BODY:
                    this.poseSetBody(limb,3.0,3.0,limb.hunchAngle);
                    break;
                case modelLimbConstants.LIMB_TYPE_HEAD:
                    this.poseSetBody(limb,0.0,10.0,0.0);
                    break;
                case modelLimbConstants.LIMB_TYPE_LEG:
                    this.poseSetLeg(limb,legOffset,false);
                    legOffset++;
                    break;
                case modelLimbConstants.LIMB_TYPE_ARM:
                    if (limb.side===modelLimbConstants.LIMB_SIDE_LEFT) {
                        this.poseSetArm(limb,armLeftZAngle,false);
                        armLeftZAngle+=5.0;
                    }
                    else {
                        this.poseSetArm(limb,armRightZAngle,false);
                        armRightZAngle+=5.0;
                    }
                    break;
                case modelLimbConstants.LIMB_TYPE_WHIP:
                    this.poseSetWhip(limb);
                    break;
                case modelLimbConstants.LIMB_TYPE_HEAD_SNOUT:
                    this.poseSetHeadSnout(limb);
                    break;
                case modelLimbConstants.LIMB_TYPE_HEAD_JAW:
                    this.poseSetHeadJaw(limb);
                    break;
            }
        }
        
        this.lastAnimationFlip=!this.lastAnimationFlip;
    }
        
    idlePose()
    {
            // time for a new pose?
            
        if (view.timeStamp<this.lastAnimationTick) return;
        
            // next pose 4 seconds away
            
        this.lastAnimationMillisec=4000;
        this.lastAnimationTick=view.timeStamp+this.lastAnimationMillisec;
        
            // move current next pose to last pose
            
        this.moveNextPoseToPrevPose();
        
            // construct new pose

        this.clearNextPose();
        this.idleNextPose();
    }

}
