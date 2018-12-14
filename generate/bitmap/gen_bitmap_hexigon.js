import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate hexigon bitmap class
//

export default class GenBitmapHexigonClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
    
        //
        // hexagonal
        //
        
    generateHexagonal()
    {
        let color,edgeColor,edgeSize;
        let xCount,yCount,xSize,ySize;
        let x,y,lft,top;

            // colors
            
        color=this.getRandomColor();
        edgeColor=this.darkenColor(color,0.8);
        
            // sizing
        
        edgeSize=genRandom.randomInt(2,3);
        xCount=2+(2*genRandom.randomInt(0,2));
        yCount=2+(2*genRandom.randomInt(0,5));
        
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

        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateHexagonal();
    }

}
