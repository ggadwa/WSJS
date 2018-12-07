import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate glass bitmap class
//

export default class GenBitmapGlassClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
            
        //
        // glass bitmaps
        //
    
    generateGlass(wid,high)
    {
        let n,nLine,color;
        let x,y,x2,y2,startWid,sizeWid;
        
        this.clearNormalsRect(0,0,wid,high);
        
            // default glass to white
            
        this.drawRect(0,0,wid,high,this.whiteColor);
        
            // back noise and blur
            
        this.addNoiseRect(0,0,wid,high,0.9,0.95,0.7);
        this.blur(0,0,wid,high,10,false);
        
            // reflection lines
            
        nLine=genRandom.randomInt(5,20);
        
        startWid=Math.trunc(wid*0.4);
        sizeWid=Math.trunc(wid*0.6);
        
        for (n=0;n!==nLine;n++) {
            color=this.getRandomGray(0.7,0.9);
            x=genRandom.randomInt(0,startWid);
            x2=genRandom.randomInt((x+1),(wid-x));
            y=high-genRandom.randomInt(0,(high-(x2-x)));
            y2=y-Math.trunc((x2-x)*0.5);
            this.drawBumpLine(x,y,x2,y2,1,color);
        }
        
            // front noise and blur
            
        this.addNoiseRect(0,0,wid,high,0.95,1.0,0.7);
        this.blur(0,0,wid,high,5,false);        
       
            // finish with the specular

        this.createSpecularMap(wid,high,0.6);
    }
            
        //
        // generate mainline
        //

    generateInternal()
    {
        let wid,high;

        wid=this.bitmapCanvas.width;
        high=this.bitmapCanvas.height;

            // create the bitmap
            
        this.shineFactor=1.0;
        this.alpha=genRandom.randomFloat(0.3,0.5);

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generateGlass(wid,high);
                this.shineFactor=10.0;
                break;

        }
    }

}
