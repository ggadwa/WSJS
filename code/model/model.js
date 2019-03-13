import * as constants from '../main/constants.js';
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
    constructor(core,importSettings)
    {
        this.core=core;
        this.importSettings=importSettings;
        
        this.loaded=false;
        
        this.meshList=new MeshListClass(core);
        this.skeleton=new ModelSkeletonClass(core);
        
        this.position=new PointClass(0,0,0);
        this.angle=new PointClass(0,0,0);
        this.scale=new PointClass(1,1,1);
        
        this.noFrustumCull=false;
        
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
        if (!this.meshList.initialize(this.core.shaderList.modelMeshShader)) return(false);
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
            
        importModel=new ImportModelClass(this.core,this);
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

    draw(entity)
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
            
        this.meshList.draw(this.modelMatrix,this.skeleton,this.noFrustumCull);
        
            // debug skeleton and/or bounds drawing
            
        if ((config.DRAW_MODEL_SKELETONS) || (config.DRAW_ENTITY_BOUNDS)) {
            this.modelMatrix.setTranslationFromPoint(this.position);
            this.rotMatrix.setRotationFromYAngle(this.angle.y);
            this.modelMatrix.multiply(this.rotMatrix);

            if (config.DRAW_MODEL_SKELETONS) this.skeleton.debugDrawSkeleton(this.modelMatrix,this.scale);
            if (config.DRAW_ENTITY_BOUNDS) this.debugDrawBounds(this.modelMatrix,entity);
        }
    }
    
        //
        // draw the entity bounds for debug purposes
        // note this is not optimal and slow!
        //
        
    debugDrawBounds(modelMatrix,entity)
    {
        let n,rad;
        let vertices,indexes,vIdx,iIdx;
        let vertexBuffer,indexBuffer;
        let gl=this.core.gl;
        let shader=this.core.shaderList.debugShader;
        
            // bound lines
            
        vertices=new Float32Array(((3*36)*2)+((3*4)*2));        // 36 lines top, 36 lines bottom, and 4 lines side
        indexes=new Uint16Array(((2*36)*2)+(4*2));
        
        vIdx=0;
        iIdx=0;
        
            // top and bottom ellipse
            
        for (n=0;n!==36;n++) {
            rad=constants.DEGREE_TO_RAD*(n*10)

            vertices[vIdx++]=entity.xRadius*Math.cos(rad);
            vertices[vIdx++]=entity.height;
            vertices[vIdx++]=entity.zRadius*Math.sin(rad);
            
            indexes[iIdx++]=n;
            indexes[iIdx++]=(n===35)?0:(n+1);
        }
        
        for (n=0;n!==36;n++) {
            rad=constants.DEGREE_TO_RAD*(n*10)

            vertices[vIdx++]=entity.xRadius*Math.cos(rad);
            vertices[vIdx++]=0;
            vertices[vIdx++]=entity.zRadius*Math.sin(rad);
            
            indexes[iIdx++]=n+36;
            indexes[iIdx++]=(n===35)?36:(n+37);
        }
        
            // a couple lines
        
        for (n=0;n!==4;n++) {
            rad=constants.DEGREE_TO_RAD*(n*90);

            vertices[vIdx++]=(entity.xRadius*Math.cos(rad));
            vertices[vIdx++]=entity.height;
            vertices[vIdx++]=(entity.zRadius*Math.sin(rad));
            vertices[vIdx++]=(entity.xRadius*Math.cos(rad));
            vertices[vIdx++]=0;
            vertices[vIdx++]=(entity.zRadius*Math.sin(rad));

            indexes[iIdx++]=72+(n*2);
            indexes[iIdx++]=73+(n*2);
        }
       
            // build the buffers
            
        vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        indexBuffer=gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.DYNAMIC_DRAW);
        
            // always draw it, no matter what
            
        gl.disable(gl.DEPTH_TEST);

            // draw the lines
            
        shader.drawStart(0,1,0);
            
        gl.uniformMatrix4fv(shader.modelMatrixUniform,false,modelMatrix.data);
        
            // the lines
            
        gl.uniform3f(shader.colorUniform,0.2,0.2,1.0);
        gl.drawElements(gl.LINES,(((36*2)*2)+(4*2)),gl.UNSIGNED_SHORT,0);
        
            // the nodes
        
        shader.drawEnd();
        
            // re-enable depth
            
        gl.enable(gl.DEPTH_TEST);
        
            // tear down the buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(indexBuffer);
    }
}
