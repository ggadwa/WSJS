import genRandom from '../../generate/utility/random.js';
import GenBitmapSkinBaseClass from '../../generate/bitmap/gen_bitmap_skin_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate skin bitmap class
//

export default class GenBitmapSkinFurClass extends GenBitmapSkinBaseClass
{
    constructor(view)
    {    
        super(view);
        Object.seal(this);
    }
        
        //
        // fur
        //
        
    generateFurChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,furColor)
    {
        let n,x,y;
        let darken,boost,lineColor;
        let wid=rgt-lft;
        let high=bot-top;
        let halfHigh=Math.trunc(high*0.5);
         
            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,furColor);       
        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // hair
            
        for (x=lft;x!==rgt;x++) {
            
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
                
            y=halfHigh+genRandom.randomInt(top,halfHigh);
            this.drawRandomLine(bitmapCTX,normalCTX,x,(top-5),x,(y+5),lft,top,rgt,bot,10,lineColor,false);
            
                // hair half from bottom
                
            y=high-(halfHigh+genRandom.randomInt(top,halfHigh));
            this.drawRandomLine(bitmapCTX,normalCTX,x,(y-5),x,(bot+5),lft,top,rgt,bot,10,lineColor,false);
        }
    }
        
    generateFur(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high)
    {
        let mx=Math.trunc(wid*0.5);
        let my=Math.trunc(high*0.5);
        let furColor=this.getRandomColor();
         
            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,furColor);       
        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // fur
            
        this.generateFurChunk(bitmapCTX,normalCTX,0,0,mx,my,furColor);
        
        this.generateFurChunk(bitmapCTX,normalCTX,mx,0,wid,my,furColor);
        this.generateFaceChunk(bitmapCTX,normalCTX,glowCTX,mx,0,wid,my);
        
        furColor=this.darkenColor(furColor,0.8);
        this.generateFurChunk(bitmapCTX,normalCTX,0,my,mx,high,furColor);

            // finish with the specular
            // fur isn't shiney so this specular is very low

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
        
        this.generateFur(bitmapCTX,normalCTX,specularCTX,glowCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],0.5));    
    }

}
