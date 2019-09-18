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
        let sx,ex,streakWid,lineColor;
        
        let edgeSize=GenerateUtilityClass.randomInt(3,7);
        let paddingSize=GenerateUtilityClass.randomInt(2,10);
        
        let brickColor=this.getRandomColor();
        let groutColor=this.dullColor(brickColor,0.7);
        let dirtColor=this.darkenColor(brickColor,0.5);
        
        if (GenerateUtilityClass.randomPercentage(0.5)) {
            segments=this.createStackedSegments();
        }
        else {
            segments=this.createRandomSegments();
        }

            // clear canvases

        this.drawRect(0,0,this.colorCanvas.width,this.colorCanvas.height,groutColor);
        this.addNoiseRect(0,0,this.colorCanvas.width,this.colorCanvas.height,0.6,0.8,0.9);

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
            this.addNoiseRect(rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),0.8,1.0,0.6);
            
                // calc the brick size around the edges
                
            lft=rect.lft;
            if (lft<0) {
                lft=0;
            }
            else {
                lft+=edgeSize;
            }
            
            rgt=rect.rgt;
            if (rgt>=this.colorCanvas.width) {
                rgt=this.colorCanvas.width-1;
            }
            else {
                rgt-=(paddingSize+edgeSize);
            }
            
            top=rect.top+edgeSize;
            bot=rect.bot-(paddingSize+edgeSize);
            
                // add cracks (after any blurs)
            
            if ((rgt-lft)>(bot-top)) {
                if (GenerateUtilityClass.randomPercentage(0.10)) {
                    sx=GenerateUtilityClass.randomInBetween((lft+20),(rgt-20));
                    ex=GenerateUtilityClass.randomInBetween((lft+20),(rgt-20));

                    lineColor=this.darkenColor(drawBrickColor,0.9);
                    this.drawRandomLine(sx,top,ex,bot,lft,top,rgt,bot,20,lineColor,false);
                }
            }
            
                // any stains
            
            if (GenerateUtilityClass.randomPercentage(0.50)) {
                streakWid=GenerateUtilityClass.randomInBetween(Math.trunc((rgt-lft)*0.5),Math.trunc((rgt-lft)*0.8));
                if (streakWid>5) {
                    sx=GenerateUtilityClass.randomInt(lft,((rgt-lft)-streakWid));
                    ex=sx+streakWid;
                    this.drawStreakDirt(sx,top,ex,bot,5,2,0.6,dirtColor);
                }
            }
            
                // and blur it
                
            this.blur(lft,top,rgt,bot,4,false);
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
