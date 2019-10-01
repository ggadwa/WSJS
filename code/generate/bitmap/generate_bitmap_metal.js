import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate metal bitmap class
//

export default class GenerateBitmapMetalClass extends GenerateBitmapBaseClass
{
    static CORRUGATION_LINES=
            [
                [[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]]],  // diamonds
                [[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]]],  // waves
                [[[0.5,0.0],[0.5,1.0]],[[0.0,0.5],[1.0,0.5]],[[0.0,0.5],[1.0,0.5]],[[0.5,0.0],[0.5,1.0]]]   // pluses
            ];
    
    constructor(core)
    {
        super(core,true,true,false);
        Object.seal(this);
    }
            
        //
        // metal pieces
        //
    
    generateMetalCorrugation(lft,top,rgt,bot,metalColor)
    {
        let x,y,dx,dy,sx,sy,ex,ey,idx,line;
        let corrCount,corrWid,corrHigh;
        let lineStyle,lineWid,lineHigh;
        let metalCorrColor;
        let wid=rgt-lft;
        let high=bot-top;
        
        if ((wid<=0) || (high<=0)) return;
        
        metalCorrColor=this.darkenColor(metalColor,0.6);

        corrCount=GenerateUtilityClass.randomInt(Math.trunc(wid*0.015),Math.trunc(wid*0.025));
        corrWid=Math.trunc(wid/corrCount);
        corrHigh=Math.trunc(high/corrCount);

        lineWid=corrWid-4;
        lineHigh=corrHigh-4;

        lineStyle=GenerateUtilityClass.randomIndex(GenerateBitmapMetalClass.CORRUGATION_LINES.length);

            // corrugations

        dy=top+Math.trunc((high-(corrHigh*corrCount))*0.5);

        for (y=0;y!==corrCount;y++) {

            dx=lft+Math.trunc((wid-(corrWid*corrCount))*0.5);

            for (x=0;x!==corrCount;x++) {

                idx=((y&0x1)*2)+(x&0x1);
                line=GenerateBitmapMetalClass.CORRUGATION_LINES[lineStyle][idx];

                sx=dx+(line[0][0]*lineWid);
                sy=dy+(line[0][1]*lineHigh);
                ex=dx+(line[1][0]*lineWid);
                ey=dy+(line[1][1]*lineHigh);

                this.drawLineColor(sx,sy,ex,ey,metalCorrColor,true,true);

                dx+=corrWid;
            }

            dy+=corrHigh;
        }
    }

    generateMetalScrews(lft,top,rgt,bot,screwColor,screwSize)
    {
        let edgeSize=Math.trunc(screwSize*0.5);
        
            // corners
            
        if (GenerateUtilityClass.randomPercentage(0.33)) {
            this.drawOval(lft,top,(lft+screwSize),(top+screwSize),0,1,0,0,edgeSize,screwColor,0.5,true,false,1,0);
            this.drawOval((rgt-screwSize),top,rgt,(top+screwSize),0,1,0,0,edgeSize,screwColor,0.5,true,false,1,0);
            this.drawOval((rgt-screwSize),(bot-screwSize),rgt,bot,0,1,0,0,edgeSize,screwColor,0.5,true,false,1,0);
            this.drawOval(lft,(bot-screwSize),(lft+screwSize),bot,0,1,0,0,edgeSize,screwColor,0.5,true,false,1,0);
        }
        
            // middles

    }

    generateMetalPanel(lft,top,rgt,bot,metalColor,edgeSize,screwSize)
    {
        let lft2,rgt2,top2,bot2,sz;
        let frameColor;
        let screwColor=this.boostColor(metalColor,0.05);
        
            // the plate
            
        this.createPerlinNoiseData(8,8,0.8);
        this.drawRect(lft,top,rgt,bot,metalColor);
        this.drawPerlinNoiseRect(lft,top,rgt,bot,0.5,1.3);

        frameColor=this.darkenColor(metalColor,0.9);
        this.drawMetalShine(lft,top,rgt,bot,metalColor);
        this.draw3DFrameRect(lft,top,rgt,bot,edgeSize,frameColor,true);
        
            // variations
            
        switch (GenerateUtilityClass.randomIndex(3)) {
            
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
                
                sz=edgeSize+Math.trunc(edgeSize*0.2);
                this.generateMetalScrews((lft+sz),(top+sz),(rgt-sz),(bot-sz),screwColor,screwSize);
                break;
                
                // corrugation
                
            case 1:
                sz=Math.trunc(edgeSize*2.5);
                this.generateMetalCorrugation((lft+sz),(top+sz),(rgt-sz),(bot-sz),metalColor);
                break;
                
                // empty
                
            case 2:
                sz=edgeSize+Math.trunc(edgeSize*0.2);
                this.generateMetalScrews((lft+sz),(top+sz),(rgt-sz),(bot-sz),screwColor,screwSize);
                break;
        }
    }
    
    generateInternal()
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

}
