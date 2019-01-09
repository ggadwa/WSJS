export default class ProjectMapClass
{
    constructor(view,map)
    {
        this.view=view;
        this.map=map;
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
    }
    
    release()
    {
    }
    
        //
        // override this to load in map
        //
        
    async loadMap()
    {
    }
    
        //
        // override these to deal with where entities are
        // place in the map
        //
        
    setupPlayer(player)
    {
    }
}
