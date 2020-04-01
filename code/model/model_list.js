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
        let propList=Object.keys(this.core.game.jsonEntityCache);
        let propName,name,model;
        let success,promises;
        
        promises=[];
        
        for (propName of propList) {
            name=this.core.game.jsonEntityCache[propName].setup.model;
            if (name===null) continue;
            
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
