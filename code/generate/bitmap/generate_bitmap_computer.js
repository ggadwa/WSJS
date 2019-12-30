import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate computer bitmap class
//

export default class GenerateBitmapComputerClass extends GenerateBitmapBaseClass
{
    static VARIATION_NONE=0;
    static VARIATION_CONTROL_PANEL=0;
    
    constructor(core,colorScheme)
    {
        super(core,colorScheme);
        
        this.hasNormal=true;
        this.hasSpecular=true;
        this.hasGlow=true;
        
        Object.seal(this);
    }
    
        //
        // components
        //
        
    generateComputerComponentWires(lft,top,rgt,bot,edgeSize)
    {
        let n,nLine;
        let x,y;
        let horz,lineColor;
        
            // wires background
            
        lft+=edgeSize;
        rgt-=edgeSize;
        top+=edgeSize;
        bot-=edgeSize;
            
        this.drawRect(lft,top,rgt,bot,this.blackColor);
        
            // determine if horz or vertical
            
        horz=((rgt-lft)>(bot-top));
        
        if (horz) {
            nLine=Math.trunc((bot-top)*0.7);
            if (nLine<=0) return;
            
            for (n=0;n!==nLine;n++) {
                y=(top+5)+GenerateUtilityClass.randomInt(0,((bot-top)-10));
                
                lineColor=this.getRandomColor();
                this.drawRandomLine(lft,y,rgt,y,lft,top,rgt,bot,5,lineColor,true);
            }
        }
        else {
            nLine=Math.trunc((rgt-lft)*0.7);
            if (nLine<=0) return;
            
            for (n=0;n!==nLine;n++) {
                x=(lft+5)+GenerateUtilityClass.randomInt(0,((rgt-lft)-10));
                
                lineColor=this.getRandomColor();
                this.drawRandomLine(x,top,x,bot,lft,top,rgt,bot,5,lineColor,true);
            }
        }
    }
    
    generateComputerComponentShutter(lft,top,rgt,bot,edgeSize)
    {
        let sz;
        let shutterCount,shutterColor,shutterEdgeColor;

        lft+=edgeSize;
        rgt-=edgeSize;
        top+=edgeSize;
        bot-=edgeSize;
       
        shutterColor=this.getRandomColor();
        shutterEdgeColor=this.adjustColor(shutterColor,0.9);
        
        sz=Math.trunc(Math.max((rgt-lft),(bot-top))*0.075);
        shutterCount=GenerateUtilityClass.randomInt(sz,sz);
        
        if ((rgt-lft)>(bot-top)) {
            this.drawNormalWaveHorizontal(lft,top,rgt,bot,shutterColor,shutterEdgeColor,shutterCount);
        }
        else {
            this.drawNormalWaveVertical(lft,top,rgt,bot,shutterColor,shutterEdgeColor,shutterCount);
        }
    }
    
    generateComputerComponentLights(lft,top,rgt,bot,edgeSize)
    {
        let x,y,xCount,yCount,xOff,yOff,dx,dy,sz,margin;
        let color;
        
        lft+=edgeSize;
        rgt-=edgeSize;
        top+=edgeSize;
        bot-=edgeSize;
        
        sz=GenerateUtilityClass.randomInt(5,20);
        margin=GenerateUtilityClass.randomInt(2,3);
        
        xCount=Math.trunc((rgt-lft)/sz);
        yCount=Math.trunc((bot-top)/sz);
        
        if ((xCount<=0) || (yCount<=0)) return;
        
        xOff=(lft+Math.trunc(margin*0.5))+Math.trunc(((rgt-lft)-(xCount*sz))*0.5);
        yOff=(top+Math.trunc(margin*0.5))+Math.trunc(((bot-top)-(yCount*sz))*0.5);
        
        for (y=0;y!==yCount;y++) {
            dy=yOff+(y*sz);
            
            for (x=0;x!==xCount;x++) {
                dx=xOff+(x*sz);
                
                    // the light
                    
                color=this.getRandomColor();
                if (GenerateUtilityClass.randomPercentage(0.5)) color=this.adjustColor(color,0.7);
                this.drawOval(dx,dy,(dx+(sz-margin)),(dy+(sz-margin)),0,1,0,0,2,0.8,color,this.blackColor,0.5,false,false,1,0);
                
                    // the possible glow
                    
                if (GenerateUtilityClass.randomPercentage(0.5)) this.drawOvalGlow(dx,dy,(dx+(sz-margin)),(dy+(sz-margin)),this.adjustColor(color,0.7));
            }
        }
    }
    
    generateComputerComponentButtons(lft,top,rgt,bot,edgeSize)
    {
        let x,y,xCount,yCount,xOff,yOff,dx,dy,sz;
        let color,outlineColor;
        
        lft+=edgeSize;
        rgt-=edgeSize;
        top+=edgeSize;
        bot-=edgeSize;
        
        sz=GenerateUtilityClass.randomInt(10,30);
        
        xCount=Math.trunc((rgt-lft)/sz);
        yCount=Math.trunc((bot-top)/sz);
        
        if ((xCount<=0) || (yCount<=0)) return;
        
        xOff=(lft+2)+Math.trunc(((rgt-lft)-(xCount*sz))/2);
        yOff=(top+2)+Math.trunc(((bot-top)-(yCount*sz))/2);
        
        outlineColor=this.getRandomGray(0.1,0.3);
        
        for (y=0;y!==yCount;y++) {
            dy=yOff+(y*sz);
            
            for (x=0;x!==xCount;x++) {
                dx=xOff+(x*sz);
                
                    // the button
                
                color=this.getRandomColor();
                this.drawRect(dx,dy,(dx+sz),(dy+sz),color);
                this.draw3DFrameRect(dx,dy,(dx+sz),(dy+sz),2,outlineColor,true);
                
                    // the possible glow
                    
                if (GenerateUtilityClass.randomPercentage(0.5)) this.drawRectGlow(dx,dy,(dx+sz),(dy+sz),color);
            }
        }
    }
    
    generateComputerComponentDrives(lft,top,rgt,bot,edgeSize)
    {
        let x,y,xCount,yCount,dx,dy,bx,by,wid,high,margin;
        let color,outlineColor,ledColor;
        let ledColors=[new ColorClass(0.0,1.0,0.0),new ColorClass(1.0,1.0,0.0),new ColorClass(1.0,0.0,0.0)];
        
        lft+=edgeSize;
        rgt-=edgeSize;
        top+=edgeSize;
        bot-=edgeSize;
        
            // the random color (always dark)
            
        color=this.getRandomGray(0.1,0.3);
        outlineColor=this.adjustColor(color,0.8);
        
            // the drive sizes
            // pick randomly, but make sure they fill entire size
        
        high=GenerateUtilityClass.randomInt(20,10);
        wid=high*2;
        
        xCount=Math.trunc((rgt-lft)/wid);
        yCount=Math.trunc((bot-top)/high);
        
        if (xCount<=0) xCount=1;
        if (yCount<=0) yCount=1;
        
        margin=GenerateUtilityClass.randomInt(3,5);
        
        wid=Math.trunc(((rgt-lft)-(margin*2))/xCount);
        high=Math.trunc(((bot-top)-(margin*2))/yCount);
        
        for (y=0;y!==yCount;y++) {
            dy=(top+margin)+(y*high);
            
            for (x=0;x!==xCount;x++) {
                dx=(lft+margin)+(x*wid);
                
                    // the drive
                
                this.drawRect(dx,dy,(dx+wid),(dy+high),color);
                this.draw3DFrameRect(dx,dy,(dx+wid),(dy+high),2,outlineColor,true);
                
                    // the glowing indicator
                
                ledColor=ledColors[GenerateUtilityClass.randomIndex(3)];
                
                bx=(dx+wid)-10;
                by=(dy+high)-8;
                this.drawRect(bx,by,(bx+6),(by+3),ledColor);
                this.drawRectGlow(bx,by,(bx+6),(by+3),ledColor);
            }
        }
    }
    
        //
        // computer
        //
        
    generateInternal(variationMode)
    {
        let mx,my,sz,lft,top,rgt,bot,rndTry;
        let componentType,hadBlank,hadWires,hadShutter,rndSuccess;
        let offset=Math.trunc(this.colorImgData.width*0.1);
        let panelColor=this.getRandomColor();
        let panelInsideColor=this.adjustColor(panelColor,1.1);
        
        let panelEdgeSize=GenerateUtilityClass.randomInt(4,4);
        let panelInsideEdgeSize=GenerateUtilityClass.randomInt(2,3);
       
            // this is a collection of plates that are
            // used to wrap the object around cubes
            
        this.drawRect(0,0,this.colorCanvas.width,this.colorCanvas.height,panelColor);
        
        this.draw3DFrameRect(offset,0,this.colorImgData.width,offset,panelEdgeSize,panelColor,true);
        this.draw3DFrameRect(0,offset,offset,this.colorImgData.height,panelEdgeSize,panelColor,true);
        this.draw3DFrameRect(offset,offset,this.colorImgData.width,this.colorImgData.height,panelEdgeSize,panelColor,true);
        this.draw3DFrameRect(0,0,offset,offset,panelEdgeSize,panelColor,true);
        
            // inside components
            // these are stacks of vertical or horizontal chunks
            
        mx=offset+15;
        my=offset+15;
        
        hadBlank=false;
        hadWires=false;
        hadShutter=false;
        
        while (true) {
            
            lft=mx;
            top=my;
            sz=GenerateUtilityClass.randomInt(100,50);
            
                // vertical stack
                
            if (GenerateUtilityClass.randomPercentage(0.5)) {
                rgt=lft+sz;
                if (rgt>(this.colorImgData.width-55)) rgt=this.colorImgData.width-15;
                bot=this.colorImgData.height-15;
                
                mx+=(sz+5);
            }
            
                // horizontal stack
                
            else {
                bot=top+sz;
                if (bot>(this.colorImgData.height-55)) bot=this.colorImgData.height-15;
                rgt=this.colorImgData.width-15;
                
                my+=(sz+5);
            }
            
                // box around components, can
                // be randonly in or out
                
            this.drawRect(lft,top,rgt,bot,panelInsideColor);
            this.draw3DFrameRect(lft,top,rgt,bot,panelInsideEdgeSize,panelInsideColor,GenerateUtilityClass.randomPercentage(0.5));
            
                // if too small than no items
                
            if ((mx>=(this.colorImgData.width-15)) || (my>=(this.colorImgData.height-15))) break;
            
                // draw the components
                // we only allow one blank, wires, or shutter

            rndTry=0;
            
            while (rndTry<25) {
                componentType=GenerateUtilityClass.randomIndex(6);
                
                rndSuccess=false;

                switch (componentType) {
                    case 0:
                        if (hadBlank) break;
                        hadBlank=true;
                        rndSuccess=true;
                        break;
                    case 1:
                        if (hadWires) break;
                        hadWires=true;
                        this.generateComputerComponentWires(lft,top,rgt,bot,panelInsideEdgeSize);
                        rndSuccess=true;
                        break;
                    case 2:
                        if (hadShutter) break;
                        hadShutter=true;
                        this.generateComputerComponentShutter(lft,top,rgt,bot,panelInsideEdgeSize);
                        rndSuccess=true;
                        break;
                    case 3:
                        this.generateComputerComponentLights(lft,top,rgt,bot,panelInsideEdgeSize);
                        rndSuccess=true;
                        break;
                    case 4:
                        this.generateComputerComponentButtons(lft,top,rgt,bot,panelInsideEdgeSize);
                        rndSuccess=true;
                        break;
                    case 5:
                        this.generateComputerComponentDrives(lft,top,rgt,bot,panelInsideEdgeSize);
                        rndSuccess=true;
                        break;
                }
                
                if (rndSuccess) break;
                
                rndTry++;
            }
        }
        
            // set the glow frequency
            
        this.glowFrequency=500;
        this.glowMin=0.6;
        this.glowMax=0.8;
        
            // finish with the specular

        this.createSpecularMap(0.4);
    }

}
