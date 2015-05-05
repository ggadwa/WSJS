"use strict";

//
// random numbers
//

function genRandomRandom()
{
    this.mwcZ=(36969*(this.mwcZ&0xFFFF)+(this.mwcZ>>16))&0xFFFFFFFF;
    this.mwcW=(18000*(this.mwcW&0xFFFF)+(this.mwcW>>16))&0xFFFFFFFF;
    var r=((this.mwcZ<<16)+this.mwcW)&0xFFFFFFFF;
    return((r/=0xFFFFFFFF)+0.5);
}

function genRandomRandomInt(startInt,extraInt)
{
    return(startInt+Math.floor(this.random()*extraInt));
}

function genRandomRandomInBetween(startInt,endInt)
{
    return(this.randomInt(startInt,(endInt-startInt)));
}

//
// gen random object
//

function genRandomObject(seed)
{
        // the seed
        
    this.mwcW=(seed<<16)&0xFFFF;
    this.mwcZ=seed&0xFFFF;
    
        // functions
        
    this.random=genRandomRandom;
    this.randomInt=genRandomRandomInt;
    this.randomInBetween=genRandomRandomInBetween;
}
