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

    generateSingleBrick(lft,top,rgt,bot,edgeSize,paddingSize,brickColor,altBrickColor,isHalf,isSmall,isLarge)
    {
        let f,sx,ex,streakWid;
        let drawBrickColor,drawFrameColor,lineColor,streakColor;

            // the brick

        f=1.0;
        if (!((lft<0) || (rgt>this.colorImgData.width))) {        // don't darken bricks that fall off edges
            f=0.6+(GenerateUtilityClass.random()*0.4);
        }

        if (isLarge) {
            drawBrickColor=this.adjustColor(altBrickColor,f);
            drawFrameColor=this.adjustColorRandom(drawBrickColor,0.85,0.95);
            this.drawRect(0,top,this.colorCanvas.width,(bot-paddingSize),drawBrickColor);
            this.draw3DFrameRect(-edgeSize,top,(this.colorCanvas.width+edgeSize),(bot-paddingSize),edgeSize,drawFrameColor,true);
            this.drawPerlinNoiseRect(0,(top+edgeSize),this.colorCanvas.width,(bot-(edgeSize+paddingSize)),0.8,1.3);
            this.drawNormalNoiseRect(0,(top+edgeSize),this.colorCanvas.width,(bot-(edgeSize+paddingSize)));
        }
        else {
            drawBrickColor=this.adjustColor((isSmall?altBrickColor:brickColor),f);
            drawFrameColor=this.adjustColorRandom(drawBrickColor,0.85,0.95);
            this.drawRect(lft,top,(rgt-paddingSize),(bot-paddingSize),drawBrickColor);
            this.draw3DFrameRect(lft,top,(rgt-paddingSize),(bot-paddingSize),edgeSize,drawFrameColor,true);
            this.drawPerlinNoiseRect((lft+edgeSize),(top+edgeSize),(rgt-(edgeSize+paddingSize)),(bot-(edgeSize+paddingSize)),0.8,1.3);
            this.drawNormalNoiseRect((lft+edgeSize),(top+edgeSize),(rgt-(edgeSize+paddingSize)),(bot-(edgeSize+paddingSize)));
        }

            // any streaks/stains/cracks
            // do not do on odd bricks

        lft+=edgeSize;
        rgt-=(edgeSize+paddingSize);
        top+=edgeSize;
        bot-=(edgeSize+paddingSize);

        if ((!isHalf) && (!isSmall)) {

                // any cracks

            if (GenerateUtilityClass.randomPercentage(0.1)) {
                if ((rgt-lft)>45) {
                    sx=GenerateUtilityClass.randomInBetween((lft+15),(rgt-15));
                    ex=sx+(GenerateUtilityClass.randomInt(5,25)-15);

                    lineColor=this.adjustColorRandom(drawBrickColor,0.65,0.75);
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

                streakColor=this.adjustColorRandom(drawBrickColor,0.65,0.75);
                this.drawStreakDirt(sx,top,ex,bot,5,0.25,0.35,streakColor);
            }
        }
    }
    
    generateInternal()
    {
        let x,y,xCount,xAdd,yCount,yAdd;
        let halfWid,halfBrick,lft,top;
        
        let edgeSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorImgData.width*0.005),Math.trunc(this.colorImgData.width*0.0125));
        let paddingSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorCanvas.width*0.005),Math.trunc(this.colorCanvas.width*0.0125));
        
        let brickColor=this.getRandomColor();
        let altBrickColor=this.getRandomColor();
        let groutColor=this.getRandomGray(0.8,0,2);
        
            // create noise data
        
        this.createPerlinNoiseData(32,32);
        this.createNormalNoiseData(1.5,0.5);
        
            // grout is a static noise color
            
        this.drawRect(0,0,this.colorImgData.width,this.colorImgData.height,groutColor);
        this.drawStaticNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height,1.0,1.4);
        this.blur(this.colorImgData.data,0,0,this.colorImgData.width,this.colorImgData.height,1,false);
        
            // draw the bricks
            
        xCount=GenerateUtilityClass.randomInt(4,4);
        xAdd=Math.trunc(this.colorCanvas.width/xCount);
        halfWid=Math.trunc(xAdd/2);

        yCount=GenerateUtilityClass.randomInt(4,5);
        yAdd=Math.trunc(this.colorCanvas.height/yCount);

        top=0;
        halfBrick=false;

        for (y=0;y!==yCount;y++) {

                // special lines (full line or double bricks)
                
            if (GenerateUtilityClass.randomPercentage(0.2)) {
                if (GenerateUtilityClass.randomPercentage(0.5)) {
                    this.generateSingleBrick(0,top,(this.colorImgData.width-1),(top+yAdd),edgeSize,paddingSize,brickColor,altBrickColor,false,false,true);
                }
                else {
                    lft=0;
                    
                    for (x=0;x!==xCount;x++) {
                        this.generateSingleBrick(lft,top,(lft+halfWid),(top+yAdd),edgeSize,paddingSize,brickColor,altBrickColor,false,true,false);
                        this.generateSingleBrick((lft+halfWid),top,((x===(xCount-1))?(this.colorCanvas.width-1):(lft+xAdd)),(top+yAdd),edgeSize,paddingSize,brickColor,altBrickColor,false,true,false);
                        lft+=xAdd;
                    }
                }
            }
            
                // regular lines
                
            else {
                if (halfBrick) {
                    lft=-halfWid;

                    for (x=0;x!==(xCount+1);x++) {
                        this.generateSingleBrick(lft,top,(lft+xAdd),(top+yAdd),edgeSize,paddingSize,brickColor,altBrickColor,((x===0)||(x===xCount)),false,false);
                        lft+=xAdd;
                    }
                }
                else {
                   lft=0;

                    for (x=0;x!==xCount;x++) {
                        this.generateSingleBrick(lft,top,((x===(xCount-1))?(this.colorCanvas.width-1):(lft+xAdd)),(top+yAdd),edgeSize,paddingSize,brickColor,altBrickColor,(lft<0),false,false);
                        lft+=xAdd;
                    }
                }
            }
            
            top+=yAdd;
            halfBrick=!halfBrick;
        }
        
            // finish with the specular

        this.createSpecularMap(0.4);
    }

}
