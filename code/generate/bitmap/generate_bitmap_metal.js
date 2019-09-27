import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate metal bitmap class
//

export default class GenerateBitmapMetalClass extends GenerateBitmapBaseClass
{
    constructor(core)
    {
        super(core,true,true,false);
        Object.seal(this);
    }
            
        //
        // metal bitmaps
        //
    
    generateMetalPanel(lft,top,rgt,bot,metalColor,edgeSize,screwSize)
    {
        let lft2,rgt2,top2,bot2,sz;
        let frameColor;

        let screwInnerSize=Math.trunc(screwSize*0.4);
        let screwColor=this.boostColor(metalColor,0.05);
        
            // the plate
            
        frameColor=this.darkenColor(metalColor,0.9);
        this.drawRect(lft,top,rgt,bot,metalColor);
        this.drawMetalShine(lft,top,rgt,bot,metalColor);
        this.draw3DFrameRect(lft,top,rgt,bot,edgeSize,frameColor,true);
        
            // variations
            
        switch (GenerateUtilityClass.randomIndex(2)) {
            
                // internal box
                
            case 0:
                sz=GenerateUtilityClass.randomInt(((edgeSize+screwSize)*2),(edgeSize*3));
                lft2=lft+sz;
                rgt2=rgt-sz;
                top2=top+sz;
                bot2=bot-sz;
                frameColor=this.darkenColor(metalColor,0.8);
                this.draw3DFrameRect(lft2,top2,rgt2,bot2,edgeSize,frameColor,false);
                this.drawMetalShine((lft2+edgeSize),(top2+edgeSize),(rgt2-edgeSize),(bot2-edgeSize),metalColor);
                break;
        }
        
            // screws
        
        /*
        this.generateMetalScrewsRandom((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),screwColor,screwSize,screwInnerSize);
            
        let         n,x,y,lx,rx,ty,by;
        let         xCount,xOffset,yCount,yOffset;
        
        lx=lft+5;
        rx=(rgt-5)-screwSize;
        ty=top+5;
        by=(bot-5)-screwSize;
        
        xCount=Math.trunc(((rgt-lft)/(screwSize+5)))-2;     // always avoid corners
        xOffset=Math.trunc(((rgt-lft)-(xCount*(screwSize+5)))*0.5);
        
        yCount=Math.trunc(((bot-top)/(screwSize+5)))-2;
        yOffset=Math.trunc(((bot-top)-(yCount*(screwSize+5)))*0.5);
        
            // corners

        if (GenerateUtilityClass.randomPercentage(0.33)) {
            this.draw3DOval(lx,ty,(lx+screwSize),(ty+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            this.draw3DOval(rx,ty,(rx+screwSize),(ty+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            this.draw3DOval(lx,by,(lx+screwSize),(by+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            this.draw3DOval(rx,by,(rx+screwSize),(by+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            return;
        }
        
            // left side
            
        if (GenerateUtilityClass.randomPercentage(0.33)) {
            for (n=0;n!==yCount;n++) {
                y=top+(yOffset+(n*(screwSize+5)));
                this.draw3DOval(lx,y,(lx+screwSize),(y+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }
        
            // right side
            
        if (GenerateUtilityClass.randomPercentage(0.33)) {
            for (n=0;n!==yCount;n++) {
                y=top+(yOffset+(n*(screwSize+5)));
                this.draw3DOval(rx,y,(rx+screwSize),(y+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }
        
            // top
            
        if (GenerateUtilityClass.randomPercentage(0.33)) {
            for (n=0;n!==xCount;n++) {
                x=lft+(xOffset+(n*(screwSize+5)));
                this.draw3DOval(x,ty,(x+screwSize),(ty+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }
        
            // bottom
            
        if (GenerateUtilityClass.randomPercentage(0.33)) {
            for (n=0;n!==xCount;n++) {
                x=lft+(xOffset+(n*(screwSize+5)));
                this.draw3DOval(x,by,(x+screwSize),(by+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }

*/
    }
    
    generateMetal()
    {
        let mx,my;
        
        let metalColor=this.getRandomColor();
        let edgeSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorCanvas.width*0.005),Math.trunc(this.colorCanvas.width*0.01));
        let screwSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorCanvas.width*0.02),Math.trunc(this.colorCanvas.width*0.02));
        
            // either single, dual, or 4 panel
            
        mx=Math.trunc(this.colorCanvas.width*0.5);
        my=Math.trunc(this.colorCanvas.height*0.5);
            
        switch (GenerateUtilityClass.randomIndex(3)) {
            case 0:
                this.generateMetalPanel(0,0,this.colorCanvas.width,this.colorCanvas.height,metalColor,edgeSize,screwSize);
                break;
            case 1:
                this.generateMetalPanel(0,0,mx,this.colorCanvas.height,metalColor,edgeSize,screwSize);
                this.generateMetalPanel(mx,0,this.colorCanvas.width,this.colorCanvas.height,metalColor,edgeSize,screwSize);
                break;
            case 2:
                this.generateMetalPanel(0,0,mx,my,metalColor,edgeSize,screwSize);
                this.generateMetalPanel(mx,0,this.colorCanvas.width,my,metalColor,edgeSize,screwSize);
                this.generateMetalPanel(0,my,mx,this.colorCanvas.height,metalColor,edgeSize,screwSize);
                this.generateMetalPanel(mx,my,this.colorCanvas.width,this.colorCanvas.height,metalColor,edgeSize,screwSize);
                break;
        }
        
            // finish with the specular

        this.createSpecularMap(0.6);
    }
            
        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateMetal();
    }

}
