"use strict";

//
// generate item bitmap class
//

class GenBitmapItemClass extends GenBitmapClass
{
    constructor(genRandom)
    {    
        super(genRandom);
        
        this.TYPE_METAL=0;

        this.TYPE_NAMES=
                [
                    'Metal'
                ];
        
        Object.seal(this);
    }
    
        //
        // metal
        //

    generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high,hasBar)
    {
        var n,x,y,offset;
        var dx,dy,sx,sy,ex,ey;
        var streakWid,streakColor,darken;
        var idx,line,lineStyle;
        var lines=[];

            // some random values

        var metalColor=this.getRandomColor();
        var borderColor=new wsColor(0.0,0.0,0.0);

        var edgeSize=this.genRandom.randomInt(4,8);
        var innerEdgeSize=this.genRandom.randomInt(4,10)+edgeSize;
        
        var screwSize=this.genRandom.randomInt(10,20);
        var screenFlatInnerSize=Math.trunc(screwSize*0.4);
        
        var streakCount=this.genRandom.randomInt(15,10);
        var screwColor=this.boostColor(metalColor,0.05);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // the plate
            
        this.drawRect(bitmapCTX,0,0,wid,high,metalColor);
        
            // possible streaks
        
        if (this.genRandom.randomPercentage(0.5)) {
            for (n=0;n!==streakCount;n++) {
                streakWid=this.genRandom.randomInt(10,40);
                x=this.genRandom.randomInBetween(streakWid,(wid-streakWid));

                darken=0.5+(this.genRandom.random()*0.5);
                streakColor=this.darkenColor(metalColor,darken);

                this.drawStreakMetal(bitmapCTX,wid,high,x,0,high,streakWid,streakColor);
            }
        }
        
            // possible screws
            
        if (this.genRandom.randomPercentage(0.5)) {
            offset=edgeSize+4;
            
            this.draw3DOval(bitmapCTX,normalCTX,offset,offset,(offset+screwSize),(offset+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,borderColor);
            this.draw3DOval(bitmapCTX,normalCTX,offset,((high-offset)-screwSize),(offset+screwSize),(high-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,borderColor);
            this.draw3DOval(bitmapCTX,normalCTX,((wid-offset)-screwSize),offset,(wid-offset),(offset+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,borderColor);
            this.draw3DOval(bitmapCTX,normalCTX,((wid-offset)-screwSize),((high-offset)-screwSize),(wid-offset),(high-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,borderColor);
            
            innerEdgeSize+=screwSize;
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.6);
    }
    
        //
        // generate mainline
        //

    generate(generateType,inDebug)
    {
        var wid,high;
        var shineFactor=1.0;
        var bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        bitmapCanvas.height=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        normalCanvas=document.createElement('canvas');
        normalCanvas.width=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        normalCanvas.height=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        normalCTX=normalCanvas.getContext('2d');

        specularCanvas=document.createElement('canvas');
        specularCanvas.width=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        specularCanvas.height=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        specularCTX=specularCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case this.TYPE_METAL:
                this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high);
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
