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

mapShader.program=null;

mapShader.vertexPositionAttribute=null;
mapShader.vertexNormalAttribute=null;
mapShader.vertexTangentAttribute=null;    
mapShader.vertexAndLightmapUVAttribute=null;
    
mapShader.perspectiveMatrixUniform=null;
mapShader.modelMatrixUniform=null;
mapShader.normalMatrixUniform=null;
    
mapShader.lights=[];

//
// setup shader
//

mapShader.initialize=function()
{
        // load and compile the
        // map shader
        
    if (!shader.load(0,'wsMapVertShader','wsMapFragShader')) return(false);
    
    this.program=shader.shaderList[0].program;
    
        // setup uniforms
    
    gl.useProgram(this.program);
    
    this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');
    this.vertexNormalAttribute=gl.getAttribLocation(this.program,'vertexNormal');
    this.vertexTangentAttribute=gl.getAttribLocation(this.program,'vertexTangent');    
    this.vertexAndLightmapUVAttribute=gl.getAttribLocation(this.program,'vertexAndLightmapUV');
    
    this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
    this.modelMatrixUniform=gl.getUniformLocation(this.program,'modelMatrix');
    this.normalMatrixUniform=gl.getUniformLocation(this.program,'normalMatrix');
    
    this.shineFactorUniform=gl.getUniformLocation(this.program,'shineFactor');
    
    this.ambientUniform=gl.getUniformLocation(this.program,'ambient');

    var n,name;
    
    for (n=0;n!==this.LIGHT_COUNT;n++) {
        this.lights.push(new mapShaderLight());
        
        name='light_'+n;
        this.lights[n].positionUniform=gl.getUniformLocation(this.program,name+'.position');
        this.lights[n].colorUniform=gl.getUniformLocation(this.program,name+'.color');
        this.lights[n].intensityUniform=gl.getUniformLocation(this.program,name+'.intensity');
        this.lights[n].invertIntensityUniform=gl.getUniformLocation(this.program,name+'.invertIntensity');
        this.lights[n].exponentUniform=gl.getUniformLocation(this.program,name+'.exponent');
    }
    
        // these uniforms are always the same
        
    gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);
    gl.uniform1i(gl.getUniformLocation(this.program,'normalTex'),1);
    gl.uniform1i(gl.getUniformLocation(this.program,'specularTex'),2);
    gl.uniform1i(gl.getUniformLocation(this.program,'lightmapTex'),3);
    
    gl.useProgram(null);
    
    return(true);
}

//
// drawing shader start/stop/set
//

mapShader.drawStart=function(view)
{
    var n;
    var shaderLight,viewLight;
    
        // using the map shader
        
    gl.useProgram(this.program);

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
};

mapShader.drawEnd=function()
{
    gl.useProgram(null);
};
