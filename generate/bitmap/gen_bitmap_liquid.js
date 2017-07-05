/* global genRandom */

"use strict";

//
// generate liquid bitmap class
//

class GenBitmapLiquidClass extends GenBitmapClass
{
    constructor()
    {
        super();
        
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
    
    drawOvalGradient(bitmapCTX,lft,top,rgt,bot,startColor,endColor)
    {
        let col=new wsColor(startColor.r,startColor.g,startColor.b);
        let count,rAdd,gAdd,bAdd;
        
        let wid=rgt-lft;
        let high=bot-top;
        
            // find color changes
            
        count=(wid>high)?Math.trunc(wid*0.5):Math.trunc(high*0.5);
        rAdd=(endColor.r-startColor.r)/count;
        gAdd=(endColor.g-startColor.g)/count;
        bAdd=(endColor.b-startColor.b)/count;

            // ovals
            
        while (true) {
            this.drawOval(bitmapCTX,lft,top,rgt,bot,col,null);
            lft++;
            rgt--;
            if (lft>=rgt) break;
            top++;
            bot--;
            if (top>=bot) break;

            col.addFromValues(rAdd,gAdd,bAdd);
        }
    }

    generateLiquid(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,x,y,ovalWid,ovalHigh,startColor,endColor;
        let color=this.getDefaultPrimaryColor();
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // main color
            
        this.drawRect(bitmapCTX,0,0,wid,high,color);
        
            // gradient ovals
            
        startColor=this.darkenColor(color,0.98);
        endColor=this.lightenColor(color,0.1);
            
        for (n=0;n!==20;n++) {
            ovalWid=genRandom.randomInt(50,100);
            ovalHigh=genRandom.randomInt(50,100);
            
            x=genRandom.randomInt(0,(wid-ovalWid));
            y=genRandom.randomInt(0,(high-ovalHigh));
            
            this.drawOvalGradient(bitmapCTX,x,y,(x+ovalWid),(y+ovalHigh),startColor,endColor);
        }
        
            // noise and blurs
            
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.7,0.8,0.9);
        this.blur(bitmapCTX,0,0,wid,high,10,false);
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.8,0.9,0.9);
        this.blur(bitmapCTX,0,0,wid,high,5,false);
        
        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    }

        //
        // generate mainline
        //

    generate(generateType,inDebug)
    {
        let wid,high;
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

        switch (generateType) {

            case this.TYPE_WATER:
                this.generateLiquid(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=8.0;
                break;

        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }
    
    generateRandom(inDebug)
    {
        return(this.generate(genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}
