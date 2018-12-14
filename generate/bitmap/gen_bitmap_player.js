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
                
    generateSuit()
    {
        let mx=Math.trunc(this.bitmapCanvas.width*0.5);
        let my=Math.trunc(this.bitmapCanvas.height*0.5);

            // fur
            
        this.drawUVTest(0,0,mx,my);
        this.drawUVTest(mx,0,this.bitmapCanvas.width,my);
        this.generateFaceChunk(mx,0,this.bitmapCanvas.width,my);
        this.drawUVTest(0,my,mx,this.bitmapCanvas.height);

            // finish with the specular

        this.createSpecularMap(0.3);
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateSuit();
    }

}
