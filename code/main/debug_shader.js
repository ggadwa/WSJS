"use strict";

//
// debug shader class
//

function DebugShaderObject()
{
    this.shader=null;

    this.vertexPositionAttribute=null;

    this.perspectiveMatrixUniform=null;
    this.modelMatrixUniform=null;
    
    this.colorUniform=null;

        //
        // initialize/release debug shader
        //

    this.initialize=function(view)
    {
            // get a new shader object
            // and load/compile it

        this.shader=new ShaderObject();
        if (!this.shader.initialize(view,'debug')) return(false);

            // setup uniforms

        view.gl.useProgram(this.shader.program);

        this.vertexPositionAttribute=view.gl.getAttribLocation(this.shader.program,'vertexPosition');

        this.perspectiveMatrixUniform=view.gl.getUniformLocation(this.shader.program,'perspectiveMatrix');
        this.modelMatrixUniform=view.gl.getUniformLocation(this.shader.program,'modelMatrix');
        
        this.colorUniform=view.gl.getUniformLocation(this.shader.program,'color');

        view.gl.useProgram(null);

        return(true);
    };

    this.release=function(view)
    {
        this.shader.release(view);
    };

        //
        // start/stop debug drawing
        //

    this.drawStart=function(view,color)
    {
            // using the map shader

        view.gl.useProgram(this.shader.program);

            // matrix

        view.gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,view.perspectiveMatrix);
        view.gl.uniformMatrix4fv(this.modelMatrixUniform,false,view.modelMatrix);
        
            // debug color
            
        view.gl.uniform3f(this.colorUniform,color.r,color.g,color.b);

            // enable the vertex attributes

        view.gl.enableVertexAttribArray(this.vertexPositionAttribute);
    };

    this.drawEnd=function(view)
    {
            // disable vertex attributes

        view.gl.disableVertexAttribArray(this.vertexPositionAttribute);

            // no longer using shader

        view.gl.useProgram(null);
    };
}

