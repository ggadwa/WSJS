import CoreClass from '../main/core.js';
import ShaderClass from '../shader/shader.js';
import ShaderLightClass from '../shader/shader_light.js';

//
// map shader object
//

export default class MapSkyShaderClass extends ShaderClass
{
    constructor(core)
    {
        super(core);
        
        this.shaderName='map_sky';
        
        this.vertexPositionAttribute=null;
        this.vertexUVAttribute=null;

        this.perspectiveMatrixUniform=null;
        this.viewMatrixUniform=null;
        this.transformMatrixUniform=null;
                
        this.colorUniform=null;
                
        Object.seal(this);
    }
    
        //
        // load finish
        //

    loadFinish()
    {
        let gl=this.core.gl;

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.viewMatrixUniform=gl.getUniformLocation(this.program,'viewMatrix');
        this.transformMatrixUniform=gl.getUniformLocation(this.program,'transformMatrix');
        
        this.colorUniform=gl.getUniformLocation(this.program,'color');
        
            // these uniforms are always the same
            // need the unused textures as we are using a common routine that binds to them

        gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);
        gl.uniform1i(gl.getUniformLocation(this.program,'normalTex'),1);
        gl.uniform1i(gl.getUniformLocation(this.program,'metallicRoughnessTex'),2);
        gl.uniform1i(gl.getUniformLocation(this.program,'emissiveTex'),3);
        gl.uniform1i(gl.getUniformLocation(this.program,'maskTex'),4);

        gl.useProgram(null);
    }
    
        //
        // start/stop map shader drawing
        //

    drawStart()
    {
        let core=this.core;
        let gl=this.core.gl;

        gl.useProgram(this.program);

            // matrix

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,core.perspectiveMatrix.data);
        gl.uniformMatrix4fv(this.viewMatrixUniform,false,core.viewMatrix.data);
        gl.uniformMatrix4fv(this.transformMatrixUniform,false,core.game.map.sky.transformMatrix.data);     // repositions/resizes/etc the sky globe

            // the color
            
        gl.uniform3f(this.colorUniform,core.game.map.sky.color.r,core.game.map.sky.color.g,core.game.map.sky.color.b);
        
            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexUVAttribute);
    }

    drawEnd()
    {
        let gl=this.core.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexUVAttribute);

            // no longer using shader

        gl.useProgram(null);
    }

}
