import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate ground bitmap class
//

export default class GenBitmapGroundClass extends GenBitmapBaseClass
{
    constructor(view)
    {    
        super(view,true,true,false);
        Object.seal(this);
    }
        
        //
        // fur
        //
        
    generateGrass()
    {
        let x,y;
        let darken,lineColor;
        let halfHigh=Math.trunc(this.bitmapCanvas.height*0.5);
        let grassColor=this.getRandomGrassColor();
        
        this.drawRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,grassColor);

            // grass
            
        for (x=0;x!==this.bitmapCanvas.width;x++) {
            
                // grass color
                
            darken=0.5+(genRandom.random()*0.3);
            lineColor=this.darkenColor(grassColor,darken);
            
                // hair half from top
                
            y=halfHigh+genRandom.randomInt(0,halfHigh);
            this.drawRandomLine(x,0,x,(y+5),0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,10,lineColor,false);
            
                // hair half from bottom
                
            y=this.bitmapCanvas.height-(halfHigh+genRandom.randomInt(0,halfHigh));
            this.drawRandomLine(x,(y-5),x,this.bitmapCanvas.height,0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,10,lineColor,false);
        }
    }
    
        //
        // generate mainline
        //

    generateInternal()
    {
            // create the bitmap

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generateGrass();
                break;

        }

            // finish with the specular

        this.createSpecularMap(0.4);
    }

}
