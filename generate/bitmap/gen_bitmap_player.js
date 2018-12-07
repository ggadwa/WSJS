import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate skin bitmap class
//

export default class GenBitmapPlayerClass extends GenBitmapBaseClass
{
    constructor(view)
    {    
        super(view,true,true,true);
        Object.seal(this);
    }
        
        //
        // suit
        //
                
    generateSuit(wid,high)
    {
        let mx=Math.trunc(wid*0.5);
        let my=Math.trunc(high*0.5);
         
            // clear canvases

        this.drawRect(0,0,wid,high,this.whiteColor);       
        this.clearNormalsRect(0,0,wid,high);

            // fur
            
        this.drawUVTest(0,0,mx,my);
        this.drawUVTest(mx,0,wid,my);
        this.generateFaceChunk(mx,0,wid,my);
        this.drawUVTest(0,my,mx,high);

            // finish with the specular

        this.createSpecularMap(wid,high,0.3);
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        let wid,high;

        wid=this.bitmapCanvas.width;
        high=this.bitmapCanvas.height;
        
        this.generateSuit(wid,high);
    }

}
