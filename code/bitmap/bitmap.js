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
    
        this.NORMAL_MAX_SHIFT=31;
        this.NORMAL_NO_SHIFT_CLAMP=0.7;
        
        this.DEFAULT_SPECULAR=5;
        this.SPECULAR_CONTRAST=150;
        this.SPECULAR_CONTRAST_CLAMP=0.4;

        this.core=core;
        
        this.bitmapType=this.BITMAP_NORMAL_URL;
        
        this.colorURL=null;
        this.colorBase=null;
        this.normalURL=null;
        this.specularURL=null;
        this.specularFactor=null;
        this.glowURL=null;
        this.scale=null;
        
        this.colorImage=null;
        this.normalImage=null;
        this.specularImage=null;
        this.glowImage=null;
        
        this.texture=null;
        this.normalMap=null;
        this.specularMap=null;
        this.glowMap=null;
        this.mask=null;

        this.hasColorImageAlpha=false;
        
        this.glowFrequency=0;
        this.glowMin=0.0;
        this.glowMax=1.0;
        
        this.simpleName=null;
        this.loaded=false;
        
        Object.seal(this);
    }

        //
        // initialize and release bitmap
        //

    initializeNormalURL(colorURL,normalURL,specularURL,specularFactor,scale)
    {
        this.bitmapType=this.BITMAP_NORMAL_URL;
        
        this.colorURL=colorURL;
        this.colorBase=null;
        this.normalURL=normalURL;
        this.specularURL=specularURL;
        this.specularFactor=(specularFactor!==null)?specularFactor:new ColorClass(this.DEFAULT_SPECULAR,this.DEFAULT_SPECULAR,this.DEFAULT_SPECULAR);
        this.scale=scale;
        
        this.buildSimpleName();
    }
    
    initializeSimpleURL(colorURL)
    {
        this.bitmapType=this.BITMAP_SIMPLE_URL;
        
        this.colorURL=colorURL;
        this.colorBase=null;
        this.normalURL=null;
        this.specularURL=null;
        this.specularFactor=null;
        this.scale=null;
        
        this.buildSimpleName();
    }
    
    initializeInterfaceURL(colorURL)
    {
        this.bitmapType=this.BITMAP_INTERFACE_URL;
        
        this.colorURL=colorURL;
        this.colorBase=null;
        this.normalURL=null;
        this.specularURL=null;
        this.specularFactor=null;
        this.scale=null;
        
        this.buildSimpleName();
    }
    
    initializeColor(colorURL,colorBase)
    {
        this.bitmapType=this.BITMAP_COLOR;
        
        this.colorURL=colorURL;
        this.colorBase=colorBase;
        this.normalURL=null;
        this.specularURL=null;
        this.specularFactor=new ColorClass(this.DEFAULT_SPECULAR,this.DEFAULT_SPECULAR,this.DEFAULT_SPECULAR);
        this.scale=null;
        
        this.buildSimpleName();
    }
    
    initializeGenerated(colorURL,colorImage,normalImage,specularImage,specularFactor,glowImage,glowFrequency,glowMin,glowMax)
    {
        this.bitmapType=this.BITMAP_GENERATED;
        
        this.colorURL=colorURL;
        this.colorBase=null;
        this.normalURL=null;
        this.specularURL=null;
        this.scale=null;
        
        this.colorURL=colorURL;
        this.colorImage=colorImage;
        this.normalImage=normalImage;
        this.specularImage=specularImage;
        this.specularFactor=specularFactor;
        this.glowImage=glowImage;
        
        this.glowFrequency=glowFrequency;
        this.glowMin=glowMin;
        this.glowMax=glowMax;
        
        this.buildSimpleName();
    }
    
    release()
    {
        let gl=this.core.gl;

        if (this.texture!==null) gl.deleteTexture(this.texture);
        if (this.normalMap!==null) gl.deleteTexture(this.normalMap);
        if (this.specularMap!==null) gl.deleteTexture(this.specularMap);
        if (this.glowMap!==null) gl.deleteTexture(this.glowMap);
        if (this.mask!==null) gl.deleteTexture(this.mask);
        
        this.colorImage=null;
        this.normalImage=null;
        this.specularImage=null;
        this.glowImage=null;
        this.mask=null;
        
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
    
    createNormalFromColorImage()
    {
        let n,pixelCount,idx;
        let f,rg;
        let canvas,ctx,imgData,data;
        
            // creating a specular map
            // from a contrast value
            
        canvas=document.createElement('canvas');
        canvas.width=this.colorImage.width;
        canvas.height=this.colorImage.height;
        ctx=canvas.getContext('2d');
        
            // add the original image
            
        ctx.drawImage(this.colorImage,0,0);
        
	imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
        data=imgData.data;

            // get a gray scale for the pixel,
            // the darker it is, the more the normal
            // points away
            
        idx=0;
        pixelCount=canvas.width*canvas.height;
        
        for (n=0;n!=pixelCount;n++) {
            f=((data[idx]+data[idx+1]+data[idx+2])*0.33)/255;
            
                // if below a certain darkness, then no
                // normal
                
            if (f>this.NORMAL_NO_SHIFT_CLAMP) {
                data[idx++]=127;
                data[idx++]=127;
                data[idx++]=255;
                data[idx++]=255;
                
                continue;
            }
            
                // otherwise clamp it
                
            rg=127-Math.trunc((f*this.NORMAL_MAX_SHIFT)/this.NORMAL_NO_SHIFT_CLAMP);
            
            data[idx++]=rg;
            data[idx++]=rg;
            data[idx++]=255;
            data[idx++]=255;
        }
		
	ctx.putImageData(imgData,0,0);
        
        return(canvas);
    }
    
    createSpecularFromColorImage()
    {
        let n,nPixel,idx;
        let f,i,min,max,expandFactor,contrastFactor;
        let canvas,ctx,imgData,data;
        
            // creating a specular map
            // from a contrast value
            
        canvas=document.createElement('canvas');
        canvas.width=this.colorImage.width;
        canvas.height=this.colorImage.height;
        ctx=canvas.getContext('2d');
        
            // add the original image
            
        ctx.drawImage(this.colorImage,0,0);
        
	imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
        data=imgData.data;
        
        nPixel=canvas.width*canvas.height;

            // get the contrast factor
            
        contrastFactor=(259*(this.SPECULAR_CONTRAST+255))/(255*(259-this.SPECULAR_CONTRAST));
        
            // find a min-max across the entire map, we do this
            // so we can readjust the contrast to be 0..1
            
        min=max=(data[0]+data[1]+data[2])*0.33

        idx=0;
        
        for (n=0;n!==nPixel;n++) {
            f=(data[idx]+data[idx+1]+data[idx+2])*0.33;
            if (f<min) min=f;
            if (f>max) max=f;

            idx+=4;
        }
        
        if (min>=max) {
            expandFactor=0;
            min=0;
        }
        else {
            expandFactor=255.0/(max-min);
        }
        
            // now run the contrast
            
        idx=0;
        
        for (n=0;n!==nPixel;n++) {
            
                // get the pixel back into 0..1
                
            f=(data[idx]+data[idx+1]+data[idx+2])*0.33;
            f=(f-min)*expandFactor;
            
                // apply the contrast and
                // clamp it
                
            f=((contrastFactor*(f-128))+128);
            if (f<0) f=0;
            if (f>255) f=255;
            
            i=Math.trunc(f*this.SPECULAR_CONTRAST_CLAMP);
                    
            data[idx++]=i;
            data[idx++]=i;
            data[idx++]=i;
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
            
        this.texture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
        gl.texImage2D(gl.TEXTURE_2D,0,(this.hasColorImageAlpha?gl.RGBA:gl.RGB),(this.hasColorImageAlpha?gl.RGBA:gl.RGB),gl.UNSIGNED_BYTE,this.colorImage);
        
        if ((this.bitmapType!==this.BITMAP_INTERFACE_URL) && (this.isImagePowerOf2(this.colorImage))) {
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        }
        
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // simple, interface, or color bitmaps exit here
            // as they have no other elements like normals, etc
            
        if ((this.bitmapType===this.BITMAP_SIMPLE_URL) || (this.bitmapType===this.BITMAP_INTERFACE_URL)) {
            this.loaded=true;
            return(true);
        }
        
            // if there is an alpha, build the mask
            // into a different texture so we can use
            // nearest, otherwise it's all black with a 1 alpha
            // so no masking
            
        if (this.hasColorImageAlpha) {
            maskImage=this.colorImage;
        }
        else {
            maskImage=this.createSolidColorImage(0,0,0);      // alpha will be 1
        }
        
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
            
        this.mask=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.mask);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,maskImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
        
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
        
        if (this.normalImage===null) this.normalImage=this.createNormalFromColorImage();
        
        this.normalMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.normalMap);
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

            // specular bitmap
            
        if ((this.bitmapType!==this.BITMAP_GENERATED) || (this.bitmapType===this.BITMAP_COLOR)) {
            this.specularImage=null;

            if (this.specularURL!==null) {
                await this.loadImagePromise(this.specularURL)
                    .then
                        (
                                // resolved

                            value=>{
                                    this.specularImage=value;
                            },

                                // rejected

                            value=>{
                                console.log('Unable to load '+value);
                            }
                        );
                
                if (this.specularImage===null) return(false);
            }
        }
        
        if (this.specularImage===null) this.specularImage=this.createSpecularFromColorImage();
        
        this.specularMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.specularMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.specularImage);
        
        if ((this.isImagePowerOf2(this.specularImage))) {
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        }
        
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // glow bitmap
            // these do not have to exist, if missing,
            // will use fake glowmap
        
        if ((this.bitmapType!==this.BITMAP_GENERATED) || (this.bitmapType===this.BITMAP_COLOR)) {
            this.glowImage=null;

            if (this.glowURL!==null) {
                await this.loadImagePromise(this.glowURL)
                    .then
                        (
                                // resolved

                            value=>{
                                    this.glowImage=value;
                            },

                                // rejected

                            value=>{
                                console.log('Unable to load '+value);
                            }
                        );
                
                if (this.glowImage===null) return(false);
            }
        }
        
        if (this.glowImage===null) this.glowImage=this.createSolidColorImage(0,0,0);
        
        this.glowMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.glowMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.glowImage);
        
        if ((this.isImagePowerOf2(this.glowImage))) {
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        }
        
        gl.bindTexture(gl.TEXTURE_2D,null);
        
        this.loaded=true;
        
        return(true);
    }
    
        //
        // attach bitmap to shader in different formats
        //
    
    attachAsTexture(shader)
    {
        let glowFactor;
        let gl=this.core.gl;

            // uniforms

        gl.uniform3f(shader.specularFactorUniform,this.specularFactor.r,this.specularFactor.g,this.specularFactor.b);
        
        if (this.glowFrequency!==0) {
            glowFactor=this.glowMin+Math.abs(Math.cos(this.core.timestamp/this.glowFrequency)*(this.glowMax-this.glowMin));
            gl.uniform1f(shader.glowFactorUniform,glowFactor);
        }
        else {
            gl.uniform1f(shader.glowFactorUniform,0.0);
        }
        
            // the textures
            
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D,this.mask);
            
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D,this.glowMap);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D,this.specularMap);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D,this.normalMap);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsShadow(shader)
    {
        let gl=this.core.gl;
        
        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsLiquid(shader)
    {
        let gl=this.core.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsInterface()
    {
        let gl=this.core.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsParticle()
    {
        let gl=this.core.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsSky()
    {
        let gl=this.core.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
}
