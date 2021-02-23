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
        let entity,jsonEntity;
        let name,model,modelSet;
        let game=this.core.game;
        
            // look through all the entities and get
            // a Set of models (to eliminate duplicates)
        
        modelSet=new Set();
        
        for (entity of this.core.game.map.entityList.entities) {
            jsonEntity=game.entityCache.getJson(entity.jsonName);
            if (jsonEntity!==null) game.addJsonObjectToLoadSet(modelSet,entity.data,null,false,['model'],jsonEntity);
        }
        
            // now build the model map
            
        for (name of modelSet) {
            model=new ModelClass(this.core,{"name":name});
            model.initialize();
            this.models.set(name,model);
        }
    }
    
}
