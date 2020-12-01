import PointClass from '../utility/point.js';
import InputTouchClass from '../main/input_touch.js';

//
// input class
//

export default class InputClass
{
    constructor(core)
    {
        this.INPUT_WHEEL_REFRESH_TICK=500;
        this.TOUCH_SWIPE_DEAD_ZONE=20;

        this.core=core;

            // input flags

        this.eventsAttached=false;
        
        this.keyFlags=new Map();
        this.keyLastRawDown=null;
        this.keyLastRaw=null;
        
        this.mouseChangeX=0;
        this.mouseChangeY=0;
        
        this.mouseButtonFlags=new Uint8Array(8);
        this.mouseWheelClick=0;
        this.mouseWheelClickRefreshTick=0;
        
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
        
            // touches
            
        this.hasTouch=(navigator.maxTouchPoints>1);
        
        this.touchStartList=[];
        this.touchEndList=[];
        this.touchMoveList=[];
        
        /* clean
        this.touchMenuTrigger=false;
        
        this.touchStickLeftClick=false;
        this.touchStickRightClick=false;
        
        this.touchLeftSwipeId=null;
        this.touchLeftSwipePosition=new PointClass(0,0,0);
        this.touchLeftSwipeMovement=new PointClass(0,0,0);
        
        this.touchRightSwipeId=null;
        this.touchRightSwipePosition=new PointClass(0,0,0);
        this.touchRightSwipeMovement=new PointClass(0,0,0);
            */
        Object.seal(this);
    }
    
        //
        // initialize/release input
        //

    initialize()
    {
    }

    release()
    {
        if (this.eventsAttached) {
            this.pointerLockEnd();
        }
    }
    
        //
        // endable/disable input
        //
        
    startInput()
    {
            // attach events

        this.pointerLockStart();    // activates mouse, keys, and touch
        this.eventsAttached=true;
    }
        
    stopInput()
    {
        if (this.eventsAttached) {
            this.pointerLockEnd();
            this.eventsAttached=false;
        }
    }
    
        //
        // key events
        //

    keyClear()
    {
        this.keyFlags.clear();
        
        this.keyLastRawDown=null;
        this.keyLastRaw=null;
    }

    keyDownEvent(event)
    {
        this.keyLastRawDown=event.key;
        this.keyLastRaw=null;
        
        this.keyFlags.set(event.key.toLowerCase(),true);
    }
     
    keyUpEvent(event)
    {
        this.keyLastRaw=this.keyLastRawDown;
        this.keyLastRawDown=null;
        
        this.keyFlags.set(event.key.toLowerCase(),false);
    }
    
    isKeyDown(key)
    {
        let flag=this.keyFlags.get(key.toLowerCase());
        return((flag===undefined)?false:flag);
    }
    
    isKeyDownAndClear(key)
    {
        let flag=this.keyFlags.get(key.toLowerCase());
        if (flag===undefined) return(false);
        if (!flag) return(false);
        
        this.keyFlags.set(key.toLowerCase(),false);
        return(true);
    }
    
    keyGetLastRaw()
    {
        let key=this.keyLastRaw;
        
        this.keyLastRaw=null;
        return(key);            // for input like dialog controls
    }
    
    keyClearLastRaw()
    {
        this.keyLastRaw=null;
    }
    
        //
        // pointer lock
        //
        
    pointerLockStart()
    {
        let rect;

        this.keyClear();
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
        }
    }
    
    pointerLockChange(event)
    {
        if (document.pointerLockElement===this.core.canvas) {
            document.addEventListener('mousedown',this.mouseDownListener,false);
            document.addEventListener('mouseup',this.mouseUpListener,false);
            document.addEventListener('wheel',this.mouseWheelListener,false);
            document.addEventListener('mousemove',this.mouseMovedListener,false);
            document.addEventListener('keydown',this.keyDownListener,true);
            document.addEventListener('keyup',this.keyUpListener.bind(this),true);
            
            this.core.resumeLoop();
        }
        else {
            document.removeEventListener('mousedown',this.mouseDownListener,false);
            document.removeEventListener('mouseup',this.mouseUpListener,false);
            document.removeEventListener('wheel',this.mouseWheelListener,false);
            document.removeEventListener('mousemove',this.mouseMovedListener,false);
            document.removeEventListener('keydown',this.keyDownListener,true);
            document.removeEventListener('keyup',this.keyUpListener,true);
            
            this.core.pauseLoop();
        }
    }
    
    pointerLockClickResume()
    {
        this.pointerLockStart();
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
        this.mouseWheelClickRefreshTick=Math.trunc(window.performance.now());
    }
    
    mouseWheelRead()
    {
        let     click;
        
        if (this.mouseWheelClick===0) return(0);

        click=this.mouseWheelClick;
        
        this.mouseWheelClick=0;
        this.mouseWheelClickRefreshTick=Math.trunc(window.performance.now())+this.INPUT_WHEEL_REFRESH_TICK;
        
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
            
        if (Math.trunc(window.performance.now())<this.mouseWheelClickRefreshTick) return;
        
        this.mouseWheelClick=Math.sign(deltaY);
    }
    
    mouseMove(event)
    {
        this.mouseChangeX+=event.movementX;
        this.mouseChangeY+=event.movementY;
    }
    
    getMouseMoveX()
    {
        let x;
        
        x=this.mouseChangeX;
        this.mouseChangeX=0;
        return(x);
    }
    
    getMouseMoveY()
    {
        let y;
        
        y=this.mouseChangeY;
        this.mouseChangeY=0;
        return(y);
    }
    
        //
        // touch events
        //
    
    isTouchStickLeftClick()
    {
        /* clean --> etc, all downwards
        let click=this.touchStickLeftClick;
        this.touchStickLeftClick=false;
        
        return(click);
            */
        return(false);
    }
    
    getTouchStickLeftX(deadZone,acceleration)
    {
        /*
        let x=this.core.interface.touchStickLeft.getX();
        
        if (Math.abs(x)<deadZone) return(0);
        return(x*acceleration);
            */
        return(0);
    }
    
    getTouchStickLeftY(deadZone,acceleration)
    {
        /*
        let y=this.core.interface.touchStickLeft.getY();
        
        if (Math.abs(y)<deadZone) return(0);
        return(y*acceleration);
            */
        return(0);
    }
    
    isTouchStickRightClick()
    {
        /*
        let click=this.touchStickRightClick;
        this.touchStickRightClick=false;
        
        return(click);
            */
        return(false);
    }
    
    getTouchStickRightX(deadZone,acceleration)
    {
        /*
        let x=this.core.interface.touchStickRight.getX();
        
        if (Math.abs(x)<deadZone) return(0);
        return(x*acceleration);
            */
        return(0);
    }
    
    getTouchStickRightY(deadZone,acceleration)
    {
        /*
        let y=this.core.interface.touchStickRight.getY();
        
        if (Math.abs(y)<deadZone) return(0);
        return(y*acceleration);
            */
        return(0);
    }
    
    getTouchSwipeLeftX()
    {
        /*
        let x;
        
        if (this.touchLeftSwipeMovement.x===0) return(0);
        
        x=this.touchLeftSwipeMovement.x;
        this.touchLeftSwipeMovement.x=0;
        return(x);
            */
        return(0);
    }
    
    getTouchSwipeLeftY()
    {
        /*
        let y;
        
        if (this.touchLeftSwipeMovement.y===0) return(0);
        
        y=this.touchLeftSwipeMovement.y;
        this.touchLeftSwipeMovement.y=0;
        return(y);
            */
        return(0);
    }
    
    getTouchSwipeRightX()
    {
        /*
        let x;
        
        if (this.touchRightSwipeMovement.x===0) return(0);
        
        x=this.touchRightSwipeMovement.x;
        this.touchRightSwipeMovement.x=0;
        return(x);
            */
        return(0);
    }
    
    getTouchSwipeRightY()
    {
        /*
        let y;
        
        if (this.touchRightSwipeMovement.y===0) return(0);
        
        y=this.touchRightSwipeMovement.y;
        this.touchRightSwipeMovement.y=0;
        return(y);
            */
        return(0);
    }
    
    touchClear()
    {
        this.touchStartList=[];
        this.touchEndList=[];
        this.touchMoveList=[];
    }
    
    getNextTouchStart()
    {
        if (this.touchStartList.length===0) return(null);
        return(this.touchStartList.pop());
    }
    
    getNextTouchEnd()
    {
        if (this.touchEndList.length===0) return(null);
        return(this.touchEndList.pop());
    }
    
    getNextTouchMove()
    {
        if (this.touchMoveList.length===0) return(null);
        return(this.touchMoveList.pop());
    }
    
    touchStart(event)
    {
        let touch;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            this.touchStartList.push(new InputTouchClass(touch.identifier,(touch.clientX-this.canvasLeft),(touch.clientY-this.canvasTop)));
        }
    }
    
    touchEnd(event)
    {
        let touch;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            this.touchEndList.push(new InputTouchClass(touch.identifier,(touch.clientX-this.canvasLeft),(touch.clientY-this.canvasTop)));
        }
    }
    
    touchCancel(event)
    {
        this.touchEnd(event);
    }
    
    touchMove(event)
    {
        let touch,x,y;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            this.touchMoveList.push(new InputTouchClass(touch.identifier,(touch.clientX-this.canvasLeft),(touch.clientY-this.canvasTop)));
        }
    }

}
