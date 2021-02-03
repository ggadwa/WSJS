import ColorClass from '../utility/color.js';


export default class BitmapClass
{
    constructor(core)
    {
        this.core=core;
        
        this.colorURL=null;
        this.colorBase=null;
        this.normalURL=null;
        this.metallicRoughnessURL=null;
        this.emissiveURL=null;
        this.emissiveFactor=new ColorClass(1,1,1);
        this.scale=[1,1];
        
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
        
        this.loaded=false;
        
        // no seal, these are extended
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
        this.maskTexture=null;
        
        this.loaded=false;
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
    
        //
        // overrides
        //
        
    async load()
    {
    }
    
    attach()
    {
    }
}
