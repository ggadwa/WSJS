import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';

//
// generate hexagon bitmap class
//

export default class GenerateBitmapHexagonClass extends GenerateBitmapBaseClass
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
        // hexagonal
        //
        
    generateInternal(variationMode)
    {
        let x,y,lft,top,pointSize;
        let color,edgeSize;
        let xCount,yCount,xSize,ySize;
        
            // colors
            
        color=this.getRandomColor();
        
            // sizing
        
        edgeSize=this.core.randomInt(3,5);
        xCount=2+(2*this.core.randomInt(0,2));
        yCount=2+(2*this.core.randomInt(0,5));
        
        xSize=Math.trunc(this.colorImgData.width/xCount);
        ySize=Math.trunc(this.colorImgData.height/yCount);
        
        pointSize=Math.trunc(xSize*0.1);
        
        lft=0;
        
        for (x=0;x<=xCount;x++) {
            top=((x&0x1)===0)?0:-Math.trunc(ySize*0.5);
        
            for (y=0;y<=yCount;y++) {
                this.drawHexagon(lft,top,(Math.trunc(lft+xSize)-pointSize),Math.trunc(top+ySize),pointSize,edgeSize,color);
                top+=ySize;
            }
            
            lft+=xSize;
        }
        
            // finish with the specular

        this.createSpecularMap(120,0.6);
    }

}
