import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate ground bitmap class
//

export default class GenBitmapGroundClass extends GenBitmapBaseClass
{
    constructor(view)
    {    
        super(view);
        Object.seal(this);
    }
        
        //
        // fur
        //
        
    generateGrass(bitmapCTX,normalCTX,wid,high)
    {
        let n,x,y;
        let darken,lineColor;
        let halfHigh=Math.trunc(high*0.5);
        let grassColor=this.getRandomGrassColor();
        
        this.drawRect(bitmapCTX,0,0,wid,high,grassColor);

            // hair
            
        for (x=0;x!==wid;x++) {
            
                // grass color
                
            darken=0.5+(genRandom.random()*0.3);
            lineColor=this.darkenColor(grassColor,darken);
            
                // hair half from top
                
            y=halfHigh+genRandom.randomInt(0,halfHigh);
            this.drawRandomLine(bitmapCTX,normalCTX,x,0,x,(y+5),0,0,wid,high,10,lineColor,false);
            
                // hair half from bottom
                
            y=high-(halfHigh+genRandom.randomInt(0,halfHigh));
            this.drawRandomLine(bitmapCTX,normalCTX,x,(y-5),x,high,0,0,wid,high,10,lineColor,false);
        }
    }
    
        //
        // generate mainline
        //

    generate(inDebug)
    {
        let wid,high,mx,my;
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
        glowCanvas.width=2;
        glowCanvas.height=2;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,2,2);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;
        
        mx=Math.trunc(wid*0.5);
        my=Math.trunc(high*0.5);
         
            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,this.whiteColor);
        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // create the bitmap

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generateGrass(bitmapCTX,normalCTX,wid,high);
                break;

        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],0.5));    
    }

}
