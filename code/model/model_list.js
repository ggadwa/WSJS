import ModelMeshShaderClass from '../../code/model/model_mesh_shader.js';

//
// model list class
//

class ModelListClass
{
    constructor()
    {
        this.models=[];
        this.modelMeshShader=new ModelMeshShaderClass();
        
        Object.seal(this);
    }
    
        //
        // initialize/release modelList
        //

    initialize()
    {
        return(this.modelMeshShader.initialize());
    }

    release()
    {
        this.modelMeshShader.release();
    }

        //
        // add models
        //

    addModel(model)
    {
        model.modelMeshShader=this.modelMeshShader;
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
        let n;
        let nModel=this.models.length;

        for (n=0;n!==nModel;n++) {
            if (this.models[n].name===name) return(this.models[n]);
        }

        return(null);
    }
    
        //
        // clone models
        //
        
    cloneModel(name)
    {
        let model,cloneModel;
        
        model=this.getModel(name);
        if (model===null) return(null);
        
        cloneModel=model.clone();
        cloneModel.mesh.setupBuffers();
        
        this.models.push(cloneModel);
        
        return(cloneModel);
    }

}
    
//
// the modelList global object
//

let modelList=new ModelListClass();

export default modelList;
