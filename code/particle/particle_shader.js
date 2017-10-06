import ShaderClass from '../../code/shader/shader.js';

//
// particle shader class
//

export default class ParticleShaderClass extends ShaderClass
{
    constructor(view,fileCache)
    {
        super(view,fileCache);
        
        this.vertexPositionAttribute=null;
        this.vertexUVAttribute=null;
        this.perspectiveMatrixUniform=null;
        this.modelMatrixUniform=null;    
        this.colorAlphaUniform=null;
        
        this.finalInitCallback=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release particle shader
        //

    initialize(callback)
    {
        this.finalInitCallback=callback;
        
            // load and compile the shader, requires callback

       super.initialize('particle',this.initialize2.bind(this));
    }
    
    initialize2()
    {
        let gl=this.view.gl;

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.modelMatrixUniform=gl.getUniformLocation(this.program,'modelMatrix');
        
        this.colorAlphaUniform=gl.getUniformLocation(this.program,'colorAlpha');
        
            // texture uniforms never change
            
        gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);

        gl.useProgram(null);

        this.finalInitCallback();
    }

    release()
    {
        super.release();
    }

        //
        // start/stop particle drawing
        //

    drawStart()
    {
        let gl=this.view.gl;
        
            // using the map shader

        gl.useProgram(this.program);

            // matrix

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.view.perspectiveMatrix);
        gl.uniformMatrix4fv(this.modelMatrixUniform,false,this.view.modelMatrix);

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

            // no longer using shader

        gl.useProgram(null);
    }
}

