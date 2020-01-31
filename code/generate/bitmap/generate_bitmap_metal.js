import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';

//
// generate metal bitmap class
//

export default class GenerateBitmapMetalClass extends GenerateBitmapBaseClass
{
    constructor(core,colorScheme)
    {
        super(core,colorScheme);
        
        this.VARIATION_NONE=0;
        this.VARIATION_BOX=1;
        this.VARIATION_PIPE=2;
    
        this.CORRUGATION_LINES=
            [
                [[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]]],  // diamonds
                [[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]],[[0.0,1.0],[1.0,0.0]],[[0.0,0.0],[1.0,1.0]]],  // waves
                [[[0.5,0.0],[0.5,1.0]],[[0.0,0.5],[1.0,0.5]],[[0.0,0.5],[1.0,0.5]],[[0.5,0.0],[0.5,1.0]]]   // pluses
            ];
    
       
        this.hasNormal=true;
        this.hasSpecular=true;
        this.hasGlow=false;
        
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
        
        metalCorrColor=this.adjustColorRandom(metalColor,0.6,0.7);

        corrCount=this.core.randomInt(Math.trunc(wid*0.06),Math.trunc(wid*0.03));
        corrWid=Math.trunc(wid/corrCount);
        corrHigh=Math.trunc(high/corrCount);

        lineWid=corrWid-4;
        lineHigh=corrHigh-4;

        lineStyle=this.core.randomIndex(this.CORRUGATION_LINES.length);

            // corrugations

        dy=top+Math.trunc((high-(corrHigh*corrCount))*0.5);

        for (y=0;y!==corrCount;y++) {

            dx=lft+Math.trunc((wid-(corrWid*corrCount))*0.5);

            for (x=0;x!==corrCount;x++) {

                idx=((y&0x1)*2)+(x&0x1);
                line=this.CORRUGATION_LINES[lineStyle][idx];

                sx=dx+(line[0][0]*lineWid);
                sy=dy+(line[0][1]*lineHigh);
                ex=dx+(line[1][0]*lineWid);
                ey=dy+(line[1][1]*lineHigh);

                this.drawLineColor(sx,sy,ex,ey,metalCorrColor);
                this.drawLineNormal(sx,sy,ex,ey,this.NORMAL_CLEAR);
                
                if (Math.abs(ex-sx)>Math.abs(ey-sy)) {
                    this.drawLineNormal(sx,(sy+1),ex,(ey+1),this.NORMAL_BOTTOM_45);
                    this.drawLineNormal(sx,(sy-1),ex,(ey-1),this.NORMAL_TOP_45);
                }
                else {
                    this.drawLineNormal((sx+1),sy,(ex+1),ey,this.NORMAL_RIGHT_45);
                    this.drawLineNormal((sx-1),sy,(ex-1),ey,this.NORMAL_LEFT_45);
                }
                
                dx+=corrWid;
            }

            dy+=corrHigh;
        }
    }

    generateMetalScrews(lft,top,rgt,bot,screwColor,screwSize)
    {
        let mx,my;
        let edgeSize=Math.trunc(screwSize*0.5);
        let outlineColor=this.adjustColor(screwColor,0.8);
        
            // corners
            
        if (this.core.randomPercentage(0.33)) {
            this.drawOval(lft,top,(lft+screwSize),(top+screwSize),0,1,0,0,edgeSize,0.8,screwColor,outlineColor,0.5,false,false,1,0);
            this.drawOval((rgt-screwSize),top,rgt,(top+screwSize),0,1,0,0,edgeSize,0.8,screwColor,outlineColor,0.5,false,false,1,0);
            this.drawOval((rgt-screwSize),(bot-screwSize),rgt,bot,0,1,0,0,edgeSize,0.8,screwColor,outlineColor,0.5,false,false,1,0);
            this.drawOval(lft,(bot-screwSize),(lft+screwSize),bot,0,1,0,0,edgeSize,0.8,screwColor,outlineColor,0.5,false,false,1,0);
        }
        
            // middles
            
        if (this.core.randomPercentage(0.33)) {
            mx=Math.trunc((lft+rgt)*0.5)-Math.trunc(screwSize*0.5);
            my=Math.trunc((top+bot)*0.5)-Math.trunc(screwSize*0.5);
            this.drawOval(mx,top,(mx+screwSize),(top+screwSize),0,1,0,0,edgeSize,0.8,screwColor,outlineColor,0.5,false,false,1,0);
            this.drawOval((rgt-screwSize),my,rgt,(my+screwSize),0,1,0,0,edgeSize,0.8,screwColor,outlineColor,0.5,false,false,1,0);
            this.drawOval(mx,(bot-screwSize),(mx+screwSize),bot,0,1,0,0,edgeSize,0.8,screwColor,outlineColor,0.5,false,false,1,0);
            this.drawOval(lft,my,(lft+screwSize),(my+screwSize),0,1,0,0,edgeSize,0.8,screwColor,outlineColor,0.5,false,false,1,0);
        }
    }
    
    generateMetalWave(lft,top,rgt,bot,color)
    {
        let frameColor;
        let sz,waveCount;
        
        this.drawMetalShine(lft,top,rgt,bot,color);
        
        frameColor=this.adjustColorRandom(color,0.75,0.85);
        sz=Math.trunc(Math.max((rgt-lft),(bot-top))*0.045);
        waveCount=this.core.randomInt(sz,sz);
        if (this.core.randomPercentage(0.5)) {
            this.drawNormalWaveHorizontal(lft,top,rgt,bot,color,frameColor,waveCount);
        }
        else {
            this.drawNormalWaveVertical(lft,top,rgt,bot,color,frameColor,waveCount);
        }
    }

    generateMetalPanel(lft,top,rgt,bot,metalColor,altMetalColor,edgeSize,screwSize,variationMode)
    {
        let lft2,rgt2,top2,bot2,sz;
        let color,frameColor,screwColor,panelType;
        
            // colors
            
        if (this.core.randomPercentage(0.5)) {
            color=metalColor;
            screwColor=altMetalColor;
        }
        else {
            color=altMetalColor;
            screwColor=metalColor;
        }
        
        frameColor=this.adjustColorRandom(color,0.85,0.95);
        
            // the plate
            
        this.createPerlinNoiseData(16,16);
        this.drawRect(lft,top,rgt,bot,color);
        this.drawPerlinNoiseRect(lft,top,rgt,bot,0.8,1.0);
        
        this.drawMetalShine(lft,top,rgt,bot,color);
        this.draw3DFrameRect(lft,top,rgt,bot,edgeSize,frameColor,true);
        
            // variations
            
        panelType=(variationMode===this.VARIATION_BOX)?0:this.core.randomIndex(4);
            
        switch (panelType) {
            
                // internal box
                
            case 0:
                sz=this.core.randomInt(((edgeSize+screwSize)*2),(edgeSize*3));
                lft2=lft+sz;
                rgt2=rgt-sz;
                top2=top+sz;
                bot2=bot-sz;
                frameColor=this.adjustColorRandom(color,0.75,0.85);
                this.draw3DFrameRect(lft2,top2,rgt2,bot2,edgeSize,frameColor,false);
                this.drawMetalShine((lft2+edgeSize),(top2+edgeSize),(rgt2-edgeSize),(bot2-edgeSize),color);
                
                sz=edgeSize+screwSize;
                this.generateMetalScrews((lft+sz),(top+sz),(rgt-sz),(bot-sz),screwColor,screwSize);
                break;
                
                // corrugation
                
            case 1:
                sz=Math.trunc(edgeSize*2.5);
                this.generateMetalCorrugation((lft+sz),(top+sz),(rgt-sz),(bot-sz),color);
                break;
                
                // wave
                
            case 2:
                this.generateMetalWave((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),color);
                break;
                
                // empty
                
            case 3:
                sz=edgeSize+screwSize;
                this.generateMetalScrews((lft+sz),(top+sz),(rgt-sz),(bot-sz),screwColor,screwSize);
                break;
        }
    }
    
    generateMetalRegular(metalColor,altMetalColor,edgeSize,screwSize,variationMode)
    {
        let mx,my,panelCount;
        
            // either single, dual, or 4 panel
            
        mx=Math.trunc(this.colorImgData.width*0.5);
        my=Math.trunc(this.colorImgData.height*0.5);
        
        panelCount=this.core.randomIndex(3);
            
        switch (panelCount) {
            case 0:
                this.generateMetalPanel(0,0,this.colorImgData.width,this.colorImgData.height,metalColor,altMetalColor,edgeSize,screwSize,variationMode);
                break;
            case 1:
                this.generateMetalPanel(0,0,mx,this.colorImgData.height,metalColor,altMetalColor,edgeSize,screwSize,variationMode);
                this.generateMetalPanel(mx,0,this.colorImgData.width,this.colorImgData.height,metalColor,altMetalColor,edgeSize,screwSize,variationMode);
                break;
            case 2:
                this.generateMetalPanel(0,0,mx,my,metalColor,altMetalColor,edgeSize,screwSize,variationMode);
                this.generateMetalPanel(mx,0,this.colorImgData.width,my,metalColor,altMetalColor,edgeSize,screwSize,variationMode);
                this.generateMetalPanel(0,my,mx,this.colorImgData.height,metalColor,altMetalColor,edgeSize,screwSize,variationMode);
                this.generateMetalPanel(mx,my,this.colorImgData.width,this.colorImgData.height,metalColor,altMetalColor,edgeSize,screwSize,variationMode);
                break;
        }
    }
    
    generateMetalBox(metalColor,altMetalColor,edgeSize,screwSize,variationMode)
    {
        this.generateMetalPanel(0,0,this.colorImgData.width,this.colorImgData.height,metalColor,altMetalColor,edgeSize,screwSize,variationMode);
    }
    
    generateMetalPipe(metalColor,altMetalColor,edgeSize,screwSize,variationMode)
    {
        this.createPerlinNoiseData(16,16);
        this.drawRect(0,0,this.colorImgData.width,this.colorImgData.height,metalColor);
        this.drawPerlinNoiseRect(0,0,this.colorImgData.width,this.colorImgData.height,0.8,1.0);
        this.drawMetalShine(0,0,this.colorImgData.width,this.colorImgData.height,metalColor);
        
        // this.drawOval(lft,top,(lft+screwSize),(top+screwSize),0,1,0,0,edgeSize,0.8,screwColor,outlineColor,0.5,false,false,1,0);
    }
    
    generateInternal(variationMode)
    {
        let mx,my;
        let panelCount;
        
        let metalColor=this.getRandomColor();
        let altMetalColor=this.getRandomColor();
        let edgeSize=this.core.randomInt(Math.trunc(this.colorImgData.width*0.005),Math.trunc(this.colorImgData.width*0.005));
        let screwSize=this.core.randomInt(Math.trunc(this.colorImgData.width*0.008),Math.trunc(this.colorImgData.width*0.015));
        
        switch (variationMode) {
            case this.VARIATION_NONE:
                this.generateMetalRegular(metalColor,altMetalColor,edgeSize,screwSize,variationMode);
                break;
            case this.VARIATION_BOX:
                this.generateMetalBox(metalColor,altMetalColor,edgeSize,screwSize,variationMode);
                break;
            case this.VARIATION_PIPE:
                this.generateMetalPipe(metalColor,altMetalColor,edgeSize,screwSize,variationMode);
                break;
        }
        
            // finish with the specular

        this.createSpecularMap(120,0.6);
    }

}
