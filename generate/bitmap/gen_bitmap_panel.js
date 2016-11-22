/* global GEN_BITMAP_MAP_TEXTURE_SIZE, genRandom */

"use strict";

//
// generate panel bitmap class
//

class GenBitmapPanelClass extends GenBitmapClass
{
    constructor()
    {
        super();
        
            // types
            
        this.TYPE_PANEL=0;

        this.TYPE_NAMES=
                [
                    'Panel'
                ];
        
        Object.seal(this);
    }
    
        //
        // machine
        //
    
    generatePanelButtons(bitmapCTX,normalCTX,lft,top,rgt,bot)
    {
        let x,y,xCount,yCount,xOff,yOff,dx,dy,wid;
        let color;
                
            // circle or square lights
        
        wid=genRandom.randomInt(30,25);
        
        xCount=Math.trunc((rgt-lft)/wid)-1;
        yCount=Math.trunc((bot-top)/wid)-1;
        
        if ((xCount<=0) || (yCount<=0)) return;
        if (xCount>10) xCount=10;
        if (yCount>10) yCount=10;
        
        xOff=(lft+2)+Math.trunc(((rgt-lft)-(xCount*wid))/2);
        yOff=(top+2)+Math.trunc(((bot-top)-(yCount*wid))/2);
        
        for (y=0;y!==yCount;y++) {
            dy=yOff+(y*wid);
            
            for (x=0;x!==xCount;x++) {
                dx=xOff+(x*wid);
                color=this.getRandomColor();
                this.draw3DRect(bitmapCTX,normalCTX,dx,dy,(dx+wid),(dy+wid),2,color,false);
            }
        }
    }
    
    generatePanel(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let metalColor=this.getDefaultPrimaryColor();
       
            // face plate
            
        this.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,8,metalColor,true);
        this.generatePanelButtons(bitmapCTX,normalCTX,5,5,(wid-5),(high-5));
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);
    }

        //
        // generate mainline
        //

    generate(generateType,inDebug)
    {
        let wid,high;
        let shineFactor=1.0;
        let bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX;

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

            case this.TYPE_PANEL:
                this.generatePanel(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=1.0;
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
        return(this.generate(genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}
