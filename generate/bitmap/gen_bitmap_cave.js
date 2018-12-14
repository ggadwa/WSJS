import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate cave bitmap class
//

export default class GenBitmapCaveClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
    
        //
        // cave bitmaps
        //

    generateCave()
    {
        let n,rect,edgeSize;
        let drawStoneColor,drawEdgeColor,f;

            // some random values

        let dirtColor=this.getRandomDirtColor();
        let stoneColor=this.getRandomGray(0.4,0.6);
        let edgeColor=this.darkenColor(stoneColor,0.8);
        
        let padding=genRandom.randomInt(0,5);
        
        let segments=this.createRandomSegments();
        let darkenFactor=0.5;

            // clear canvases

        this.drawRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,dirtColor);
        this.addNoiseRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,0.6,0.8,0.9);
        this.blur(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,5,false);

            // draw the stones

        for (n=0;n!==segments.length;n++) {
            if (genRandom.randomPercentage(0.5)) continue;
            
            rect=segments[n];

            f=1.0;
            if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=this.bitmapCanvas.width) && (rect.bot<=this.bitmapCanvas.height)) {        // don't darken stones that fall off edges
                f=genRandom.random()+darkenFactor;
                if (f>1.0) f=1.0;
            }
            
            drawStoneColor=this.darkenColor(stoneColor,f);
            drawEdgeColor=this.darkenColor(edgeColor,f);

            edgeSize=genRandom.randomInt(3,5);     // new edge size as stones aren't the same

            this.draw3DComplexOval(rect.lft,rect.top,(rect.rgt-padding),(rect.bot-padding),edgeSize,drawStoneColor,drawEdgeColor);
        }

            // finish with the specular

        this.createSpecularMap(0.7);
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateCave();
    }

}
