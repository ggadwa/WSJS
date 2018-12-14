import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate metal bitmap class
//

export default class GenBitmapMetalClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
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

        let edgeSize=genRandom.randomInt(4,8);
        let screwSize=genRandom.randomInt(15,20);
        let screwInnerSize=Math.trunc(screwSize*0.4);
        
        let screwColor=this.boostColor(metalColor,0.05);
        
        lft=0;
        top=0;
        rgt=this.bitmapCanvas.width;
        bot=this.bitmapCanvas.height;
        
        indentCount=0;
        
        while (indentCount<2) {
        
                // the plate, streaks, and screws

            this.draw3DRect(lft,top,rgt,bot,edgeSize,metalColor,genRandom.randomPercentage(0.5));
            this.generateMetalStreakShine((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),metalColor);
            this.generateMetalScrewsRandom((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),screwColor,screwSize,screwInnerSize);
            
                // go in more?
                
            if (genRandom.randomPercentage(0.7)) break;
            
            sz=genRandom.randomInt(((screwSize*2)+10),((screwSize*2)+10));
            
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
