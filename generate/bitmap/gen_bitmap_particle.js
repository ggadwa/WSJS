"use strict";

//
// generate particle bitmap class
//

class GenBitmapParticleClass extends GenBitmapClass
{
    constructor(genRandom)
    {    
        super(genRandom);
        
        this.TYPE_OVAL=0;

        this.TYPE_NAMES=
                [
                    'Oval'
                ];
        
        Object.seal(this);
    }
        
        //
        // generate mainline
        //

    generate(generateType,inDebug)
    {
        var wid,high;
        var bitmapCanvas,bitmapCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=GEN_BITMAP_PARTICLE_TEXTURE_SIZE;
        bitmapCanvas.height=GEN_BITMAP_PARTICLE_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // no types yet
            
        this.drawRect(bitmapCTX,0,0,wid,high,new wsColor(0.0,0.0,0.0));
        this.drawOval(bitmapCTX,0,0,wid,high,new wsColor(1.0,1.0,1.0),null);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:null,specular:null});
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(bitmapCanvas,null,null,[(1.0/4000.0),(1.0/4000.0)],1.0));    
    }
    
    generateRandom(inDebug)
    {
        return(this.generate(this.genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}
