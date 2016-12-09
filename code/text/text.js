/* global view */

"use strict";

//
// text class
//

class TextClass
{
    constructor()
    {
            // constants
            
        this.TEXT_TEXTURE_WIDTH=512;
        this.TEXT_TEXTURE_HEIGHT=512;
        this.TEXT_CHAR_PER_ROW=10;
        this.TEXT_CHAR_WIDTH=50;
        this.TEXT_CHAR_HEIGHT=50;
        this.TEXT_FONT_SIZE=48;
        this.TEXT_FONT_NAME='Arial';

        this.TEXT_MAX_STRING_LEN=256;

        this.TEXT_ALIGN_LEFT=0;
        this.TEXT_ALIGN_CENTER=1;
        this.TEXT_ALIGN_RIGHT=2;
            
            // variables
            
        this.textShader=new TextShaderClass();
        this.fontTexture=null;

        this.fontCharWids=new Array(128);

        this.shadowColor=new wsColor(0.0,0.0,0.0);

            // drawing objects

        this.vertices=null;
        this.uvs=null;
        this.indexes=null;

        this.vertexPosBuffer=null;
        this.uvPosBuffer=null;
        this.indexBuffer=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release text
        //

    initialize()
    {
        let x,y,yAdd,cIdx,charStr,ch;
        let canvas,ctx,genBitmapUtility;
        let gl=view.gl;

            // start the shader

        if (!this.textShader.initialize()) return(false);

            // setup the canvas

        canvas=document.createElement('canvas');
        canvas.width=this.TEXT_TEXTURE_WIDTH;
        canvas.height=this.TEXT_TEXTURE_HEIGHT;
        ctx=canvas.getContext('2d');
        
            // background is black, text is white
            // so it can be colored

        genBitmapUtility=new GenBitmapClass();
        genBitmapUtility.drawRect(ctx,0,0,this.TEXT_TEXTURE_WIDTH,this.TEXT_TEXTURE_HEIGHT,new wsColor(0.0,0.0,0.0));

            // draw the text

        ctx.font=(this.TEXT_FONT_SIZE+'px ')+this.TEXT_FONT_NAME;
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillStyle='#FFFFFF';

        yAdd=Math.trunc(this.TEXT_CHAR_HEIGHT/2);

        for (ch=32;ch!==127;ch++) {
            cIdx=ch-32;
            x=(cIdx%this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_WIDTH;
            y=Math.trunc(cIdx/this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_HEIGHT;
            y+=yAdd;

            charStr=String.fromCharCode(ch);
            this.fontCharWids[cIdx]=((ctx.measureText(charStr).width+4)/this.TEXT_CHAR_WIDTH);
            if (this.fontCharWids[cIdx]>1.0) this.fontCharWids[cIdx]=1.0;

            ctx.fillText(charStr,(x+2),(y-1));

            x+=this.TEXT_CHAR_WIDTH;
        }

            // finally load into webGL
            
        this.fontTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.fontTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,canvas);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // and create arrays for the
            // character drawing, we do this because
            // doing this inline would be expensive
            
        this.vertices=new Float32Array((this.TEXT_MAX_STRING_LEN*4)*2);
        this.uvs=new Float32Array((this.TEXT_MAX_STRING_LEN*4)*2);
        this.indexes=new Uint16Array((this.TEXT_MAX_STRING_LEN*2)*3);
        
            // and finally the vbos
            
        this.vertexPosBuffer=gl.createBuffer();
        this.uvPosBuffer=gl.createBuffer();
        this.indexBuffer=gl.createBuffer();

        return(true);
    }

    release()
    {
        let gl=view.gl;
        
            // remove vbos
            
        this.vertices=null;
        this.uvs=null;
        this.indexes=null;

        gl.deleteBuffer(this.vertexPosBuffer);
        gl.deleteBuffer(this.uvPosBuffer);
        gl.deleteBuffer(this.indexBuffer);

            // shut down the texture
            // and shader

        this.textShader.release();
        gl.deleteTexture(this.fontTexture);
    }
    
        //
        // string lengths
        //
        
    getStringDrawWidth(charWid,str)
    {
        let n,cIdx,len;
        let wid=0;

            // figure out the size
            // and alignment

        len=str.length;
        if (len===0) return(0);
        
        for (n=0;n!==len;n++) {
            cIdx=str.charCodeAt(n)-32;
            wid+=Math.trunc(charWid*this.fontCharWids[cIdx]);
        }
        
        return(wid);
    }

        //
        // start/stop/draw text
        //

    drawStart()
    {
        let gl=view.gl;

        gl.disable(gl.DEPTH_TEST);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

        this.textShader.drawStart();
    }

    drawEnd()
    {
        let gl=view.gl;

        this.textShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }

    draw(x,y,charWid,charHigh,str,align,color)
    {
        let n,x2,ty,by,vIdx,uvIdx,iIdx,elementIdx;
        let cIdx,gx,gy,gxAdd,gyAdd;
        let len,drawWid,nTrig;
        let gl=view.gl;
        
            // get the length and clip if
            // past our pre-set buffer size
            
        len=str.length;
        if (len===0) return;
        
        if (len>this.TEXT_MAX_STRING_LEN) len=this.TEXT_MAX_STRING_LEN;

            // figure out the size
            // and alignment

        drawWid=this.getStringDrawWidth(charWid,str);

        switch (align) {
            case this.TEXT_ALIGN_CENTER:
                x-=Math.trunc(drawWid/2);
                break;
            case this.TEXT_ALIGN_RIGHT:
                x-=drawWid;
                break;
        }

            // the y

        ty=y-charHigh;
        by=y;

            // build the vertices

        nTrig=len*2;            // 2 triangles for every character

        vIdx=0;
        uvIdx=0;
        iIdx=0;
        elementIdx=0;

        gxAdd=this.TEXT_CHAR_WIDTH/this.TEXT_TEXTURE_WIDTH;
        gyAdd=this.TEXT_CHAR_HEIGHT/this.TEXT_TEXTURE_HEIGHT;

        for (n=0;n!==len;n++) {
            x2=x+charWid;

            this.vertices[vIdx++]=x;
            this.vertices[vIdx++]=ty;
            this.vertices[vIdx++]=x2;
            this.vertices[vIdx++]=ty;
            this.vertices[vIdx++]=x2;
            this.vertices[vIdx++]=by;
            this.vertices[vIdx++]=x;
            this.vertices[vIdx++]=by;

            cIdx=str.charCodeAt(n)-32;
            gx=((cIdx%this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_WIDTH)/this.TEXT_TEXTURE_WIDTH;
            gy=(Math.trunc(cIdx/this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_HEIGHT)/this.TEXT_TEXTURE_HEIGHT;

            this.uvs[uvIdx++]=gx;
            this.uvs[uvIdx++]=gy;
            this.uvs[uvIdx++]=(gx+gxAdd);
            this.uvs[uvIdx++]=gy;
            this.uvs[uvIdx++]=(gx+gxAdd);
            this.uvs[uvIdx++]=(gy+gyAdd);
            this.uvs[uvIdx++]=gx;
            this.uvs[uvIdx++]=(gy+gyAdd);

            this.indexes[iIdx++]=elementIdx;     // triangle 1
            this.indexes[iIdx++]=elementIdx+1;
            this.indexes[iIdx++]=elementIdx+2;

            this.indexes[iIdx++]=elementIdx;     // triangle 2
            this.indexes[iIdx++]=elementIdx+2;
            this.indexes[iIdx++]=elementIdx+3;

            elementIdx+=4;
            
            x+=Math.trunc(charWid*this.fontCharWids[cIdx]);
        }

            // set the shader and bitmap

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.fontTexture);

        gl.uniform3f(this.textShader.colorUniform,color.r,color.g,color.b);

            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertices,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.textShader.vertexPositionAttribute);
        gl.vertexAttribPointer(this.textShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvs,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.textShader.vertexUVAttribute);
        gl.vertexAttribPointer(this.textShader.vertexUVAttribute,2,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexes,gl.STREAM_DRAW);

            // draw the indexes

        gl.drawElements(gl.TRIANGLES,(nTrig*3),gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }
    
    drawWithShadow(x,y,charWid,charHigh,str,align,color)
    {
        this.draw((x+1),(y+1),charWid,charHigh,str,align,this.shadowColor);
        this.draw(x,y,charWid,charHigh,str,align,color);
    }


}
