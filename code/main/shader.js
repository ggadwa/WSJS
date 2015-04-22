"use strict";

//
// shader errors
//

function shaderErrorAlert(vertScriptId,fragScriptId,errStr)
{
    var str='Shader Error\n';
    if (vertScriptId!==-1) str+=('Vert Shader:'+vertScriptId+'\n');
    if (fragScriptId!==-1) str+=('Frag Shader:'+fragScriptId+'\n');
    str+='-----------------------\n';
    str+=errStr;
    
    alert(str);
}

//
// load shaders
//

function shaderLoadVertexShader(view,vertScriptId)
{
    this.vertexShader=view.gl.createShader(view.gl.VERTEX_SHADER);
    
    var script=document.getElementById(vertScriptId);    
    view.gl.shaderSource(this.vertexShader,script.text);
    view.gl.compileShader(this.vertexShader);

    if (view.gl.getShaderParameter(this.vertexShader,view.gl.COMPILE_STATUS)) return(true);

    this.errorAlert(vertScriptId,-1,view.gl.getShaderInfoLog(this.vertexShader));
    return(false);
}

function shaderLoadFragmentShader(view,fragScriptId)
{
    this.fragmentShader=view.gl.createShader(view.gl.FRAGMENT_SHADER);
    
    var script=document.getElementById(fragScriptId);    
    view.gl.shaderSource(this.fragmentShader,script.text);
    view.gl.compileShader(this.fragmentShader);

    if (view.gl.getShaderParameter(this.fragmentShader,view.gl.COMPILE_STATUS)) return(true);

    this.errorAlert(-1,fragScriptId,view.gl.getShaderInfoLog(this.fragmentShader));
    return(false);
}

//
// initialize/release shader
//

function shaderInitialize(view,vertScriptId,fragScriptId)
{
        // get the shaders from divs
        
    if (!this.loadVertexShader(view,vertScriptId)) {
        this.release();
        return(false);
    }
    
    if (!this.loadFragmentShader(view,fragScriptId)) {
        this.release();
        return(false);
    }

        // compile the program
        
    this.program=view.gl.createProgram();
    view.gl.attachShader(this.program,this.vertexShader);
    view.gl.attachShader(this.program,this.fragmentShader);
    view.gl.linkProgram(this.program);

    if (!view.gl.getProgramParameter(this.program,view.gl.LINK_STATUS)) {
        this.errorAlert(vertScriptId,fragScriptId,view.gl.getProgramInfoLog(this.program));
        this.release();
        return(false);
    }
    
    return(true);
}

function shaderRelease(view)
{
    if (this.program===null) return;

    if (this.vertexShader!==null) {
        view.gl.detachShader(this.program,this.vertexShader);
        view.gl.deleteShader(this.vertexShader);
    }
    
    if (this.fragmentShader!==null) {
        view.gl.detachShader(this.program,this.fragmentShader);
        view.gl.deleteShader(this.fragmentShader);
    }
    
    view.gl.deleteProgram(this.program);
    
    this.vertexShader=null;
    this.fragmentShader=null;
    this.program=null;
}

//
// shader light object
//

function shaderLightObject()
{
    this.positionUniform=null;
    this.colorUniform=null;
    this.intensityUniform=null;
    this.invertIntensityUniform=null;
    this.exponentUniform=null;
}

//
// main shader object
//

function shaderObject()
{
    this.vertexShader=null;
    this.fragmentShader=null;
    this.program=null;
    
        // need to define these upfront
        // so they can be called
        
    this.initialize=shaderInitialize;
    this.release=shaderRelease;
    
    this.loadVertexShader=shaderLoadVertexShader;
    this.loadFragmentShader=shaderLoadFragmentShader;
    this.errorAlert=shaderErrorAlert;
 }
