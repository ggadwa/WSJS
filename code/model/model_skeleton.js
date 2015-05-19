"use strict";

//
// model bone class
//

function ModelBoneObject(name,parentBoneIdx,position)
{
    this.name=name;
    this.parentBoneIdx=parentBoneIdx;
    this.position=position;
    
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
    
    this.isHand=function()
    {
        return(this.name.indexOf('Hand')!==-1);
    };
    
    this.isFoot=function()
    {
        return(this.name.indexOf('Foot')!==-1);
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

}
