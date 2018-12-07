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

    generateMetalWire(y,lineWidth,wid,high,color)
    {
        y+=Math.trunc(lineWidth*0.5);
        this.drawBumpLine(0,y,wid,y,(lineWidth-4),color);
    }
    
    generateMetalButtons(y,buttonSize,wid,high)
    {
        let n,x,color;
        let buttonCount=Math.trunc(wid/buttonSize)-1;
        
        x=Math.trunc((wid-(buttonSize*buttonCount))*0.5);
        
        for (n=0;n!==buttonCount;n++) {
            color=this.getRandomColor();
            this.draw3DRect(x,y,(x+(buttonSize-4)),(y+(buttonSize-4)),2,color,false);
            if (genRandom.randomPercentage(0.5)) this.drawGlowRect((x+2),(y+2),(x+(buttonSize-6)),(y+(buttonSize-6)),color);
            x+=buttonSize;
        }
    }
    
    generateMetalScrews(y,screwSize,wid,high,screwColor)
    {
        let n,x;
        let screwFlatInnerSize=Math.trunc(screwSize*0.25);
        let screwCount=Math.trunc(wid/screwSize)-1;
        
        x=Math.trunc((wid-(screwSize*screwCount))*0.5);
        
        for (n=0;n!==screwCount;n++) {
            this.draw3DOval(x,y,(x+(screwSize-4)),(y+(screwSize-4)),0.0,1.0,2,screwFlatInnerSize,screwColor,this.blackColor);
            x+=screwSize;
        }
    }
    
    generateMetal(wid,high)
    {
        let n,y,yAdd,lineCount;

            // some random values

        let metalColor=this.getRandomMetalColor();
        let wireColor=this.getRandomColor();
        let screwColor=this.darkenColor(metalColor,0.8);
        
            // clear canvases

        this.clearNormalsRect(0,0,wid,high);
        this.clearGlowRect(0,0,wid,high);
        
            // the plate
            
        this.drawRect(0,0,wid,high,metalColor);
        this.generateMetalStreakShine(0,0,wid,high,wid,high,metalColor);
        
            // parts of item
        
        lineCount=genRandom.randomInt(5,8);
        
        y=0;
        yAdd=Math.trunc(high/lineCount);
        
        for (n=0;n!==lineCount;n++) {
            switch(genRandom.randomIndex(4)) {
                case 0:
                    this.generateMetalWire(y,yAdd,wid,high,wireColor);
                    break;
                case 1:
                    this.generateMetalButtons(y,yAdd,wid,high);
                    break;
                case 2:
                    this.generateMetalScrews(y,yAdd,wid,high,screwColor);
                    break;
            }
            
            y+=yAdd;
        }

            // finish with the specular

        this.createSpecularMap(wid,high,0.6);
    }
    
        //
        // generate mainline
        //

    generateInternal()
    {
        let wid,high;

        wid=this.bitmapCanvas.width;
        high=this.bitmapCanvas.height;

            // create the bitmap

        this.generateMetal(wid,high);
    }

}
