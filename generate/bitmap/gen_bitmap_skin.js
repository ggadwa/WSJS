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
        // scales
        //

    generateScale(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var x,y,dx,dy;
        var xCount;

        var scaleCount=genRandom.randomInt(5,10);
        var skinColor=this.getRandomColor();
        var borderColor=this.darkenColor(skinColor,0.8);

        var sWid=wid/scaleCount;
        var sHigh=high/scaleCount;
         
            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,skinColor);
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.5,0.7,0.6);
        this.blur(bitmapCTX,0,0,wid,high,5);
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // scales

        dy=-sHigh;
        
        for (y=0;y!==scaleCount;y++) {

            if ((y%2)===0) {
                dx=0;
                xCount=scaleCount;
            }
            else {
                dx=-Math.trunc(sWid*0.5);
                xCount=scaleCount+1;
            }
            
            for (x=0;x!==xCount;x++) {
                this.draw3DOval(bitmapCTX,normalCTX,Math.trunc(dx),Math.trunc(dy),Math.trunc(dx+sWid),Math.trunc(dy+(sHigh*2)),0.25,0.75,3,0,null,borderColor);
                dx+=sWid;
            }
            
            dy+=sHigh;
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);
    }
    
        //
        // leather
        //
        
    generateLeather(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,x,y,y2,lineCount;
        var darken,lineColor,markCount;
        var particleWid,particleHigh,particleDensity;
        
        var clothColor=this.getRandomColor();
         
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
        var n,x,y;
        var darken,boost,lineColor;
        var halfHigh=Math.trunc(high*0.5);

        var furColor=this.getRandomColor();
         
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
        var wid,high;
        var shineFactor=1.0;
        var bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        bitmapCanvas.height=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        normalCanvas=document.createElement('canvas');
        normalCanvas.width=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        normalCanvas.height=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        normalCTX=normalCanvas.getContext('2d');

        specularCanvas=document.createElement('canvas');
        specularCanvas.width=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        specularCanvas.height=GEN_BITMAP_MODEL_TEXTURE_SIZE;
        specularCTX=specularCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case this.TYPE_SCALE:
                this.generateScale(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=8.0;
                break;
                
            case this.TYPE_LEATHER:
                this.generateLeather(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=2.0;
                break;
                
            case this.TYPE_FUR:
                this.generateFur(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=1.0;
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
