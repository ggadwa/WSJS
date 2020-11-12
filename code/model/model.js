import PointClass from '../utility/point.js';
import Matrix4Class from '../utility/matrix4.js';
import CoreClass from '../main/core.js';
import MeshListClass from '../mesh/mesh_list.js';
import ModelSkeletonClass from '../model/model_skeleton.js';
import ImportGLTFClass from '../import/import_gltf.js';

//
// model object
//

export default class ModelClass
{
    constructor(core,json)
    {
        this.core=core;
        this.json=json;
        
        this.loaded=false;
        
        this.meshList=new MeshListClass(core);
        this.skeleton=new ModelSkeletonClass(core);
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        // 
    
    initialize()
    {
        if (!this.meshList.initialize()) return(false);
        this.skeleton.initialize();
        
        this.loaded=false;
        
        return(true);
    }

    release()
    {
        this.meshList.release();
        this.skeleton.release();
    }
    
        //
        // async model loading
        //
        
    async load()
    {
        let importGLTF;
        
            // no import settings, nothing to load
            
        if (this.json==null) return(true);
        
            // the model
            
        importGLTF=new ImportGLTFClass(this.core,this.json.name);
        if (!(await importGLTF.import(null,this.meshList,this.skeleton,false))) return(false);

        this.setupBuffers();
        
        this.loaded=true;
        
        return(true);
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

    draw(entity,selected)
    {
        let modelEntityAlter=entity.modelEntityAlter;
        
        modelEntityAlter.setupModelMatrix(true);
        
            // models cull on entire model
            // instead of per mesh
            
        if (!modelEntityAlter.boundBoxInFrustum()) return;
        
            // draw the meshlist
        
        this.meshList.drawModel(modelEntityAlter);
        
            // debugging for skeletons
            
        //modelEntityAlter.setupModelMatrix(false);
        //modelEntityAlter.drawSkeleton();
        
            // developer bounds drawing
            // note this can't draw held stuff
            
        if ((this.core.developer.on) && (entity.heldBy===null)) {
            modelEntityAlter.setupModelMatrix(false);
            modelEntityAlter.drawBounds(selected);
        }
    }
}
