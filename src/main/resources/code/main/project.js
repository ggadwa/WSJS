export default class ProjectClass
{
    constructor(core)
    {
        this.core=core;
    }
    
        //
        // utilities
        //
        
    buildPerpendicularLineForLoop(startNodeKey,endNodeKey,lineLen)
    {
        this.core.game.map.path.buildPerpendicularLineForLoop(startNodeKey,endNodeKey,lineLen);
    }
    
        //
        // overrides
        //
        
    mapModels(mapName,singlePlayer)
    {
        return([]);
    }
    
    mapBitmaps(mapName,singlePlayer)
    {
        return([]);
    }
    
    mapSounds(mapName,singlePlayer)
    {
        return([]);
    }
    
    mapCube(mapName,cubeName)
    {
        return(null);
    }

    mapEffect(mapName,effectName)
    {
        return(null);
    }

    mapEntity(mapName,entityName)
    {
        return(null);
    }
    
    mapStartup(mapName)
    {
    }
        
}
