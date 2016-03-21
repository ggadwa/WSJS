"use strict";

//
// generate model bitmap class
//

class GenBitmapModelClass
{
    constructor(genRandom)
    {    
        this.genRandom=genRandom;
        this.genBitmapUtility=new GenBitmapUtilityClass(genRandom);
        
        Object.seal(this);
    }
    
        //
        // scales
        //

    generateSkinScale(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var x,y,dx,dy;
        var xCount;

        var scaleCount=this.genRandom.randomInt(5,10);
        var skinColor=this.genBitmapUtility.getRandomPrimaryColor(0.4,0.7);
        var borderColor=this.genBitmapUtility.darkenColor(skinColor,0.8);

        var sWid=wid/scaleCount;
        var sHigh=high/scaleCount;
         
            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,skinColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,high,0.5,0.7,0.6);
        this.genBitmapUtility.blur(bitmapCTX,0,0,wid,high,5);
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
        
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
                this.genBitmapUtility.draw3DOval(bitmapCTX,normalCTX,Math.trunc(dx),Math.trunc(dy),Math.trunc(dx+sWid),Math.trunc(dy+(sHigh*2)),0.25,0.75,3,0,null,borderColor);
                dx+=sWid;
            }
            
            dy+=sHigh;
        }

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,2.0,-0.2);
    }
    
        //
        // leather skin
        //
        
    generateSkinLeather(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,x,y,y2,lineCount;
        var darken,lineColor,markCount;
        var particleWid,particleHigh,particleDensity;
        
        var clothColor=this.genBitmapUtility.getRandomPrimaryColor(0.3,0.3);
         
            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,clothColor);
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
        
        this.genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,high,0.8,0.9,0.5);        
 
            // lines
            
        lineCount=this.genRandom.randomInt(30,30);
            
        for (n=0;n!==lineCount;n++) {
            x=this.genRandom.randomInt(0,wid);
            y=this.genRandom.randomInt(0,high);
            y2=this.genRandom.randomInt(0,high);
            
            darken=0.6+(this.genRandom.random()*0.25);
            lineColor=this.genBitmapUtility.darkenColor(clothColor,darken);
            
            this.genBitmapUtility.drawRandomLine(bitmapCTX,normalCTX,x,y,x,y2,30,lineColor);
        }

            // marks
            
        markCount=this.genRandom.randomInt(20,20);

        for (n=0;n!==markCount;n++) {
            particleWid=this.genRandom.randomInt(30,60);
            particleHigh=this.genRandom.randomInt(30,60);
            particleDensity=this.genRandom.randomInt(50,150);

            x=this.genRandom.randomInt(0,wid);
            y=this.genRandom.randomInt(0,high);

            this.genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.9,particleDensity,false);
        }
        
            // blur it
            
        this.genBitmapUtility.blur(bitmapCTX,0,0,wid,high,25);

            // finish with the specular

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5,-0.4);
    }
    
        //
        // fur
        //
        
    generateSkinFur(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var n,x,y;
        var darken,boost,lineColor;
        var halfHigh=Math.trunc(high*0.5);

        var furColor=this.genBitmapUtility.getRandomColor([0.5,0.2,0.0],[0.7,0.4,0.0]);
         
            // clear canvases

        this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,furColor);       
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

            // hair
            
        for (x=0;x!==wid;x++) {
            
                // hair color
                
            if ((n%2)===0) {
                darken=0.5+(this.genRandom.random()*0.3);
                lineColor=this.genBitmapUtility.darkenColor(furColor,darken);
            }
            else {
                boost=0.1+(this.genRandom.random()*0.3);
                lineColor=this.genBitmapUtility.boostColor(furColor,boost);
            }
            
                // hair half from top
                
            y=halfHigh+this.genRandom.randomInt(0,halfHigh);
            this.genBitmapUtility.drawRandomLine(bitmapCTX,normalCTX,x,-5,x,(y+5),10,lineColor);
            
                // hair half from bottom
                
            y=high-(halfHigh+this.genRandom.randomInt(0,halfHigh));
            this.genBitmapUtility.drawRandomLine(bitmapCTX,normalCTX,x,(y-5),x,(high+5),10,lineColor);
        }

            // finish with the specular
            // fur isn't shiney so this specular is very low

        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5,-0.6);
    }
    
        //
        // UV tester
        //
        
    generateUVTest(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
        this.genBitmapUtility.drawUVTest(bitmapCTX,0,0,wid,high);
        this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,2.0,0.0);
    }

        //
        // generate mainline
        //

    generate(view,name,generateType)
    {
        var wid,high,edgeSize,paddingSize,segments;
        var shineFactor=1.0;
        var bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
        bitmapCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        normalCanvas=document.createElement('canvas');
        normalCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
        normalCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
        normalCTX=normalCanvas.getContext('2d');

        specularCanvas=document.createElement('canvas');
        specularCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
        specularCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
        specularCTX=specularCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case GEN_BITMAP_MODEL_TYPE_SKIN_SCALE:
                this.generateSkinScale(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=8.0;
                break;
                
            case GEN_BITMAP_MODEL_TYPE_SKIN_LEATHER:
                this.generateSkinLeather(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=2.0;
                break;
                
            case GEN_BITMAP_MODEL_TYPE_SKIN_FUR:
                this.generateSkinFur(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=1.0;
                break;
                
        }

            // if view is null, then we are in the special
            // debug main, which just displays the canvases, so send
            // them back
        
        if (view===null) {
            return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas});
        }
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(view,name,bitmapCanvas,normalCanvas,specularCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }

}
