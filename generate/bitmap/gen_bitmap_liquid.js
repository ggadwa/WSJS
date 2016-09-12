"use strict";

//
// generate liquid bitmap class
//

class GenBitmapLiquidClass extends GenBitmapClass
{
    constructor(genRandom)
    {
        super(genRandom);
        
        this.TYPE_WATER=0;
        
        this.TYPE_NAMES=
                [
                    'Water'
                ];
        
        Object.seal(this);
    }
        
        //
        // liquid
        //
        
    generateLiquid(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var color=this.getRandomColor();
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
        this.drawRect(bitmapCTX,0,0,wid,high,color);
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.7,0.8,0.9);
        this.blur(bitmapCTX,0,0,wid,high,10);
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.8,0.9,0.9);
        this.blur(bitmapCTX,0,0,wid,high,5);
        
        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    }

        //
        // generate mainline
        //

    generate(generateType,inDebug)
    {
        var wid,high,edgeSize,paddingSize,segments;
        var shineFactor=1.0;
        var bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=GEN_BITMAP_MAP_TEXTURE_SIZE;
        bitmapCanvas.height=GEN_BITMAP_MAP_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        normalCanvas=document.createElement('canvas');
        normalCanvas.width=GEN_BITMAP_MAP_TEXTURE_SIZE;
        normalCanvas.height=GEN_BITMAP_MAP_TEXTURE_SIZE;
        normalCTX=normalCanvas.getContext('2d');

        specularCanvas=document.createElement('canvas');
        specularCanvas.width=GEN_BITMAP_MAP_TEXTURE_SIZE;
        specularCanvas.height=GEN_BITMAP_MAP_TEXTURE_SIZE;
        specularCTX=specularCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case this.TYPE_WATER:
                this.generateLiquid(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=8.0;
                break;

        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas});
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(bitmapCanvas,normalCanvas,specularCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }
    
    generateRandom(inDebug)
    {
        return(this.generate(this.genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}
