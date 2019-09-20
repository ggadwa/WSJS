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
        let drawBrickColor,f;
        let lft,rgt,top,bot;
        let sx,ex,ey,streakWid,lineColor;
        
        let edgeSize=GenerateUtilityClass.randomInt(3,7);
        let paddingSize=GenerateUtilityClass.randomInt(2,8);
        
        let brickColor=this.getRandomColor();
        let groutColor=this.getRandomColorDull(0.3);
        let dirtColor=this.darkenColor(brickColor,0.5);
        
        segments=this.createStackedSegments();
        
            // clear canvases

        this.drawRect(0,0,this.colorCanvas.width,this.colorCanvas.height,groutColor);
        this.drawNoiseRect(0,0,this.colorCanvas.width,this.colorCanvas.height,0.6,0.8,0.9);
        
            // draw the bricks

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];
            
                // the brick
                
            f=1.0;
            if (!((rect.lft<0) || (rect.rgt>this.colorCanvas.width))) {        // don't darken bricks that fall off edges
                f=0.6+(GenerateUtilityClass.random()*0.4);
            }
            
            drawBrickColor=this.darkenColor(brickColor,f);

            this.draw3DRect(rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),edgeSize,drawBrickColor,true);
            this.drawNoiseRect(rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),0.8,1.0,0.6);
            
                // any stains
            
            if (GenerateUtilityClass.randomPercentage(0.5)) {
                streakWid=GenerateUtilityClass.randomInBetween(Math.trunc((rgt-lft)*0.6),Math.trunc((rgt-lft)*0.8));
                if (streakWid>5) {
                    sx=GenerateUtilityClass.randomInt(lft,((rgt-lft)-streakWid));
                    ex=sx+streakWid;
                    ey=GenerateUtilityClass.randomInt(Math.trunc(top+((bot-top)*0.5)),Math.trunc((bot-top)*0.5));
                    this.drawStreakDirt(sx,top,ex,ey,5,2,0.8,dirtColor);
                }
            }
            
                // blur
                
            lft=(rect.lft<0)?0:(rect.lft+edgeSize);
            rgt=(rect.rgt>=this.colorCanvas.width)?(rect.rgt-(this.colorCanvas.width-1)):(rect.rgt-(paddingSize+edgeSize));
            top=rect.top+edgeSize;
            bot=rect.bot-(paddingSize+edgeSize);
            
            this.blur(this.colorCTX,lft,top,rgt,bot,4,false);
            
                // add cracks (after any blurs)
            
            if ((rgt-lft)>(bot-top)) {
                if (GenerateUtilityClass.randomPercentage(0.1)) {
                    sx=GenerateUtilityClass.randomInBetween((lft+20),(rgt-20));
                    ex=GenerateUtilityClass.randomInBetween((lft+20),(rgt-20));

                    lineColor=this.darkenColor(drawBrickColor,0.9);
                    this.drawRandomLine(sx,top,ex,bot,lft,top,rgt,bot,20,lineColor,true);
                }
            }
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
