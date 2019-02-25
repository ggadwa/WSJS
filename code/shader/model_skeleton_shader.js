import config from '../main/config.js';
import ShaderClass from '../shader/shader.js';

//
// model skeleton shader class
//

export default class ModelSkeletonShaderClass extends ShaderClass
{
    constructor(view)
    {
        super(view);
        
        this.vertexShaderURL='shaders/model_skeleton.vert';
        this.fragmentShaderURL='shaders/model_skeleton.frag';
        
        this.vertexPositionAttribute=null;

        this.perspectiveMatrixUniform=null;
        this.viewMatrixUniform=null;
        this.modelMatrixUniform=null;
        
        this.colorUniform=null;
        
        Object.seal(this);
    }
    
        //
        // load finish
        //

    loadFinish()
    {
        let gl=this.view.gl;

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.viewMatrixUniform=gl.getUniformLocation(this.program,'viewMatrix');
        this.modelMatrixUniform=gl.getUniformLocation(this.program,'modelMatrix');

        this.colorUniform=gl.getUniformLocation(this.program,'color');

        gl.useProgram(null);
    }
    
        //
        // start/stop skeleton shader drawing
        //

    drawStart()
    {
        let gl=this.view.gl;

            // using the skeleton shader

        gl.useProgram(this.program);

            // matrix

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.view.perspectiveMatrix.data);
        gl.uniformMatrix4fv(this.viewMatrixUniform,false,this.view.viewMatrix.data);

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
    }

    drawEnd()
    {
        let gl=this.view.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);

            // no longer using shader

        gl.useProgram(null);
    }

}
