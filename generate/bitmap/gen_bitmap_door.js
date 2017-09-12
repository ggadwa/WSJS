import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate door bitmap class
//

export default class GenBitmapDoorClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view);
        Object.seal(this);
    }
            
        //
        // door bitmaps
        //
    
    generateDoorMetalBackground(bitmapCTX,normalCTX,wid,high)
    {
            // some random values

        let metalColor=this.getRandomMetalColor();
        let edgeSize=genRandom.randomInt(4,8);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // the plate
            
        this.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,edgeSize,metalColor,true);

            // possible streaks
            
        this.generateMetalStreakShine(bitmapCTX,edgeSize,edgeSize,(wid-edgeSize),(high-edgeSize),wid,high,metalColor);
    }
    
    generateDoorWoodBackground(bitmapCTX,normalCTX,wid,high)
    {
        let n,lft,rgt;
        let boardSplit,boardHigh;
        
            // some random values

        let boardCount=genRandom.randomInt(4,8);
        let boardSize=Math.trunc(wid/boardCount);
        let edgeSize=genRandom.randomInt(3,3);
        let woodColor=this.getRandomWoodColor();

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
    }
    
    generateDoorRunner(bitmapCTX,normalCTX,top,bot,wid,high,metalColor,edgeSize,screwSize,screwInnerSize,screwColor)
    {
        this.draw3DRect(bitmapCTX,normalCTX,0,top,wid,bot,edgeSize,metalColor,true);
        this.generateMetalStreakShine(bitmapCTX,edgeSize,(top+edgeSize),(wid-edgeSize),(bot-edgeSize),wid,high,metalColor);
        this.generateMetalScrewsHorizontal(bitmapCTX,normalCTX,edgeSize,top,(wid-edgeSize),bot,screwColor,screwSize,screwInnerSize);
    }
    
    generateDoor(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let runHigh,runMid,hadRun;
        let edgeSize,screwSize,screwInnerSize,screwColor;
        let metalColor=this.getRandomMetalColor();
        
        if (genRandom.randomPercentage(0.5)) {
            this.generateDoorWoodBackground(bitmapCTX,normalCTX,wid,high);
        }
        else {
            this.generateDoorMetalBackground(bitmapCTX,normalCTX,wid,high);
        }
        
            // top and bottom runners
        
        hadRun=false;
        runHigh=genRandom.randomInt(Math.trunc(high*0.1),Math.trunc(high*0.05));
        runMid=Math.trunc((high*0.5)-(runHigh*0.5));
        
        edgeSize=genRandom.randomInt(4,8);
        screwSize=genRandom.randomInt(15,(runHigh-20));
        screwInnerSize=Math.trunc(screwSize*0.4);
        screwColor=this.boostColor(metalColor,0.05);
        
        if (genRandom.randomPercentage(0.5)) {
            hadRun=true;
            this.generateDoorRunner(bitmapCTX,normalCTX,0,runHigh,wid,high,metalColor,edgeSize,screwSize,screwInnerSize,screwColor);
        }
        
        if (genRandom.randomPercentage(0.5)) {
            hadRun=true;
            this.generateDoorRunner(bitmapCTX,normalCTX,runMid,(runMid+runHigh),wid,high,metalColor,edgeSize,screwSize,screwInnerSize,screwColor);
        }
        
        if ((genRandom.randomPercentage(0.5)) || (!hadRun)) this.generateDoorRunner(bitmapCTX,normalCTX,(high-runHigh),high,wid,high,metalColor,edgeSize,screwSize,screwInnerSize,screwColor);
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.6);
    }
            
        //
        // generate mainline
        //

    generate(inDebug)
    {
        let wid,high;
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

        this.generateDoor(bitmapCTX,normalCTX,specularCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],15.0));    
    }

}
