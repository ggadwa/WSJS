import ImportMapClass from '../../code/import/import_map.js';

export default class ProjectMapClass
{
    constructor(core)
    {
        this.core=core;
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
        // general info
        //
        
    getSetup()
    {
        return(this.core.setup);
    }
    
    getCamera()
    {
        return(this.core.camera);
    }
    
        //
        // override this give the import settings
        // for this map
        //
        
    getImportSettings()
    {
        return(null);
    }
    
        //
        // main map loader
        //
    
    async loadMap()
    {
        let importMap=new ImportMapClass(this.core);
        return(await importMap.load(this.getImportSettings()));
    }
}
