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

function modelBoneObject(name,parentBoneIdx,position)
{
    this.name=name;
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
