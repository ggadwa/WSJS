import ShaderClass from '../shader/shader.js';

//
// color shader class
//

export default class ColorShaderClass extends ShaderClass
{
    constructor(core)
    {
        super(core);
        
        this.shaderName='color';
        
        this.vertexPositionAttribute=null;
        this.vertexColorAttribute=null;
        this.orthoMatrixUniform=null;
        
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
        this.vertexColorAttribute=gl.getAttribLocation(this.program,'vertexColor');

        this.orthoMatrixUniform=gl.getUniformLocation(this.program,'orthoMatrix');

        gl.useProgram(null);
    }

        //
        // start/stop interface shader drawing
        //

    drawStart()
    {
        let gl=this.core.gl;
        
        gl.useProgram(this.program);

            // setup the uniforms

        gl.uniformMatrix4fv(this.orthoMatrixUniform,false,this.core.orthoMatrix.data);

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexColorAttribute);
    }

    drawEnd()
    {
        let gl=this.core.gl;
        
            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexColorAttribute);

            // no longer using program

        gl.useProgram(null);
    }

}
