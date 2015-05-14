"use strict";

//
// gen random object
//

function GenRandomObject(seed)
{
        // the seed
        
    this.mwcW=(seed<<16)&0xFFFF;
    this.mwcZ=seed&0xFFFF;
    
        //
        // random numbers
        //

    this.random=function()
    {
        this.mwcZ=(36969*(this.mwcZ&0xFFFF)+(this.mwcZ>>16))&0xFFFFFFFF;
        this.mwcW=(18000*(this.mwcW&0xFFFF)+(this.mwcW>>16))&0xFFFFFFFF;
        var r=((this.mwcZ<<16)+this.mwcW)&0xFFFFFFFF;
        return((r/=0xFFFFFFFF)+0.5);
    };

    this.randomInt=function(startInt,extraInt)
    {
        return(startInt+Math.floor(this.random()*extraInt));
    };
    
    this.randomInBetween=function(startInt,endInt)
    {
        return(this.randomInt(startInt,(endInt-startInt)));
    };

}
