import genRandom from '../../generate/utility/random.js';
import GenBitmapClass from '../../generate/bitmap/gen_bitmap.js';

//
// generate item bitmap class
//

export default class GenBitmapItemClass extends GenBitmapClass
{
    constructor()
    {    
        super();
        
        this.TYPE_METAL=0;

        this.TYPE_NAMES=
                [
                    'Metal'
                ];
        
        Object.seal(this);
    }
    
        //
        // metal
        //

    generateMetalWires(bitmapCTX,normalCTX,wid,high,grid,color)
    {
        let n,k,x,y,split;
        let lineCount=genRandom.randomInt(1,5);
        
        let lineWidth=Math.trunc(wid*0.05);
        if (lineWidth<5) lineWidth=5;
        
        for (n=0;n!==lineCount;n++) {
            
            if (genRandom.randomPercentage(0.5)) {
                x=genRandom.randomInt(lineWidth,(wid-(lineWidth*2)));
                this.drawBumpLine(bitmapCTX,normalCTX,x,0,x,high,lineWidth,color);
                
                split=Math.trunc(wid/16);
                x=Math.trunc(x/split);
                for (k=0;k!==16;k++) {
                    grid[(k*16)+x]=1;
                }
            }
            else {
                y=genRandom.randomInt(lineWidth,(high-(lineWidth*2)));
                this.drawBumpLine(bitmapCTX,normalCTX,0,y,wid,y,lineWidth,color);
                
                split=Math.trunc(high/16);
                y=Math.trunc(y/split);
                for (k=0;k!==16;k++) {
                    grid[(y*16)+k]=1;
                }
            }
            
        }
    }
    
    generateMetalButtons(bitmapCTX,normalCTX,wid,high,grid)
    {
        let n,k,x,y,color;
        let buttonWid=Math.trunc(wid/16);
        let buttonHigh=Math.trunc(high/16);
        let buttonCount=genRandom.randomInt(3,5);
        
        for (n=0;n!==buttonCount;n++) {
            
            for (k=0;k!==10;k++) {
                x=genRandom.randomInt(0,15);
                y=genRandom.randomInt(0,15);
                
                if (grid[(y*16)+x]!==0) continue;
                grid[(y*16)+x]=1;
                
                color=this.getRandomColor();
                
                x*=buttonWid;
                y*=buttonHigh;
                this.draw3DRect(bitmapCTX,normalCTX,x,y,(x+buttonWid),(y+buttonHigh),2,color,false);
                break;
            }
        }
    }
    
    generateMetalScrews(bitmapCTX,normalCTX,wid,high,grid,metalColor)
    {
        let n,k,x,y,color;
        let screwWid=Math.trunc(wid/16);
        let screwHigh=Math.trunc(high/16);
        let screwCount=genRandom.randomInt(2,5);
        
        let screwColor=this.boostColor(metalColor,0.05);
        let screwFlatInnerSize=Math.trunc(screwWid*0.4);
        
        for (n=0;n!==screwCount;n++) {
            
            for (k=0;k!==10;k++) {
                x=genRandom.randomInt(0,15);
                y=genRandom.randomInt(0,15);
                
                if (grid[(y*16)+x]!==0) continue;
                grid[(y*16)+x]=1;
                
                color=this.getRandomColor();
                
                x*=screwWid;
                y*=screwHigh;
                this.draw3DOval(bitmapCTX,normalCTX,x,y,(x+screwWid),(y+screwHigh),0.0,1.0,2,screwFlatInnerSize,screwColor,this.blackColor);
                break;
            }
        }
    }
    
    generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,x;
        let streakWid,streakColor,darken;
        
            // a grid to place items
            
        let grid=new Uint8Array(16*16);

            // some random values

        let metalColor=this.getDefaultPrimaryColor();
        let wireColor=this.getRandomColor();
        let streakCount=genRandom.randomInt(15,10);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // the plate
            
        this.drawRect(bitmapCTX,0,0,wid,high,metalColor);
        
            // possible streaks
        
        if (genRandom.randomPercentage(0.5)) {
            for (n=0;n!==streakCount;n++) {
                streakWid=genRandom.randomInt(10,40);
                x=genRandom.randomInBetween(streakWid,(wid-streakWid));

                darken=0.5+(genRandom.random()*0.5);
                streakColor=this.darkenColor(metalColor,darken);

                this.drawStreakMetal(bitmapCTX,wid,high,x,0,high,streakWid,streakColor);
            }
        }
        
            // wires and buttons
            
        this.generateMetalWires(bitmapCTX,normalCTX,wid,high,grid,wireColor);
        this.generateMetalButtons(bitmapCTX,normalCTX,wid,high,grid);
        this.generateMetalScrews(bitmapCTX,normalCTX,wid,high,grid,metalColor);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.6);
    }
    
        //
        // generate mainline
        //

    generate(generateType,inDebug)
    {
        let wid,high;
        let shineFactor=1.0;
        let bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX,glowCanvas,glowCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        bitmapCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        normalCanvas=document.createElement('canvas');
        normalCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        normalCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        normalCTX=normalCanvas.getContext('2d');

        specularCanvas=document.createElement('canvas');
        specularCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        specularCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        specularCTX=specularCanvas.getContext('2d');
        
        glowCanvas=document.createElement('canvas');
        glowCanvas.width=2;
        glowCanvas.height=2;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,2,2);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case this.TYPE_METAL:
                this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=8.0;
                break;
                
        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }
    
    generateRandom(inDebug)
    {
        return(this.generate(genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}
