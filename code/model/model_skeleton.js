"use strict";

//
// close skeleton
//

function modelSkeletonClose()
{
    this.bones=[];
}

//
// model bone object
//

function modelBoneObject(parentBoneIdx,position)
{
    this.parentBoneIdx=parentBoneIdx;
    this.position=position;
}

//
// model skeleton object
//

function modelSkeletonObject()
{
    this.bones=[];
    
        // testing
    
    this.bones.push(new modelBoneObject(-1,new wsPoint(0,-1000,0)));
    this.bones.push(new modelBoneObject(0,new wsPoint(-500,0,0)));
    this.bones.push(new modelBoneObject(0,new wsPoint(500,0,0)));
    
    this.close=modelSkeletonClose;
}
