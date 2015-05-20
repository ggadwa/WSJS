"use strict";

//
// model object
//

function ModelObject(name)
{
    this.name=name;
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
        mesh.bindBuffers(view,this.modelShader);
        mesh.draw(view);
    };

}