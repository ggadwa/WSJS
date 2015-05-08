"use strict";

//
// model bone class
//

function ModelBoneObject(name,parentBoneIdx,position)
{
    this.name=name;
    this.parentBoneIdx=parentBoneIdx;
    this.position=position;
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

}
