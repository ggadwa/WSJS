import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate brick bitmap class
//

export default class GenBitmapBrickClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
    
        //
        // brick bitmaps
        //

    generateBrick(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,rect,segments;
        let drawBrickColor,f;
        let lft,rgt,top,bot;
        let sx,ex,streakWid,lineColor;
        
        let edgeSize=genRandom.randomInt(3,7);
        let paddingSize=genRandom.randomInt(2,10);
        
        let brickColor=this.getRandomColor();
        let groutColor=this.dullColor(brickColor,0.7);
        let dirtColor=this.darkenColor(brickColor,0.5);
        
        if (genRandom.randomPercentage(0.5)) {
            segments=this.createStackedSegments(wid,high);
        }
        else {
            segments=this.createRandomSegments(wid,high);
        }

            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,groutColor);
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);

        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // draw the bricks

        for (n=0;n!==segments.length;n++) {
            rect=segments[n];

                // the brick
                
            f=1.0;
            if (!((rect.lft<0) || (rect.rgt>wid))) {        // don't darken bricks that fall off edges
                f=0.6+(genRandom.random()*0.4);
            }

            drawBrickColor=this.darkenColor(brickColor,f);

            this.draw3DRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),edgeSize,drawBrickColor,true);
            this.addNoiseRect(bitmapCTX,rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),0.8,1.0,0.6);
            
                // calc the brick size around the edges
                
            lft=rect.lft;
            if (lft<0) {
                lft=0;
            }
            else {
                lft+=edgeSize;
            }
            
            rgt=rect.rgt;
            if (rgt>=wid) {
                rgt=wid-1;
            }
            else {
                rgt-=(paddingSize+edgeSize);
            }
            
            top=rect.top+edgeSize;
            bot=rect.bot-(paddingSize+edgeSize);
            
                // add cracks (after any blurs)
            
            if ((rgt-lft)>(bot-top)) {
                if (genRandom.randomPercentage(0.10)) {
                    sx=genRandom.randomInBetween((lft+20),(rgt-20));
                    ex=genRandom.randomInBetween((lft+20),(rgt-20));

                    lineColor=this.darkenColor(drawBrickColor,0.9);
                    this.drawRandomLine(bitmapCTX,normalCTX,sx,top,ex,bot,lft,top,rgt,bot,20,lineColor,false);
                }
            }
            
                // any stains
            
            if (genRandom.randomPercentage(0.50)) {
                streakWid=genRandom.randomInBetween(Math.trunc((rgt-lft)*0.5),Math.trunc((rgt-lft)*0.8));
                if (streakWid>5) {
                    sx=genRandom.randomInt(lft,((rgt-lft)-streakWid));
                    ex=sx+streakWid;
                    this.drawStreakDirt(bitmapCTX,sx,top,ex,bot,5,2,0.6,dirtColor);
                }
            }
            
                // and blur it
                
            this.blur(bitmapCTX,lft,top,rgt,bot,4,false);
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);
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

        this.generateBrick(bitmapCTX,normalCTX,specularCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],5.0));    
    }

}
