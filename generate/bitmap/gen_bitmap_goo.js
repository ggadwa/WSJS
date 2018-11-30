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
    
    drawOvalGradient(bitmapCTX,lft,top,rgt,bot,startColor,endColor)
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
            this.drawOval(bitmapCTX,lft,top,rgt,bot,col,null);
            lft++;
            rgt--;
            if (lft>=rgt) break;
            top++;
            bot--;
            if (top>=bot) break;

            col.addFromValues(rAdd,gAdd,bAdd);
        }
    }

    generateGoo(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high)
    {
        let n,x,y,x2,y2,radius,startColor,endColor;
        let color=this.getRandomColor();
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // gradient colors
            
        startColor=this.darkenColor(color,0.98);
        endColor=this.lightenColor(color,0.7);
        
            // main color
            
        this.drawRect(bitmapCTX,0,0,wid,high,startColor);
        
            // gradient ovals
            
        for (n=0;n!==80;n++) {
            radius=genRandom.randomInt(50,200);
            
            x=genRandom.randomInt(0,wid);
            y=genRandom.randomInt(0,high);
            
                // the oval itself and any wrap around clips

            this.drawOvalGradient(bitmapCTX,x,y,(x+radius),(y+radius),startColor,endColor);
            if ((x+radius)>wid) {
                x2=-((x+radius)-wid);
                this.drawOvalGradient(bitmapCTX,x2,y,(x2+radius),(y+radius),startColor,endColor);
            }
            if ((y+radius)>high) {
                y2=-((y+radius)-high);
                this.drawOvalGradient(bitmapCTX,x,y2,(x+radius),(y2+radius),startColor,endColor);
            }
        }
        
            // noise and blurs
            
        this.blur(bitmapCTX,0,0,wid,high,15,false);
        
            // create the glow from a clamped bitmap
            
        this.createGlowMap(bitmapCTX,glowCTX,wid,high,0.5);

            // create specular
            
        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    }

        //
        // generate mainline
        //

    generateInternal(inDebug)
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
        glowCanvas.width=this.BITMAP_MAP_TEXTURE_SIZE;
        glowCanvas.height=this.BITMAP_MAP_TEXTURE_SIZE;
        glowCTX=glowCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generateGoo(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high);
                shineFactor=8.0;
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
