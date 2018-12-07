import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate cement bitmap class
//

export default class GenBitmapCementClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
        
        //
        // cement bitmaps
        //

    generateCement(wid,high)
    {
        let n,nLine,markCount,x,y,y2;
        let particleWid,particleHigh,particleDensity,particleRingCount,particleDarken;
        let edgeSize,concreteColor,lineColor,line2Color;

            // some random values

        concreteColor=this.getRandomGray(0.4,0.7);
        lineColor=this.darkenColor(concreteColor,0.95);
        line2Color=this.boostColor(concreteColor,0.05);

            // clear canvases

        this.clearNormalsRect(0,0,wid,high);
        
            // random edging
            
        if (genRandom.randomPercentage(0.5)) {
            edgeSize=genRandom.randomInt(5,5);
            this.draw3DRect(0,0,wid,high,edgeSize,concreteColor,true);
        }
        else {
            edgeSize=0;
            this.drawRect(0,0,wid,high,concreteColor);
        }
        
            // the stress lines
        
        nLine=genRandom.randomInt(100,100);
        
        for (n=0;n!==nLine;n++) {
            x=genRandom.randomInBetween((edgeSize+3),(wid-(edgeSize+3)));
            
            y=genRandom.randomInBetween((edgeSize+3),Math.trunc(high/2));
            y2=y+genRandom.randomInt(20,Math.trunc((high/2)-(edgeSize+23)));
            
            if ((n%2)===0) {
                y=high-y;
                y2=high-y2;
            }
            
            this.drawLine(x,y,x,y2,(((n%2)===0)?lineColor:line2Color),true);
        }
        
            // marks

        markCount=genRandom.randomInt(5,20);
        
        for (n=0;n!==markCount;n++) {
            particleWid=genRandom.randomInt(100,100);
            particleHigh=genRandom.randomInt(100,100);
            particleDensity=genRandom.randomInt(150,250);
            particleRingCount=genRandom.randomInt(8,8);
            particleDarken=0.95-(genRandom.random()*0.15);

            x=genRandom.randomInt(edgeSize,wid);
            y=genRandom.randomInt(edgeSize,high);

            this.drawParticle(wid,high,x,y,(x+particleWid),(y+particleHigh),particleRingCount,particleDarken,particleDensity,false);
        }

            // noise
            
        this.addNoiseRect(0,0,wid,high,0.6,0.8,0.8);
        this.blur(0,0,wid,high,3,false);
        
        this.addNoiseRect(0,0,wid,high,0.8,0.9,0.7);
        this.blur(0,0,wid,high,3,false);
        
        this.addNoiseRect(0,0,wid,high,1.0,1.2,0.6);
        this.blur(0,0,wid,high,3,false);
        
            // finish with the specular

        this.createSpecularMap(wid,high,0.4);
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

        this.generateCement(wid,high);
    }

}
