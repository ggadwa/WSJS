"use strict";

//
// gen random object
//

class GenRandomClass
{
    constructor(seed)
    {
        this.mwcW=(seed<<16)&0xFFFF;
        this.mwcZ=seed&0xFFFF;
        
        Object.seal(this);
    }
    
        //
        // random numbers
        //

    random()
    {
        this.mwcZ=(36969*(this.mwcZ&0xFFFF)+(this.mwcZ>>16))&0xFFFFFFFF;
        this.mwcW=(18000*(this.mwcW&0xFFFF)+(this.mwcW>>16))&0xFFFFFFFF;
        var r=((this.mwcZ<<16)+this.mwcW)&0xFFFFFFFF;
        return((r/=0xFFFFFFFF)+0.5);
    }

    randomInt(startInt,extraInt)
    {
        return(startInt+Math.trunc(this.random()*extraInt));
    }
    
    randomIndex(maxIndex)
    {
        return(Math.trunc(this.random()*maxIndex));
    }
    
    randomPercentage(percentage)
    {
        return(this.random()<percentage);
    }
    
    randomInBetween(startInt,endInt)
    {
        return(this.randomInt(startInt,(endInt-startInt)));
    }

}

var genRandom=new GenRandomClass(config.SEED);
