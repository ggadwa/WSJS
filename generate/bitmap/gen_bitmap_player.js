import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate skin bitmap class
//

export default class GenBitmapPlayerClass extends GenBitmapBaseClass
{
    constructor(view)
    {    
        super(view);
        Object.seal(this);
    }
        
        //
        // suit
        //
                
    generateSuit(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high)
    {
        let mx=Math.trunc(wid*0.5);
        let my=Math.trunc(high*0.5);
         
            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,this.whiteColor);       
        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // fur
            
        this.drawUVTest(bitmapCTX,0,0,mx,my);
        this.drawUVTest(bitmapCTX,mx,0,wid,my);
        this.generateFaceChunk(bitmapCTX,normalCTX,glowCTX,mx,0,wid,my);
        this.drawUVTest(bitmapCTX,0,my,mx,high);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.3);
    }

        //
        // generate mainline
        //

    generate(inDebug)
    {
        let wid,high;
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
        glowCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        glowCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,this.BITMAP_MODEL_TEXTURE_SIZE,this.BITMAP_MODEL_TEXTURE_SIZE);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;
        
        this.generateSuit(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],0.5));    
    }

}
