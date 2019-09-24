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
        let col=this.darkenColor(woodColor,GenerateUtilityClass.randomFloat(0.8,0.2));
        
        this.draw3DRect(lft,top,rgt,bot,edgeSize,0.9,col,true);
        
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
        let n,y,ty,by,lft,rgt;
        
            // some random values

        let boardCount=GenerateUtilityClass.randomInt(4,8);
        let boardSize=Math.trunc(this.colorCanvas.width/boardCount);
        let edgeSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorCanvas.width*0.005),Math.trunc(this.colorCanvas.width*0.005));
        let woodColor=this.getRandomColor();

            // regular wood planking

        lft=0;
        
        y=Math.trunc(this.colorCanvas.height*0.5);
        ty=Math.trunc(this.colorCanvas.height*0.33);
        by=Math.trunc(this.colorCanvas.height*0.66);

        for (n=0;n!==boardCount;n++) {
            rgt=lft+boardSize;
            if (n===(boardCount-1)) rgt=this.colorCanvas.width;
            
            switch (GenerateUtilityClass.randomIndex(5)) {
                case 0:
                    this.generateWoodDrawBoard(lft,0,rgt,this.colorCanvas.height,edgeSize,woodColor);
                    break;
                case 1:
                    this.generateWoodDrawBoard(lft,0,rgt,y,edgeSize,woodColor);
                    this.generateWoodDrawBoard(lft,y,rgt,this.colorCanvas.height,edgeSize,woodColor);
                    break;
                case 2:
                    this.generateWoodDrawBoard(lft,-edgeSize,rgt,y,edgeSize,woodColor);
                    this.generateWoodDrawBoard(lft,y,rgt,(this.colorCanvas.height+edgeSize),edgeSize,woodColor);
                    break;
                case 3:
                    this.generateWoodDrawBoard(lft,0,rgt,ty,edgeSize,woodColor);
                    this.generateWoodDrawBoard(lft,ty,rgt,by,edgeSize,woodColor);
                    this.generateWoodDrawBoard(lft,by,rgt,this.colorCanvas.height,edgeSize,woodColor);
                    break;
                case 4:
                    this.generateWoodDrawBoard(lft,-edgeSize,rgt,(this.colorCanvas.height+edgeSize),edgeSize,woodColor);
                    break;
            }
            
            lft=rgt;
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
