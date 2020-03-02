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
        let loadModelList=this.core.map.json.models;
        let modelDef,model;
        let success,promises;
        
        if (loadModelList===undefined) {
            console.log('the map json lacks a model list');
            return(false);
        }
        
            // get all the models and wrap the
            // loading into a list of promises
            
        promises=[];
        
        for (modelDef of loadModelList) {
            model=new ModelClass(this.core,modelDef);
            model.initialize();
            promises.push(model.load());
            
            this.models.set(modelDef.name,model);
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
