import MapMeshShaderClass from '../shader/map_mesh_shader.js';
import MapLiquidShaderClass from '../shader/map_liquid_shader.js';
import SkyShaderClass from '../shader/sky_shader.js';
import ModelMeshShaderClass from '../shader/model_mesh_shader.js';
import ModelSkeletonShaderClass from '../shader/model_skeleton_shader.js';
import EffectShaderClass from '../shader/effect_shader.js';
import InterfaceShaderClass from '../shader/interface_shader.js';
import TextShaderClass from '../shader/text_shader.js';

//
// class to handle loading global shaders
//

export default class ShaderListClass
{
    constructor(view)
    {
        this.view=view;
        
        this.mapMeshShader=null;
        this.mapLiquidShader=null;
        this.skyShader=null;
        this.modelMeshShader=null;
        this.modelSkeletonShader=null;
        this.effectShader=null;
        this.interfaceShader=null;
        this.textShader=null;
        
        this.finalInitCallback=null;
        
        Object.seal(this);
    }
    
        //
        // load the shaders
        // 
        // this looks really messy because we have to do it all with callbacks,
        // there isn't a asynch way to load the files
        //
    
    initialize()
    {
        this.mapMeshShader=null;
        this.mapLiquidShader=null;
        this.skyShader=null;
        this.modelMeshShader=null;
        this.modelSkeletonShader=null;
        this.effectShader=null;
        this.interfaceShader=null;
        this.textShader=null;
    }
    
    
    release()
    {
        if (this.mapMeshShader!==null) this.mapMeshShader.release();
        if (this.mapLiquidShader!==null) this.mapLiquidShader.release();
        if (this.skyShader!==null) this.skyShader.release();
        if (this.modelMeshShader!==null) this.modelMeshShader.release();
        if (this.modelSkeletonShader!==null) this.modelSkeletonShader.release();
        if (this.effectShader!==null) this.effectShader.release();
        if (this.interfaceShader!==null) this.interfaceShader.release();
        if (this.textShader!==null) this.textShader.release();
    }
    
        //
        // load shaders
        //
        
    async loadShaders()
    {
        this.mapMeshShader=new MapMeshShaderClass(this.view);
        this.mapMeshShader.initialize();
        if (!(await this.mapMeshShader.load())) return(false);

        this.mapLiquidShader=new MapLiquidShaderClass(this.view);
        this.mapLiquidShader.initialize();
        if (!(await this.mapLiquidShader.load())) return(false);

        this.skyShader=new SkyShaderClass(this.view);
        this.skyShader.initialize();
        if (!(await this.skyShader.load())) return(false);
    
        this.modelMeshShader=new ModelMeshShaderClass(this.view);
        this.modelMeshShader.initialize();
        if (!(await this.modelMeshShader.load())) return(false);
        
        this.modelSkeletonShader=new ModelSkeletonShaderClass(this.view);
        this.modelSkeletonShader.initialize();
        if (!(await this.modelSkeletonShader.load())) return(false);
           
        this.effectShader=new EffectShaderClass(this.view);
        this.effectShader.initialize();
        if (!(await this.effectShader.load())) return(false);
            
        this.interfaceShader=new InterfaceShaderClass(this.view);
        this.interfaceShader.initialize();
        if (!(await this.interfaceShader.load())) return(false);
      
        this.textShader=new TextShaderClass(this.view);
        this.textShader.initialize();
        return(await this.textShader.load());
    }


}
