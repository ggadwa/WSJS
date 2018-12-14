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
        super(view,true,true,false);
        Object.seal(this);
    }
            
        //
        // door bitmaps
        //
    
    generateDoorMetalBackground(wid,high)
    {
            // some random values

        let metalColor=this.getRandomMetalColor();
        let edgeSize=genRandom.randomInt(4,8);
        
            // the plate
            
        this.draw3DRect(0,0,wid,high,edgeSize,metalColor,true);

            // possible streaks
            
        this.generateMetalStreakShine(edgeSize,edgeSize,(wid-edgeSize),(high-edgeSize),metalColor);
    }
    
    generateDoorWoodBackground(wid,high)
    {
        let n,lft,rgt;
        let boardSplit,boardHigh;
        
            // some random values

        let boardCount=genRandom.randomInt(4,8);
        let boardSize=Math.trunc(wid/boardCount);
        let edgeSize=genRandom.randomInt(3,3);
        let woodColor=this.getRandomWoodColor();

            // regular wood planking

        lft=0;

        for (n=0;n!==boardCount;n++) {
            rgt=lft+boardSize;
            if (n===(boardCount-1)) rgt=wid;
            
            boardSplit=genRandom.randomInt(1,3);
            boardHigh=Math.trunc(high/boardSplit);
            
            this.generateWoodDrawBoard(lft,0,rgt,high,edgeSize,woodColor);
            
            lft=rgt;
        }
    }
    
    generateDoorRunner(top,bot,wid,high,metalColor,edgeSize,screwSize,screwInnerSize,screwColor)
    {
        this.draw3DRect(0,top,wid,bot,edgeSize,metalColor,true);
        this.generateMetalStreakShine(edgeSize,(top+edgeSize),(wid-edgeSize),(bot-edgeSize),metalColor);
        if (genRandom.randomPercentage(0.75)) this.generateMetalScrewsHorizontal(edgeSize,top,(wid-edgeSize),bot,screwColor,screwSize,screwInnerSize);
    }
    
    generateDoor()
    {
        let runHigh,runMid,hadRun;
        let edgeSize,screwSize,screwInnerSize,screwColor;
        let metalColor=this.getRandomMetalColor();
        
        if (genRandom.randomPercentage(0.5)) {
            this.generateDoorWoodBackground(this.bitmapCanvas.width,this.bitmapCanvas.height);
        }
        else {
            this.generateDoorMetalBackground(this.bitmapCanvas.width,this.bitmapCanvas.height);
        }
        
            // top and bottom runners
        
        hadRun=false;
        runHigh=genRandom.randomInt(Math.trunc(this.bitmapCanvas.height*0.1),Math.trunc(this.bitmapCanvas.height*0.05));
        runMid=Math.trunc((this.bitmapCanvas.height*0.5)-(runHigh*0.5));
        
        edgeSize=genRandom.randomInt(4,8);
        screwSize=genRandom.randomInt(15,(runHigh-20));
        screwInnerSize=Math.trunc(screwSize*0.4);
        screwColor=this.boostColor(metalColor,0.05);
        
        if (genRandom.randomPercentage(0.5)) {
            hadRun=true;
            this.generateDoorRunner(0,runHigh,this.bitmapCanvas.width,this.bitmapCanvas.height,metalColor,edgeSize,screwSize,screwInnerSize,screwColor);
        }
        
        if (genRandom.randomPercentage(0.5)) {
            hadRun=true;
            this.generateDoorRunner(runMid,(runMid+runHigh),this.bitmapCanvas.width,this.bitmapCanvas.height,metalColor,edgeSize,screwSize,screwInnerSize,screwColor);
        }
        
        if ((genRandom.randomPercentage(0.5)) || (!hadRun)) this.generateDoorRunner((this.bitmapCanvas.height-runHigh),this.bitmapCanvas.height,this.bitmapCanvas.width,this.bitmapCanvas.height,metalColor,edgeSize,screwSize,screwInnerSize,screwColor);
        
            // finish with the specular

        this.createSpecularMap(0.6);
    }
            
        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateDoor();
    }

}
