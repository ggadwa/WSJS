"use strict";

//
// lightmap object
//

var lightmap={};

//
// lightmap globals
//

lightmap.lightmapList=[];
lightmap.lightmapCurrentIndex=-1;

//
// load texture
//

lightmap.load=function(lightmapIndex,bitmapCanvas)
{
        // setup the texture
        
    var texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,bitmapCanvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D,null);
    
        // add to list
        
    this.lightmapList[lightmapIndex]=texture;
};

//
// close all lightmaps
//

lightmap.close=function()
{
    var n;
    
    for (n=0;n!==this.lightmapList.length;n++) {
        if (this.lightmapList[n]!==null) gl.deleteTexture(this.lightmapList[n]);
    }
    
    this.lightmapList=[];
};

//
// drawing bitmaps start/stop/set
//

lightmap.drawStart=function()
{
    this.lightmapCurrentIndex=-1;
};

lightmap.drawEnd=function()
{
};

lightmap.drawSet=function(shaderIndex,lightmapIndex)
{
        // ignore if this texture is already set
        
    if (this.lightmapCurrentIndex===lightmapIndex) return;
    
        // get the shader program to check for
        // the existence of uniforms
        
    var shaderProgram=shader.drawSet(shaderIndex);
    
    if (shaderProgram.lightmapTexUniform!==-1) {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D,this.lightmapList[lightmapIndex]);
        gl.uniform1i(shaderProgram.lightmapTexUniform,3);
    }
    
        // update the current lightmap
        
    this.lightmapCurrentIndex=lightmapIndex;
};
