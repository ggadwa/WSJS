import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate wood bitmap class
//

export default class GenerateBitmapBoxClass extends GenerateBitmapBaseClass
{
    constructor(core)
    {
        super(core,true,true,false);
        Object.seal(this);
    }
    
        //
        // wood bitmaps
        //
    
    generateWoodDrawBoard(lft,top,rgt,bot,edgeSize,woodColor)
    {
        let col;
        
        col=this.darkenColor(woodColor,GenerateUtilityClass.randomFloat(0.8,0.2));
        
        this.draw3DRect(lft,top,rgt,bot,edgeSize,col,true);
        if ((bot-top)>(rgt-lft)) {
            this.drawColorStripeVertical((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        }
        else {
            this.drawColorStripeHorizontal((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        }
        this.drawNoiseRect((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.9,0.95,0.8);
    }

    generateWood()
    {
        let n,y,lft,rgt,top,bot;
        let topBotBorder,lftRgtBorder;
        let boardSplit,boardHigh;
        
            // some random values

        let boardCount=GenerateUtilityClass.randomInt(4,8);
        let boardSize=Math.trunc(this.colorCanvas.width/boardCount);
        let edgeSize=GenerateUtilityClass.randomInt(3,3);
        let woodColor=this.getRandomColor();

            // regular wood planking

        lft=0;

        for (n=0;n!==boardCount;n++) {
            rgt=lft+boardSize;
            if (n===(boardCount-1)) rgt=this.colorCanvas.width;
            
            boardSplit=GenerateUtilityClass.randomInt(1,3);
            boardHigh=Math.trunc(this.colorCanvas.height/boardSplit);
            
            this.generateWoodDrawBoard(lft,0,rgt,this.colorCanvas.height,edgeSize,woodColor);
            
            lft=rgt;
        }
        
            // border
        
        top=0;
        bot=this.colorCanvas.height;
        
        lftRgtBorder=GenerateUtilityClass.randomPercentage(0.5);
        topBotBorder=GenerateUtilityClass.randomPercentage(0.5);
        
        if ((lftRgtBorder) || (topBotBorder)) {
            if (GenerateUtilityClass.randomPercentage(0.5)) {
                y=Math.trunc((this.colorCanvas.height*0.5)-(boardSize*0.5));
                this.generateWoodDrawBoard(0,y,this.colorCanvas.width,(y+boardSize),edgeSize,woodColor);
            }
        }
        
        if (lftRgtBorder) {
            top+=boardSize;
            bot-=boardSize;
            
            this.generateWoodDrawBoard(0,0,this.colorCanvas.width,boardSize,edgeSize,woodColor);
            this.generateWoodDrawBoard(0,(this.colorCanvas.height-boardSize),this.colorCanvas.width,this.colorCanvas.height,edgeSize,woodColor);
        }
        
        if (topBotBorder) {
            this.generateWoodDrawBoard(0,top,boardSize,bot,edgeSize,woodColor);
            this.generateWoodDrawBoard((this.colorCanvas.width-boardSize),top,this.colorCanvas.width,bot,edgeSize,woodColor);
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
