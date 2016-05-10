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

    initialize(view,fileCache)
    {
            // get a new shader object
            // and load/compile it

        if (!super.initialize(view,fileCache,'sky')) return(false);

            // setup uniforms

        view.gl.useProgram(this.program);

        this.vertexPositionAttribute=view.gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexUVAttribute=view.gl.getAttribLocation(this.program,'vertexUV');

        this.perspectiveMatrixUniform=view.gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.modelMatrixUniform=view.gl.getUniformLocation(this.program,'modelMatrix');

        view.gl.useProgram(null);

        return(true);
    }

    release(view)
    {
        super.release(view);
    }

        //
        // start/stop interface shader drawing
        //

    drawStart(view)
    {
        view.gl.useProgram(this.program);

            // setup the uniforms

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

            // no longer using program

        view.gl.useProgram(null);
    }

}
