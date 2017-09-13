import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate plaster bitmap class
//

export default class GenBitmapPlasterClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view);
        Object.seal(this);
    }
    
        //
        // plaster bitmaps
        //

    generatePlaster(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,x;
        let lineColor,darken,boost;

            // some random values

        let lineColorBase=this.getRandomColor();
        let plasterColor=this.dullColor(lineColorBase,0.8);
        let lineCount=genRandom.randomInt(50,50);

            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,plasterColor);
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // lines
            
        for (n=0;n!==lineCount;n++) {
            x=genRandom.randomInt(0,wid);
            
            darken=0.85+(genRandom.random()*0.1);
            lineColor=this.darkenColor(lineColorBase,darken);
            
            this.drawRandomLine(bitmapCTX,normalCTX,x,0,x,high,0,0,wid,high,15,lineColor,false);
        }
        
        for (n=0;n!==lineCount;n++) {
            x=genRandom.randomInt(0,wid);
            
            boost=0.05+(genRandom.random()*0.1);
            lineColor=this.boostColor(lineColorBase,boost);
            
            this.drawRandomLine(bitmapCTX,normalCTX,x,0,x,high,0,0,wid,high,15,lineColor,false);
        }
        
            // plaster noise
            
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.8);
        this.blur(bitmapCTX,0,0,wid,high,5,false);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);
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

        this.generatePlaster(bitmapCTX,normalCTX,specularCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],5.0));    
    }

}
