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
        // override this to add entities to map
        //
        
    async loadEntities()
    {
    }
}
