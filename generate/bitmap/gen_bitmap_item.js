import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate item bitmap class
//

export default class GenBitmapItemClass extends GenBitmapBaseClass
{
    constructor(view)
    {    
        super(view,true,true,true);
        Object.seal(this);
    }
    
        //
        // metal
        //

    generateMetalWire(bitmapCTX,normalCTX,y,lineWidth,wid,high,color)
    {
        y+=Math.trunc(lineWidth*0.5);
        this.drawBumpLine(bitmapCTX,normalCTX,0,y,wid,y,(lineWidth-4),color);
    }
    
    generateMetalButtons(bitmapCTX,normalCTX,glowCTX,y,buttonSize,wid,high)
    {
        let n,x,color;
        let buttonCount=Math.trunc(wid/buttonSize)-1;
        
        x=Math.trunc((wid-(buttonSize*buttonCount))*0.5);
        
        for (n=0;n!==buttonCount;n++) {
            color=this.getRandomColor();
            this.draw3DRect(bitmapCTX,normalCTX,x,y,(x+(buttonSize-4)),(y+(buttonSize-4)),2,color,false);
            if (genRandom.randomPercentage(0.5)) this.drawGlowRect(glowCTX,(x+2),(y+2),(x+(buttonSize-6)),(y+(buttonSize-6)),color);
            x+=buttonSize;
        }
    }
    
    generateMetalScrews(bitmapCTX,normalCTX,y,screwSize,wid,high,screwColor)
    {
        let n,x;
        let screwFlatInnerSize=Math.trunc(screwSize*0.25);
        let screwCount=Math.trunc(wid/screwSize)-1;
        
        x=Math.trunc((wid-(screwSize*screwCount))*0.5);
        
        for (n=0;n!==screwCount;n++) {
            this.draw3DOval(bitmapCTX,normalCTX,x,y,(x+(screwSize-4)),(y+(screwSize-4)),0.0,1.0,2,screwFlatInnerSize,screwColor,this.blackColor);
            x+=screwSize;
        }
    }
    
    generateMetal(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high)
    {
        let n,y,yAdd,lineCount;

            // some random values

        let metalColor=this.getRandomMetalColor();
        let wireColor=this.getRandomColor();
        let screwColor=this.darkenColor(metalColor,0.8);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        this.clearGlowRect(glowCTX,0,0,wid,high);
        
            // the plate
            
        this.drawRect(bitmapCTX,0,0,wid,high,metalColor);
        this.generateMetalStreakShine(bitmapCTX,0,0,wid,high,wid,high,metalColor);
        
            // parts of item
        
        lineCount=genRandom.randomInt(5,8);
        
        y=0;
        yAdd=Math.trunc(high/lineCount);
        
        for (n=0;n!==lineCount;n++) {
            switch(genRandom.randomIndex(4)) {
                case 0:
                    this.generateMetalWire(bitmapCTX,normalCTX,y,yAdd,wid,high,wireColor);
                    break;
                case 1:
                    this.generateMetalButtons(bitmapCTX,normalCTX,glowCTX,y,yAdd,wid,high);
                    break;
                case 2:
                    this.generateMetalScrews(bitmapCTX,normalCTX,y,yAdd,wid,high,screwColor);
                    break;
            }
            
            y+=yAdd;
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
        bitmapCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        bitmapCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        normalCanvas=document.createElement('canvas');
        normalCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        normalCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        normalCTX=normalCanvas.getContext('2d');

        specularCanvas=document.createElement('canvas');
        specularCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        specularCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        specularCTX=specularCanvas.getContext('2d');
        
        glowCanvas=document.createElement('canvas');
        glowCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        glowCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        glowCTX=glowCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        this.generateMetal(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],8.0));    
    }

}
