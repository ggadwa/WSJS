import InterfaceShaderClass from '../shader/interface_shader.js';

//
// interface class
//

export default class InterfaceClass
{
    constructor(view)
    {
        this.view=view;
        
        this.rectVertexArray=new Float32Array(12);         // local to global to avoid GCd
        this.vertexBuffer=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize()
    {
        this.vertexBuffer=this.view.gl.createBuffer();
        return(true);
    }

    release()
    {
        this.view.gl.deleteBuffer(this.vertexBuffer);
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

        this.view.shaderList.interfaceShader.drawStart();
    }

    drawEnd()
    {
        let gl=this.view.gl;

        this.view.shaderList.interfaceShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
    
    drawFrameRect(rect,color,alpha)
    {
        let gl=this.view.gl;
        
            // vertexes
            
        this.rectVertexArray[0]=rect.lft;
        this.rectVertexArray[1]=rect.top;
        this.rectVertexArray[2]=rect.rgt;
        this.rectVertexArray[3]=rect.top;
        this.rectVertexArray[4]=rect.rgt;
        this.rectVertexArray[5]=rect.bot;
        this.rectVertexArray[6]=rect.lft;
        this.rectVertexArray[7]=rect.bot;
        
            // setup the color
            
        gl.uniform4f(this.view.shaderList.interfaceShader.colorUniform,color.r,color.g,color.b,alpha);

            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.rectVertexArray,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.view.shaderList.interfaceShader.vertexPositionAttribute);
        gl.vertexAttribPointer(this.view.shaderList.interfaceShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the indexes
            
        gl.drawArrays(gl.LINE_LOOP,0,4);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
    }
    
    drawRect(rect,color,alpha)
    {
        let gl=this.view.gl;
        
            // vertexes
            
        this.rectVertexArray[0]=rect.lft;
        this.rectVertexArray[1]=rect.top;
        this.rectVertexArray[2]=rect.rgt;
        this.rectVertexArray[3]=rect.top;
        this.rectVertexArray[4]=rect.lft;
        this.rectVertexArray[5]=rect.bot;
        
        this.rectVertexArray[6]=rect.rgt;
        this.rectVertexArray[7]=rect.top;
        this.rectVertexArray[8]=rect.rgt;
        this.rectVertexArray[9]=rect.bot;
        this.rectVertexArray[10]=rect.lft;
        this.rectVertexArray[11]=rect.bot;
        
            // setup the color
            
        gl.uniform4f(this.view.shaderList.interfaceShader.colorUniform,color.r,color.g,color.b,alpha);

            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.rectVertexArray,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.view.shaderList.interfaceShader.vertexPositionAttribute);
        gl.vertexAttribPointer(this.view.shaderList.interfaceShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the indexes
            
        gl.drawArrays(gl.TRIANGLES,0,6);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
    }
    
}
