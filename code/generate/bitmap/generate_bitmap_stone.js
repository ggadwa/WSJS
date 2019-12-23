import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate stone bitmap class
//

export default class GenerateBitmapStoneClass extends GenerateBitmapBaseClass
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
    
    generateInternal(variationMode)
    {
        let y,yCount,yAdd;
        let lft,rgt,top,bot;
        let drawStoneColor;
        let edgeSize,xRoundFactor,yRoundFactor,normalZFactor;
        let paddingSize,xOff,yOff;
        
        let stoneColor=this.getRandomColor();
        let altStoneColor=this.getRandomColor();
        let groutColor=this.getRandomGray(0.2,0.3);
        let outlineColor=null; // this.adjustColor(groutColor,0.95);        // this doesn't make it any better
        
            // the noise grout
            
        this.drawRect(0,0,this.colorImgData.width,this.colorImgData.height,groutColor);
        this.createPerlinNoiseData(16,16);
        this.drawPerlinNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height,0.6,1.2);
        this.drawStaticNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height,0.7,1.1);
        this.blur(this.colorImgData.data,0,0,this.colorImgData.width,this.colorImgData.height,1,false);
        
        this.createNormalNoiseData(2.5,0.5);
        this.drawNormalNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height);
        this.blur(this.normalImgData.data,0,0,this.colorImgData.width,this.colorImgData.height,1,false);
        
            // noise for stones
            
        this.createPerlinNoiseData(64,64);
        this.createNormalNoiseData(5.0,0.3);
        
            // draw the stones
            
        yCount=GenerateUtilityClass.randomInt(6,6);
        yAdd=Math.trunc(this.colorImgData.height/yCount);
        
        top=0;
        
        for (y=0;y!==yCount;y++) {
            bot=(y===(yCount-1))?this.colorImgData.height:(top+yAdd);
            
            lft=0;
            
            while (true) {
                rgt=lft+GenerateUtilityClass.randomInt(yAdd,Math.trunc(yAdd*0.5));
                if (rgt>this.colorImgData.width) rgt=this.colorImgData.width;

                    // special check if next stone would be too small,
                    // so enlarge this stone to cover it
                    
                if ((this.colorImgData.width-rgt)<yAdd) {
                    rgt=this.colorImgData.width;
                }
                
                    // the stone itself
                    
                drawStoneColor=this.adjustColorRandom((GenerateUtilityClass.randomPercentage(0.7)?stoneColor:altStoneColor),0.7,1.2);

                paddingSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorImgData.width*0.005),Math.trunc(this.colorImgData.width*0.01));  // stones aren't lined up
                xOff=GenerateUtilityClass.randomInt(0,paddingSize);
                yOff=GenerateUtilityClass.randomInt(0,paddingSize);

                edgeSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorImgData.width*0.05),Math.trunc(this.colorImgData.width*0.1));     // new edge size as stones aren't the same
                xRoundFactor=GenerateUtilityClass.randomFloat(0.02,0.05);
                yRoundFactor=GenerateUtilityClass.randomFloat(0.02,0.05);
                normalZFactor=GenerateUtilityClass.randomFloat(0.2,0.2);        // different z depths

                this.drawOval((lft+xOff),(top+yOff),((rgt+xOff)-paddingSize),((bot+yOff)-paddingSize),0,1,xRoundFactor,yRoundFactor,edgeSize,0.5,drawStoneColor,outlineColor,normalZFactor,false,true,0.4,1.2);

                    // gravity distortions to make stones unique
                    
                this.gravityDistortEdges((lft+xOff),(top+yOff),((rgt+xOff)-paddingSize),((bot+yOff)-paddingSize),5,20,5);

                lft=rgt;
                if (rgt===this.colorImgData.width) break;
            }
            
            top+=yAdd;
        }
        
            // finish with the specular

        this.createSpecularMap(0.5);
    }
}
