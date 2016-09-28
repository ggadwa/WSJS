"use strict";

//
// sound buffer class
//

class SoundBufferClass
{
    constructor(buffer,maxDistance)
    {
        this.buffer=buffer;
        this.maxDistance=maxDistance;
        
        Object.seal(this);
    }
    
    close()
    {
        this.buffer=null;
    }
}
