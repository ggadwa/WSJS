import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate stone bitmap class
//

export default class GenBitmapStoneClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
    
        //
        // stone bitmaps
        //

    generateStone()
    {
        let n,k,rect,edgeSize,clipMargin;
        let drawStoneColor,drawEdgeColor,lineColor,darken,f;
        let x,y,x2,y2,lineCount,lineVarient,stoneWid,stoneHigh;

            // some random values

        let stoneColor=this.getRandomColor();
        let groutColor=this.dullColor(stoneColor,0.7);
        let edgeColor=this.darkenColor(stoneColor,0.8);
        
        let padding=genRandom.randomInt(3,10);

        let segments=this.createRandomSegments();
        let darkenFactor=0.5;

            // clear canvases

        this.drawRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,groutColor);
        this.addNoiseRect(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,0.6,0.8,0.9);
        this.blur(0,0,this.bitmapCanvas.width,this.bitmapCanvas.height,5,false);

            // draw the stones

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];

            f=1.0;
            if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=this.bitmapCanvas.width) && (rect.bot<=this.bitmapCanvas.height)) {        // don't darken stones that fall off edges
                f=genRandom.random()+darkenFactor;
                if (f>1.0) f=1.0;
            }

            drawStoneColor=this.darkenColor(stoneColor,f);
            drawEdgeColor=this.darkenColor(edgeColor,f);

            edgeSize=genRandom.randomInt(5,12);     // new edge size as stones aren't the same

            this.draw3DComplexRect(rect.lft,rect.top,(rect.rgt-padding),(rect.bot-padding),edgeSize,drawStoneColor,drawEdgeColor);
            this.blur((rect.lft+edgeSize),(rect.top+edgeSize),(rect.rgt-(padding+edgeSize)),(rect.bot-(padding+edgeSize)),4,false);
            
                // cracked lines
                
            stoneWid=(rect.rgt-rect.lft)-((edgeSize*2)+padding);
            stoneHigh=(rect.bot-rect.top)-((edgeSize*2)+padding);
            lineCount=genRandom.randomInt(3,8);
            
            clipMargin=padding+edgeSize;
            
            for (k=0;k!==lineCount;k++) {
                x=genRandom.randomInt((rect.lft+edgeSize),stoneWid);
                y=genRandom.randomInt((rect.top+edgeSize),stoneHigh);
                x2=genRandom.randomInt((rect.lft+edgeSize),stoneWid);
                y2=genRandom.randomInt((rect.top+edgeSize),stoneHigh);
                
                lineVarient=20;
                if (lineVarient>stoneWid) lineVarient=stoneWid;
                if (lineVarient>stoneHigh) lineVarient=stoneHigh;
                
                darken=0.9+(genRandom.random()*0.1);
                lineColor=this.darkenColor(drawStoneColor,darken);
                this.drawRandomLine(x,y,x2,y2,(rect.lft+clipMargin),(rect.top+clipMargin),(rect.rgt-clipMargin),(rect.bot-clipMargin),lineVarient,lineColor,false);
            }
            
                // redo the fill, but just do the edges so we
                // erase any lines that went over
                
            this.draw3DComplexRect(rect.lft,rect.top,(rect.rgt-padding),(rect.bot-padding),edgeSize,null,drawEdgeColor);
            
                 // any random noise
                
            this.addNoiseRect(rect.lft,rect.top,rect.rgt,rect.bot,0.8,1.0,0.4);
        }

            // finish with the specular

        this.createSpecularMap(0.5);
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateStone();
    }

}
