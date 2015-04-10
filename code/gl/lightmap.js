"use strict";

//
// close
//

function lightmapClose()
{
    if (this.texture!==null) gl.deleteTexture(this.texture);
}

//
// attaching lightmaps
//

function lightmapAttach()
{
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D,this.texture);
}

//
// lightmap object
//

function lightmapObject(bitmapCanvas)
{
    this.texture=null;
    
        // load the texture
        
    this.texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,this.texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,bitmapCanvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D,null);
    
        // functions
        
    this.close=lightmapClose();
    this.attach=lightmapAttach();
}
