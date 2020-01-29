/**
 * @module InputTouchClickClass
 * @ignore
*/

/**
 * A object representing a single touch click event
 * (a touch and then lift) for touch based inputs.
 * 
 * @property {number} QUADRANT_ANY A way to refer to any quadrant
 * @property {number} QUADRANT_TOPLEFT The top left quadrant
 * @property {number} QUADRANT_TOPRIGHT The top right quadrant
 * @property {number} QUADRANT_BOTTOMLEFT The bottom left quadrant
 * @property {number} QUADRANT_BOTTOMRIGHT The bottom right quadrant
 * 
 * @property {number} x The x position of this click
 * @property {number} y The y position of this click
 * @property {number} quadrant Quadrant the click happened in
 * 
 * @hideconstructor
 */
export default class InputTouchClickClass
{
    static QUADRANT_ANY=-1;
    static QUADRANT_TOPLEFT=0;
    static QUADRANT_TOPRIGHT=1;
    static QUADRANT_BOTTOMLEFT=2;
    static QUADRANT_BOTTOMRIGHT=3;
    
    id=null;
    x=0;
    y=0;
    quadrant=InputTouchClickClass.QUADRANT_TOPLEFT;
    
    constructor(id,x,y,quadrant)
    {
        this.id=id;
        this.x=x;
        this.y=y;
        this.quadrant=quadrant;
    }
}
