"use strict";

//
// generate ceiling bitmap class
//

class GenBitmapCeilingClass extends GenBitmapClass
{
    constructor()
    {
        super();
        
            // types
            
        this.TYPE_TILE=0;
        this.TYPE_METAL=1;
        this.TYPE_CEMENT=2;

        this.TYPE_NAMES=
                [
                    'Tile','Metal','Cement'
                ];
        
        Object.seal(this);
    }
        
        //
        // tile bitmaps
        //
        
    generateTile(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var x,y,lft,rgt,top,bot,tileWid,tileHigh;

        var splitCount=genRandom.randomInt(2,2);
        var edgeSize=genRandom.randomInt(2,4);
        var tileInside=genRandom.randomPercentage(0.5);
        var tileColor=this.getDefaultPrimaryColor();

            // clear canvas

        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // tiles

        tileWid=Math.trunc(wid/splitCount);
        tileHigh=Math.trunc(high/splitCount);

        top=0;
        
        for (y=0;y!==splitCount;y++) {

            bot=top+tileHigh;
            if (y===(splitCount-1)) bot=high;

            lft=0;

            for (x=0;x!==splitCount;x++) {
                
                rgt=lft+tileWid;
                if (x===(splitCount-1)) rgt=wid;
                
                this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,tileColor,tileInside);
                
                lft=rgt;
            }
            
            bot=top;
        }

            // tile noise

        this.addNoiseRect(bitmapCTX,0,0,wid,high,1.1,1.3,0.2);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
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
        // cement bitmaps
        //

    generateCement(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,nLine,markCount,x,y,y2;
        var particleWid,particleHigh,particleDensity,particleRingCount,particleDarken;
        var edgeSize,concreteColor,lineColor,line2Color;

            // some random values

        concreteColor=this.getDefaultPrimaryColor();
        lineColor=this.darkenColor(concreteColor,0.95);
        line2Color=this.boostColor(concreteColor,0.05);

            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // random edging
            
        if (genRandom.randomPercentage(0.5)) {
            edgeSize=genRandom.randomInt(5,5);
            this.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,edgeSize,concreteColor,true);
        }
        else {
            edgeSize=0;
            this.drawRect(bitmapCTX,0,0,wid,high,concreteColor);
        }
        
            // the stress lines
        
        nLine=genRandom.randomInt(100,100);
        
        for (n=0;n!==nLine;n++) {
            x=genRandom.randomInBetween((edgeSize+3),(wid-(edgeSize+3)));
            
            y=genRandom.randomInBetween((edgeSize+3),Math.trunc(high/2));
            y2=y+genRandom.randomInt(20,Math.trunc((high/2)-(edgeSize+23)));
            
            if ((n%2)===0) {
                y=high-y;
                y2=high-y2;
            }
            
            this.drawLine(bitmapCTX,normalCTX,x,y,x,y2,(((n%2)===0)?lineColor:line2Color),true);
        }
        
            // marks

        var markCount=genRandom.randomInt(5,20);
        
        for (n=0;n!==markCount;n++) {
            particleWid=genRandom.randomInt(100,100);
            particleHigh=genRandom.randomInt(100,100);
            particleDensity=genRandom.randomInt(150,250);
            particleRingCount=genRandom.randomInt(8,8);
            particleDarken=0.95-(genRandom.random()*0.15);

            x=genRandom.randomInt(edgeSize,wid);
            y=genRandom.randomInt(edgeSize,high);

            this.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),particleRingCount,particleDarken,particleDensity,false);
        }

            // noise
            
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.8);
        this.blur(bitmapCTX,0,0,wid,high,3);
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.8,0.9,0.7);
        this.blur(bitmapCTX,0,0,wid,high,3);
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,1.0,1.2,0.6);
        this.blur(bitmapCTX,0,0,wid,high,3);
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);
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

            case this.TYPE_TILE:
                this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=10.0;
                break;

            case this.TYPE_METAL:
                this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=15.0;
                break;
                
            case this.TYPE_CEMENT:
                this.generateCement(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
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
