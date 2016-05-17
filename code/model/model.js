"use strict";

//
// model object
//

class ModelClass
{
    constructor(name,modelType)
    {
        this.name=name;
        this.modelType=modelType;
        this.modelShader=null;          // this gets set when model is attached to model list
        this.mesh=null;
        this.skeleton=null;
        
        Object.seal(this);
    }
    
        //
        // close model
        //

    close()
    {
        this.mesh.close();
        this.skeleton.close();
    }
    
        //
        // clone this model
        //
        
    clone()
    {
        var model=new ModelClass(this.name,this.modelType);
        
        model.modelShader=this.modelShader;
        model.mesh=this.mesh.clone();
        model.skeleton=this.skeleton.clone();

        return(model);
    }
    
        //
        // information
        //
        
    calculateRadius()
    {
        return(this.mesh.calculateRadius(this.skeleton));
    }
    
    calculateHeight()
    {
        return(this.mesh.calculateHeight());
    }
    
        //
        // draw model
        //

    drawStart()
    {
        this.modelShader.drawStart();
    }

    drawEnd()
    {
        this.modelShader.drawEnd();
    }

    draw()
    {
        var mesh=this.mesh;

        mesh.bitmap.attachAsTexture(this.modelShader);
        
        mesh.buildNonCulledTriangleIndexes();
        mesh.bindBuffers(this.modelShader);
        mesh.draw();
    }

}
