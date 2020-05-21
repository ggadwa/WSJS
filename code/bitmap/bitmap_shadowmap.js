import ColorClass from '../utility/color.js';
import BitmapClass from '../bitmap/bitmap.js';

export default class BitmapShadowmapClass extends BitmapClass
{
    constructor(core,colorURL)
    {
        super(core);
        
        this.colorURL=colorURL;
        
        Object.seal(this);
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
        
        this.colorImage=null;
        
        this.loaded=false;
    }
            
    async load()
    {
        let gl=this.core.gl;
        
            // shadows only have a color image
        
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
        
            
        this.colorTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.colorImage);
        
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        
        gl.bindTexture(gl.TEXTURE_2D,null);        
    }
    
    attach(shader)
    {
        let gl=this.core.gl;
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
    }
}
