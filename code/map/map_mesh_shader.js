import ShaderClass from '../../code/shader/shader.js';
import ShaderLightClass from '../../code/shader/shader_light.js';

//
// map shader object
//

export default class MapMeshShaderClass extends ShaderClass
{
    constructor(view)
    {
        super(view);
        
        this.vertexPositionAttribute=null;
        this.vertexNormalAttribute=null;
        this.vertexTangentAttribute=null;    
        this.vertexUVAttribute=null;

        this.perspectiveMatrixUniform=null;
        this.modelMatrixUniform=null;
        this.normalMatrixUniform=null;
        
        this.alphaUniform=null;
        this.shineFactorUniform=null;
        this.glowFactorUniform=null;
        this.ambientUniform=null;

        this.lights=[];
        
        this.finalInitCallback=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release map shader
        //

    initialize(callback)
    {
        this.finalInitCallback=callback;
        
            // load and compile the shader, requires callback

        super.initialize('map_mesh',this.initialize2.bind(this));
    }
    
    initialize2()
    {
        let n,name;
        let gl=this.view.gl;

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexNormalAttribute=gl.getAttribLocation(this.program,'vertexNormal');
        this.vertexTangentAttribute=gl.getAttribLocation(this.program,'vertexTangent');
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.modelMatrixUniform=gl.getUniformLocation(this.program,'modelMatrix');
        this.normalMatrixUniform=gl.getUniformLocation(this.program,'normalMatrix');

        this.alphaUniform=gl.getUniformLocation(this.program,'alpha');
        this.shineFactorUniform=gl.getUniformLocation(this.program,'shineFactor');
        this.glowFactorUniform=gl.getUniformLocation(this.program,'glowFactor');
        this.ambientUniform=gl.getUniformLocation(this.program,'ambient');
        
        for (n=0;n!==this.view.MAX_LIGHT_COUNT;n++) {
            this.lights.push(new ShaderLightClass());

            name='lights['+n+']';
            this.lights[n].positionIntensityUniform=gl.getUniformLocation(this.program,name+'.positionIntensity');
            this.lights[n].colorExponentUniform=gl.getUniformLocation(this.program,name+'.colorExponent');
        }

            // these uniforms are always the same

        gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);
        gl.uniform1i(gl.getUniformLocation(this.program,'normalTex'),1);
        gl.uniform1i(gl.getUniformLocation(this.program,'specularTex'),2);
        gl.uniform1i(gl.getUniformLocation(this.program,'glowTex'),3);

        gl.useProgram(null);

        this.finalInitCallback();
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
        let gl=this.view.gl;

        gl.useProgram(this.program);

            // matrix

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.view.perspectiveMatrix);
        gl.uniformMatrix4fv(this.modelMatrixUniform,false,this.view.modelMatrix);
        gl.uniformMatrix3fv(this.normalMatrixUniform,false,this.view.normalMatrix);

            // lighting
            // these are packed, where the first vec4 is x,y,z,intensity (position and intensity)
            // and the second vec4 is r,g,b,exponent (color and exponent)

        gl.uniform3f(this.ambientUniform,this.view.ambient.r,this.view.ambient.g,this.view.ambient.b);
        
        for (n=0;n!==this.view.MAX_LIGHT_COUNT;n++) {

            light=this.lights[n];
            viewLight=this.view.lights[n];

                // no light sets everything to 0

            if (viewLight===null) {
                gl.uniform4f(light.positionIntensityUniform,0.0,0.0,0.0,1.0);    // x,y,z,intensity
                gl.uniform4f(light.colorExponentUniform,1.0,1.0,0.0,1.0);       // r,g,b,exponent
                continue;
            }

                // otherwise setup the light

            gl.uniform4f(light.positionIntensityUniform,viewLight.eyePosition.x,viewLight.eyePosition.y,viewLight.eyePosition.z,viewLight.intensity);
            gl.uniform4f(light.colorExponentUniform,viewLight.color.r,viewLight.color.g,viewLight.color.b,viewLight.exponent);
        }

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexNormalAttribute);
        gl.enableVertexAttribArray(this.vertexTangentAttribute);
        gl.enableVertexAttribArray(this.vertexUVAttribute);
    }

    drawEnd()
    {
        let gl=this.view.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexNormalAttribute);
        gl.disableVertexAttribArray(this.vertexTangentAttribute);
        gl.disableVertexAttribArray(this.vertexUVAttribute);

            // no longer using shader

        gl.useProgram(null);
    }

}
