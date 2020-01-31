import CoreClass from '../main/core.js';
import ShaderClass from '../shader/shader.js';
import ShaderLightClass from '../shader/shader_light.js';
import ModelSkeletonClass from '../model/model_skeleton.js';

//
// model mesh shader class
//

export default class ModelMeshShaderClass extends ShaderClass
{
    constructor(core)
    {
        super(core);
        
        this.shaderName='model_mesh';
        
        this.vertexPositionAttribute=null;
        this.vertexNormalAttribute=null;
        this.vertexTangentAttribute=null;    
        this.vertexUVAttribute=null;
        this.vertexJointAttribute=null;
        this.vertexWeightAttribute=null;

        this.perspectiveMatrixUniform=null;
        this.viewMatrixUniform=null;
        this.modelMatrixUniform=null;       //normal matrix is calculated in vert shader because of skin (view*model*skin)
        
        this.noSkinUniform=null;
        this.noSkinAttachedNodeMatrixUniform=null;
        this.jointMatrixUniformArray=[];

        this.specularFactorUniform=null;
        this.glowFactorUniform=null;

        this.lightMinUniform=null;
        this.lightMaxUniform=null;
        
        this.lights=[];
        
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
        this.vertexNormalAttribute=gl.getAttribLocation(this.program,'vertexNormal');
        this.vertexTangentAttribute=gl.getAttribLocation(this.program,'vertexTangent');
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');
        this.vertexJointAttribute=gl.getAttribLocation(this.program,'vertexJoint');
        this.vertexWeightAttribute=gl.getAttribLocation(this.program,'vertexWeight');
        
        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.viewMatrixUniform=gl.getUniformLocation(this.program,'viewMatrix');
        this.modelMatrixUniform=gl.getUniformLocation(this.program,'modelMatrix');
        
        this.noSkinUniform=gl.getUniformLocation(this.program,'noSkin');
        this.noSkinAttachedNodeMatrixUniform=gl.getUniformLocation(this.program,'noSkinAttachedNodeMatrix');
        
        for (n=0;n!==this.core.MAX_SKELETON_JOINT;n++) {
            name='jointMatrix['+n+']';
            this.jointMatrixUniformArray.push(gl.getUniformLocation(this.program,name));
        }

        this.specularFactorUniform=gl.getUniformLocation(this.program,'specularFactor');
        this.glowFactorUniform=gl.getUniformLocation(this.program,'glowFactor');
        
        this.lightMinUniform=gl.getUniformLocation(this.program,'lightMin');
        this.lightMaxUniform=gl.getUniformLocation(this.program,'lightMax');

        for (n=0;n!==this.core.MAX_LIGHT_COUNT;n++) {
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
        gl.uniform1i(gl.getUniformLocation(this.program,'maskTex'),4);

        gl.useProgram(null);
    }
    
        //
        // start/stop model shader drawing
        //

    drawStart()
    {
        let n;
        let light,viewLight;
        let gl=this.core.gl;

            // using the model shader

        gl.useProgram(this.program);

            // matrix
            // model matrixes are calculated at a per model and sometimes mesh
            // level, the normal matrix is calculated in the shader
            // because skinning needs to be multiplied in

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.core.perspectiveMatrix.data);
        gl.uniformMatrix4fv(this.viewMatrixUniform,false,this.core.viewMatrix.data);

            // lighting
            // these are packed, where the first vec4 is x,y,z,intensity (position and intensity)
            // and the second vec4 is r,g,b,exponent (color and exponent)

        for (n=0;n!==this.core.MAX_LIGHT_COUNT;n++) {

            light=this.lights[n];
            viewLight=this.core.lights[n];

                // no light sets intensity to 0

            if (viewLight===null) {
                gl.uniform4f(light.positionIntensityUniform,0.0,0.0,0.0,0.0);        // x,y,z,intensity
                gl.uniform4f(light.colorExponentUniform,1.0,1.0,0.0,1.0);           // r,g,b,exponent
                continue;
            }

                // otherwise setup the radial light

            gl.uniform4f(light.positionIntensityUniform,viewLight.eyePosition.x,viewLight.eyePosition.y,viewLight.eyePosition.z,viewLight.intensity);
            gl.uniform4f(light.colorExponentUniform,viewLight.color.r,viewLight.color.g,viewLight.color.b,viewLight.exponent);
        }
        
        gl.uniform3f(this.lightMinUniform,this.core.map.lightList.lightMin.r,this.core.map.lightList.lightMin.g,this.core.map.lightList.lightMin.b);
        gl.uniform3f(this.lightMaxUniform,this.core.map.lightList.lightMax.r,this.core.map.lightList.lightMax.g,this.core.map.lightList.lightMax.b);

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexNormalAttribute);
        gl.enableVertexAttribArray(this.vertexTangentAttribute);
        gl.enableVertexAttribArray(this.vertexUVAttribute);
        gl.enableVertexAttribArray(this.vertexJointAttribute);
        gl.enableVertexAttribArray(this.vertexWeightAttribute);
    }

    drawEnd()
    {
        let gl=this.core.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexNormalAttribute);
        gl.disableVertexAttribArray(this.vertexTangentAttribute);
        gl.disableVertexAttribArray(this.vertexUVAttribute);
        gl.disableVertexAttribArray(this.vertexJointAttribute);
        gl.disableVertexAttribArray(this.vertexWeightAttribute);

            // no longer using shader

        gl.useProgram(null);
    }

}
