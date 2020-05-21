import ColorClass from '../utility/color.js';
import BitmapClass from '../bitmap/bitmap.js';

export default class BitmapGeneratedClass extends BitmapClass
{
    constructor(core,colorURL,colorImage,normalImage,metallicRoughnessImage,emissiveImage,emissiveFactor)
    {
        super(core);
        
        this.colorURL=colorURL;
        this.colorImage=colorImage;
        this.normalImage=normalImage;
        this.metallicRoughnessImage=metallicRoughnessImage;
        this.emissiveImage=emissiveImage;
        this.emissiveFactor=emissiveFactor;
        
        Object.seal(this);
    }
    
    release()
    {
        let gl=this.core.gl;

        if (this.colorTexture!==null) gl.deleteTexture(this.colorTexture);
        if (this.normalTexture!==null) gl.deleteTexture(this.normalTexture);
        if (this.metallicRoughnessTexture!==null) gl.deleteTexture(this.metallicRoughnessTexture);
        if (this.emissiveTexture!==null) gl.deleteTexture(this.emissiveTexture);
        
        this.colorImage=null;
        this.normalImage=null;
        this.metallicRoughnessImage=null;
        this.emissiveImage=null;
        
        this.loaded=false;
    }
            
    async load()
    {
        let gl=this.core.gl;
        
            // color texture
            
        this.colorTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.colorImage);
        
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // normal texture
            
        this.normalTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.normalTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.normalImage);

        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // metallic-roughness texture
        
        this.metallicRoughnessTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.metallicRoughnessTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.metallicRoughnessImage);

        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // emissive texture
            // these don't have to exist
       
        if (this.emissiveImage!==null) {
        
            this.emissiveTexture=gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,this.emissiveTexture);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.emissiveImage);

            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);

            gl.bindTexture(gl.TEXTURE_2D,null);
        }
        
        this.loaded=true;
        
        return(true);
    }
    
    attach(shader)
    {
        let gl=this.core.gl;

            // uniforms

        gl.uniform3f(shader.emissiveFactorUniform,this.emissiveFactor.r,this.emissiveFactor.g,this.emissiveFactor.b);
        
            // emissive
            
        if (this.emissiveTexture!==null) {
            gl.uniform1i(shader.hasEmissiveUniform,1);

            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D,this.emissiveTexture);
        }
        else {
            gl.uniform1i(shader.hasEmissiveUniform,0);
        }
        
            // metallic-roughness
            
        if (this.metallicRoughnessTexture!==null) {
            gl.uniform1i(shader.hasMetallicRoughnessUniform,1);

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D,this.metallicRoughnessTexture);
        }
        else {
            gl.uniform1i(shader.hasMetallicRoughnessUniform,0);
        }

            // normal
            
        if (this.normalTexture!==null) {
            gl.uniform1i(shader.hasNormalUniform,1);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D,this.normalTexture);
        }
        else {
            gl.uniform1i(shader.hasNormalUniform,0);
        }

            // the color
            
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
    }
}
