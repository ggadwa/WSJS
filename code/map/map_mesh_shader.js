/* global view */

"use strict";

//
// map shader object
//

class MapMeshShaderClass extends ShaderClass
{
    constructor()
    {
        super();
        
        this.vertexPositionAttribute=null;
        this.vertexNormalAttribute=null;
        this.vertexTangentAttribute=null;    
        this.vertexAndLightmapUVAttribute=null;

        this.perspectiveMatrixUniform=null;
        this.modelMatrixUniform=null;
        this.normalMatrixUniform=null;

        this.shineFactorUniform=null;
        this.ambientUniform=null;

        this.lights=[];
        
        Object.seal(this);
    }
    
        //
        // initialize/release map shader
        //

    initialize()
    {
        let n,name;
        let gl=view.gl;
        
            // get a new shader object
            // and load/compile it

        if (!super.initialize('map_mesh')) return(false);

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

        for (n=0;n!==view.LIGHT_COUNT;n++) {
            this.lights.push(new ShaderLightClass());

            name='light_'+n;
            this.lights[n].positionIntensityUniform=gl.getUniformLocation(this.program,name+'.positionIntensity');
            this.lights[n].colorExponentUniform=gl.getUniformLocation(this.program,name+'.colorExponent');
        }

            // these uniforms are always the same

        gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);
        gl.uniform1i(gl.getUniformLocation(this.program,'normalTex'),1);
        gl.uniform1i(gl.getUniformLocation(this.program,'specularTex'),2);
        gl.uniform1i(gl.getUniformLocation(this.program,'lightmapTex'),3);

        gl.useProgram(null);

        return(true);
    }

    release()
    {
        super.release();
    }

        //
        // start/stop map shader drawing
        //

    drawStart()
    {
        let n;
        let light,viewLight;
        let gl=view.gl;

        gl.useProgram(this.program);

            // matrix

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,view.perspectiveMatrix);
        gl.uniformMatrix4fv(this.modelMatrixUniform,false,view.modelMatrix);
        gl.uniformMatrix3fv(this.normalMatrixUniform,false,view.normalMatrix);

            // lighting
            // these are packed, where the first vec4 is x,y,z,intensity (position and intensity)
            // and the second vec4 is r,g,b,exponent (color and exponent)

        gl.uniform3f(this.ambientUniform,view.ambient.r,view.ambient.g,view.ambient.b);

        for (n=0;n!==view.LIGHT_COUNT;n++) {

            light=this.lights[n];
            viewLight=view.lights[n];

                // no light sets everything to 0

            if (viewLight===null) {
                gl.uniform4f(light.positionIntensityUniform,0.0,0.0,0.0,1.0);    // x,y,z,intensity
                gl.uniform4f(light.colorExponentUniform,1.0,1.0,0.0,1.0);       // r,g,b,exponent
                continue;
            }

                // otherwise setup the light

            gl.uniform4f(light.positionIntensityUniform,viewLight.eyePosition.x,viewLight.eyePosition.y,viewLight.eyePosition.z,viewLight.intensity);
            if (viewLight.inLightmap) {
                gl.uniform4f(light.colorExponentUniform,0.0,0.0,0.0,1.0);     // if in light map, then we set color to zero so it doesn't effect the pixel
            }
            else {
                gl.uniform4f(light.colorExponentUniform,viewLight.color.r,viewLight.color.g,viewLight.color.b,viewLight.exponent);
            }
        }

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexNormalAttribute);
        gl.enableVertexAttribArray(this.vertexTangentAttribute);
        gl.enableVertexAttribArray(this.vertexAndLightmapUVAttribute);
    }

    drawEnd()
    {
        let gl=view.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexNormalAttribute);
        gl.disableVertexAttribArray(this.vertexTangentAttribute);
        gl.disableVertexAttribArray(this.vertexAndLightmapUVAttribute);

            // no longer using shader

        gl.useProgram(null);
    }

}
