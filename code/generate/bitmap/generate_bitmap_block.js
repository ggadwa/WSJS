import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate block bitmap class
//

export default class GenerateBitmapBlockClass extends GenerateBitmapBaseClass
{
    constructor(core)
    {
        super(core,true,true,false);
        Object.seal(this);
    }
        
        //
        // block bitmaps
        //

    generateBlock()
    {
        let n,k,nBlock,col,flip;
        let top,bot,ySize,slopeHigh;
        let sx,ex,ey,streakCount,streakWid,streakColor;
        
        let concreteColor=this.getRandomColor();
        let concreteColor2=this.boostColor(concreteColor,0.1);
        
            // block counts (always even)
            
        nBlock=2+(GenerateUtilityClass.randomInt(0,3)*2);
        ySize=Math.trunc(this.colorCanvas.height/nBlock);
        
        slopeHigh=GenerateUtilityClass.randomInt(Math.trunc(ySize/10),Math.trunc(ySize/10));
        
            // the blocks
        
        top=0;
        
        for (n=0;n!==nBlock;n++) {
            
            flip=((n%2)!==0);
            bot=(n===(nBlock-1))?this.colorCanvas.height:(top+ySize);
               
               // concrete background
               
               
            col=flip?concreteColor:concreteColor2;
           // this.drawBumpySurface(0,top,this.colorCanvas.width,bot,col,0.9,0.7,Math.trunc(this.colorCanvas.width*0.1),1);
            
                // slopes

            if (flip) {
                this.drawSlope(0,top,this.colorCanvas.width,(top+slopeHigh),col,true);
                this.drawSlope(0,(bot-slopeHigh),this.colorCanvas.width,bot,col,false);
            }
            
                // noise and streaks

            this.drawNoiseRect(0,top,this.colorCanvas.width,bot,0.6,0.8,0.8);
            //this.drawStaticNoiseRect(0,0,this.colorCanvas.width,this.colorCanvas.height,0.6,1.1,2,false);
            
            streakCount=GenerateUtilityClass.randomInt(0,5);
            streakColor=this.darkenColor(col,0.6);
            
            for (k=0;k!==streakCount;k++) {

                streakWid=GenerateUtilityClass.randomInBetween(Math.trunc(this.colorCanvas.width*0.2),Math.trunc(this.colorCanvas.width*0.3));
                if (streakWid<10) streakWid=10;

                sx=GenerateUtilityClass.randomInt(0,(this.colorCanvas.width-streakWid));
                ex=sx+streakWid;
                ey=GenerateUtilityClass.randomInBetween(bot,Math.trunc((bot-top)*1.5));
                
                this.drawStreakDirt(sx,top,ex,ey,bot,5,0.1,0.5,streakColor);
            }
            
            this.blur(this.colorCTX,0,top,this.colorCanvas.width,bot,2,false);

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
