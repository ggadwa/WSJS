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
        this.perspectiveMatrixUniform=null;
        this.modelMatrixUniform=null;    
        this.colorAlphaUniform=null;
    }
    
        //
        // initialize/release particle shader
        //

    initialize(view)
    {
            // get a new shader object
            // and load/compile it

        if (!super.initialize(view,'particle')) return(false);

            // setup uniforms

        view.gl.useProgram(this.program);

        this.vertexPositionAttribute=view.gl.getAttribLocation(this.program,'vertexPosition');

        this.perspectiveMatrixUniform=view.gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.modelMatrixUniform=view.gl.getUniformLocation(this.program,'modelMatrix');
        
        this.colorAlphaUniform=view.gl.getUniformLocation(this.program,'colorAlpha');

        view.gl.useProgram(null);

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
    }

    drawEnd(view)
    {
            // disable vertex attributes

        view.gl.disableVertexAttribArray(this.vertexPositionAttribute);

            // no longer using shader

        view.gl.useProgram(null);
    }
}

