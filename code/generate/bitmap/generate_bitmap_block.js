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

    generateInternal()
    {
        let n,k,nBlock,col,flip;
        let top,bot,ySize,slopeHigh;
        let sx,ex,ty,by,streakCount,streakWid,streakColor;
        
        let concreteColor=this.getRandomColor();
        let concreteColor2=this.boostColor(concreteColor,0.1);
        
            // cement like noise
            
        this.createNormalNoiseData(2.2,0.4);    
        
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
            this.drawRect(0,top,this.colorCanvas.width,bot,col);
            
            this.drawNormalNoiseRect(0,top,this.colorCanvas.width,bot);
            
                // slopes

            if (flip) {
                this.drawSlope(0,top,this.colorCanvas.width,(top+slopeHigh),col,true);
                this.drawSlope(0,(bot-slopeHigh),this.colorCanvas.width,bot,col,false);
            }
            
                // noise and streaks

            this.drawStaticNoiseRect(0,top,this.colorCanvas.width,bot,0.8,1.2);
            
            streakCount=GenerateUtilityClass.randomInt(0,5);
            streakColor=this.darkenColor(col,0.6);
            
            ty=flip?(top+slopeHigh):top;
            by=flip?(bot-slopeHigh):bot;
            
            for (k=0;k!==streakCount;k++) {
                streakWid=GenerateUtilityClass.randomInBetween(Math.trunc(this.colorCanvas.width*0.2),Math.trunc(this.colorCanvas.width*0.3));
                if (streakWid<10) streakWid=10;

                sx=GenerateUtilityClass.randomInt(0,(this.colorCanvas.width-streakWid));
                ex=sx+streakWid;
                
                this.drawStreakDirt(sx,ty,ex,by,5,0.1,0.5,streakColor);
            }
            
            this.blur(this.colorImgData.data,0,top,this.colorCanvas.width,bot,2,false);

            top=bot;
        }
        
            // finish with the specular

        this.createSpecularMap(0.5);
    }

}
