"use strict";

//
// bitmap object
//

var bitmap={};

//
// bitmap globals
//

bitmap.bitmapList=[];
bitmap.bitmapCurrentIndex=-1;

//
// load textures
//

bitmap.load=function(bitmapIndex,bitmapCanvas,normalMapCanvas,specularMapCanvas,uvScale,shineFactor)
{
        // setup the texture
        
    var texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,bitmapCanvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D,null);
    
        // setup the normal map
        
    var normalMap=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,normalMap);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,normalMapCanvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D,null);
    
        // setup the specular map
        
    var specularMap=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,specularMap);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,specularMapCanvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D,null);
    
        // add to list
        
    this.bitmapList[bitmapIndex]=new wsBitmapObject(texture,normalMap,specularMap,uvScale,shineFactor);
};

//
// misc getters
//

bitmap.getUVScale=function(bitmapIndex)
{
    return(this.bitmapList[bitmapIndex].uvScale);
};

//
// drawing bitmaps start/stop/set
//

bitmap.drawStart=function()
{
    this.bitmapCurrentIndex=-1;
};

bitmap.drawEnd=function()
{
};

bitmap.drawSet=function(shaderIndex,bitmapIndex)
{
        // ignore if this texture is already set
        
    if (this.bitmapCurrentIndex===bitmapIndex) return;
    
        // get the bitmap
        
    var bitmap=this.bitmapList[bitmapIndex];
    
        // get the shader program to check for
        // the existence of uniforms
        
    var shaderProgram=shader.drawSet(shaderIndex);
    
    if (shaderProgram.shineFactorUniform!==-1) gl.uniform1f(shaderProgram.shineFactorUniform,bitmap.shineFactor);
    
    if (shaderProgram.specularTexUniform!==-1) {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D,bitmap.specularMap);
        gl.uniform1i(shaderProgram.specularTexUniform,2);
    }
    
    if (shaderProgram.normalTexUniform!==-1) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D,bitmap.normalMap);
        gl.uniform1i(shaderProgram.normalTexUniform,1);
    }
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,bitmap.texture);
    gl.uniform1i(shaderProgram.baseTexUniform,0);
    
        // update the current bitmap
        
    this.bitmapCurrentIndex=bitmapIndex;
};
