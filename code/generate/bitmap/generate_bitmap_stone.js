import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';

//
// generate stone bitmap class
//

export default class GenerateBitmapStoneClass extends GenerateBitmapBaseClass
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
    
    generateInternal(variationMode)
    {
        let y,yCount,yAdd;
        let lft,rgt,top,bot;
        let drawStoneColor;
        let edgeSize,xRoundFactor,yRoundFactor,normalZFactor;
        let xOff,yOff;
        
        let stoneColor=this.getRandomColor();
        let altStoneColor=this.getRandomColor();
        let groutColor=this.getRandomGray(0.35,0.55);
        let outlineColor=null; // this.adjustColor(groutColor,0.95);        // this doesn't make it any better
        
            // the noise grout
            
        this.drawRect(0,0,this.colorImgData.width,this.colorImgData.height,groutColor);
        this.createPerlinNoiseData(16,16);
        this.drawPerlinNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height,0.4,1.2);
        this.drawStaticNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height,0.7,1.1);
        this.blur(this.colorImgData.data,0,0,this.colorImgData.width,this.colorImgData.height,1,false);
        
        this.createNormalNoiseData(2.5,0.5);
        this.drawNormalNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height);
        this.blur(this.normalImgData.data,0,0,this.colorImgData.width,this.colorImgData.height,1,false);
        
            // noise for stones
            
        this.createPerlinNoiseData(32,32);
        this.createNormalNoiseData(5.0,0.3);
        
            // draw the stones
            
        yCount=this.core.randomInt(4,4);
        yAdd=Math.trunc(this.colorImgData.height/yCount);
        
        top=0;
        
        for (y=0;y!==yCount;y++) {
            bot=(y===(yCount-1))?this.colorImgData.height:(top+yAdd);
            
            lft=0;
            
            while (true) {
                rgt=lft+this.core.randomInt(yAdd,Math.trunc(yAdd*0.8));
                if (rgt>this.colorImgData.width) rgt=this.colorImgData.width;

                    // special check if next stone would be too small,
                    // so enlarge this stone to cover it
                    
                if ((this.colorImgData.width-rgt)<yAdd) {
                    rgt=this.colorImgData.width;
                }
                
                    // the stone itself
                    
                drawStoneColor=this.adjustColorRandom((this.core.randomPercentage(0.7)?stoneColor:altStoneColor),0.7,1.2);

                xOff=this.core.randomInt(0,Math.trunc(this.colorImgData.width*0.01));
                yOff=this.core.randomInt(0,Math.trunc(this.colorImgData.width*0.01));

                edgeSize=this.core.randomInt(Math.trunc(this.colorImgData.width*0.1),Math.trunc(this.colorImgData.width*0.2));     // new edge size as stones aren't the same
                xRoundFactor=this.core.randomFloat(0.02,0.05);
                yRoundFactor=this.core.randomFloat(0.02,0.05);
                normalZFactor=this.core.randomFloat(0,0.2);        // different z depths

                this.drawOval((lft+xOff),(top+yOff),(rgt+xOff),(bot+yOff),0,1,xRoundFactor,yRoundFactor,edgeSize,0.5,drawStoneColor,outlineColor,normalZFactor,false,true,0.4,1.2);

                    // gravity distortions to make stones unique
                    
                this.gravityDistortEdges((lft+xOff),(top+yOff),(rgt+xOff),(bot+yOff),5,20,5);

                lft=rgt;
                if (rgt===this.colorImgData.width) break;
            }
            
            top+=yAdd;
        }
        
            // finish with the specular

        this.createSpecularMap(125,0.5);
    }
}
