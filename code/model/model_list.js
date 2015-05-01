"use strict";

//
// initialize/release modelList
//

function modelListInitialize(view)
{
    return(this.modelShader.initialize(view));
}

function modelListRelease(view)
{
    this.modelShader.release(view);
}

//
// add models
//

function modelListAdd(model)
{
    this.models.push(model);
}

//
// get models
//

function modelListGet(name)
{
    var n;
    var nModel=this.models.length;
    
    for (n=0;n!==nModel;n++) {
        if (this.models[n].name===name) return(this.models[n]);
    }
    
    return(null);
}

//
// model list object
//

function modelListObject()
{
    this.models=[];
    this.modelShader=new modelShaderObject();
    
    this.initialize=modelListInitialize;
    this.release=modelListRelease;
    
    this.add=modelListAdd;
    this.get=modelListGet;
}
    
