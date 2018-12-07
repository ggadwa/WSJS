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
        
    generateGrass(wid,high)
    {
        let x,y;
        let darken,lineColor;
        let halfHigh=Math.trunc(high*0.5);
        let grassColor=this.getRandomGrassColor();
        
        this.drawRect(0,0,wid,high,grassColor);

            // grass
            
        for (x=0;x!==wid;x++) {
            
                // grass color
                
            darken=0.5+(genRandom.random()*0.3);
            lineColor=this.darkenColor(grassColor,darken);
            
                // hair half from top
                
            y=halfHigh+genRandom.randomInt(0,halfHigh);
            this.drawRandomLine(x,0,x,(y+5),0,0,wid,high,10,lineColor,false);
            
                // hair half from bottom
                
            y=high-(halfHigh+genRandom.randomInt(0,halfHigh));
            this.drawRandomLine(x,(y-5),x,high,0,0,wid,high,10,lineColor,false);
        }
    }
    
        //
        // generate mainline
        //

    generateInternal()
    {
        let wid,high,mx,my;

        wid=this.bitmapCanvas.width;
        high=this.bitmapCanvas.height;
        
        mx=Math.trunc(wid*0.5);
        my=Math.trunc(high*0.5);
         
            // clear canvases

        this.drawRect(0,0,wid,high,this.whiteColor);
        this.clearNormalsRect(0,0,wid,high);

            // create the bitmap

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generateGrass(wid,high);
                break;

        }

            // finish with the specular

        this.createSpecularMap(wid,high,0.4);
    }

}
