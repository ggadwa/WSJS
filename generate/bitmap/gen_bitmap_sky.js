"use strict";

//
// generate sky bitmap class
//

class GenBitmapSkyClass
{
    constructor(genRandom)
    {    
        this.genRandom=genRandom;
        this.genBitmapUtility=new GenBitmapUtilityClass(genRandom);
        
        Object.seal(this);
    }
        
        //
        // sky
        //
        
    generateSkyTop(bitmapCTX,wid,high)
    {
        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,new wsColor(0.1,0.95,1.0));
    }

    generateSkyBottom(bitmapCTX,wid,high)
    {
        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,new wsColor(0.0,0.2,1.0));
    }

    generateSkySide(bitmapCTX,wid,high)
    {
        this.genBitmapUtility.drawVerticalGradient(bitmapCTX,0,0,wid,high,new wsColor(0.1,0.95,1.0),new wsColor(0.0,0.2,1.0));
    }

        //
        // generate mainline
        //

    generate(name,generateType,inDebug)
    {
        var wid,high;
        var bitmapCanvas,bitmapCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=GEN_BITMAP_SKY_TEXTURE_SIZE;
        bitmapCanvas.height=GEN_BITMAP_SKY_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case GEN_BITMAP_SKY_TYPE_TOP:
                this.generateSkyTop(bitmapCTX,wid,high);
                break;
                
            case GEN_BITMAP_SKY_TYPE_BOTTOM:
                this.generateSkyBottom(bitmapCTX,wid,high);
                break;
                
            case GEN_BITMAP_SKY_TYPE_SIDE:
                this.generateSkySide(bitmapCTX,wid,high);
                break;

        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:null,specular:null});
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(name,bitmapCanvas,null,null,[(1.0/4000.0),(1.0/4000.0)],1.0));    
    }

}
