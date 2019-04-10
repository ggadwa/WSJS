import ShaderClass from '../shader/shader.js';

//
// sky shader class
//

export default class SkyShaderClass extends ShaderClass
{
    constructor(core)
    {
        super(core);
        
        this.shaderName='sky';
        
        this.vertexPositionAttribute=null;
        this.vertexUVAttribute=null;
        this.perspectiveMatrixUniform=null;
        this.viewMatrixUniform=null;
        
        Object.seal(this);
    }
    
        //
        // load finish
        //

    loadFinish()
    {
        let gl=this.core.gl;

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.viewMatrixUniform=gl.getUniformLocation(this.program,'viewMatrix');
        
            // texture uniforms never change
            
        gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);

        gl.useProgram(null);
    }

        //
        // start/stop interface shader drawing
        //

    drawStart()
    {
        let gl=this.core.gl;
        
        gl.useProgram(this.program);

            // setup the uniforms

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.core.perspectiveMatrix.data);
        gl.uniformMatrix4fv(this.viewMatrixUniform,false,this.core.viewMatrix.data);

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

            // no longer using program

        gl.useProgram(null);
    }

}
