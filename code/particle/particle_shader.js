"use strict";

//
// particle shader class
//

class ParticleShaderClass extends ShaderClass
{
    constructor()
    {
        super();
        
        this.vertexPositionAttribute=null;
        this.vertexUVAttribute=null;
        this.perspectiveMatrixUniform=null;
        this.modelMatrixUniform=null;    
        this.colorAlphaUniform=null;
    }
    
        //
        // initialize/release particle shader
        //

    initialize(view,fileCache)
    {
        var gl=view.gl;
        
            // get a new shader object
            // and load/compile it

        if (!super.initialize(view,fileCache,'particle')) return(false);

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

        return(true);
    }

    release(view)
    {
        super.release(view);
    }

        //
        // start/stop particle drawing
        //

    drawStart(view)
    {
            // using the map shader

        view.gl.useProgram(this.program);

            // matrix

        view.gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,view.perspectiveMatrix);
        view.gl.uniformMatrix4fv(this.modelMatrixUniform,false,view.modelMatrix);

            // enable the vertex attributes

        view.gl.enableVertexAttribArray(this.vertexPositionAttribute);
        view.gl.enableVertexAttribArray(this.vertexUVAttribute);
    }

    drawEnd(view)
    {
            // disable vertex attributes

        view.gl.disableVertexAttribArray(this.vertexPositionAttribute);
        view.gl.disableVertexAttribArray(this.vertexUVAttribute);

            // no longer using shader

        view.gl.useProgram(null);
    }
}

