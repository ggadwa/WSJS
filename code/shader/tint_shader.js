import ShaderClass from '../shader/shader.js';

//
// tint shader class
//

export default class TintShaderClass extends ShaderClass
{
    constructor(core)
    {
        super(core);
        
        this.shaderName='tint';
        
        this.vertexPositionAttribute=null;
        this.orthoMatrixUniform=null;
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

        this.orthoMatrixUniform=gl.getUniformLocation(this.program,'orthoMatrix');    
        this.colorUniform=gl.getUniformLocation(this.program,'color');

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
    }

    drawEnd()
    {
        let gl=this.core.gl;
        
            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);

            // no longer using program

        gl.useProgram(null);
    }

}
