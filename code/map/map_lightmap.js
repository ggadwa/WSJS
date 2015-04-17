"use strict";

//
// close
//

function mapLightmapClose()
{
    if (this.texture!==null) this.gl.deleteTexture(this.texture);
}

//
// attaching lightmaps
//

function mapLightmapAttach(mapShader)
{
    this.gl.activeTexture(this.gl.TEXTURE3);
    this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture);
}

//
// lightmap object
//

function mapLightmapObject(gl,lightmapId,bitmapCanvas)
{
    this.gl=gl;
    this.lightmapId=lightmapId;
    this.texture=null;
    
        // load the texture
        
    this.texture=this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGB,this.gl.RGB,this.gl.UNSIGNED_BYTE,bitmapCanvas);
    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_NEAREST);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.bindTexture(this.gl.TEXTURE_2D,null);
    
        // functions
        
    this.close=mapLightmapClose;
    this.attach=mapLightmapAttach;
}
