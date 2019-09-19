import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate stone bitmap class
//

export default class GenerateBitmapStoneClass extends GenerateBitmapBaseClass
{
    constructor(core)
    {
        super(core,true,true,false);
        Object.seal(this);
    }
    
        //
        // stone bitmaps
        //

    drawSingleStone(lft,top,rgt,bot,stoneColor)
    {
        let n,nChunk;
        let lft2,top2,wid2,high2,xRoundFactor,yRoundFactor;
        let chunkWidStart,chunkWidAdd,chunkHighStart,chunkHighAdd;
        let wid=rgt-lft;
        let high=bot-top;
        let edgeSize;
        let edgeSizeAdd=((wid>high?high:wid)*0.5)-5;
        
            // the stone itself
            
        edgeSize=GenerateUtilityClass.randomInt(5,edgeSizeAdd);     // new edge size as stones aren't the same
        xRoundFactor=GenerateUtilityClass.randomFloat(0.01,0.05);
        yRoundFactor=GenerateUtilityClass.randomFloat(0.01,0.05);
        
        this.drawOval(lft,top,rgt,bot,0,1,xRoundFactor,yRoundFactor,edgeSize,stoneColor,false,0.7,0.8,0.2);
        
            // random chunks on stone

        nChunk=GenerateUtilityClass.randomInt(5,10);
        
        chunkWidStart=Math.trunc(wid*0.25);
        chunkWidAdd=Math.trunc(wid*0.5);
        chunkHighStart=Math.trunc(high*0.25);
        chunkHighAdd=Math.trunc(high*0.5);
        
        for (n=0;n!==nChunk;n++) {
            wid2=GenerateUtilityClass.randomInt(chunkWidStart,chunkWidAdd);
            high2=GenerateUtilityClass.randomInt(chunkHighStart,chunkHighAdd);
            
            lft2=GenerateUtilityClass.randomInt(lft,((rgt-lft)-wid2));
            top2=GenerateUtilityClass.randomInt(top,((bot-top)-high2));
            
            edgeSize=GenerateUtilityClass.randomInt(5,(((wid2>high2)?high2:wid2)-5));
            xRoundFactor=GenerateUtilityClass.randomFloat(0.01,0.05);
            yRoundFactor=GenerateUtilityClass.randomFloat(0.01,0.05);
        
            this.drawOval(lft2,top2,(lft2+wid2),(top2+high2),0,1,xRoundFactor,yRoundFactor,edgeSize,stoneColor,true,0.7,0.8,0.2);
        }
    }
    
    generateStone()
    {
        let n,k,rect,edgeSize,clipMargin;
        let drawStoneColor,drawEdgeColor,lineColor,darken,f;
        let x,y,x2,y2,lineCount,lineVarient,stoneWid,stoneHigh;
        let paddingRight,paddingBottom;
        
        
        let stoneColor=new ColorClass(GenerateUtilityClass.randomFloat(0.6,0.3),0.6,GenerateUtilityClass.randomFloat(0.6,0.2));
        
        
        //this.drawOval(50,50,150,150,0,1,40,stoneColor,true);
        
        
        //this.createSpecularMap(0.5);
        //return;

            // some random values

        //let stoneColor=this.getRandomColor();
        let groutColor=this.dullColor(stoneColor,0.7);
        let edgeColor=this.darkenColor(stoneColor,0.8);
        
        let segments=this.createRandomSegments();
        let darkenFactor=0.5;

            // clear canvases

        this.drawRect(0,0,this.colorCanvas.width,this.colorCanvas.height,groutColor);
        this.addNoiseRect(0,0,this.colorCanvas.width,this.colorCanvas.height,0.6,0.8,0.9);
        this.blur(0,0,this.colorCanvas.width,this.colorCanvas.height,5,false);

            // draw the stones

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];

            f=1.0;
            if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=this.colorCanvas.width) && (rect.bot<=this.colorCanvas.height)) {        // don't darken stones that fall off edges
                f=GenerateUtilityClass.random()+darkenFactor;
                if (f>1.0) f=1.0;
            }

            drawStoneColor=this.darkenColor(stoneColor,f);
            
            paddingRight=GenerateUtilityClass.randomInt(0,4);
            paddingBottom=GenerateUtilityClass.randomInt(0,4);

            this.drawSingleStone(rect.lft,rect.top,(rect.rgt-paddingRight),(rect.bot-paddingBottom),drawStoneColor);

            

            //this.draw3DComplexRect(rect.lft,rect.top,(rect.rgt-padding),(rect.bot-padding),edgeSize,drawStoneColor,drawEdgeColor);
            //this.blur((rect.lft+edgeSize),(rect.top+edgeSize),(rect.rgt-(padding+edgeSize)),(rect.bot-(padding+edgeSize)),4,false);
            
                // cracked lines
            /*    
            stoneWid=(rect.rgt-rect.lft)-((edgeSize*2)+padding);
            stoneHigh=(rect.bot-rect.top)-((edgeSize*2)+padding);
            lineCount=GenerateUtilityClass.randomInt(3,8);
            
            clipMargin=padding+edgeSize;
            
            for (k=0;k!==lineCount;k++) {
                x=GenerateUtilityClass.randomInt((rect.lft+edgeSize),stoneWid);
                y=GenerateUtilityClass.randomInt((rect.top+edgeSize),stoneHigh);
                x2=GenerateUtilityClass.randomInt((rect.lft+edgeSize),stoneWid);
                y2=GenerateUtilityClass.randomInt((rect.top+edgeSize),stoneHigh);
                
                lineVarient=20;
                if (lineVarient>stoneWid) lineVarient=stoneWid;
                if (lineVarient>stoneHigh) lineVarient=stoneHigh;
                
                darken=0.9+(GenerateUtilityClass.random()*0.1);
                lineColor=this.darkenColor(drawStoneColor,darken);
                this.drawRandomLine(x,y,x2,y2,(rect.lft+clipMargin),(rect.top+clipMargin),(rect.rgt-clipMargin),(rect.bot-clipMargin),lineVarient,lineColor,false);
            }
            */
                // redo the fill, but just do the edges so we
                // erase any lines that went over
                
            //this.draw3DComplexRect(rect.lft,rect.top,(rect.rgt-padding),(rect.bot-padding),edgeSize,null,drawEdgeColor);
            
                 // any random noise
                
            //this.addNoiseRect(rect.lft,rect.top,rect.rgt,rect.bot,0.8,1.0,0.4);
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
