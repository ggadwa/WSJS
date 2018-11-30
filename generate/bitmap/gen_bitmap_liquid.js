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
        
    generateLiquid(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,k,x,y,xAdd,yAdd,lineCount,ovalCount,ovalWid,ovalHigh,ovalColor;
        let color=new ColorClass(genRandom.randomFloat(0.1,0.2),genRandom.randomFloat(0.1,0.2),1.0);
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // background
            
        this.drawRect(bitmapCTX,0,0,wid,high,color);
        
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

                this.drawWrappedOval(bitmapCTX,x,y,(x+ovalWid),(y+ovalHigh),wid,high,ovalColor,null);
                
                x+=xAdd;
                if (x<0) x+=wid;
                if (x>=wid) x-=wid;
                
                y+=yAdd;
                if (y<0) y+=high;
                if (y>=high) y-=high;
            }
        }
        
        this.blur(bitmapCTX,0,0,wid,high,5,false);
        
            // noise and blur
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.8,0.9,0.9);
        this.blur(bitmapCTX,0,0,wid,high,10,false);
        
        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    }

        //
        // generate mainline
        //

    generateInternal(inDebug)
    {
        let wid,high,alpha;
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
                this.generateLiquid(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=8.0;
                break;

        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        alpha=genRandom.randomFloat(0.8,0.2);
        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,alpha,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }

}
