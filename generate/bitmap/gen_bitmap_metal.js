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
        super(view);
        Object.seal(this);
    }
            
        //
        // metal bitmaps
        //
    
    generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let lft,rgt,top,bot;
        let indentCount,sz;

            // some random values

        let metalColor=this.getRandomMetalColor();

        let edgeSize=genRandom.randomInt(4,8);
        let screwSize=genRandom.randomInt(15,20);
        let screwInnerSize=Math.trunc(screwSize*0.4);
        
        let screwColor=this.boostColor(metalColor,0.05);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
        lft=0;
        top=0;
        rgt=wid;
        bot=high;
        
        indentCount=0;
        
        while (indentCount<2) {
        
                // the plate, streaks, and screws

            this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,metalColor,genRandom.randomPercentage(0.5));
            this.generateMetalStreakShine(bitmapCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),wid,high,metalColor);
            this.generateMetalScrewsRandom(bitmapCTX,normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),screwColor,screwSize,screwInnerSize);
            
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

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.6);
    }
            
        //
        // generate mainline
        //

    generate(inDebug)
    {
        let wid,high;
        let bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX,glowCanvas,glowCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=this.BITMAP_MAP_TEXTURE_SIZE;
        bitmapCanvas.height=this.BITMAP_MAP_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        normalCanvas=document.createElement('canvas');
        normalCanvas.width=this.BITMAP_MAP_TEXTURE_SIZE;
        normalCanvas.height=this.BITMAP_MAP_TEXTURE_SIZE;
        normalCTX=normalCanvas.getContext('2d');

        specularCanvas=document.createElement('canvas');
        specularCanvas.width=this.BITMAP_MAP_TEXTURE_SIZE;
        specularCanvas.height=this.BITMAP_MAP_TEXTURE_SIZE;
        specularCTX=specularCanvas.getContext('2d');
        
        glowCanvas=document.createElement('canvas');
        glowCanvas.width=2;
        glowCanvas.height=2;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,2,2);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],15.0));    
    }

}
