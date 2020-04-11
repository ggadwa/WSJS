import CoreClass from '../main/core.js';
import ShaderClass from '../shader/shader.js';
import ShaderLightClass from '../shader/shader_light.js';

//
// map shader object
// 
// this version has a shadow map
//

export default class MapMeshShadowShaderClass extends ShaderClass
{
    constructor(core)
    {
        super(core);
        
        this.shaderName='map_mesh_shadow';
        
        this.vertexPositionShadowAttribute=null;
        this.vertexUVShadowAttribute=null;

        this.perspectiveMatrixUniform=null;
        this.viewMatrixUniform=null;
        
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

        this.vertexPositionShadowAttribute=gl.getAttribLocation(this.program,'vertexPositionShadow');
        this.vertexUVShadowAttribute=gl.getAttribLocation(this.program,'vertexUVShadow');
        
        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.viewMatrixUniform=gl.getUniformLocation(this.program,'viewMatrix');

            // these uniforms are always the same

        gl.uniform1i(gl.getUniformLocation(this.program,'shadowTex'),0);

        gl.useProgram(null);
    }
    
        //
        // start/stop map shader drawing
        //

    drawStart()
    {
        let gl=this.core.gl;

        gl.useProgram(this.program);

            // matrix
            // normal is set on a per mesh level as some have
            // model matrixes which need to be calculated in

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.core.perspectiveMatrix.data);
        gl.uniformMatrix4fv(this.viewMatrixUniform,false,this.core.viewMatrix.data);
        
            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionShadowAttribute);
        gl.enableVertexAttribArray(this.vertexUVShadowAttribute);
    }

    drawEnd()
    {
        let gl=this.core.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionShadowAttribute);
        gl.disableVertexAttribArray(this.vertexUVShadowAttribute);

            // no longer using shader

        gl.useProgram(null);
    }

}
