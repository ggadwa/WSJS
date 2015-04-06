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

