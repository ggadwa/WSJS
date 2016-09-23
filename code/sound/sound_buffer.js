"use strict";

//
// sound buffer class
//

class SoundBufferClass
{
    constructor(name,buffer,maxDistance)
    {
        this.name=name;
        this.buffer=buffer;
        this.maxDistance=maxDistance;
        
        Object.seal(this);
    }
    
    close()
    {
        this.buffer=null;
    }
}
