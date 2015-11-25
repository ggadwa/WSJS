"use strict";

//
// model bone class
//

function ModelBoneObject(name,parentBoneIdx,position)
{
    this.name=name;
    this.parentBoneIdx=parentBoneIdx;
    this.position=position;
    
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
    
    this.isHead=function()
    {
        return(this.name==='Head');
    };
    
    this.isNeck=function()
    {
        return(this.name==='Neck');
    };
    
    this.isTorsoTop=function()
    {
        return(this.name==='Torso Top');
    };
    
    this.isTorso=function()
    {
        return(this.name==='Torso');
    };
    
    this.isWaist=function()
    {
        return(this.name==='Waist');
    };
    
    this.isHip=function()
    {
        return(this.name==='Hip');
    };
    
    this.isHand=function()
    {
        return(this.name.indexOf('Hand')!==-1);
    };
    
    this.isWrist=function()
    {
        return(this.name.indexOf('Wrist')!==-1);
    };
    
    this.isElbow=function()
    {
        return(this.name.indexOf('Elbow')!==-1);
    };
    
    this.isShoulder=function()
    {
        return(this.name.indexOf('Shoulder')!==-1);
    };
    
    this.isFoot=function()
    {
        return(this.name.indexOf('Foot')!==-1);
    };
    
    this.isAnkle=function()
    {
        return(this.name.indexOf('Ankle')!==-1);
    };
    
    this.isKnee=function()
    {
        return(this.name.indexOf('Knee')!==-1);
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
    
    this.tweenCurrentPose=function(prevTimeStamp,nextTimeStamp,curTimeStamp)
    {
        var n,bone;
        var nBone=this.bones.length;
        
            // get the factor
            
        var factor=(curTimeStamp-prevTimeStamp)/(nextTimeStamp-prevTimeStamp);
        
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
    
    this.rotateNextPoseBoneRecursive=function(boneIdx,ang,offsetPnt)
    {
        var n,bone;
        var nBone=this.bones.length;
        
            // move this bone from the last
            // rotational offset
            
        this.moveNextPoseBoneSingle(boneIdx,offsetPnt);
        
            // rotate bone and update the offset
            // point for further children
        
        var nextOffsetPnt=this.rotateNextPoseBoneSingle(boneIdx,ang);
        nextOffsetPnt.addPoint(offsetPnt);
        
            // now move all children
            
        for (n=0;n!==nBone;n++) {
            if (n===boneIdx) continue;
            
            bone=this.bones[n];
            if (bone.parentBoneIdx===boneIdx) this.rotateNextPoseBoneRecursive(n,ang,nextOffsetPnt);
        }
    };

    this.rotateNextPoseBone=function(boneIdx,ang)
    {
        this.rotateNextPoseBoneRecursive(boneIdx,ang,new wsPoint(0,0,0));
    };
    
    
    
    
    // supergumba -- testing
    this.randomNextPose=function(view)
    {
        var ang,x,z;
        
            // some random bone rotations for testing
            // supergumba -- DELETE LATER
            
            // move current next pose to previous pose
            
        this.moveNextPoseToPrevPose();
        
            // create the next pose
            
        this.clearNextPose();
        
            // spine rotations
            
        x=view.genRandom.randomInt(-40,80);
            
        var ang=new wsAngle(x,0.0,0.0);
        this.rotateNextPoseBone(this.findBoneIndex('Waist'),ang);
        
        ang.x*=0.75;
        this.rotateNextPoseBone(this.findBoneIndex('Torso'),ang);
        
        ang.x*=0.75;
        this.rotateNextPoseBone(this.findBoneIndex('Neck'),ang);

            // arm rotations
        
        x=view.genRandom.randomInt(-90,180);
        z=view.genRandom.randomInt(-40,80);
        
        ang=new wsAngle(x,0.0,z);
        this.rotateNextPoseBone(this.findBoneIndex('Left Elbow'),ang);
        ang.z=-ang.z;
        this.rotateNextPoseBone(this.findBoneIndex('Right Elbow'),ang);
        
        z=view.genRandom.randomInt(-40,80);
        
        ang=new wsAngle(0.0,0.0,z);
        this.rotateNextPoseBone(this.findBoneIndex('Left Wrist'),ang);
        ang.z=-ang.z;
        this.rotateNextPoseBone(this.findBoneIndex('Right Wrist'),ang);
        
            // leg rotations
            
        x=view.genRandom.randomInt(-50,100);
        
        ang=new wsAngle(x,0.0,0.0);
        this.rotateNextPoseBone(this.findBoneIndex('Left Knee'),ang);
        ang.x=-ang.x;
        this.rotateNextPoseBone(this.findBoneIndex('Right Knee'),ang);
        
        x=view.genRandom.randomInt(-20,40);
        
        ang=new wsAngle(x,0.0,0.0);
        this.rotateNextPoseBone(this.findBoneIndex('Left Ankle'),ang);
        ang.x=-ang.x;
        this.rotateNextPoseBone(this.findBoneIndex('Right Ankle'),ang);
        
    };

}
