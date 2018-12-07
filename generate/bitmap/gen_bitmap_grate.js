import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate grate bitmap class
//

export default class GenBitmapGrateClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
        
        //
        // metal bitmaps
        //
    
    generateGrate(wid,high)
    {
        let x,y;
        let dx,dy,sx,sy,ex,ey;
        let idx,line,lineStyle;
        let lines=[];
        let metalCorrColor,corrCount;
        let corrWid,corrHigh;
        let lineWid,lineHigh;

            // some random values

        let metalColor=this.getRandomMetalColor();

        let edgeSize=genRandom.randomInt(4,8);
        let innerEdgeSize=genRandom.randomInt(4,10)+edgeSize;
        
        let screwSize=genRandom.randomInt(10,20);
        let screwInnerSize=Math.trunc(screwSize*0.4);
        let screwColor=this.boostColor(metalColor,0.05);
        
            // clear canvases

        this.clearNormalsRect(0,0,wid,high);
        
            // the plates and streaks
            
        this.draw3DRect(0,0,wid,high,edgeSize,metalColor,genRandom.randomPercentage(0.5));
        this.generateMetalStreakShine(edgeSize,edgeSize,(wid-edgeSize),(high-edgeSize),wid,high,metalColor);
            
            // grate corrugation
 
        metalCorrColor=this.darkenColor(metalColor,0.6);

        corrCount=genRandom.randomInt(8,15);
        corrWid=Math.trunc((wid-(innerEdgeSize*2))/corrCount);
        corrHigh=Math.trunc((high-(innerEdgeSize*2))/corrCount);

        lineWid=corrWid-4;
        lineHigh=corrHigh-4;

            // corrugated styles

        lines.push([[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]]]);      // diamonds
        lines.push([[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]]]);      // waves
        lines.push([[[0.5,0.0],[0.5,1.0]],[[0.0,0.5],[1.0,0.5]],[[0.0,0.5],[1.0,0.5]],[[0.5,0.0],[0.5,1.0]]]);      // pluses

        lineStyle=genRandom.randomIndex(lines.length);

            // corrugations

        dy=Math.trunc((high-(corrHigh*corrCount))*0.5);

        for (y=0;y!==corrCount;y++) {

            dx=Math.trunc((wid-(corrWid*corrCount))*0.5);

            for (x=0;x!==corrCount;x++) {

                idx=((y&0x1)*2)+(x&0x1);
                line=lines[lineStyle][idx];

                sx=dx+(line[0][0]*lineWid);
                sy=dy+(line[0][1]*lineHigh);
                ex=dx+(line[1][0]*lineWid);
                ey=dy+(line[1][1]*lineHigh);

                this.drawBumpLine(sx,sy,ex,ey,9,metalCorrColor);

                dx+=corrWid;
            }

            dy+=corrHigh;
        }
        
            // possible screws
            
        this.generateMetalScrewsRandom(edgeSize,edgeSize,(wid-edgeSize),(high-edgeSize),screwColor,screwSize,screwInnerSize);
        
            // finish with the specular

        this.createSpecularMap(wid,high,0.6);
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

        this.generateGrate(wid,high);
    }

}
