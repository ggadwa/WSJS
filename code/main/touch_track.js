//
// class for tracking touch events
//

export default class TouchTrackClass
{
    constructor(core)
    {
        this.TOUCH_CLICK_TICK=300;

        this.core=core;
        
        this.id=null;
        
        this.free=true;
        this.timestamp=0;
        
        this.x=0;
        this.y=0;
        this.moveX=0;
        this.moveY=0;
        
        this.isClick=false;
        
        this.quadrant=0;
        
        this.touchPass={"id":0,"x":0,"y":0,"quadrant":0};
    }
    
    start(id,x,y)
    {
        this.id=id;
        
        this.free=false;
        this.timestamp=this.core.timestamp;
        
        this.x=x;
        this.y=y;
        this.lastX=x;
        this.lastY=y;
        this.moveX=0;
        this.moveY=0;
        
        this.isClick=false;
        
        if (y<this.core.input.canvasMidY) {
            this.quadrant=(x<this.core.input.canvasMidX)?this.core.input.TOUCH_QUADRANT_TOPLEFT:this.core.input.TOUCH_QUADRANT_TOPRIGHT;
        }
        else {
            this.quadrant=(x<this.core.input.canvasMidX)?this.core.input.TOUCH_QUADRANT_BOTTOMLEFT:this.core.input.TOUCH_QUADRANT_BOTTOMRIGHT;
        }
    }
    
    end()
    {
            // when the touch ends, we don't free the track but set the
            // ID to null so it gets no more activity, and free when the
            // project picks it up
        
        this.id=null;
        this.isClick=((this.core.timestamp-this.timestamp)<=this.TOUCH_CLICK_TICK);
    }
    
    move(x,y)
    {
        this.x=x;
        this.y=y;
        
        this.moveX=(x-this.lastX);
        this.moveY=(y-this.lastY);
    }
    
    resetMove()
    {
        this.lastX=this.x;
        this.lastY=this.y;
    }
}
