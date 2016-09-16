"use strict";

//
// generate item bitmap class
//

class GenBitmapItemClass extends GenBitmapClass
{
    constructor()
    {    
        super();
        
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

    generateMetalWires(bitmapCTX,normalCTX,wid,high,grid,color)
    {
        var n,k,x,y,split;
        var lineCount=genRandom.randomInt(1,5);
        
        var lineWidth=Math.trunc(wid*0.05);
        if (lineWidth<5) lineWidth=5;
        
        for (n=0;n!==lineCount;n++) {
            
            if (genRandom.randomPercentage(0.5)) {
                x=genRandom.randomInt(lineWidth,(wid-(lineWidth*2)));
                this.drawBumpLine(bitmapCTX,normalCTX,x,0,x,high,lineWidth,color);
                
                split=Math.trunc(wid/16);
                x=Math.trunc(x/split);
                for (k=0;k!==16;k++) {
                    grid[(k*16)+x]=1;
                }
            }
            else {
                y=genRandom.randomInt(lineWidth,(high-(lineWidth*2)));
                this.drawBumpLine(bitmapCTX,normalCTX,0,y,wid,y,lineWidth,color);
                
                split=Math.trunc(high/16);
                y=Math.trunc(y/split);
                for (k=0;k!==16;k++) {
                    grid[(y*16)+k]=1;
                }
            }
            
        }
    }
    
    generateMetalButtons(bitmapCTX,normalCTX,wid,high,grid)
    {
        var n,k,x,y,color;
        var buttonWid=Math.trunc(wid/16);
        var buttonHigh=Math.trunc(high/16);
        var buttonCount=genRandom.randomInt(3,5);
        
        for (n=0;n!==buttonCount;n++) {
            
            for (k=0;k!==10;k++) {
                x=genRandom.randomInt(0,15);
                y=genRandom.randomInt(0,15);
                
                if (grid[(y*16)+x]!==0) continue;
                grid[(y*16)+x]=1;
                
                color=this.getRandomColor();
                
                x*=buttonWid;
                y*=buttonHigh;
                this.draw3DRect(bitmapCTX,normalCTX,x,y,(x+buttonWid),(y+buttonHigh),2,color,false);
                break;
            }
        }
    }
    
    generateMetalScrews(bitmapCTX,normalCTX,wid,high,grid,color)
    {
        var n,k,x,y,color;
        var screwWid=Math.trunc(wid/16);
        var screwHigh=Math.trunc(high/16);
        var screwCount=genRandom.randomInt(2,5);
        
        var screwColor=this.boostColor(color,0.05);
        var borderColor=new wsColor(0,0,0);
        var screwFlatInnerSize=Math.trunc(screwWid*0.4);
        
        for (n=0;n!==screwCount;n++) {
            
            for (k=0;k!==10;k++) {
                x=genRandom.randomInt(0,15);
                y=genRandom.randomInt(0,15);
                
                if (grid[(y*16)+x]!==0) continue;
                grid[(y*16)+x]=1;
                
                color=this.getRandomColor();
                
                x*=screwWid;
                y*=screwHigh;
                this.draw3DOval(bitmapCTX,normalCTX,x,y,(x+screwWid),(y+screwHigh),0.0,1.0,2,screwFlatInnerSize,screwColor,borderColor);
                break;
            }
        }
    }
    
    generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,x,y,offset;
        var dx,dy,sx,sy,ex,ey;
        var streakWid,streakColor,darken;
        var idx,line,lineStyle;
        var lines=[];
        
            // a grid to place items
            
        var grid=new Uint8Array(16*16);

            // some random values

        var metalColor=this.getDefaultPrimaryColor();
        var wireColor=this.getRandomColor();

        var edgeSize=genRandom.randomInt(4,8);
        
        var streakCount=genRandom.randomInt(15,10);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // the plate
            
        this.drawRect(bitmapCTX,0,0,wid,high,metalColor);
        
            // possible streaks
        
        if (genRandom.randomPercentage(0.5)) {
            for (n=0;n!==streakCount;n++) {
                streakWid=genRandom.randomInt(10,40);
                x=genRandom.randomInBetween(streakWid,(wid-streakWid));

                darken=0.5+(genRandom.random()*0.5);
                streakColor=this.darkenColor(metalColor,darken);

                this.drawStreakMetal(bitmapCTX,wid,high,x,0,high,streakWid,streakColor);
            }
        }
        
            // wires and buttons
            
        this.generateMetalWires(bitmapCTX,normalCTX,wid,high,grid,wireColor);
        this.generateMetalButtons(bitmapCTX,normalCTX,wid,high,grid);
        this.generateMetalScrews(bitmapCTX,normalCTX,wid,high,grid,metalColor);

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
        return(this.generate(genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}
