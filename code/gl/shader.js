"use strict";

//
// shader object
//

var shader={};

//
// constants
//

shader.LIGHT_COUNT=4;

//
// shader globals
//

shader.shaderList=[];
shader.shaderCurrentIdx=-1;

//
// shader errors
//

shader.errorAlert=function(vertScriptId,fragScriptId,errStr)
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

shader.loadVertexShader=function(vertScriptId)
{
    var shader=gl.createShader(gl.VERTEX_SHADER);
    
    var script=document.getElementById(vertScriptId);
    
    gl.shaderSource(shader,script.text);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader,gl.COMPILE_STATUS)) return(shader);

    this.errorAlert(vertScriptId,-1,gl.getShaderInfoLog(shader));
    return(null);
};

shader.loadFragmentShader=function(fragScriptId)
{
    var shader=gl.createShader(gl.FRAGMENT_SHADER);
    
    var script=document.getElementById(fragScriptId);
    
    gl.shaderSource(shader,script.text);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader,gl.COMPILE_STATUS)) return(shader);

    this.errorAlert(-1,fragScriptId,gl.getShaderInfoLog(shader));
    return(null);
};

shader.load=function(shaderIndex,vertScriptId,fragScriptId)
{
        // get the shaders from iframes
        
    var vertexShader=this.loadVertexShader(vertScriptId);
    if (vertexShader===null) return(false);
    
    var fragmentShader=this.loadFragmentShader(fragScriptId);
    if (fragmentShader===null) return(false);

        // compile the program
        
    var program=gl.createProgram();
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) {
        this.errorAlert(vertScriptId,fragScriptId,gl.getProgramInfoLog(program));
        return(false);
    }
    
        // build internal shader program object
        
    var shaderProgram=new wsShaderProgramObject(program);

        // preset some attribute and uniform
        // pointers

    gl.useProgram(program);
    
    shaderProgram.vertexPositionAttribute=gl.getAttribLocation(program,'vertexPosition');
    shaderProgram.vertexNormalAttribute=gl.getAttribLocation(program,'vertexNormal');
    shaderProgram.vertexTangentAttribute=gl.getAttribLocation(program,'vertexTangent');    
    shaderProgram.vertexAndLightmapUVAttribute=gl.getAttribLocation(program,'vertexAndLightmapUV');
    
    shaderProgram.perspectiveMatrixUniform=gl.getUniformLocation(program,'perspectiveMatrix');
    shaderProgram.modelMatrixUniform=gl.getUniformLocation(program,'modelMatrix');
    shaderProgram.normalMatrixUniform=gl.getUniformLocation(program,'normalMatrix');
    
    shaderProgram.shineFactorUniform=gl.getUniformLocation(program,'shineFactor');
    
    shaderProgram.ambientUniform=gl.getUniformLocation(program,'ambient');

    var n,name;
    
    for (n=0;n!==this.LIGHT_COUNT;n++) {
        name='light_'+n;
        shaderProgram.lights[n].positionUniform=gl.getUniformLocation(program,name+'.position');
        shaderProgram.lights[n].colorUniform=gl.getUniformLocation(program,name+'.color');
        shaderProgram.lights[n].intensityUniform=gl.getUniformLocation(program,name+'.intensity');
        shaderProgram.lights[n].invertIntensityUniform=gl.getUniformLocation(program,name+'.invertIntensity');
        shaderProgram.lights[n].exponentUniform=gl.getUniformLocation(program,name+'.exponent');
    }
    
    shaderProgram.baseTexUniform=gl.getUniformLocation(program,'baseTex');
    shaderProgram.normalTexUniform=gl.getUniformLocation(program,'normalTex');
    shaderProgram.specularTexUniform=gl.getUniformLocation(program,'specularTex');
    shaderProgram.lightmapTexUniform=gl.getUniformLocation(program,'lightmapTex');
    
    gl.useProgram(null);
    
        // store in list
     
    this.shaderList[shaderIndex]=shaderProgram;
    
    return(true);
};

//
// drawing shader start/stop/set
//

shader.drawStart=function(view)
{
    var n,k,shaderProgram;
    
        // no current shader
        
    this.shaderCurrentIdx=-1;
    
        // set the uniforms on all the
        // shaders
        
    for (n=0;n!==this.shaderList.length;n++) {
        shaderProgram=this.shaderList[n];
        if (shaderProgram===null) continue;
        
            // set the program and remember
            // the last shader so we don't
            // have to reset if it's the first draw
            
        gl.useProgram(shaderProgram.program);
        
        this.shaderCurrentIdx=n;
        
            // matrix
        
        gl.uniformMatrix4fv(shaderProgram.perspectiveMatrixUniform,false,view.perspectiveMatrix);
        gl.uniformMatrix4fv(shaderProgram.modelMatrixUniform,false,view.modelMatrix);
        if (shaderProgram.normalMatrixUniform!==-1) gl.uniformMatrix3fv(shaderProgram.normalMatrixUniform,false,view.normalMatrix);
    
            // lighting
        
        if (shaderProgram.ambientUniform!==-1) gl.uniform3f(shaderProgram.ambientUniform,view.ambient.r,view.ambient.g,view.ambient.b);
        
        var n,shaderLight,viewLight;

        for (k=0;k!==this.LIGHT_COUNT;k++) {
            
            shaderLight=shaderProgram.lights[k];
            if (shaderLight.positionUniform===-1) continue;
            
            viewLight=view.lights[k];
            
                // no light sets everything to 0
                
            if (viewLight===null) {
                gl.uniform3f(shaderLight.positionUniform,0.0,0.0,0.0);
                gl.uniform3f(shaderLight.colorUniform,0.0,0.0,0.0);
                gl.uniform1f(shaderLight.intensityUniform,0.0);
                gl.uniform1f(shaderLight.invertIntensityUniform,0.0);
                gl.uniform1f(shaderLight.exponentUniform,1.0);
                continue;
            }

                // otherwise setup the light
                
            gl.uniform3f(shaderLight.positionUniform,viewLight.position.x,viewLight.position.y,viewLight.position.z);            
            if (viewLight.inLightmap) {
                gl.uniform3f(shaderLight.colorUniform,0.0,0.0,0.0);     // if in light map, then we set color to zero so it doesn't effect the pixel
            }
            else {
                gl.uniform3f(shaderLight.colorUniform,viewLight.color.r,viewLight.color.g,viewLight.color.b);
            }
            gl.uniform1f(shaderLight.intensityUniform,viewLight.intensity);
            gl.uniform1f(shaderLight.invertIntensityUniform,viewLight.invertIntensity);
            gl.uniform1f(shaderLight.exponentUniform,viewLight.exponent);
        }
    }
};

shader.drawEnd=function()
{
};

shader.drawSet=function(shaderIndex)
{
        // ignore if already on this shader
        
    if (this.shaderCurrentIdx===shaderIndex) return(this.shaderList[shaderIndex]);
    
        // switch to this shader
        
    var shaderProgram=this.shaderList[shaderIndex];
    gl.useProgram(shaderProgram.program);
    
    this.shaderCurrentIdx=shaderIndex;
    
    return(shaderProgram);
};
