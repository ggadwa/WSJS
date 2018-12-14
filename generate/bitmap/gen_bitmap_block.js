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

    generateBlock()
    {
        let n,nBlock,flip;
        let top,bot,ySize,slopeHigh;
        let sx,ex,streakWid;
        
        let concreteColor=this.getRandomColor();
        let concreteColor2=this.darkenColor(concreteColor,0.8);
        let dirtColor=this.darkenColor(concreteColor,0.5);
        
            // block sizes
            
        nBlock=2+(genRandom.randomInt(0,2)*2);
        ySize=this.bitmapCanvas.height/nBlock;
        
            // the blocks
        
        top=0;
        
        for (n=0;n!==nBlock;n++) {
            
            flip=((n%2)!==0);
            bot=top+Math.trunc(ySize);
               
               // concrete background
               
            this.drawRect(0,top,this.bitmapCanvas.width,bot,(flip?concreteColor:concreteColor2));
            
                // slopes
            
            slopeHigh=0;
            if (flip) {
                slopeHigh=genRandom.randomInt(10,Math.trunc(ySize/6));
                this.drawSlope(0,top,this.bitmapCanvas.width,(top+slopeHigh),concreteColor,true);
                this.drawSlope(0,(bot-slopeHigh),this.bitmapCanvas.width,bot,concreteColor,false);
            }
            
                // and random conrete noise

            this.addNoiseRect(0,top,this.bitmapCanvas.width,bot,0.6,0.8,0.8);
            this.blur(0,top,this.bitmapCanvas.width,bot,3,false);

            this.addNoiseRect(0,top,this.bitmapCanvas.width,bot,0.8,0.9,0.7);
            this.blur(0,top,this.bitmapCanvas.width,bot,3,false);

                // final noise has the streak in it
                
            this.addNoiseRect(0,top,this.bitmapCanvas.width,bot,1.0,1.2,0.6);
            
            streakWid=genRandom.randomInBetween(Math.trunc(this.bitmapCanvas.width/2),(this.bitmapCanvas.width-20));
            sx=genRandom.randomInt(0,(this.bitmapCanvas.width-streakWid));
            ex=sx+streakWid;

            this.drawStreakDirt(sx,top,ex,(top+slopeHigh),0,4,0.8,dirtColor);    
            this.drawStreakDirt(sx,(top+slopeHigh),ex,(bot-slopeHigh),5,8,0.8,dirtColor);

            this.blur(0,top,this.bitmapCanvas.width,bot,3,false);
           
            top=bot;
        }
        
            // finish with the specular

        this.createSpecularMap(0.5);
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateBlock();
    }

}
