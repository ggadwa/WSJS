import genRandom from '../../generate/utility/random.js';
import GenBitmapSkinBaseClass from '../../generate/bitmap/gen_bitmap_skin_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate skin bitmap class
//

export default class GenBitmapSkinScaleClass extends GenBitmapSkinBaseClass
{
    constructor(view)
    {    
        super(view);
        Object.seal(this);
    }
    
        //
        // scales
        //
        
    generateScaleChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,skinColor,scaleCount)
    {
        let x,y,dx,dy,sx,sy,sx2,sy2;
        let xCount,col;

        let borderColor=this.darkenColor(skinColor,0.7);

        let wid=rgt-lft;
        let high=bot-top;
        let sWid=wid/scaleCount;
        let sHigh=high/scaleCount;
        
        this.startClip(bitmapCTX,lft,top,rgt,bot);
         
            // background

        this.drawRect(bitmapCTX,lft,top,rgt,bot,skinColor);
        this.addNoiseRect(bitmapCTX,lft,top,rgt,bot,0.5,0.7,0.6);
        this.blur(bitmapCTX,lft,top,rgt,bot,5,false);
        
            // scales (need extra row for overlap)

        dy=bot-sHigh;
        
        for (y=0;y!==(scaleCount+1);y++) {

            if ((y%2)===0) {
                dx=lft;
                xCount=scaleCount;
            }
            else {
                dx=lft-Math.trunc(sWid*0.5);
                xCount=scaleCount+1;
            }
            
            for (x=0;x!==xCount;x++) {
                
                    // can have darkened scale if not on
                    // wrapping rows
                    
                col=skinColor;
                
                if ((y!==0) && (y!==scaleCount) && (x!==0) && (x!==(xCount-1))) {
                    if (genRandom.randomPercentage(0.2)) {
                        col=this.darkenColor(skinColor,genRandom.randomFloat(0.6,0.3));
                    }
                }
                
                    // some slight offsets
                    
                sx=Math.trunc(dx)+(5-genRandom.randomInt(0,10));
                sy=Math.trunc(dy)+(5-genRandom.randomInt(0,10));
                sx2=Math.trunc(dx+sWid);
                sy2=Math.trunc(dy+(sHigh*2));
                
                    // the scale itself
                    // we draw the scale as a solid, flat oval and
                    // then redraw the border with normals
                    
                this.draw3DOval(bitmapCTX,normalCTX,sx,sy,sx2,sy2,0.25,0.75,3,0,null,borderColor);
                this.drawOval(bitmapCTX,sx,sy,sx2,sy2,0.0,1.0,3,0,col,null);
                
                dx+=sWid;
            }
            
            dy-=sHigh;
        }
        
        this.endClip(bitmapCTX);
    }

    generateScale(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high)
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
        this.generateFaceChunk(bitmapCTX,normalCTX,glowCTX,mx,0,wid,my);
        
        skinColor=this.darkenColor(skinColor,0.8);
        this.generateScaleChunk(bitmapCTX,normalCTX,0,my,mx,high,skinColor,scaleCount);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);
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
        
        this.generateScale(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],2.0));    
    }

}
