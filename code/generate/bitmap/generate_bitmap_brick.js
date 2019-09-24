import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate brick bitmap class
//

export default class GenerateBitmapBrickClass extends GenerateBitmapBaseClass
{
    constructor(core)
    {
        super(core,true,true,false);
        Object.seal(this);
    }
    
        //
        // brick bitmaps
        //

    generateBrick()
    {
        let n,seg,segments;
        let drawBrickColor,streakColor,f;
        let lft,rgt,top,bot;
        let sx,ex,ey,streakWid,lineColor;
        
        let edgeSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorCanvas.width*0.005),Math.trunc(this.colorCanvas.width*0.01));
        let paddingSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorCanvas.width*0.005),Math.trunc(this.colorCanvas.width*0.01));
        
        let brickColor=this.getRandomColor();
        let altBrickColor=this.getRandomColor();
        let groutColor=this.getRandomColorDull(0.3);
        
        segments=this.createStackedSegments();
        
            // clear canvases

        this.drawRect(0,0,this.colorCanvas.width,this.colorCanvas.height,groutColor);
        this.drawNoiseRect(0,0,this.colorCanvas.width,this.colorCanvas.height,0.6,0.8,0.9);
        this.blur(this.colorCTX,0,0,this.colorCanvas.width,this.colorCanvas.height,3,true);
        
            // draw the bricks

        for (n=0;n!==segments.length;n++) {
            seg=segments[n];
            
                // the brick
                
            f=1.0;
            if (!((seg.lft<0) || (seg.rgt>this.colorCanvas.width))) {        // don't darken bricks that fall off edges
                f=0.6+(GenerateUtilityClass.random()*0.4);
            }
            
            if (seg.isLarge) {
                drawBrickColor=this.darkenColor(altBrickColor,f);
                this.draw3DRect(-edgeSize,seg.top,(this.colorCanvas.width+edgeSize),(seg.bot-paddingSize),edgeSize,0.9,drawBrickColor,true);
                this.drawNoiseRect(0,seg.top,this.colorCanvas.width,(seg.bot-paddingSize),0.8,1.0,GenerateUtilityClass.randomFloat(0.6,0.2));
            }
            else {
                drawBrickColor=this.darkenColor((seg.isSmall?altBrickColor:brickColor),f);
                this.draw3DRect(seg.lft,seg.top,(seg.rgt-paddingSize),(seg.bot-paddingSize),edgeSize,0.9,drawBrickColor,true);
                this.drawNoiseRect(seg.lft,seg.top,(seg.rgt-paddingSize),(seg.bot-paddingSize),0.8,1.0,GenerateUtilityClass.randomFloat(0.6,0.2));
            }
            
                // any streaks/stains/cracks
                // do not do on odd bricks
                
            lft=seg.lft+edgeSize;
            rgt=seg.rgt-(edgeSize+paddingSize);
            top=seg.top+edgeSize;
            bot=seg.bot-(edgeSize+paddingSize);
                
            if ((!seg.isHalf) && (!seg.isSmall) && (!seg.isLarge)) {
                
                    // streaks
                    
                if (GenerateUtilityClass.randomPercentage(0.2)) {
                    streakWid=GenerateUtilityClass.randomInBetween(Math.trunc((rgt-lft)*0.3),Math.trunc((rgt-lft)*0.6));
                    if (streakWid<10) streakWid=10;

                    sx=GenerateUtilityClass.randomInt(lft,((rgt-lft)-streakWid));
                    ex=sx+streakWid;
                    ey=GenerateUtilityClass.randomInBetween(bot,Math.trunc(bot*1.5));

                    streakColor=this.darkenColor(drawBrickColor,0.6);
                    this.drawStreakDirt(sx,top,ex,ey,bot,5,0.5,streakColor);
                }
                
                    // any cracks

                if (GenerateUtilityClass.randomPercentage(0.1)) {
                    if ((rgt-lft)>45) {
                        sx=GenerateUtilityClass.randomInBetween((lft+15),(rgt-15));
                        ex=sx+(GenerateUtilityClass.randomInt(5,25)-15);

                        lineColor=this.darkenColor(drawBrickColor,0.7);
                        this.drawVerticalCrack(sx,top,bot,lft,rgt,GenerateUtilityClass.randomSign(),10,lineColor,false,true);
                    }
                }
            }
            
                // blur everything
                
            lft=(seg.lft<0)?0:seg.lft;
            rgt=(seg.rgt>=this.colorCanvas.width)?(this.colorCanvas.width-1):(seg.rgt-paddingSize);
            top=seg.top;
            bot=seg.bot-paddingSize;
                
            this.blur(this.colorCTX,lft,top,rgt,bot,GenerateUtilityClass.randomInt(1,2),true);
        }
        
            // finish with the specular

        this.createSpecularMap(0.4);
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateBrick();
    }

}
