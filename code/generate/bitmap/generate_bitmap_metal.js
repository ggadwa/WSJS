import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate metal bitmap class
//

export default class GenerateBitmapMetalClass extends GenerateBitmapBaseClass
{
    constructor(core)
    {
        super(core,true,true,false);
        Object.seal(this);
    }
            
        //
        // metal bitmaps
        //
    
    generateMetal()
    {
        let lft,rgt,top,bot;
        let indentCount,sz;

            // some random values

        let metalColor=this.getRandomMetalColor();

        let edgeSize=GenerateUtilityClass.randomInt(4,8);
        let screwSize=GenerateUtilityClass.randomInt(15,20);
        let screwInnerSize=Math.trunc(screwSize*0.4);
        
        let screwColor=this.boostColor(metalColor,0.05);
        
        lft=0;
        top=0;
        rgt=this.colorCanvas.width;
        bot=this.colorCanvas.height;
        
        indentCount=0;
        
        while (indentCount<2) {
        
                // the plate, streaks, and screws

            this.draw3DRect(lft,top,rgt,bot,edgeSize,metalColor,GenerateUtilityClass.randomPercentage(0.5));
            this.generateMetalStreakShine((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),metalColor);
            this.generateMetalScrewsRandom((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),screwColor,screwSize,screwInnerSize);
            
                // go in more?
                
            if (GenerateUtilityClass.randomPercentage(0.7)) break;
            
            sz=GenerateUtilityClass.randomInt(((screwSize*2)+10),((screwSize*2)+10));
            
            lft+=sz;
            rgt-=sz;
            top+=sz;
            bot-=sz;
            
            indentCount++;
        }
        
            // finish with the specular

        this.createSpecularMap(0.6);
    }
            
        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateMetal();
    }

}
