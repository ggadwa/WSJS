import ModelDrawMeshClass from '../../code/model_draw/model_draw_mesh.js';
import ModelDrawSkeletonClass from '../../code/model_draw/model_draw_skeleton.js';

//
// drawmodel object
// 
// this is an object that is parallel to a shared model object.  It contains
// all the things that change for an entity so entities can share the model
// object itself
//

export default class ModelClass
{
    constructor(view,model)
    {
        this.view=view;
        this.model=model;
        
        this.drawMesh=new ModelDrawMeshClass(view,model);
        this.drawSkeleton=new ModelDrawSkeletonClass(view,model);
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
        this.drawMesh.initialize();
    }
    
    relase()
    {
        this.drawMesh.release();
    }


}
