import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate tile bitmap class
//

export default class GenerateBitmapTileClass extends GenerateBitmapBaseClass
{
    constructor(view)
    {
        super(view,true,true,false);
        Object.seal(this);
    }
        
        //
        // tile bitmaps
        //
        
    generateTilePiece(lft,top,rgt,bot,tileColor,splitCount,edgeSize,complex)
    {
        let x,y,dLft,dTop,dRgt,dBot,tileWid,tileHigh,tileStyle;
        let col,frameCol,padding;

            // tile style

        tileStyle=GenerateUtilityClass.randomIndex(3);

            // splits

        tileWid=Math.trunc((rgt-lft)/splitCount);
        tileHigh=Math.trunc((bot-top)/splitCount);

        for (y=0;y!==splitCount;y++) {

            dTop=top+(tileHigh*y);
            dBot=dTop+tileHigh;
            if (y===(splitCount-1)) dBot=bot;

            dLft=lft;

            for (x=0;x!==splitCount;x++) {
                
                dLft=lft+(tileWid*x);
                dRgt=dLft+tileWid;
                if (x===(splitCount-1)) dRgt=rgt;

                    // sometimes a tile piece is a recursion to
                    // another tile set

                if ((complex) && (GenerateUtilityClass.randomPercentage(0.25))) {
                    tileStyle=GenerateUtilityClass.randomIndex(3);
                    this.generateTilePiece(dLft,dTop,dRgt,dBot,tileColor,2,edgeSize,false);
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
                
                frameCol=this.darkenColor(col,0.9);
                
                this.drawRect(dLft,dTop,dRgt,dBot,col);
                this.draw3DFrameRect(dLft,dTop,dRgt,dBot,edgeSize,frameCol,true);

                    // possible design
                    // 0 = nothing

                if (complex) {
                    col=this.darkenColor(col,0.8);
                    padding=edgeSize+GenerateUtilityClass.randomInt(edgeSize,(edgeSize*10));
                    
                    switch (GenerateUtilityClass.randomIndex(3)) {
                        case 1:
                            this.drawOval((dLft+padding),(dTop+padding),(dRgt-padding),(dBot-padding),0,1,0,0,edgeSize,frameCol,0.5,true,false,1,0);
                            break;
                        case 2:
                            this.drawDiamond((dLft+padding),(dTop+padding),(dRgt-padding),(dBot-padding),frameCol);
                            break;
                    }
                }

                //                this.blur(this.colorImgData.data,0,0,this.colorCanvas.width,this.colorCanvas.height,1,false);
                
                    // possible crack
                    
                //this.drawSmallCrack(dLft,dTop,dRgt,dBot,edgeSize,col);
            }
        }
    }

    generateInternal()
    {
        let splitCount,groutColor;
        let complex,small,edgeSize;
        let tileColor=[];
        
            // get splits
            
        complex=GenerateUtilityClass.randomPercentage(0.5);
        
        small=false;
        if (!complex) small=GenerateUtilityClass.randomPercentage(0.5);

        if (!small) {
            splitCount=GenerateUtilityClass.randomInt(2,2);
        }
        else {
            splitCount=GenerateUtilityClass.randomInt(6,4);
        }
        
        edgeSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorImgData.width*0.005),Math.trunc(this.colorImgData.width*0.005));
        
            // colors
            
        tileColor[0]=this.getRandomColor();
        tileColor[1]=this.darkenColor(tileColor[0],0.85);
        groutColor=this.dullColor(tileColor[0],0.7);

            // original splits

        this.generateTilePiece(0,0,this.colorImgData.width,this.colorImgData.height,tileColor,splitCount,edgeSize,complex);

            // finish with the specular

        this.createSpecularMap(0.5);
    }

}
