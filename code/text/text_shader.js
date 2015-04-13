"use strict";

//
// shader object
//

var textShader={};

//
// variables
//

textShader.shader=null;

textShader.vertexPositionAttribute=null;
textShader.vertexUVAttribute=null;
    
textShader.orthoMatrixUniform=null;
textShader.colorUniform=null;

//
// initialize/release shader
//

textShader.initialize=function()
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
};

textShader.release=function()
{
    this.shader.release();
};

//
// drawing shader start/stop/set
//

textShader.drawStart=function(view)
{
    gl.useProgram(this.shader.program);

        // setup the uniforms
        
    gl.uniformMatrix4fv(this.orthoMatrixUniform,false,view.orthoMatrix);
    
        // enable the vertex attributes
        
    gl.enableVertexAttribArray(this.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.vertexUVAttribute);
};

textShader.drawEnd=function()
{
        // disable vertex attributes
        
    gl.disableVertexAttribArray(this.vertexPositionAttribute);
    gl.disableVertexAttribArray(this.vertexUVAttribute);
    
        // no longer using program
        
    gl.useProgram(null);
};
