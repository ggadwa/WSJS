"use strict";

//
// generate sky bitmap class
//

class GenBitmapSkyClass extends GenBitmapClass
{
    constructor(genRandom)
    {    
        super(genRandom);
        
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

    generateSkyClouds(bitmapCTX,wid,high)
    {
        var n,nCloud;
        var x,y,xsz,ysz;
        
        var mx=Math.trunc(wid*0.5);
        var my=Math.trunc(high*0.5);
        var cloudWid=Math.trunc(mx*0.25);
        var cloudHigh=Math.trunc(my*0.25);
        
        var cloudColor=new wsColor(1,1,1);
        
            // top
            // color the whole thing in first
            // so the cloud blur doesn't produce lines
            
        this.drawRect(bitmapCTX,0,0,wid,high,new wsColor(0.1,0.95,1.0));
        
        nCloud=this.genRandom.randomInt(5,10);
        
        for (n=0;n!==nCloud;n++) {
            xsz=this.genRandom.randomInt(cloudWid,cloudWid);
            ysz=this.genRandom.randomInt(cloudHigh,cloudHigh);
            
            x=this.genRandom.randomInt(0,(mx-xsz));
            y=this.genRandom.randomInt(0,(my-ysz));
            
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
        return(this.generate(this.genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}
