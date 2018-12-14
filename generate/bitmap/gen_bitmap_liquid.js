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
        
    generateLiquid()
    {
        let n,k,x,y,xAdd,yAdd,lineCount,ovalCount,ovalWid,ovalHigh,ovalColor;
        let color=new ColorClass(genRandom.randomFloat(0.1,0.2),genRandom.randomFloat(0.1,0.2),1.0);
        
            // background
            
        this.drawRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,color);
        
            // water lines
            
        lineCount=genRandom.randomInt(5,5);
        
        for (n=0;n!==lineCount;n++) {
            ovalColor=this.darkenColor(color,genRandom.randomFloat(0.93,0.05));
            
            x=genRandom.randomInt(0,this.bitmapCanvas.width);
            y=genRandom.randomInt(0,this.bitmapCanvas.height);
            xAdd=25-genRandom.randomInt(25,25);
            yAdd=25-genRandom.randomInt(25,25);
            
            ovalCount=genRandom.randomInt(5,10);
            
            for (k=0;k!==ovalCount;k++) {
                ovalWid=genRandom.randomInt(50,100);
                ovalHigh=genRandom.randomInt(50,100);

                this.drawWrappedOval(x,y,(x+ovalWid),(y+ovalHigh),this.bitmapCanvas.width,this.bitmapCanvas.height,ovalColor,null);
                
                x+=xAdd;
                if (x<0) x+=this.bitmapCanvas.width;
                if (x>=this.bitmapCanvas.width) x-=this.bitmapCanvas.width;
                
                y+=yAdd;
                if (y<0) y+=this.bitmapCanvas.height;
                if (y>=this.bitmapCanvas.height) y-=this.bitmapCanvas.height;
            }
        }
        
        this.blur(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,5,false);
        
            // noise and blur
        
        this.addNoiseRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,0.8,0.9,0.9);
        this.blur(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,10,false);
        
        this.createSpecularMap(0.5);
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        this.shineFactor=1.0;
        this.alpha=genRandom.randomFloat(0.8,0.2);

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generateLiquid();
                this.shineFactor=8.0;
                break;

        }
    }

}
