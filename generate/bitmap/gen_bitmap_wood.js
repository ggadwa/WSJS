import genRandom from '../../generate/utility/random.js';
import ColorClass from '../../code/utility/color.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate box bitmap class
//

export default class GenBitmapBoxClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
    
        //
        // wood bitmaps
        //

    generateWood(wid,high)
    {
        let n,y,lft,rgt,top,bot;
        let topBotBorder,lftRgtBorder;
        let boardSplit,boardHigh;
        
            // some random values

        let boardCount=genRandom.randomInt(4,8);
        let boardSize=Math.trunc(wid/boardCount);
        let edgeSize=genRandom.randomInt(3,3);
        let woodColor=this.getRandomWoodColor();

            // clear canvases

        this.clearNormalsRect(0,0,wid,high);

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
        
            // border
        
        top=0;
        bot=high;
        
        lftRgtBorder=genRandom.randomPercentage(0.5);
        topBotBorder=genRandom.randomPercentage(0.5);
        
        if ((lftRgtBorder) || (topBotBorder)) {
            if (genRandom.randomPercentage(0.5)) {
                y=Math.trunc((high*0.5)-(boardSize*0.5));
                this.generateWoodDrawBoard(0,y,wid,(y+boardSize),edgeSize,woodColor);
            }
        }
        
        if (lftRgtBorder) {
            top+=boardSize;
            bot-=boardSize;
            
            this.generateWoodDrawBoard(0,0,wid,boardSize,edgeSize,woodColor);
            this.generateWoodDrawBoard(0,(high-boardSize),wid,high,edgeSize,woodColor);
        }
        
        if (topBotBorder) {
            this.generateWoodDrawBoard(0,top,boardSize,bot,edgeSize,woodColor);
            this.generateWoodDrawBoard((wid-boardSize),top,wid,bot,edgeSize,woodColor);
        }

            // finish with the specular

        this.createSpecularMap(wid,high,0.2);
    }
            
        //
        // generate mainline
        //

    generateInternal()
    {
        let wid,high;

        wid=this.bitmapCanvas.width;
        high=this.bitmapCanvas.height;

        this.generateWood(wid,high);
    }

}
