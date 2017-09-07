import genRandom from '../../generate/utility/random.js';
import GenBitmapSkinBaseClass from '../../generate/bitmap/gen_bitmap_skin_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate skin bitmap class
//

export default class GenBitmapSkinLeatherClass extends GenBitmapSkinBaseClass
{
    constructor(view)
    {    
        super(view);
        Object.seal(this);
    }
    
        //
        // leather
        //
        
    generateLeatherChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,clothColor)
    {
        let n,x,x2,y,y2,lineCount;
        let darken,lineColor;
        let wid=rgt-lft;
        let high=bot-top;
         
        this.addNoiseRect(bitmapCTX,lft,top,rgt,bot,0.8,0.9,0.5);        
 
            // lines
            
        lineCount=genRandom.randomInt(30,30);
            
        for (n=0;n!==lineCount;n++) {
            x=genRandom.randomInt(lft,wid);
            y=genRandom.randomInt(top,high);
            y2=genRandom.randomInt(top,high);
            
            darken=0.6+(genRandom.random()*0.25);
            lineColor=this.darkenColor(clothColor,darken);
            
            this.drawRandomLine(bitmapCTX,normalCTX,x,y,x,y2,lft,top,rgt,bot,30,lineColor,false);
        }
        
        lineCount=genRandom.randomInt(30,30);
            
        for (n=0;n!==lineCount;n++) {
            x=genRandom.randomInt(lft,wid);
            x2=genRandom.randomInt(lft,wid);
            y=genRandom.randomInt(top,high);
            
            darken=0.6+(genRandom.random()*0.25);
            lineColor=this.darkenColor(clothColor,darken);
            
            this.drawRandomLine(bitmapCTX,normalCTX,x,y,x2,y,lft,top,rgt,bot,30,lineColor,false);
        }
        
            // blur it
            
        this.blur(bitmapCTX,lft,top,rgt,bot,25,false);
    }
        
    generateLeather(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high)
    {
        let mx=Math.trunc(wid*0.5);
        let my=Math.trunc(high*0.5);
        let clothColor=this.getRandomColor();
         
            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,clothColor);
        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // leather
            
        this.generateLeatherChunk(bitmapCTX,normalCTX,0,0,mx,my,clothColor);
        
        this.generateLeatherChunk(bitmapCTX,normalCTX,mx,0,wid,my,clothColor);
        this.generateFaceChunk(bitmapCTX,normalCTX,glowCTX,mx,0,wid,my);
        
        clothColor=this.darkenColor(clothColor,0.8);
        this.generateLeatherChunk(bitmapCTX,normalCTX,0,my,mx,high,clothColor);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.3);
    }
    
        //
        // generate mainline
        //

    generate(inDebug)
    {
        let wid,high;
        let bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX,glowCanvas,glowCTX;

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
        
        glowCanvas=document.createElement('canvas');
        glowCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        glowCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,this.BITMAP_MODEL_TEXTURE_SIZE,this.BITMAP_MODEL_TEXTURE_SIZE);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;
        
        this.generateLeather(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],1.0));    
    }

}
