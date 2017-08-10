import ShaderClass from '../../code/main/shader.js';
import view from '../../code/main/view.js';

//
// map overlay shader class
//

export default class MapOverlayShaderClass extends ShaderClass
{
    constructor()
    {
        super();
        this.vertexPositionAttribute=null;
        this.orthoMatrixUniform=null;
        this.colorUniform=null;
        
        Object.seal(this);
    }
    
    //
    // initialize/release map overlay shader
    //

    initialize()
    {
        let gl=view.gl;
        
            // get a new shader object
            // and load/compile it

        if (!super.initialize('map_overlay')) return(false);

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');

        this.orthoMatrixUniform=gl.getUniformLocation(this.program,'orthoMatrix');
        this.colorUniform=gl.getUniformLocation(this.program,'color');

        gl.useProgram(null);

        return(true);
    }

    release()
    {
        super.release();
    }

    //
    // start/stop interface shader drawing
    //

    drawStart()
    {
        let gl=view.gl;
        
        gl.useProgram(this.program);

            // setup the uniforms

        gl.uniformMatrix4fv(this.orthoMatrixUniform,false,view.orthoMatrix);

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
    }
    
    drawColor(color)
    {
        let gl=view.gl;
        gl.uniform3f(this.colorUniform,color.r,color.g,color.b);
    }

    drawEnd()
    {
        let gl=view.gl;
        
            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);

            // no longer using program

        gl.useProgram(null);
    }

}
