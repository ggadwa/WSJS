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
    
        // functions
    
    this.close=modelSkeletonClose;
}
