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

    generateBlock(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,nBlock,flip;
        let top,bot,ySize,slopeHigh;
        let sx,ex,streakWid;
        
        let concreteColor=this.getRandomColor();
        let concreteColor2=this.darkenColor(concreteColor,0.8);
        let dirtColor=this.darkenColor(concreteColor,0.5);
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // block sizes
            
        nBlock=2+(genRandom.randomInt(0,2)*2);
        ySize=high/nBlock;
        
            // the blocks
        
        top=0;
        
        for (n=0;n!==nBlock;n++) {
            
            flip=((n%2)!==0);
            bot=top+Math.trunc(ySize);
               
               // concrete background
               
            this.drawRect(bitmapCTX,0,top,wid,bot,(flip?concreteColor:concreteColor2));
            
                // slopes
            
            slopeHigh=0;
            if (flip) {
                slopeHigh=genRandom.randomInt(10,Math.trunc(ySize/6));
                this.drawSlope(bitmapCTX,normalCTX,0,top,wid,(top+slopeHigh),concreteColor,true);
                this.drawSlope(bitmapCTX,normalCTX,0,(bot-slopeHigh),wid,bot,concreteColor,false);
            }
            
                // and random conrete noise

            this.addNoiseRect(bitmapCTX,0,top,wid,bot,0.6,0.8,0.8);
            this.blur(bitmapCTX,0,top,wid,bot,3,false);

            this.addNoiseRect(bitmapCTX,0,top,wid,bot,0.8,0.9,0.7);
            this.blur(bitmapCTX,0,top,wid,bot,3,false);

                // final noise has the streak in it
                
            this.addNoiseRect(bitmapCTX,0,top,wid,bot,1.0,1.2,0.6);
            
            streakWid=genRandom.randomInBetween(Math.trunc(wid/2),(wid-20));
            sx=genRandom.randomInt(0,(wid-streakWid));
            ex=sx+streakWid;

            this.drawStreakDirt(bitmapCTX,sx,top,ex,(top+slopeHigh),0,4,0.8,dirtColor);    
            this.drawStreakDirt(bitmapCTX,sx,(top+slopeHigh),ex,(bot-slopeHigh),5,8,0.8,dirtColor);

            this.blur(bitmapCTX,0,top,wid,bot,3,false);
           
            top=bot;
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    }

        //
        // generate mainline
        //

    generateInternal(inDebug)
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

        this.generateBlock(bitmapCTX,normalCTX,specularCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],5.0));    
    }

}
