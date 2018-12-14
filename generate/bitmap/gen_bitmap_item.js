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

    generateMetalWire(y,lineWidth,color)
    {
        y+=Math.trunc(lineWidth*0.5);
        this.drawBumpLine(0,y,this.bitmapCanvas.width,y,(lineWidth-4),color);
    }
    
    generateMetalButtons(y,buttonSize)
    {
        let n,x,color;
        let buttonCount=Math.trunc(this.bitmapCanvas.width/buttonSize)-1;
        
        x=Math.trunc((this.bitmapCanvas.width-(buttonSize*buttonCount))*0.5);
        
        for (n=0;n!==buttonCount;n++) {
            color=this.getRandomColor();
            this.draw3DRect(x,y,(x+(buttonSize-4)),(y+(buttonSize-4)),2,color,false);
            if (genRandom.randomPercentage(0.5)) this.drawGlowRect((x+2),(y+2),(x+(buttonSize-6)),(y+(buttonSize-6)),color);
            x+=buttonSize;
        }
    }
    
    generateMetalScrews(y,screwSize,screwColor)
    {
        let n,x;
        let screwFlatInnerSize=Math.trunc(screwSize*0.25);
        let screwCount=Math.trunc(this.bitmapCanvas.width/screwSize)-1;
        
        x=Math.trunc((this.bitmapCanvas.width-(screwSize*screwCount))*0.5);
        
        for (n=0;n!==screwCount;n++) {
            this.draw3DOval(x,y,(x+(screwSize-4)),(y+(screwSize-4)),0.0,1.0,2,screwFlatInnerSize,screwColor,this.blackColor);
            x+=screwSize;
        }
    }
    
    generateMetal()
    {
        let n,y,yAdd,lineCount;

            // some random values

        let metalColor=this.getRandomMetalColor();
        let wireColor=this.getRandomColor();
        let screwColor=this.darkenColor(metalColor,0.8);
        
            // the plate
            
        this.drawRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,metalColor);
        this.generateMetalStreakShine(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,metalColor);
        
            // parts of item
        
        lineCount=genRandom.randomInt(5,8);
        
        y=0;
        yAdd=Math.trunc(this.bitmapCanvas.height/lineCount);
        
        for (n=0;n!==lineCount;n++) {
            switch(genRandom.randomIndex(4)) {
                case 0:
                    this.generateMetalWire(y,yAdd,wireColor);
                    break;
                case 1:
                    this.generateMetalButtons(y,yAdd);
                    break;
                case 2:
                    this.generateMetalScrews(y,yAdd,screwColor);
                    break;
            }
            
            y+=yAdd;
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
