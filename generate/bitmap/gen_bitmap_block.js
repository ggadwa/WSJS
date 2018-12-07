import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate block bitmap class
//

export default class GenBitmapBlockClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
        
        //
        // block bitmaps
        //

    generateBlock(wid,high)
    {
        let n,nBlock,flip;
        let top,bot,ySize,slopeHigh;
        let sx,ex,streakWid;
        
        let concreteColor=this.getRandomColor();
        let concreteColor2=this.darkenColor(concreteColor,0.8);
        let dirtColor=this.darkenColor(concreteColor,0.5);
        
        this.clearNormalsRect(0,0,wid,high);
        
            // block sizes
            
        nBlock=2+(genRandom.randomInt(0,2)*2);
        ySize=high/nBlock;
        
            // the blocks
        
        top=0;
        
        for (n=0;n!==nBlock;n++) {
            
            flip=((n%2)!==0);
            bot=top+Math.trunc(ySize);
               
               // concrete background
               
            this.drawRect(0,top,wid,bot,(flip?concreteColor:concreteColor2));
            
                // slopes
            
            slopeHigh=0;
            if (flip) {
                slopeHigh=genRandom.randomInt(10,Math.trunc(ySize/6));
                this.drawSlope(0,top,wid,(top+slopeHigh),concreteColor,true);
                this.drawSlope(0,(bot-slopeHigh),wid,bot,concreteColor,false);
            }
            
                // and random conrete noise

            this.addNoiseRect(0,top,wid,bot,0.6,0.8,0.8);
            this.blur(0,top,wid,bot,3,false);

            this.addNoiseRect(0,top,wid,bot,0.8,0.9,0.7);
            this.blur(0,top,wid,bot,3,false);

                // final noise has the streak in it
                
            this.addNoiseRect(0,top,wid,bot,1.0,1.2,0.6);
            
            streakWid=genRandom.randomInBetween(Math.trunc(wid/2),(wid-20));
            sx=genRandom.randomInt(0,(wid-streakWid));
            ex=sx+streakWid;

            this.drawStreakDirt(sx,top,ex,(top+slopeHigh),0,4,0.8,dirtColor);    
            this.drawStreakDirt(sx,(top+slopeHigh),ex,(bot-slopeHigh),5,8,0.8,dirtColor);

            this.blur(0,top,wid,bot,3,false);
           
            top=bot;
        }
        
            // finish with the specular

        this.createSpecularMap(wid,high,0.5);
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

        this.generateBlock(wid,high);
    }

}
