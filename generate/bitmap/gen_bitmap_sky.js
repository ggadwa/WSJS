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
    
    generateCloud(bitmapCTX,lft,top,rgt,bot,cloudColor)
    {
        let n,x,y,xsz,ysz;
        let wid=rgt-lft;
        let high=bot-top;
        let quarterWid=Math.trunc(wid*0.25);
        let quarterHigh=Math.trunc(high*0.25);
        
        for (n=0;n!==20;n++) {
            xsz=genRandom.randomInt(quarterWid,quarterWid);
            ysz=genRandom.randomInt(quarterHigh,quarterHigh);
            
            x=genRandom.randomInt(lft,(wid-xsz));
            y=genRandom.randomInt(top,(high-ysz));
            
            this.drawOval(bitmapCTX,x,y,(x+xsz),(y+ysz),cloudColor,null);
        }
    }

    generateSkyClouds(bitmapCTX,wid,high)
    {
        let n,nCloud;
        let x,y,xsz,ysz;
        
        let mx=Math.trunc(wid*0.5);
        let my=Math.trunc(high*0.5);
        let cloudWid=Math.trunc(mx*0.25);
        let cloudHigh=Math.trunc(my*0.25);
        
        let cloudColor=new wsColor(1,1,1);
        
            // top
            // color the whole thing in first
            // so the cloud blur doesn't produce lines
            
        this.drawRect(bitmapCTX,0,0,wid,high,new wsColor(0.1,0.95,1.0));
        
        nCloud=genRandom.randomInt(5,10);
        
        for (n=0;n!==nCloud;n++) {
            xsz=genRandom.randomInt(cloudWid,cloudWid);
            ysz=genRandom.randomInt(cloudHigh,cloudHigh);
            
            x=genRandom.randomInt(0,(mx-xsz));
            y=genRandom.randomInt(0,(my-ysz));
            
            this.generateCloud(bitmapCTX,x,y,(x+xsz),(y+ysz),cloudColor);
        }
        
        this.blur(bitmapCTX,0,0,wid,high,5);
        
            // bottom
            
        this.drawRect(bitmapCTX,mx,0,wid,my,new wsColor(0.0,0.2,1.0));
        
            // side
            
        this.drawVerticalGradient(bitmapCTX,0,my,mx,high,new wsColor(0.1,0.95,1.0),new wsColor(0.0,0.2,1.0));
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
