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

    generateWood()
    {
        let n,y,lft,rgt,top,bot;
        let topBotBorder,lftRgtBorder;
        let boardSplit,boardHigh;
        
            // some random values

        let boardCount=genRandom.randomInt(4,8);
        let boardSize=Math.trunc(this.bitmapCanvas.width/boardCount);
        let edgeSize=genRandom.randomInt(3,3);
        let woodColor=this.getRandomWoodColor();

            // regular wood planking

        lft=0;

        for (n=0;n!==boardCount;n++) {
            rgt=lft+boardSize;
            if (n===(boardCount-1)) rgt=this.bitmapCanvas.width;
            
            boardSplit=genRandom.randomInt(1,3);
            boardHigh=Math.trunc(this.bitmapCanvas.height/boardSplit);
            
            this.generateWoodDrawBoard(lft,0,rgt,this.bitmapCanvas.height,edgeSize,woodColor);
            
            lft=rgt;
        }
        
            // border
        
        top=0;
        bot=this.bitmapCanvas.height;
        
        lftRgtBorder=genRandom.randomPercentage(0.5);
        topBotBorder=genRandom.randomPercentage(0.5);
        
        if ((lftRgtBorder) || (topBotBorder)) {
            if (genRandom.randomPercentage(0.5)) {
                y=Math.trunc((this.bitmapCanvas.height*0.5)-(boardSize*0.5));
                this.generateWoodDrawBoard(0,y,this.bitmapCanvas.width,(y+boardSize),edgeSize,woodColor);
            }
        }
        
        if (lftRgtBorder) {
            top+=boardSize;
            bot-=boardSize;
            
            this.generateWoodDrawBoard(0,0,this.bitmapCanvas.width,boardSize,edgeSize,woodColor);
            this.generateWoodDrawBoard(0,(this.bitmapCanvas.height-boardSize),this.bitmapCanvas.width,this.bitmapCanvas.height,edgeSize,woodColor);
        }
        
        if (topBotBorder) {
            this.generateWoodDrawBoard(0,top,boardSize,bot,edgeSize,woodColor);
            this.generateWoodDrawBoard((this.bitmapCanvas.width-boardSize),top,this.bitmapCanvas.width,bot,edgeSize,woodColor);
        }

            // finish with the specular

        this.createSpecularMap(0.2);
    }
            
        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateWood();
    }

}
