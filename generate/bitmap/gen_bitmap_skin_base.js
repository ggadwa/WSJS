import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';

//
// generate skin base bitmap class
//
// skin bitmaps have four chunks:
// top-left: regular
// top-right: face
// bottom-left: darker
//

export default class GenBitmapSkinBaseClass extends GenBitmapBaseClass
{
    constructor(view)
    {    
        super(view);
    }
    
        //
        // face chunks
        //
        
    generateFaceChunkEye(bitmapCTX,normalCTX,glowCTX,x,top,bot,eyeColor)
    {
        this.draw3DOval(bitmapCTX,normalCTX,x,(top+80),(x+30),(top+90),0.0,1.0,1,0,this.whiteColor,this.blackColor);
        this.drawOval(bitmapCTX,(x+10),(top+81),(x+20),(top+89),eyeColor,null);
        this.drawOval(glowCTX,(x+10),(top+81),(x+20),(top+89),this.darkenColor(eyeColor,0.5),null);
    }
    
    generateFaceChunk(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot)
    {
        let eyeColor=this.getRandomColor();
        
        this.generateFaceChunkEye(bitmapCTX,normalCTX,glowCTX,480,top,bot,eyeColor);
        this.generateFaceChunkEye(bitmapCTX,normalCTX,glowCTX,430,top,bot,eyeColor);
    }
}
