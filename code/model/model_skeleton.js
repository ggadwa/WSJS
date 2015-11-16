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
    
    this.poseAngle=new wsPoint(0.0,0.0,0.0);
    this.posePosition=this.position.copy();
    
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
        // clear a pose
        //
        
    this.clearPoseBones=function()
    {
        var n,bone;
        var nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            
            bone.poseAngle.set(0.0,0.0,0.0);
            bone.posePosition.setFromPoint(bone.position);
        }
    };
    
        //
        // rotate pose bones
        //
    
    this.rotatePoseBoneSingle=function(boneIdx,ang)
    {
        var bone=this.bones[boneIdx];
        var parentBone=this.bones[bone.parentBoneIdx];

            // move the bone and get the offset
            // for later moves
            
        var offsetPnt=bone.posePosition.copy();
        bone.posePosition.rotateAroundPoint(parentBone.posePosition,ang);
        offsetPnt.subPoint(bone.posePosition);
        
            // remember the sum of all the
            // angles for vertex moves
            
        bone.poseAngle.addPoint(ang);

        return(offsetPnt);
    };

    this.movePoseBoneSingle=function(boneIdx,offsetPnt)
    {
        this.bones[boneIdx].posePosition.subPoint(offsetPnt);
    };
    
    this.rotatePoseBoneRecursive=function(boneIdx,ang,offsetPnt)
    {
        var n,bone;
        var nBone=this.bones.length;
        
            // move this bone from the last
            // rotational offset
            
        this.movePoseBoneSingle(boneIdx,offsetPnt);
        
            // rotate bone and update the offset
            // point for further children
        
        var nextOffsetPnt=this.rotatePoseBoneSingle(boneIdx,ang);
        nextOffsetPnt.addPoint(offsetPnt);
        
            // now move all children
            
        for (n=0;n!==nBone;n++) {
            if (n===boneIdx) continue;
            
            bone=this.bones[n];
            if (bone.parentBoneIdx===boneIdx) this.rotatePoseBoneRecursive(n,ang,nextOffsetPnt);
        }
    };

    this.rotatePoseBone=function(boneIdx,ang)
    {
        this.rotatePoseBoneRecursive(boneIdx,ang,new wsPoint(0,0,0));
    };
    
    
    
    
    // supergumba -- testing
    this.randomPose=function(poseCount)
    {
        var ang;
        var b=((poseCount&0x1)===0);
        
            // some random bone rotations for testing
            // supergumba -- DELETE LATER
            
        this.clearPoseBones();
            
        var ang=new wsAngle((b?40.0:-40.0),0.0,0.0);
        this.rotatePoseBone(this.findBoneIndex('Waist'),ang);
        
        ang.x*=0.75;
        this.rotatePoseBone(this.findBoneIndex('Torso'),ang);
        
        ang.x*=0.75;
        this.rotatePoseBone(this.findBoneIndex('Neck'),ang);

            // arm rotations
            // only rotate shoulder forward because torso
            // leans forward
        
        ang=new wsAngle((b?90.0:-90.0),0.0,(b?40.0:-40.0));
        this.rotatePoseBone(this.findBoneIndex('Left Elbow'),ang);
        ang.z=-ang.z;
        this.rotatePoseBone(this.findBoneIndex('Right Elbow'),ang);
        
            // leg rotations
        
        ang=new wsAngle((b?20.0:-20.0),0.0,0.0);
        this.rotatePoseBone(this.findBoneIndex('Left Knee'),ang);
        ang.z=-ang.z;
        this.rotatePoseBone(this.findBoneIndex('Right Knee'),ang);
        
        
    };

}
