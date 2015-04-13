"use strict";

//
// shader object
//

var mapShader={};

//
// constants and objects
//

mapShader.LIGHT_COUNT=4;

function mapShaderLight()
{
    this.positionUniform=null;
    this.colorUniform=null;
    this.intensityUniform=null;
    this.invertIntensityUniform=null;
    this.exponentUniform=null;
}

//
// variables
//

mapShader.shader=null;

mapShader.vertexPositionAttribute=null;
mapShader.vertexNormalAttribute=null;
mapShader.vertexTangentAttribute=null;    
mapShader.vertexAndLightmapUVAttribute=null;
    
mapShader.perspectiveMatrixUniform=null;
mapShader.modelMatrixUniform=null;
mapShader.normalMatrixUniform=null;

mapShader.shineFactorUniform=null;
mapShader.ambientUniform=null;

mapShader.lights=[];

//
// initialize/release shader
//

mapShader.initialize=function()
{
        // get a new shader object
        // and load/compile it
        
    this.shader=new shaderObject('wsMapVertShader','wsMapFragShader');
    if (this.shader.program===null) return(false);
    
        // setup uniforms
    
    gl.useProgram(this.shader.program);
    
    this.vertexPositionAttribute=gl.getAttribLocation(this.shader.program,'vertexPosition');
    this.vertexNormalAttribute=gl.getAttribLocation(this.shader.program,'vertexNormal');
    this.vertexTangentAttribute=gl.getAttribLocation(this.shader.program,'vertexTangent');    
    this.vertexAndLightmapUVAttribute=gl.getAttribLocation(this.shader.program,'vertexAndLightmapUV');
    
    this.perspectiveMatrixUniform=gl.getUniformLocation(this.shader.program,'perspectiveMatrix');
    this.modelMatrixUniform=gl.getUniformLocation(this.shader.program,'modelMatrix');
    this.normalMatrixUniform=gl.getUniformLocation(this.shader.program,'normalMatrix');
    
    this.shineFactorUniform=gl.getUniformLocation(this.shader.program,'shineFactor');    
    this.ambientUniform=gl.getUniformLocation(this.shader.program,'ambient');

    var n,name;
    
    for (n=0;n!==this.LIGHT_COUNT;n++) {
        this.lights.push(new mapShaderLight());
        
        name='light_'+n;
        this.lights[n].positionUniform=gl.getUniformLocation(this.shader.program,name+'.position');
        this.lights[n].colorUniform=gl.getUniformLocation(this.shader.program,name+'.color');
        this.lights[n].intensityUniform=gl.getUniformLocation(this.shader.program,name+'.intensity');
        this.lights[n].invertIntensityUniform=gl.getUniformLocation(this.shader.program,name+'.invertIntensity');
        this.lights[n].exponentUniform=gl.getUniformLocation(this.shader.program,name+'.exponent');
    }
    
        // these uniforms are always the same
        
    gl.uniform1i(gl.getUniformLocation(this.shader.program,'baseTex'),0);
    gl.uniform1i(gl.getUniformLocation(this.shader.program,'normalTex'),1);
    gl.uniform1i(gl.getUniformLocation(this.shader.program,'specularTex'),2);
    gl.uniform1i(gl.getUniformLocation(this.shader.program,'lightmapTex'),3);
    
    gl.useProgram(null);
    
    return(true);
};

mapShader.release=function()
{
    this.shader.release();
};

//
// drawing shader start/stop/set
//

mapShader.drawStart=function(view)
{
    var n;
    var shaderLight,viewLight;
    
        // using the map shader
        
    gl.useProgram(this.shader.program);

        // matrix

    gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,view.perspectiveMatrix);
    gl.uniformMatrix4fv(this.modelMatrixUniform,false,view.modelMatrix);
    gl.uniformMatrix3fv(this.normalMatrixUniform,false,view.normalMatrix);

        // lighting
        // SUPERGUMBA -- NOTE!!!!
        // windows has a dumb bug where two vec3 in a struct
        // will stomp on each other.  The work-around is to use
        // a vec4.  This is ugly. FIX LATER

    gl.uniform3f(this.ambientUniform,view.ambient.r,view.ambient.g,view.ambient.b);

    for (n=0;n!==this.LIGHT_COUNT;n++) {

        shaderLight=this.lights[n];
        viewLight=view.lights[n];

            // no light sets everything to 0

        if (viewLight===null) {
            gl.uniform4f(shaderLight.positionUniform,0.0,0.0,0.0,1.0);
            gl.uniform4f(shaderLight.colorUniform,1.0,1.0,0.0,0.0);
            gl.uniform1f(shaderLight.intensityUniform,0.0);
            gl.uniform1f(shaderLight.invertIntensityUniform,0.0);
            gl.uniform1f(shaderLight.exponentUniform,1.0);
            continue;
        }

            // otherwise setup the light

        gl.uniform4f(shaderLight.positionUniform,viewLight.position.x,viewLight.position.y,viewLight.position.z,1.0);
        if (viewLight.inLightmap) {
            gl.uniform4f(shaderLight.colorUniform,0.0,0.0,0.0,0.0);     // if in light map, then we set color to zero so it doesn't effect the pixel
        }
        else {
            gl.uniform4f(shaderLight.colorUniform,viewLight.color.r,viewLight.color.g,viewLight.color.b,0.0);
        }
        gl.uniform1f(shaderLight.intensityUniform,viewLight.intensity);
        gl.uniform1f(shaderLight.invertIntensityUniform,viewLight.invertIntensity);
        gl.uniform1f(shaderLight.exponentUniform,viewLight.exponent);
    }
    
        // enable the vertex attributes
        
    gl.enableVertexAttribArray(this.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.vertexNormalAttribute);
    gl.enableVertexAttribArray(this.vertexTangentAttribute);
    gl.enableVertexAttribArray(this.vertexAndLightmapUVAttribute);
};

mapShader.drawEnd=function()
{
        // disable vertex attributes
        
    gl.disableVertexAttribArray(this.vertexPositionAttribute);
    gl.disableVertexAttribArray(this.vertexNormalAttribute);
    gl.disableVertexAttribArray(this.vertexTangentAttribute);
    gl.disableVertexAttribArray(this.vertexAndLightmapUVAttribute);
    
        // no longer using shader
        
    gl.useProgram(null);
};
