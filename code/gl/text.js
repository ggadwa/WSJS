"use strict";

//
// text object
//

var text={};

//
// constants
//

text.TEXTURE_WIDTH=2048;
text.TEXTURE_HEIGHT=32;
text.TEXTURE_CHAR_WIDTH=21;
text.TEXTURE_FONT_SIZE=18;
text.TEXTURE_FONT_NAME='Arial';

text.ALIGN_LEFT=0;
text.ALIGN_CENTER=1;
text.ALIGN_RIGHT=2;

//
// variables
//

text.fontTexture=null;

//
// create/dispose text bitmap
//

text.initialize=function()
{
    var x,y,ch;
    
        // setup the canvas
        
    var canvas=document.createElement('canvas');
    canvas.width=this.TEXTURE_WIDTH;
    canvas.height=this.TEXTURE_HEIGHT;
    var ctx=canvas.getContext('2d');
    
        // background is black, text is white
        // so it can be colored
        
    genBitmapUtility.drawRect(ctx,0,0,this.TEXTURE_WIDTH,this.TEXTURE_HEIGHT,'#000000');
    
        // draw the text
        
    ctx.font=(this.TEXTURE_FONT_SIZE+'px ')+this.TEXTURE_FONT_NAME;
    ctx.textAlign='left';
    ctx.textBaseline='middle';
    ctx.fillStyle='#FFFFFF';
    
    x=0;
    y=Math.floor(this.TEXTURE_HEIGHT/2);
    
    for (ch=32;ch<=127;ch++) {
        ctx.fillText(String.fromCharCode(ch),x,y);
        x+=this.TEXTURE_CHAR_WIDTH;
    }
    
        // finally load into webGL

    this.fontTexture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,this.fontTexture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,canvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D,null);
};
  
text.release=function()
{
    gl.deleteTexture(this.fontTexture);
}

//
// draw bitmap
//

text.draw=function(shaderIdx,x,y,wid,high,str,align,color)
{
    var n,x2,ty,by,vIdx,uvIdx,iIdx,elementIdx;
    var cx,gx,gx2;
    
        // figure out the size
        // and alignment
        
    var len=str.length;
    if (len===0) return;
        
    var drawWid=wid*len;
    
    switch (align) {
        case this.ALIGN_CENTER:
            x-=Math.floor(drawWid/2);
            break;
        case this.ALIGN_RIGHT:
            x-=drawWid;
            break;
    }
    
        // the y
        
    ty=y-Math.floor(high/2);
    by=y+high;
    
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
        
        cx=(str.charAt(n)-32)*this.TEXTURE_CHAR_WIDTH;
        gx=cx/this.TEXTURE_WIDTH;
        gx2=(cx+this.TEXTURE_CHAR_WIDTH)/this.TEXTURE_WIDTH;
        
        uvs[uvIdx++]=gx;
        uvs[uvIdx++]=0.0;
        uvs[uvIdx++]=gx2;
        uvs[uvIdx++]=0.0;
        uvs[uvIdx++]=gx2;
        uvs[uvIdx++]=1.0;
        uvs[uvIdx++]=gx;
        uvs[uvIdx++]=1.0;
        
        indexes[iIdx++]=elementIdx;     // triangle 1
        indexes[iIdx++]=elementIdx+1;
        indexes[iIdx++]=elementIdx+2;
        
        indexes[iIdx++]=elementIdx;     // triangle 2
        indexes[iIdx++]=elementIdx+2;
        indexes[iIdx++]=elementIdx+3;
        
        elementIdx+=4;
    }
    
        // set the shader and bitmap
        
    var shaderProgram=shader.drawSet(shaderIdx);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,fontTexture);
    gl.uniform1i(shaderProgram.baseTexUniform,0);
    
    if (shaderProgram.ambientUniform!==-1) gl.uniform3f(shaderProgram.ambientUniform,color.r,color.g,color.b);
    
        // setup the buffers
    
    var vertexPosBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);
    
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
    
    var uvPosBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,uvPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,uvPosBuffer,gl.STREAM_DRAW);
   
    gl.enableVertexAttribArray(shaderProgram.vertexAndLightmapUVAttribute);
    gl.vertexAttribPointer(shaderProgram.vertexAndLightmapUVAttribute,2,gl.FLOAT,false,0,0);

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
};
