import ColorClass from '../utility/color.js';

export default class BitmapClass
{
    constructor(core)
    {
        this.BITMAP_NORMAL_URL=0;           // bitmaps are a bunch of files by URL
        this.BITMAP_SIMPLE_URL=1;           // bitmap is a single file of just a color map
        this.BITMAP_INTERFACE_URL=2;        // this is an interface bitmap, so no mipmaps, etc
        this.BITMAP_COLOR=3;                // bitmap is just an RGB color
        this.BITMAP_GENERATED=4;            // bitmap is generated
        this.BITMAP_SHADOW=5;               // shadowmap bitmap
    
        this.NORMAL_MAX_SHIFT=31;
        this.NORMAL_NO_SHIFT_CLAMP=0.7;
        
        this.METALLIC_CONTRAST=150;
        this.METALLIC_CONTRAST_CLAMP=0.4;

        this.core=core;
        
        this.bitmapType=this.BITMAP_NORMAL_URL;
        
        this.colorURL=null;
        this.colorBase=null;
        this.normalURL=null;
        this.metallicRoughnessURL=null;
        this.emissiveURL=null;
        this.emissiveFactor=new ColorClass(1,1,1);
        this.scale=null;
        
        this.colorImage=null;
        this.normalImage=null;
        this.metallicRoughnessImage=null;
        this.emissiveImage=null;
        
        this.colorTexture=null;
        this.normalTexture=null;
        this.metallicRoughnessTexture=null;
        this.emissiveTexture=null;
        this.maskTexture=null;

        this.hasColorImageAlpha=false;
        
        this.simpleName=null;
        this.loaded=false;
        
        Object.seal(this);
    }

        //
        // initialize and release bitmap
        //

    initializeNormalURL(colorURL,normalURL,metallicRoughnessURL,emissiveURL,emissiveFactor,scale)
    {
        this.bitmapType=this.BITMAP_NORMAL_URL;
        
        this.colorURL=colorURL;
        this.colorBase=null;
        this.normalURL=normalURL;
        this.metallicRoughnessURL=metallicRoughnessURL;
        this.emissiveURL=emissiveURL;
        if (emissiveFactor!==null) this.emissiveFactor=emissiveFactor;
        this.scale=scale;
        
        this.buildSimpleName();
    }
    
    initializeSimpleURL(colorURL)
    {
        this.bitmapType=this.BITMAP_SIMPLE_URL;
        
        this.colorURL=colorURL;
        
        this.buildSimpleName();
    }
    
    initializeInterfaceURL(colorURL)
    {
        this.bitmapType=this.BITMAP_INTERFACE_URL;
        
        this.colorURL=colorURL;
        
        this.buildSimpleName();
    }
    
    initializeColor(colorURL,colorBase)
    {
        this.bitmapType=this.BITMAP_COLOR;
        
        this.colorURL=colorURL;
        this.colorBase=colorBase;
        
        this.buildSimpleName();
    }
    
    initializeGenerated(colorURL,colorImage,normalImage,metallicRoughnessImage,emissiveImage,emissiveFactor)
    {
        this.bitmapType=this.BITMAP_GENERATED;
        
        this.colorURL=colorURL;
        this.colorImage=colorImage;
        this.normalImage=normalImage;
        this.metallicRoughnessImage=metallicRoughnessImage;
        this.emissiveImage=emissiveImage;
        this.emissiveFactor=emissiveFactor;
        
        this.buildSimpleName();
    }
    
    initializeShadowmap(colorURL)
    {
        this.bitmapType=this.BITMAP_SHADOW;
        
        this.colorURL=colorURL;
    }
    
    release()
    {
        let gl=this.core.gl;

        if (this.colorTexture!==null) gl.deleteTexture(this.colorTexture);
        if (this.normalTexture!==null) gl.deleteTexture(this.normalTexture);
        if (this.metallicRoughnessTexture!==null) gl.deleteTexture(this.metallicRoughnessTexture);
        if (this.emissiveTexture!==null) gl.deleteTexture(this.emissiveTexture);
        if (this.maskTexture!==null) gl.deleteTexture(this.maskTexture);
        
        this.colorImage=null;
        this.normalImage=null;
        this.metallicRoughnessImage=null;
        this.emissiveImage=null;
        
        this.loaded=false;
    }
    
        //
        // a name used by some json to pick out meshes
        // by textures
        //
        
    buildSimpleName()
    {
        let idx;
        
                // reduce down to name, skipping
                // any URL or extensions, this is a specific
                // instance used to hook things up to materials
        
        this.simpleName=this.colorURL;
        if (this.simpleName===null) return;
        
        idx=this.simpleName.lastIndexOf('/');
        if (idx!==-1) this.simpleName=this.simpleName.substring(idx+1);
        idx=this.simpleName.lastIndexOf('.');
        if (idx!==-1) this.simpleName=this.simpleName.substring(0,idx);
    }
    
        //
        // bitmap utilities
        //
        
    checkImageForAlpha(img)
    {
        let n,nPixel,idx;
        let canvas,ctx,imgData,data;
        
            // draw the image onto a canvas
            // and then check for alpha
            
        canvas=document.createElement('canvas');
        canvas.width=img.width;
        canvas.height=img.height;
        ctx=canvas.getContext('2d');
        
        ctx.drawImage(img,0,0);

	imgData=ctx.getImageData(0,0,img.width,img.height);
        data=imgData.data;
        
        nPixel=img.width*img.height;
        idx=0;
        
        for (n=0;n!=nPixel;n++) {
            idx+=3;
            if (data[idx++]!==255) return(true);
        }
        
        return(false);
    }
    
    createSolidColorImage(r,g,b)
    {
        let n,idx;
        let canvas,ctx,imgData,data;
        
            // create a solid image
            // of a single color
            
        canvas=document.createElement('canvas');
        canvas.width=8;
        canvas.height=8;
        ctx=canvas.getContext('2d');

	imgData=ctx.getImageData(0,0,8,8);
        data=imgData.data;
        
        idx=0;
        
        for (n=0;n!=64;n++) {
            data[idx++]=r;
            data[idx++]=g;
            data[idx++]=b;
            data[idx++]=255;
        }
		
	ctx.putImageData(imgData,0,0);
        
        return(canvas);
    }
    
        //
        // load texture
        //
        
    isImagePowerOf2(image)
    {
        if (image.width!==image.height) return(false);
        return(Math.ceil(Math.log2(image.width))===Math.floor(Math.log2(image.width)));
    }
    
    loadImagePromise(url)
    {
            // special check for embedded images, everything
            // else needs to escape out of the current HTML folder
            
        if (!url.startsWith('data:image')) url='../'+url;
        
            // return a image load promise
            
        return(
                new Promise((resolve,reject) =>
                    {
                        let img=new Image();
                        img.onload=()=>resolve(img);
                        img.onerror=()=>reject(url);
                        img.src=url;
                    }
                )
           );
    }
    
    async load()
    {
        let maskImage;
        let gl=this.core.gl;
        
            // color bitmap
            // this is the only required image, all others
            // are created if missing.  This can be built from
            // loading or a file or a base color
        
        if (this.bitmapType!==this.BITMAP_GENERATED) {
            
            if (this.bitmapType===this.BITMAP_COLOR) {
                this.colorImage=this.createSolidColorImage(Math.trunc(this.colorBase.r*255),Math.trunc(this.colorBase.g*255),Math.trunc(this.colorBase.b*255));
            }
            else {
                this.colorImage=null;

                if (this.colorBase===null) {
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
                }
            }
        }
        
        if (this.colorImage===null) return(false);
        
            // detect if there is any alpha
            
        this.hasColorImageAlpha=this.checkImageForAlpha(this.colorImage);
        
            // force the alpha into the rgb so alphas
            // don't muddy up during mipmapping
            
        this.colorTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,(this.hasColorImageAlpha?gl.RGBA:gl.RGB),(this.hasColorImageAlpha?gl.RGBA:gl.RGB),gl.UNSIGNED_BYTE,this.colorImage);
        
        if (this.bitmapType===this.BITMAP_SHADOW) {
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        }
        else {
            if ((this.bitmapType!==this.BITMAP_INTERFACE_URL) && (this.isImagePowerOf2(this.colorImage))) {
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            else {
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
            }
        }
        
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // simple, interface, or color bitmaps exit here
            // as they have no other elements like normals, etc
            
        if ((this.bitmapType===this.BITMAP_SIMPLE_URL) || (this.bitmapType===this.BITMAP_INTERFACE_URL) || (this.bitmapType===this.BITMAP_SHADOW)) {
            this.loaded=true;
            return(true);
        }
        
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
        
        if ((this.bitmapType!==this.BITMAP_GENERATED) || (this.bitmapType===this.BITMAP_COLOR)) {
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
            }
        }    
        
        if (this.normalImage!==null) {

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
            
        if ((this.bitmapType!==this.BITMAP_GENERATED) || (this.bitmapType===this.BITMAP_COLOR)) {
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
            }
        }
        
        if (this.metallicRoughnessImage!==null) {
        
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
            // these do not have to exist, if missing,
            // will use fake emissive map
        
        if ((this.bitmapType!==this.BITMAP_GENERATED) || (this.bitmapType===this.BITMAP_COLOR)) {
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
            }
        }
        
        if (this.emissiveImage!==null) {
        
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
    
        //
        // attach bitmap to shader in different formats
        //
    
    attachAsTexture(shader)
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
    
    attachAsShadow(shader)
    {
        let gl=this.core.gl;
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
    }
    
    attachAsLiquid(shader)
    {
        let gl=this.core.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
    }
    
    attachAsInterface()
    {
        let gl=this.core.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
    }
    
    attachAsParticle()
    {
        let gl=this.core.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
    }
    
    attachAsSky()
    {
        let gl=this.core.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
    }
}
