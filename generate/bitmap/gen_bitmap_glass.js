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
    
    generateGlass()
    {
        let n,nLine,color;
        let x,y,x2,y2,startWid,sizeWid;
        
            // default glass to white
            
        this.drawRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,this.whiteColor);
        
            // back noise and blur
            
        this.addNoiseRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,0.9,0.95,0.7);
        this.blur(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,10,false);
        
            // reflection lines
            
        nLine=genRandom.randomInt(5,20);
        
        startWid=Math.trunc(this.bitmapCanvas.width*0.4);
        sizeWid=Math.trunc(this.bitmapCanvas.width*0.6);
        
        for (n=0;n!==nLine;n++) {
            color=this.getRandomGray(0.7,0.9);
            x=genRandom.randomInt(0,startWid);
            x2=genRandom.randomInt((x+1),(this.bitmapCanvas.width-x));
            y=this.bitmapCanvas.height-genRandom.randomInt(0,(this.bitmapCanvas.height-(x2-x)));
            y2=y-Math.trunc((x2-x)*0.5);
            this.drawBumpLine(x,y,x2,y2,1,color);
        }
        
            // front noise and blur
            
        this.addNoiseRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,0.95,1.0,0.7);
        this.blur(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,5,false);        
       
            // finish with the specular

        this.createSpecularMap(0.6);
    }
            
        //
        // generate mainline
        //

    generateInternal()
    {
        this.shineFactor=1.0;
        this.alpha=genRandom.randomFloat(0.3,0.5);

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generateGlass();
                this.shineFactor=10.0;
                break;

        }
    }

}
