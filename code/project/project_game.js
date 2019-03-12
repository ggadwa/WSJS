export default class ProjectGameClass
{
    constructor(core)
    {
        this.core=core;
    }
        
        //
        // override this to get initial startup map for game
        // this returns a ProjectMapClass
        //
        
    getStartMap()
    {
    }
}
