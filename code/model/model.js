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
    }
    
        //
        // close model
        //

    close(view)
    {
        this.mesh.close(view);
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
        // draw model
        //

    drawStart(view)
    {
        this.modelShader.drawStart(view);
    }

    drawEnd(view)
    {
        this.modelShader.drawEnd(view);
    }

    draw(view)
    {
        var mesh=this.mesh;

        mesh.bitmap.attachAsTexture(this.modelShader);
        
        mesh.buildNonCulledTriangleIndexes(view);
        mesh.bindBuffers(view,this.modelShader);
        mesh.draw(view);
    }

}
