import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate plaster bitmap class
//

export default class GenBitmapPlasterClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
    
        //
        // plaster bitmaps
        //

    generatePlaster()
    {
        let n,x;
        let lineColor,darken,boost;

            // some random values

        let lineColorBase=this.getRandomColor();
        let plasterColor=this.dullColor(lineColorBase,0.8);
        let lineCount=genRandom.randomInt(50,50);

            // clear canvases

        this.drawRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,plasterColor);
        
            // lines
            
        for (n=0;n!==lineCount;n++) {
            x=genRandom.randomInt(0,this.bitmapCanvas.width);
            
            darken=0.85+(genRandom.random()*0.1);
            lineColor=this.darkenColor(lineColorBase,darken);
            
            this.drawRandomLine(x,0,x,this.bitmapCanvas.height,0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,15,lineColor,false);
        }
        
        for (n=0;n!==lineCount;n++) {
            x=genRandom.randomInt(0,this.bitmapCanvas.width);
            
            boost=0.05+(genRandom.random()*0.1);
            lineColor=this.boostColor(lineColorBase,boost);
            
            this.drawRandomLine(x,0,x,this.bitmapCanvas.height,0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,15,lineColor,false);
        }
        
            // plaster noise
            
        this.addNoiseRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,0.6,0.8,0.8);
        this.blur(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,5,false);

            // finish with the specular

        this.createSpecularMap(0.4);
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        this.generatePlaster();
    }

}
