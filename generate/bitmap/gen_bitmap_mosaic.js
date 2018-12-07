import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate mosaic bitmap class
//

export default class GenBitmapMosaicClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
       
        //
        // mosaic bitmaps
        //

    generateMosaic(wid,high)
    {
        let x,y,lft,rgt,top,bot,tileWid,tileHigh;
        let splitCount,borderSize,edgeSize;
        let mortarColor,borderColor,mosaicColor,mosaic2Color,col;
        
            // some random values

        splitCount=genRandom.randomInt(5,5);
        borderSize=genRandom.randomInt(2,5);
        edgeSize=genRandom.randomInt(1,2);
        
        borderColor=this.getRandomColor();
        mortarColor=this.dullColor(borderColor,0.7);
        
        mosaicColor=this.getRandomColor();
        mosaic2Color=this.darkenColor(mosaicColor,0.5);
        
            // tile sizes
            
        tileWid=wid/splitCount;
        tileHigh=high/splitCount;

            // clear canvases to mortar

        this.drawRect(0,0,wid,high,mortarColor);
        this.addNoiseRect(0,0,wid,high,0.6,0.8,0.9);

        this.clearNormalsRect(0,0,wid,high);        

            // draw the tiles
        
        top=0;
        
        for (y=0;y!==splitCount;y++) {

            bot=(top+tileHigh)-borderSize;
            
            lft=0;

            for (x=0;x!==splitCount;x++) {
                
                    // the tile
                    
                if ((x===0) || (y===0) || (x===(splitCount-1)) || (y===(splitCount-1))) {
                    col=borderColor;
                }
                else {
                    col=(genRandom.randomPercentage(0.5))?mosaicColor:mosaic2Color;
                }

                rgt=(lft+tileWid)-borderSize;

                this.draw3DRect(Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),edgeSize,col,true);
                
                    // noise and blur
                
                this.addNoiseRect(Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),1.1,1.3,0.5);
                this.blur(Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),3,false);
                
                    // any cracks
                    
                this.drawSmallCrack(Math.trunc(lft),Math.trunc(top),Math.trunc(rgt),Math.trunc(bot),edgeSize,col);

                lft+=tileWid;
            }
            
            top+=tileHigh;
        }

            // finish with the specular

        this.createSpecularMap(wid,high,0.5);
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        let wid,high;

        wid=this.bitmapCanvas.width;
        high=this.bitmapCanvas.height;

            // create the bitmap

        this.generateMosaic(wid,high);
    }

}
