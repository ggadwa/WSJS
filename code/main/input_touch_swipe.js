export default class InputTouchSwipeClass
{
    static QUADRANT_ANY=-1;
    static QUADRANT_TOPLEFT=0;
    static QUADRANT_TOPRIGHT=1;
    static QUADRANT_BOTTOMLEFT=2;
    static QUADRANT_BOTTOMRIGHT=3;
    
    static DIRECTION_ANY=-1;
    static DIRECTION_X=0;
    static DIRECTION_Y=1;
    
    id=null;
    startX=0;
    startY=0;
    endX=0;
    endY=0;
    quadrant=InputTouchSwipeClass.QUADRANT_TOPLEFT;
    
    constructor(id,startX,startY,endX,endY,quadrant)
    {
        this.id=id;
        this.startX=startX;
        this.startY=startY;
        this.endX=endX;
        this.endY=endY;
        this.quadrant=quadrant;
    }
    
    getDirection()
    {
        return((Math.abs(this.startX-this.endX)>Math.abs(this.startY-this.endY))?InputTouchSwipeClass.DIRECTION_X:InputTouchSwipeClass.DIRECTION_Y);
    }
}
