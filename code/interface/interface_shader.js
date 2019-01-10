import ShaderClass from '../../code/shader/shader.js';

//
// interface shader class
//

export default class InterfaceShaderClass extends ShaderClass
{
    constructor(view)
    {
        super(view);
        
        this.vertexShaderURL='shaders/interface.vert';
        this.fragmentShaderURL='shaders/interface.frag';
        
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
        let gl=this.view.gl;

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
