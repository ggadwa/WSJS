"use strict";

//
// interface class
//

function InterfaceObject()
{
        // variables
        
    this.interfaceShader=new InterfaceShaderObject();

        //
        // initialize/release interface
        //

    this.initialize=function(view)
    {
        return(this.interfaceShader.initialize(view));
    };

    this.release=function(view)
    {
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
            
        var vertices=new Float32Array(4*2);
        
        vertices[0]=rect.lft;
        vertices[1]=rect.top;
        vertices[2]=rect.rgt;
        vertices[3]=rect.top;
        vertices[4]=rect.rgt;
        vertices[5]=rect.bot;
        vertices[6]=rect.lft;
        vertices[7]=rect.bot;
        
            // setup the color
            
        gl.uniform3f(this.interfaceShader.colorUniform,color.r,color.g,color.b);

            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.interfaceShader.vertexPositionAttribute);
        gl.vertexAttribPointer(this.interfaceShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the indexes
            
        gl.drawArrays(gl.LINE_LOOP,0,4);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.deleteBuffer(vertexPosBuffer);
        
    };
    
    this.drawRect=function(view,rect,color)
    {
        var gl=view.gl;
        
            // vertices
            
        var vertices=new Float32Array(6*2);
        
        vertices[0]=rect.lft;
        vertices[1]=rect.top;
        vertices[2]=rect.rgt;
        vertices[3]=rect.top;
        vertices[4]=rect.lft;
        vertices[5]=rect.bot;
        
        vertices[6]=rect.rgt;
        vertices[7]=rect.top;
        vertices[8]=rect.rgt;
        vertices[9]=rect.bot;
        vertices[10]=rect.lft;
        vertices[11]=rect.bot;
        
            // setup the color
            
        gl.uniform3f(this.interfaceShader.colorUniform,color.r,color.g,color.b);

            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.interfaceShader.vertexPositionAttribute);
        gl.vertexAttribPointer(this.interfaceShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the indexes
            
        gl.drawArrays(gl.TRIANGLES,0,6);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.deleteBuffer(vertexPosBuffer);
    };
    
}
