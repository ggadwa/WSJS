/* global genRandom */

"use strict";

//
// generate skin bitmap class
//

class GenBitmapSkinClass extends GenBitmapClass
{
    constructor()
    {    
        super();
        
        this.TYPE_SCALE=0;
        this.TYPE_LEATHER=1;
        this.TYPE_FUR=2;

        this.TYPE_NAMES=
                [
                    'Scale','Leather','Fur'
                ];
        
        Object.seal(this);
    }
    
        //
        // face chunks
        //
        
    generateFaceChunkEye(bitmapCTX,normalCTX,x,top,bot)
    {
        this.draw3DOval(bitmapCTX,normalCTX,x,(top+80),(x+30),(top+90),0.0,1.0,1,0,this.whiteColor,this.blackColor);
        this.drawOval(bitmapCTX,(x+10),(top+80),(x+20),(top+90),this.blackColor,this.blackColor);
    }
    
    generateFaceChunk(bitmapCTX,normalCTX,lft,top,rgt,bot)
    {
        this.generateFaceChunkEye(bitmapCTX,normalCTX,480,top,bot);
        this.generateFaceChunkEye(bitmapCTX,normalCTX,430,top,bot);
    }
    
        //
        // scales
        //
        
    generateScaleChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,skinColor,scaleCount)
    {
        let x,y,dx,dy;
        let xCount;

        let borderColor=this.darkenColor(skinColor,0.7);

        let wid=rgt-lft;
        let high=bot-top;
        let sWid=wid/scaleCount;
        let sHigh=high/scaleCount;
        
        this.startClip(bitmapCTX,lft,top,rgt,bot);
         
            // background

        this.drawRect(bitmapCTX,lft,top,rgt,bot,skinColor);
        this.addNoiseRect(bitmapCTX,lft,top,rgt,bot,0.5,0.7,0.6);
        this.blur(bitmapCTX,lft,top,rgt,bot,5);
        
            // scales

        dy=top-sHigh;
        
        for (y=0;y!==scaleCount;y++) {

            if ((y%2)===0) {
                dx=lft;
                xCount=scaleCount;
            }
            else {
                dx=lft-Math.trunc(sWid*0.5);
                xCount=scaleCount+1;
            }
            
            for (x=0;x!==xCount;x++) {
                this.draw3DOval(bitmapCTX,normalCTX,Math.trunc(dx),Math.trunc(dy),Math.trunc(dx+sWid),Math.trunc(dy+(sHigh*2)),0.25,0.75,3,0,null,borderColor);
                dx+=sWid;
            }
            
            dy+=sHigh;
        }
        
        this.endClip(bitmapCTX);
    }

    generateScale(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let skinColor,scaleCount;
        let mx=Math.trunc(wid*0.5);
        let my=Math.trunc(high*0.5);
        
            // scales and skin settings
            
        skinColor=this.getRandomColor();
        scaleCount=genRandom.randomInt(3,5);
         
            // clear canvases
        
        this.drawRect(bitmapCTX,0,0,wid,high,skinColor);
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // scales
        
        this.generateScaleChunk(bitmapCTX,normalCTX,0,0,mx,my,skinColor,scaleCount);
        
        this.generateScaleChunk(bitmapCTX,normalCTX,mx,0,wid,my,skinColor,scaleCount);
        this.generateFaceChunk(bitmapCTX,normalCTX,mx,0,wid,my);
        
        skinColor=this.darkenColor(skinColor,0.8);
        this.generateScaleChunk(bitmapCTX,normalCTX,0,my,mx,high,skinColor,scaleCount);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);
    }
    
        //
        // leather
        //
        
    generateLeather(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,x,y,y2,lineCount;
        let darken,lineColor,markCount;
        let particleWid,particleHigh,particleDensity;
        
        let clothColor=this.getRandomColor();
         
            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,clothColor);
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.8,0.9,0.5);        
 
            // lines
            
        lineCount=genRandom.randomInt(30,30);
            
        for (n=0;n!==lineCount;n++) {
            x=genRandom.randomInt(0,wid);
            y=genRandom.randomInt(0,high);
            y2=genRandom.randomInt(0,high);
            
            darken=0.6+(genRandom.random()*0.25);
            lineColor=this.darkenColor(clothColor,darken);
            
            this.drawRandomLine(bitmapCTX,normalCTX,x,y,x,y2,30,lineColor,false);
        }

            // marks
            
        markCount=genRandom.randomInt(20,20);

        for (n=0;n!==markCount;n++) {
            particleWid=genRandom.randomInt(30,60);
            particleHigh=genRandom.randomInt(30,60);
            particleDensity=genRandom.randomInt(50,150);

            x=genRandom.randomInt(0,wid);
            y=genRandom.randomInt(0,high);

            this.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.9,particleDensity,false);
        }
        
            // blur it
            
        this.blur(bitmapCTX,0,0,wid,high,25);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.3);
    }
    
        //
        // fur
        //
        
    generateFur(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,x,y;
        let darken,boost,lineColor;
        let halfHigh=Math.trunc(high*0.5);

        let furColor=this.getRandomColor();
         
            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,furColor);       
        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // hair
            
        for (x=0;x!==wid;x++) {
            
                // hair color
                
            if ((n%2)===0) {
                darken=0.5+(genRandom.random()*0.3);
                lineColor=this.darkenColor(furColor,darken);
            }
            else {
                boost=0.1+(genRandom.random()*0.3);
                lineColor=this.boostColor(furColor,boost);
            }
            
                // hair half from top
                
            y=halfHigh+genRandom.randomInt(0,halfHigh);
            this.drawRandomLine(bitmapCTX,normalCTX,x,-5,x,(y+5),10,lineColor,false);
            
                // hair half from bottom
                
            y=high-(halfHigh+genRandom.randomInt(0,halfHigh));
            this.drawRandomLine(bitmapCTX,normalCTX,x,(y-5),x,(high+5),10,lineColor,false);
        }

            // finish with the specular
            // fur isn't shiney so this specular is very low

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.3);
    }
    
        //
        // UV tester
        //
        
    generateUVTest(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        this.drawUVTest(bitmapCTX,0,0,wid,high);
        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.3);
    }

        //
        // generate mainline
        //

    generate(generateType,inDebug)
    {
        let wid,high;
        let shineFactor=1.0;
        let bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX;

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

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;
        
            // skin bitmaps have four chunks:
            // top-left: regular
            // top-right: face
            // bottom-left: darker

            // create the bitmap
            
        generateType=this.TYPE_SCALE;   // supergumba -- testing
            
        switch (generateType) {

            case this.TYPE_SCALE:
                this.generateScale(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=2.0;
                break;
                
            case this.TYPE_LEATHER:
                this.generateLeather(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=1.0;
                break;
                
            case this.TYPE_FUR:
                this.generateFur(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=0.5;
                break;
                
        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas});
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(bitmapCanvas,normalCanvas,specularCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }
    
    generateRandom(inDebug)
    {
        return(this.generate(genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}
