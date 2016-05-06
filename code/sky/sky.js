"use strict";

//
// sky class
//

class SkyClass
{
    constructor()
    {
        this.skyShader=new SkyShaderClass();

        this.skyVertices=new Float32Array(72);         // local to global to avoid GCd
        this.skyUVs=new Float32Array(48);
        this.vertexPosBuffer=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize(view,fileCache)
    {
        if (!this.skyShader.initialize(view,fileCache)) return(false);
        
        this.vertexPosBuffer=view.gl.createBuffer();
        
        return(true);
    }

    release(view)
    {
        view.gl.deleteBuffer(this.vertexPosBuffer);
        
        this.interfaceShader.release(view);
    }

        //
        // start/stop/draw interface
        //

    drawStart(view)
    {
        var gl=view.gl;
        
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

        this.interfaceShader.drawStart(view);
    }

    drawEnd(view)
    {
        var gl=view.gl;

        this.interfaceShader.drawEnd(view);

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
        
    draw(view,rect,color,alpha)
    {
        /*
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
        */
    }
    
}
