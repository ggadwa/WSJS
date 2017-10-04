import MapMeshShaderClass from '../../code/map/map_mesh_shader.js';
import MapLiquidShaderClass from '../../code/map/map_liquid_shader.js';
import ModelMeshShaderClass from '../../code/model/model_mesh_shader.js';
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
        
            // all the shaders we need to load
            
        this.shaderNames=[
                'debug',
                'interface',
                'map_mesh',
                'map_liquid',
                'map_overlay',
                'model_mesh',
                'particle',
                'text',
                'sky',
        ];
        
        Object.seal(this);
    }
    
        //
        // load the shaders
        //
        
    initialize(callback)
    {
        this.mapMeshShader=new MapMeshShaderClass(this.view,this.fileCache);
        if (!this.mapMeshShader.initialize()) return;
        
        this.mapLiquidShader=new MapLiquidShaderClass(this.view,this.fileCache);
        if (!this.mapLiquidShader.initialize()) return;

            
        this.modelMeshShader=new ModelMeshShaderClass(this.view,this.fileCache);
        if (!this.modelMeshShader.initialize()) return;
            
            
            
        this.interfaceShader=new InterfaceShaderClass(this.view,this.fileCache);
        if (!this.interfaceShader.initialize()) return;
        
        this.textShader=new TextShaderClass(this.view,this.fileCache);
        if (!this.textShader.initialize()) return;
        
        callback();
    }
    
    release()
    {
        this.mapMeshShader.release();
        this.mapLiquidShader.release();
        this.modelMeshShader.release();
        this.interfaceShader.release();
        this.textShader.release();
    }

}
