import config from '../main/config.js';
import PointClass from '../../code/utility/point.js';
import Matrix4Class from '../utility/matrix4.js';
import MeshListClass from '../mesh/mesh_list.js';
import ModelSkeletonClass from '../model/model_skeleton.js';
import ImportModelClass from '../import/import_model.js';

//
// model object
//

export default class ModelClass
{
    constructor(view,importSettings)
    {
        this.view=view;
        this.importSettings=importSettings;
        
        this.loaded=false;
        
        this.meshList=new MeshListClass(view);
        this.skeleton=new ModelSkeletonClass(view);
        
        this.position=new PointClass(0,0,0);
        this.angle=new PointClass(0,0,0);
        this.scale=new PointClass(1,1,1);
        
        this.modelMatrix=new Matrix4Class();
        
        this.rotMatrix=new Matrix4Class();  // supergumba -- all temporary use quanternion
        this.scaleMatrix=new Matrix4Class();
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        // 
    
    initialize()
    {
        if (!this.meshList.initialize(this.view.shaderList.modelMeshShader)) return(false);
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
        let importModel;
        
            // no import settings, nothing to load
            
        if (this.importSettings==null) return(true);
        
            // the model
            
        importModel=new ImportModelClass(this.view,this);
        if (!(await importModel.load(this.importSettings))) return(false);

        this.scale.setFromValues(this.importSettings.scale,this.importSettings.scale,this.importSettings.scale);
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

    draw()
    {
        this.modelMatrix.setTranslationFromPoint(this.position);
        this.rotMatrix.setRotationFromZAngle(this.angle.z);
        this.modelMatrix.multiply(this.rotMatrix);
        this.rotMatrix.setRotationFromYAngle(this.angle.y);
        this.modelMatrix.multiply(this.rotMatrix);
        this.rotMatrix.setRotationFromXAngle(this.angle.x);
        this.modelMatrix.multiply(this.rotMatrix);
        this.scaleMatrix.setScaleFromPoint(this.scale);
        this.modelMatrix.multiply(this.scaleMatrix);
        
            // need to rebuild all the bounds to this
            // model matrix so frustum calcs work
        
        this.meshList.recalcBoundsFromModelMatrix(this.modelMatrix);
        
            // draw the meshlist
            
        this.meshList.drawOpaque(this.modelMatrix,this.skeleton.getPoseJointMatrixArray());
        
            // debug skeleton drawing
            
        if (config.DRAW_MODEL_SKELETONS) {
            this.modelMatrix.setTranslationFromPoint(this.position);
            this.rotMatrix.setRotationFromYAngle(this.angle.y);
            this.modelMatrix.multiply(this.rotMatrix);

            this.skeleton.debugDraw(this.modelMatrix,this.scale);
        }
    }
}
