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
        let col=this.darkenColor(woodColor,GenerateUtilityClass.randomFloat(0.7,0.3));
        let frameColor=this.darkenColor(col,0.7);
        
            // the board edge
            
        this.drawRect(lft,top,rgt,bot,col);
        this.draw3DFrameRect(lft,top,rgt,bot,edgeSize,frameColor,true);
        
            // stripes and a noise overlay
            
        if ((bot-top)>(rgt-lft)) {
            this.drawColorStripeVertical((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        }
        else {
            this.drawColorStripeHorizontal((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        }
        
        this.drawPerlinNoiseRect((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.8,1.0);
        
            // blur both the color and the normal
            
        this.blur(this.colorImgData.data,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),2,true);
        this.blur(this.normalImgData.data,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),5,true);
    }

    generateInternal()
    {
        let n,y,ty,by,lft,rgt;
        
            // some random values

        let boardCount=GenerateUtilityClass.randomInt(4,8);
        let boardSize=Math.trunc(this.colorCanvas.width/boardCount);
        let edgeSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorCanvas.width*0.005),Math.trunc(this.colorCanvas.width*0.005));
        let woodColor=this.getRandomColor();
        
            // perlin noise
            
        this.createPerlinNoiseData(32,32);

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

}
