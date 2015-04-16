"use strict";

//
// initialize/release text shader
//

function textShaderInitialize()
{
        // get a new shader object
        // and load/compile it
        
    this.shader=new shaderObject('wsTextVertShader','wsTextFragShader');
    if (this.shader.program===null) return(false);
    
        // setup uniforms
    
    gl.useProgram(this.shader.program);
    
    this.vertexPositionAttribute=gl.getAttribLocation(this.shader.program,'vertexPosition');
    this.vertexUVAttribute=gl.getAttribLocation(this.shader.program,'vertexUV');
    
    this.orthoMatrixUniform=gl.getUniformLocation(this.shader.program,'orthoMatrix');    
    this.colorUniform=gl.getUniformLocation(this.shader.program,'color');
    
        // these uniforms are always the same
        
    gl.uniform1i(gl.getUniformLocation(this.shader.program,'baseTex'),0);
    
    gl.useProgram(null);
    
    return(true);
}

function textShaderRelease()
{
    this.shader.release();
}

//
// start/stop text shader drawing
//

function textShaderDrawStart(view)
{
    gl.useProgram(this.shader.program);

        // setup the uniforms
        
    gl.uniformMatrix4fv(this.orthoMatrixUniform,false,view.orthoMatrix);
    
        // enable the vertex attributes
        
    gl.enableVertexAttribArray(this.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.vertexUVAttribute);
}

function textShaderDrawEnd()
{
        // disable vertex attributes
        
    gl.disableVertexAttribArray(this.vertexPositionAttribute);
    gl.disableVertexAttribArray(this.vertexUVAttribute);
    
        // no longer using program
        
    gl.useProgram(null);
}

//
// text shader object
//

function textShaderObject()
{
    this.shader=null;

    this.vertexPositionAttribute=null;
    this.vertexUVAttribute=null;

    this.orthoMatrixUniform=null;
    this.colorUniform=null;

    this.initialize=textShaderInitialize;
    this.release=textShaderRelease;
    this.drawStart=textShaderDrawStart;
    this.drawEnd=textShaderDrawEnd;
}
