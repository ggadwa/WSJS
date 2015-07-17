"use strict";

//
// interface shader class
//

function InterfaceShaderObject()
{
    this.shader=null;

    this.vertexPositionAttribute=null;

    this.orthoMatrixUniform=null;
    this.colorUniform=null;

    //
    // initialize/release interface shader
    //

    this.initialize=function(view)
    {
            // get a new shader object
            // and load/compile it

        this.shader=new ShaderObject();
        if (!this.shader.initialize(view,'wsInterfaceVertShader','wsInterfaceFragShader')) return(false);

            // setup uniforms

        view.gl.useProgram(this.shader.program);

        this.vertexPositionAttribute=view.gl.getAttribLocation(this.shader.program,'vertexPosition');

        this.orthoMatrixUniform=view.gl.getUniformLocation(this.shader.program,'orthoMatrix');    
        this.colorUniform=view.gl.getUniformLocation(this.shader.program,'color');

        view.gl.useProgram(null);

        return(true);
    };

    this.release=function(view)
    {
        this.shader.release(view);
    };

    //
    // start/stop interface shader drawing
    //

    this.drawStart=function(view)
    {
        view.gl.useProgram(this.shader.program);

            // setup the uniforms

        view.gl.uniformMatrix4fv(this.orthoMatrixUniform,false,view.orthoMatrix);

            // enable the vertex attributes

        view.gl.enableVertexAttribArray(this.vertexPositionAttribute);
    };

    this.drawEnd=function(view)
    {
            // disable vertex attributes

        view.gl.disableVertexAttribArray(this.vertexPositionAttribute);

            // no longer using program

        view.gl.useProgram(null);
    };

}
