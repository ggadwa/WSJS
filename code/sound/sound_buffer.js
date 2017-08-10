//
// sound buffer class
//

export default class SoundBufferClass
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
