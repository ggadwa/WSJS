"use strict";

//
// generate bitmap object
//

var genBitmap={};

//
// sizing
//

genBitmap.TEXTURE_SIZE=512;

//
// types
// 

genBitmap.TYPE_BRICK_STACK=0;
genBitmap.TYPE_BRICK_RANDOM=1;
genBitmap.TYPE_STONE=2;
genBitmap.TYPE_TILE_SIMPLE=3;
genBitmap.TYPE_TILE_COMPLEX=4;
genBitmap.TYPE_TILE_SMALL=5;
genBitmap.TYPE_METAL=6;
genBitmap.TYPE_CONCRETE=7;
genBitmap.TYPE_WOOD_PLANK=8;
genBitmap.TYPE_WOOD_BOX=9;

//
// brick/rock bitmaps
//

genBitmap.generateBrick=function(bitmapCTX,normalCTX,specularCTX,wid,high,edgeSize,paddingSize,darkenFactor,segments)
{
    var n,rect;
    var drawBrickColor,drawEdgeColor,f;
    
        // some random values
    
    var groutColor=genBitmapUtility.getRandomGreyColor(0.6,0.7);
    var brickColor=genBitmapUtility.getRandomColor([0.3,0.2,0.2],[1.0,0.8,0.8]);
    var edgeColor=genBitmapUtility.darkenColor(brickColor,0.8);
    
        // clear canvases
        
    genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,genBitmapUtility.colorToRGBColor(groutColor,1.0));
    genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);
    
    genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

        // draw the bricks
        
    for (n=0;n!==segments.length;n++) {
        rect=segments[n];
        
        f=1.0;
        if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=wid) && (rect.bot<=high)) {        // don't darken bricks that fall off edges
            f=genRandom.random()+darkenFactor;
            if (f>1.0) f=1.0;
        }
        
        drawBrickColor=genBitmapUtility.darkenColor(brickColor,f);
        drawEdgeColor=genBitmapUtility.darkenColor(edgeColor,f);

        genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),edgeSize,drawBrickColor,drawEdgeColor,true);
        genBitmapUtility.addNoiseRect(bitmapCTX,rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),darkenFactor,1.0,0.4);
    }
    
        // finish with the specular
        
    genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.3);
};

//
// stone bitmaps
//

genBitmap.generateStone=function(bitmapCTX,normalCTX,specularCTX,wid,high)
{
    var n,rect,edgeSize;
    var drawStoneColor,drawEdgeColor,f;
    var x,y,particleWid,particleHigh,particleDensity;
    
        // some random values
    
    var groutColor=genBitmapUtility.getRandomGreyColor(0.3,0.4);
    var stoneColor=genBitmapUtility.getRandomColor([0.5,0.4,0.3],[0.8,0.5,0.4]);
    var edgeColor=genBitmapUtility.darkenColor(stoneColor,0.9);
    
    var segments=genBitmapUtility.createRandomSegments(wid,high);
    var darkenFactor=0.5;
    
        // clear canvases
        
    genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,genBitmapUtility.colorToRGBColor(groutColor,1.0));
    genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);
    
    genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

        // draw the stones
        
    for (n=0;n!==segments.length;n++) {
        rect=segments[n];
        
        f=1.0;
        if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=wid) && (rect.bot<=high)) {        // don't darken stones that fall off edges
            f=genRandom.random()+darkenFactor;
            if (f>1.0) f=1.0;
        }
        
        drawStoneColor=genBitmapUtility.darkenColor(stoneColor,f);
        drawEdgeColor=genBitmapUtility.darkenColor(edgeColor,f);
    
        edgeSize=genRandom.randomInt(5,12);     // new edge size as stones aren't the same

        genBitmapUtility.draw3DComplexRect(bitmapCTX,normalCTX,rect.lft,rect.top,rect.rgt,rect.bot,edgeSize,drawStoneColor,drawEdgeColor,true);
        genBitmapUtility.addNoiseRect(bitmapCTX,rect.lft,rect.top,rect.rgt,rect.bot,darkenFactor,1.0,0.4);
        
            // possible marks
        
        if (genRandom.randomInt(0,100)>50) {
            particleWid=genRandom.randomInt(50,30);
            particleHigh=genRandom.randomInt(50,30);
            particleDensity=genRandom.randomInt(150,50);

            x=genRandom.randomInt((rect.lft+edgeSize),((rect.rgt-rect.lft)-(edgeSize*2)));
            y=genRandom.randomInt((rect.top+edgeSize),((rect.bot-rect.top)-(edgeSize*2)));

            genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.8,particleDensity,true);
        }
    }
    
        // finish with the specular
        
    genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.3);
}

//
// tile bitmaps
//

genBitmap.TILE_STYLE_BORDER=0;
genBitmap.TILE_STYLE_CHECKER=1;
genBitmap.TILE_STYLE_STRIPE=2;
    
genBitmap.generateTileInner=function(bitmapCTX,normalCTX,lft,top,rgt,bot,tileColor,tileStyle,splitCount,edgeSize,complex)
{
    var x,y,dLft,dTop,dRgt,dBot,tileWid,tileHigh;
    var col;

        // tile style

    tileStyle=genRandom.randomInt(0,3);

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

            if ((complex) && (genRandom.random()<0.25)) {
                tileStyle=genRandom.randomInt(0,3);
                this.generateTileInner(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,tileColor,tileStyle,2,edgeSize,false);
                continue;
            }

                // make the tile

            col=tileColor[0];

            switch (tileStyle) {

                case this.TILE_STYLE_BORDER:
                    if ((x!==0) && (y!==0)) col=tileColor[1];
                    break;

                case this.TILE_STYLE_CHECKER:
                    col=tileColor[(x+y)&0x1];
                    break;

                case this.TILE_STYLE_STRIPE:
                    if ((x&0x1)!==0) col=tileColor[1];
                    break;

            }

            genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,edgeSize,col,[0.0,0.0,0.0]);

                // possible design

            if ((complex) && (genRandom.random()<0.25)) {
                genBitmapUtility.draw3DOval(bitmapCTX,normalCTX,(dLft+edgeSize),(dTop+edgeSize),(dRgt-edgeSize),(dBot-edgeSize),5,null,[0.0,0.0,0.0]);
            }
        }
    }
};

genBitmap.generateTile=function(bitmapCTX,normalCTX,specularCTX,wid,high,complex,small)
{
        // some random values
    
    var splitCount,tileStyle;
    var tileColor=[];
    
    if (!small) {
        splitCount=genRandom.randomInt(2,2);
        tileStyle=genRandom.randomInt(0,3);
        tileColor[0]=genBitmapUtility.getRandomColor([0.3,0.3,0.4],[0.6,0.6,0.7]);
        tileColor[1]=genBitmapUtility.darkenColor(tileColor[0],0.8);
    }
    else {
        splitCount=8;
        tileStyle=this.TILE_STYLE_CHECKER;
        tileColor[0]=genBitmapUtility.getRandomColor([0.5,0.3,0.3],[0.8,0.6,0.6]);
        tileColor[1]=genBitmapUtility.darkenColor(tileColor[0],0.9);
    }
    
        // clear canvases
        
    genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,genBitmapUtility.colorToRGBColor(tileColor,1.0));
    genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
    
		// original splits
        
    this.generateTileInner(bitmapCTX,normalCTX,0,0,wid,high,tileColor,tileStyle,splitCount,(small?2:5),complex);

		// tile noise
        
    genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,high,1.1,1.3,0.2);
    
        // finish with the specular
        
    genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.7);
};

//
// metal bitmaps
//

genBitmap.generateMetal=function(bitmapCTX,normalCTX,specularCTX,wid,high)
{
    var n,k,plateX,plateY,halfWid,halfHigh;
    var x,y,particleWid,particleHigh,particleDensity;
    
        // some random values
    
    var metalColor=genBitmapUtility.getRandomColor([0.0,0.0,0.4],[0.25,0.25,0.6]);
    var edgeColor=genBitmapUtility.darkenColor(metalColor,0.8);
    var markCount=genRandom.randomInt(10,15);
    
        // clear canvases
        
    genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,genBitmapUtility.colorToRGBColor(metalColor,1.0));
    genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
    
        // plates
    
    halfWid=Math.floor(wid/2);
    halfHigh=Math.floor(high/2);
    
    for (n=0;n!==4;n++) {
        plateX=(n%2)*halfWid;
        plateY=Math.floor(n/2)*halfHigh;

        genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,plateX,plateY,(plateX+halfWid),(plateY+halfHigh),5,metalColor,edgeColor);
        genBitmapUtility.addNoiseRect(bitmapCTX,plateX,plateY,(plateX+halfWid),(plateY+halfHigh),0.9,0.95,0.2);

            // particles

        for (k=0;k!==markCount;k++) {
            particleWid=genRandom.randomInt(50,30);
            particleHigh=genRandom.randomInt(50,30);
            particleDensity=genRandom.randomInt(150,50);

            x=genRandom.randomInt(plateX,(halfWid-particleWid));
            y=genRandom.randomInt(plateY,(halfHigh-particleHigh));

            if ((k&0x1)===0) {
                genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.8,particleDensity,true);
            }
            else {
                genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,1.2,particleDensity,false);
            }
        }
    }
    
        // finish with the specular
        
    genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.7);
};

//
// concrete bitmaps
//

genBitmap.generateConcrete=function(bitmapCTX,normalCTX,specularCTX,wid,high)
{
    var n,x,y,particleWid,particleHigh,particleDensity;
    
        // some random values
    
    var concreteColor=genBitmapUtility.getRandomGreyColor(0.4,0.6);
    
    var markCount=genRandom.randomInt(30,20);
    
        // clear canvases
        
    genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,genBitmapUtility.colorToRGBColor(concreteColor,1.0));
    genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.8);
    
    genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
    
        // marks
        
	for (n=0;n!==markCount;n++) {
        particleWid=genRandom.randomInt(100,100);
        particleHigh=genRandom.randomInt(100,100);
        particleDensity=genRandom.randomInt(250,150);
        
        x=genRandom.randomInt(0,wid);
        y=genRandom.randomInt(0,high);
        
        genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.9,particleDensity,false);
    }
    
        // finish with the specular
        
    genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
};

//
// wood bitmaps
//

genBitmap.generateWood=function(bitmapCTX,normalCTX,specularCTX,wid,high,isBox)
{
        // some random values
    
    var boardSize=Math.floor(wid/8);
    var woodColor=genBitmapUtility.getRandomColor([0.4,0.2,0.0],[0.5,0.3,0.0]);
    
        // clear canvases
        
    genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,'#FFFFFF');
    genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
    
        // regular wood planking
        
    if (!isBox) {
        
        var lft=0;
        var woodFactor;
        
        while (lft<wid) {
            woodFactor=0.8+((1.0-(genRandom.random()*2.0))*0.1);
            genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,lft,-3,(lft+boardSize),(high+3),3,woodColor,[0.0,0.0,0.0]); // -3 to get around outside borders
            genBitmapUtility.drawColorStripeVertical(bitmapCTX,(lft+3),0,((lft+boardSize)-3),high,0.1,woodColor);
            genBitmapUtility.addNoiseRect(bitmapCTX,(lft+3),0,((lft+boardSize)-3),high,0.9,0.95,woodFactor);
            lft+=boardSize;
        }
    }
    
        // box type wood
        
    else {
    
            // outside boards

        genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,0,wid,boardSize,3,woodColor,[0.0,0.0,0.0]);
        genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,3,3,(wid-3),(boardSize-3),0.1,woodColor);
        genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,boardSize,0.9,0.95,0.8);

        genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,(high-boardSize),wid,high,3,woodColor,[0.0,0.0,0.0]);
        genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,3,((high-boardSize)+3),(wid-3),(high-3),0.1,woodColor);
        genBitmapUtility.addNoiseRect(bitmapCTX,0,(high-boardSize),wid,high,0.9,0.95,0.8);
    
        genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,0,boardSize,high,3,woodColor,[0.0,0.0,0.0]);
        genBitmapUtility.drawColorStripeVertical(bitmapCTX,3,3,(boardSize-3),(high-3),0.1,woodColor);
        genBitmapUtility.addNoiseRect(bitmapCTX,0,0,boardSize,high,0.9,0.95,0.8);
        
        genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,(wid-boardSize),0,wid,high,3,woodColor,[0.0,0.0,0.0]);
        genBitmapUtility.drawColorStripeVertical(bitmapCTX,((wid-boardSize)+3),3,(wid-3),(high-3),0.1,woodColor);
        genBitmapUtility.addNoiseRect(bitmapCTX,(wid-boardSize),0,wid,high,0.9,0.95,0.8);
        
            // inner boards
            
        genBitmapUtility.drawColorStripeSlant(bitmapCTX,boardSize,boardSize,(wid-boardSize),(high-boardSize),0.3,woodColor);
        genBitmapUtility.addNoiseRect(bitmapCTX,boardSize,boardSize,(wid-boardSize),(high-boardSize),0.9,0.95,0.8);
        
            // inner boards
        
        var y=Math.floor(high/2)-Math.floor(boardSize/2);
        
        genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,boardSize,y,(wid-boardSize),(y+boardSize),3,woodColor,[0.0,0.0,0.0]);
        genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,(boardSize+3),(y+3),((wid-boardSize)-3),((y+boardSize)-3),0.2,woodColor);
        genBitmapUtility.addNoiseRect(bitmapCTX,boardSize,y,(wid-boardSize),(y+boardSize),0.9,0.95,0.8);
        
        var x=Math.floor(wid/2)-Math.floor(boardSize/2);
        
        genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,x,boardSize,(x+boardSize),(high-boardSize),3,woodColor,[0.0,0.0,0.0]);
        genBitmapUtility.drawColorStripeVertical(bitmapCTX,(x+3),(boardSize+3),((x+boardSize)-3),((high-boardSize)-3),0.2,woodColor);
        genBitmapUtility.addNoiseRect(bitmapCTX,x,boardSize,(x+boardSize),(high-boardSize),0.9,0.95,0.8);
    }
    
        // finish with the specular
        
    genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
};

//
// create bitmap
//

genBitmap.generate=function(bitmapIndex,generateType)
{
    var edgeSize,paddingSize,segments;
    
        // setup the canvas
        
    var bitmapCanvas=document.createElement('canvas');
    bitmapCanvas.width=this.TEXTURE_SIZE;
    bitmapCanvas.height=this.TEXTURE_SIZE;
    var bitmapCTX=bitmapCanvas.getContext('2d');

    var normalCanvas=document.createElement('canvas');
    normalCanvas.width=this.TEXTURE_SIZE;
    normalCanvas.height=this.TEXTURE_SIZE;
    var normalCTX=normalCanvas.getContext('2d');
    
    var specularCanvas=document.createElement('canvas');
    specularCanvas.width=this.TEXTURE_SIZE;
    specularCanvas.height=this.TEXTURE_SIZE;
    var specularCTX=specularCanvas.getContext('2d');
    
    var wid=bitmapCanvas.width;
    var high=bitmapCanvas.height;
    
        // create the bitmap
    
    var shineFactor=1.0;
    
    switch (generateType) {
        
        case this.TYPE_BRICK_STACK:
            segments=genBitmapUtility.createStackedSegments(wid,high);
            edgeSize=genRandom.randomInt(2,5);
            paddingSize=genRandom.randomInt(1,3);
            this.generateBrick(bitmapCTX,normalCTX,specularCTX,wid,high,edgeSize,paddingSize,0.8,segments);
            shineFactor=5.0;
            break;
            
        case this.TYPE_BRICK_RANDOM:
            segments=genBitmapUtility.createRandomSegments(wid,high);
            edgeSize=genRandom.randomInt(5,10);
            paddingSize=genRandom.randomInt(3,5);
            this.generateBrick(bitmapCTX,normalCTX,specularCTX,wid,high,edgeSize,paddingSize,0.5,segments);
            shineFactor=5.0;
            break;
            
        case this.TYPE_STONE:
            this.generateStone(bitmapCTX,normalCTX,specularCTX,wid,high);
            shineFactor=8.0;
            break;
            
        case this.TYPE_TILE_SIMPLE:
            this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,false,false);
            shineFactor=10.0;
            break;
            
        case this.TYPE_TILE_COMPLEX:
            this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,true,false);
            shineFactor=10.0;
            break;
            
        case this.TYPE_TILE_SMALL:
            this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,false,true);
            shineFactor=10.0;
            break;
            
        case this.TYPE_METAL:
            this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high);
            shineFactor=20.0;
            break;
            
        case this.TYPE_CONCRETE:
            this.generateConcrete(bitmapCTX,normalCTX,specularCTX,wid,high);
            shineFactor=5.0;
            break;
            
        case this.TYPE_WOOD_PLANK:
            this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high,false);
            shineFactor=5.0;
            break;
            
        case this.TYPE_WOOD_BOX:
            this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high,true);
            shineFactor=5.0;
            break;

    }
    
        // finally load into webGL

    bitmap.load(bitmapIndex,bitmapCanvas,normalCanvas,specularCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor);
    
        // debugging

/*
    if (generateType==this.TYPE_CONCRETE) {
        debug.displayCanvasData(bitmapCanvas,810,10,400,400);
        debug.displayCanvasData(normalCanvas,810,410,400,400);
        debug.displayCanvasData(specularCanvas,810,820,400,400);
    }
*/
    
};
