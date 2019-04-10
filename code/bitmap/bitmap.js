import ColorClass from '../utility/color.js';

export default class BitmapClass
{
    constructor(core,colorURL,normalURL,specularURL,specularFactor,scale)
    {
        this.core=core;
        this.colorURL=colorURL;
        this.normalURL=normalURL;
        this.specularURL=specularURL;
        this.specularFactor=specularFactor;
        this.glowURL=null;
        this.scale=scale;
        
        if (this.specularFactor===null) this.specularFactor=new ColorClass(1,1,1);      // default specular, in case it's missing
        
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
        this.buildSimpleName();
        
        this.loaded=false;
        
        Object.seal(this);
    }

        //
        // initialize and release bitmap
        //
    
    initialize()
    {
        this.texture=null;
        this.normalMap=null;
        this.specularMap=null;
        this.glowMap=null;
        this.mask=null;

        this.loaded=false;
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
    
    createDefaultImageForMissingImage(r,g,b)
    {
        let n,idx;
        let canvas,ctx,imgData,data;
        
            // create an all black image
            // for bitmaps without glow maps
            
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
		
            // convert to image
            // we have to wait for a promise here
            // as these don't always load async
            
        return(
            new Promise((resolve,reject) =>
                {
                    let img=new Image();
                    img.onload=()=>resolve(img);
                    img.src=canvas.toDataURL("image/png");      // reject will never happen here as far as I can tell
                }
            )
       );
    }
    
        //
        // load texture
        //
        
    loadImagePromise(url)
    {
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
            // are created if missing
        
        this.colorImage=null;

        await this.loadImagePromise('../'+this.colorURL)
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

        this.texture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
        gl.texImage2D(gl.TEXTURE_2D,0,(this.hasColorImageAlpha?gl.RGBA:gl.RGB),(this.hasColorImageAlpha?gl.RGBA:gl.RGB),gl.UNSIGNED_BYTE,this.colorImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // if there is an alpha, build the mask
            // into a different texture so we can use
            // nearest, otherwise it's all black with a 1 alpha
            // so no masking
            
        if (this.hasColorImageAlpha) {
            maskImage=this.colorImage;
        }
        else {
            maskImage=await this.createDefaultImageForMissingImage(0,0,0);      // alpha will be 1
        }
            
        this.mask=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.mask);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,maskImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // normal bitmap
        
        this.normalImage=null;
        
        if (this.normalURL!==null) {
            await this.loadImagePromise('../'+this.normalURL)
                .then
                    (
                            // resolved

                        value=>{
                                this.normalImage=value;
                        },

                            // rejected

                        value=>{}
                    );
        }
        
        if (this.normalImage===null) {
            this.normalImage=await this.createDefaultImageForMissingImage(255,255,255); // setting it to this makes the bump calculations flat on both sides (0,0,255) is normal flat bump
        }

        this.normalMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.normalMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.normalImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);

            // specular bitmap
            
        this.specularImage=null;
        
        if (this.specularURL!==null) {
            await this.loadImagePromise('../'+this.specularURL)
                .then
                    (
                            // resolved

                        value=>{
                                this.specularImage=value;
                        },

                            // rejected

                        value=>{}
                    );
        }
        
        if (this.specularImage===null) {
            this.specularImage=await this.createDefaultImageForMissingImage(0,0,0);
        }
        
        this.specularMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.specularMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.specularImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // glow bitmap
            // these do not have to exist, if missing,
            // will use fake glowmap
        
        this.glowImage=null;
        
        if (this.glowURL!==null) {
            await this.loadImagePromise('../'+this.glowURL)
                .then
                    (
                            // resolved

                        value=>{
                                this.glowImage=value;
                        },

                            // rejected

                        ()=>{}
                    );
        }
        
        if (this.glowImage===null) {
            this.glowImage=await this.createDefaultImageForMissingImage(0,0,0);
        }
        
        this.glowMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.glowMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.glowImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
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
