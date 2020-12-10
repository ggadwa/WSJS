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
            
        this.hasTouch=(navigator.maxTouchPoints>1)||(this.core.debugForceTouch);
        
        this.touchStartList=[];
        this.touchEndList=[];
        this.touchMoveList=[];
        
        Object.seal(this);
    }
    
        //
        // initialize/release input
        //

    initialize()
    {
        let rect;
        
        this.keyClear();
        this.mouseButtonClear();
        this.touchClear();
        
            // set the events
            
        if (!this.hasTouch) {
            document.addEventListener('mousedown',this.mouseDownListener,false);
            document.addEventListener('mouseup',this.mouseUpListener,false);
            document.addEventListener('wheel',this.mouseWheelListener,false);
            document.addEventListener('mousemove',this.mouseMovedListener,false);
            document.addEventListener('keydown',this.keyDownListener,true);
            document.addEventListener('keyup',this.keyUpListener.bind(this),true);
        }
        else {
            document.addEventListener('touchstart',this.touchStartListener,false);
            document.addEventListener('touchend',this.touchEndListener,false);
            document.addEventListener('touchcancel',this.touchCancelListener,false);
            document.addEventListener('touchmove',this.touchMoveListener,false);
        }
        
            // if not touch, request pointer lock
            
        if (!this.hasTouch) {
            document.addEventListener('pointerlockchange',this.pointerLockChangeListener,false);
            document.addEventListener('pointerlockerror',this.pointerLockErrorListener,false);
            this.core.canvas.requestPointerLock();
        }
        
            // remember canvas positioning
            // for touch clicks
            
        rect=this.core.canvas.getBoundingClientRect();
        this.canvasLeft=rect.left;
        this.canvasTop=rect.top;
        
        this.canvasMidX=Math.trunc(this.core.canvas.width*0.5);
        this.canvasMidY=Math.trunc(this.core.canvas.height*0.5);
    }

    release()
    {
        if (!this.hasTouch) {
            document.removeEventListener('pointerlockchange',this.pointerLockChangeListener,false);
            document.removeEventListener('pointerlockerror',this.pointerLockErrorListener,false);
            document.removeEventListener('mousedown',this.mouseDownListener,false);
            document.removeEventListener('mouseup',this.mouseUpListener,false);
            document.removeEventListener('wheel',this.mouseWheelListener,false);
            document.removeEventListener('mousemove',this.mouseMovedListener,false);
            document.removeEventListener('keydown',this.keyDownListener,true);
            document.removeEventListener('keyup',this.keyUpListener,true);
            document.exitPointerLock();
        }
        else {
            document.removeEventListener('touchstart',this.touchStartListener,false);
            document.removeEventListener('touchend',this.touchEndListener,false);
            document.removeEventListener('touchcancel',this.touchCancelListener,false);
            document.removeEventListener('touchmove',this.touchMoveListener,false);
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
        
    pointerLockChange(event)
    {
        if (document.pointerLockElement!==this.core.canvas) this.core.pauseLoop();
    }
    
    pointerLockError(err)
    {
            // it seems that if you go in and out of pointer lock too fast, it
            // fails on some browsers, this is annoying so just go back to pause
            
        this.core.pauseLoop();
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
        let touch;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            this.touchMoveList.push(new InputTouchClass(touch.identifier,(touch.clientX-this.canvasLeft),(touch.clientY-this.canvasTop)));
        }
    }

}
