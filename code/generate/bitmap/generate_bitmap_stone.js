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
        let chunkWidStart,chunkWidAdd,chunkHighStart,chunkHighAdd,chunkOffset,arcStart,arcEnd;
        let wid=rgt-lft;
        let high=bot-top;
        let edgeSize,flipNormals,normalZFactor;
        
            // we use the mask so we can mix normals when
            // two ovals collide
            
        this.clearMask();
        
            // the stone itself
            
        edgeSize=GenerateUtilityClass.randomInt(Math.trunc(wid*0.8),Math.trunc(wid*0.15));     // new edge size as stones aren't the same
        xRoundFactor=GenerateUtilityClass.randomFloat(0.0,0.03);
        yRoundFactor=GenerateUtilityClass.randomFloat(0.0,0.03);
        
        this.drawOval(lft,top,rgt,bot,0,1,xRoundFactor,yRoundFactor,edgeSize,stoneColor,0.5,false,true,0.8,0.4);
        
            // random chunks on stone
            // we make sure that the first 4 random
            // one always go in a corner to smooth out oval

        nChunk=GenerateUtilityClass.randomInt(3,4);
        
        chunkWidStart=Math.trunc(wid*0.3);
        chunkWidAdd=Math.trunc(wid*0.5);
        chunkHighStart=Math.trunc(high*0.35);
        chunkHighAdd=Math.trunc(high*0.5);
        chunkOffset=Math.trunc(high*0.02);
        
        for (n=0;n!==nChunk;n++) {
            wid2=GenerateUtilityClass.randomInt(chunkWidStart,chunkWidAdd);
            high2=GenerateUtilityClass.randomInt(chunkHighStart,chunkHighAdd);
            
            switch (n) {
                case 0:
                    lft2=GenerateUtilityClass.randomInt(lft,chunkOffset);
                    top2=GenerateUtilityClass.randomInt(top,chunkOffset);
                    arcStart=0.65;
                    arcEnd=1.1;
                    break;
                case 1:
                    lft2=GenerateUtilityClass.randomInt((rgt-wid2),-chunkOffset);
                    top2=GenerateUtilityClass.randomInt(top,chunkOffset);
                    arcStart=-0.1;
                    arcEnd=0.35;
                case 2:
                    lft2=GenerateUtilityClass.randomInt((rgt-wid2),-chunkOffset);
                    top2=GenerateUtilityClass.randomInt((bot-high2),-chunkOffset);
                    arcStart=0.15;
                    arcEnd=0.6;
                    break;
                case 3:
                    lft2=GenerateUtilityClass.randomInt(lft,chunkOffset);
                    top2=GenerateUtilityClass.randomInt((bot-high2),-chunkOffset);
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
            normalZFactor=(GenerateUtilityClass.random()*0.3)+0.2;      // rocks have different normal heights
            if (n>3) normalZFactor+=0.2;            // ovals ontop of outside one don't extend as far out
            
            flipNormals=false;
            if (n>3) flipNormals=GenerateUtilityClass.randomPercentage(0.1);
        
            this.drawOval(lft2,top2,(lft2+wid2),(top2+high2),arcStart,arcEnd,xRoundFactor,yRoundFactor,edgeSize,stoneColor,normalZFactor,flipNormals,(n<4),0.8,0.4);
        }
    }
    
    generateInternal()
    {
        let n,seg;
        let drawStoneColor,f;
        let paddingRight,paddingBottom;
        
        let stoneColor=this.getRandomColor();
        let altStoneColor=this.getRandomColor();
        let groutColor=this.getRandomGray(0.7,0.2);
        
            // create segments
            
        let segments=this.createRandomSegments();

            // the noise grout
            
        this.drawRect(0,0,this.colorImgData.width,this.colorImgData.height,groutColor);
        this.createPerlinNoiseData(8,8);
        this.drawPerlinNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height,0.6,1.0);
        this.drawStaticNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height,0.9,1.1);
        
        this.createNormalNoiseData(1.7,0.3);
        this.drawNormalNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height);
        
            // draw the stones

        for (n=0;n!==segments.length;n++) {
            seg=segments[n];

            f=GenerateUtilityClass.random()+0.5;
            if (f>1.0) f=1.0;

            drawStoneColor=this.darkenColor((GenerateUtilityClass.randomPercentage(0.7)?stoneColor:altStoneColor),f);
            
            paddingRight=GenerateUtilityClass.randomInt(0,Math.trunc(this.colorImgData.width*0.02));
            paddingBottom=GenerateUtilityClass.randomInt(0,Math.trunc(this.colorImgData.width*0.02));

            this.drawSingleStone(seg.lft,seg.top,(seg.rgt-paddingRight),(seg.bot-paddingBottom),drawStoneColor);
        }
        
            // blur the colors and blur the normals so
            // bricks don't stick out
            
        this.blur(this.colorImgData.data,0,0,this.colorImgData.width,this.colorImgData.height,2,false);
        this.blur(this.normalImgData.data,0,0,this.colorImgData.width,this.colorImgData.height,2,false);
        
            // finish with the specular

        this.createSpecularMap(0.3);
    }
}
