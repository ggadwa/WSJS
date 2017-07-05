/* global genRandom */

"use strict";

//
// generate machine bitmap class
//

class GenBitmapMachineClass extends GenBitmapClass
{
    constructor()
    {
        super();
        
            // types
            
        this.TYPE_COMPUTER=0;

        this.TYPE_NAMES=
                [
                    'Computer'
                ];
        
        Object.seal(this);
    }
    
        //
        // components
        //
        
    generateComputerComponentMonitor(bitmapCTX,normalCTX,lft,top,rgt,bot)
    {
        let x,y,mx,my,lx,ly,dx,dy,meterSize,meterHalfSize;
        let horz,color;
        let monitorColor=new wsColor(0.2,0.2,0.2);
        
            // monitor background
            
        lft+=5;
        rgt-=5;
        top+=5;
        bot-=5;
            
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,3,monitorColor,false);
        
        color=this.getRandomColor();
        
            // determine if horz or vertical
            
        horz=((rgt-lft)>(bot-top));
        
        lft+=3;
        rgt-=3;
        top+=3;
        bot-=3;
        
        if (horz) {
            my=Math.trunc((top+bot)*0.5);
            
            lx=lft;
            ly=my;
            
            meterSize=bot-top;
            meterHalfSize=Math.trunc(meterSize*0.5);
            
            for (x=lft;x<=rgt;x+=5) {
                if (x>rgt) x=rgt;
                dy=my+(genRandom.randomInt(0,meterSize)-meterHalfSize);

                this.drawLine(bitmapCTX,normalCTX,lx,ly,x,dy,color,true);

                lx=x;
                ly=dy;
            }   
        }
        else {
            mx=Math.trunc((lft+rgt)*0.5);
            
            lx=mx;
            ly=top;
            meterSize=rgt-lft;
            meterHalfSize=Math.trunc(meterSize*0.5);
            
            for (y=top;y<=bot;y+=5) {
                if (y>bot) y=bot;
                dx=mx+(genRandom.randomInt(0,meterSize)-meterHalfSize);

                this.drawLine(bitmapCTX,normalCTX,lx,ly,dx,y,color,true);

                lx=dx;
                ly=y;
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

        nShutter=Math.trunc((bot-top)/30);

        yAdd=(bot-top)/nShutter;
        y=top+Math.trunc(yAdd/2);

        shutterSize=genRandom.randomInt(5,Math.trunc(yAdd*0.2));

        for (n=0;n!==nShutter;n++) {
            this.drawSlope(bitmapCTX,normalCTX,lft,y,rgt,(y+shutterSize),shutterEdgeColor,false);
            y+=yAdd;
        }
    }
    
    generateComputerComponentLights(bitmapCTX,normalCTX,lft,top,rgt,bot)
    {
        let x,y,xCount,yCount,xOff,yOff,dx,dy,wid;
        let color;
        
        wid=genRandom.randomInt(30,25);
        
        xCount=Math.trunc((rgt-lft)/wid)-1;
        yCount=Math.trunc((bot-top)/wid)-1;
        
        if ((xCount<=0) || (yCount<=0)) return;
        if (xCount>10) xCount=10;
        if (yCount>10) yCount=10;
        
        xOff=(lft+2)+Math.trunc(((rgt-lft)-(xCount*wid))/2);
        yOff=(top+2)+Math.trunc(((bot-top)-(yCount*wid))/2);
        
        for (y=0;y!==yCount;y++) {
            dy=yOff+(y*wid);
            
            for (x=0;x!==xCount;x++) {
                dx=xOff+(x*wid);
                color=this.getRandomColor();
                if (genRandom.randomPercentage(0.5)) this.darkenColor(color,0.7);
                
                this.draw3DOval(bitmapCTX,normalCTX,dx,dy,(dx+(wid-5)),(dy+(wid-5)),0.0,1.0,3,0,color,this.blackColor);
            }
        }
    }
    
    generateComputerComponentButtons(bitmapCTX,normalCTX,lft,top,rgt,bot)
    {
        let x,y,xCount,yCount,xOff,yOff,dx,dy,wid;
        
        wid=genRandom.randomInt(30,25);
        
        xCount=Math.trunc((rgt-lft)/wid)-1;
        yCount=Math.trunc((bot-top)/wid)-1;
        
        if ((xCount<=0) || (yCount<=0)) return;
        if (xCount>10) xCount=10;
        if (yCount>10) yCount=10;
        
        xOff=(lft+2)+Math.trunc(((rgt-lft)-(xCount*wid))/2);
        yOff=(top+2)+Math.trunc(((bot-top)-(yCount*wid))/2);
        
        for (y=0;y!==yCount;y++) {
            dy=yOff+(y*wid);
            
            for (x=0;x!==xCount;x++) {
                dx=xOff+(x*wid);
                this.draw3DRect(bitmapCTX,normalCTX,dx,dy,(dx+wid),(dy+wid),2,this.getRandomColor(),false);
            }
        }
    }
    
        //
        // computer
        //
        
    generateComputer(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let mx,my,sz,lft,top,rgt,bot;
        let componentType,hadBlank,hadMonitor,hadShutter;
        let metalColor=this.getDefaultPrimaryColor();
        let metalInsideColor=this.boostColor(metalColor,0.1);
       
            // face plate
            
        this.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,8,metalColor,true);
        
            // inside components
            // these are stacks of vertical or horizontal chunks
            
        mx=15;
        my=15;
        
        hadBlank=false;
        hadMonitor=false;
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
            
                // draw the components
                // we only allow one blank, monitor, or shutter
                
            this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,5,metalInsideColor,false);
            
            componentType=genRandom.randomIndex(5);
            if ((componentType===0) && (hadBlank)) componentType++;
            if ((componentType===1) && (hadMonitor)) componentType++;
            if ((componentType===2) && (hadShutter)) componentType++;
            
            switch (componentType) {
                case 0:
                    hadBlank=true;
                    break;
                case 1:
                    hadMonitor=true;
                    this.generateComputerComponentMonitor(bitmapCTX,normalCTX,lft,top,rgt,bot);
                    break;
                case 2:
                    hadShutter=true;
                    this.generateComputerComponentShutter(bitmapCTX,normalCTX,lft,top,rgt,bot);
                    break;
                case 3:
                    this.generateComputerComponentLights(bitmapCTX,normalCTX,lft,top,rgt,bot);
                    break;
                case 4:
                    this.generateComputerComponentButtons(bitmapCTX,normalCTX,lft,top,rgt,bot);
                    break;
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

    generate(generateType,inDebug)
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
        glowCanvas.width=2;
        glowCanvas.height=2;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,2,2);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case this.TYPE_COMPUTER:
                this.generateComputer(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=1.5;
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
