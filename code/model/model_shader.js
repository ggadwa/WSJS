"use strict";

//
// model shader class
//

function ModelShaderObject()
{
    this.shader=null;

    this.vertexPositionAttribute=null;
    this.vertexNormalAttribute=null;
    this.vertexTangentAttribute=null;    
    this.vertexUVAttribute=null;

    this.perspectiveMatrixUniform=null;
    this.modelMatrixUniform=null;
    this.normalMatrixUniform=null;

    this.shineFactorUniform=null;
    this.ambientUniform=null;

    this.lights=[];

        //
        // initialize/release model shader
        //

    this.initialize=function(view)
    {
            // get a new shader object
            // and load/compile it

        this.shader=new ShaderObject();
        if (!this.shader.initialize(view,'wsModelVertShader','wsModelFragShader')) return(false);

            // setup uniforms

        var gl=view.gl;

        gl.useProgram(this.shader.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.shader.program,'vertexPosition');
        this.vertexNormalAttribute=gl.getAttribLocation(this.shader.program,'vertexNormal');
        this.vertexTangentAttribute=gl.getAttribLocation(this.shader.program,'vertexTangent');    
        this.vertexUVAttribute=gl.getAttribLocation(this.shader.program,'vertexUV');

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.shader.program,'perspectiveMatrix');
        this.modelMatrixUniform=gl.getUniformLocation(this.shader.program,'modelMatrix');
        this.normalMatrixUniform=gl.getUniformLocation(this.shader.program,'normalMatrix');

        this.shineFactorUniform=gl.getUniformLocation(this.shader.program,'shineFactor');    
        this.ambientUniform=gl.getUniformLocation(this.shader.program,'ambient');

        var n,name;

        for (n=0;n!==view.LIGHT_COUNT;n++) {
            this.lights.push(new ShaderLightObject());

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

        gl.useProgram(null);

        return(true);
    };

    this.rRelease=function(view)
    {
        this.shader.release(view);
    };

        //
        // start/stop model shader drawing
        //

    this.drawStart=function(view)
    {
        var n;
        var light,viewLight;

            // using the model shader

        var gl=view.gl;

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

        for (n=0;n!==view.LIGHT_COUNT;n++) {

            light=this.lights[n];
            viewLight=view.lights[n];

                // no light sets everything to 0

            if (viewLight===null) {
                gl.uniform4f(light.positionUniform,0.0,0.0,0.0,1.0);
                gl.uniform4f(light.colorUniform,1.0,1.0,0.0,0.0);
                gl.uniform1f(light.intensityUniform,0.0);
                gl.uniform1f(light.invertIntensityUniform,0.0);
                gl.uniform1f(light.exponentUniform,1.0);
                continue;
            }

                // otherwise setup the light
                // models have no light maps so all lights are considered

            gl.uniform4f(light.positionUniform,viewLight.eyePosition.x,viewLight.eyePosition.y,viewLight.eyePosition.z,1.0);
            gl.uniform4f(light.colorUniform,viewLight.color.r,viewLight.color.g,viewLight.color.b,0.0);
            gl.uniform1f(light.intensityUniform,viewLight.intensity);
            gl.uniform1f(light.invertIntensityUniform,viewLight.invertIntensity);
            gl.uniform1f(light.exponentUniform,viewLight.exponent);
        }

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexNormalAttribute);
        gl.enableVertexAttribArray(this.vertexTangentAttribute);
        gl.enableVertexAttribArray(this.vertexUVAttribute);
    };

    this.drawEnd=function(view)
    {
        var gl=view.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexNormalAttribute);
        gl.disableVertexAttribArray(this.vertexTangentAttribute);
        gl.disableVertexAttribArray(this.vertexUVAttribute);

            // no longer using shader

        gl.useProgram(null);
    };

}
