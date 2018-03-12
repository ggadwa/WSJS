import ModelDrawMeshClass from '../../code/model_draw/model_draw_mesh.js';
import ModelDrawSkeletonClass from '../../code/model_draw/model_draw_skeleton.js';

//
// drawmodel object
// 
// this is an object that is parallel to a shared model object.  It contains
// all the things that change for an entity so entities can share the model
// object itself
//

export default class ModelDrawClass
{
    constructor(view,model)
    {
        this.view=view;
        this.model=model;
        
        this.drawMesh=new ModelDrawMeshClass(view,model.mesh);
        
        this.drawSkeleton=null;
        if (model.skeleton!==null) this.drawSkeleton=new ModelDrawSkeletonClass(view,model.skeleton);
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
        this.drawMesh.initialize();
    }
    
    release()
    {
        this.drawMesh.release();
    }
    
        //
        // draw model
        //

    draw()
    {
        let mesh=this.model.mesh;
        let drawMesh=this.drawMesh;

        this.view.shaderList.modelMeshShader.drawStart();
        
        mesh.bitmap.attachAsTexture(this.view.shaderList.modelMeshShader);
        
        drawMesh.buildNonCulledTriangleIndexes();
        drawMesh.bindBuffers();
        drawMesh.draw();
        
        this.view.shaderList.modelMeshShader.drawEnd();
    }

}
