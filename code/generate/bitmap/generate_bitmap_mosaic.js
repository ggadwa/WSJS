import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';

//
// generate mosaic bitmap class
//

export default class GenerateBitmapMosaicClass extends GenerateBitmapBaseClass
{
    constructor(core,colorScheme)
    {
        super(core,colorScheme);
        
        this.VARIATION_NONE=0;
        
        this.hasNormal=true;
        this.hasSpecular=true;
        this.hasGlow=false;
        
        Object.seal(this);
    }
       
        //
        // mosaic bitmaps
        //

    generateInternal(variationMode)
    {
        let x,y,lft,rgt,top,bot,tileWid,tileHigh;
        let splitCount;
        let groutColor,mosaicColor,mosaic2Color;
        let col;
        
            // some random values

        splitCount=this.core.randomInt(15,10);
        
        groutColor=this.getRandomGray(0.4,0.6);
        mosaicColor=this.getRandomColor();
        mosaic2Color=this.getRandomColor();
        
        col=new ColorClass(0,0,0);
        
            // tile sizes
            
        tileWid=this.colorImgData.width/splitCount;
        tileHigh=this.colorImgData.height/splitCount;

            // clear canvases to grout

        this.drawRect(0,0,this.colorImgData.width,this.colorImgData.height,groutColor);
        this.createPerlinNoiseData(16,16);
        this.drawPerlinNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height,0.6,1.0);
        this.drawStaticNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height,0.7,1.0);
        this.blur(this.colorImgData.data,0,0,this.colorImgData.width,this.colorImgData.height,1,false);
        
        this.createNormalNoiseData(2.5,0.5);
        this.drawNormalNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height);
        this.blur(this.normalImgData.data,0,0,this.colorImgData.width,this.colorImgData.height,1,false);

            // use a perlin noise rect for the colors
        
        this.createPerlinNoiseData(32,32);
        
            // draw the tiles
        
        for (y=0;y!==splitCount;y++) {
            for (x=0;x!==splitCount;x++) {
                
                    // slightly random position
                    
                lft=Math.trunc(x*tileWid)+this.core.randomInt(0,3);
                rgt=Math.trunc((x*tileWid)+tileWid)-this.core.randomInt(0,3);
                top=Math.trunc(y*tileHigh)+this.core.randomInt(0,3);
                bot=Math.trunc((y*tileHigh)+tileHigh)-this.core.randomInt(0,3);
                
                    // the color

                col.setFromColorFactor(mosaicColor,mosaic2Color,this.getPerlineColorFactorForPosition(lft,top));

                    // draw
                    
                this.drawRect(lft,top,rgt,bot,col);
                this.draw3DFrameRect(lft,top,rgt,bot,1,col,true);
                
                    // noise and blur
                
                this.drawStaticNoiseRect(lft,top,rgt,bot,1.1,1.3);
                this.blur(lft,top,rgt,bot,1,true);
            }
        }

            // finish with the specular

        this.createSpecularMap(120,0.5);
    }

}
