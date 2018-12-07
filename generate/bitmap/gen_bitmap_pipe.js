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
    
    generatePipe(wid,high)
    {
        let n,y,yAdd,metalColor;
        let lineCount,lineColor;
        let screwSize,screwInnerSize,screwColor;

            // some random values

        metalColor=this.getRandomColor();
        this.drawRect(0,0,wid,high,metalColor);
        
            // clear canvases

        this.clearNormalsRect(0,0,wid,high);
        
            // possible streaks
        
        this.generateMetalStreakShine(0,0,wid,high,wid,high,metalColor);
        
            // possible segments
            
        if (genRandom.randomPercentage(0.5)) {
            lineCount=genRandom.randomInt(1,8);
            
            lineColor=this.darkenColor(metalColor,0.7);
            
            yAdd=(high/lineCount);
            y=Math.trunc((high-(yAdd*lineCount))*0.5);
            
            for (n=0;n!==lineCount;n++) {
                this.drawLine(0,y,wid,y,lineColor,false);
                y+=yAdd;
            }
        }
        
            // possible screws (in line)
            
        if (genRandom.randomPercentage(0.5)) {
            screwSize=genRandom.randomInt(15,30);
            screwInnerSize=Math.trunc(screwSize*0.4);
            screwColor=this.boostColor(metalColor,0.05);
            this.generateMetalScrewsVertical(0,0,wid,high,screwColor,screwSize,screwInnerSize);
        }
        
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

        this.generatePipe(wid,high);
    }

}
