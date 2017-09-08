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
        super(view);
        Object.seal(this);
    }
            
        //
        // pipe bitmaps
        //
    
    generatePipe(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,x,y,yAdd,darken,metalColor;
        let streakCount,streakWid,streakColor;
        let lineCount,lineColor;
        let screwCount,screwSize,screenFlatInnerSize,screwColor;

            // some random values

        metalColor=this.getDefaultPrimaryColor();
        this.drawRect(bitmapCTX,0,0,wid,high,metalColor);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // possible streaks
        
        if (genRandom.randomPercentage(0.5)) {
            streakCount=genRandom.randomInt(15,10);
            
            for (n=0;n!==streakCount;n++) {
                streakWid=genRandom.randomInt(10,40);
                x=genRandom.randomInBetween(streakWid,(wid-streakWid));

                darken=0.5+(genRandom.random()*0.5);
                streakColor=this.darkenColor(metalColor,darken);

                this.drawStreakMetal(bitmapCTX,wid,high,x,0,high,streakWid,streakColor);
            }
        }
        
            // possible segments
            
        if (genRandom.randomPercentage(0.5)) {
            lineCount=genRandom.randomInt(1,8);
            
            lineColor=this.darkenColor(metalColor,0.7);
            
            yAdd=(high/lineCount);
            y=Math.trunc((high-(yAdd*lineCount))*0.5);
            
            for (n=0;n!==lineCount;n++) {
                this.drawLine(bitmapCTX,normalCTX,0,y,wid,y,lineColor,false);
                y+=yAdd;
            }
        }
        
            // possible screws (in line)
            
        if (genRandom.randomPercentage(0.5)) {
            screwSize=genRandom.randomInt(15,30);
            screenFlatInnerSize=Math.trunc(screwSize*0.4);
            screwColor=this.boostColor(metalColor,0.05);
        
            screwCount=Math.trunc(high/(screwSize*2));
            
            y=5;
            
            for (n=0;n!==screwCount;n++) {
                this.draw3DOval(bitmapCTX,normalCTX,5,y,(screwSize+5),(y+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
                y+=(screwSize*2);
            }
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
        let shineFactor=1.0;
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

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generatePipe(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=15.0;
                break;

        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }

}
