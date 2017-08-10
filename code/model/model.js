//
// class for some model constants
// redo when static properities come to classes
//

class ModelConstantsClass
{
    constructor()
    {
        this.TYPE_CREATURE=0;
        this.TYPE_WEAPON=1;
        this.TYPE_PROJECTILE=2;
        
        this.TYPE_NAMES=    [
                                'Creature','Weapon','Projectile'
                            ];
    }
}

let modelConstants=new ModelConstantsClass();

//
// model object
//

export default class ModelClass
{
    constructor(name,modelType)
    {
        this.name=name;
        this.modelType=modelType;
        this.modelMeshShader=null;          // this gets set when model is attached to model list
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
        let model=new ModelClass(this.name,this.modelType);
        
        model.modelMeshShader=this.modelMeshShader;
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
        this.modelMeshShader.drawStart();
    }

    drawEnd()
    {
        this.modelMeshShader.drawEnd();
    }

    draw()
    {
        let mesh=this.mesh;

        mesh.bitmap.attachAsTexture(this.modelMeshShader);
        
        mesh.buildNonCulledTriangleIndexes();
        mesh.bindBuffers(this.modelMeshShader);
        mesh.draw();
    }

}
