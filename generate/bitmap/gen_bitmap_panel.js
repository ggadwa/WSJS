import genRandom from '../../generate/utility/random.js';
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
        // machine
        //
    
    generatePanelButtons(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot)
    {
        let x,y,xCount,yCount,xOff,yOff,dx,dy,wid;
        let color;
                
            // circle or square lights
        
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
            
            if (genRandom.randomPercentage(0.25)) continue;
            
            for (x=0;x!==xCount;x++) {
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
        let metalColor=this.getDefaultPrimaryColor();
       
            // face plate
            
        this.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,8,metalColor,true);
        this.generatePanelButtons(bitmapCTX,normalCTX,glowCTX,5,5,(wid-5),(high-5));
        
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
        this.clearGlowRect(glowCTX,0,0,2,2);

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
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }

}
