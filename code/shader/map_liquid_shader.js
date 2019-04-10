import CoreClass from '../main/core.js';
import ShaderClass from '../shader/shader.js';
import ShaderLightClass from '../shader/shader_light.js';
import Matrix3Class from '../utility/matrix3.js';

//
// map shader object
//

export default class MapLiquidShaderClass extends ShaderClass
{
    constructor(core)
    {
        super(core);
        
        this.shaderName='map_liquid';
        
        this.vertexPositionAttribute=null;
        this.vertexUVAttribute=null;

        this.perspectiveMatrixUniform=null;
        this.viewMatrixUniform=null;
        this.normalMatrixUniform=null;
        
        this.ambientUniform=null;
        
        this.lights=[];
        
            // some pre-allocated matrixes
            
        this.normalMatrix=new Matrix3Class();        
        
        Object.seal(this);
    }
    
        //
        // load finish
        //

    loadFinish()
    {
        let n,name;
        let gl=this.core.gl;

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');
        
        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.viewMatrixUniform=gl.getUniformLocation(this.program,'viewMatrix');
        this.normalMatrixUniform=gl.getUniformLocation(this.program,'normalMatrix');
        
        this.ambientUniform=gl.getUniformLocation(this.program,'ambient');
        
        for (n=0;n!==CoreClass.MAX_LIGHT_COUNT;n++) {
            this.lights.push(new ShaderLightClass());

            name='lights['+n+']';
            this.lights[n].positionIntensityUniform=gl.getUniformLocation(this.program,name+'.positionIntensity');
            this.lights[n].colorExponentUniform=gl.getUniformLocation(this.program,name+'.colorExponent');
        }

            // these uniforms are always the same

        gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);

        gl.useProgram(null);
    }

        //
        // start/stop liquid shader drawing
        //

    drawStart()
    {
        let n,light,viewLight;
        let gl=this.core.gl;

        gl.useProgram(this.program);

            // matrix

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.core.perspectiveMatrix.data);
        gl.uniformMatrix4fv(this.viewMatrixUniform,false,this.core.viewMatrix.data);
        
            // there's no model matrix for liquids
            // so this is just the transpose inverse of
            // the view matrix
            
        this.normalMatrix.setInvertTransposeFromMat4(this.core.viewMatrix);
        gl.uniformMatrix3fv(this.normalMatrixUniform,false,this.normalMatrix.data);
        
            // ambient
            
        gl.uniform3f(this.ambientUniform,this.core.ambient.r,this.core.ambient.g,this.core.ambient.b);

            // lighting
            // these are packed, where the first vec4 is x,y,z,intensity (position and intensity)
            // and the second vec4 is r,g,b,exponent (color and exponent)
            
            // if intensity = 0 light is off
        
        for (n=0;n!==CoreClass.MAX_LIGHT_COUNT;n++) {

            light=this.lights[n];
            viewLight=this.core.lights[n];

                // no light sets intensity to 0

            if (viewLight===null) {
                gl.uniform4f(light.positionIntensityUniform,0.0,0.0,0.0,0.0);    // x,y,z,intensity
                gl.uniform4f(light.colorExponentUniform,1.0,1.0,1.0,1.0);       // r,g,b,exponent
                continue;
            }

                // otherwise setup the radial light

            gl.uniform4f(light.positionIntensityUniform,viewLight.eyePosition.x,viewLight.eyePosition.y,viewLight.eyePosition.z,viewLight.intensity);
            gl.uniform4f(light.colorExponentUniform,viewLight.color.r,viewLight.color.g,viewLight.color.b,viewLight.exponent);
        }

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexUVAttribute);
    }

    drawEnd()
    {
        let gl=this.core.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexUVAttribute);

            // no longer using shader

        gl.useProgram(null);
    }

}
