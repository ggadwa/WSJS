"use strict";

//
// lightmap class
//

function MapLightmapObject(view,lightmapId,bitmapCanvas)
{
    this.lightmapId=lightmapId;
    this.texture=null;
    
        // load the texture
        
    var gl=view.gl;
        
    this.texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,this.texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,bitmapCanvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D,null);
    
        //
        // close
        //

    this.close=function()
    {
        var gl=view.gl;

        if (this.texture!==null) gl.deleteTexture(this.texture);
    };

        //
        // attaching lightmaps
        //

    this.attach=function(view,mapShader)
    {
        var gl=view.gl;

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    };

}
