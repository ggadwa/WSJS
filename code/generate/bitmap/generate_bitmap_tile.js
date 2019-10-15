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
        
    generateTilePiece(lft,top,rgt,bot,tileColor,designColor,splitCount,complex)
    {
        let x,y,sx,sy,dLft,dTop,dRgt,dBot,tileWid,tileHigh,tileStyle;
        let col,frameCol,edgeSize,padding;

            // tile style

        tileStyle=GenerateUtilityClass.randomIndex(3);
        edgeSize=GenerateUtilityClass.randomInt(Math.trunc(this.colorImgData.width*0.005),Math.trunc(this.colorImgData.width*0.01));

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
                    this.generateTilePiece(dLft,dTop,dRgt,dBot,tileColor,designColor,2,false);
                    continue;
                }

                    // make the tile

                col=this.adjustColorRandom(tileColor[0],0.9,1.1);

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
                
                frameCol=this.adjustColorRandom(col,0.85,0.95);
                
                this.drawRect(dLft,dTop,dRgt,dBot,col);
                this.draw3DFrameRect(dLft,dTop,dRgt,dBot,edgeSize,frameCol,true);

                    // possible design
                    // 0 = nothing

                if (complex) {
                    col=this.adjustColorRandom(col,0.75,0.85);
                    padding=edgeSize+GenerateUtilityClass.randomInt(edgeSize,(edgeSize*10));
                    
                    switch (GenerateUtilityClass.randomIndex(3)) {
                        case 0:
                            this.drawOval((dLft+padding),(dTop+padding),(dRgt-padding),(dBot-padding),0,1,0,0,edgeSize,designColor,null,0.5,false,false,1,0);
                            break;
                        case 1:
                            this.drawDiamond((dLft+padding),(dTop+padding),(dRgt-padding),(dBot-padding),designColor);
                            break;
                    }
                }
                
                this.drawPerlinNoiseRect((dLft+edgeSize),(dTop+edgeSize),(dRgt-edgeSize),(dBot-edgeSize),0.8,1.1);

                    // possible dirt
                    
                if (GenerateUtilityClass.randomPercentage(0.2)) {
                    this.drawStaticNoiseRect((dLft+edgeSize),(dTop+edgeSize),(dRgt-edgeSize),(dBot-edgeSize),0.8,1.2);
                    this.blur(this.colorImgData.data,(dLft+edgeSize),(dTop+edgeSize),(dRgt-edgeSize),(dBot-edgeSize),5,false);
                }
                
                    // possible crack
                    
                if ((GenerateUtilityClass.randomPercentage(0.2)) && (!complex)) {
                    if (GenerateUtilityClass.randomPercentage(0.5)) {
                        sy=GenerateUtilityClass.randomInBetween((dTop+15),(dBot-15));
                        this.drawHorizontalCrack(sy,(dLft+edgeSize),(dRgt-edgeSize),(dTop+edgeSize),(dBot-edgeSize),GenerateUtilityClass.randomSign(),10,frameCol,true);
                    }
                    else {
                        sx=GenerateUtilityClass.randomInBetween((dLft+15),(dRgt-15));
                        this.drawVerticalCrack(sx,(dTop+edgeSize),(dBot-edgeSize),(dLft+edgeSize),(dRgt-edgeSize),GenerateUtilityClass.randomSign(),10,frameCol,true);
                    }
                }
            }
        }
    }

    generateInternal()
    {
        let splitCount,designColor,groutColor;
        let complex,small;
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
        
            // colors
            
        tileColor[0]=this.getRandomColor();
        tileColor[1]=this.getRandomColor();
        designColor=this.getRandomColor();
        groutColor=this.dullColor(tileColor[0],0.7);
        
        this.createPerlinNoiseData(16,16);

            // original splits

        this.generateTilePiece(0,0,this.colorImgData.width,this.colorImgData.height,tileColor,designColor,splitCount,complex);

            // finish with the specular

        this.createSpecularMap(0.4);
    }

}
