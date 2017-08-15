import InterfaceShaderClass from '../../code/interface/interface_shader.js';

//
// interface class
//

export default class InterfaceClass
{
    constructor(view,fileCache)
    {
        this.view=view;
        
        this.interfaceShader=new InterfaceShaderClass(view,fileCache);

        this.rectVertices=new Float32Array(12);         // local to global to avoid GCd
        this.vertexPosBuffer=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize()
    {
        if (!this.interfaceShader.initialize()) return(false);
        
        this.vertexPosBuffer=this.view.gl.createBuffer();
        
        return(true);
    }

    release()
    {
        this.view.gl.deleteBuffer(this.vertexPosBuffer);
        
        this.interfaceShader.release();
    }

        //
        // start/stop/draw interface
        //

    drawStart()
    {
        let gl=this.view.gl;
        
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

        this.interfaceShader.drawStart();
    }

    drawEnd()
    {
        let gl=this.view.gl;

        this.interfaceShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
    
    drawFrameRect(rect,color,alpha)
    {
        let gl=this.view.gl;
        
            // vertices
            
        this.rectVertices[0]=rect.lft;
        this.rectVertices[1]=rect.top;
        this.rectVertices[2]=rect.rgt;
        this.rectVertices[3]=rect.top;
        this.rectVertices[4]=rect.rgt;
        this.rectVertices[5]=rect.bot;
        this.rectVertices[6]=rect.lft;
        this.rectVertices[7]=rect.bot;
        
            // setup the color
            
        gl.uniform4f(this.interfaceShader.colorUniform,color.r,color.g,color.b,alpha);

            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.rectVertices,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.interfaceShader.vertexPositionAttribute);
        gl.vertexAttribPointer(this.interfaceShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the indexes
            
        gl.drawArrays(gl.LINE_LOOP,0,4);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
    }
    
    drawRect(rect,color,alpha)
    {
        let gl=this.view.gl;
        
            // vertices
            
        this.rectVertices[0]=rect.lft;
        this.rectVertices[1]=rect.top;
        this.rectVertices[2]=rect.rgt;
        this.rectVertices[3]=rect.top;
        this.rectVertices[4]=rect.lft;
        this.rectVertices[5]=rect.bot;
        
        this.rectVertices[6]=rect.rgt;
        this.rectVertices[7]=rect.top;
        this.rectVertices[8]=rect.rgt;
        this.rectVertices[9]=rect.bot;
        this.rectVertices[10]=rect.lft;
        this.rectVertices[11]=rect.bot;
        
            // setup the color
            
        gl.uniform4f(this.interfaceShader.colorUniform,color.r,color.g,color.b,alpha);

            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.rectVertices,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.interfaceShader.vertexPositionAttribute);
        gl.vertexAttribPointer(this.interfaceShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the indexes
            
        gl.drawArrays(gl.TRIANGLES,0,6);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
    }
    
}
