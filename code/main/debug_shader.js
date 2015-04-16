"use strict";

//
// initialize/release debug shader
//

function debugShaderInitialize()
{
        // get a new shader object
        // and load/compile it
        
    this.shader=new shaderObject('wsDebugVertShader','wsDebugFragShader');
    if (this.shader.program===null) return(false);
    
        // setup uniforms
    
    gl.useProgram(this.shader.program);
    
    this.vertexPositionAttribute=gl.getAttribLocation(this.shader.program,'vertexPosition');
    
    this.perspectiveMatrixUniform=gl.getUniformLocation(this.shader.program,'perspectiveMatrix');
    this.modelMatrixUniform=gl.getUniformLocation(this.shader.program,'modelMatrix');
    
    gl.useProgram(null);
    
    return(true);
}

function debugShaderRelease()
{
    this.shader.release();
}

//
// start/stop debug drawing
//

function debugShaderDrawStart(view)
{
        // using the map shader
        
    gl.useProgram(this.shader.program);

        // matrix

    gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,view.perspectiveMatrix);
    gl.uniformMatrix4fv(this.modelMatrixUniform,false,view.modelMatrix);
    
        // enable the vertex attributes
        
    gl.enableVertexAttribArray(this.vertexPositionAttribute);
}

function debugShaderDrawEnd()
{
        // disable vertex attributes
        
    gl.disableVertexAttribArray(this.vertexPositionAttribute);
    
        // no longer using shader
        
    gl.useProgram(null);
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

