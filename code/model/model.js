"use strict";

//
// model object
//

function ModelObject(name,modelType)
{
    this.name=name;
    this.modelType=modelType;
    this.modelShader=null;          // this gets set when model is attached to model list
    this.mesh=null;
    this.skeleton=null;
    
        //
        // close model
        //

    this.close=function(view)
    {
        this.mesh.close(view);
        this.skeleton.close();
    };
    
        //
        // clone this model
        //
        
    this.clone=function()
    {
        var model=new ModelObject(this.name,this.modelType);
        
        model.modelShader=this.modelShader;
        model.mesh=this.mesh.clone();
        model.skeleton=this.skeleton.clone();

        return(model);
    };
    
        //
        // draw model
        //

    this.drawStart=function(view)
    {
        this.modelShader.drawStart(view);
    };

    this.drawEnd=function(view)
    {
        this.modelShader.drawEnd(view);
    };

    this.draw=function(view)
    {
        var mesh=this.mesh;

        mesh.bitmap.attach(view,this.modelShader);
        
        mesh.buildNonCulledTriangleIndexes(view);
        mesh.bindBuffers(view,this.modelShader);
        mesh.draw(view);
    };

}
