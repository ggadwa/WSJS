/* global view */

"use strict";

//
// bitmap class
//

class BitmapClass
{
    constructor(bitmapCanvas,normalMapCanvas,specularMapCanvas,uvScale,shineFactor)
    {
        let gl=view.gl;
        
        this.texture=null;
        this.normalMap=null;
        this.specularMap=null;

        this.uvScale=uvScale;
        this.shineFactor=shineFactor;

            // setup the texture

        this.texture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,bitmapCanvas);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);

            // setup the normal map

        if (normalMapCanvas!==null) {
            this.normalMap=gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,this.normalMap);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,normalMapCanvas);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D,null);
        }

            // setup the specular map

        if (specularMapCanvas!==null) {
            this.specularMap=gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,this.specularMap);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,specularMapCanvas);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D,null);
        }
        
        Object.seal(this);
    }
    
        //
        // close the bitmap
        //
    
    close()
    {
        let gl=view.gl;

        if (this.texture!==null) gl.deleteTexture(this.texture);
        if (this.normalMap!==null) gl.deleteTexture(this.normalMap);
        if (this.specularMap!==null) gl.deleteTexture(this.specularMap);
    }

        //
        // attach bitmap to shader as a texture
        // or as a lightmap
        //
    
    attachAsTexture(shader)
    {
        let gl=view.gl;

            // shine factor in shader

        gl.uniform1f(shader.shineFactorUniform,this.shineFactor);

            // the textures

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D,this.specularMap);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D,this.normalMap);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsLightmap()
    {
        let gl=view.gl;

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsLiquid()
    {
        let gl=view.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsParticle()
    {
        let gl=view.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsSky()
    {
        let gl=view.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }

}
