/* global genRandom */

"use strict";

//
// generate floor bitmap class
//

class GenBitmapFloorClass extends GenBitmapClass
{
    constructor()
    {
        super();
        
            // types
            
        this.TYPE_TILE=0;
        this.TYPE_HEXAGONAL=1;
        this.TYPE_METAL=2;
        this.TYPE_CEMENT=3;
        this.TYPE_MOSAIC=4;
        this.TYPE_WOOD=5;

        this.TYPE_NAMES=
                [
                    'Tile','Hexagonal','Metal','Cement',
                    'Mosaic','Wood'
                ];
        
        Object.seal(this);
    }
        
        //
        // tile bitmaps
        //
        
    generateTilePieceCrack(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeMargin,tileColor)
    {
        let sx,ex,sy,ey;
        let lineColor,lineMargin;
        let tileWid,tileHigh;
        
        if (!genRandom.randomPercentage(0.10)) return;

        sx=lft+edgeMargin;
        ex=rgt-edgeMargin;
        sy=top+edgeMargin;
        ey=bot-edgeMargin;
        
        tileWid=rgt-lft;
        tileHigh=bot-top;

        if (genRandom.randomPercentage(0.50)) {
            lineMargin=Math.trunc(tileWid/5);
            sx=genRandom.randomInBetween((lft+lineMargin),(rgt-lineMargin));
            ex=genRandom.randomInBetween((lft+lineMargin),(rgt-lineMargin));
        }
        else {
            lineMargin=Math.trunc(tileHigh/5);
            sy=genRandom.randomInBetween((top+lineMargin),(bot-lineMargin));
            ey=genRandom.randomInBetween((top+lineMargin),(bot-lineMargin));
        }

        lineColor=this.darkenColor(tileColor,0.9);
        this.drawRandomLine(bitmapCTX,normalCTX,sx,sy,ex,ey,20,lineColor,false);
    }

    generateTileInner(bitmapCTX,normalCTX,lft,top,rgt,bot,tileColor,tileStyle,splitCount,edgeSize,paddingSize,complex)
    {
        let x,y,dLft,dTop,dRgt,dBot,tileWid,tileHigh;
        let col,padding;

            // tile style

        tileStyle=genRandom.randomIndex(3);

            // splits

        tileWid=Math.trunc((rgt-lft)/splitCount);
        tileHigh=Math.trunc((bot-top)/splitCount);

        for (y=0;y!==splitCount;y++) {

            dTop=top+(tileHigh*y);
            dBot=(dTop+tileHigh)-paddingSize;
            if (y===(splitCount-1)) dBot=bot;

            dLft=lft;

            for (x=0;x!==splitCount;x++) {
                
                dLft=lft+(tileWid*x);
                dRgt=dLft+tileWid;
                if (x===(splitCount-1)) dRgt=rgt;
                
                dRgt-=paddingSize;

                    // sometimes a tile piece is a recursion to
                    // another tile set

                if ((complex) && (genRandom.randomPercentage(0.25))) {
                    tileStyle=genRandom.randomIndex(3);
                    this.generateTileInner(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,tileColor,tileStyle,2,edgeSize,paddingSize,false);
                    continue;
                }

                    // make the tile

                col=tileColor[0];

                switch (tileStyle) {

                    case 0:         // border style
                        if ((x!==0) && (y!==0)) col=tileColor[1];
                        break;

                    case 1:         // checker board style
                        col=tileColor[(x+y)&0x1];
                        break;

                    case 2:         // stripe style
                        if ((x&0x1)!==0) col=tileColor[1];
                        break;

                }

                this.draw3DRect(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,edgeSize,col,true);

                    // possible design
                    // 0 = nothing

                if (complex) {
                    col=this.darkenColor(col,0.8);
                    padding=edgeSize+2;
                    
                    switch (genRandom.randomIndex(3)) {
                        case 1:
                            this.drawOval(bitmapCTX,(dLft+padding),(dTop+padding),(dRgt-padding),(dBot-padding),col,this.blackColor);
                            break;
                        case 2:
                            this.drawDiamond(bitmapCTX,(dLft+padding),(dTop+padding),(dRgt-padding),(dBot-padding),col,this.blackColor);
                            break;
                    }
                }
                
                    // possible crack
                    
                this.generateTilePieceCrack(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,edgeSize,col);
            }
        }
    }

    generateTile(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let splitCount,tileStyle,groutColor;
        let tileColor=[];
        
        let complex=genRandom.randomPercentage(0.5);
        let small=false;
        if (!complex) small=genRandom.randomPercentage(0.5);

            // some random values

        if (!small) {
            splitCount=genRandom.randomInt(2,2);
        }
        else {
            splitCount=genRandom.randomInt(6,4);
        }
        
        tileStyle=genRandom.randomIndex(3);
        tileColor[0]=this.getDefaultPrimaryColor();
        tileColor[1]=this.darkenColor(tileColor[0],0.85);

            // clear canvas

        groutColor=this.dullColor(tileColor[0],0.7);
        this.drawRect(bitmapCTX,0,0,wid,high,groutColor);
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);
        this.blur(bitmapCTX,0,0,wid,high,5,false);
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // original splits

        this.generateTileInner(bitmapCTX,normalCTX,0,0,wid,high,tileColor,tileStyle,splitCount,(small?2:5),(small?3:0),complex);

            // tile noise

        this.addNoiseRect(bitmapCTX,0,0,wid,high,1.1,1.3,0.2);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    }
    
        //
        // hexagonal
        //
        
    generateHexagonal(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let color,edgeColor,edgeSize;
        let xCount,yCount,xSize,ySize;
        let x,y,lft,top;

            // colors
            
        color=this.getDefaultPrimaryColor();
        edgeColor=this.darkenColor(color,0.8);
        
            // sizing
        
        edgeSize=genRandom.randomInt(2,3);
        xCount=2+(2*genRandom.randomInt(0,2));
        yCount=2+(2*genRandom.randomInt(0,5));
        
        xSize=Math.trunc(wid/xCount);
        ySize=Math.trunc(high/yCount);
        
        top=-Math.trunc(ySize/2);
        
        for (y=0;y<=(yCount*2);y++) {
            
            lft=((y%2)===0)?0:xSize;
            
            for (x=0;x<=xCount;x+=2) {
                this.draw3DHexagon(bitmapCTX,normalCTX,wid,high,lft,top,Math.trunc(lft+xSize),Math.trunc(top+ySize),edgeSize,color,edgeColor);
                lft+=(xSize*2);
            }
            
            top+=(ySize/2);
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.6);
    }

        //
        // metal bitmaps
        //
    
    generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,x,y,offset;
        let dx,dy,sx,sy,ex,ey;
        let streakWid,streakColor,darken;
        let idx,line,lineStyle;
        let lines=[];
        let metalCorrColor,corrCount;
        let corrWid,corrHigh;
        let lineWid,lineHigh;

            // some random values

        let metalColor=this.getDefaultPrimaryColor();

        let edgeSize=genRandom.randomInt(4,8);
        let innerEdgeSize=genRandom.randomInt(4,10)+edgeSize;
        
        let screwSize=genRandom.randomInt(10,20);
        let screenFlatInnerSize=Math.trunc(screwSize*0.4);
        
        let streakCount=genRandom.randomInt(15,10);
        let screwColor=this.boostColor(metalColor,0.05);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // the plate
            
        this.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,edgeSize,metalColor,true);
        
            // streaks
            
        for (n=0;n!==streakCount;n++) {
            streakWid=genRandom.randomInt(10,40);
            x=edgeSize+genRandom.randomInBetween(streakWid,((wid-streakWid)-(edgeSize*2)));

            darken=0.5+(genRandom.random()*0.5);
            streakColor=this.darkenColor(metalColor,darken);

            this.drawStreakMetal(bitmapCTX,wid,high,x,edgeSize,(high-edgeSize),streakWid,streakColor);
        }
        
            // possible screws
            
        if (genRandom.randomPercentage(0.5)) {
            offset=edgeSize+4;
            
            this.draw3DOval(bitmapCTX,normalCTX,offset,offset,(offset+screwSize),(offset+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,offset,((high-offset)-screwSize),(offset+screwSize),(high-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,((wid-offset)-screwSize),offset,(wid-offset),(offset+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,((wid-offset)-screwSize),((high-offset)-screwSize),(wid-offset),(high-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            
            innerEdgeSize+=screwSize;
        }
            
            // any corrugation
 
        if ((genRandom.randomPercentage(0.5)) || (1===1)) {
            metalCorrColor=this.darkenColor(metalColor,0.6);

            corrCount=genRandom.randomInt(8,15);
            corrWid=Math.trunc((wid-(innerEdgeSize*2))/corrCount);
            corrHigh=Math.trunc((high-(innerEdgeSize*2))/corrCount);

            lineWid=corrWid-4;
            lineHigh=corrHigh-4;

                // corrugated styles

            lines.push([[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]]]);      // diamonds
            lines.push([[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]]]);      // waves
            lines.push([[[0.5,0.0],[0.5,1.0]],[[0.0,0.5],[1.0,0.5]],[[0.0,0.5],[1.0,0.5]],[[0.5,0.0],[0.5,1.0]]]);      // pluses

            lineStyle=genRandom.randomIndex(lines.length);

                // corrugations

            dy=Math.trunc((high-(corrHigh*corrCount))*0.5);

            for (y=0;y!==corrCount;y++) {

                dx=Math.trunc((wid-(corrWid*corrCount))*0.5);

                for (x=0;x!==corrCount;x++) {

                    idx=((y&0x1)*2)+(x&0x1);
                    line=lines[lineStyle][idx];

                    sx=dx+(line[0][0]*lineWid);
                    sy=dy+(line[0][1]*lineHigh);
                    ex=dx+(line[1][0]*lineWid);
                    ey=dy+(line[1][1]*lineHigh);

                    this.drawBumpLine(bitmapCTX,normalCTX,sx,sy,ex,ey,9,metalCorrColor);

                    dx+=corrWid;
                }

                dy+=corrHigh;
            }
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.6);
    }
    
        //
        // cement bitmaps
        //

    generateCement(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,nLine,markCount,x,y,y2;
        let particleWid,particleHigh,particleDensity,particleRingCount,particleDarken;
        let edgeSize,concreteColor,lineColor,line2Color;

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

        markCount=genRandom.randomInt(5,20);
        
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
        this.blur(bitmapCTX,0,0,wid,high,3,false);
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.8,0.9,0.7);
        this.blur(bitmapCTX,0,0,wid,high,3,false);
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,1.0,1.2,0.6);
        this.blur(bitmapCTX,0,0,wid,high,3,false);
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);
    }
        
        //
        // mosaic bitmaps
        //

    generateMosaic(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let x,y,lft,rgt,top,bot,tileWid,tileHigh;
        let splitCount,borderSize,edgeSize;
        let mortarColor,borderColor,mosaicColor,mosaic2Color,col;
        
            // some random values

        splitCount=genRandom.randomInt(5,5);
        borderSize=genRandom.randomInt(2,5);
        edgeSize=genRandom.randomInt(1,2);
        
        borderColor=this.getDefaultPrimaryColor();
        mortarColor=this.dullColor(borderColor,0.7);
        
        mosaicColor=this.getRandomColor();
        mosaic2Color=this.darkenColor(mosaicColor,0.5);
        
            // tile sizes
            
        tileWid=wid/splitCount;
        tileHigh=high/splitCount;

            // clear canvases to mortar

        this.drawRect(bitmapCTX,0,0,wid,high,mortarColor);
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);

        this.clearNormalsRect(normalCTX,0,0,wid,high);        

            // draw the tiles
        
        top=0;
        
        for (y=0;y!==splitCount;y++) {

            bot=(top+tileHigh)-borderSize;
            
            lft=0;

            for (x=0;x!==splitCount;x++) {
                
                    // the tile
                    
                if ((x===0) || (y===0) || (x===(splitCount-1)) || (y===(splitCount-1))) {
                    col=borderColor;
                }
                else {
                    col=(genRandom.randomPercentage(0.5))?mosaicColor:mosaic2Color;
                }

                rgt=(lft+tileWid)-borderSize;

                this.draw3DRect(bitmapCTX,normalCTX,Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),edgeSize,col,true);
                
                    // noise and blur
                
                this.addNoiseRect(bitmapCTX,Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),1.1,1.3,0.5);
                this.blur(bitmapCTX,Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),3,false);
                
                    // any cracks
                    
                this.generateTilePieceCrack(bitmapCTX,normalCTX,Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),edgeSize,col);

                lft+=tileWid;
            }
            
            top+=tileHigh;
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    }

        //
        // wood bitmaps
        //

    generateWood(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,k,lft,rgt,top,bot;
        let boardSplit,boardHigh,woodFactor;
        
            // some random values

        let boardCount=genRandom.randomInt(4,8);
        let boardSize=Math.trunc(wid/boardCount);
        let edgeSize=genRandom.randomInt(3,3);
        let woodColor=this.getDefaultPrimaryColor();
        let col;

            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // regular wood planking

        lft=0;

        for (n=0;n!==boardCount;n++) {
            rgt=lft+boardSize;
            if (n===(boardCount-1)) rgt=wid;
            
            boardSplit=genRandom.randomInt(1,3);
            boardHigh=Math.trunc(high/boardSplit);
            
            top=0;
            
            for (k=0;k!==boardSplit;k++) {
                bot=top+boardHigh;
                if (k===(boardSplit-1)) bot=high;
                
                woodFactor=0.8+(genRandom.random()*0.2);
                col=this.darkenColor(woodColor,woodFactor);

                this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,col,true);
                this.drawColorStripeVertical(bitmapCTX,normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
                this.addNoiseRect(bitmapCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.9,0.95,0.8);
                
                top=bot;
            }
            
            lft=rgt;
        }

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

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case this.TYPE_TILE:
                this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=10.0;
                break;

            case this.TYPE_HEXAGONAL:
                this.generateHexagonal(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;

            case this.TYPE_METAL:
                this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=15.0;
                break;
                
            case this.TYPE_CEMENT:
                this.generateCement(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;
                
            case this.TYPE_MOSAIC:
                this.generateMosaic(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=10.0;
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
