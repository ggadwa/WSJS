import ShaderClass from '../shader/shader.js';

//
// interface shader class
//

export default class InterfaceShaderClass extends ShaderClass
{
    constructor(core)
    {
        super(core);
        
        this.vertexShaderURL='shaders/interface.vert';
        this.fragmentShaderURL='shaders/interface.frag';
        
        this.vertexPositionAttribute=null;
        this.vertexUVAttribute=null;
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
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');

        this.orthoMatrixUniform=gl.getUniformLocation(this.program,'orthoMatrix');    
        this.colorUniform=gl.getUniformLocation(this.program,'color');
        
            // texture uniforms never change
            
        gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);

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
        gl.enableVertexAttribArray(this.vertexUVAttribute);
    }

    drawEnd()
    {
        let gl=this.core.gl;
        
            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexUVAttribute);

            // no longer using program

        gl.useProgram(null);
    }

}
