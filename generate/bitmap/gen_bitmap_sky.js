/* global genRandom */

"use strict";

//
// generate sky bitmap class
//

class GenBitmapSkyClass extends GenBitmapClass
{
    constructor()
    {    
        super();
        
        this.TYPE_CLOUDS=0;

        this.TYPE_NAMES=
                [
                    'Clouds'
                ];
        
        Object.seal(this);
    }
        
        //
        // sky
        //
    
    generateClouds(bitmapCTX,lft,top,rgt,bot,cloudColor)
    {
        let n,x,y,xsz,ysz;
        let wid=rgt-lft;
        let high=bot-top;
        let quarterWid=Math.trunc(wid*0.25);
        let quarterHigh=Math.trunc(high*0.25);
        
            // random clouds
            
        for (n=0;n!==20;n++) {
            xsz=genRandom.randomInt(quarterWid,quarterWid);
            ysz=genRandom.randomInt(quarterHigh,quarterHigh);
            
            x=genRandom.randomInt(lft,(wid-xsz));
            y=top-Math.trunc(ysz*0.5);
            
            this.drawOval(bitmapCTX,x,y,(x+xsz),(y+ysz),cloudColor,null);
        }
        
            // side cloud to complete wrapping
            
        this.drawOval(bitmapCTX,(lft-20),(top-20),(lft+20),(top+20),cloudColor,null);
        this.drawOval(bitmapCTX,(rgt-20),(top-20),(rgt+20),(top+20),cloudColor,null);
    }
    
    generateMountainsBuildRange(top,bot,yPercStart,rangeCount,rangeSize)
    {
        let n,yStart;
        let high=bot-top;
        let rangeY=[];
        
        yStart=high-Math.trunc(high*yPercStart);

        for (n=0;n<(rangeCount-1);n++) {
            rangeY.push(yStart+genRandom.randomInt(0,rangeSize));
        }
        
        rangeY.push(yStart);
    
        return(rangeY);
    }
    
    generateMountainsDraw(bitmapCTX,lft,top,rgt,bot,rangeY,yOffset,lineDepth,col)
    {
        let x,y,idx;
        let xSize,prevX,nextX,prevY,nextY,slopeY,rangeIdx;
        let wid=rgt-lft;
        let high=bot-top;
        let bitmapImgData,bitmapData;
        
        bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        bitmapData=bitmapImgData.data;
        
            // run through the ranges
            
        xSize=Math.trunc(wid/(rangeY.length+1));
        nextX=0;
        
        nextY=rangeY[0];
        
        rangeIdx=0;

        for (x=0;x!==wid;x++) {
            
                // time for new slope
                
            if (x===nextX) {
                prevX=nextX;
                nextX=prevX+xSize;
                
                prevY=nextY;
                
                if (rangeY.length>rangeIdx) {
                    nextY=rangeY[rangeIdx];
                    rangeIdx++;
                }
                else {
                    nextY=rangeY[0];
                }
            }
            
                // get the Y for the slope

            slopeY=(prevY+Math.trunc((nextY-prevY)*((x-prevX)/xSize)))+yOffset;
            
                // draw the line
                
            for (y=slopeY;y<bot;y++) {
                idx=((y*wid)+x)*4;
                
                if ((y-slopeY)<lineDepth) {
                    bitmapData[idx]=0;
                    bitmapData[idx+1]=0;
                    bitmapData[idx+2]=0;
                    continue;
                }

                bitmapData[idx]=Math.trunc(col.r*255.0);
                bitmapData[idx+1]=Math.trunc(col.g*255.0);
                bitmapData[idx+2]=Math.trunc(col.b*255.0);
            }
        }
        
        bitmapCTX.putImageData(bitmapImgData,lft,top);
    }

    generateSkyClouds(bitmapCTX,wid,high)
    {
        let mx=Math.trunc(wid*0.5);
        let my=Math.trunc(high*0.5);
        let rangeY;
        
        let cloudColor=this.getRandomColor();//new wsColor(1,1,1);
        let skyColor=this.getRandomColor();//new wsColor(0.1,0.95,1.0)
        let mountainColor=this.getRandomColor();//new wsColor(0.65,0.35,0.0);
        let groundColor=this.darkenColor(mountainColor,0.8);
        
        this.drawRect(bitmapCTX,0,0,wid,high,cloudColor);
        
            // side
            
        this.drawVerticalGradient(bitmapCTX,0,my,wid,high,skyColor,this.darkenColor(skyColor,0.5));
        this.generateClouds(bitmapCTX,0,my,wid,high,cloudColor);
        this.blur(bitmapCTX,0,my,wid,high,3,true);
        
        rangeY=this.generateMountainsBuildRange(my,high,0.5,genRandom.randomInt(20,10),30);
        this.generateMountainsDraw(bitmapCTX,0,my,wid,high,rangeY,0,3,mountainColor);
        
        rangeY=this.generateMountainsBuildRange(my,high,0.35,genRandom.randomInt(15,5),20);
        this.generateMountainsDraw(bitmapCTX,0,my,wid,high,rangeY,0,3,groundColor);
        
            // top and bottom
            
        this.drawRect(bitmapCTX,0,0,mx,my,cloudColor);
        this.drawRect(bitmapCTX,mx,0,wid,my,groundColor);
    }

        //
        // generate mainline
        //

    generate(generateType,inDebug)
    {
        let wid,high;
        let bitmapCanvas,bitmapCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=this.BITMAP_SKY_TEXTURE_SIZE;
        bitmapCanvas.height=this.BITMAP_SKY_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case this.TYPE_CLOUDS:
                this.generateSkyClouds(bitmapCTX,wid,high);
                break;
                
        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:null,specular:null});
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(bitmapCanvas,null,null,[(1.0/4000.0),(1.0/4000.0)],1.0));    
    }
    
    generateRandom(inDebug)
    {
        return(this.generate(genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}
