"use strict";

    // constants

const TEXT_TEXTURE_WIDTH=512;
const TEXT_TEXTURE_HEIGHT=512;
const TEXT_CHAR_PER_ROW=10;
const TEXT_CHAR_WIDTH=50;
const TEXT_CHAR_HEIGHT=50;
const TEXT_FONT_SIZE=48;
const TEXT_FONT_NAME='Arial';

const TEXT_ALIGN_LEFT=0;
const TEXT_ALIGN_CENTER=1;
const TEXT_ALIGN_RIGHT=2;

//
// initialize/release text
//

function textInitialize(view)
{
    var x,y,yAdd,dx,cIdx,charStr,charWid,ch;
    
        // start the shader
        
    if (!this.textShader.initialize(view)) return(false);
    
        // setup the canvas
        
    var canvas=document.createElement('canvas');
    canvas.width=TEXT_TEXTURE_WIDTH;
    canvas.height=TEXT_TEXTURE_HEIGHT;
    var ctx=canvas.getContext('2d');
    
        // background is black, text is white
        // so it can be colored
        
    genBitmapUtility.drawRect(ctx,0,0,TEXT_TEXTURE_WIDTH,TEXT_TEXTURE_HEIGHT,'#000000');
    
        // draw the text
        
    ctx.font=(TEXT_FONT_SIZE+'px ')+TEXT_FONT_NAME;
    ctx.textAlign='left';
    ctx.textBaseline='middle';
    ctx.fillStyle='#FFFFFF';
    
    yAdd=Math.floor(TEXT_CHAR_HEIGHT/2);
    
    for (ch=32;ch!==127;ch++) {
        cIdx=ch-32;
        x=(cIdx%TEXT_CHAR_PER_ROW)*TEXT_CHAR_WIDTH;
        y=Math.floor(cIdx/TEXT_CHAR_PER_ROW)*TEXT_CHAR_HEIGHT;
        y+=yAdd;
        
        charStr=String.fromCharCode(ch);
        charWid=ctx.measureText(charStr).width;
        
        dx=Math.floor((x+(TEXT_CHAR_WIDTH/2))-(charWid/2));
        ctx.fillText(charStr,dx,y);
        
        x+=TEXT_CHAR_WIDTH;
    }
    
        // finally load into webGL
        
    var gl=view.gl;

    this.fontTexture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,this.fontTexture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,canvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D,null);
    
    return(true);
}
  
function textRelease(view)
{
    var gl=view.gl;
    
    this.textShader.release(view);
    gl.deleteTexture(this.fontTexture);
}

//
// start/stop/draw text
//

function textDrawStart(view)
{
    var gl=view.gl;
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    
    this.textShader.drawStart(view);
}

function textDrawEnd(view)
{
    var gl=view.gl;
    
    this.textShader.drawEnd(view);
    
    gl.disable(gl.BLEND);
}

function textDraw(view,x,y,wid,high,str,align,color)
{
    var n,x2,ty,by,vIdx,uvIdx,iIdx,elementIdx;
    var cIdx,gx,gy,gxAdd,gyAdd;
    
        // figure out the size
        // and alignment
        
    var len=str.length;
    if (len===0) return;
        
    var drawWid=wid*len;
    
    switch (align) {
        case TEXT_ALIGN_CENTER:
            x-=Math.floor(drawWid/2);
            break;
        case TEXT_ALIGN_RIGHT:
            x-=drawWid;
            break;
    }
    
        // the y
        
    ty=y-high;
    by=y;
    
        // build the vertices
    
    var nVertex=len*4;          // 4 vertices for every character
    var nTrig=len*2;            // 2 triangles for every character
    
    var vertices=new Float32Array(nVertex*2);
    var uvs=new Float32Array(nVertex*2);
    var indexes=new Uint16Array(nTrig*3);
    
    vIdx=0;
    uvIdx=0;
    iIdx=0;
    elementIdx=0;
    
    gxAdd=TEXT_CHAR_WIDTH/TEXT_TEXTURE_WIDTH;
    gyAdd=TEXT_CHAR_HEIGHT/TEXT_TEXTURE_HEIGHT;
        
    for (n=0;n!==len;n++) {
        x2=x+wid;
        
        vertices[vIdx++]=x;
        vertices[vIdx++]=ty;
        vertices[vIdx++]=x2;
        vertices[vIdx++]=ty;
        vertices[vIdx++]=x2;
        vertices[vIdx++]=by;
        vertices[vIdx++]=x;
        vertices[vIdx++]=by;
        
        cIdx=str.charCodeAt(n)-32;
        gx=((cIdx%TEXT_CHAR_PER_ROW)*TEXT_CHAR_WIDTH)/TEXT_TEXTURE_WIDTH;
        gy=(Math.floor(cIdx/TEXT_CHAR_PER_ROW)*TEXT_CHAR_HEIGHT)/TEXT_TEXTURE_HEIGHT;
        
        uvs[uvIdx++]=gx;
        uvs[uvIdx++]=gy;
        uvs[uvIdx++]=(gx+gxAdd);
        uvs[uvIdx++]=gy;
        uvs[uvIdx++]=(gx+gxAdd);
        uvs[uvIdx++]=(gy+gyAdd);
        uvs[uvIdx++]=gx;
        uvs[uvIdx++]=(gy+gyAdd);
        
        indexes[iIdx++]=elementIdx;     // triangle 1
        indexes[iIdx++]=elementIdx+1;
        indexes[iIdx++]=elementIdx+2;
        
        indexes[iIdx++]=elementIdx;     // triangle 2
        indexes[iIdx++]=elementIdx+2;
        indexes[iIdx++]=elementIdx+3;
        
        elementIdx+=4;
        
        x=x2;
    }
    
        // set the shader and bitmap
        
    var gl=view.gl;
        
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,this.fontTexture);
    
    gl.uniform3f(this.textShader.colorUniform,color.r,color.g,color.b);
    
        // setup the buffers
    
    var vertexPosBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);
    
    gl.enableVertexAttribArray(this.textShader.vertexPositionAttribute);
    gl.vertexAttribPointer(this.textShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
    
    var uvPosBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,uvPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,uvs,gl.STREAM_DRAW);
   
    gl.enableVertexAttribArray(this.textShader.vertexUVAttribute);
    gl.vertexAttribPointer(this.textShader.vertexUVAttribute,2,gl.FLOAT,false,0,0);

    var indexBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);
    
        // draw the indexes
        
    gl.drawElements(gl.TRIANGLES,(nTrig*3),gl.UNSIGNED_SHORT,0);
    
        // remove the buffers
        
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    
    gl.deleteBuffer(vertexPosBuffer);
    gl.deleteBuffer(uvPosBuffer);
    gl.deleteBuffer(indexBuffer);
}

//
// text object
//

function textObject()
{
        // variables
        
    this.textShader=new textShaderObject();
    this.fontTexture=null;

        // methods
        
    this.initialize=textInitialize;
    this.release=textRelease;
    
    this.drawStart=textDrawStart;
    this.drawEnd=textDrawEnd;
    this.draw=textDraw;
}
