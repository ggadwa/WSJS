import ColorClass from '../../code/utility/color.js';
import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate sky bitmap class
//

export default class GenBitmapSkyClass extends GenBitmapBaseClass
{
    constructor(view)
    {    
        super(view,false,false,false);
        Object.seal(this);
    }
        
        //
        // sky
        //
    
    generateClouds(lft,top,rgt,bot,allSides,cloudColor)
    {
        let n,x,y,x2,y2,xsz,ysz;
        let wid=rgt-lft;
        let high=bot-top;
        let quarterWid=Math.trunc(wid*0.25);
        let quarterHigh=Math.trunc(high*0.25);
        
            // random clouds
            
        for (n=0;n!==20;n++) {
            xsz=genRandom.randomInt(quarterWid,quarterWid);
            ysz=genRandom.randomInt(quarterHigh,quarterHigh);
            
            x=genRandom.randomInt(lft,wid)-Math.trunc(xsz*0.5);
            y=top-Math.trunc(ysz*0.5);
            
                // the top
                
            this.drawOval(x,y,(x+xsz),(y+ysz),cloudColor,null);
            if (x<lft) {
                x2=rgt+x;
                this.drawOval(x2,y,(x2+xsz),(y+ysz),cloudColor,null);
            }
            if ((x+xsz)>rgt) {
                x2=lft-((x+xsz)-rgt);
                this.drawOval(x2,y,(x2+xsz),(y+ysz),cloudColor,null);
            }
            
            if (!allSides) continue;
                
                // the bottom
                
            y=bot-Math.trunc(ysz*0.5);
            
            this.drawOval(x,y,(x+xsz),(y+ysz),cloudColor,null);
            if (x<lft) {
                x2=rgt+x;
                this.drawOval(x2,y,(x2+xsz),(y+ysz),cloudColor,null);
            }
            if ((x+xsz)>rgt) {
                x2=lft-((x+xsz)-rgt);
                this.drawOval(x2,y,(x2+xsz),(y+ysz),cloudColor,null);
            }
            
                // the left
                
            x=lft-Math.trunc(xsz*0.5);
            y=genRandom.randomInt(top,high)-Math.trunc(ysz*0.5);
                
            this.drawOval(x,y,(x+xsz),(y+ysz),cloudColor,null);
            if (y<bot) {
                y2=bot+y;
                this.drawOval(x,y2,(x+xsz),(y2+ysz),cloudColor,null);
            }
            if ((y+ysz)>bot) {
                y2=top-((y+ysz)-bot);
                this.drawOval(x,y2,(x+xsz),(y2+ysz),cloudColor,null);
            }
            
                // the right
                
            x=rgt-Math.trunc(xsz*0.5);
            
            this.drawOval(x,y,(x+xsz),(y+ysz),cloudColor,null);
            if (y<bot) {
                y2=bot+y;
                this.drawOval(x,y2,(x+xsz),(y2+ysz),cloudColor,null);
            }
            if ((y+ysz)>bot) {
                y2=top-((y+ysz)-bot);
                this.drawOval(x,y2,(x+xsz),(y2+ysz),cloudColor,null);
            }

        }
    }
    
    generateMountainsBuildRange(top,bot,rangeCount,rangeSize)
    {
        let n,y,halfCount;
        let midY,midDir,midCount;
        let rangeY;
        
            // we only do half the range,
            // and reverse for the other half so
            // they match up
            
        halfCount=Math.trunc(rangeCount*0.5);
                
            // remember the mid point and we either
            // favore going down or up if we pass it
            
        midY=Math.trunc((top+bot)*0.5);
        midDir=0;
        midCount=0;

            // create the range
        
        y=midY;
        rangeY=new Int16Array(rangeCount);

        for (n=0;n!=halfCount;n++) {
            rangeY[n]=y;
            rangeY[(rangeCount-1)-n]=y;
            
            if (midCount<=0) {
                midCount=genRandom.randomIndex(50);
                midDir=(y>midY)?-1:1;
            }
            
            if (midDir<0) {
                y+=(2-genRandom.randomIndex(rangeSize));
            }
            else {
                y+=((rangeSize-2)-genRandom.randomIndex(rangeSize));
            }
            
            midCount--;
        }
    
        return(rangeY);
    }
    
    generateMountainsDraw(lft,top,rgt,bot,rangeY,col)
    {
        let x,y,idx,rangeIdx;
        let wid=rgt-lft;
        let high=bot-top;
        let bitmapImgData,bitmapData;
        
        bitmapImgData=this.bitmapCTX.getImageData(lft,top,wid,high);
        bitmapData=bitmapImgData.data;
        
            // run through the ranges
            
        rangeIdx=0;

        for (x=lft;x!==rgt;x++) {
                
            for (y=rangeY[rangeIdx];y<bot;y++) {
                idx=((y*wid)+x)*4;
                
                bitmapData[idx]=Math.trunc(col.r*255.0);
                bitmapData[idx+1]=Math.trunc(col.g*255.0);
                bitmapData[idx+2]=Math.trunc(col.b*255.0);
            }
            
            rangeIdx++;
        }
        
        this.bitmapCTX.putImageData(bitmapImgData,lft,top);
    }

    generateSkyClouds()
    {
        let qx=Math.trunc(this.bitmapCanvas.width*0.25);
        let mx=Math.trunc(this.bitmapCanvas.width*0.5);
        let my=Math.trunc(this.bitmapCanvas.height*0.5);
        let rangeY;
        
        let cloudColor=new ColorClass(1,1,1);
        let skyColor=new ColorClass(0.1,0.95,1.0);
        let mountainColor=new ColorClass(0.65,0.35,0.0);
        let groundColor=new ColorClass(0.1,1.0,0.1);
        
            // top and bottom
            
        this.drawRect(0,my,qx,this.bitmapCanvas.height,skyColor);
        this.generateClouds(0,my,qx,this.bitmapCanvas.height,true,cloudColor);
        
        this.drawRect(qx,my,mx,this.bitmapCanvas.height,groundColor);
        
            // side
            
        this.drawVerticalGradient(0,0,this.bitmapCanvas.width,my,skyColor,this.darkenColor(skyColor,0.5));
        this.generateClouds(0,0,this.bitmapCanvas.width,my,false,cloudColor);
        this.blur(0,my,this.bitmapCanvas.width,this.bitmapCanvas.height,3,true);
        
        rangeY=this.generateMountainsBuildRange(0,Math.trunc(my*0.75),this.bitmapCanvas.width,8);
        this.generateMountainsDraw(0,0,this.bitmapCanvas.width,my,rangeY,this.darkenColor(mountainColor,0.8));
        
        rangeY=this.generateMountainsBuildRange(Math.trunc(my*0.25),my,this.bitmapCanvas.width,5);
        this.generateMountainsDraw(0,0,this.bitmapCanvas.width,my,rangeY,mountainColor);
        
        this.drawVerticalGradient(0,Math.trunc(my*0.9),this.bitmapCanvas.width,my,this.darkenColor(groundColor,0.8),groundColor);
        
        /* supergumba -- testing so we can see if the sky cube is properly positioned
        this.bitmapCTX.fillStyle='#FF0000';
        this.bitmapCTX.fillRect(480,10,30,30);
        this.bitmapCTX.fillStyle='#00FF00';
        this.bitmapCTX.fillRect(992,10,30,30);
        this.bitmapCTX.fillStyle='#0000FF';
        this.bitmapCTX.fillRect(1504,10,30,30);
        this.bitmapCTX.fillStyle='#FF00FF';
        this.bitmapCTX.fillRect(2016,10,30,30);
        */
       
    }

        //
        // generate mainline
        //

    generateInternal()
    {
        this.generateSkyClouds();
    }

}
