import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate scifi bitmap class
//

export default class GenBitmapScifiClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
    
        //
        // scifi bitmaps
        //
    
    generateSciFiPiecePlate(high,wid,lft,top,rgt,bot,edgeSize,metalColor)
    {
        let n,x,streakWid;
        let streakColor,darken;
        
        let palteWid=rgt-lft;
        let plateHigh=bot-top;
        
        let streakCount=genRandom.randomInt(15,10);
        
            // the plate
            
        this.draw3DRect(lft,top,rgt,bot,edgeSize,metalColor,true);
        
            // streaks
            
        for (n=0;n!==streakCount;n++) {
            streakWid=genRandom.randomInt(10,40);
            x=edgeSize+genRandom.randomInBetween(streakWid,((palteWid-streakWid)-(edgeSize*2)));

            darken=0.5+(genRandom.random()*0.5);
            streakColor=this.darkenColor(metalColor,darken);

            this.drawStreakMetal(wid,high,(lft+x),(top+edgeSize),((top+plateHigh)-edgeSize),streakWid,streakColor);
        }
    }
    
    generateSciFiPieceScrews(wid,high,lft,top,rgt,bot,edgeSize,metalColor)
    {
        let n,x,y,xAdd,yAdd,offset,screwCount;
        let lineWid,lineHigh;
        
        let screwSize=genRandom.randomInt(10,20);
        let screenFlatInnerSize=Math.trunc(screwSize*0.4);

        let screwColor=this.darkenColor(metalColor,0.9);
        
            // the plate
            
        this.draw3DRect(lft,top,rgt,bot,edgeSize,metalColor,true);
        
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
                    this.draw3DOval(x,y,(x+screwSize),(y+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
                    x+=xAdd;
                }
            }
            else {
                x=lft+Math.trunc(((lft+rgt)*0.5)-(screwSize*0.5));
                
                yAdd=Math.trunc(lineHigh/screwCount);
                y=top+Math.trunc((yAdd*0.5)-(screwSize*0.5));
                
                for (n=0;n!==screwCount;n++) {
                    this.draw3DOval(x,y,(x+screwSize),(y+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
                    y+=yAdd;
                }
            }
         }
        
            // corners
            
        else {
            offset=edgeSize+4;

            this.draw3DOval((lft+offset),(top+offset),((lft+offset)+screwSize),((top+offset)+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval((lft+offset),((bot-offset)-screwSize),((lft+offset)+screwSize),(bot-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval(((rgt-offset)-screwSize),(top+offset),(rgt-offset),((top+offset)+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval(((rgt-offset)-screwSize),((bot-offset)-screwSize),(rgt-offset),(bot-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
        }
    }
    
    generateSciFiPieceShutter(wid,high,lft,top,rgt,bot,edgeSize,metalColor,shutterColor)
    {
        let n,nShutter,shutterSize;
        let y,yAdd;
        
        let shutterEdgeColor=this.darkenColor(shutterColor,0.9);
        
        let frameXSize=genRandom.randomInt(10,30);
        let frameYSize=genRandom.randomInt(10,30);
        
            // outer and inner plate
            
        this.generateSciFiPiecePlate(high,wid,lft,top,rgt,bot,edgeSize,metalColor,0,0,0);
        
        lft+=frameXSize;
        top+=frameYSize;
        rgt-=frameXSize;
        bot-=frameYSize;
        
        this.draw3DRect(lft,top,rgt,bot,edgeSize,shutterColor,true);
        
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
            this.drawSlope(lft,y,rgt,(y+shutterSize),shutterEdgeColor,false);
            y+=yAdd;
        }
    }
    
    generateSciFi(wid,high)
    {
        let mx,my,sz,lft,rgt,top,bot,col,forceWid,forceHigh;

            // some random values

        let metalColor=this.getRandomMetalColor();
        let darkMetalColor=this.darkenColor(metalColor,0.8);
        let shutterColor=this.getRandomColor();

        let metalEdgeSize=genRandom.randomInt(4,4);
        
            // clear canvases

        this.clearNormalsRect(0,0,wid,high);
        
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
                    this.generateSciFiPiecePlate(wid,high,lft,top,rgt,bot,metalEdgeSize,col);
                    break;
                case 1:
                    this.generateSciFiPieceScrews(wid,high,lft,top,rgt,bot,metalEdgeSize,col);
                    break;
                case 2:
                    this.generateSciFiPieceShutter(wid,high,lft,top,rgt,bot,metalEdgeSize,col,shutterColor);
                    break;
            }
            
                // are we finished?
                
            if ((mx>=wid) || (my>=high)) break;
        }

            // finish with the specular

        this.createSpecularMap(wid,high,0.6);
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        let wid,high;

        wid=this.bitmapCanvas.width;
        high=this.bitmapCanvas.height;

            // create the bitmap

        this.generateSciFi(wid,high);
    }

}
