import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate hexagon bitmap class
//

export default class GenerateBitmapHexagonClass extends GenerateBitmapBaseClass
{
    static VARIATION_NONE=0;
    
    constructor(core)
    {
        super(core,true,true,false);
        Object.seal(this);
    }
    
        //
        // hexagonal
        //
        
    generateInternal(variationMode)
    {
        let color,edgeColor,edgeSize;
        let xCount,yCount,xSize,ySize;
        let x,y,lft,top;

            // colors
            
        color=this.getRandomColor();
        edgeColor=this.darkenColor(color,0.8);
        
            // sizing
        
        edgeSize=GenerateUtilityClass.randomInt(2,3);
        xCount=2+(2*GenerateUtilityClass.randomInt(0,2));
        yCount=2+(2*GenerateUtilityClass.randomInt(0,5));
        
        xSize=Math.trunc(this.bitmapCanvas.width/xCount);
        ySize=Math.trunc(this.bitmapCanvas.height/yCount);
        
        top=-Math.trunc(ySize/2);
        
        for (y=0;y<=(yCount*2);y++) {
            
            lft=((y%2)===0)?0:xSize;
            
            for (x=0;x<=xCount;x+=2) {
                this.draw3DHexagon(this.bitmapCanvas.width,this.bitmapCanvas.height,lft,top,Math.trunc(lft+xSize),Math.trunc(top+ySize),edgeSize,color,edgeColor);
                lft+=(xSize*2);
            }
            
            top+=(ySize/2);
        }
        
            // finish with the specular

        this.createSpecularMap(0.6);
    }

}
