"use strict";

//
// model bone class
//

function ModelBoneObject(name,parentBoneIdx,position)
{
    this.name=name;
    this.parentBoneIdx=parentBoneIdx;
    this.position=position;
    
        // mesh creation
        
    this.gravityLockDistance=500;
    this.gravityPullDistance=4000;
    
        // pose
    
    this.curPoseAngle=new wsPoint(0.0,0.0,0.0);
    this.curPosePosition=this.position.copy();
    this.curPoseVector=new wsPoint(0,0,0);
    
    this.prevPoseAngle=new wsPoint(0.0,0.0,0.0);
    this.prevPosePosition=this.position.copy();
    
    this.nextPoseAngle=new wsPoint(0.0,0.0,0.0);
    this.nextPosePosition=this.position.copy();
    
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
// model skeleton class
//

function ModelSkeletonObject()
{
    this.bones=[];
    
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
            bone.prevPosePosition.setFromPoint(bone.nextPosePosition);
        }
    };
    
    this.clearNextPose=function()
    {
        var n,bone;
        var nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            
            bone.nextPoseAngle.set(0.0,0.0,0.0);
            bone.nextPosePosition.setFromPoint(bone.position);
        }
    };
    
    this.tweenCurrentPose=function(factor)
    {
        var n,bone;
        var nBone=this.bones.length;
        
            // move the bones
            // we also setup a vector used to later move vertexes
            
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            
            bone.curPoseAngle.tween(bone.prevPoseAngle,bone.nextPoseAngle,factor);
            bone.curPosePosition.tween(bone.prevPosePosition,bone.nextPosePosition,factor);
            
            bone.curPoseVector.setFromSubPoint(bone.curPosePosition,bone.position);
        }
    };
    
        //
        // rotate pose bones
        //
    
    this.rotateNextPoseBoneSingle=function(boneIdx,ang)
    {
        var bone=this.bones[boneIdx];
        var parentBone=this.bones[bone.parentBoneIdx];

            // move the bone and get the offset
            // for later moves
            
        var offsetPnt=bone.nextPosePosition.copy();
        bone.nextPosePosition.rotateAroundPoint(parentBone.nextPosePosition,ang);
        offsetPnt.subPoint(bone.nextPosePosition);
        
            // remember the sum of all the
            // angles for vertex moves
            
        bone.nextPoseAngle.addPoint(ang);

        return(offsetPnt);
    };

    this.moveNextPoseBoneSingle=function(boneIdx,offsetPnt)
    {
        this.bones[boneIdx].nextPosePosition.subPoint(offsetPnt);
    };
    
    this.rotateNextPoseBoneRecursive=function(boneIdx,root,ang,offsetPnt)
    {
        var n,bone;
        var nBone=this.bones.length;
        
            // if this is the root bone (the first bone
            // in the move) then it just sets the rotation angle
            // and no offset moves, as the first bone just turns
            // other bones and not around it's parent
            
        if (root) {
            bone=this.bones[boneIdx];
            bone.nextPoseAngle.addPoint(ang);
            nextOffsetPnt=new wsPoint(0,0,0);
        }
        else {
            
                // move this bone from the last
                // rotational offset

            this.moveNextPoseBoneSingle(boneIdx,offsetPnt);

                // rotate bone and update the offset
                // point for further children, if this
                // bone is the root, we only set the rotation
                // (it doesn't rotate around it's parent, only
                // rotates the children)

            var nextOffsetPnt=this.rotateNextPoseBoneSingle(boneIdx,ang);
            nextOffsetPnt.addPoint(offsetPnt);
        }
        
            // now move all children
            
        for (n=0;n!==nBone;n++) {
            if (n===boneIdx) continue;
            
            bone=this.bones[n];
            if (bone.parentBoneIdx===boneIdx) this.rotateNextPoseBoneRecursive(n,false,ang,nextOffsetPnt);
        }
    };

    this.rotateNextPoseBone=function(boneIdx,ang)
    {
        this.rotateNextPoseBoneRecursive(boneIdx,true,ang,null);
    };
    
    
    
    
    // supergumba -- testing
    
    this.walkPose1=function()
    {
        this.clearNextPose();
            
        var ang=new wsAngle(70.0,0.0,0.0);
        this.rotateNextPoseBone(this.findBoneIndex('Left Hip'),ang);
        ang=new wsAngle(-60.0,0.0,0.0);
        this.rotateNextPoseBone(this.findBoneIndex('Right Hip'),ang);
        
        ang=new wsAngle(-95.0,0.0,0.0);
        this.rotateNextPoseBone(this.findBoneIndex('Left Knee'),ang);
        ang=new wsAngle(-15.0,0.0,0.0);
        this.rotateNextPoseBone(this.findBoneIndex('Right Knee'),ang);
        
        var ang=new wsAngle(0.0,0.0,40.0);
        this.rotateNextPoseBone(this.findBoneIndex('Left Elbow'),ang);
        ang=new wsAngle(0.0,0.0,-40.0);
        this.rotateNextPoseBone(this.findBoneIndex('Right Elbow'),ang);
    };
    
    this.walkPose2=function()
    {
        this.clearNextPose();
            
        var ang=new wsAngle(-60.0,0.0,0.0);
        this.rotateNextPoseBone(this.findBoneIndex('Left Hip'),ang);
        ang=new wsAngle(70.0,0.0,0.0);
        this.rotateNextPoseBone(this.findBoneIndex('Right Hip'),ang);
        
        ang=new wsAngle(-15.0,0.0,0.0);
        this.rotateNextPoseBone(this.findBoneIndex('Left Knee'),ang);
        ang=new wsAngle(-95.0,0.0,0.0);
        this.rotateNextPoseBone(this.findBoneIndex('Right Knee'),ang);
    };
    
    this.walkPose=function(flip)
    {
            // testing to turn off animation

        this.clearNextPose();
        this.moveNextPoseToPrevPose();
        
        /*
            // we just hard setup some poses here, this is
            // ALL supergumba temporary code
            
            // create the previous pose
            
        if (flip) {
            this.walkPose1();
        }
        else {
            this.walkPose2();
        }
        this.moveNextPoseToPrevPose();
        
            // and the opposite for the next pose
            
        if (flip) {
            this.walkPose2();
        }
        else {
            this.walkPose1();
        }
        */
    };

}
