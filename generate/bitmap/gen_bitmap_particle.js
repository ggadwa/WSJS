/* global genRandom */

"use strict";

//
// generate particle bitmap class
//

class GenBitmapParticleClass extends GenBitmapClass
{
    constructor()
    {    
        super();
        
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
        let wid,high;
        let bitmapCanvas,bitmapCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=this.BITMAP_PARTICLE_TEXTURE_SIZE;
        bitmapCanvas.height=this.BITMAP_PARTICLE_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // no types yet
            
        this.drawRect(bitmapCTX,0,0,wid,high,this.blackColor);
        this.drawOval(bitmapCTX,0,0,wid,high,this.whiteColor,null);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:null,specular:null});
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(bitmapCanvas,null,null,[(1.0/4000.0),(1.0/4000.0)],1.0));    
    }
    
    generateRandom(inDebug)
    {
        return(this.generate(genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}
