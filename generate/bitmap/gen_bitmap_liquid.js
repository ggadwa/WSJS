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
        super(view);
        Object.seal(this);
    }
        
        //
        // liquid
        //
    
    generateLiquid(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,x,y,x2,y2,ovalWid,ovalHigh,ovalColor;
        let color=this.getDefaultPrimaryColor();
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // background
            
        this.drawRect(bitmapCTX,0,0,wid,high,color);
        
            // gradient ovals
            
        for (n=0;n!==20;n++) {
            ovalWid=genRandom.randomInt(50,100);
            ovalHigh=genRandom.randomInt(50,100);
            
            x=genRandom.randomInt(0,(wid-ovalWid));
            y=genRandom.randomInt(0,(high-ovalHigh));
            
            ovalColor=this.darkenColor(color,genRandom.randomFloat(0.95,0.04));
            
                // draw the oval and any wrapped ovals
                
            this.drawOval(bitmapCTX,x,y,(x+ovalWid),(y+ovalHigh),ovalColor,null);
            if ((x+ovalWid)>wid) {
                x2=-((x+ovalWid)-wid);
                this.drawOval(bitmapCTX,x2,y,(x2+ovalWid),(y+ovalHigh),ovalColor,null);
            }
            if ((y+ovalHigh)>high) {
                y2=-((y+ovalHigh)-high);
                this.drawOval(bitmapCTX,x,y2,(x+ovalWid),(y2+ovalHigh),ovalColor,null);
            }
        }
        
        this.blur(bitmapCTX,0,0,wid,high,5,false);
        
            // noise and blurs
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.8,0.9,0.9);
        this.blur(bitmapCTX,0,0,wid,high,5,false);
            
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.8,0.9,0.9);
        this.blur(bitmapCTX,0,0,wid,high,5,false);
        
        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    }

        //
        // generate mainline
        //

    generate(inDebug)
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
