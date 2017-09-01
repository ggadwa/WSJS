import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate door bitmap class
//

export default class GenBitmapDoorClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view);
        Object.seal(this);
    }
            
        //
        // metal bitmaps
        //
    
    generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,x,offset;
        let streakWid,streakColor,darken;

            // some random values

        let metalColor=this.getDefaultPrimaryColor();

        let edgeSize=genRandom.randomInt(4,8);
        let innerEdgeSize=genRandom.randomInt(4,10)+edgeSize;
        
        let screwSize=genRandom.randomInt(10,20);
        let screenFlatInnerSize=Math.trunc(screwSize*0.4);
        
        let streakCount=genRandom.randomInt(15,10);
        let screwColor=this.boostColor(metalColor,0.05);
        
            // clear canvases

        this.clearNormalsRect(normalCTX,0,0,wid,high);
        
            // the plate
            
        this.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,edgeSize,metalColor,true);
        
            // possible streaks
        
        if (genRandom.randomPercentage(0.5)) {
            for (n=0;n!==streakCount;n++) {
                streakWid=genRandom.randomInt(10,40);
                x=edgeSize+genRandom.randomInBetween(streakWid,((wid-streakWid)-(edgeSize*2)));

                darken=0.5+(genRandom.random()*0.5);
                streakColor=this.darkenColor(metalColor,darken);

                this.drawStreakMetal(bitmapCTX,wid,high,x,edgeSize,(high-edgeSize),streakWid,streakColor);
            }
        }
        
            // possible screws
            
        if (genRandom.randomPercentage(0.5)) {
            offset=edgeSize+4;
            
            this.draw3DOval(bitmapCTX,normalCTX,offset,offset,(offset+screwSize),(offset+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,offset,((high-offset)-screwSize),(offset+screwSize),(high-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,((wid-offset)-screwSize),offset,(wid-offset),(offset+screwSize),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,((wid-offset)-screwSize),((high-offset)-screwSize),(wid-offset),(high-offset),0.0,1.0,2,screenFlatInnerSize,screwColor,this.blackColor);
            
            innerEdgeSize+=screwSize;
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.6);
    }
    
        //
        // wood bitmaps
        //

    generateWoodDrawBoard(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,woodColor)
    {
        let woodFactor=0.8+(genRandom.random()*0.2);
        let col=this.darkenColor(woodColor,woodFactor);

        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,col,true);
        this.drawColorStripeVertical(bitmapCTX,normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        this.addNoiseRect(bitmapCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.9,0.95,0.8);
    }
    
    generateWood(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let n,lft,rgt;
        let boardSplit,boardHigh;
        
            // some random values

        let boardCount=genRandom.randomInt(4,8);
        let boardSize=Math.trunc(wid/boardCount);
        let edgeSize=genRandom.randomInt(3,3);
        let woodColor=this.getDefaultPrimaryColor();

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

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.2);
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
        glowCanvas.width=2;
        glowCanvas.height=2;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,2,2);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (genRandom.randomIndex(2)) {

            case 0:
                this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=15.0;
                break;
                
            case 1:
                this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=2.0;
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
