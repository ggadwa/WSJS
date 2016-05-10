"use strict";

//
// text shader class
//

class TextShaderClass extends ShaderClass
{
    constructor()
    {
        super();
        
        this.vertexPositionAttribute=null;
        this.vertexUVAttribute=null;
        this.orthoMatrixUniform=null;
        this.colorUniform=null;
        
        Object.seal(this);
    }
    
    //
    // initialize/release text shader
    //

    initialize(view,fileCache)
    {
            // get a new shader object
            // and load/compile it

        if (!super.initialize(view,fileCache,'text')) return(false);

            // setup uniforms

        view.gl.useProgram(this.program);

        this.vertexPositionAttribute=view.gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexUVAttribute=view.gl.getAttribLocation(this.program,'vertexUV');

        this.orthoMatrixUniform=view.gl.getUniformLocation(this.program,'orthoMatrix');    
        this.colorUniform=view.gl.getUniformLocation(this.program,'color');

            // these uniforms are always the same

        view.gl.uniform1i(view.gl.getUniformLocation(this.program,'baseTex'),0);

        view.gl.useProgram(null);

        return(true);
    }

    release(view)
    {
        super.release(view);
    }

    //
    // start/stop text shader drawing
    //

    drawStart(view)
    {
        view.gl.useProgram(this.program);

            // setup the uniforms

        view.gl.uniformMatrix4fv(this.orthoMatrixUniform,false,view.orthoMatrix);

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
