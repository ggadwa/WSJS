"use strict";

//
// initialize/release modelList
//

function modelListInitialize(view)
{
    return(this.modelShader.initialize(view));
}

function modelListRelease()
{
    this.modelShader.release();
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
    
