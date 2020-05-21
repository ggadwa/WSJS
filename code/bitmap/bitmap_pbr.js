import ColorClass from '../utility/color.js';
import BitmapClass from '../bitmap/bitmap.js';

export default class BitmapPBRClass extends BitmapClass
{
    constructor(core,colorURL,normalURL,metallicRoughnessURL,emissiveURL,emissiveFactor,scale)
    {
        super(core);
        
        this.colorURL=colorURL;
        this.normalURL=normalURL;
        this.metallicRoughnessURL=metallicRoughnessURL;
        this.emissiveURL=emissiveURL;
        this.emissiveFactor=emissiveFactor;
        this.scale=scale;
        
        this.loaded=false;
        
        Object.seal(this);
    }

    async load()
    {
        let maskImage;
        let gl=this.core.gl;
        
            // color bitmap
        
        this.colorImage=null;

        await this.loadImagePromise(this.colorURL)
            .then
                (
                        // resolved

                    value=>{
                        this.colorImage=value;
                    },

                        // rejected

                    value=>{
                        console.log('Unable to load '+value);
                    }
                );

        if (this.colorImage===null) return(false);
        
            // detect if there is any alpha
            
        this.hasColorImageAlpha=this.checkImageForAlpha(this.colorImage);
        
            // force the alpha into the rgb so alphas
            // don't muddy up during mipmapping
            
        this.colorTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,(this.hasColorImageAlpha?gl.RGBA:gl.RGB),(this.hasColorImageAlpha?gl.RGBA:gl.RGB),gl.UNSIGNED_BYTE,this.colorImage);
        
        if (this.isImagePowerOf2(this.colorImage)) {
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        }
        
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // if there is an alpha, build the mask
            // into an opacity texture (we need to use
            // nearest here)
            
        if (this.hasColorImageAlpha) {
            maskImage=this.colorImage;
        
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);

            this.maskTexture=gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,this.maskTexture);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,maskImage);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D,null);

            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
        }
        
            // normal bitmap
        
        this.normalImage=null;

        if (this.normalURL!==null) {
            await this.loadImagePromise(this.normalURL)
                .then
                    (
                            // resolved

                        value=>{
                                this.normalImage=value;
                        },

                            // rejected

                        value=>{
                            console.log('Unable to load '+value);
                        }
                    );

            if (this.normalImage===null) return(false);

            this.normalTexture=gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,this.normalTexture);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.normalImage);

            if ((this.isImagePowerOf2(this.normalImage))) {
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            else {
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
            }

            gl.bindTexture(gl.TEXTURE_2D,null);
        }
        
            // metallic-roughness bitmap
            
        this.metallicRoughnessImage=null;

        if (this.metallicRoughnessURL!==null) {
            await this.loadImagePromise(this.metallicRoughnessURL)
                .then
                    (
                            // resolved

                        value=>{
                                this.metallicRoughnessImage=value;
                        },

                            // rejected

                        value=>{
                            console.log('Unable to load '+value);
                        }
                    );

            if (this.metallicRoughnessImage===null) return(false);
        
            this.metallicRoughnessTexture=gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,this.metallicRoughnessTexture);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.metallicRoughnessImage);

            if ((this.isImagePowerOf2(this.metallicRoughnessImage))) {
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            else {
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
            }

            gl.bindTexture(gl.TEXTURE_2D,null);
        }
        
            // emissive bitmap
        
        this.emissiveImage=null;

        if (this.emissiveURL!==null) {
            await this.loadImagePromise(this.emissiveURL)
                .then
                    (
                            // resolved

                        value=>{
                                this.emissiveImage=value;
                        },

                            // rejected

                        value=>{
                            console.log('Unable to load '+value);
                        }
                    );

            if (this.emissiveImage===null) return(false);
        
            this.emissiveTexture=gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,this.emissiveTexture);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.emissiveImage);

            if ((this.isImagePowerOf2(this.emissiveImage))) {
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            else {
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
            }

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
        
            // mask
        
        if (this.maskTexture!==null) {
            gl.uniform1i(shader.hasMaskUniform,1);

            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D,this.maskTexture);
        }
        else {
            gl.uniform1i(shader.hasMaskUniform,0);
        }
        
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
