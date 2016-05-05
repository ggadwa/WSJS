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
        this.gravityScale=new wsPoint(1.0,1.0,1.0);

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
// limb class
//

class ModelLimbClass
{
    constructor(limbType,axis,acrossSurfaceCount,aroundSurfaceCount,boneIndexes)
    {
        this.limbType=limbType;
        this.axis=axis;
        this.acrossSurfaceCount=acrossSurfaceCount;
        this.aroundSurfaceCount=aroundSurfaceCount;
        this.boneIndexes=boneIndexes;
        
        Object.seal(this);
    }
    
    getRandomBoneIndex(genRandom)
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
        var n,bone;
        var nBone=this.bones.length;
        
        var skeleton=new ModelSkeletonClass();
        
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
        var n;
        var nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            if (this.bones[n].name===name) return(n);
        }
        
        return(-1);
    }
    
    findBone(name)
    {
        var idx=this.findBoneIndex(name);
        if (idx===-1) return(null);
        return(this.bones[idx]);
    }
    
    getDistanceBetweenBones(name1,name2)
    {
        var bone1=this.findBone(name1);
        var bone2=this.findBone(name2);
        
        if ((bone1===null) || (bone2===null)) return(null);
        return(new wsPoint(Math.abs(bone1.position.x-bone2.position.x),Math.abs(bone1.position.y-bone2.position.y),Math.abs(bone1.position.z-bone2.position.z)));
    }
    
    getBoneLimbType(boneIdx)
    {
        var n,limb;
        var nLimb=this.limbs.length;
        
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
        var n,pos;
        var nBone=this.bones.length;
        
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
        var n;
        var nBone=this.bones.length;
        
        var pt=new wsPoint(0,0,0);
        
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
        var n,k,bone,parentBone;
        var nBone=this.bones.length;
        
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
        var n,bone;
        var nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            bone.prevPoseAngle.setFromPoint(bone.nextPoseAngle);
        }
    }
    
    clearNextPose()
    {
        var n,bone;
        var nBone=this.bones.length;
        
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
        var n,bone,parentBone;
        
            // get the bone
            
        bone=this.bones[boneIdx];
        
            // if it has a parent, then rotate around
            // the parent, otherwise, the bone remains
            // at it's neutral position
            
        if (bone.parentBoneIdx!==-1) {
            parentBone=this.bones[bone.parentBoneIdx];
            
            var rotVector=new wsPoint(bone.vectorFromParent.x,bone.vectorFromParent.y,bone.vectorFromParent.z);
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
        
        var nChild=bone.childBoneIndexes.length;
        
        for (n=0;n!==nChild;n++) {
            this.rotatePoseBoneRecursive(bone.childBoneIndexes[n],bone.curPoseAngle);
        }
    }
    
    animate(view)
    {
        var n,bone;
        var nBone=this.bones.length;
        
            // the current factor
            
        var factor=1.0-((this.lastAnimationTick-view.timeStamp)/this.lastAnimationMillisec);

            // tween the current angles
            
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            bone.curPoseAngle.tween(bone.prevPoseAngle,bone.nextPoseAngle,factor);
        }
        
            // now move all the bones, starting at
            // the base
            
        this.rotatePoseBoneRecursive(this.baseBoneIdx,new wsPoint(0.0,0.0,0.0));
    }
    
        //
        // pose utilities
        //
        
    poseSetLeg(view,limb,walking)
    {
        var r,backLeg;

        r=0.0;
        if (walking) r=view.genRandom.randomInBetween(20.0,40.0);
        
        backLeg=(limb.limbType===LIMB_TYPE_LEG_LEFT);
        if (this.lastAnimationFlip) backLeg=!backLeg;
        
        if (backLeg) {
            this.bones[limb.boneIndexes[0]].nextPoseAngle.setFromValues(-r,0.0,0.0);
            this.bones[limb.boneIndexes[1]].nextPoseAngle.setFromValues(-(r*0.7),0.0,0.0);
            this.bones[limb.boneIndexes[2]].nextPoseAngle.setFromValues(-(r*0.5),0.0,0.0);
        }
        else {
            this.bones[limb.boneIndexes[0]].nextPoseAngle.setFromValues(r,0.0,0.0);
            this.bones[limb.boneIndexes[1]].nextPoseAngle.setFromValues((r*2.0),0.0,0.0);
            this.bones[limb.boneIndexes[2]].nextPoseAngle.setFromValues(0.0,0.0,0.0);
        }
    }
    
    poseSetArm(view,limb,armAngle,walking)
    {
        var r,z,backArm;

        r=0.0;
        if (walking) r=view.genRandom.randomInBetween(20.0,40.0);
        
        z=-armAngle;
        if (limb.limbType===LIMB_TYPE_ARM_LEFT) z=-z;
        
        if (this.lastAnimationFlip) r=-r;
        
        this.bones[limb.boneIndexes[0]].nextPoseAngle.setFromValues(0.0,r,z);
        this.bones[limb.boneIndexes[1]].nextPoseAngle.setFromValues(0.0,(r*0.5),(z*0.9));
    }
    
    poseSetBody(view,limb,startAng,extraAng)
    {
        var n,x;
        var nBone=limb.boneIndexes.length;

        x=view.genRandom.randomInBetween(startAng,extraAng);
        if (this.lastAnimationFlip) x=-x;
            
        for (n=0;n!==nBone;n++) {
            this.bones[limb.boneIndexes[n]].nextPoseAngle.setFromValues(x,0.0,0.0);
            x*=0.75;
        }
    }
    
    poseSetWhip(view,limb)
    {
        var n,x,z;
        var nBone=limb.boneIndexes.length;

        x=view.genRandom.randomInBetween(15,45);
        z=view.genRandom.randomInBetween(15,45);
        if (this.lastAnimationFlip) {
            x=-x;
            z=-z;
        }
            
        for (n=0;n!==nBone;n++) {
            this.bones[limb.boneIndexes[n]].nextPoseAngle.setFromValues(x,0.0,z);
            x*=1.1;
            z*=1.1;
        }
    }
    
        //
        // walk poses
        //
        
    walkNextPose(view,modelType)
    {
        var n,limb;
        var nLimb=this.limbs.length;
        
        var armLeftZAngle=45.0;
        var armRightZAngle=45.0;
        
        for (n=0;n!==nLimb;n++) {
            limb=this.limbs[n];
            
            switch (limb.limbType) {
                case LIMB_TYPE_BODY:
                    if (modelType==MODEL_TYPE_HUMANOID) {
                        this.poseSetBody(view,limb,5.0,5.0);
                        break;
                    }
                    if (modelType===MODEL_TYPE_BLOB) {
                        this.poseSetBody(view,limb,15.0,30.0);
                        break;
                    }
                    break;
                case LIMB_TYPE_HEAD:
                    if (modelType===MODEL_TYPE_ANIMAL) {
                        this.poseSetBody(view,limb,5.0,15.0);
                        break;
                    }
                    break;
                case LIMB_TYPE_LEG_LEFT:
                case LIMB_TYPE_LEG_RIGHT:
                    this.poseSetLeg(view,limb,true);
                    break;
                case LIMB_TYPE_ARM_LEFT:
                    this.poseSetArm(view,limb,armLeftZAngle,true);
                    armLeftZAngle+=5.0;
                    break;
                case LIMB_TYPE_ARM_RIGHT:
                    this.poseSetArm(view,limb,armRightZAngle,true);
                    armRightZAngle+=5.0;
                    break;
                case LIMB_TYPE_WHIP:
                    this.poseSetWhip(view,limb);
                    break;
            }
        }
        
        this.lastAnimationFlip=!this.lastAnimationFlip;
    }
    
    walkPose(view,modelType)
    {
            // time for a new pose?
            
        if (view.timeStamp<this.lastAnimationTick) return;
        
            // next pose 3 seconds away (testing)
        
        this.lastAnimationMillisec=3000;
        this.lastAnimationTick=view.timeStamp+this.lastAnimationMillisec;
        
            // move current next pose to last pose
            
        this.moveNextPoseToPrevPose();
        
            // construct new pose

        this.clearNextPose();
        this.walkNextPose(view,modelType);
    }
    
        //
        // idle poses
        //
        
    idleNextPose(view,modelType)
    {
        var n,limb;
        var nLimb=this.limbs.length;
        
        var armLeftZAngle=45.0;
        var armRightZAngle=45.0;
        
        for (n=0;n!==nLimb;n++) {
            limb=this.limbs[n];
            
            switch (limb.limbType) {
                case LIMB_TYPE_BODY:
                    if (modelType==MODEL_TYPE_HUMANOID) {
                        this.poseSetBody(view,limb,3.0,3.0);
                        break;
                    }
                    if (modelType===MODEL_TYPE_BLOB) {
                        this.poseSetBody(view,limb,5.0,5.0);
                        break;
                    }
                    break;
                case LIMB_TYPE_HEAD:
                    if (modelType===MODEL_TYPE_ANIMAL) {
                        this.poseSetBody(view,limb,0.0,10.0);
                        break;
                    }
                    break;
                case LIMB_TYPE_LEG_LEFT:
                case LIMB_TYPE_LEG_RIGHT:
                    this.poseSetLeg(view,limb,false);
                    break;
                case LIMB_TYPE_ARM_LEFT:
                    this.poseSetArm(view,limb,armLeftZAngle,false);
                    armLeftZAngle+=5.0;
                    break;
                case LIMB_TYPE_ARM_RIGHT:
                    this.poseSetArm(view,limb,armRightZAngle,false);
                    armRightZAngle+=5.0;
                    break;
                case LIMB_TYPE_WHIP:
                    this.poseSetWhip(view,limb);
                    break;
            }
        }
        
        this.lastAnimationFlip=!this.lastAnimationFlip;
    }
        
    idlePose(view,modelType)
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
        this.idleNextPose(view,modelType);
    }

}
