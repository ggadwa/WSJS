import TouchTrackClass from '../main/touch_track.js';


//
// input class
//

export default class InputClass
{
    constructor(core)
    {
        let n;
        
        this.TOUCH_MAX_TRACK=5;
        
        this.TOUCH_QUADRANT_ANY=-1;
        this.TOUCH_QUADRANT_TOPLEFT=0;
        this.TOUCH_QUADRANT_TOPRIGHT=1;
        this.TOUCH_QUADRANT_BOTTOMLEFT=2;
        this.TOUCH_QUADRANT_BOTTOMRIGHT=3;
        
        this.INPUT_WHEEL_REFRESH_TICK=500;

        this.core=core;

            // input flags

        this.eventsAttached=false;
        
        this.keyFlags=new Map();
        
        this.mouseChangeX=0;
        this.mouseChangeY=0;
        
        this.mouseButtonFlags=new Uint8Array(8);
        this.mouseWheelClick=0;
        this.mouseWheelClickRefreshTick=core.timestamp;
        
        this.canvasLeft=0;
        this.canvasTop=0;
        this.canvasMidX=0;
        this.canvasMidY=0;
        
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
        
            // touches, we pre-allocate a good bit
            // of this to stop GC
            
        this.hasTouch=(navigator.maxTouchPoints>1);
            
        this.touchTrackList=[];
        
        for (n=0;n!==this.TOUCH_MAX_TRACK;n++) {
            this.touchTrackList.push(new TouchTrackClass(this.core));
        }
        
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
        this.keyFlags.clear();
    }

    keyDownEvent(event)
    {
        this.keyFlags.set(event.key,true);
    }
     
    keyUpEvent(event)
    {
        this.keyFlags.set(event.key,false);
    }
    
    isKeyDown(key)
    {
        let flag=this.keyFlags.get(key);
        return((flag===undefined)?false:flag);
    }
    
    isKeyDownAndClear(key)
    {
        let flag=this.keyFlags.get(key);
        if (flag===undefined) return(false);
        if (!flag) return(false);
        
        this.keyFlags.set(key,false);
        return(true);
    }
    
        //
        // pointer lock
        //
        
    pointerLockStart()
    {
        let rect;
        
        this.mouseButtonClear();
        this.touchClear();
        
            // if not touch, request pointer lock
            
        if (!this.hasTouch) {
            document.addEventListener('pointerlockchange',this.pointerLockChangeListener,false);
            document.addEventListener('pointerlockerror',this.pointerLockErrorListener,false);
            this.core.canvas.requestPointerLock();
        }
        else {
            document.addEventListener('touchstart',this.touchStartListener,false);
            document.addEventListener('touchend',this.touchEndListener,false);
            document.addEventListener('touchcancel',this.touchCancelListener,false);
            document.addEventListener('touchmove',this.touchMoveListener,false);
        }
        
            // remember canvas positioning
            
        rect=this.core.canvas.getBoundingClientRect();
        this.canvasLeft=rect.left;
        this.canvasTop=rect.top;
        
        this.canvasMidX=Math.trunc(this.core.canvas.width*0.5);
        this.canvasMidY=Math.trunc(this.core.canvas.height*0.5);
    }
    
    pointerLockEnd()
    {
            // if not touch, stop pointer lock
            
        if (!this.hasTouch) {
            document.exitPointerLock();
            document.removeEventListener('pointerlockchange',this.pointerLockChangeListener,false);
            document.removeEventListener('pointerlockerror',this.pointerLockErrorListener,false);
        }
        else {
            document.removeEventListener('touchstart',this.touchStartListener,false);
            document.removeEventListener('touchend',this.touchEndListener,false);
            document.removeEventListener('touchcancel',this.touchCancelListener,false);
            document.removeEventListener('touchmove',this.touchMoveListener,false);
            
            this.core.setPauseState(true,false);            // a pointer lock release auto pauses the game
        }
    }
    
    pointerLockChange(event)
    {
        if (document.pointerLockElement===this.core.canvas) {
            document.addEventListener('mousedown',this.mouseDownListener,false);
            document.addEventListener('mouseup',this.mouseUpListener,false);
            document.addEventListener('wheel',this.mouseWheelListener,false);
            document.addEventListener('mousemove',this.mouseMovedListener,false);
        }
        else {
            document.removeEventListener('mousedown',this.mouseDownListener,false);
            document.removeEventListener('mouseup',this.mouseUpListener,false);
            document.removeEventListener('wheel',this.mouseWheelListener,false);
            document.removeEventListener('mousemove',this.mouseMovedListener,false);
            
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
        this.mouseWheelClickRefreshTick=this.core.timestamp+this.INPUT_WHEEL_REFRESH_TICK;
        
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
    
    getTouchTrackCount()
    {
        return(this.TOUCH_MAX_TRACK);
    }
    
    getTouchClick(idx)
    {
        let track=this.touchTrackList[idx];
        let pass=track.touchPass;
        
        if ((track.free)||(!track.isClick)) return(null);
        
        pass.id=track.id;
        pass.x=track.x;
        pass.y=track.y;
        pass.quadrant=track.quadrant;
        
        track.free=true;            // got the click, free this track up
        
        return(pass);
    }
    
    getTouchSwipe(idx)
    {
        let track=this.touchTrackList[idx];
        let pass=track.touchPass;
        
        if ((track.free)||(track.isClick)) return(null);
        
        pass.id=track.id;
        pass.x=track.moveX;
        pass.y=track.moveY;
        pass.quadrant=track.quadrant;
        
        track.resetMove();
        
        if (track.id===null) track.free=true;            // if the ID is null, than we got a end on this touch and can free it now that we've got the last movement
        
        return(pass);
    }
    
    touchClear()
    {
        let track;

        for (track of this.touchTrackList) {
            track.free=true;
        }
    }
    
    touchStart(event)
    {
        let touch,track;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            for (track of this.touchTrackList) {
                if (!track.free) continue;
                
                track.start(touch.identifier,(touch.clientX-this.canvasLeft),(touch.clientY-this.canvasTop));
                break;
            }
        }
    }
    
    touchEnd(event)
    {
        let touch,track;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            for (track of this.touchTrackList) {
                if (track.free) continue;
                        
                if (track.id===touch.identifier) {
                    track.end();
                    break;
                }
            }
        }
    }
    
    touchCancel(event)
    {
        this.touchEnd(event);
    }
    
    touchMove(event)
    {
        let touch,track;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            for (track of this.touchTrackList) {
                if ((!track.free) && (track.id===touch.identifier)) {
                    track.move((touch.clientX-this.canvasLeft),(touch.clientY-this.canvasTop));
                    break;
                }
            }
        }
    }

}
