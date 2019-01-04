export default class GameClass
{
    constructor(view,map)
    {
        this.view=view;
        this.map=map;
    }
    
        //
        // override this to get initial startup map for game
        // this returns a ProjectMapClass
        //
        
    getStartMap()
    {
    }
}
