import ShaderClass from '../../code/shader/shader.js';

//
// interface shader class
//

export default class InterfaceShaderClass extends ShaderClass
{
    constructor(view)
    {
        super(view);
        
        this.vertexPositionAttribute=null;
        this.orthoMatrixUniform=null;
        this.colorUniform=null;
        
        this.finalInitCallback=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface shader
        //

    initialize(callback)
    {
        this.finalInitCallback=callback;
        
            // load and compile the shader, requires callback

        super.initialize('interface',this.initialize2.bind(this));
    }
    
    initialize2()
    {
        let gl=this.view.gl;

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');

        this.orthoMatrixUniform=gl.getUniformLocation(this.program,'orthoMatrix');    
        this.colorUniform=gl.getUniformLocation(this.program,'color');

        gl.useProgram(null);

        this.finalInitCallback();
    }

    release()
    {
        super.release();
    }

        //
        // start/stop interface shader drawing
        //

    drawStart()
    {
        let gl=this.view.gl;
        
        gl.useProgram(this.program);

            // setup the uniforms

        gl.uniformMatrix4fv(this.orthoMatrixUniform,false,this.view.orthoMatrix);

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
    }

    drawEnd()
    {
        let gl=this.view.gl;
        
            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);

            // no longer using program

        gl.useProgram(null);
    }

}
