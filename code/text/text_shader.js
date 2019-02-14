import ShaderClass from '../shader/shader.js';

//
// text shader class
//

export default class TextShaderClass extends ShaderClass
{
    constructor(view)
    {
        super(view);
        
        this.vertexShaderURL='shaders/text.vert';
        this.fragmentShaderURL='shaders/text.frag';
        
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
        let gl=this.view.gl;

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');

        this.orthoMatrixUniform=gl.getUniformLocation(this.program,'orthoMatrix');    
        this.colorUniform=gl.getUniformLocation(this.program,'color');

            // these uniforms are always the same

        gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);

        gl.useProgram(null);
    }

    //
    // start/stop text shader drawing
    //

    drawStart()
    {
        let gl=this.view.gl;
        
        gl.useProgram(this.program);

            // setup the uniforms

        gl.uniformMatrix4fv(this.orthoMatrixUniform,false,this.view.orthoMatrix);

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexUVAttribute);
    }

    drawEnd()
    {
        let gl=this.view.gl;
        
            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexUVAttribute);

            // no longer using program

        gl.useProgram(null);
    }

}
