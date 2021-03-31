import ModelClass from '../model/model.js';

//
// map model list class
//

export default class MapModelListClass
{
    constructor(core)
    {
        this.core=core;
        
        this.models=new Map();

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        this.models.clear();
        
        return(true);
    }

    release()
    {
        let model;
        
        for (model of this.models.values()) {
            model.release();
        }
        
        this.models.clear();
    }
    
        //
        // get a model
        //
        
    get(name)
    {
        return(this.models.get(name));
    }
    
        //
        // loading
        //
        
    buildModelList()
    {
        let name,model;
        let modelList=this.core.project.mapModels(this.core.game.map.name,(this.core.game.multiplayerMode===this.core.game.MULTIPLAYER_MODE_NONE));
        
        for (name of modelList) {
            model=new ModelClass(this.core,{"name":name});
            model.initialize();
            this.models.set(name,model);
        }
    }
    
}
