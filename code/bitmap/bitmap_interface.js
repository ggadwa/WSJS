import ColorClass from '../utility/color.js';
import BitmapClass from '../bitmap/bitmap.js';

export default class BitmapInterfaceClass extends BitmapClass
{
    constructor(core,colorURL)
    {
        super(core);
        
        this.colorURL=colorURL;
        
        this.loaded=false;
        
        Object.seal(this);
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
        
            // color bitmap
        
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
        
        if (this.colorImage===null) return(false);
            
        this.colorTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.colorImage);
        
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        
        gl.bindTexture(gl.TEXTURE_2D,null);
        
        this.loaded=true;
        
        return(true);
    }
    
    attach(shader)
    {
        let gl=this.core.gl;
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
    }
}
