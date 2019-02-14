import ShaderClass from '../shader/shader.js';

//
// map shader object
//

export default class MapLiquidShaderClass extends ShaderClass
{
    constructor(view)
    {
        super(view);
        
        this.vertexShaderURL='shaders/map_liquid.vert';
        this.fragmentShaderURL='shaders/map_liquid.frag';
        
        this.vertexPositionAttribute=null;
        this.vertexUVAttribute=null;

        this.perspectiveMatrixUniform=null;
        this.modelMatrixUniform=null;
        this.normalMatrixUniform=null;
        
        this.alphaUniform=null;
        
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
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');
        
        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.modelMatrixUniform=gl.getUniformLocation(this.program,'modelMatrix');
        this.normalMatrixUniform=gl.getUniformLocation(this.program,'normalMatrix');
        
        this.alphaUniform=gl.getUniformLocation(this.program,'alpha');

            // these uniforms are always the same

        gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);

        gl.useProgram(null);
    }

        //
        // start/stop liquid shader drawing
        //

    drawStart()
    {
            // using the map shader

        let gl=this.view.gl;

        gl.useProgram(this.program);

            // matrix

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.view.perspectiveMatrix);
        gl.uniformMatrix4fv(this.modelMatrixUniform,false,this.view.modelMatrix);
        gl.uniformMatrix3fv(this.normalMatrixUniform,false,this.view.normalMatrix);

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexUVAttribute);
    }

    drawEnd()
    {
        let gl=this.view.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexUVAttribute);

            // no longer using shader

        gl.useProgram(null);
    }

}
