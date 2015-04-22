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
// model list object
//

function modelListObject()
{
    this.modelShader=new modelShaderObject();
    
    this.models=[];
    
    this.initialize=modelListInitialize;
    this.release=modelListRelease;
}
    
