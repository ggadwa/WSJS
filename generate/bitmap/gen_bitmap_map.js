"use strict";

//
// generate map bitmap class
//

class GenBitmapMapClass extends GenBitmapClass
{
    constructor(genRandom)
    {
        super(genRandom);
        
            // types
            
        this.TYPE_BRICK=0;
        this.TYPE_STONE=1;
        this.TYPE_BLOCK=2;
        this.TYPE_TILE=3;
        this.TYPE_HEXAGONAL=4;
        this.TYPE_METAL=5;
        this.TYPE_CEMENT=6;
        this.TYPE_PLASTER=7;
        this.TYPE_MOSAIC=8;
        this.TYPE_WOOD=9;
        this.TYPE_MACHINE=10;

        this.TYPE_NAMES=
                [
                    'Brick','Stone','Block','Tile','Hexagonal',
                    'Metal','Cement','Plaster','Mosaic',
                    'Wood','Machine'
                ];
        
        Object.seal(this);
    }
    
        //
        // brick/rock bitmaps
        //

    generateBrick(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,rect,segments;
        var drawBrickColor,f;
        var lft,rgt,top,bot;
        var sx,ex,streakWid,lineColor;
        
        var edgeSize=this.genRandom.randomInt(3,10);
        var paddingSize=this.genRandom.randomInt(1,20);
        
        if (this.genRandom.randomPercentage(0.5)) {
            segments=this.createStackedSegments(wid,high);
        }
        else {
            segments=this.createRandomSegments(wid,high);
        }

            // some random values

        var groutColor=this.getRandomColor();
        var brickColor=this.getRandomColor();
        var edgeColor=this.darkenColor(brickColor,0.8);
        var dirtColor=this.darkenColor(brickColor,0.5);

            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,groutColor);
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);

        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // draw the bricks

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];

                // the brick
                
            f=1.0;
            if (!((rect.lft<0) || (rect.rgt>wid))) {        // don't darken bricks that fall off edges
                f=0.6+(this.genRandom.random()*0.4);
            }

            drawBrickColor=this.darkenColor(brickColor,f);

            this.draw3DRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),edgeSize,drawBrickColor,true);
            this.addNoiseRect(bitmapCTX,rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),0.8,1.0,0.6);
            
                // calc the brick size around the edges
                
            lft=rect.lft;
            if (lft<0) {
                lft=0;
            }
            else {
                lft+=edgeSize;
            }
            
            rgt=rect.rgt;
            if (rgt>=wid) {
                rgt=wid-1;
            }
            else {
                rgt-=(paddingSize+edgeSize);
            }
            
            top=rect.top+edgeSize;
            bot=rect.bot-(paddingSize+edgeSize);
            
                // any stains
            
            if (this.genRandom.randomPercentage(0.50)) {
                streakWid=this.genRandom.randomInBetween(Math.trunc((rgt-lft)*0.5),Math.trunc((rgt-lft)*0.8));
                if (streakWid>5) {
                    sx=this.genRandom.randomInt(lft,((rgt-lft)-streakWid));
                    ex=sx+streakWid;
                    this.drawStreakDirt(bitmapCTX,sx,top,ex,bot,true,2,0.6,dirtColor);
                }
            }
            
                // and blur it
                
            this.blur(bitmapCTX,lft,top,rgt,bot,4);
            
                // add cracks (after any blurs)
            
            if ((rgt-lft)>(bot-top)) {
                if (this.genRandom.randomPercentage(0.10)) {
                    sx=this.genRandom.randomInBetween((lft+20),(rgt-20));
                    ex=this.genRandom.randomInBetween((lft+20),(rgt-20));

                    lineColor=this.darkenColor(drawBrickColor,0.9);
                    this.drawRandomLine(bitmapCTX,normalCTX,sx,top,ex,bot,20,lineColor,false);
                }
            }
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,10.0,0.4);
    }

        //
        // stone bitmaps
        //

    generateStone(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,k,rect,edgeSize;
        var drawStoneColor,drawEdgeColor,lineColor,darken,f;
        var x,y,x2,y2,lineCount,stoneWid,stoneHigh;

            // some random values

        var groutColor=this.getRandomColor();
        var stoneColor=this.getRandomColor();
        var edgeColor=this.darkenColor(stoneColor,0.8);
        
        var padding=this.genRandom.randomInt(3,5);

        var segments=this.createRandomSegments(wid,high);
        var darkenFactor=0.5;

            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,groutColor);
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);
        this.blur(bitmapCTX,0,0,wid,high,5);

        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // draw the stones

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];

            f=1.0;
            if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=wid) && (rect.bot<=high)) {        // don't darken stones that fall off edges
                f=this.genRandom.random()+darkenFactor;
                if (f>1.0) f=1.0;
            }

            drawStoneColor=this.darkenColor(stoneColor,f);
            drawEdgeColor=this.darkenColor(edgeColor,f);

            edgeSize=this.genRandom.randomInt(5,12);     // new edge size as stones aren't the same

            this.draw3DComplexRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-padding),(rect.bot-padding),edgeSize,drawStoneColor,drawEdgeColor);
            this.blur(bitmapCTX,(rect.lft+edgeSize),(rect.top+edgeSize),(rect.rgt-(padding+edgeSize)),(rect.bot-(padding+edgeSize)),4);
            
                // cracked lines
                
            stoneWid=(rect.rgt-rect.lft)-((edgeSize*2)+padding);
            stoneHigh=(rect.bot-rect.top)-((edgeSize*2)+padding);
            lineCount=this.genRandom.randomInt(5,10);
            
            for (k=0;k!==lineCount;k++) {
                x=this.genRandom.randomInt((rect.lft+edgeSize),stoneWid);
                y=this.genRandom.randomInt((rect.top+edgeSize),stoneHigh);
                x2=this.genRandom.randomInt((rect.lft+edgeSize),stoneWid);
                y2=this.genRandom.randomInt((rect.top+edgeSize),stoneHigh);
                
                darken=0.9+(this.genRandom.random()*0.1);
                lineColor=this.darkenColor(drawStoneColor,darken);
                this.drawRandomLine(bitmapCTX,normalCTX,x,y,x2,y2,20,lineColor,false);
            }
            
                // redo the fill, but just do the edges so we
                // erase any lines that went over
                
            this.draw3DComplexRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-padding),(rect.bot-padding),edgeSize,null,drawEdgeColor);
            
                 // any random noise
                
            this.addNoiseRect(bitmapCTX,rect.lft,rect.top,rect.rgt,rect.bot,0.8,1.0,0.4);
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,10.0,0.5);
    }
    
        //
        // block bitmaps
        //

    generateBlock(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,nBlock,flip;
        var top,bot,ySize,slopeHigh,concreteColor;
        var sx,ex,streakWid;
        
        var concreteColor=this.getRandomColor();
        var concreteColor2=this.darkenColor(concreteColor,0.8);
        var dirtColor=this.darkenColor(concreteColor,0.5);
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // block sizes
            
        nBlock=2+(this.genRandom.randomInt(0,2)*2);
        ySize=high/nBlock;
        
            // the blocks
        
        top=0;
        
        for (n=0;n!==nBlock;n++) {
            
            flip=((n%2)!==0);
            bot=top+Math.trunc(ySize);
               
               // concrete background
               
            this.drawRect(bitmapCTX,0,top,wid,bot,(flip?concreteColor:concreteColor2));
            
                // slopes
            
            slopeHigh=0;
            if (flip) {
                slopeHigh=this.genRandom.randomInt(10,Math.trunc(ySize/6));
                this.drawSlope(bitmapCTX,normalCTX,0,top,wid,(top+slopeHigh),concreteColor,true);
                this.drawSlope(bitmapCTX,normalCTX,0,(bot-slopeHigh),wid,bot,concreteColor,false);
            }
            
                // and random conrete noise

            this.addNoiseRect(bitmapCTX,0,top,wid,bot,0.6,0.8,0.8);
            this.blur(bitmapCTX,0,top,wid,bot,3);

            this.addNoiseRect(bitmapCTX,0,top,wid,bot,0.8,0.9,0.7);
            this.blur(bitmapCTX,0,top,wid,bot,3);

                // final noise has the streak in it
                
            this.addNoiseRect(bitmapCTX,0,top,wid,bot,1.0,1.2,0.6);
            
            streakWid=this.genRandom.randomInBetween(Math.trunc(wid/2),(wid-20));
            sx=this.genRandom.randomInt(0,(wid-streakWid));
            ex=sx+streakWid;

            this.drawStreakDirt(bitmapCTX,sx,top,ex,(top+slopeHigh),false,4,0.8,dirtColor);    
            this.drawStreakDirt(bitmapCTX,sx,(top+slopeHigh),ex,(bot-slopeHigh),true,8,0.8,dirtColor);

            this.blur(bitmapCTX,0,top,wid,bot,3);
           
            top=bot;
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,5.0,0.5);
    }
    
        //
        // tile bitmaps
        //
        
    generateTilePieceCrack(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeMargin,tileColor)
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

        lineColor=this.darkenColor(tileColor,0.9);
        this.drawRandomLine(bitmapCTX,normalCTX,sx,sy,ex,ey,20,lineColor,false);
    }

    generateTileInner(bitmapCTX,normalCTX,lft,top,rgt,bot,tileColor,tileStyle,splitCount,edgeSize,paddingSize,complex)
    {
        var x,y,dLft,dTop,dRgt,dBot,tileWid,tileHigh;
        var col,padding;
        var borderColor=new wsColor(0.0,0.0,0.0);

            // tile style

        tileStyle=this.genRandom.randomIndex(3);

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

                if ((complex) && (this.genRandom.randomPercentage(0.25))) {
                    tileStyle=this.genRandom.randomIndex(3);
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
                    
                    switch (this.genRandom.randomIndex(3)) {
                        case 1:
                            this.drawOval(bitmapCTX,(dLft+padding),(dTop+padding),(dRgt-padding),(dBot-padding),col,borderColor);
                            break;
                        case 2:
                            this.drawDiamond(bitmapCTX,(dLft+padding),(dTop+padding),(dRgt-padding),(dBot-padding),col,borderColor);
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
        var splitCount,tileStyle,groutColor;
        var tileColor=[];
        
        var complex=this.genRandom.randomPercentage(0.5);
        var small=false;
        if (!complex) small=this.genRandom.randomPercentage(0.5);

            // some random values

        if (!small) {
            splitCount=this.genRandom.randomInt(2,2);
            tileColor[0]=this.getRandomColor();
        }
        else {
            splitCount=this.genRandom.randomInt(6,4);
            tileColor[0]=this.getRandomColor();
            
        }
        
        tileStyle=this.genRandom.randomIndex(3);
        tileColor[1]=this.darkenColor(tileColor[0],0.85);

            // clear canvas

        groutColor=this.getRandomColor();
        this.drawRect(bitmapCTX,0,0,wid,high,groutColor);
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);
        this.blur(bitmapCTX,0,0,wid,high,5);
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // original splits

        this.generateTileInner(bitmapCTX,normalCTX,0,0,wid,high,tileColor,tileStyle,splitCount,(small?2:5),(small?3:0),complex);

            // tile noise

        this.addNoiseRect(bitmapCTX,0,0,wid,high,1.1,1.3,0.2);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,10.0,0.4);
    }
    
        //
        // hexagonal
        //
        
    generateHexagonal(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var splitCount,tileStyle,groutColor;
        var color,edgeColor,edgeSize;
        var xCount,yCount,xSize,ySize;
        var x,y,lft,top;

            // colors
            
        color=this.getRandomColor();
        edgeColor=this.darkenColor(color,0.8);
        
            // sizing
        
        edgeSize=this.genRandom.randomInt(2,3);
        xCount=2+(2*this.genRandom.randomInt(0,2));
        yCount=2+(2*this.genRandom.randomInt(0,5));
        
        xSize=Math.trunc(wid/xCount);
        ySize=Math.trunc(high/yCount);
        
        top=-Math.trunc(ySize/2);
        
        for (y=0;y<=(yCount*2);y++) {
            
            lft=((y%2)==0)?0:xSize;
            
            for (x=0;x<=xCount;x+=2) {
                this.draw3DHexagon(bitmapCTX,normalCTX,wid,high,lft,top,Math.trunc(lft+xSize),Math.trunc(top+ySize),edgeSize,color,edgeColor);
                lft+=(xSize*2);
            }
            
            top+=(ySize/2);
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,5.0,0.6);
    }

        //
        // metal bitmaps
        //
    
    generateMetalScrews(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,metalColor,screwSize)
    {
        var screwColor=this.darkenColor(metalColor,0.9);
        var borderColor=new wsColor(0.0,0.0,0.0);
        
        var screenFlatInnerSize=Math.trunc(screwSize*0.4);
        
        var offset=edgeSize+4;
        
            // corner screws
            
        if (this.genRandom.randomPercentage(0.5)) this.draw3DOval(bitmapCTX,normalCTX,(lft+offset),(top+offset),((lft+offset)+screwSize),((top+offset)+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,borderColor);
        if (this.genRandom.randomPercentage(0.5)) this.draw3DOval(bitmapCTX,normalCTX,(lft+offset),((bot-offset)-screwSize),((lft+offset)+screwSize),(bot-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,borderColor);
        if (this.genRandom.randomPercentage(0.5)) this.draw3DOval(bitmapCTX,normalCTX,((rgt-offset)-screwSize),(top+offset),(rgt-offset),((top+offset)+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,borderColor);
        if (this.genRandom.randomPercentage(0.5)) this.draw3DOval(bitmapCTX,normalCTX,((rgt-offset)-screwSize),((bot-offset)-screwSize),(rgt-offset),(bot-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,borderColor);
    }
    
    generateMetalPiecePlate(bitmapCTX,normalCTX,high,wid,lft,top,rgt,bot,edgeSize,metalColor)
    {
        var n,x,streakWid;
        var streakColor,darken;
        var screwX;
        
        var palteWid=rgt-lft;
        var plateHigh=bot-top;
        
        var streakCount=this.genRandom.randomInt(15,10);
        var screwColor=this.boostColor(metalColor,0.05);
        
            // the plate
            
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,metalColor,true);
        
            // streaks
            
        for (n=0;n!==streakCount;n++) {
            streakWid=this.genRandom.randomInt(10,40);
            x=edgeSize+this.genRandom.randomInBetween(streakWid,((palteWid-streakWid)-(edgeSize*2)));

            darken=0.5+(this.genRandom.random()*0.5);
            streakColor=this.darkenColor(metalColor,darken);

            this.drawStreakMetal(bitmapCTX,wid,high,(lft+x),(top+edgeSize),((top+plateHigh)-edgeSize),streakWid,streakColor);
        }
    }
    
    generateMetalPieceCorrugated(bitmapCTX,normalCTX,specularCTX,wid,high,lft,top,rgt,bot,edgeSize,metalColor)
    {
        var x,y;
        var dx,dy,sx,sy,ex,ey;
        var idx,line,lineStyle;
        var lines=[];
        
        var pieceWid=rgt-lft;
        var pieceHigh=bot-top;
        
            // some random values

        var metalCorrColor=this.darkenColor(metalColor,0.6);
        
        var corrCount=this.genRandom.randomInt(5,10);
        var corrWid=Math.trunc((pieceWid-(edgeSize*2))/corrCount);
        var corrHigh=Math.trunc((pieceHigh-(edgeSize*2))/corrCount);

        var lineWid=corrWid-4;
        var lineHigh=corrHigh-4;
        
            // corrugated styles
            
        lines.push([[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]]]);      // diamonds
        lines.push([[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]]]);      // waves
        lines.push([[[0.5,0.0],[0.5,1.0]],[[0.0,0.5],[1.0,0.5]],[[0.0,0.5],[1.0,0.5]],[[0.5,0.0],[0.5,1.0]]]);      // pluses

        lineStyle=this.genRandom.randomIndex(lines.length);

            // outside box

        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,metalColor,false);
        
            // corrugations

        dy=top+Math.trunc((pieceHigh-(corrHigh*corrCount))*0.5);

        for (y=0;y!==corrCount;y++) {

            dx=lft+Math.trunc((pieceWid-(corrWid*corrCount))*0.5);

            for (x=0;x!==corrCount;x++) {
                
                idx=((y&0x1)*2)+(x&0x1);
                line=lines[lineStyle][idx];

                sx=dx+(line[0][0]*lineWid);
                sy=dy+(line[0][1]*lineHigh);
                ex=dx+(line[1][0]*lineWid);
                ey=dy+(line[1][1]*lineHigh);

                this.drawBumpLine(bitmapCTX,normalCTX,sx,sy,ex,ey,metalCorrColor);

                dx+=corrWid;
            }

            dy+=corrHigh;
        }
    }
    
    generateMetalPieceShutter(bitmapCTX,normalCTX,specularCTX,wid,high,lft,top,rgt,bot,edgeSize,metalColor,shutterColor)
    {
        var n,nShutter,shutterSize;
        var y,yAdd;
        
        var shutterEdgeColor=this.darkenColor(shutterColor,0.9);
        var barEdgeSize=this.genRandom.randomInt(5,5);
        
        var frameXSize=this.genRandom.randomInt(10,30);
        var frameYSize=this.genRandom.randomInt(10,30);
        
            // outer and inner plate
            
        this.generateMetalPiecePlate(bitmapCTX,normalCTX,high,wid,lft,top,rgt,bot,edgeSize,metalColor,0,0,0);
        
        lft+=frameXSize;
        top+=frameYSize;
        rgt-=frameXSize;
        bot-=frameYSize;
        
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,shutterColor,false);
        
        lft+=edgeSize;
        top+=edgeSize;
        rgt-=edgeSize;
        bot-=edgeSize;
        
            // the shutters
            
        nShutter=this.genRandom.randomInt(4,10);
        
        yAdd=(bot-top)/nShutter;
        y=top;
        
        shutterSize=this.genRandom.randomInt(10,Math.trunc(yAdd*0.25));
        
        for (n=0;n!==nShutter;n++) {
            this.drawSlope(bitmapCTX,normalCTX,lft,y,rgt,(y+shutterSize),shutterEdgeColor,false);
            y+=yAdd;
        }
    }
    
    generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high,hasBar)
    {
        var x,mx,my,sz,lft,rgt,top,bot;

            // some random values

        var metalColor=this.getRandomColor();
        var shutterColor=this.getRandomColor();

        var metalEdgeSize=this.genRandom.randomInt(4,4);
        var screwSize=this.genRandom.randomInt(10,20);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // we don't want pieces to small,
            // so here's a wid/high that if we cross,
            // move to full width/height
            
        var forceWid=Math.trunc(wid*0.8);
        var forceHigh=Math.trunc(high*0.8);
        
            // draw the chunks of the metal
        
        mx=0;
        my=0;
        
        while (true) {
            
            lft=mx;
            top=my;
            sz=this.genRandom.randomInt(100,50);
            
                // vertical stack
                
            if (this.genRandom.randomPercentage(0.5)) {
                rgt=lft+sz;
                if (rgt>forceWid) rgt=wid;
                bot=high;
                
                mx=rgt;
            }
            
                // horizontal stack
                
            else {
                bot=top+sz;
                if (bot>forceHigh) bot=high;
                rgt=wid;
                
                my=bot;
            }
            
                // draw the segment
            
            switch (this.genRandom.randomIndex(3)) {
                case 0:
                    this.generateMetalPiecePlate(bitmapCTX,normalCTX,wid,high,lft,top,rgt,bot,metalEdgeSize,metalColor);
                    this.generateMetalScrews(bitmapCTX,normalCTX,lft,top,rgt,bot,metalEdgeSize,metalColor,screwSize);
                    break;
                case 1:
                    this.generateMetalPieceCorrugated(bitmapCTX,normalCTX,specularCTX,wid,high,lft,top,rgt,bot,metalEdgeSize,metalColor);
                    break;
                case 2:
                    this.generateMetalPieceShutter(bitmapCTX,normalCTX,specularCTX,wid,high,lft,top,rgt,bot,metalEdgeSize,metalColor,shutterColor);
                    this.generateMetalScrews(bitmapCTX,normalCTX,lft,top,rgt,bot,metalEdgeSize,metalColor,screwSize);
                    break;
            }
            
                // are we finished?
                
            if ((mx>=wid) || (my>=high)) break;
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,5.0,0.6);
    }
    
        //
        // cement bitmaps
        //

    generateCement(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,nLine,markCount,x,y,y2;
        var particleWid,particleHigh,particleDensity;
        var edgeSize,concreteColor,lineColor,line2Color;

            // some random values

        concreteColor=this.getRandomColor();
        lineColor=this.darkenColor(concreteColor,0.95);
        line2Color=this.boostColor(concreteColor,0.05);

            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // random edging
            
        if (this.genRandom.randomPercentage(0.5)) {
            edgeSize=this.genRandom.randomInt(5,5);
            this.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,edgeSize,concreteColor,true);
        }
        else {
            edgeSize=0;
            this.drawRect(bitmapCTX,0,0,wid,high,concreteColor);
        }
        
            // the stress lines
        
        nLine=this.genRandom.randomInt(100,100);
        
        for (n=0;n!==nLine;n++) {
            x=this.genRandom.randomInBetween((edgeSize+3),(wid-(edgeSize+3)));
            
            y=this.genRandom.randomInBetween((edgeSize+3),Math.trunc(high/2));
            y2=y+this.genRandom.randomInt(20,Math.trunc((high/2)-(edgeSize+23)));
            
            if ((n%2)===0) {
                y=high-y;
                y2=high-y2;
            }
            
            this.drawLine(bitmapCTX,normalCTX,x,y,x,y2,(((n%2)===0)?lineColor:line2Color),true);
        }
        
            // marks

        var markCount=this.genRandom.randomInt(5,20);
        
        for (n=0;n!==markCount;n++) {
            particleWid=this.genRandom.randomInt(100,100);
            particleHigh=this.genRandom.randomInt(100,100);
            particleDensity=this.genRandom.randomInt(250,150);

            x=this.genRandom.randomInt(edgeSize,((wid-particleWid)-(edgeSize*2)));
            y=this.genRandom.randomInt(edgeSize,((high-particleHigh)-(edgeSize*2)));

            this.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.9,particleDensity,false);
        }

            // noise
            
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.8);
        this.blur(bitmapCTX,0,0,wid,high,3);
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.8,0.9,0.7);
        this.blur(bitmapCTX,0,0,wid,high,3);
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,1.0,1.2,0.6);
        this.blur(bitmapCTX,0,0,wid,high,3);
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,5.0,0.4);
    }
    
        //
        // plaster bitmaps
        //

    generatePlaster(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,x;
        var lineColor,darken,boost;

            // some random values

        var plasterColor=this.getRandomColor();
        var lineColorBase=this.getRandomColor();
        var lineCount=this.genRandom.randomInt(40,30);

            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,plasterColor);
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // lines
            
        for (n=0;n!==lineCount;n++) {
            x=this.genRandom.randomInt(0,wid);
            
            darken=0.85+(this.genRandom.random()*0.1);
            lineColor=this.darkenColor(lineColorBase,darken);
            
            this.drawRandomLine(bitmapCTX,normalCTX,x,0,x,high,30,lineColor,false);
        }
        
        for (n=0;n!==lineCount;n++) {
            x=this.genRandom.randomInt(0,wid);
            
            boost=0.05+(this.genRandom.random()*0.1);
            lineColor=this.boostColor(lineColorBase,boost);
            
            this.drawRandomLine(bitmapCTX,normalCTX,x,0,x,high,30,lineColor,false);
        }
        
            // plaster noise
            
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.8);
        this.blur(bitmapCTX,0,0,wid,high,5);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,10.0,0.4);
    }
    
        //
        // mosaic bitmaps
        //

    generateMosaic(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var x,y,lft,rgt,top,bot,tileWid,tileHigh;
        var splitCount,borderSize,edgeSize;
        var mortarColor,borderColor,col;
        
            // some random values

        splitCount=this.genRandom.randomInt(5,5);
        borderSize=this.genRandom.randomInt(2,3);
        edgeSize=this.genRandom.randomInt(1,2);
        
        mortarColor=this.getRandomColor();
        borderColor=this.getRandomColor();
        
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
                    col=this.getRandomColor();
                }

                rgt=(lft+tileWid)-borderSize;

                this.draw3DRect(bitmapCTX,normalCTX,Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),edgeSize,col,true);
                
                    // noise and blur
                
                this.addNoiseRect(bitmapCTX,Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),1.1,1.3,0.5);
                this.blur(bitmapCTX,Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),3);
                
                    // any cracks
                    
                this.generateTilePieceCrack(bitmapCTX,normalCTX,Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),edgeSize,col);

                lft+=tileWid;
            }
            
            top+=tileHigh;
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,5.0,0.5);
    }

        //
        // wood bitmaps
        //

    generateWood(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,k,lft,rgt,top,bot;
        var halfSize,boardSplit,boardHigh,woodFactor;
        
            // some random values

        var boardCount=this.genRandom.randomInt(4,8);
        var boardSize=Math.trunc(wid/boardCount);
        var edgeSize=this.genRandom.randomInt(3,3);
        var woodColor=this.getRandomColor();
        var col;

            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // regular wood planking

        lft=0;

        for (n=0;n!==boardCount;n++) {
            rgt=lft+boardSize;
            if (n===(boardCount-1)) rgt=wid;
            
            boardSplit=this.genRandom.randomInt(1,3);
            boardHigh=Math.trunc(high/boardSplit);
            
            top=0;
            
            for (k=0;k!=boardSplit;k++) {
                bot=top+boardHigh;
                if (k===(boardSplit-1)) bot=high;
                
                woodFactor=0.8+(this.genRandom.random()*0.2);
                col=this.darkenColor(woodColor,woodFactor);

                this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,col,true);
                this.drawColorStripeVertical(bitmapCTX,normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
                this.addNoiseRect(bitmapCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.9,0.95,0.8);
                
                top=bot;
            }
            
            lft=rgt;
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,5.0,0.4);
    }
    
        //
        // machine
        //
    
    generateMachineComponent(bitmapCTX,normalCTX,lft,top,rgt,bot,metalInsideColor)
    {
        var x,y,xCount,yCount,xOff,yOff,dx,dy,wid;
        var color,panelType;
        var n,nShutter,shutterSize,yAdd,shutterColor,shutterEdgeColor;
        var borderColor=new wsColor(0.0,0.0,0.0);
        
            // the plate of the component
            
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,5,metalInsideColor,false);
        
            // panel looks
        
        panelType=this.genRandom.randomIndex(4);
        if (panelType===0) return;          // 0 = none
        
            // shutter panels
            
        if (panelType===3) {
            lft+=5;
            rgt-=5;
            top+=5;
            bot-=5;
            
            shutterColor=this.getRandomColor();
            shutterEdgeColor=this.darkenColor(shutterColor,0.9);
            
            this.drawRect(bitmapCTX,lft,top,rgt,bot,shutterColor);
            
            nShutter=Math.trunc((bot-top)/30);

            yAdd=(bot-top)/nShutter;
            y=top+Math.trunc(yAdd/2);
            
            shutterSize=this.genRandom.randomInt(5,Math.trunc(yAdd*0.2));

            for (n=0;n!==nShutter;n++) {
                this.drawSlope(bitmapCTX,normalCTX,lft,y,rgt,(y+shutterSize),shutterEdgeColor,false);
                y+=yAdd;
            }
            
            return;
        }
        
            // circle or square lights
        
        wid=this.genRandom.randomInt(30,25);
        
        xCount=Math.trunc((rgt-lft)/wid)-1;
        yCount=Math.trunc((bot-top)/wid)-1;
        
        if ((xCount<=0) || (yCount<=0)) return;
        if (xCount>10) xCount=10;
        if (yCount>10) yCount=10;
        
        xOff=(lft+2)+Math.trunc(((rgt-lft)-(xCount*wid))/2);
        yOff=(top+2)+Math.trunc(((bot-top)-(yCount*wid))/2);
        
        for (y=0;y!==yCount;y++) {
            dy=yOff+(y*wid);
            
            for (x=0;x!==xCount;x++) {
                dx=xOff+(x*wid);
                color=this.getRandomColor();
                
                if (panelType===1) {
                    this.draw3DOval(bitmapCTX,normalCTX,dx,dy,(dx+(wid-5)),(dy+(wid-5)),0.0,1.0,3,0,color,borderColor);
                }
                else {
                    this.draw3DRect(bitmapCTX,normalCTX,dx,dy,(dx+wid),(dy+wid),2,color,false);
                }
            }
        }
    }
    
    generateMachine(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var mx,my,sz,lft,top,rgt,bot;
        
        var metalColor=this.getRandomColor();
        var metalInsideColor=this.boostColor(metalColor,0.1);
       
            // face plate
            
        this.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,8,metalColor,true);
        
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
            
            this.generateMachineComponent(bitmapCTX,normalCTX,lft,top,rgt,bot,metalInsideColor);
            
                // are we finished?
                
            if ((mx>=(wid-15)) || (my>=(high-15))) break;
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,5.0,0.4);
    }

        //
        // UV tester
        //
        
    generateUVTest(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        this.drawUVTest(bitmapCTX,0,0,wid,high);
        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,10.0,0.5);
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

            case this.TYPE_BRICK:
                this.generateBrick(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;

            case this.TYPE_STONE:
                this.generateStone(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;
                
            case this.TYPE_BLOCK:
                this.generateBlock(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;

            case this.TYPE_TILE:
                this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=8.0;
                break;

            case this.TYPE_HEXAGONAL:
                this.generateHexagonal(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;

            case this.TYPE_METAL:
                this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high,false);
                shineFactor=15.0;
                break;
                
            case this.TYPE_CEMENT:
                this.generateCement(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;
                
            case this.TYPE_PLASTER:
                this.generatePlaster(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;
                
            case this.TYPE_MOSAIC:
                this.generateMosaic(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;

            case this.TYPE_WOOD:
                this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=2.0;
                break;

            case this.TYPE_MACHINE:
                this.generateMachine(bitmapCTX,normalCTX,specularCTX,wid,high);
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
    
    generateRandom()
    {
        return(generate(this.genRandom.randomIndex(this.TYPE_NAMES.length),false));
    }

}
