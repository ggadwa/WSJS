"use strict";

//
// generate sky bitmap class
//

class GenBitmapSkyClass extends GenBitmapClass
{
    constructor(genRandom)
    {    
        super(genRandom);
        
        Object.seal(this);
    }
        
        //
        // sky
        //
    
    generateCloud(bitmapCTX,lft,top,rgt,bot,cloudColor)
    {
        var n,x,y,xsz,ysz;
        var wid=rgt-lft;
        var high=bot-top;
        var quarterWid=Math.trunc(wid*0.25);
        var quarterHigh=Math.trunc(high*0.25);
        
        for (n=0;n!==20;n++) {
            xsz=this.genRandom.randomInt(quarterWid,quarterWid);
            ysz=this.genRandom.randomInt(quarterHigh,quarterHigh);
            
            x=this.genRandom.randomInt(lft,(wid-xsz));
            y=this.genRandom.randomInt(top,(high-ysz));
            
            this.drawOval(bitmapCTX,x,y,(x+xsz),(y+ysz),cloudColor,null);
        }
    }
    
    generateSkyTop(bitmapCTX,wid,high)
    {
        var n,nCloud;
        var x,y,xsz,ysz;
        var quarterWid=Math.trunc(wid*0.25);
        var quarterHigh=Math.trunc(high*0.25);
        
        var cloudColor=new wsColor(1,1,1);
        
        this.drawRect(bitmapCTX,0,0,wid,high,new wsColor(0.1,0.95,1.0));
        
        nCloud=this.genRandom.randomInt(5,10);
        
        for (n=0;n!==nCloud;n++) {
            xsz=this.genRandom.randomInt(quarterWid,quarterWid);
            ysz=this.genRandom.randomInt(quarterHigh,quarterHigh);
            
            x=this.genRandom.randomInt(0,(wid-xsz));
            y=this.genRandom.randomInt(0,(high-ysz));
            
            this.generateCloud(bitmapCTX,x,y,(x+xsz),(y+ysz),cloudColor);
        }
        
        this.blur(bitmapCTX,0,0,wid,high,5);
    }

    generateSkyBottom(bitmapCTX,wid,high)
    {
        this.drawRect(bitmapCTX,0,0,wid,high,new wsColor(0.0,0.2,1.0));
    }

    generateSkySide(bitmapCTX,wid,high)
    {
        this.drawVerticalGradient(bitmapCTX,0,0,wid,high,new wsColor(0.1,0.95,1.0),new wsColor(0.0,0.2,1.0));
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
