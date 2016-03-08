//
// interface shader class
//

class InterfaceShader extends Shader
{
    constructor()
    {
        super();
        this.vertexPositionAttribute=null;
        this.orthoMatrixUniform=null;
        this.colorUniform=null;
    }
    
        //
        // initialize/release interface shader
        //

    initialize(view)
    {
            // get a new shader object
            // and load/compile it

        if (!super.initialize(view,'interface')) return(false);

            // setup uniforms

        view.gl.useProgram(this.program);

        this.vertexPositionAttribute=view.gl.getAttribLocation(this.program,'vertexPosition');

        this.orthoMatrixUniform=view.gl.getUniformLocation(this.program,'orthoMatrix');    
        this.colorUniform=view.gl.getUniformLocation(this.program,'color');

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

        view.gl.uniformMatrix4fv(this.orthoMatrixUniform,false,view.orthoMatrix);

            // enable the vertex attributes

        view.gl.enableVertexAttribArray(this.vertexPositionAttribute);
    }

    drawEnd(view)
    {
            // disable vertex attributes

        view.gl.disableVertexAttribArray(this.vertexPositionAttribute);

            // no longer using program

        view.gl.useProgram(null);
    }

}
