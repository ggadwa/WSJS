import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate floor bitmap class
//

export default class GenBitmapTileClass extends GenBitmapBaseClass
{
    constructor(view)
    {
        super(view);
        Object.seal(this);
    }
        
        //
        // tile bitmaps
        //
        
    generateTileInner(bitmapCTX,normalCTX,lft,top,rgt,bot,tileColor,tileStyle,splitCount,edgeSize,paddingSize,complex)
    {
        let x,y,dLft,dTop,dRgt,dBot,tileWid,tileHigh;
        let col,padding;

            // tile style

        tileStyle=genRandom.randomIndex(3);

            // splits

        tileWid=Math.trunc((rgt-lft)/splitCount);
        tileHigh=Math.trunc((bot-top)/splitCount);

        for (y=0;y!==splitCount;y++) {

            dTop=top+(tileHigh*y);
            dBot=(dTop+tileHigh)-paddingSize;
            if (y===(splitCount-1)) dBot=bot;

            dLft=lft;

            for (x=0;x!==splitCount;x++) {
                
                dLft=lft+(tileWid*x);
                dRgt=dLft+tileWid;
                if (x===(splitCount-1)) dRgt=rgt;
                
                dRgt-=paddingSize;

                    // sometimes a tile piece is a recursion to
                    // another tile set

                if ((complex) && (genRandom.randomPercentage(0.25))) {
                    tileStyle=genRandom.randomIndex(3);
                    this.generateTileInner(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,tileColor,tileStyle,2,edgeSize,paddingSize,false);
                    continue;
                }

                    // make the tile

                col=tileColor[0];

                switch (tileStyle) {

                    case 0:         // border style
                        if ((x!==0) && (y!==0)) col=tileColor[1];
                        break;

                    case 1:         // checker board style
                        col=tileColor[(x+y)&0x1];
                        break;

                    case 2:         // stripe style
                        if ((x&0x1)!==0) col=tileColor[1];
                        break;

                }

                this.draw3DRect(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,edgeSize,col,true);

                    // possible design
                    // 0 = nothing

                if (complex) {
                    col=this.darkenColor(col,0.8);
                    padding=edgeSize+2;
                    
                    switch (genRandom.randomIndex(3)) {
                        case 1:
                            this.drawOval(bitmapCTX,(dLft+padding),(dTop+padding),(dRgt-padding),(dBot-padding),col,this.blackColor);
                            break;
                        case 2:
                            this.drawDiamond(bitmapCTX,(dLft+padding),(dTop+padding),(dRgt-padding),(dBot-padding),col,this.blackColor);
                            break;
                    }
                }
                
                    // possible crack
                    
                this.drawSmallCrack(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,edgeSize,col);
            }
        }
    }

    generateTile(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        let splitCount,tileStyle,groutColor;
        let tileColor=[];
        
        let complex=genRandom.randomPercentage(0.5);
        let small=false;
        if (!complex) small=genRandom.randomPercentage(0.5);

            // some random values

        if (!small) {
            splitCount=genRandom.randomInt(2,2);
        }
        else {
            splitCount=genRandom.randomInt(6,4);
        }
        
        tileStyle=genRandom.randomIndex(3);
        tileColor[0]=this.getRandomColor();
        tileColor[1]=this.darkenColor(tileColor[0],0.85);

            // clear canvas

        groutColor=this.dullColor(tileColor[0],0.7);
        this.drawRect(bitmapCTX,0,0,wid,high,groutColor);
        
        this.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);
        this.blur(bitmapCTX,0,0,wid,high,5,false);
        
        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // original splits

        this.generateTileInner(bitmapCTX,normalCTX,0,0,wid,high,tileColor,tileStyle,splitCount,(small?2:5),(small?3:0),complex);

            // tile noise

        this.addNoiseRect(bitmapCTX,0,0,wid,high,1.1,1.3,0.2);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
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

            // create the bitmap

        this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],10.0));    
    }

}
