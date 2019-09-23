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
        let n,rect,segments;
        let drawBrickColor,streakColor,f;
        let lft,rgt,top,bot;
        let sx,ex,ey,streakWid,lineColor;
        
        let edgeSize=GenerateUtilityClass.randomInt(3,7);
        let paddingSize=GenerateUtilityClass.randomInt(2,8);
        
        let brickColor=this.getRandomColor();
        let groutColor=this.getRandomColorDull(0.3);
        
        segments=this.createStackedSegments();
        
            // clear canvases

        this.drawRect(0,0,this.colorCanvas.width,this.colorCanvas.height,groutColor);
        this.drawNoiseRect(0,0,this.colorCanvas.width,this.colorCanvas.height,0.6,0.8,0.9);
        this.blur(this.colorCTX,0,0,this.colorCanvas.width,this.colorCanvas.height,3,true);
        
            // draw the bricks

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];
            
                // the brick
                
            f=1.0;
            if (!((rect.lft<0) || (rect.rgt>this.colorCanvas.width))) {        // don't darken bricks that fall off edges
                f=0.6+(GenerateUtilityClass.random()*0.4);
            }
            
            drawBrickColor=this.darkenColor(brickColor,f);

            this.draw3DRect(rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),edgeSize,0.9,drawBrickColor,true);
            this.drawNoiseRect(rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),0.8,1.0,GenerateUtilityClass.randomFloat(0.6,0.2));
            
                // any streaks/stains/cracks
                // only on full blocks
                
            lft=rect.lft+edgeSize;
            rgt=rect.rgt-(edgeSize+paddingSize);
            top=rect.top+edgeSize;
            bot=rect.bot-(edgeSize+paddingSize);
                
            if ((rect.lft>=0) && (rect.rgt<this.colorCanvas.width)) {
                
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
                
            lft=(rect.lft<0)?0:rect.lft;
            rgt=(rect.rgt>=this.colorCanvas.width)?(this.colorCanvas.width-1):(rect.rgt-paddingSize);
            top=rect.top;
            bot=rect.bot-paddingSize;
                
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
