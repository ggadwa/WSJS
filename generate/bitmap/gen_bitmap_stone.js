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

    generateStone(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,k,rect,edgeSize,clipMargin;
        let drawStoneColor,drawEdgeColor,lineColor,darken,f;
        let x,y,x2,y2,lineCount,lineVarient,stoneWid,stoneHigh;

            // some random values

        let stoneColor=this.getRandomColor();
        let groutColor=this.dullColor(stoneColor,0.7);
        let edgeColor=this.darkenColor(stoneColor,0.8);
        
        let padding=genRandom.randomInt(3,10);

        let segments=this.createRandomSegments(wid,high);
        let darkenFactor=0.5;

            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,groutColor);
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);
        this.blur(bitmapCTX,0,0,wid,high,5,false);

        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // draw the stones

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];

            f=1.0;
            if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=wid) && (rect.bot<=high)) {        // don't darken stones that fall off edges
                f=genRandom.random()+darkenFactor;
                if (f>1.0) f=1.0;
            }

            drawStoneColor=this.darkenColor(stoneColor,f);
            drawEdgeColor=this.darkenColor(edgeColor,f);

            edgeSize=genRandom.randomInt(5,12);     // new edge size as stones aren't the same

            this.draw3DComplexRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-padding),(rect.bot-padding),edgeSize,drawStoneColor,drawEdgeColor);
            this.blur(bitmapCTX,(rect.lft+edgeSize),(rect.top+edgeSize),(rect.rgt-(padding+edgeSize)),(rect.bot-(padding+edgeSize)),4,false);
            
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
                this.drawRandomLine(bitmapCTX,normalCTX,x,y,x2,y2,(rect.lft+clipMargin),(rect.top+clipMargin),(rect.rgt-clipMargin),(rect.bot-clipMargin),lineVarient,lineColor,false);
            }
            
                // redo the fill, but just do the edges so we
                // erase any lines that went over
                
            this.draw3DComplexRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-padding),(rect.bot-padding),edgeSize,null,drawEdgeColor);
            
                 // any random noise
                
            this.addNoiseRect(bitmapCTX,rect.lft,rect.top,rect.rgt,rect.bot,0.8,1.0,0.4);
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
    }

        //
        // generate mainline
        //

    generateInternal(inDebug)
    {
        let wid,high;
        let bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX,glowCanvas,glowCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=this.BITMAP_MAP_TEXTURE_SIZE;
        bitmapCanvas.height=this.BITMAP_MAP_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        normalCanvas=document.createElement('canvas');
        normalCanvas.width=this.BITMAP_MAP_TEXTURE_SIZE;
        normalCanvas.height=this.BITMAP_MAP_TEXTURE_SIZE;
        normalCTX=normalCanvas.getContext('2d');

        specularCanvas=document.createElement('canvas');
        specularCanvas.width=this.BITMAP_MAP_TEXTURE_SIZE;
        specularCanvas.height=this.BITMAP_MAP_TEXTURE_SIZE;
        specularCTX=specularCanvas.getContext('2d');
        
        glowCanvas=document.createElement('canvas');
        glowCanvas.width=2;
        glowCanvas.height=2;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,2,2);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        this.generateStone(bitmapCTX,normalCTX,specularCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],10.0));    
    }

}
