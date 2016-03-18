"use strict";

//
// model list class
//

class ModelListClass
{
    constructor()
    {
        this.models=[];
        this.modelShader=new ModelShaderClass();
        
        Object.seal(this);
    }
    
        //
        // initialize/release modelList
        //

    initialize(view,fileCache)
    {
        return(this.modelShader.initialize(view,fileCache));
    }

    release(view)
    {
        this.modelShader.release(view);
    }

        //
        // add models
        //

    addModel(model)
    {
        model.modelShader=this.modelShader;
        this.models.push(model);
    }

        //
        // get models
        //
    
    countModel()
    {
        return(this.models.length);
    }

    getModel(name)
    {
        var n;
        var nModel=this.models.length;

        for (n=0;n!==nModel;n++) {
            if (this.models[n].name===name) return(this.models[n]);
        }

        return(null);
    }
    
        //
        // clone models
        //
        
    cloneModel(view,name)
    {
        var model=this.getModel(name);
        if (model===null) return(null);
        
        var cloneModel=model.clone();
        cloneModel.mesh.setupBuffers(view);
        
        this.models.push(cloneModel);
        
        return(cloneModel);
    }

}
    
