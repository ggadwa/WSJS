import config from '../main/config.js';
import PointClass from '../../code/utility/point.js';
import Matrix4Class from '../utility/matrix4.js';
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
        this.modelMatrix.setTranslationFromPoint(this.position);
        this.rotMatrix.setRotationFromYAngle(this.angle.y);
        this.modelMatrix.multiply(this.rotMatrix);
        this.scaleMatrix.setScaleFromPoint(this.scale);
        this.modelMatrix.multiply(this.scaleMatrix);

            // draw the meshlist
            
        this.meshList.drawOpaque(this.modelMatrix,this.skeleton.getPoseJointMatrixArray());
        
        if (config.DRAW_SKELETONS) {
            this.modelMatrix.setTranslationFromPoint(this.position);
            this.rotMatrix.setRotationFromYAngle(this.angle.y);
            this.modelMatrix.multiply(this.rotMatrix);

            this.skeleton.draw(this.modelMatrix,this.scale);
        }
    }
}
