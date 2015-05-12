"use strict";

//
// model list class
//

function ModelListObject()
{
    this.models=[];
    this.modelShader=new ModelShaderObject();
    
        //
        // initialize/release modelList
        //

    this.initialize=function(view)
    {
        return(this.modelShader.initialize(view));
    };

    this.release=function(view)
    {
        this.modelShader.release(view);
    };

        //
        // add models
        //

    this.add=function(model)
    {
        model.modelShader=this.modelShader;
        this.models.push(model);
    };

        //
        // get models
        //

    this.get=function(name)
    {
        var n;
        var nModel=this.models.length;

        for (n=0;n!==nModel;n++) {
            if (this.models[n].name===name) return(this.models[n]);
        }

        return(null);
    };
    
    this.count=function()
    {
        return(this.models.length);
    };

}
    
