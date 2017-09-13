import genRandom from '../../generate/utility/random.js';
import ColorClass from '../../code/utility/color.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate panel bitmap class
//

export default class GenBitmapPanelClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view);
        Object.seal(this);
    }
    
        //
        // panel
        //
        
    generatePanelMonitor(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot)
    {
        let n,nChar,str,y;
        let fontSize;
        let usedChars='0123456789@*_&%:.ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
            // monitor background
        
        top+=5;
        bot-=5;
        
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,3,this.blackColor,false);
        
            // the text
            
        fontSize=(bot-top)-10;
        
        str='';
        nChar=Math.trunc((rgt-lft)/fontSize);
        
        for (n=0;n!=nChar;n++) {
            str+=usedChars.charAt(genRandom.randomIndex(usedChars.length));
        }
        
            // draw the text
            
        y=Math.trunc((top+bot)*0.5);
            
        bitmapCTX.font=fontSize+'px Courier';
        bitmapCTX.textAlign='left';
        bitmapCTX.textBaseline='middle';
        bitmapCTX.fillStyle='#00FF00';
        
        bitmapCTX.fillText(str,(lft+5),y);
        
        glowCTX.font=fontSize+'px Courier';
        glowCTX.textAlign='left';
        glowCTX.textBaseline='middle';
        glowCTX.fillStyle='#007F00';
        
        glowCTX.fillText(str,(lft+5),y);
    }
    
    generatePanelButtons(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot)
    {
        let x,y,xCount,yCount,xOff,yOff,dx,dy,wid;
        let skip,xSkip,ySkip,lastSkip,hadMonitor;
        let color;
                
            // col/row counts
        
        wid=genRandom.randomInt(30,25);
        
        xCount=Math.trunc((rgt-lft)/wid)-1;
        yCount=Math.trunc((bot-top)/wid)-1;
        
        if ((xCount<=0) || (yCount<=0)) return;
        if (xCount>10) xCount=10;
        if (yCount>10) yCount=10;
        
            // get knock outs, never knock out
            // edges and never skip two rows
            
        xSkip=[];
        ySkip=[];
        
        lastSkip=true;
        
        for (x=0;x<(xCount-1);x++) {
            skip=genRandom.randomPercentage(0.2);
            xSkip.push(skip&&(!lastSkip));
            lastSkip=skip;
        }
        xSkip.push(false);
        
        lastSkip=true;
        
        for (y=0;y<(yCount-1);y++) {
            skip=genRandom.randomPercentage(0.2);
            ySkip.push(skip&&(!lastSkip));
            lastSkip=skip;
        }
        ySkip.push(false);
        
            // some vertical lines can become
            // a monitor
            
        hadMonitor=false;
        
            // draw the buttons
        
        xOff=(lft+5)+Math.trunc((((rgt-lft)-10)-(xCount*wid))/2);
        yOff=(top+5)+Math.trunc((((bot-top)-10)-(yCount*wid))/2);
        
        for (y=0;y!==yCount;y++) {
            dy=yOff+(y*wid);
            
            if ((genRandom.randomPercentage(0.25)) && (!hadMonitor)) {
                hadMonitor=true;
                this.generatePanelMonitor(bitmapCTX,normalCTX,glowCTX,xOff,dy,(xOff+(xCount*wid)),(dy+wid));
                continue;
            }
            
            for (x=0;x!==xCount;x++) {
                if ((xSkip[x]) || (ySkip[y])) continue;
                
                dx=xOff+(x*wid);
                
                    // the button
                    
                color=this.getRandomColor();
                this.draw3DRect(bitmapCTX,normalCTX,dx,dy,(dx+wid),(dy+wid),2,color,false);
                
                    // the possible glow
                    
                if (genRandom.randomPercentage(0.5)) this.drawRect(glowCTX,(dx+1),(dy+1),(dx+(wid-1)),(dy+(wid-1)),this.darkenColor(color,0.5));
            }
        }
    }
    
    generatePanel(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high)
    {
        let offset=Math.trunc(wid*0.1);
        let panelColor=this.getRandomColor();
        
            // this is a collection of plates that are
            // used to wrap the object around cubes
            
        this.draw3DRect(bitmapCTX,normalCTX,offset,0,wid,offset,8,panelColor,true);
        this.draw3DRect(bitmapCTX,normalCTX,0,offset,offset,high,8,panelColor,true);
        
        this.draw3DRect(bitmapCTX,normalCTX,offset,offset,wid,high,8,panelColor,true);
       
            // the buttons

        this.generatePanelButtons(bitmapCTX,normalCTX,glowCTX,(offset+5),(offset+5),(wid-5),(high-5));
        
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
        this.clearGlowRect(glowCTX,0,0,this.BITMAP_MODEL_TEXTURE_SIZE,this.BITMAP_MODEL_TEXTURE_SIZE);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (genRandom.randomIndex(1)) {

            case 0:
                this.generatePanel(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high);
                shineFactor=1.0;
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
