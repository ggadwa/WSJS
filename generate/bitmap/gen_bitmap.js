"use strict";

//
// constants
// supergumba -- these need to remain outside until
// we get classes and then move these into the class as statics
//

var GEN_BITMAP_TEXTURE_SIZE=512;

var GEN_BITMAP_TYPE_BRICK_STACK=0;
var GEN_BITMAP_TYPE_BRICK_RANDOM=1;
var GEN_BITMAP_TYPE_STONE=2;
var GEN_BITMAP_TYPE_TILE_SIMPLE=3;
var GEN_BITMAP_TYPE_TILE_COMPLEX=4;
var GEN_BITMAP_TYPE_TILE_SMALL=5;
var GEN_BITMAP_TYPE_METAL=6;
var GEN_BITMAP_TYPE_CONCRETE=7;
var GEN_BITMAP_TYPE_MOSAIC=8;
var GEN_BITMAP_TYPE_WOOD_PLANK=9;
var GEN_BITMAP_TYPE_WOOD_BOX=10;
var GEN_BITMAP_TYPE_SKIN=11;

var GEN_BITMAP_TILE_STYLE_BORDER=0;
var GEN_BITMAP_TILE_STYLE_CHECKER=1;
var GEN_BITMAP_TILE_STYLE_STRIPE=2;

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
        var n,rect;
        var drawBrickColor,drawEdgeColor,f;

            // some random values

        var groutColor=this.genBitmapUtility.getRandomGreyColor(0.6,0.7);
        var brickColor=this.genBitmapUtility.getRandomColor([0.3,0.2,0.2],[1.0,0.8,0.8]);
        var edgeColor=this.genBitmapUtility.darkenColor(brickColor,0.8);

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,this.genBitmapUtility.colorToRGBColor(groutColor,1.0));
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
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),darkenFactor,1.0,0.4);
        }

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.8);
    };

        //
        // stone bitmaps
        //

    this.generateStone=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,k,rect,edgeSize;
        var drawStoneColor,drawEdgeColor,f;
        var x,y,x2,y2,lineCount,stoneWid,stoneHigh;

            // some random values

        var groutColor=this.genBitmapUtility.getRandomGreyColor(0.3,0.4);
        var stoneColor=this.genBitmapUtility.getRandomColor([0.5,0.4,0.3],[0.8,0.6,0.6]);
        var edgeColor=this.genBitmapUtility.darkenColor(stoneColor,0.8);

        var segments=this.genBitmapUtility.createRandomSegments(wid,high);
        var darkenFactor=0.5;

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,this.genBitmapUtility.colorToRGBColor(groutColor,1.0));
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
                
                this.genBitmapUtility.drawRandomLine(bitmapCTX,normalCTX,x,y,x2,y2,drawEdgeColor);
            }
            
                 // any random noise
                
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,rect.lft,rect.top,rect.rgt,rect.bot,darkenFactor,1.0,0.4);
        }

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.8);
    };

        //
        // tile bitmaps
        //

    this.generateTileInner=function(bitmapCTX,normalCTX,lft,top,rgt,bot,tileColor,tileStyle,splitCount,edgeSize,complex)
    {
        var x,y,dLft,dTop,dRgt,dBot,tileWid,tileHigh;
        var col;

            // tile style

        tileStyle=this.genRandom.randomInt(0,3);

            // splits

        tileWid=Math.floor((rgt-lft)/splitCount);
        tileHigh=Math.floor((bot-top)/splitCount);

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

                if ((complex) && (this.genRandom.random()<0.25)) {
                    tileStyle=this.genRandom.randomInt(0,3);
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

                this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,edgeSize,col,[0.0,0.0,0.0]);

                    // possible design

                if ((complex) && (this.genRandom.random()<0.25)) {
                    this.genBitmapUtility.draw3DOval(bitmapCTX,normalCTX,(dLft+edgeSize),(dTop+edgeSize),(dRgt-edgeSize),(dBot-edgeSize),5,null,[0.0,0.0,0.0]);
                }
            }
        }
    };

    this.generateTile=function(bitmapCTX,normalCTX,specularCTX,wid,high,complex,small)
    {
            // some random values

        var splitCount,tileStyle;
        var tileColor=[];

        if (!small) {
            splitCount=this.genRandom.randomInt(2,2);
            tileStyle=this.genRandom.randomInt(0,3);
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

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,this.genBitmapUtility.colorToRGBColor(tileColor,1.0));
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // original splits

        this.generateTileInner(bitmapCTX,normalCTX,0,0,wid,high,tileColor,tileStyle,splitCount,(small?2:5),complex);

            // tile noise

        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,high,1.1,1.3,0.2);

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.3);
    };

        //
        // metal bitmaps
        //

    this.generateMetal=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,k,plateX,plateY,halfWid,halfHigh;
        var x,y,particleWid,particleHigh,particleDensity;

            // some random values

        var metalColor=this.genBitmapUtility.getRandomColor([0.0,0.0,0.4],[0.25,0.25,0.6]);
        var edgeColor=this.genBitmapUtility.darkenColor(metalColor,0.8);
        var markCount=this.genRandom.randomInt(10,15);

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,this.genBitmapUtility.colorToRGBColor(metalColor,1.0));
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // plates

        halfWid=Math.floor(wid/2);
        halfHigh=Math.floor(high/2);

        for (n=0;n!==4;n++) {
            plateX=(n%2)*halfWid;
            plateY=Math.floor(n/2)*halfHigh;

            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,plateX,plateY,(plateX+halfWid),(plateY+halfHigh),5,metalColor,edgeColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,plateX,plateY,(plateX+halfWid),(plateY+halfHigh),0.9,0.95,0.2);

                // particles

            for (k=0;k!==markCount;k++) {
                particleWid=this.genRandom.randomInt(50,30);
                particleHigh=this.genRandom.randomInt(50,30);
                particleDensity=this.genRandom.randomInt(150,50);

                x=this.genRandom.randomInt(plateX,(halfWid-particleWid));
                y=this.genRandom.randomInt(plateY,(halfHigh-particleHigh));

                if ((k&0x1)===0) {
                    this.genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.8,particleDensity,true);
                }
                else {
                    this.genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,1.2,particleDensity,false);
                }
            }
        }

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.2);
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

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,this.genBitmapUtility.colorToRGBColor(concreteColor,1.0));
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

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.9);
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
            
        tileWid=Math.floor(wid/splitCount);
        tileHigh=Math.floor(high/splitCount);

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,this.genBitmapUtility.colorToRGBColor(mortarColor,1.0));
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // draw the tiles
        
        top=0;
        
        for (y=0;y!==splitCount;y++) {

            bot=(top+tileHigh)-borderSize;
            
            lft=0;

            for (x=0;x!==splitCount;x++) {
                
                if ((x===0) || (y===0) || (x===(splitCount-1)) || (y===(splitCount-1))) {
                    col=borderColor;
                }
                else {
                    col=this.genBitmapUtility.getRandomColor([0.3,0.3,0.4],[0.6,0.6,0.7]);
                }
                darkCol=this.genBitmapUtility.darkenColor(col,0.5);

                rgt=(lft+tileWid)-borderSize;

                this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,col,darkCol);

                lft+=tileWid;
            }
            
            top+=tileHigh;
        }

            // noise

        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,high,1.1,1.3,0.2);

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.3);
    };

        //
        // wood bitmaps
        //

    this.generateWood=function(bitmapCTX,normalCTX,specularCTX,wid,high,isBox)
    {
            // some random values

        var boardSize=Math.floor(wid/8);
        var woodColor=this.genBitmapUtility.getRandomColor([0.4,0.2,0.0],[0.5,0.3,0.0]);

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,'#FFFFFF');
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // regular wood planking

        if (!isBox) {

            var lft=0;
            var woodFactor;

            while (lft<wid) {
                woodFactor=0.8+((1.0-(this.genRandom.random()*2.0))*0.1);
                this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,lft,-3,(lft+boardSize),(high+3),3,woodColor,[0.0,0.0,0.0]); // -3 to get around outside borders
                this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,normalCTX,(lft+3),0,((lft+boardSize)-3),high,0.1,woodColor);
                this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,(lft+3),0,((lft+boardSize)-3),high,0.9,0.95,woodFactor);
                lft+=boardSize;
            }
        }

            // box type wood

        else {

                // outside boards

            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,0,wid,boardSize,3,woodColor,[0.0,0.0,0.0]);
            this.genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,normalCTX,3,3,(wid-3),(boardSize-3),0.1,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,wid,boardSize,0.9,0.95,0.8);

            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,(high-boardSize),wid,high,3,woodColor,[0.0,0.0,0.0]);
            this.genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,normalCTX,3,((high-boardSize)+3),(wid-3),(high-3),0.1,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,(high-boardSize),wid,high,0.9,0.95,0.8);

            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,0,boardSize,high,3,woodColor,[0.0,0.0,0.0]);
            this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,normalCTX,3,3,(boardSize-3),(high-3),0.1,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,0,0,boardSize,high,0.9,0.95,0.8);

            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,(wid-boardSize),0,wid,high,3,woodColor,[0.0,0.0,0.0]);
            this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,normalCTX,((wid-boardSize)+3),3,(wid-3),(high-3),0.1,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,(wid-boardSize),0,wid,high,0.9,0.95,0.8);

                // inner boards

            this.genBitmapUtility.drawColorStripeSlant(bitmapCTX,normalCTX,boardSize,boardSize,(wid-boardSize),(high-boardSize),0.3,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,boardSize,boardSize,(wid-boardSize),(high-boardSize),0.9,0.95,0.8);

                // inner boards

            var y=Math.floor(high/2)-Math.floor(boardSize/2);

            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,boardSize,y,(wid-boardSize),(y+boardSize),3,woodColor,[0.0,0.0,0.0]);
            this.genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,normalCTX,(boardSize+3),(y+3),((wid-boardSize)-3),((y+boardSize)-3),0.2,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,boardSize,y,(wid-boardSize),(y+boardSize),0.9,0.95,0.8);

            var x=Math.floor(wid/2)-Math.floor(boardSize/2);

            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,x,boardSize,(x+boardSize),(high-boardSize),3,woodColor,[0.0,0.0,0.0]);
            this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,normalCTX,(x+3),(boardSize+3),((x+boardSize)-3),((high-boardSize)-3),0.2,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,x,boardSize,(x+boardSize),(high-boardSize),0.9,0.95,0.8);
        }

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.8);
    };

        //
        // skin bitmaps
        //

    this.generateSkinChunk=function(bitmapCTX,normalCTX,skinColor,lft,top,rgt,bot,scaleDarken,noiseDarken)
    {
        var n,x,y,sWid,sHigh;

            // the skin background

        this.genBitmapUtility.drawRect(bitmapCTX,lft,top,rgt,bot,this.genBitmapUtility.colorToRGBColor(skinColor,1.0));

            // scales

        var scaleCount=this.genRandom.randomInt(80,40);
        var borderColor=this.genBitmapUtility.darkenColor(skinColor,scaleDarken);

        var wid=rgt-lft;
        var high=bot-top;

        for (n=0;n!==scaleCount;n++) {
            sWid=this.genRandom.randomInt(50,20);
            sHigh=this.genRandom.randomInt(50,20);
            x=lft+this.genRandom.randomInt(0,(wid-sWid));
            y=top+this.genRandom.randomInt(0,(high-sHigh));
            this.genBitmapUtility.draw3DOval(bitmapCTX,normalCTX,x,y,(x+sWid),(y+sHigh),1,null,borderColor);
        }

            // add noise

        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,lft,top,rgt,bot,noiseDarken,(noiseDarken+0.05),0.8);
    };
    
    this.generateFaceChunk=function(bitmapCTX,normalCTX,skinColor,lft,top,rgt,bot)
    {
        var n,px,py,px2,py2,pxAdd,mSz;
        
        this.generateSkinChunk(bitmapCTX,normalCTX,skinColor,lft,top,rgt,bot,0.8,0.8);

            // position of face
            
        var wid=rgt-lft;
        var high=bot-top;

        var faceX=lft+Math.floor((wid*2)/10);
        var faceWid=Math.floor((wid*8)/10);

            // eyes

        var borderColor=this.genBitmapUtility.getRandomGreyColor(0.0,0.25);
        var eyeColor=this.genBitmapUtility.getRandomColor([0.5,0.4,0.2],[1.0,0.4,0.6]);
        var pupilColor=this.genBitmapUtility.getRandomColor([0.0,0.0,0.0],[0.5,0.1,0.2]);
        var mouthColor=this.genBitmapUtility.getRandomColor([0.0,0.0,0.0],[0.5,0.1,0.3]);

        var eyeCount=this.genRandom.randomInt(1,3);

        var eyeWid=faceWid/eyeCount;
        var eyeHigh=this.genRandom.randomInt(Math.floor(eyeWid/2),eyeWid);
        if (eyeHigh>Math.floor(high/2)) eyeHigh=Math.floor(high/2);

        var eyeX=Math.floor(faceWid/2)-Math.floor((eyeCount*eyeWid)/2);
        var eyeY=this.genRandom.randomInt(40,30);

        var pupilWid=Math.floor(eyeWid/4);
        var pupilHigh=this.genRandom.randomInt(eyeHigh,Math.floor(eyeHigh/2));
        if (pupilHigh>eyeHigh) pupilHigh=eyeHigh;

        px=faceX+eyeX;
        py=top+eyeY;

        var borderSize=this.genRandom.randomInt(1,4);

        for (n=0;n!==eyeCount;n++) {
            this.genBitmapUtility.draw3DOval(bitmapCTX,normalCTX,px,py,(px+(eyeWid-5)),(py+eyeHigh),borderSize,eyeColor,borderColor);

            px2=px+Math.floor((eyeWid-pupilWid)/2);
            py2=py+Math.floor((eyeHigh-pupilHigh)/2);
            this.genBitmapUtility.draw3DOval(bitmapCTX,normalCTX,px2,py2,(px2+pupilWid),(py2+pupilHigh),0,pupilColor,null);

            px+=eyeWid;
        }

            // mouth

        var lineCount=this.genRandom.randomInt(2,6);

        px=faceX+5;
        pxAdd=Math.floor((faceWid-10)/lineCount);
        
        py=top+(high-40);

        for (n=0;n!==lineCount;n++) {
            mSz=this.genRandom.randomInt(2,8)-5;
            this.genBitmapUtility.drawLine(bitmapCTX,normalCTX,px,py,(px+pxAdd),(py+mSz),mouthColor);
            px+=pxAdd;
            py+=mSz;
        }
    };

    this.generateClothChunk=function(bitmapCTX,normalCTX,bitmapWid,bitmapHigh,clothColor,lft,top,rgt,bot)
    {
        var n,markCount;
        var x,y,mWid,mHigh;

        this.genBitmapUtility.drawRect(bitmapCTX,lft,top,rgt,bot,this.genBitmapUtility.colorToRGBColor(clothColor,1.0));
        this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,normalCTX,lft,top,rgt,bot,0.2,clothColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,normalCTX,lft,top,rgt,bot,0.7,0.75,0.5);

        markCount=this.genRandom.randomInt(40,60);

        var wid=rgt-lft;
        var high=bot-top;

        for (n=0;n!==markCount;n++) {
            mWid=this.genRandom.randomInt(50,20);
            mHigh=this.genRandom.randomInt(50,20);
            x=lft+this.genRandom.randomInt(0,(wid-mWid));
            y=top+this.genRandom.randomInt(0,(high-mHigh));
            this.genBitmapUtility.drawParticle(bitmapCTX,normalCTX,bitmapWid,bitmapHigh,x,y,mWid,mHigh,10,0.9,0.6,true);
        }
    };

    this.generateSkin=function(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var skinColor=this.genBitmapUtility.getRandomColor([0.5,0.5,0.4],[1.0,1.0,0.8]);
        var clothColor=this.genBitmapUtility.getRandomColor([0.4,0.3,0.3],[0.7,0.6,0.7]);

            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,'#FFFFFF');
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // top-left is plain skin
            // top-right is face
            // bottom-left is darker skin

        var halfWid=Math.floor(wid/2);
        var halfHigh=Math.floor(high/2);

        this.generateSkinChunk(bitmapCTX,normalCTX,skinColor,0,0,halfWid,halfHigh,0.8,0.8);
        this.generateFaceChunk(bitmapCTX,normalCTX,skinColor,halfWid,0,wid,halfHigh);
        this.generateSkinChunk(bitmapCTX,normalCTX,skinColor,0,halfHigh,halfWid,high,0.7,0.7);
        this.generateClothChunk(bitmapCTX,normalCTX,wid,high,clothColor,halfWid,halfHigh,wid,high);

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    };

        //
        // generate mainline
        //

    this.generate=function(view,bitmapId,generateType,debug)
    {
        var edgeSize,paddingSize,segments;

            // setup the canvas

        var bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
        bitmapCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
        var bitmapCTX=bitmapCanvas.getContext('2d');

        var normalCanvas=document.createElement('canvas');
        normalCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
        normalCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
        var normalCTX=normalCanvas.getContext('2d');

        var specularCanvas=document.createElement('canvas');
        specularCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
        specularCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
        var specularCTX=specularCanvas.getContext('2d');

        var wid=bitmapCanvas.width;
        var high=bitmapCanvas.height;

            // create the bitmap

        var shineFactor=1.0;

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
                shineFactor=8.0;
                break;

            case GEN_BITMAP_TYPE_TILE_SIMPLE:
                this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,false,false);
                shineFactor=10.0;
                break;

            case GEN_BITMAP_TYPE_TILE_COMPLEX:
                this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,true,false);
                shineFactor=10.0;
                break;

            case GEN_BITMAP_TYPE_TILE_SMALL:
                this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,false,true);
                shineFactor=10.0;
                break;

            case GEN_BITMAP_TYPE_METAL:
                this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=20.0;
                break;

            case GEN_BITMAP_TYPE_CONCRETE:
                this.generateConcrete(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=5.0;
                break;
                
            case GEN_BITMAP_TYPE_MOSAIC:
                this.generateMosaic(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=10.0;
                break;

            case GEN_BITMAP_TYPE_WOOD_PLANK:
                this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high,false);
                shineFactor=5.0;
                break;

            case GEN_BITMAP_TYPE_WOOD_BOX:
                this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high,true);
                shineFactor=5.0;
                break;

            case GEN_BITMAP_TYPE_SKIN:
                this.generateSkin(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=15.0;
                break;

        }

            // debugging
/*
        if (generateType===GEN_BITMAP_TYPE_WOOD_PLANK) {
            debug.displayCanvasData(bitmapCanvas,1050,10,400,400);
            debug.displayCanvasData(normalCanvas,1050,410,400,400);
            debug.displayCanvasData(specularCanvas,1050,820,400,400);
        }
*/
            // finally create the bitmap
            // object and load into WebGL

        return(new BitmapObject(view,bitmapId,bitmapCanvas,normalCanvas,specularCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    };

}
