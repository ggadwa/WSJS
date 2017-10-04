import ColorClass from '../../code/utility/color.js';
import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate computer bitmap class
//

export default class GenBitmapComputerClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view);
        Object.seal(this);
    }
    
        //
        // components
        //
        
    generateComputerComponentWires(bitmapCTX,normalCTX,lft,top,rgt,bot)
    {
        let n,nLine;
        let x,y;
        let horz,lineColor;
        
            // wires background
            
        lft+=5;
        rgt-=5;
        top+=5;
        bot-=5;
            
        this.drawRect(bitmapCTX,lft,top,rgt,bot,this.blackColor);
        
            // determine if horz or vertical
            
        horz=((rgt-lft)>(bot-top));
        
        if (horz) {
            nLine=Math.trunc((bot-top)*0.7);
            if (nLine<=0) return;
            
            for (n=0;n!==nLine;n++) {
                y=(top+5)+genRandom.randomInt(0,((bot-top)-10));
                
                lineColor=this.getRandomColor();
                this.drawRandomLine(bitmapCTX,normalCTX,lft,y,rgt,y,lft,top,rgt,bot,5,lineColor,false);
            }
        }
        else {
            nLine=Math.trunc((rgt-lft)*0.7);
            if (nLine<=0) return;
            
            for (n=0;n!==nLine;n++) {
                x=(lft+5)+genRandom.randomInt(0,((rgt-lft)-10));
                
                lineColor=this.getRandomColor();
                this.drawRandomLine(bitmapCTX,normalCTX,x,top,x,bot,lft,top,rgt,bot,5,lineColor,false);
            }
        }
    }
    
    generateComputerComponentShutter(bitmapCTX,normalCTX,lft,top,rgt,bot)
    {
        let y;
        let n,nShutter,shutterSize,yAdd,shutterColor,shutterEdgeColor;
        
        lft+=5;
        rgt-=5;
        top+=5;
        bot-=5;

        shutterColor=this.getRandomColor();
        shutterEdgeColor=this.darkenColor(shutterColor,0.9);

        this.drawRect(bitmapCTX,lft,top,rgt,bot,shutterColor);

        nShutter=Math.trunc((bot-top)/20);

        yAdd=(bot-top)/nShutter;
        y=top+Math.trunc(yAdd/2);

        shutterSize=genRandom.randomInt(5,Math.trunc(yAdd*0.2));

        for (n=0;n!==nShutter;n++) {
            this.drawSlope(bitmapCTX,normalCTX,lft,y,rgt,(y+shutterSize),shutterEdgeColor,false);
            y+=yAdd;
        }
    }
    
    generateComputerComponentLights(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot)
    {
        let x,y,xCount,yCount,xOff,yOff,dx,dy,wid;
        let color;
        
        wid=genRandom.randomInt(20,20);
        
        xCount=Math.trunc((rgt-lft)/wid);
        yCount=Math.trunc((bot-top)/wid);
        
        if ((xCount<=0) || (yCount<=0)) return;
        
        xOff=(lft+2)+Math.trunc(((rgt-lft)-(xCount*wid))/2);
        yOff=(top+2)+Math.trunc(((bot-top)-(yCount*wid))/2);
        
        for (y=0;y!==yCount;y++) {
            dy=yOff+(y*wid);
            
            for (x=0;x!==xCount;x++) {
                dx=xOff+(x*wid);
                
                    // the light
                    
                color=this.getRandomColor();
                if (genRandom.randomPercentage(0.5)) color=this.darkenColor(color,0.7);
                this.draw3DOval(bitmapCTX,normalCTX,dx,dy,(dx+(wid-5)),(dy+(wid-5)),0.0,1.0,3,0,color,this.blackColor);
                
                    // the possible glow
                    
                if (genRandom.randomPercentage(0.5)) this.drawOval(glowCTX,(dx+2),(dy+2),(dx+(wid-6)),(dy+(wid-6)),this.darkenColor(color,0.7),null);
            }
        }
    }
    
    generateComputerComponentButtons(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot)
    {
        let x,y,xCount,yCount,xOff,yOff,dx,dy,wid;
        let color;
        
        wid=genRandom.randomInt(30,25);
        
        xCount=Math.trunc((rgt-lft)/wid);
        yCount=Math.trunc((bot-top)/wid);
        
        if ((xCount<=0) || (yCount<=0)) return;
        
        xOff=(lft+2)+Math.trunc(((rgt-lft)-(xCount*wid))/2);
        yOff=(top+2)+Math.trunc(((bot-top)-(yCount*wid))/2);
        
        for (y=0;y!==yCount;y++) {
            dy=yOff+(y*wid);
            
            for (x=0;x!==xCount;x++) {
                dx=xOff+(x*wid);
                
                    // the button
                
                color=this.getRandomColor();
                this.draw3DRect(bitmapCTX,normalCTX,dx,dy,(dx+wid),(dy+wid),2,color,false);
                
                    // the possible glow
                    
                if (genRandom.randomPercentage(0.5)) this.drawRect(glowCTX,dx,dy,(dx+wid),(dy+wid),this.darkenColor(color,0.5));
            }
        }
    }
    
    generateComputerComponentDrives(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot)
    {
        let x,y,xCount,yCount,dx,dy,bx,by,wid,high;
        let color,ledColor;
        let ledColors=[new ColorClass(0.0,1.0,0.0),new ColorClass(1.0,1.0,0.0),new ColorClass(1.0,0.0,0.0)];
        
            // the random color (always dark)
            
        color=this.getRandomGray(0.1,0.3);
        
            // the drive sizes
            // pick randomly, but make sure they fill entire size
        
        high=genRandom.randomInt(20,10);
        wid=high*2;
        
        xCount=Math.trunc((rgt-lft)/wid);
        yCount=Math.trunc((bot-top)/high);
        
        if (xCount<=0) xCount=1;
        if (yCount<=0) yCount=1;
        
        wid=Math.trunc(((rgt-lft)-10)/xCount);
        high=Math.trunc(((bot-top)-10)/yCount);
        
        for (y=0;y!==yCount;y++) {
            dy=(top+5)+(y*high);
            
            for (x=0;x!==xCount;x++) {
                dx=(lft+5)+(x*wid);
                
                    // the drive
                
                this.draw3DRect(bitmapCTX,normalCTX,dx,dy,(dx+wid),(dy+high),2,color,true);
                
                    // the glowing indicator
                
                ledColor=ledColors[genRandom.randomIndex(3)];
                
                bx=(dx+wid)-6;
                by=(dy+high)-6;
                this.drawRect(bitmapCTX,bx,by,(bx+3),(by+3),ledColor);
                this.drawRect(glowCTX,bx,by,(bx+3),(by+3),this.darkenColor(ledColor,0.5));
            }
        }
    }
    
        //
        // computer
        //
        
    generateComputer(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high)
    {
        let mx,my,sz,lft,top,rgt,bot,rndTry;
        let componentType,hadBlank,hadWires,hadShutter,rndSuccess;
        let offset=Math.trunc(wid*0.1);
        let panelColor=this.getRandomColor();
        let panelInsideColor=this.boostColor(panelColor,0.1);
       
            // this is a collection of plates that are
            // used to wrap the object around cubes
            
        this.draw3DRect(bitmapCTX,normalCTX,offset,0,wid,offset,8,panelColor,true);
        this.draw3DRect(bitmapCTX,normalCTX,0,offset,offset,high,8,panelColor,true);
        
        this.draw3DRect(bitmapCTX,normalCTX,offset,offset,wid,high,8,panelColor,true);
        
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
            sz=genRandom.randomInt(100,50);
            
                // vertical stack
                
            if (genRandom.randomPercentage(0.5)) {
                rgt=lft+sz;
                if (rgt>(wid-15)) rgt=wid-15;
                bot=high-15;
                
                mx+=(sz+5);
            }
            
                // horizontal stack
                
            else {
                bot=top+sz;
                if (bot>(high-15)) bot=high-15;
                rgt=wid-15;
                
                my+=(sz+5);
            }
            
                // box around components, can
                // be randonly in or out
                
            this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,5,panelInsideColor,genRandom.randomPercentage(0.5));
            
                // draw the components
                // we only allow one blank, wires, or shutter
            
            rndTry=0;
            
            while (rndTry<25) {
                componentType=genRandom.randomIndex(6);
                
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
                        this.generateComputerComponentWires(bitmapCTX,normalCTX,lft,top,rgt,bot);
                        rndSuccess=true;
                        break;
                    case 2:
                        if (hadShutter) break;
                        hadShutter=true;
                        this.generateComputerComponentShutter(bitmapCTX,normalCTX,lft,top,rgt,bot);
                        rndSuccess=true;
                        break;
                    case 3:
                        this.generateComputerComponentLights(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot);
                        rndSuccess=true;
                        break;
                    case 4:
                        this.generateComputerComponentButtons(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot);
                        rndSuccess=true;
                        break;
                    case 5:
                        this.generateComputerComponentDrives(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot);
                        rndSuccess=true;
                        break;
                }
                
                if (rndSuccess) break;
                
                rndTry++;
            }
            
                // are we finished?
                
            if ((mx>=(wid-15)) || (my>=(high-15))) break;
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);
    }

        //
        // generate mainline
        //

    generate(inDebug)
    {
        let wid,high;
        let shineFactor=1.0;
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
        glowCanvas.width=this.BITMAP_MAP_TEXTURE_SIZE;
        glowCanvas.height=this.BITMAP_MAP_TEXTURE_SIZE;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,this.BITMAP_MAP_TEXTURE_SIZE,this.BITMAP_MAP_TEXTURE_SIZE);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generateComputer(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high);
                shineFactor=1.5;
                break;

        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }

}
