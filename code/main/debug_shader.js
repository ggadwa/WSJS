"use strict";

//
// initialize/release debug shader
//

function debugShaderInitialize(view)
{
        // get a new shader object
        // and load/compile it
        
    this.shader=new shaderObject();
    if (!this.shader.initialize(view,'wsDebugVertShader','wsDebugFragShader')) return(false);
    
        // setup uniforms
    
    view.gl.useProgram(this.shader.program);
    
    this.vertexPositionAttribute=view.gl.getAttribLocation(this.shader.program,'vertexPosition');
    
    this.perspectiveMatrixUniform=view.gl.getUniformLocation(this.shader.program,'perspectiveMatrix');
    this.modelMatrixUniform=view.gl.getUniformLocation(this.shader.program,'modelMatrix');
    
    view.gl.useProgram(null);
    
    return(true);
}

function debugShaderRelease(view)
{
    this.shader.release(view);
}

//
// start/stop debug drawing
//

function debugShaderDrawStart(view)
{
        // using the map shader
        
    view.gl.useProgram(this.shader.program);

        // matrix

    view.gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,view.perspectiveMatrix);
    view.gl.uniformMatrix4fv(this.modelMatrixUniform,false,view.modelMatrix);
    
        // enable the vertex attributes
        
    view.gl.enableVertexAttribArray(this.vertexPositionAttribute);
}

function debugShaderDrawEnd(view)
{
        // disable vertex attributes
        
    view.gl.disableVertexAttribArray(this.vertexPositionAttribute);
    
        // no longer using shader
        
    view.gl.useProgram(null);
}

//
// debug shader object
//

function debugShaderObject()
{
    this.shader=null;

    this.vertexPositionAttribute=null;

    this.perspectiveMatrixUniform=null;
    this.modelMatrixUniform=null;

    this.initialize=debugShaderInitialize;
    this.release=debugShaderRelease;
    this.drawStart=debugShaderDrawStart;
    this.drawEnd=debugShaderDrawEnd;
}

