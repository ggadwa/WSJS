import ColorClass from '../../code/utility/color.js';
import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate liquid bitmap class
//

export default class GenBitmapGooClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,true);
        Object.seal(this);
    }
        
        //
        // liquid
        //
    
    drawOvalGradient(lft,top,rgt,bot,startColor,endColor)
    {
        let col=new ColorClass(startColor.r,startColor.g,startColor.b);
        let count,rAdd,gAdd,bAdd;
        
        let wid=rgt-lft;
        let high=bot-top;
        
            // find color changes
            
        count=(wid>high)?Math.trunc(wid*0.5):Math.trunc(high*0.5);
        rAdd=(endColor.r-startColor.r)/count;
        gAdd=(endColor.g-startColor.g)/count;
        bAdd=(endColor.b-startColor.b)/count;

            // ovals
            
        while (true) {
            this.drawOval(lft,top,rgt,bot,col,null);
            lft++;
            rgt--;
            if (lft>=rgt) break;
            top++;
            bot--;
            if (top>=bot) break;

            col.addFromValues(rAdd,gAdd,bAdd);
        }
    }

    generateGoo(wid,high)
    {
        let n,x,y,x2,y2,radius,startColor,endColor;
        let color=this.getRandomColor();
        
        this.clearNormalsRect(0,0,wid,high);
        
            // gradient colors
            
        startColor=this.darkenColor(color,0.98);
        endColor=this.lightenColor(color,0.7);
        
            // main color
            
        this.drawRect(0,0,wid,high,startColor);
        
            // gradient ovals
            
        for (n=0;n!==80;n++) {
            radius=genRandom.randomInt(50,200);
            
            x=genRandom.randomInt(0,wid);
            y=genRandom.randomInt(0,high);
            
                // the oval itself and any wrap around clips

            this.drawOvalGradient(x,y,(x+radius),(y+radius),startColor,endColor);
            if ((x+radius)>wid) {
                x2=-((x+radius)-wid);
                this.drawOvalGradient(x2,y,(x2+radius),(y+radius),startColor,endColor);
            }
            if ((y+radius)>high) {
                y2=-((y+radius)-high);
                this.drawOvalGradient(x,y2,(x+radius),(y2+radius),startColor,endColor);
            }
        }
        
            // noise and blurs
            
        this.blur(0,0,wid,high,15,false);
        
            // create the glow from a clamped bitmap
            
        this.createGlowMap(wid,high,0.5);

            // create specular
            
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

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generateGoo(wid,high);
                this.shineFactor=8.0;
                break;

        }
    }

}
