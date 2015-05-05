"use strict";

//
// 
//
 
function genSkeletonBuild()
{
    var bones=this.model.skeleton.bones;
    
    var high=this.genRandom.randomInt(1000,2000);
    
    bones.push(new modelBoneObject(-1,new wsPoint(0,-high,0)));
    bones.push(new modelBoneObject(0,new wsPoint(-500,0,0)));
    bones.push(new modelBoneObject(0,new wsPoint(500,0,0)));
}
    
//
// gen skeleton object
//

function genSkeletonObject(model,genRandom)
{
    this.model=model;
    this.genRandom=genRandom;
    
        // functions
        
    this.build=genSkeletonBuild;
}
