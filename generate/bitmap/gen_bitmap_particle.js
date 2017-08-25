import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate particle bitmap class
//

export default class GenBitmapParticleClass extends GenBitmapBaseClass
{
    constructor(view)
    {    
        super(view);
        Object.seal(this);
    }
        
        //
        // generate mainline
        //

    generate(inDebug)
    {
        let wid,high;
        let bitmapCanvas,bitmapCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=this.BITMAP_PARTICLE_TEXTURE_SIZE;
        bitmapCanvas.height=this.BITMAP_PARTICLE_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // no types yet
            
        this.drawRect(bitmapCTX,0,0,wid,high,this.blackColor);
        this.drawOval(bitmapCTX,0,0,wid,high,this.whiteColor,null);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:null,specular:null,glow:null});
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,null,null,null,[(1.0/4000.0),(1.0/4000.0)],1.0));    
    }

}
