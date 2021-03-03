//
// model animation channel pose class
//

export default class ModelAnimationChannelPoseClass
{
    constructor(tick,data)
    {
        this.tick=tick;     // time for this pose, in milliseconds
        this.data=data;     // an array of 3 (translation/scale) or 4 (rotation) components
        
        Object.seal(this);
    }
}
