"use strict";

//
// generate bitmap class
//

function GenBitmapObject(genRandom)
{
        // random generator and utility functions
        
    this.genRandom=genRandom;
    this.genBitmapUtility=new GenBitmapUtilityObject(genRandom);

        //
        // brick/rock bitmaps
        //

    this.generateBrick=function(bitmapCTX,normalCTX,specularCTX,wid,high,edgeSize,paddingSize,darkenFactor,segments)
    {
        var n,rect,darken;
        var drawBrickColor,drawEdgeColor,streakColor,f;

            // some random values

        var groutColor=this.genBitmapUtility.getRandomGreyColor(0.6,0.7);
        var brickColor=this.genBitmapUtility.getRandomColor([0.3,0.2,0.2],[1.0,0.8,0.8]);
        var edgeColor=this.genBitmapUtility.darkenColor(brickColor,0.8);

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,groutColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,high,0.6,0.8,0.9);

        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // draw the bricks

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];

            f=1.0;
            if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=wid) && (rect.bot<=high)) {        // don't darken bricks that fall off edges
                f=this.genRandom.random()+darkenFactor;
                if (f>1.0) f=1.0;
            }

            drawBrickColor=this.genBitmapUtility.darkenColor(brickColor,f);
            drawEdgeColor=this.genBitmapUtility.darkenColor(edgeColor,f);

            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),edgeSize,drawBrickColor,drawEdgeColor,true);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),0.8,1.0,0.6);
            
            /* supergumba -- put in some streaks here, for dripping water type effects
            darken=0.5+(this.genRandom.random()*0.4);
            streakColor=this.genBitmapUtility.darkenColor(drawBrickColor,darken);

            this.genBitmapUtility.drawStreakVertical(bitmapCTX,wid,high,(rect.lft+edgeSize),(rect.top+edgeSize),(rect.bot-edgeSize),10,streakColor);
            */
        }

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,2.0,-0.3);
    };

        //
        // stone bitmaps
        //

    this.generateStone=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,k,rect,edgeSize;
        var drawStoneColor,drawEdgeColor,lineColor,darken,f;
        var x,y,x2,y2,lineCount,stoneWid,stoneHigh;

            // some random values

        var groutColor=this.genBitmapUtility.getRandomGreyColor(0.3,0.4);
        var stoneColor=this.genBitmapUtility.getRandomColor([0.5,0.4,0.3],[0.8,0.6,0.6]);
        var edgeColor=this.genBitmapUtility.darkenColor(stoneColor,0.8);

        var segments=this.genBitmapUtility.createRandomSegments(wid,high);
        var darkenFactor=0.5;

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,groutColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,high,0.6,0.8,0.9);

        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // draw the stones

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];

            f=1.0;
            if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=wid) && (rect.bot<=high)) {        // don't darken stones that fall off edges
                f=this.genRandom.random()+darkenFactor;
                if (f>1.0) f=1.0;
            }

            drawStoneColor=this.genBitmapUtility.darkenColor(stoneColor,f);
            drawEdgeColor=this.genBitmapUtility.darkenColor(edgeColor,f);

            edgeSize=this.genRandom.randomInt(5,12);     // new edge size as stones aren't the same

            this.genBitmapUtility.draw3DComplexRect(bitmapCTX,normalCTX,rect.lft,rect.top,rect.rgt,rect.bot,edgeSize,drawStoneColor,drawEdgeColor);
            
                // cracked lines
                
            stoneWid=(rect.rgt-rect.lft)-(edgeSize*2);
            stoneHigh=(rect.bot-rect.top)-(edgeSize*2);
            lineCount=this.genRandom.randomInt(5,10);
            
            for (k=0;k!==lineCount;k++) {
                x=this.genRandom.randomInt((rect.lft+edgeSize),stoneWid);
                y=this.genRandom.randomInt((rect.top+edgeSize),stoneHigh);
                x2=this.genRandom.randomInt((rect.lft+edgeSize),stoneWid);
                y2=this.genRandom.randomInt((rect.top+edgeSize),stoneHigh);
                
                darken=0.9+(this.genRandom.random()*0.1);
                lineColor=this.genBitmapUtility.darkenColor(drawStoneColor,darken);
                this.genBitmapUtility.drawRandomLine(bitmapCTX,normalCTX,x,y,x2,y2,20,lineColor);
            }
            
                // redo the fill, but just do the edges so we
                // erase any lines that went over
                
            this.genBitmapUtility.draw3DComplexRect(bitmapCTX,normalCTX,rect.lft,rect.top,rect.rgt,rect.bot,edgeSize,null,drawEdgeColor);
            
                 // any random noise
                
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,rect.lft,rect.top,rect.rgt,rect.bot,0.8,1.0,0.5);
        }

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,2.0,-0.4);
    };

        //
        // tile bitmaps
        //
        
    this.generateTilePieceCrack=function(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeMargin,tileColor)
    {
        var sx,ex,sy,ey;
        var lineColor,lineMargin;
        var tileWid,tileHigh;
        
        if (!this.genRandom.randomPercentage(0.10)) return;

        sx=lft+edgeMargin;
        ex=rgt-edgeMargin;
        sy=top+edgeMargin;
        ey=bot-edgeMargin;
        
        tileWid=rgt-lft;
        tileHigh=bot-top;

        if (this.genRandom.randomPercentage(0.50)) {
            lineMargin=Math.trunc(tileWid/5);
            sx=this.genRandom.randomInBetween((lft+lineMargin),(rgt-lineMargin));
            ex=this.genRandom.randomInBetween((lft+lineMargin),(rgt-lineMargin));
        }
        else {
            lineMargin=Math.trunc(tileHigh/5);
            sy=this.genRandom.randomInBetween((top+lineMargin),(bot-lineMargin));
            ey=this.genRandom.randomInBetween((top+lineMargin),(bot-lineMargin));
        }

        lineColor=this.genBitmapUtility.darkenColor(tileColor,0.9);
        this.genBitmapUtility.drawRandomLine(bitmapCTX,normalCTX,sx,sy,ex,ey,20,lineColor);
    };

    this.generateTileInner=function(bitmapCTX,normalCTX,lft,top,rgt,bot,tileColor,tileStyle,splitCount,edgeSize,complex)
    {
        var x,y,dLft,dTop,dRgt,dBot,tileWid,tileHigh;
        var col;
        var borderColor=new wsColor(0.0,0.0,0.0);

            // tile style

        tileStyle=this.genRandom.randomIndex(3);

            // splits

        tileWid=Math.trunc((rgt-lft)/splitCount);
        tileHigh=Math.trunc((bot-top)/splitCount);

        for (y=0;y!==splitCount;y++) {

            dTop=top+(tileHigh*y);
            dBot=dTop+tileHigh;
            if (y===(splitCount-1)) dBot=bot;

            dLft=lft;

            for (x=0;x!==splitCount;x++) {

                dLft=lft+(tileWid*x);
                dRgt=dLft+tileWid;
                if (x===(splitCount-1)) dRgt=rgt;

                    // sometimes a tile piece is a recursion to
                    // another tile set

                if ((complex) && (this.genRandom.randomPercentage(0.25))) {
                    tileStyle=this.genRandom.randomIndex(3);
                    this.generateTileInner(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,tileColor,tileStyle,2,edgeSize,false);
                    continue;
                }

                    // make the tile

                col=tileColor[0];

                switch (tileStyle) {

                    case GEN_BITMAP_TILE_STYLE_BORDER:
                        if ((x!==0) && (y!==0)) col=tileColor[1];
                        break;

                    case GEN_BITMAP_TILE_STYLE_CHECKER:
                        col=tileColor[(x+y)&0x1];
                        break;

                    case GEN_BITMAP_TILE_STYLE_STRIPE:
                        if ((x&0x1)!==0) col=tileColor[1];
                        break;

                }

                this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,edgeSize,col,new wsColor(0.0,0.0,0.0),true);

                    // possible design

                if ((complex) && (this.genRandom.random()<0.25)) {
                    this.genBitmapUtility.draw3DOval(bitmapCTX,normalCTX,(dLft+edgeSize),(dTop+edgeSize),(dRgt-edgeSize),(dBot-edgeSize),0.0,1.0,5,0,null,borderColor);
                }
                else {
                    this.generateTilePieceCrack(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,edgeSize,col);
                }
            }
        }
    };

    this.generateTile=function(bitmapCTX,normalCTX,specularCTX,wid,high,complex,small)
    {
        var splitCount,tileStyle;
        var tileColor=[];

            // some random values

        if (!small) {
            splitCount=this.genRandom.randomInt(2,2);
            tileStyle=this.genRandom.randomIndex(3);
            tileColor[0]=this.genBitmapUtility.getRandomColor([0.3,0.3,0.4],[0.6,0.6,0.7]);
            tileColor[1]=this.genBitmapUtility.darkenColor(tileColor[0],0.8);
        }
        else {
            splitCount=8;
            tileStyle=GEN_BITMAP_TILE_STYLE_CHECKER;
            tileColor[0]=this.genBitmapUtility.getRandomColor([0.5,0.3,0.3],[0.8,0.6,0.6]);
            tileColor[1]=this.genBitmapUtility.darkenColor(tileColor[0],0.9);
        }

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,tileColor);
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // original splits

        this.generateTileInner(bitmapCTX,normalCTX,0,0,wid,high,tileColor,tileStyle,splitCount,(small?2:5),complex);

            // tile noise

        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,high,1.1,1.3,0.2);

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,2.0,-0.3);
    };

        //
        // metal bitmaps
        //
    
    this.generateMetalScrewLine=function(bitmapCTX,normalCTX,screwX,top,bot,screwCount,screwSize,screenFlatInnerSize,screwColor)
    {
        var n,y;
        var high=bot-top;
        var yAdd=Math.trunc((high-(screwSize*2))/(screwCount-1));
        var borderColor=new wsColor(0.0,0.0,0.0);
            
        y=Math.trunc(screwSize*0.5);
        
        for (n=0;n!==screwCount;n++) {
            this.genBitmapUtility.draw3DOval(bitmapCTX,normalCTX,screwX,y,(screwX+screwSize),(y+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,borderColor);
            y+=yAdd;
        }
    };
    
    this.generateMetalPlate=function(bitmapCTX,normalCTX,high,wid,lft,top,rgt,bot,edgeSize,metalColor,metalEdgeColor,screwCount,screwSize,screenFlatInnerSize)
    {
        var n,x,streakWid;
        var streakColor,darken;
        var screwX;
        
        var palteWid=rgt-lft;
        var plateHigh=bot-top;
        
        var streakCount=this.genRandom.randomInt(15,10);
        var screwColor=this.genBitmapUtility.boostColor(metalColor,0.05);
        
            // the plate
            
        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,metalColor,metalEdgeColor,true);
        
            // streaks
            
        for (n=0;n!==streakCount;n++) {
            streakWid=this.genRandom.randomInt(10,40);
            x=edgeSize+this.genRandom.randomInBetween(streakWid,((palteWid-streakWid)-(edgeSize*2)));

            darken=0.5+(this.genRandom.random()*0.5);
            streakColor=this.genBitmapUtility.darkenColor(metalColor,darken);

            this.genBitmapUtility.drawStreakVertical(bitmapCTX,wid,high,(lft+x),(top+edgeSize),(plateHigh-edgeSize),streakWid,streakColor);
        }
        
            // the screws
            
        screwX=lft+(edgeSize*2);
        this.generateMetalScrewLine(bitmapCTX,normalCTX,screwX,(top+edgeSize),(bot+edgeSize),screwCount,screwSize,screenFlatInnerSize,screwColor);
            
        screwX=rgt-(screwSize+(edgeSize*2));
        this.generateMetalScrewLine(bitmapCTX,normalCTX,screwX,(top+edgeSize),(bot+edgeSize),screwCount,screwSize,screenFlatInnerSize,screwColor);
    };
    
    this.generateMetal=function(bitmapCTX,normalCTX,specularCTX,wid,high,hasBar)
    {
        var x;
        var barColor,barEdgeColor;
        var screwCount,screwColor;

            // some random values

        var metalColor=this.genBitmapUtility.getRandomBlueColor(0.6,0.8);
        var metalEdgeColor=this.genBitmapUtility.darkenColor(metalColor,0.9);

        var barEdgeSize=this.genRandom.randomInt(5,5);
        var metalEdgeSize=this.genRandom.randomInt(4,4);

        var screwSize=this.genRandom.randomInt(20,20);
        var screenFlatInnerSize=Math.trunc(screwSize*0.4);

        var barRandomWid=Math.trunc(wid*0.15);
        var barSize=this.genRandom.randomInt(barRandomWid,barRandomWid);
        
            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,metalColor);
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
            
        if (hasBar) {

                // the bar

            barColor=this.genBitmapUtility.getRandomColor([0.3,0.1,0.0],[0.4,0.2,0.0]);
            barEdgeColor=this.genBitmapUtility.darkenColor(barColor,0.9);

            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,-barEdgeSize,barSize,(high+(barEdgeSize*2)),barEdgeSize,barColor,barEdgeColor,true);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,barSize,high,0.6,0.7,0.4);

                // bar screws

            x=Math.trunc((barSize*0.5)-(screwSize*0.5));

            screwCount=this.genRandom.randomInt(2,6);
            screwColor=this.genBitmapUtility.boostColor(barColor,0.2);
            this.generateMetalScrewLine(bitmapCTX,normalCTX,x,0,high,screwCount,screwSize,screenFlatInnerSize,screwColor);

                // the metal plate

            screwCount=this.genRandom.randomInt(2,6);
            this.generateMetalPlate(bitmapCTX,normalCTX,wid,high,barSize,0,wid,high,metalEdgeSize,metalColor,metalEdgeColor,screwCount,screwSize,screenFlatInnerSize);
        }

            // just plates

        else {

            screwCount=this.genRandom.randomInt(2,6);

            if (this.genRandom.random()>=0.5) {
                this.generateMetalPlate(bitmapCTX,normalCTX,wid,high,0,0,wid,high,metalEdgeSize,metalColor,metalEdgeColor,screwCount,screwSize,screenFlatInnerSize);
            }
            else {
                x=Math.trunc(wid*0.5);
                this.generateMetalPlate(bitmapCTX,normalCTX,wid,high,0,0,x,high,metalEdgeSize,metalColor,metalEdgeColor,screwCount,screwSize,screenFlatInnerSize);
                this.generateMetalPlate(bitmapCTX,normalCTX,wid,high,x,0,wid,high,metalEdgeSize,metalColor,metalEdgeColor,screwCount,screwSize,screenFlatInnerSize);
            }
        }
        
            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,3.0,-0.1);
    };
    
    this.generateMetalCorrugated=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var x,y;
        var dx,dy,sx,sy,ex,ey;
        var idx,line,lineStyle;
        var lines=[];
        
            // some random values

        var metalColor=this.genBitmapUtility.getRandomGreyColor(0.6,0.8);
        var metalEdgeColor=this.genBitmapUtility.darkenColor(metalColor,0.8);
        var metalCorrColor=this.genBitmapUtility.darkenColor(metalColor,0.6);

        var edgeSize=this.genRandom.randomInt(5,10);
        
        var corrCount=this.genRandom.randomInt(10,20);
        var corrWid=Math.trunc((wid-((edgeSize*2)+10))/corrCount);
        var corrHigh=Math.trunc((high-((edgeSize*2)+10))/corrCount);

        var lft=Math.trunc((wid-(corrWid*corrCount))*0.5);
        var top=Math.trunc((high-(corrHigh*corrCount))*0.5);

        var lineWid=corrWid-4;
        var lineHigh=corrHigh-4;
        
            // corrugated styles
            
        lines.push([[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]]]);      // diamonds
        lines.push([[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]]]);      // waves
        lines.push([[[0.5,0.0],[0.5,1.0]],[[0.0,0.5],[1.0,0.5]],[[0.0,0.5],[1.0,0.5]],[[0.5,0.0],[0.5,1.0]]]);      // pluses

        lineStyle=this.genRandom.randomIndex(lines.length);

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,metalColor);
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // corugated

        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,edgeSize,metalColor,metalEdgeColor,false);

        dy=top;

        for (y=0;y!==corrCount;y++) {

            dx=lft;

            for (x=0;x!==corrCount;x++) {
                
                idx=((y&0x1)*2)+(x&0x1);
                line=lines[lineStyle][idx];

                sx=dx+(line[0][0]*lineWid);
                sy=dy+(line[0][1]*lineHigh);
                ex=dx+(line[1][0]*lineWid);
                ey=dy+(line[1][1]*lineHigh);

                this.genBitmapUtility.drawBumpLine(bitmapCTX,normalCTX,sx,sy,ex,ey,metalCorrColor);

                dx+=corrWid;
            }

            dy+=corrHigh;
        }
        
            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,3.0,-0.1);
    };

        //
        // concrete bitmaps
        //

    this.generateConcrete=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,x,y,particleWid,particleHigh,particleDensity;

            // some random values

        var concreteColor=this.genBitmapUtility.getRandomGreyColor(0.4,0.6);
        var markCount=this.genRandom.randomInt(30,20);

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,concreteColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,high,0.6,0.8,0.8);

        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // marks

        for (n=0;n!==markCount;n++) {
            particleWid=this.genRandom.randomInt(100,100);
            particleHigh=this.genRandom.randomInt(100,100);
            particleDensity=this.genRandom.randomInt(250,150);

            x=this.genRandom.randomInt(0,wid);
            y=this.genRandom.randomInt(0,high);

            this.genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.9,particleDensity,false);
        }

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,4.0,-0.4);
    };
    
        //
        // plaster bitmaps
        //

    this.generatePlaster=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,x;
        var lineColor,darken,boost;

            // some random values

        var plasterColor=this.genBitmapUtility.getRandomColor([0.7,0.7,0.7],[0.8,0.8,0.8]);
        var lineColorBase=this.genBitmapUtility.getRandomPrimaryColor(0.3,0.6);
        var lineCount=this.genRandom.randomInt(40,30);

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,plasterColor);
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // lines
            
        for (n=0;n!==lineCount;n++) {
            x=this.genRandom.randomInt(0,wid);
            
            darken=0.85+(this.genRandom.random()*0.1);
            lineColor=this.genBitmapUtility.darkenColor(lineColorBase,darken);
            
            this.genBitmapUtility.drawRandomLine(bitmapCTX,normalCTX,x,0,x,high,30,lineColor);
        }
        
        for (n=0;n!==lineCount;n++) {
            x=this.genRandom.randomInt(0,wid);
            
            boost=0.05+(this.genRandom.random()*0.1);
            lineColor=this.genBitmapUtility.boostColor(lineColorBase,boost);
            
            this.genBitmapUtility.drawRandomLine(bitmapCTX,normalCTX,x,0,x,high,30,lineColor);
        }
        
            // plaster noise
            
        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,high,0.6,0.8,0.8);
        this.genBitmapUtility.blur(bitmapCTX,0,0,wid,high,5);

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,2.0,-0.4);
    };
    
        //
        // mosaic bitmaps
        //

    this.generateMosaic=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var x,y,lft,rgt,top,bot,tileWid,tileHigh;
        var splitCount,borderSize,edgeSize;
        var mortarColor,borderColor,col,darkCol;
        
            // some random values

        splitCount=this.genRandom.randomInt(5,5);
        borderSize=this.genRandom.randomInt(2,3);
        edgeSize=this.genRandom.randomInt(1,2);
        
        mortarColor=this.genBitmapUtility.getRandomGreyColor(0.4,0.6);
        borderColor=this.genBitmapUtility.getRandomColor([0.2,0.2,0.2],[0.4,0.4,0.4]);
        
            // tile sizes
            
        tileWid=wid/splitCount;
        tileHigh=high/splitCount;

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,mortarColor);
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

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
                    col=this.genBitmapUtility.getRandomColor([0.3,0.3,0.4],[0.6,0.6,0.7]);
                }
                darkCol=this.genBitmapUtility.darkenColor(col,0.5);

                rgt=(lft+tileWid)-borderSize;

                this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),edgeSize,col,darkCol,true);
                
                    // any cracks
                    
                this.generateTilePieceCrack(bitmapCTX,normalCTX,Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),edgeSize,col);

                lft+=tileWid;
            }
            
            top+=tileHigh;
        }

            // noise

        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,high,1.1,1.3,0.5);

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,3.0,-0.3);
    };

        //
        // wood bitmaps
        //

    this.generateWood=function(bitmapCTX,normalCTX,specularCTX,wid,high,isBox)
    {
        var x,y,lft,woodFactor;
        
            // some random values

        var boardSize=Math.trunc(wid/8);
        var woodColor;
        var blackColor=new wsColor(0.0,0.0,0.0);

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,new wsColor(1.0,1.0,1.0));
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // regular wood planking

        if (!isBox) {
            lft=0;
            
            while (lft<wid) {
                woodColor=this.genBitmapUtility.getRandomColor([0.4,0.2,0.0],[0.5,0.3,0.0]);
                woodFactor=0.8+((1.0-(this.genRandom.random()*2.0))*0.1);
                this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,lft,-3,(lft+boardSize),(high+3),3,woodColor,blackColor,true); // -3 to get around outside borders
                this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,normalCTX,(lft+3),0,((lft+boardSize)-3),high,0.1,woodColor);
                this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,(lft+3),0,((lft+boardSize)-3),high,0.9,0.95,woodFactor);
                lft+=boardSize;
            }
        }

            // box type wood

        else {

                // inner boards

            woodColor=this.genBitmapUtility.getRandomColor([0.4,0.2,0.0],[0.5,0.3,0.0]);
            this.genBitmapUtility.drawColorStripeSlant(bitmapCTX,normalCTX,boardSize,boardSize,(wid-boardSize),(high-boardSize),0.3,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,boardSize,boardSize,(wid-boardSize),(high-boardSize),0.9,0.95,0.8);

                // inner boards

            y=Math.trunc(high/2)-Math.trunc(boardSize/2);

            woodColor=this.genBitmapUtility.getRandomColor([0.4,0.2,0.0],[0.5,0.3,0.0]);
            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,y,wid,(y+boardSize),3,woodColor,blackColor,true);
            this.genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,normalCTX,3,(y+3),(wid-3),((y+boardSize)-3),0.2,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,y,wid,(y+boardSize),0.9,0.95,0.8);

            x=Math.trunc(wid/2)-Math.trunc(boardSize/2);

            woodColor=this.genBitmapUtility.getRandomColor([0.4,0.2,0.0],[0.5,0.3,0.0]);
            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,x,0,(x+boardSize),high,3,woodColor,blackColor,true);
            this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,normalCTX,(x+3),3,((x+boardSize)-3),(high-3),0.2,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,x,0,(x+boardSize),high,0.9,0.95,0.8);

                // outside boards

            woodColor=this.genBitmapUtility.getRandomColor([0.4,0.2,0.0],[0.5,0.3,0.0]);
            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,0,wid,boardSize,3,woodColor,blackColor,true);
            this.genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,normalCTX,3,3,(wid-3),(boardSize-3),0.1,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,boardSize,0.9,0.95,0.8);

            woodColor=this.genBitmapUtility.getRandomColor([0.4,0.2,0.0],[0.5,0.3,0.0]);
            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,(high-boardSize),wid,high,3,woodColor,blackColor,true);
            this.genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,normalCTX,3,((high-boardSize)+3),(wid-3),(high-3),0.1,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,(high-boardSize),wid,high,0.9,0.95,0.8);

            woodColor=this.genBitmapUtility.getRandomColor([0.4,0.2,0.0],[0.5,0.3,0.0]);
            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,0,boardSize,high,3,woodColor,blackColor,true);
            this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,normalCTX,3,3,(boardSize-3),(high-3),0.1,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,boardSize,high,0.9,0.95,0.8);

            woodColor=this.genBitmapUtility.getRandomColor([0.4,0.2,0.0],[0.5,0.3,0.0]);
            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,(wid-boardSize),0,wid,high,3,woodColor,blackColor,true);
            this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,normalCTX,((wid-boardSize)+3),3,(wid-3),(high-3),0.1,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,(wid-boardSize),0,wid,high,0.9,0.95,0.8);
        }

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,2.0,-0.2);
    };
    
        //
        // machine
        //
    
    this.generateMachineComponent=function(bitmapCTX,normalCTX,lft,top,rgt,bot,metalInsideColor,metalEdgeColor)
    {
        var x,y,xCount,yCount,xOff,yOff,dx,dy,wid;
        var color,panelType;
        var borderColor=new wsColor(0.0,0.0,0.0);
        
            // the plate of the component
            
        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,5,metalInsideColor,metalEdgeColor,false);
        
            // panel looks
        
        panelType=this.genRandom.randomIndex(3);
        if (panelType===0) return;          // 0 = none
        
        wid=this.genRandom.randomInt(30,25);
        
        xCount=Math.trunc((rgt-lft)/wid);
        yCount=Math.trunc((bot-top)/wid);
        
        xOff=(lft+2)+Math.trunc(((rgt-lft)-(xCount*wid))/2);
        yOff=(top+2)+Math.trunc(((bot-top)-(yCount*wid))/2);
        
        for (y=0;y!==yCount;y++) {
            dy=yOff+(y*wid);
            
            for (x=0;x!==xCount;x++) {
                dx=xOff+(x*wid);
                color=this.genBitmapUtility.getRandomPrimaryColor(0.2,0.4);
                
                if (panelType===1) {
                    this.genBitmapUtility.draw3DOval(bitmapCTX,normalCTX,dx,dy,(dx+(wid-5)),(dy+(wid-5)),0.0,1.0,3,0,color,borderColor);
                }
                else {
                    this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,dx,dy,(dx+wid),(dy+wid),2,color,borderColor,false);
                }
            }
        }
    };
    
    this.generateMachine=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var mx,my,sz,lft,top,rgt,bot;
        
        var metalColor=this.genBitmapUtility.getRandomGreyColor(0.6,0.8);
        var metalEdgeColor=this.genBitmapUtility.darkenColor(metalColor,0.9);
        var metalInsideColor=this.genBitmapUtility.boostColor(metalColor,0.1);
       
            // face plate
            
        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,8,metalColor,metalEdgeColor,true);
        
            // inside components
            // these are stacks of vertical or horizontal chunks
            
        mx=15;
        my=15;
        
        while (true) {
            
            lft=mx;
            top=my;
            sz=this.genRandom.randomInt(100,50);
            
                // vertical stack
                
            if (this.genRandom.randomPercentage(0.5)) {
                rgt=lft+sz;
                if (rgt>(wid-15)) rgt=wid-15;
                bot=high-15;
                
                mx+=(sz+5);
            }
            
                // horizontal stack
                
            else {
                bot=top+sz;
                if (bot>(high-15)) bot=high-15;
                rgt=wid-15;
                
                my+=(sz+5);
            }
            
                // draw the segment
            
            this.generateMachineComponent(bitmapCTX,normalCTX,lft,top,rgt,bot,metalInsideColor,metalEdgeColor);
            
                // are we finished?
                
            if ((mx>=(wid-15)) || (my>=(high-15))) break;
        }
        
            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,3.0,-0.5);
    };

        //
        // skin bitmaps
        //

    this.generateSkinScale=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var x,y,dx,dy;
        var xCount;

        var scaleCount=this.genRandom.randomInt(5,10);
        var skinColor=this.genBitmapUtility.getRandomPrimaryColor(0.4,0.7);
        var borderColor=this.genBitmapUtility.darkenColor(skinColor,0.8);

        var sWid=wid/scaleCount;
        var sHigh=high/scaleCount;
         
            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,skinColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,high,0.5,0.7,0.6);
        this.genBitmapUtility.blur(bitmapCTX,0,0,wid,high,5);
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // scales

        dy=-sHigh;
        
        for (y=0;y!==scaleCount;y++) {

            if ((y%2)===0) {
                dx=0;
                xCount=scaleCount;
            }
            else {
                dx=-Math.trunc(sWid*0.5);
                xCount=scaleCount+1;
            }
            
            for (x=0;x!==xCount;x++) {
                this.genBitmapUtility.draw3DOval(bitmapCTX,normalCTX,Math.trunc(dx),Math.trunc(dy),Math.trunc(dx+sWid),Math.trunc(dy+(sHigh*2)),0.25,0.75,3,0,null,borderColor);
                dx+=sWid;
            }
            
            dy+=sHigh;
        }

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,2.0,-0.2);
    };
    
    this.generateSkinLeather=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,x,y,y2,lineCount;
        var darken,lineColor,markCount;
        var particleWid,particleHigh,particleDensity;
        
        var clothColor=this.genBitmapUtility.getRandomPrimaryColor(0.3,0.3);
         
            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,clothColor);
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
        
        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,high,0.8,0.9,0.5);        
 
            // lines
            
        lineCount=this.genRandom.randomInt(30,30);
            
        for (n=0;n!==lineCount;n++) {
            x=this.genRandom.randomInt(0,wid);
            y=this.genRandom.randomInt(0,high);
            y2=this.genRandom.randomInt(0,high);
            
            darken=0.6+(this.genRandom.random()*0.25);
            lineColor=this.genBitmapUtility.darkenColor(clothColor,darken);
            
            this.genBitmapUtility.drawRandomLine(bitmapCTX,normalCTX,x,y,x,y2,30,lineColor);
        }

            // marks
            
        markCount=this.genRandom.randomInt(20,20);

        for (n=0;n!==markCount;n++) {
            particleWid=this.genRandom.randomInt(30,60);
            particleHigh=this.genRandom.randomInt(30,60);
            particleDensity=this.genRandom.randomInt(50,150);

            x=this.genRandom.randomInt(0,wid);
            y=this.genRandom.randomInt(0,high);

            this.genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.9,particleDensity,false);
        }
        
            // blur it
            
        this.genBitmapUtility.blur(bitmapCTX,0,0,wid,high,25);

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5,-0.4);
    };
    
    this.generateSkinFur=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,x,y;
        var darken,boost,lineColor;
        var halfHigh=Math.trunc(high*0.5);

        var furColor=this.genBitmapUtility.getRandomColor([0.5,0.2,0.0],[0.7,0.4,0.0]);
         
            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,furColor);       
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // hair
            
        for (x=0;x!==wid;x++) {
            
                // hair color
                
            if ((n%2)===0) {
                darken=0.5+(this.genRandom.random()*0.3);
                lineColor=this.genBitmapUtility.darkenColor(furColor,darken);
            }
            else {
                boost=0.1+(this.genRandom.random()*0.3);
                lineColor=this.genBitmapUtility.boostColor(furColor,boost);
            }
            
                // hair half from top
                
            y=halfHigh+this.genRandom.randomInt(0,halfHigh);
            this.genBitmapUtility.drawRandomLine(bitmapCTX,normalCTX,x,0,x,y,10,lineColor);
            
                // hair half from bottom
                
            y=high-(halfHigh+this.genRandom.randomInt(0,halfHigh));
            this.genBitmapUtility.drawRandomLine(bitmapCTX,normalCTX,x,y,x,high,10,lineColor);
        }

            // finish with the specular
            // fur isn't shiney so this specular is very low

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5,-0.6);
    };
    
        //
        // UV tester
        //
        
    this.generateUVTest=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
        this.genBitmapUtility.drawUVTest(bitmapCTX,0,0,wid,high);
        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,2.0,0.0);
    };

        //
        // generate mainline
        //

    this.generate=function(view,name,generateType)
    {
        var wid,high,edgeSize,paddingSize,segments;
        var shineFactor=1.0;
        var bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
        bitmapCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        normalCanvas=document.createElement('canvas');
        normalCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
        normalCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
        normalCTX=normalCanvas.getContext('2d');

        specularCanvas=document.createElement('canvas');
        specularCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
        specularCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
        specularCTX=specularCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case GEN_BITMAP_TYPE_BRICK_STACK:
                segments=this.genBitmapUtility.createStackedSegments(wid,high);
                edgeSize=this.genRandom.randomInt(2,5);
                paddingSize=this.genRandom.randomInt(1,3);
                this.generateBrick(bitmapCTX,normalCTX,specularCTX,wid,high,edgeSize,paddingSize,0.8,segments);
                shineFactor=5.0;
                break;

            case GEN_BITMAP_TYPE_BRICK_RANDOM:
                segments=this.genBitmapUtility.createRandomSegments(wid,high);
                edgeSize=this.genRandom.randomInt(5,10);
                paddingSize=this.genRandom.randomInt(3,5);
                this.generateBrick(bitmapCTX,normalCTX,specularCTX,wid,high,edgeSize,paddingSize,0.5,segments);
                shineFactor=5.0;
                break;

            case GEN_BITMAP_TYPE_STONE:
                this.generateStone(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;

            case GEN_BITMAP_TYPE_TILE_SIMPLE:
                this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,false,false);
                shineFactor=8.0;
                break;

            case GEN_BITMAP_TYPE_TILE_COMPLEX:
                this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,true,false);
                shineFactor=8.0;
                break;

            case GEN_BITMAP_TYPE_TILE_SMALL:
                this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,false,true);
                shineFactor=5.0;
                break;

            case GEN_BITMAP_TYPE_METAL:
                this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high,false);
                shineFactor=15.0;
                break;
                
            case GEN_BITMAP_TYPE_METAL_BAR:
                this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high,true);
                shineFactor=15.0;
                break;
                
            case GEN_BITMAP_TYPE_METAL_CORRUGATED:
                this.generateMetalCorrugated(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=12.0;
                break;
                
            case GEN_BITMAP_TYPE_CONCRETE:
                this.generateConcrete(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;
                
            case GEN_BITMAP_TYPE_PLASTER:
                this.generatePlaster(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;
                
            case GEN_BITMAP_TYPE_MOSAIC:
                this.generateMosaic(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;

            case GEN_BITMAP_TYPE_WOOD_PLANK:
                this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high,false);
                shineFactor=2.0;
                break;

            case GEN_BITMAP_TYPE_WOOD_BOX:
                this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high,true);
                shineFactor=2.0;
                break;
                
            case GEN_BITMAP_TYPE_MACHINE:
                this.generateMachine(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=2.0;
                break;

            case GEN_BITMAP_TYPE_SKIN_SCALE:
                this.generateSkinScale(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=8.0;
                break;
                
            case GEN_BITMAP_TYPE_SKIN_LEATHER:
                this.generateSkinLeather(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=2.0;
                break;
                
            case GEN_BITMAP_TYPE_SKIN_FUR:
                this.generateSkinFur(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=1.0;
                break;

        }

            // if view is null, then we are in the special
            // debug main, which just displays the canvases, so send
            // them back
        
        if (view===null) {
            return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas});
        }
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapObject(view,name,bitmapCanvas,normalCanvas,specularCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    };

}
