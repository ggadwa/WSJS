import genRandom from '../../generate/utility/random.js';
import ColorClass from '../../code/utility/color.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate particle bitmap class
//

export default class GenBitmapParticleClass extends GenBitmapBaseClass
{
    constructor(view)
    {    
        super(view,false,false,false);
        Object.seal(this);
    }
    
    generateBlob(wid,high)
    {
        let n,f,col;
        let x,y,halfWid,halfHigh,ovalWid,ovalHigh;

            // background
            
        this.drawRect(0,0,wid,high,this.blackColor);

            // different blends of gray
            
        halfWid=Math.trunc(wid*0.5);
        halfHigh=Math.trunc(high*0.5);
            
        for (n=0;n!==20;n++) {
            f=genRandom.randomFloat(0.9,0.1);
            col=new ColorClass(f,f,f);
            
            ovalWid=genRandom.randomInt(halfWid,halfWid);
            ovalHigh=genRandom.randomInt(halfHigh,halfHigh);
            
            x=genRandom.randomInt(0,(wid-ovalWid));
            y=genRandom.randomInt(0,(high-ovalHigh));
            
            this.drawOval(x,y,(x+ovalWid),(y+ovalHigh),col,null);
        }
    }
        
        //
        // generate mainline
        //

    generateInternal()
    {
        let wid,high;

        wid=this.bitmapCanvas.width;
        high=this.bitmapCanvas.height;

        this.generateBlob(wid,high);
    }

}
