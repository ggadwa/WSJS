import ModelMeshShaderClass from '../../code/model/model_mesh_shader.js';

//
// model list class
//

export default class ModelListClass
{
    constructor(view)
    {
        this.view=view;
        
        this.models=[];
        
        Object.seal(this);
    }
    
        //
        // initialize/release modelList
        //

    initialize()
    {
        return(true);
    }

    release()
    {
    }

        //
        // add models
        //

    addModel(model)
    {
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

}
