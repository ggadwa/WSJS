import MapMeshShaderClass from '../../code/map/map_mesh_shader.js';
import MapLiquidShaderClass from '../../code/map/map_liquid_shader.js';
import MapOverlayShaderClass from '../../code/map/map_overlay_shader.js';
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
    constructor(view,fileCache)
    {
        this.view=view;
        this.fileCache=fileCache;
        
        this.mapMeshShader=null;
        this.mapLiquidShader=null;
        this.mapOverlayShader=null;
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
    
    initialize(callback)
    {
        this.finalInitCallback=callback;
        
        this.initializeMapMeshShader();
    }
    
    initializeMapMeshShader()
    {
        this.mapMeshShader=new MapMeshShaderClass(this.view);
        this.mapMeshShader.initialize(this.initializeMapLiquidShader.bind(this));
    }
    
    initializeMapLiquidShader()
    {
        this.mapLiquidShader=new MapLiquidShaderClass(this.view);
        this.mapLiquidShader.initialize(this.initializeMapOverlayShader.bind(this));
    }
    
    initializeMapOverlayShader()
    {
        this.mapOverlayShader=new MapOverlayShaderClass(this.view);
        this.mapOverlayShader.initialize(this.initializeSkyShader.bind(this));
    }
    
    initializeSkyShader()
    {
        this.skyShader=new SkyShaderClass(this.view);
        this.skyShader.initialize(this.initializeModelMeshShader.bind(this));
    }
    
    initializeModelMeshShader()
    {            
        this.modelMeshShader=new ModelMeshShaderClass(this.view);
        this.modelMeshShader.initialize(this.initializeParticleShader.bind(this));
    }
    
    initializeParticleShader()
    {            
        this.particleShader=new ParticleShaderClass(this.view);
        this.particleShader.initialize(this.initializeInterfaceShader.bind(this));
    }
    
    initializeInterfaceShader()
    {            
        this.interfaceShader=new InterfaceShaderClass(this.view);
        this.interfaceShader.initialize(this.initializeTextShader.bind(this));
    }
    
    initializeTextShader()
    {        
        this.textShader=new TextShaderClass(this.view);
        this.textShader.initialize(this.finalInitCallback);
    }
    
    release()
    {
        this.mapMeshShader.release();
        this.mapLiquidShader.release();
        this.mapOverlayShader.release();
        this.skyShader.release();
        this.modelMeshShader.release();
        this.particleShader.release();
        this.interfaceShader.release();
        this.textShader.release();
    }

}
