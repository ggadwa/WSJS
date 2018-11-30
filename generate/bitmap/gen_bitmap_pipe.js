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
    
    generatePipe(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,y,yAdd,metalColor;
        let lineCount,lineColor;
        let screwSize,screwInnerSize,screwColor;

            // some random values

        metalColor=this.getRandomColor();
        this.drawRect(bitmapCTX,0,0,wid,high,metalColor);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // possible streaks
        
        this.generateMetalStreakShine(bitmapCTX,0,0,wid,high,wid,high,metalColor);
        
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
            screwInnerSize=Math.trunc(screwSize*0.4);
            screwColor=this.boostColor(metalColor,0.05);
            this.generateMetalScrewsVertical(bitmapCTX,normalCTX,0,0,wid,high,screwColor,screwSize,screwInnerSize);
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.6);
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

        this.generatePipe(bitmapCTX,normalCTX,specularCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],15.0));    
    }

}
