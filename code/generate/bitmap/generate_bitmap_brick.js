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

    generateInternal()
    {
        let n,seg,segments;
        let drawBrickColor,drawFrameColor,streakColor,f;
        let lft,rgt,top,bot,edgeSize;
        let sx,ex,streakWid,lineColor;
        
        let paddingSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorCanvas.width*0.005),Math.trunc(this.colorCanvas.width*0.0125));
        
        let brickColor=this.getRandomColor();
        let altBrickColor=this.getRandomColor();
        let groutColor=this.getRandomGray(0.8,0,2);
        
            // create segments and noise data
        
        segments=this.createStackedSegments();
        this.createPerlinNoiseData(32,32);
        this.createNormalNoiseData(1.5,0.5);
        
            // grout is a static noise color
            
        this.drawRect(0,0,this.colorCanvas.width,this.colorCanvas.height,groutColor);
        this.drawStaticNoiseRect(0,0,this.colorCanvas.width,this.colorCanvas.height,1.0,1.4);
        this.blur(this.colorImgData.data,0,0,this.colorCanvas.width,this.colorCanvas.height,1,false);
        
            // draw the bricks

        for (n=0;n!==segments.length;n++) {
            seg=segments[n];
                
                // random heights
                
            edgeSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorCanvas.width*0.005),Math.trunc(this.colorCanvas.width*0.0125));
            
                // the brick
                
            f=1.0;
            if (!((seg.lft<0) || (seg.rgt>this.colorCanvas.width))) {        // don't darken bricks that fall off edges
                f=0.6+(GenerateUtilityClass.random()*0.4);
            }
            
            if (seg.isLarge) {
                drawBrickColor=this.darkenColor(altBrickColor,f);
                drawFrameColor=this.darkenColor(drawBrickColor,0.9);
                this.drawRect(0,seg.top,this.colorCanvas.width,(seg.bot-paddingSize),drawBrickColor);
                this.draw3DFrameRect(-edgeSize,seg.top,(this.colorCanvas.width+edgeSize),(seg.bot-paddingSize),edgeSize,drawFrameColor,true);
                this.drawPerlinNoiseRect(0,(seg.top+edgeSize),this.colorCanvas.width,(seg.bot-(edgeSize+paddingSize)),0.8,1.3);
                this.drawNormalNoiseRect(0,(seg.top+edgeSize),this.colorCanvas.width,(seg.bot-(edgeSize+paddingSize)));
            }
            else {
                drawBrickColor=this.darkenColor((seg.isSmall?altBrickColor:brickColor),f);
                drawFrameColor=this.darkenColor(drawBrickColor,0.9);
                this.drawRect(seg.lft,seg.top,(seg.rgt-paddingSize),(seg.bot-paddingSize),drawBrickColor);
                this.draw3DFrameRect(seg.lft,seg.top,(seg.rgt-paddingSize),(seg.bot-paddingSize),edgeSize,drawFrameColor,true);
                this.drawPerlinNoiseRect((seg.lft+edgeSize),(seg.top+edgeSize),(seg.rgt-(edgeSize+paddingSize)),(seg.bot-(edgeSize+paddingSize)),0.8,1.3);
                this.drawNormalNoiseRect((seg.lft+edgeSize),(seg.top+edgeSize),(seg.rgt-(edgeSize+paddingSize)),(seg.bot-(edgeSize+paddingSize)));
            }
            
                // any streaks/stains/cracks
                // do not do on odd bricks

            lft=seg.lft+edgeSize;
            rgt=seg.rgt-(edgeSize+paddingSize);
            top=seg.top+edgeSize;
            bot=seg.bot-(edgeSize+paddingSize);
                
            if ((!seg.isHalf) && (!seg.isSmall)) {
                
                    // any cracks

                if (GenerateUtilityClass.randomPercentage(0.1)) {
                    if ((rgt-lft)>45) {
                        sx=GenerateUtilityClass.randomInBetween((lft+15),(rgt-15));
                        ex=sx+(GenerateUtilityClass.randomInt(5,25)-15);

                        lineColor=this.darkenColor(drawBrickColor,0.7);
                        this.drawVerticalCrack(sx,top,bot,lft,rgt,GenerateUtilityClass.randomSign(),10,lineColor,true);
                    }
                }
                
                    // streaks
                    
                if (GenerateUtilityClass.randomPercentage(0.2)) {
                    streakWid=GenerateUtilityClass.randomInBetween(Math.trunc((rgt-lft)*0.3),Math.trunc((rgt-lft)*0.6));
                    if (streakWid<10) streakWid=10;
                    if (streakWid>(this.colorCanvasWidth*0.1)) streakWid=this.colorCanvasWidth*0.1;

                    sx=GenerateUtilityClass.randomInt(lft,((rgt-lft)-streakWid));
                    ex=sx+streakWid;

                    streakColor=this.darkenColor(drawBrickColor,0.6);
                    this.drawStreakDirt(sx,top,ex,bot,5,0.25,0.35,streakColor);
                }
            }
            
                // blur everything
                
            lft=(seg.lft<0)?0:seg.lft;
            rgt=(seg.rgt>=this.colorCanvas.width)?(this.colorCanvas.width-1):(seg.rgt-paddingSize);
            top=seg.top;
            bot=seg.bot-paddingSize;
        }
        
            // finish with the specular

        this.createSpecularMap(0.4);
    }

}
