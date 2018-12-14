import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate pipe bitmap class
//

export default class GenBitmapPipeClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
            
        //
        // pipe bitmaps
        //
    
    generatePipe()
    {
        let n,y,yAdd,metalColor;
        let lineCount,lineColor;
        let screwSize,screwInnerSize,screwColor;

            // some random values

        metalColor=this.getRandomColor();
        this.drawRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,metalColor);
        
            // possible streaks
        
        this.generateMetalStreakShine(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,metalColor);
        
            // possible segments
            
        if (genRandom.randomPercentage(0.5)) {
            lineCount=genRandom.randomInt(1,8);
            
            lineColor=this.darkenColor(metalColor,0.7);
            
            yAdd=(this.bitmapCanvas.height/lineCount);
            y=Math.trunc((this.bitmapCanvas.height-(yAdd*lineCount))*0.5);
            
            for (n=0;n!==lineCount;n++) {
                this.drawLine(0,y,this.bitmapCanvas.width,y,lineColor,false);
                y+=yAdd;
            }
        }
        
            // possible screws (in line)
            
        if (genRandom.randomPercentage(0.5)) {
            screwSize=genRandom.randomInt(15,30);
            screwInnerSize=Math.trunc(screwSize*0.4);
            screwColor=this.boostColor(metalColor,0.05);
            this.generateMetalScrewsVertical(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,screwColor,screwSize,screwInnerSize);
        }
        
            // finish with the specular

        this.createSpecularMap(0.6);
    }
            
        //
        // generate mainline
        //

    generateInternal()
    {
        this.generatePipe();
    }

}
