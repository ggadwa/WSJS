"use strict";

//
// interface class
//

function InterfaceObject()
{
        // variables
        
    this.interfaceShader=new InterfaceShaderObject();
    
    this.rectVertices=new Float32Array(12);         // local to global to avoid GCd
    this.vertexPosBuffer=null;

        //
        // initialize/release interface
        //

    this.initialize=function(view)
    {
        if (!this.interfaceShader.initialize(view)) return(false);
        
        this.vertexPosBuffer=view.gl.createBuffer();
        
        return(true);
    };

    this.release=function(view)
    {
        view.gl.deleteBuffer(this.vertexPosBuffer);
        
        this.interfaceShader.release(view);
    };

        //
        // start/stop/draw interface
        //

    this.drawStart=function(view)
    {
        var gl=view.gl;
        
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE);

        this.interfaceShader.drawStart(view);
    };

    this.drawEnd=function(view)
    {
        var gl=view.gl;

        this.interfaceShader.drawEnd(view);

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    };
    
    this.drawFrameRect=function(view,rect,color)
    {
        var gl=view.gl;
        
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
            
        gl.uniform3f(this.interfaceShader.colorUniform,color.r,color.g,color.b);

            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.rectVertices,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.interfaceShader.vertexPositionAttribute);
        gl.vertexAttribPointer(this.interfaceShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the indexes
            
        gl.drawArrays(gl.LINE_LOOP,0,4);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
    };
    
    this.drawRect=function(view,rect,color)
    {
        var gl=view.gl;
        
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
            
        gl.uniform3f(this.interfaceShader.colorUniform,color.r,color.g,color.b);

            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.rectVertices,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.interfaceShader.vertexPositionAttribute);
        gl.vertexAttribPointer(this.interfaceShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the indexes
            
        gl.drawArrays(gl.TRIANGLES,0,6);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
    };
    
}
