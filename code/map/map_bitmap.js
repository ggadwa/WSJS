"use strict";

//
// close bitmaps
//

function mapBitmapClose()
{
    if (this.texture!==null) this.gl.deleteTexture(this.texture);
    if (this.normalMap!==null) this.gl.deleteTexture(this.normalMap);
    if (this.specularMap!==null) this.gl.deleteTexture(this.specularMap);
}

//
// attaching bitmaps
//

function mapBitmapAttach(mapShader)
{
        // shine factor in shader
        
    this.gl.uniform1f(mapShader.shineFactorUniform,this.shineFactor);
    
        // the textures
        
    this.gl.activeTexture(this.gl.TEXTURE2);
    this.gl.bindTexture(this.gl.TEXTURE_2D,this.specularMap);
    
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D,this.normalMap);
    
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture);
}

//
// map bitmap object
//

function mapBitmapObject(gl,bitmapId,bitmapCanvas,normalMapCanvas,specularMapCanvas,uvScale,shineFactor)
{
    this.gl=gl;
    this.bitmapId=bitmapId;
    this.texture=null;
    this.normalMap=null;
    this.specularMap=null;
    
    this.uvScale=uvScale;
    this.shineFactor=shineFactor;
    
        // setup the texture
        
    this.texture=this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGB,this.gl.RGB,this.gl.UNSIGNED_BYTE,bitmapCanvas);
    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_NEAREST);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.bindTexture(this.gl.TEXTURE_2D,null);
    
        // setup the normal map
    
    if (normalMapCanvas!==null) {
        this.normalMap=this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D,this.normalMap);
        this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGB,this.gl.RGB,this.gl.UNSIGNED_BYTE,normalMapCanvas);
        this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_NEAREST);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D,null);
    }
    
        // setup the specular map
    
    if (specularMapCanvas!==null) {
        this.specularMap=this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D,this.specularMap);
        this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGB,this.gl.RGB,this.gl.UNSIGNED_BYTE,specularMapCanvas);
        this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_NEAREST);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D,null);
    }
    
        // functions
        
    this.close=mapBitmapClose;
    this.attach=mapBitmapAttach;
}
