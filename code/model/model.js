import MeshListClass from '../mesh/mesh_list.js';
import ModelSkeletonClass from '../model/model_skeleton.js';

//
// model object
//

export default class ModelClass
{
    constructor(view)
    {
        this.view=view;
        
        this.meshList=new MeshListClass(view);
        this.skeleton=new ModelSkeletonClass(view);
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        // 
    
    initialize()
    {
        if (!this.meshList.initialize(this.view.shaderList.modelMeshShader)) return(false);
        this.skeleton.initialize();
        
        return(true);
    }

    release()
    {
        this.meshList.release();
        this.skeleton.release();
    }
    
        //
        // setup buffers
        //
        
    setupBuffers()
    {
        this.meshList.setupBuffers();
    }
    
        //
        // draw model
        //

    draw()
    {
        this.meshList.drawOpaque();
    }
}
