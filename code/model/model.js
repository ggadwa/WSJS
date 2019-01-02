//
// model object
//

export default class ModelClass
{
    constructor(view,name)
    {
        this.view=view;
        this.name=name;
        
        this.mesh=null;
        this.skeleton=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        // 
    
    initialize()
    {
        this.mesh.initialize();
        this.skeleton.initialize();
    }

    release()
    {
        this.mesh.release();
        this.skeleton.release();
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

    draw()
    {
        let mesh=this.model.mesh;

        this.view.shaderList.modelMeshShader.drawStart();
        
        mesh.bitmap.attachAsTexture(this.view.shaderList.modelMeshShader);
        
        mesh.buildNonCulledTriangleIndexes();
        mesh.bindBuffers(this.view.shaderList.modelMeshShader);
        mesh.draw();
        
        this.view.shaderList.modelMeshShader.drawEnd();
    }
}
