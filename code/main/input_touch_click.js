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
