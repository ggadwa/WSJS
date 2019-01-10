import MapMeshShaderClass from '../../code/map/map_mesh_shader.js';
import MapLiquidShaderClass from '../../code/map/map_liquid_shader.js';
import SkyShaderClass from '../../code/sky/sky_shader.js';
import ModelMeshShaderClass from '../../code/model/model_mesh_shader.js';
import ParticleShaderClass from '../../code/particle/particle_shader.js';
import InterfaceShaderClass from '../../code/interface/interface_shader.js';
import TextShaderClass from '../../code/text/text_shader.js';

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
        this.particleShader=null;
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
        this.particleShader=null;
        this.interfaceShader=null;
        this.textShader=null;
    }
    
    
    release()
    {
        if (this.mapMeshShader!==null) this.mapMeshShader.release();
        if (this.mapLiquidShader!==null) this.mapLiquidShader.release();
        if (this.skyShader!==null) this.skyShader.release();
        if (this.modelMeshShader!==null) this.modelMeshShader.release();
        if (this.particleShader!==null) this.particleShader.release();
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
           
        this.particleShader=new ParticleShaderClass(this.view);
        this.particleShader.initialize();
        if (!(await this.particleShader.load())) return(false);
            
        this.interfaceShader=new InterfaceShaderClass(this.view);
        this.interfaceShader.initialize();
        if (!(await this.interfaceShader.load())) return(false);
      
        this.textShader=new TextShaderClass(this.view);
        this.textShader.initialize();
        return(await this.textShader.load());
    }


}
