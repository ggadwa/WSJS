import ColorClass from '../../code/utility/color.js';
import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate liquid bitmap class
//

export default class GenBitmapLiquidClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
        
        //
        // liquid
        //
        
    generateLiquid(wid,high)
    {
        let n,k,x,y,xAdd,yAdd,lineCount,ovalCount,ovalWid,ovalHigh,ovalColor;
        let color=new ColorClass(genRandom.randomFloat(0.1,0.2),genRandom.randomFloat(0.1,0.2),1.0);
        
        this.clearNormalsRect(0,0,wid,high);
        
            // background
            
        this.drawRect(0,0,wid,high,color);
        
            // water lines
            
        lineCount=genRandom.randomInt(5,5);
        
        for (n=0;n!==lineCount;n++) {
            ovalColor=this.darkenColor(color,genRandom.randomFloat(0.93,0.05));
            
            x=genRandom.randomInt(0,wid);
            y=genRandom.randomInt(0,high);
            xAdd=25-genRandom.randomInt(25,25);
            yAdd=25-genRandom.randomInt(25,25);
            
            ovalCount=genRandom.randomInt(5,10);
            
            for (k=0;k!==ovalCount;k++) {
                ovalWid=genRandom.randomInt(50,100);
                ovalHigh=genRandom.randomInt(50,100);

                this.drawWrappedOval(x,y,(x+ovalWid),(y+ovalHigh),wid,high,ovalColor,null);
                
                x+=xAdd;
                if (x<0) x+=wid;
                if (x>=wid) x-=wid;
                
                y+=yAdd;
                if (y<0) y+=high;
                if (y>=high) y-=high;
            }
        }
        
        this.blur(0,0,wid,high,5,false);
        
            // noise and blur
        
        this.addNoiseRect(0,0,wid,high,0.8,0.9,0.9);
        this.blur(0,0,wid,high,10,false);
        
        this.createSpecularMap(wid,high,0.5);
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
            
        this.shineFactor=1.0;
        this.alpha=genRandom.randomFloat(0.8,0.2);

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generateLiquid(wid,high);
                this.shineFactor=8.0;
                break;

        }
    }

}
