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
        // add and get a bitmap
        //
        
    add(name,importSettings)
    {
        let model;
            
            // already in list?
            
        if (this.models.has(name)) return(this.models.get(name));
        
            // add new one to list, will be loaded
            // by another call that force loads unloaded
            // models
                    
        model=new ModelClass(this.core,importSettings);
        model.initialize();
        this.models.set(name,model);
        
        return(model);
    }

    get(name)
    {
        return(this.models.get(name));
    }
    
        //
        // loading
        //
        
    async loadAllModels()
    {
        let keyIter,rtn,model;
        let success,promises=[];
        
            // gather all the promises
            
        keyIter=this.models.keys();
        
        while (true) {
            rtn=keyIter.next();
            if (rtn.done) break;
            
            model=this.models.get(rtn.value);
            if (!model.loaded) promises.push(model.load());
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
