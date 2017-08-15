import ShaderClass from '../../code/shader/shader.js';

//
// debug shader class
//

export default class DebugShaderClass extends ShaderClass
{
    constructor(view,fileCache)
    {
        super(view,fileCache);
        
        this.vertexPositionAttribute=null;
        this.perspectiveMatrixUniform=null;
        this.modelMatrixUniform=null;
        this.colorUniform=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release debug shader
        //

    initialize()
    {
        let gl=this.view.gl;
        
            // get a new shader object
            // and load/compile it

        if (!super.initialize('debug')) return(false);

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.modelMatrixUniform=gl.getUniformLocation(this.program,'modelMatrix');
        
        this.colorUniform=gl.getUniformLocation(this.program,'color');

        gl.useProgram(null);

        return(true);
    }

    release()
    {
        super.release();
    }

        //
        // start/stop debug drawing
        //

    drawStart(color)
    {
        let gl=this.view.gl;
        
            // using the map shader

        gl.useProgram(this.program);

            // matrix

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.view.perspectiveMatrix);
        gl.uniformMatrix4fv(this.modelMatrixUniform,false,this.view.modelMatrix);
        
            // debug color
            
        gl.uniform3f(this.colorUniform,color.r,color.g,color.b);

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

