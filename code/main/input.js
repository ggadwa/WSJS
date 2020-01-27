import InputTouchClickClass from '../main/input_touch_click.js';
import InputTouchSwipeClass from '../main/input_touch_swipe.js';

//
// touch utility classes
//

class TouchTrackClass
{
    static QUADRANT_TOPLEFT=0;
    static QUADRANT_TOPRIGHT=1;
    static QUADRANT_BOTTOMLEFT=2;
    static QUADRANT_BOTTOMRIGHT=3;

    static CLICK_TICK=300;
    
    id=null;
    timestamp=0;
    
    x=0;
    y=0;
    lastX=0;
    lastY=0;
    
    quadrant=TouchTrackClass.QUADRANT_TOPLEFT;
    
    constructor(core,id,timestamp,x,y)
    {
        this.id=id;
        this.timestamp=timestamp;
        
        this.x=x;
        this.y=y;
                
        if (y<Math.trunc(core.canvas.height*0.5)) {
            this.quadrant=(x<Math.trunc(core.canvas.width*0.5))?TouchTrackClass.QUADRANT_TOPLEFT:TouchTrackClass.QUADRANT_TOPRIGHT;
        }
        else {
            this.quadrant=(x<Math.trunc(core.canvas.width*0.5))?TouchTrackClass.QUADRANT_BOTTOMLEFT:TouchTrackClass.QUADRANT_BOTTOMRIGHT;
        }
        
        this.lastX=x;
        this.lastY=y;
    }
}

//
// input class
//

export default class InputClass
{
    static INPUT_WHEEL_REFRESH_TICK=500;
    
    constructor(core)
    {
        this.core=core;

            // input flags

        this.eventsAttached=false;
        
        this.keyFlags=new Uint8Array(255);
        
        this.mouseChangeX=0;
        this.mouseChangeY=0;
        
        this.mouseButtonFlags=new Uint8Array(8);
        this.mouseWheelClick=0;
        this.mouseWheelClickRefreshTick=core.timestamp;
        
            // listeners
            // need to set them to a variables so remove
            // can find them later
            
        this.keyDownListener=this.keyDownEvent.bind(this);
        this.keyUpListener=this.keyUpEvent.bind(this);
        
        this.pointerLockChangeListener=this.pointerLockChange.bind(this);
        this.pointerLockErrorListener=this.pointerLockError.bind(this);
        
        this.mouseDownListener=this.mouseDown.bind(this);
        this.mouseUpListener=this.mouseUp.bind(this);
        this.mouseWheelListener=this.mouseWheel.bind(this);
        this.mouseMovedListener=this.mouseMove.bind(this);
        
        this.touchStartListener=this.touchStart.bind(this);
        this.touchEndListener=this.touchEnd.bind(this);
        this.touchCancelListener=this.touchCancel.bind(this);
        this.touchMoveListener=this.touchMove.bind(this);
        
            // touches
            
        this.hasTouch=(navigator.maxTouchPoints>1);
            
        this.touchTrackList=[];
        this.touchClickList=[];
        this.touchSwipeList=[];
        
        Object.seal(this);
    }
    
        //
        // initialize/release input
        //

    initialize()
    {
        this.keyClear();
        this.mouseButtonClear();
        this.touchClear();
    }

    release()
    {
        if (this.eventsAttached) {
            this.keyEnd();
            this.pointerLockEnd();
        }
    }
    
        //
        // endable/disable input
        //
        
    startInput()
    {
        this.core.canvas.onclick=null;

            // attach events

        this.keyStart();
        this.pointerLockStart();    // activates mouse and touch
        this.eventsAttached=true;
    }
        
    stopInput()
    {
        if (this.eventsAttached) {
            this.keyEnd();
            this.pointerLockEnd();
            this.eventsAttached=false;
        }
    }
    
        //
        // key events
        //

    keyStart()
    {
        this.keyClear();
            
        document.addEventListener('keydown',this.keyDownListener,true);
        document.addEventListener('keyup',this.keyUpListener.bind(this),true);
    }
    
    keyEnd()
    {
        document.removeEventListener('keydown',this.keyDownListener,true);
        document.removeEventListener('keyup',this.keyUpListener,true);
    }
   
    keyClear()
    {
        let n;
            
        for (n=0;n!==255;n++) {
            this.keyFlags[n]=0;
        }
    }

    keyDownEvent(event)
    {
        this.keyFlags[event.keyCode]=1;
    }
    
        
    keyUpEvent(event)
    {
        this.keyFlags[event.keyCode]=0;
    }
    
        //
        // pointer lock
        //
        
    pointerLockStart()
    {
        this.mouseButtonClear();
        this.touchClear();
        
            // request the pointer lock
            
        document.addEventListener('pointerlockchange',this.pointerLockChangeListener,false);
        document.addEventListener('pointerlockerror',this.pointerLockErrorListener,false);
        this.core.canvas.requestPointerLock();
    }
    
    pointerLockEnd()
    {
            // stop pointer lock
            
        document.exitPointerLock();
        document.removeEventListener('pointerlockchange',this.pointerLockChangeListener,false);
        document.removeEventListener('pointerlockerror',this.pointerLockErrorListener,false);
    }
    
    pointerLockChange(event)
    {
        if (document.pointerLockElement===this.core.canvas) {
            if (!this.hasTouch) {
                document.addEventListener('mousedown',this.mouseDownListener,false);
                document.addEventListener('mouseup',this.mouseUpListener,false);
                document.addEventListener('wheel',this.mouseWheelListener,false);
                document.addEventListener('mousemove',this.mouseMovedListener,false);
            }
            else {
                document.addEventListener('touchstart',this.touchStartListener,false);
                document.addEventListener('touchend',this.touchEndListener,false);
                document.addEventListener('touchcancel',this.touchCancelListener,false);
                document.addEventListener('touchmove',this.touchMoveListener,false);
            }
        }
        else {
            if (!this.hasTouch) {
                document.removeEventListener('mousedown',this.mouseDownListener,false);
                document.removeEventListener('mouseup',this.mouseUpListener,false);
                document.removeEventListener('wheel',this.mouseWheelListener,false);
                document.removeEventListener('mousemove',this.mouseMovedListener,false);
            }
            else {
                document.removeEventListener('touchstart',this.touchStartListener,false);
                document.removeEventListener('touchend',this.touchEndListener,false);
                document.removeEventListener('touchcancel',this.touchCancelListener,false);
                document.removeEventListener('touchmove',this.touchMoveListener,false);
            }
            
            this.core.setPauseState(true,false);            // a pointer lock release auto pauses the game
        }
    }
    
    pointerLockError(err)
    {
        console.log('PointerLock: '+err);
    }
    
        //
        // mouse events
        //
    
    mouseButtonClear()
    {
        let n;
        
        this.mouseChangeX=0;
        this.mouseChangeY=0;
            
        for (n=0;n!==8;n++) {
            this.mouseButtonFlags[n]=0;
        }
        
        this.mouseWheelClick=0;
        this.mouseWheelClickRefreshTick=this.core.timestamp;
    }
    
    mouseWheelRead()
    {
        let     click;
        
        if (this.mouseWheelClick===0) return(0);

        click=this.mouseWheelClick;
        
        this.mouseWheelClick=0;
        this.mouseWheelClickRefreshTick=this.core.timestamp+InputClass.INPUT_WHEEL_REFRESH_TICK;
        
        return(click);
    }
        
    mouseDown(event)
    {
        this.mouseButtonFlags[event.button]=1;
    }
    
    mouseUp(event)
    {
        this.mouseButtonFlags[event.button]=0;
    }
    
    mouseWheel(event)
    {
        let deltaY=event.deltaY;
        
            // don't register if we aren't at least
            // at 4 clicks because of the smooth scrolling
            // this is mostly a catch for OS X
            
        if (Math.abs(deltaY)<4) return;
        
            // otherwise register if over click refresh
            
        if (this.core.timestamp<this.mouseWheelClickRefreshTick) return;
        
        this.mouseWheelClick=Math.sign(deltaY);
    }
    
    mouseMove(event)
    {
        this.mouseChangeX+=event.movementX;
        this.mouseChangeY+=event.movementY;
    }
    
        //
        // touch events
        //
    
    getNextTouchClick(quardent)
    {
        let n,touchClick;
        
        if (this.touchClickList.length===0) return(null);
        if (quardent===InputTouchClickClass.QUADRANT_ANY) return(this.touchClickList.pop());
        
        for (n=0;n!==this.touchClickList.length;n++) {
            touchClick=this.touchClickList[n];
            if (touchClick.quadrant===quardent) {
                this.touchClickList.splice(n,1);
                return(touchClick);
            }
        }
        
        return(null);
    }
    
    getNextTouchSwipe(quardent,direction)
    {
        let n,touchSwipe;
        
        if (this.touchSwipeList.length===0) return(null);
        if (quardent===InputTouchSwipeClass.QUADRANT_ANY) return(this.touchSwipeList.pop());
        
        for (n=0;n!==this.touchSwipeList.length;n++) {
            touchSwipe=this.touchSwipeList[n];
            if (touchSwipe.quadrant!==quardent) continue;
            
            if ((direction===InputTouchSwipeClass.DIRECTION_ANY) || (direction===touchSwipe.getDirection())) {
                this.touchSwipeList.splice(n,1);
                return(touchSwipe);
            }
        }
        
        return(null);
    }
    
    touchClear()
    {
        this.touchTrackList=[];
        this.touchClickList=[];
        this.touchSwipeList=[];
    }
    
    touchStart(event)
    {
        let touch;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            this.touchTrackList.push(new TouchTrackClass(this.core,touch.identifier,this.core.timestamp,event.pageX,event.pageY));
        }
    }
    
    touchEnd(event)
    {
        let n,idx,touch,touchTrack;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            
                // find the tracking object
                
            idx=-1;
            
            for (n=0;n!=this.touchTrackList.length;n++) {
                if (this.touchTrackList[n].id===touch.identifier) {
                    idx=n;
                    break;
                }
            }
            
            if (idx===-1) continue;
            
                // figure if click and delete from tracking
                
            touchTrack=this.touchTrackList[idx];
            if ((this.core.timestamp-touchTrack.timestamp)<=TouchTrackClass.CLICK_TICK) this.touchClickList.push(new TouchClickClass(touchTrack.id,touchTrack.x,touchTrack.y,touchTrack.quadrant));
                
            this.touchTrackList.splice(idx,1);
        }
    }
    
    touchCancel(event)
    {
        this.touchEnd(event);
    }
    
    touchMove(event)
    {
        let touch,touchTrack;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            
            for (touchTrack of this.touchTrackList) {
                if (touchTrack.id===touch.identifier) {
                    this.touchSwipeList.push(new TouchSwipeClass(touchTrack.id,touchTrack.lastX,touchTrack.lastY,event.pageX,event.pageY,touchTrack.quadrant));
                    touchTrack.lastX=event.pageX;
                    touchTrack.lastY=event.pageY;
                    break;
                }
            }
        }
    }

}
