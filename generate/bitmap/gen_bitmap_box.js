"use strict";

//
// generate box bitmap class
//

class GenBitmapBoxClass extends GenBitmapClass
{
    constructor()
    {
        super();
        
            // types
            
        this.TYPE_METAL=0;
        this.TYPE_WOOD=1;

        this.TYPE_NAMES=
                [
                    'Metal','Wood'
                ];
        
        Object.seal(this);
    }
            
        //
        // metal bitmaps
        //
    
    generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,x,y,offset;
        var dx,dy,sx,sy,ex,ey;
        var streakWid,streakColor,darken;
        var idx,line,lineStyle;
        var lines=[];

            // some random values

        var metalColor=this.getDefaultPrimaryColor();
        var borderColor=new wsColor(0.0,0.0,0.0);

        var edgeSize=genRandom.randomInt(4,8);
        var innerEdgeSize=genRandom.randomInt(4,10)+edgeSize;
        
        var screwSize=genRandom.randomInt(10,20);
        var screenFlatInnerSize=Math.trunc(screwSize*0.4);
        
        var streakCount=genRandom.randomInt(15,10);
        var screwColor=this.boostColor(metalColor,0.05);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // the plate
            
        this.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,edgeSize,metalColor,true);
        
            // possible streaks
        
        if (genRandom.randomPercentage(0.5)) {
            for (n=0;n!==streakCount;n++) {
                streakWid=genRandom.randomInt(10,40);
                x=edgeSize+genRandom.randomInBetween(streakWid,((wid-streakWid)-(edgeSize*2)));

                darken=0.5+(genRandom.random()*0.5);
                streakColor=this.darkenColor(metalColor,darken);

                this.drawStreakMetal(bitmapCTX,wid,high,x,edgeSize,(high-edgeSize),streakWid,streakColor);
            }
        }
        
            // possible screws
            
        if (genRandom.randomPercentage(0.5)) {
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
        // wood bitmaps
        //

    generateWoodDrawBoard(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,woodColor)
    {
        var woodFactor=0.8+(genRandom.random()*0.2);
        var col=this.darkenColor(woodColor,woodFactor);

        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,col,true);
        this.drawColorStripeVertical(bitmapCTX,normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        this.addNoiseRect(bitmapCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.9,0.95,0.8);
    }
    
    generateWood(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,k,lft,rgt,top,bot;
        var halfSize,boardSplit,boardHigh,woodFactor;
        
            // some random values

        var boardCount=genRandom.randomInt(4,8);
        var boardSize=Math.trunc(wid/boardCount);
        var edgeSize=genRandom.randomInt(3,3);
        var woodColor=this.getDefaultPrimaryColor();

            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // regular wood planking

        lft=0;

        for (n=0;n!==boardCount;n++) {
            rgt=lft+boardSize;
            if (n===(boardCount-1)) rgt=wid;
            
            boardSplit=genRandom.randomInt(1,3);
            boardHigh=Math.trunc(high/boardSplit);
            
            this.generateWoodDrawBoard(bitmapCTX,normalCTX,lft,0,rgt,high,edgeSize,woodColor);
            
            lft=rgt;
        }
        
            // border
        
        top=0;
        bot=high;
        
        if (genRandom.randomPercentage(0.5)) {
            top+=boardSize;
            bot-=boardSize;
            
            this.generateWoodDrawBoard(bitmapCTX,normalCTX,0,0,wid,boardSize,edgeSize,woodColor);
            this.generateWoodDrawBoard(bitmapCTX,normalCTX,0,(high-boardSize),wid,high,edgeSize,woodColor);
        }
        
        if (genRandom.randomPercentage(0.5)) {
            this.generateWoodDrawBoard(bitmapCTX,normalCTX,0,top,boardSize,bot,edgeSize,woodColor);
            this.generateWoodDrawBoard(bitmapCTX,normalCTX,(wid-boardSize),top,wid,bot,edgeSize,woodColor);
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.2);
    }
            
        //
        // generate mainline
        //

    generate(generateType,inDebug)
    {
        var wid,high,segments;
        var shineFactor=1.0;
        var bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX;

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

            case this.TYPE_METAL:
                this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=15.0;
                break;
                
            case this.TYPE_WOOD:
                this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=2.0;
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
