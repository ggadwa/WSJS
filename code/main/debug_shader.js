//
// debug shader class
//

class DebugShader extends Shader
{
    constructor()
    {
        super();
        this.vertexPositionAttribute=null;
        this.perspectiveMatrixUniform=null;
        this.modelMatrixUniform=null;
        this.colorUniform=null;
    }
    
        //
        // initialize/release debug shader
        //

    initialize(view)
    {
            // get a new shader object
            // and load/compile it

        if (!super.initialize(view,'debug')) return(false);

            // setup uniforms

        view.gl.useProgram(this.program);

        this.vertexPositionAttribute=view.gl.getAttribLocation(this.program,'vertexPosition');

        this.perspectiveMatrixUniform=view.gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.modelMatrixUniform=view.gl.getUniformLocation(this.program,'modelMatrix');
        
        this.colorUniform=view.gl.getUniformLocation(this.program,'color');

        view.gl.useProgram(null);

        return(true);
    }

    release(view)
    {
        super.release(view);
    }

        //
        // start/stop debug drawing
        //

    drawStart(view,color)
    {
            // using the map shader

        view.gl.useProgram(this.program);

            // matrix

        view.gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,view.perspectiveMatrix);
        view.gl.uniformMatrix4fv(this.modelMatrixUniform,false,view.modelMatrix);
        
            // debug color
            
        view.gl.uniform3f(this.colorUniform,color.r,color.g,color.b);

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

