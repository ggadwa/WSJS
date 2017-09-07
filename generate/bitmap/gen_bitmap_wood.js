import genRandom from '../../generate/utility/random.js';
import ColorClass from '../../code/utility/color.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate box bitmap class
//

export default class GenBitmapBoxClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view);
        Object.seal(this);
    }
    
        //
        // wood bitmaps
        //

    generateWoodDrawBoard(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,woodColor)
    {
        let col;
        
        col=this.darkenColor(woodColor,genRandom.random(0.9,0.1));
        
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,col,true);
        if ((bot-top)>(rgt-lft)) {
            this.drawColorStripeVertical(bitmapCTX,normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        }
        else {
            this.drawColorStripeHorizontal(bitmapCTX,normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        }
        this.addNoiseRect(bitmapCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.9,0.95,0.8);
    }
    
    generateWood(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,y,lft,rgt,top,bot;
        let topBotBorder,lftRgtBorder;
        let boardSplit,boardHigh;
        
            // some random values

        let boardCount=genRandom.randomInt(4,8);
        let boardSize=Math.trunc(wid/boardCount);
        let edgeSize=genRandom.randomInt(3,3);
        let woodColor=new ColorClass(genRandom.randomFloat(0.6,0.2),genRandom.randomFloat(0.3,0.2),0.0);

            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // regular wood planking

        lft=0;

        for (n=0;n!==boardCount;n++) {
            rgt=lft+boardSize;
            if (n===(boardCount-1)) rgt=wid;
            
            boardSplit=genRandom.randomInt(1,3);
            boardHigh=Math.trunc(high/boardSplit);
            
            this.generateWoodDrawBoard(bitmapCTX,normalCTX,lft,0,rgt,high,edgeSize,woodColor);
            
            lft=rgt;
        }
        
            // border
        
        top=0;
        bot=high;
        
        lftRgtBorder=genRandom.randomPercentage(0.5);
        topBotBorder=genRandom.randomPercentage(0.5);
        
        if ((lftRgtBorder) || (topBotBorder)) {
            if (genRandom.randomPercentage(0.5)) {
                y=Math.trunc((high*0.5)-(boardSize*0.5));
                this.generateWoodDrawBoard(bitmapCTX,normalCTX,0,y,wid,(y+boardSize),edgeSize,woodColor);
            }
        }
        
        if (lftRgtBorder) {
            top+=boardSize;
            bot-=boardSize;
            
            this.generateWoodDrawBoard(bitmapCTX,normalCTX,0,0,wid,boardSize,edgeSize,woodColor);
            this.generateWoodDrawBoard(bitmapCTX,normalCTX,0,(high-boardSize),wid,high,edgeSize,woodColor);
        }
        
        if (topBotBorder) {
            this.generateWoodDrawBoard(bitmapCTX,normalCTX,0,top,boardSize,bot,edgeSize,woodColor);
            this.generateWoodDrawBoard(bitmapCTX,normalCTX,(wid-boardSize),top,wid,bot,edgeSize,woodColor);
        }

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.2);
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
        glowCanvas.width=2;
        glowCanvas.height=2;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,2,2);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

        this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],2.0));    
    }

}
