import ShaderClass from '../shader/shader.js';

//
// debug shader class
//

export default class DebugShaderClass extends ShaderClass
{
    constructor(core)
    {
        super(core);
        
        this.shaderName='debug';
        
        this.vertexPositionAttribute=null;

        this.perspectiveMatrixUniform=null;
        this.viewMatrixUniform=null;
        
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

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.viewMatrixUniform=gl.getUniformLocation(this.program,'viewMatrix');

        this.colorUniform=gl.getUniformLocation(this.program,'color');

        gl.useProgram(null);
    }
    
        //
        // start/stop skeleton shader drawing
        //

    drawStart()
    {
        let gl=this.core.gl;

            // using the skeleton shader

        gl.useProgram(this.program);

            // matrix

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.core.perspectiveMatrix.data);
        gl.uniformMatrix4fv(this.viewMatrixUniform,false,this.core.viewMatrix.data);

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
    }

    drawEnd()
    {
        let gl=this.core.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);

            // no longer using shader

        gl.useProgram(null);
    }

}
