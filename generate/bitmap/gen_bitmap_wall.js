/* global genRandom */

"use strict";

//
// generate wall bitmap class
//

class GenBitmapWallClass extends GenBitmapClass
{
    constructor()
    {
        super();
        
            // types
            
        this.TYPE_BRICK=0;
        this.TYPE_STONE=1;
        this.TYPE_BLOCK=2;
        this.TYPE_SCIFI=3;
        this.TYPE_PLASTER=4;

        this.TYPE_NAMES=
                [
                    'Brick','Stone','Block','SciFi',
                    'Plaster'
                ];
        
        Object.seal(this);
    }
    
        //
        // brick/rock bitmaps
        //

    generateBrick(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,rect,segments;
        let drawBrickColor,f;
        let lft,rgt,top,bot;
        let sx,ex,streakWid,lineColor;
        
        let edgeSize=genRandom.randomInt(3,7);
        let paddingSize=genRandom.randomInt(2,10);
        
        let brickColor=this.getDefaultPrimaryColor();
        let groutColor=this.dullColor(brickColor,0.7);
        let dirtColor=this.darkenColor(brickColor,0.5);
        
        if (genRandom.randomPercentage(0.5)) {
            segments=this.createStackedSegments(wid,high);
        }
        else {
            segments=this.createRandomSegments(wid,high);
        }

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
                f=0.6+(genRandom.random()*0.4);
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
            
                // add cracks (after any blurs)
            
            if ((rgt-lft)>(bot-top)) {
                if (genRandom.randomPercentage(0.10)) {
                    sx=genRandom.randomInBetween((lft+20),(rgt-20));
                    ex=genRandom.randomInBetween((lft+20),(rgt-20));

                    lineColor=this.darkenColor(drawBrickColor,0.9);
                    this.drawRandomLine(bitmapCTX,normalCTX,sx,top,ex,bot,20,lineColor,false);
                }
            }
            
                // any stains
            
            if (genRandom.randomPercentage(0.50)) {
                streakWid=genRandom.randomInBetween(Math.trunc((rgt-lft)*0.5),Math.trunc((rgt-lft)*0.8));
                if (streakWid>5) {
                    sx=genRandom.randomInt(lft,((rgt-lft)-streakWid));
                    ex=sx+streakWid;
                    this.drawStreakDirt(bitmapCTX,sx,top,ex,bot,5,2,0.6,dirtColor);
                }
            }
            
                // and blur it
                
            this.blur(bitmapCTX,lft,top,rgt,bot,4,false);
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);
    }

        //
        // stone bitmaps
        //

    generateStone(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,k,rect,edgeSize;
        let drawStoneColor,drawEdgeColor,lineColor,darken,f;
        let x,y,x2,y2,lineCount,lineVarient,stoneWid,stoneHigh;

            // some random values

        let stoneColor=this.getDefaultPrimaryColor();
        let groutColor=this.dullColor(stoneColor,0.7);
        let edgeColor=this.darkenColor(stoneColor,0.8);
        
        let padding=genRandom.randomInt(3,10);

        let segments=this.createRandomSegments(wid,high);
        let darkenFactor=0.5;

            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,groutColor);
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);
        this.blur(bitmapCTX,0,0,wid,high,5,false);

        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // draw the stones

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];

            f=1.0;
            if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=wid) && (rect.bot<=high)) {        // don't darken stones that fall off edges
                f=genRandom.random()+darkenFactor;
                if (f>1.0) f=1.0;
            }

            drawStoneColor=this.darkenColor(stoneColor,f);
            drawEdgeColor=this.darkenColor(edgeColor,f);

            edgeSize=genRandom.randomInt(5,12);     // new edge size as stones aren't the same

            this.draw3DComplexRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-padding),(rect.bot-padding),edgeSize,drawStoneColor,drawEdgeColor);
            this.blur(bitmapCTX,(rect.lft+edgeSize),(rect.top+edgeSize),(rect.rgt-(padding+edgeSize)),(rect.bot-(padding+edgeSize)),4,false);
            
                // cracked lines
                
            stoneWid=(rect.rgt-rect.lft)-((edgeSize*2)+padding);
            stoneHigh=(rect.bot-rect.top)-((edgeSize*2)+padding);
            lineCount=genRandom.randomInt(5,10);
            
            for (k=0;k!==lineCount;k++) {
                x=genRandom.randomInt((rect.lft+edgeSize),stoneWid);
                y=genRandom.randomInt((rect.top+edgeSize),stoneHigh);
                x2=genRandom.randomInt((rect.lft+edgeSize),stoneWid);
                y2=genRandom.randomInt((rect.top+edgeSize),stoneHigh);
                
                lineVarient=20;
                if (lineVarient>stoneWid) lineVarient=stoneWid;
                if (lineVarient>stoneHigh) lineVarient=stoneHigh;
                
                darken=0.9+(genRandom.random()*0.1);
                lineColor=this.darkenColor(drawStoneColor,darken);
                this.drawRandomLine(bitmapCTX,normalCTX,x,y,x2,y2,lineVarient,lineColor,false);
            }
            
                // redo the fill, but just do the edges so we
                // erase any lines that went over
                
            this.draw3DComplexRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-padding),(rect.bot-padding),edgeSize,null,drawEdgeColor);
            
                 // any random noise
                
            this.addNoiseRect(bitmapCTX,rect.lft,rect.top,rect.rgt,rect.bot,0.8,1.0,0.4);
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    }
    
        //
        // block bitmaps
        //

    generateBlock(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,nBlock,flip;
        let top,bot,ySize,slopeHigh;
        let sx,ex,streakWid;
        
        let concreteColor=this.getDefaultPrimaryColor();
        let concreteColor2=this.darkenColor(concreteColor,0.8);
        let dirtColor=this.darkenColor(concreteColor,0.5);
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // block sizes
            
        nBlock=2+(genRandom.randomInt(0,2)*2);
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
                slopeHigh=genRandom.randomInt(10,Math.trunc(ySize/6));
                this.drawSlope(bitmapCTX,normalCTX,0,top,wid,(top+slopeHigh),concreteColor,true);
                this.drawSlope(bitmapCTX,normalCTX,0,(bot-slopeHigh),wid,bot,concreteColor,false);
            }
            
                // and random conrete noise

            this.addNoiseRect(bitmapCTX,0,top,wid,bot,0.6,0.8,0.8);
            this.blur(bitmapCTX,0,top,wid,bot,3,false);

            this.addNoiseRect(bitmapCTX,0,top,wid,bot,0.8,0.9,0.7);
            this.blur(bitmapCTX,0,top,wid,bot,3,false);

                // final noise has the streak in it
                
            this.addNoiseRect(bitmapCTX,0,top,wid,bot,1.0,1.2,0.6);
            
            streakWid=genRandom.randomInBetween(Math.trunc(wid/2),(wid-20));
            sx=genRandom.randomInt(0,(wid-streakWid));
            ex=sx+streakWid;

            this.drawStreakDirt(bitmapCTX,sx,top,ex,(top+slopeHigh),0,4,0.8,dirtColor);    
            this.drawStreakDirt(bitmapCTX,sx,(top+slopeHigh),ex,(bot-slopeHigh),5,8,0.8,dirtColor);

            this.blur(bitmapCTX,0,top,wid,bot,3,false);
           
            top=bot;
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    }
    
        //
        // scifi bitmaps
        //
    
    generateSciFiPiecePlate(bitmapCTX,normalCTX,high,wid,lft,top,rgt,bot,edgeSize,metalColor)
    {
        let n,x,streakWid;
        let streakColor,darken;
        
        let palteWid=rgt-lft;
        let plateHigh=bot-top;
        
        let streakCount=genRandom.randomInt(15,10);
        
            // the plate
            
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,metalColor,true);
        
            // streaks
            
        for (n=0;n!==streakCount;n++) {
            streakWid=genRandom.randomInt(10,40);
            x=edgeSize+genRandom.randomInBetween(streakWid,((palteWid-streakWid)-(edgeSize*2)));

            darken=0.5+(genRandom.random()*0.5);
            streakColor=this.darkenColor(metalColor,darken);

            this.drawStreakMetal(bitmapCTX,wid,high,(lft+x),(top+edgeSize),((top+plateHigh)-edgeSize),streakWid,streakColor);
        }
    }
    
    generateSciFiPieceScrews(bitmapCTX,normalCTX,specularCTX,wid,high,lft,top,rgt,bot,edgeSize,metalColor)
    {
        let n,x,y,xAdd,yAdd,offset,screwCount;
        let lineWid,lineHigh;
        
        let screwSize=genRandom.randomInt(10,20);
        let screenFlatInnerSize=Math.trunc(screwSize*0.4);

        let screwColor=this.darkenColor(metalColor,0.9);
        
            // the plate
            
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,metalColor,true);
        
            // in a line
            
        if (genRandom.randomPercentage(0.5)) {
            
            lineWid=rgt-lft;
            lineHigh=bot-top;
            
            screwCount=genRandom.randomInt(2,4);
            
            if (lineWid>lineHigh) {
                y=top+Math.trunc(((top+bot)*0.5)-(screwSize*0.5));
                
                xAdd=Math.trunc(lineWid/screwCount);
                x=lft+Math.trunc((xAdd*0.5)-(screwSize*0.5));
                
                for (n=0;n!==screwCount;n++) {
                    this.draw3DOval(bitmapCTX,normalCTX,x,y,(x+screwSize),(y+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
                    x+=xAdd;
                }
            }
            else {
                x=lft+Math.trunc(((lft+rgt)*0.5)-(screwSize*0.5));
                
                yAdd=Math.trunc(lineHigh/screwCount);
                y=top+Math.trunc((yAdd*0.5)-(screwSize*0.5));
                
                for (n=0;n!==screwCount;n++) {
                    this.draw3DOval(bitmapCTX,normalCTX,x,y,(x+screwSize),(y+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
                    y+=yAdd;
                }
            }
         }
        
            // corners
            
        else {
            offset=edgeSize+4;

            this.draw3DOval(bitmapCTX,normalCTX,(lft+offset),(top+offset),((lft+offset)+screwSize),((top+offset)+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,(lft+offset),((bot-offset)-screwSize),((lft+offset)+screwSize),(bot-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,((rgt-offset)-screwSize),(top+offset),(rgt-offset),((top+offset)+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,((rgt-offset)-screwSize),((bot-offset)-screwSize),(rgt-offset),(bot-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
        }
    }
    
    generateSciFiPieceShutter(bitmapCTX,normalCTX,specularCTX,wid,high,lft,top,rgt,bot,edgeSize,metalColor,shutterColor)
    {
        let n,nShutter,shutterSize;
        let y,yAdd;
        
        let shutterEdgeColor=this.darkenColor(shutterColor,0.9);
        
        let frameXSize=genRandom.randomInt(10,30);
        let frameYSize=genRandom.randomInt(10,30);
        
            // outer and inner plate
            
        this.generateSciFiPiecePlate(bitmapCTX,normalCTX,high,wid,lft,top,rgt,bot,edgeSize,metalColor,0,0,0);
        
        lft+=frameXSize;
        top+=frameYSize;
        rgt-=frameXSize;
        bot-=frameYSize;
        
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,shutterColor,true);
        
        lft+=edgeSize;
        top+=edgeSize;
        rgt-=edgeSize;
        bot-=edgeSize;
        
            // the shutters
            
        nShutter=genRandom.randomInt(4,10);
        
        yAdd=(bot-top)/nShutter;
        y=top;
        
        shutterSize=genRandom.randomInt(10,Math.trunc(yAdd*0.25));
        
        for (n=0;n!==nShutter;n++) {
            this.drawSlope(bitmapCTX,normalCTX,lft,y,rgt,(y+shutterSize),shutterEdgeColor,false);
            y+=yAdd;
        }
    }
    
    generateSciFi(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let mx,my,sz,lft,rgt,top,bot,col,forceWid,forceHigh;

            // some random values

        let metalColor=this.getDefaultPrimaryColor();
        let darkMetalColor=this.darkenColor(metalColor,0.8);
        let shutterColor=this.getRandomColor();

        let metalEdgeSize=genRandom.randomInt(4,4);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // we don't want pieces to small,
            // so here's a wid/high that if we cross,
            // move to full width/height
            
        forceWid=Math.trunc(wid*0.8);
        forceHigh=Math.trunc(high*0.8);
        
            // draw the chunks of the metal
        
        mx=0;
        my=0;
        
        while (true) {
            
            lft=mx;
            top=my;
            sz=genRandom.randomInt(100,50);
            
                // vertical stack
                
            if (genRandom.randomPercentage(0.5)) {
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
            
                // some are darkened
                
            col=(genRandom.randomPercentage(0.75))?metalColor:darkMetalColor;
            
                // draw the segment
            
            switch (genRandom.randomIndex(3)) {
                case 0:
                    this.generateSciFiPiecePlate(bitmapCTX,normalCTX,wid,high,lft,top,rgt,bot,metalEdgeSize,col);
                    break;
                case 1:
                    this.generateSciFiPieceScrews(bitmapCTX,normalCTX,specularCTX,wid,high,lft,top,rgt,bot,metalEdgeSize,col);
                    break;
                case 2:
                    this.generateSciFiPieceShutter(bitmapCTX,normalCTX,specularCTX,wid,high,lft,top,rgt,bot,metalEdgeSize,col,shutterColor);
                    break;
            }
            
                // are we finished?
                
            if ((mx>=wid) || (my>=high)) break;
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.6);
    }
        
        //
        // plaster bitmaps
        //

    generatePlaster(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,x;
        let lineColor,darken,boost;

            // some random values

        let lineColorBase=this.getDefaultPrimaryColor();
        let plasterColor=this.dullColor(lineColorBase,0.8);
        let lineCount=genRandom.randomInt(40,30);

            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,plasterColor);
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // lines
            
        for (n=0;n!==lineCount;n++) {
            x=genRandom.randomInt(0,wid);
            
            darken=0.85+(genRandom.random()*0.1);
            lineColor=this.darkenColor(lineColorBase,darken);
            
            this.drawRandomLine(bitmapCTX,normalCTX,x,0,x,high,30,lineColor,false);
        }
        
        for (n=0;n!==lineCount;n++) {
            x=genRandom.randomInt(0,wid);
            
            boost=0.05+(genRandom.random()*0.1);
            lineColor=this.boostColor(lineColorBase,boost);
            
            this.drawRandomLine(bitmapCTX,normalCTX,x,0,x,high,30,lineColor,false);
        }
        
            // plaster noise
            
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.8);
        this.blur(bitmapCTX,0,0,wid,high,5,false);

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
        let bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX,glowCanvas,glowCTX;

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
        
        glowCanvas=document.createElement('canvas');
        glowCanvas.width=2;
        glowCanvas.height=2;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,2,2);

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

            case this.TYPE_SCIFI:
                this.generateSciFi(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=15.0;
                break;
                
            case this.TYPE_PLASTER:
                this.generatePlaster(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;

        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }
    
    generateRandom(inDebug)
    {
        return(this.generate(genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}
