/* global view */

"use strict";

//
// sky shader class
//

class SkyShaderClass extends ShaderClass
{
    constructor()
    {
        super();
        
        this.vertexPositionAttribute=null;
        this.vertexUVAttribute=null;
        this.perspectiveMatrixUniform=null;
        this.modelMatrixUniform=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release sky shader
        //

    initialize()
    {
        let gl=view.gl;
        
            // get a new shader object
            // and load/compile it

        if (!super.initialize('sky')) return(false);

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.modelMatrixUniform=gl.getUniformLocation(this.program,'modelMatrix');

        gl.useProgram(null);

        return(true);
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
        let gl=view.gl;
        
        gl.useProgram(this.program);

            // setup the uniforms

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,view.perspectiveMatrix);
        gl.uniformMatrix4fv(this.modelMatrixUniform,false,view.modelMatrix);

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexUVAttribute);
    }

    drawEnd()
    {
        let gl=view.gl;
        
            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexUVAttribute);

            // no longer using program

        gl.useProgram(null);
    }

}
