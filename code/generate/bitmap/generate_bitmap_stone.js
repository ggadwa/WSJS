import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate stone bitmap class
//

export default class GenerateBitmapStoneClass extends GenerateBitmapBaseClass
{
    constructor(core)
    {
        super(core,true,true,false);
        Object.seal(this);
    }
    
    generateInternal()
    {
        let n,seg,wid,high;
        let drawStoneColor;
        let edgeSize,xRoundFactor,yRoundFactor,normalZFactor;
        
        let stoneColor=this.getRandomColor();
        let altStoneColor=this.getRandomColor();
        let groutColor=this.getRandomGray(0.7,0.2);
        
            // create segments
            
        let segments=this.createRandomSegments();

            // the noise grout
            
        this.drawRect(0,0,this.colorImgData.width,this.colorImgData.height,groutColor);
        this.drawStaticNoiseRect(0,0,this.colorCanvas.width,this.colorCanvas.height,0.7,1.1);
        this.blur(this.colorImgData.data,0,0,this.colorCanvas.width,this.colorCanvas.height,1,false);
        
            // noise for stones
            
        this.createPerlinNoiseData(32,32);
        this.createNormalNoiseData(2.0,0.4);
        
            // draw the stones

        for (n=0;n!==segments.length;n++) {
            seg=segments[n];
            drawStoneColor=this.adjustColorRandom((GenerateUtilityClass.randomPercentage(0.7)?stoneColor:altStoneColor),0.7,1.2);
            
            wid=seg.rgt-seg.lft;
            high=seg.bot-seg.top;
            
            edgeSize=GenerateUtilityClass.randomInt(Math.trunc(wid*0.4),Math.trunc(wid*0.2));     // new edge size as stones aren't the same
            xRoundFactor=GenerateUtilityClass.randomFloat(0.02,0.05);
            yRoundFactor=GenerateUtilityClass.randomFloat(0.02,0.05);
            normalZFactor=GenerateUtilityClass.randomFloat(0.2,0.2);        // different z depths

            this.drawOval(seg.lft,seg.top,seg.rgt,seg.bot,0,1,xRoundFactor,yRoundFactor,edgeSize,drawStoneColor,null,normalZFactor,false,true,0.4,1.0);
        }
        
            // finish with the specular

        this.createSpecularMap(0.5);
    }
}
