import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate glass bitmap class
//

export default class GenBitmapGlassClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view);
        Object.seal(this);
    }
            
        //
        // glass bitmaps
        //
    
    generateGlass(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,nLine,color;
        let x,y,x2,y2,startWid,sizeWid;
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // default glass to white
            
        this.drawRect(bitmapCTX,0,0,wid,high,this.whiteColor);
        
            // back noise and blur
            
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.9,0.95,0.7);
        this.blur(bitmapCTX,0,0,wid,high,10,false);
        
            // reflection lines
            
        nLine=genRandom.randomInt(5,20);
        
        startWid=Math.trunc(wid*0.4);
        sizeWid=Math.trunc(wid*0.6);
        
        for (n=0;n!==nLine;n++) {
            color=this.getRandomGray(0.7,0.9);
            x=genRandom.randomInt(0,startWid);
            x2=genRandom.randomInt((x+1),(wid-x));
            y=high-genRandom.randomInt(0,(high-(x2-x)));
            y2=y-Math.trunc((x2-x)*0.5);
            this.drawBumpLine(bitmapCTX,normalCTX,x,y,x2,y2,1,color);
        }
        
            // front noise and blur
            
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.95,1.0,0.7);
        this.blur(bitmapCTX,0,0,wid,high,5,false);        
       
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.6);
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
                this.generateGlass(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=10.0;
                break;

        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        alpha=genRandom.randomFloat(0.3,0.5);
        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,alpha,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }

}
