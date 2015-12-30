"use strict";

//
// model bone class
//

function ModelBoneObject(name,parentBoneIdx,position)
{
    this.name=name;
    this.parentBoneIdx=parentBoneIdx;
    this.position=position;
    
        // parenting
        
    this.vectorFromParent=new wsPoint(0.0,0,0,0,0);
    this.childBoneIndexes=[];
    
        // mesh creation
        
    this.gravityLockDistance=500;
    this.gravityPullDistance=4000;
    
        // pose
    
    this.curPoseAngle=new wsPoint(0.0,0.0,0.0);
    this.curPosePosition=this.position.copy();
    
    this.prevPoseAngle=new wsPoint(0.0,0.0,0.0);
    this.nextPoseAngle=new wsPoint(0.0,0.0,0.0);
    
        //
        // bone types
        //
        
    this.isBase=function()
    {
        return(this.name==='Base');
    };
    
        //
        // bone flags
        //
    
    this.hasParent=function()
    {
        return(this.parentBoneIdx!==-1);
    };
}

//
// limb class
//

function ModelLimbObject(limbType,boneIndexes)
{
    this.limbType=limbType;
    this.boneIndexes=boneIndexes;
};

//
// model skeleton class
//

function ModelSkeletonObject()
{
    this.bones=[];
    
    this.baseBoneIdx=0;
    
        // lists of bones that are
        // used for animation and
        // mesh building
    
    this.limbs=[];
    
        // animations
        
    this.lastAnimationTick=0;
    
        //
        // close skeleton
        //

    this.close=function()
    {
        this.bones=[];
    };
    
        //
        // clone
        //
        
    this.clone=function()
    {
        var n,bone;
        var nBone=this.bones.length;
        
        var skeleton=new ModelSkeletonObject();
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            skeleton.bones.push(new ModelBoneObject(bone.name,bone.parentBoneIdx,bone.position));
        }
        
            // these list can just be copied,
            // they are read only
        
        skeleton.limbs=this.limbs;
        
            // recalc the bone animation values
            
        skeleton.precalcAnimationValues();
        
        return(skeleton);
    };
    
        //
        // find bone
        //
        
    this.findBoneIndex=function(name)
    {
        var n;
        var nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            if (this.bones[n].name===name) return(n);
        }
        
        return(-1);
    };
    
    this.findBone=function(name)
    {
        var idx=this.findBoneIndex(name);
        if (idx===-1) return(null);
        return(this.bones[idx]);
    };
    
    this.getDistanceBetweenBones=function(name1,name2)
    {
        var bone1=this.findBone(name1);
        var bone2=this.findBone(name2);
        
        if ((bone1===null) || (bone2===null)) return(null);
        return(new wsPoint(Math.abs(bone1.position.x-bone2.position.x),Math.abs(bone1.position.y-bone2.position.y),Math.abs(bone1.position.z-bone2.position.z)));
    };
    
        //
        // bounds and center
        //
        
    this.getBounds=function(xBound,yBound,zBound)
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
    };
    
    this.getCenter=function()
    {
        var n;
        var nBone=this.bones.length;
        
        var pt=new wsPoint(0,0,0);
        
        for (n=0;n!==nBone;n++) {
            pt.addPoint(this.bones[n].position);
        }
        
        if (nBone===0) return(pt);
        
        pt.x=Math.floor(pt.x/nBone);
        pt.y=Math.floor(pt.y/nBone);
        pt.z=Math.floor(pt.z/nBone);
        
        return(pt);
    };
    
        //
        // this runs a number of pre-calcs to setup
        // the skeleton for animation
        //
        
    this.precalcAnimationValues=function()
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
    };
    
        //
        // functions to handle clear, moving
        // and tweening the prev, next, and current
        // pose
        //
        
    this.moveNextPoseToPrevPose=function()
    {
        var n,bone;
        var nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            bone.prevPoseAngle.setFromPoint(bone.nextPoseAngle);
        }
    };
    
    this.clearNextPose=function()
    {
        var n,bone;
        var nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            bone.nextPoseAngle.set(0.0,0.0,0.0);
        }
    };
    
        //
        // animate bones
        //
    
    this.rotatePoseBoneRecursive=function(boneIdx,ang)
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
            rotVector.rotateAroundPoint(null,ang);
            
            bone.curPosePosition.setFromAddPoint(parentBone.curPosePosition,rotVector);
        }
        else {
            bone.curPosePosition.setFromPoint(bone.position);
        }
        
            // need to pass this bone's rotation on
            // to it's children
            
        var nextAng=ang.copy();
        nextAng.addPoint(bone.curPoseAngle);
        
            // set the bone's angle
            
        bone.curPoseAngle.setFromPoint(nextAng);
        
            // now move all children
        
        var nChild=bone.childBoneIndexes.length;
        
        for (n=0;n!==nChild;n++) {
            this.rotatePoseBoneRecursive(bone.childBoneIndexes[n],nextAng);
        }
    };
    
    this.animate=function(view)
    {
        var n,bone;
        var nBone=this.bones.length;
        
            // the current factor
            
        var factor=1.0-((this.lastAnimationTick-view.timeStamp)/3000);

            // tween the current angles
            
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            bone.curPoseAngle.tween(bone.prevPoseAngle,bone.nextPoseAngle,factor);
        }
        
            // now move all the bones, starting at
            // the base
            
        this.rotatePoseBoneRecursive(this.baseBoneIdx,new wsPoint(0.0,0.0,0.0));
    };
    
    
    
    
    // supergumba -- testing
    
    this.randomNextPose=function(view)
    {
        var n,k,limb,boneIndexList;
        var r,x,z;
        var nLimb=this.limbs.length;
        
        for (n=0;n!==nLimb;n++) {
            limb=this.limbs[n];
            if ((limb.limbType===LIMB_TYPE_BODY) || (limb.limbType===LIMB_TYPE_HEAD)) continue;
            
            boneIndexList=this.limbs[n].boneIndexes;
            
            r=view.genRandom.randomInBetween(-45.0,90.0);

            if (limb.limbType===LIMB_TYPE_ARM) {
                x=0.0;
                z=r;
            }
            else {
                x=r;
                z=0.0;
            }
            
            for (k=0;k!==boneIndexList.length;k++) {
                this.bones[boneIndexList[k]].nextPoseAngle.set(x,0.0,z);
                x*=0.75;
                z*=0.75;
            }
        
        }
    };
    
    this.randomPose=function(view)
    {
            // time for a new pose?
            
        if (view.timeStamp<this.lastAnimationTick) return;
        
            // next pose 3 seconds away (testing)
            
        this.lastAnimationTick=view.timeStamp+3000;
        
            // move current next pose to last pose
            
        this.moveNextPoseToPrevPose();
        
            // construct new pose

        this.clearNextPose();
        this.randomNextPose(view);
    };

}
