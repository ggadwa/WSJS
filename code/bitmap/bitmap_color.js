import ColorClass from '../utility/color.js';
import BitmapClass from '../bitmap/bitmap.js';

export default class BitmapColorClass extends BitmapClass
{
    constructor(core,colorURL,colorBase)
    {
        super(core);
        
        this.colorURL=colorURL;
        this.colorBase=colorBase;
        
        this.loaded=false;
        
        Object.seal(this);
    }
    
    async load()
    {
        let gl=this.core.gl;
        
        this.colorImage=this.createSolidColorImage(Math.trunc(this.colorBase.r*255),Math.trunc(this.colorBase.g*255),Math.trunc(this.colorBase.b*255));
            
        this.colorTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.colorTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.colorImage);
        
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
