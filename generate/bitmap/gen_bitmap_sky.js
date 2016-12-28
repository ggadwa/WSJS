/* global genRandom */

"use strict";

//
// generate sky bitmap class
//

class GenBitmapSkyClass extends GenBitmapClass
{
    constructor()
    {    
        super();
        
        this.TYPE_CLOUDS=0;

        this.TYPE_NAMES=
                [
                    'Clouds'
                ];
        
        Object.seal(this);
    }
        
        //
        // sky
        //
    
    generateClouds(bitmapCTX,lft,top,rgt,bot,cloudColor)
    {
        let n,x,y,xsz,ysz;
        let wid=rgt-lft;
        let high=bot-top;
        let quarterWid=Math.trunc(wid*0.25);
        let quarterHigh=Math.trunc(high*0.25);
        
            // random clouds
            
        for (n=0;n!==20;n++) {
            xsz=genRandom.randomInt(quarterWid,quarterWid);
            ysz=genRandom.randomInt(quarterHigh,quarterHigh);
            
            x=genRandom.randomInt(lft,(wid-xsz));
            y=top-Math.trunc(ysz*0.5);
            
            this.drawOval(bitmapCTX,x,y,(x+xsz),(y+ysz),cloudColor,null);
        }
        
            // side cloud to complete wrapping
            
        this.drawOval(bitmapCTX,(lft-20),(top-20),(lft+20),(top+20),cloudColor,null);
        this.drawOval(bitmapCTX,(rgt-20),(top-20),(rgt+20),(top+20),cloudColor,null);
    }
    
    generateMountains(bitmapCTX,lft,top,rgt,bot,mountainColor)
    {
        let x,y,xFix,yStart;
        
        bitmapCTX.strokeStyle=this.colorToRGBColor(mountainColor);
        
        xFix=rgt-Math.trunc((rgt-lft)*0.025);
        y=yStart=bot-Math.trunc((bot-top)*0.5);

        for (x=lft;x!==rgt;x++) {
            bitmapCTX.beginPath();
            bitmapCTX.moveTo(x,y);
            bitmapCTX.lineTo(x,bot);
            bitmapCTX.stroke();
            
            if (x<xFix) {
                y+=(genRandom.randomPercentage(0.5)?1:-1);
            }
            else {
                if (y!==yStart) y+=((y<yStart)?1:-1);
            }
        }
    }

    generateSkyClouds(bitmapCTX,wid,high)
    {
        let mx=Math.trunc(wid*0.5);
        let my=Math.trunc(high*0.5);
        
        let cloudColor=new wsColor(1,1,1);
        let mountainColor=new wsColor(0.7,0.4,0.0);
        
        this.drawRect(bitmapCTX,0,0,wid,high,cloudColor);
        
            // side
            
        this.drawVerticalGradient(bitmapCTX,0,my,mx,high,new wsColor(0.1,0.95,1.0),new wsColor(0.0,0.2,1.0));
        this.generateClouds(bitmapCTX,0,my,mx,high,cloudColor);
        this.blur(bitmapCTX,0,my,mx,high,3,true);
        
        this.generateMountains(bitmapCTX,0,my,mx,high,mountainColor);
        this.blur(bitmapCTX,0,my,mx,high,2,true);
        
            // top and bottom
            
        this.drawRect(bitmapCTX,0,0,mx,my,cloudColor);
        this.drawRect(bitmapCTX,mx,0,wid,my,mountainColor);
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
        bitmapCanvas.width=this.BITMAP_SKY_TEXTURE_SIZE;
        bitmapCanvas.height=this.BITMAP_SKY_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case this.TYPE_CLOUDS:
                this.generateSkyClouds(bitmapCTX,wid,high);
                break;
                
        }

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
