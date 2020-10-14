import MapMeshShaderClass from '../shader/map_mesh_shader.js';
import MapMeshShadowShaderClass from '../shader/map_mesh_shadow_shader.js';
import MapSkyShaderClass from '../shader/map_sky_shader.js';
import ModelMeshShaderClass from '../shader/model_mesh_shader.js';
import DebugShaderClass from '../shader/debug_shader.js';
import EffectShaderClass from '../shader/effect_shader.js';
import InterfaceShaderClass from '../shader/interface_shader.js';
import TintShaderClass from '../shader/tint_shader.js';
import TextShaderClass from '../shader/text_shader.js';
import ColorShaderClass from '../shader/color_shader.js';

//
// class to handle loading global shaders
//

export default class ShaderListClass
{
    constructor(core)
    {
        this.core=core;
        
        this.mapMeshShader=null;
        this.mapMeshShadowShader=null;
        this.mapSkyShader=null;
        this.modelMeshShader=null;
        this.debugShader=null;
        this.effectShader=null;
        this.interfaceShader=null;
        this.tintShader=null;
        this.textShader=null;
        this.colorShader=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release
        //
    
    initialize()
    {
        this.mapMeshShader=null;
        this.mapMeshShadowShader=null;
        this.mapSkyShader=null;
        this.modelMeshShader=null;
        this.debugShader=null;
        this.effectShader=null;
        this.interfaceShader=null;
        this.tintShader=null;
        this.textShader=null;
        this.colorShader=null;
    }
    
    
    release()
    {
        if (this.mapMeshShader!==null) this.mapMeshShader.release();
        if (this.mapMeshShadowShader!==null) this.mapMeshShadowShader.release();
        if (this.mapSkyShader!==null) this.mapSkyShader.release();
        if (this.modelMeshShader!==null) this.modelMeshShader.release();
        if (this.debugShader!==null) this.debugShader.release();
        if (this.effectShader!==null) this.effectShader.release();
        if (this.interfaceShader!==null) this.interfaceShader.release();
        if (this.tintShader!==null) this.tintShader.release();
        if (this.textShader!==null) this.textShader.release();
        if (this.colorShader!==null) this.colorShader.release();
    }
    
        //
        // load shaders
        //
        
    async loadShaders()
    {
        this.mapMeshShader=new MapMeshShaderClass(this.core);
        this.mapMeshShader.initialize();
        if (!(await this.mapMeshShader.load())) return(false);
        
        this.mapMeshShadowShader=new MapMeshShadowShaderClass(this.core);
        this.mapMeshShadowShader.initialize();
        if (!(await this.mapMeshShadowShader.load())) return(false);
        
        this.mapSkyShader=new MapSkyShaderClass(this.core);
        this.mapSkyShader.initialize();
        if (!(await this.mapSkyShader.load())) return(false);

        this.modelMeshShader=new ModelMeshShaderClass(this.core);
        this.modelMeshShader.initialize();
        if (!(await this.modelMeshShader.load())) return(false);
        
        this.debugShader=new DebugShaderClass(this.core);
        this.debugShader.initialize();
        if (!(await this.debugShader.load())) return(false);
           
        this.effectShader=new EffectShaderClass(this.core);
        this.effectShader.initialize();
        if (!(await this.effectShader.load())) return(false);
            
        this.interfaceShader=new InterfaceShaderClass(this.core);
        this.interfaceShader.initialize();
        if (!(await this.interfaceShader.load())) return(false);
        
        this.tintShader=new TintShaderClass(this.core);
        this.tintShader.initialize();
        if (!(await this.tintShader.load())) return(false);
      
        this.textShader=new TextShaderClass(this.core);
        this.textShader.initialize();
        if (!(await this.textShader.load())) return(false);
        
        this.colorShader=new ColorShaderClass(this.core);
        this.colorShader.initialize();
        return(await this.colorShader.load());
    }


}
