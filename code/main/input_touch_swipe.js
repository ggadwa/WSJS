/**
 * @module InputTouchSwipeClass
 * @ignore
*/

/**
 * A object representing a single swipe event
 * (a touch, move, and then lift) for touch based inputs.
 * 
 * @property {number} QUADRANT_ANY A way to refer to any quadrant
 * @property {number} QUADRANT_TOPLEFT The top left quadrant
 * @property {number} QUADRANT_TOPRIGHT The top right quadrant
 * @property {number} QUADRANT_BOTTOMLEFT The bottom left quadrant
 * @property {number} QUADRANT_BOTTOMRIGHT The bottom right quadrant
 * @property {number} DIRECTION_ANY A way to refer to any swipe direction
 * @property {number} DIRECTION_X A swipe mainy in the X direction
 * @property {number} DIRECTION_Y A swipe mainy in the Y direction
 * 
 * @property {number} startX X start of swipe
 * @property {number} startY Y start of swipe
 * @property {number} endX X end of swipe
 * @property {number} endY Y end of swipe
 * @property {number} quadrant Quadrant this swipe started in
 * 
 * @hideconstructor
 */
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
