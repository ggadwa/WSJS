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
};

//
// load shaders
//

function shaderLoadVertexShader(vertScriptId)
{
    this.vertexShader=gl.createShader(gl.VERTEX_SHADER);
    
    var script=document.getElementById(vertScriptId);    
    gl.shaderSource(this.vertexShader,script.text);
    gl.compileShader(this.vertexShader);

    if (gl.getShaderParameter(this.vertexShader,gl.COMPILE_STATUS)) return(true);

    this.errorAlert(vertScriptId,-1,gl.getShaderInfoLog(this.vertexShader));
    return(false);
};

function shaderLoadFragmentShader(fragScriptId)
{
    this.fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);
    
    var script=document.getElementById(fragScriptId);    
    gl.shaderSource(this.fragmentShader,script.text);
    gl.compileShader(this.fragmentShader);

    if (gl.getShaderParameter(this.fragmentShader,gl.COMPILE_STATUS)) return(true);

    this.errorAlert(-1,fragScriptId,gl.getShaderInfoLog(this.fragmentShader));
    return(false);
};

//
// close shader
//

function shaderClose()
{
    if (this.program===null) return;

    if (this.vertexShader!==null) {
        gl.detachShader(this.program,this.vertexShader);
        gl.deleteShader(this.vertexShader);
    }
    
    if (this.fragmentShader!==null) {
        gl.detachShader(this.program,this.fragmentShader);
        gl.deleteShader(this.fragmentShader);
    }
    
    gl.deleteProgram(this.program);
    
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

function shaderObject(vertScriptId,fragScriptId)
{
    this.vertexShader=null;
    this.fragmentShader=null;
    this.program=null;
    
        // need to define these upfront
        // so they can be called
    
    this.loadVertexShader=shaderLoadVertexShader;
    this.loadFragmentShader=shaderLoadFragmentShader;
    this.errorAlert=shaderErrorAlert;
    this.close=shaderClose;
    
        // get the shaders from divs
        
    if (!this.loadVertexShader(vertScriptId)) {
        this.close();
        return;
    }
    
    if (!this.loadFragmentShader(fragScriptId)) {
        this.close();
        return;
    }

        // compile the program
        
    this.program=gl.createProgram();
    gl.attachShader(this.program,this.vertexShader);
    gl.attachShader(this.program,this.fragmentShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program,gl.LINK_STATUS)) {
        this.errorAlert(vertScriptId,fragScriptId,gl.getProgramInfoLog(this.program));
        this.close();
    }
}
