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
        let chunkWidStart,chunkWidAdd,chunkHighStart,chunkHighAdd,arcStart,arcEnd;
        let wid=rgt-lft;
        let high=bot-top;
        let edgeSize;
        
            // we use the mask so we can mix normals when
            // two ovals collide
            
        this.clearMask();
        
            // the stone itself
            
        edgeSize=GenerateUtilityClass.randomInt(Math.trunc(wid*0.7),Math.trunc(wid*0.2));     // new edge size as stones aren't the same
        xRoundFactor=GenerateUtilityClass.randomFloat(0.0,0.03);
        yRoundFactor=GenerateUtilityClass.randomFloat(0.0,0.03);
        
        this.drawOval(lft,top,rgt,bot,0,1,xRoundFactor,yRoundFactor,edgeSize,stoneColor,0.5,true,0.7,0.8,0.2);
        
            // random chunks on stone
            // we make sure that the first 4 random
            // one always go in a corner to smooth out oval

        nChunk=GenerateUtilityClass.randomInt(5,5);
        
        chunkWidStart=Math.trunc(wid*0.3);
        chunkWidAdd=Math.trunc(wid*0.5);
        chunkHighStart=Math.trunc(high*0.3);
        chunkHighAdd=Math.trunc(high*0.5);
        
        for (n=0;n!==nChunk;n++) {
            wid2=GenerateUtilityClass.randomInt(chunkWidStart,chunkWidAdd);
            high2=GenerateUtilityClass.randomInt(chunkHighStart,chunkHighAdd);
            
            switch (n) {
                case 0:
                    lft2=GenerateUtilityClass.randomInt(lft,5);
                    top2=GenerateUtilityClass.randomInt(top,5);
                    arcStart=0.65;
                    arcEnd=1.1;
                    break;
                case 1:
                    lft2=GenerateUtilityClass.randomInt((rgt-wid2),-5);
                    top2=GenerateUtilityClass.randomInt(top,10);
                    arcStart=-0.1;
                    arcEnd=0.35;
                    break;
                case 2:
                    lft2=GenerateUtilityClass.randomInt((rgt-wid2),-5);
                    top2=GenerateUtilityClass.randomInt((bot-high2),-5);
                    arcStart=0.15;
                    arcEnd=0.6;
                    break;
                case 3:
                    lft2=GenerateUtilityClass.randomInt(lft,5);
                    top2=GenerateUtilityClass.randomInt((bot-high2),-5);
                    arcStart=0.4;
                    arcEnd=0.85;
                    break;
                default:
                    lft2=GenerateUtilityClass.randomInt(lft,((rgt-lft)-wid2));
                    top2=GenerateUtilityClass.randomInt(top,((bot-top)-high2));
                    arcStart=0;
                    arcEnd=1;
                    break;
            }
            
            edgeSize=GenerateUtilityClass.randomInt(Math.trunc(wid2*0.6),Math.trunc(wid2*0.3));
            xRoundFactor=GenerateUtilityClass.randomFloat(0.0,0.03);
            yRoundFactor=GenerateUtilityClass.randomFloat(0.0,0.03);
        
            this.drawOval(lft2,top2,(lft2+wid2),(top2+high2),arcStart,arcEnd,xRoundFactor,yRoundFactor,edgeSize,stoneColor,((n>3)?0.7:0.5),(n<4),0.7,0.8,0.2);
        }
    }
    
    generateStone()
    {
        let n,rect;
        let drawStoneColor,f,bumpCount;
        let paddingRight,paddingBottom;
        
        let stoneColor=this.getRandomColor();
        let groutColor=this.getRandomColorDull(0.3);
        
        let segments=this.createRandomSegments();

            // the grout is just a rough bumpy surface

        bumpCount=GenerateUtilityClass.randomInt(300,100);
        this.drawBumpySurface(0,0,this.colorCanvas.width,this.colorCanvas.height,groutColor,0.8,bumpCount,3);
        
            // draw the stones

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];

            f=1.0;
            if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=this.colorCanvas.width) && (rect.bot<=this.colorCanvas.height)) {        // don't darken stones that fall off edges
                f=GenerateUtilityClass.random()+0.5;
                if (f>1.0) f=1.0;
            }

            drawStoneColor=this.darkenColor(stoneColor,f);
            
            paddingRight=GenerateUtilityClass.randomInt(0,4);
            paddingBottom=GenerateUtilityClass.randomInt(0,4);

            this.drawSingleStone(rect.lft,rect.top,(rect.rgt-paddingRight),(rect.bot-paddingBottom),drawStoneColor);
        }

            // finish with the specular

        this.createSpecularMap(0.3);
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateStone();
    }

}
