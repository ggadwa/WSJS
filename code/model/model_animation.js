//
// model animation class
//

export default class ModelAnimationClass
{
    constructor(name)
    {
        this.name=name;
        
        this.channels=[];

        Object.seal(this);
    }
}
