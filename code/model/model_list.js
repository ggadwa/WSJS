import ModelClass from '../model/model.js';

//
// core model list class
//

export default class ModelListClass
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
        return(true);
    }

    release()
    {
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
        
    async loadAllModels()
    {
        let entity,jsonEntity;
        let name,model,modelSet;
        let success,promises;
        let game=this.core.game;
        
            // look through all the entities and get
            // a Set of models (to eliminate duplicates)
        
        modelSet=new Set();
        
        for (entity of this.core.map.entityList.entities) {
            jsonEntity=game.jsonEntityCache.get(entity.jsonName);
            if (jsonEntity!==null) game.addJsonObjectToLoadSet(modelSet,entity.data,null,false,['model'],jsonEntity);
        }
        
            // now build into a promise list
            
        promises=[];
        
        for (name of modelSet) {
            model=new ModelClass(this.core,{"name":name});
            model.initialize();
            promises.push(model.load());
            
            this.models.set(name,model);
        }

            // and await them all
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    (values)=>{
                        success=!values.includes(false);
                    },
                );

        return(success);
    }
    
}
