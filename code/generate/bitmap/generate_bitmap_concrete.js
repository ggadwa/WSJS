import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate concrete bitmap class
//

export default class GenerateBitmapConcreteClass extends GenerateBitmapBaseClass
{
    static VARIATION_NONE=0;
    
    constructor(core,colorSchemeName)
    {
        super(core,colorSchemeName);
        
        this.hasNormal=true;
        this.hasSpecular=true;
        this.hasGlow=false;
        
        Object.seal(this);
    }
        
        //
        // concrete bitmaps
        //

    generateInternal(variationMode)
    {
        let concreteColor=this.getRandomColor();
        let jointColor=this.adjustColorRandom(concreteColor,0.75,0.85);
        
            // the concrete background
            
        
        this.drawRect(0,0,this.colorImgData.width,this.colorImgData.height,concreteColor);
        
        this.createPerlinNoiseData(16,16);
        this.drawPerlinNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height,0.6,1.0);
        
        this.createNormalNoiseData(3.0,0.4);
        this.drawNormalNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height);
        
            // concrete expansion cuts
            
        if (GenerateUtilityClass.randomPercentage(0.5)) {
            this.drawLineColor(1,0,1,this.colorImgData.height,jointColor,true);
            this.drawLineNormal(1,0,1,this.colorImgData.height,this.NORMAL_CLEAR);
            this.drawLineNormal(0,0,0,this.colorImgData.height,this.NORMAL_RIGHT_45);
            this.drawLineNormal(2,0,2,this.colorImgData.height,this.NORMAL_LEFT_45);
        }

        if (GenerateUtilityClass.randomPercentage(0.5)) {
            this.drawLineColor(0,1,this.colorImgData.width,1,jointColor,true);
            this.drawLineNormal(0,1,this.colorImgData.width,1,this.NORMAL_CLEAR);
            this.drawLineNormal(0,0,this.colorImgData.width,0,this.NORMAL_BOTTOM_45);
            this.drawLineNormal(0,2,this.colorImgData.width,2,this.NORMAL_TOP_45);
        }
        
            // finish with the specular

        this.createSpecularMap(0.3);
    }

}
