//
// input class
//

export default class InputClass
{
    constructor(core)
    {
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
        
            // touches
            
        this.hasTouch=(navigator.maxTouchPoints>1);
        this.touchMenuTrigger=false;
        
        this.touchStickLeftClick=false;
        this.touchStickRightClick=false;
            
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
        
        this.touchMenuTrigger=false;
        
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
        let click=this.touchStickLeftClick;
        this.touchStickLeftClick=false;
        
        return(click);
    }
    
    getTouchStickLeftX()
    {
        return(this.core.interface.touchStickLeft.getX());
    }
    
    getTouchStickLeftY()
    {
        return(this.core.interface.touchStickLeft.getY());
    }
    
    isTouchStickRightClick()
    {
        let click=this.touchStickRightClick;
        this.touchStickRightClick=false;
        
        return(click);
    }
    
    getTouchStickRightX()
    {
        return(this.core.interface.touchStickRight.getX());
    }
    
    getTouchStickRightY()
    {
        return(this.core.interface.touchStickRight.getY());
    }
    
    touchClear()
    {
        this.core.interface.touchStickLeft.show=false;
        this.core.interface.touchStickRight.show=false;
        
        this.touchStickLeftClick=false;
        this.touchStickRightClick=false;
    }
    
    touchStart(event)
    {
        let touch,x,y,quadrant;
        let iface=this.core.interface;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            x=(touch.clientX-this.canvasLeft);
            y=(touch.clientY-this.canvasTop);

            if (y<this.canvasMidY) {
                quadrant=(x<this.canvasMidX)?this.TOUCH_QUADRANT_TOPLEFT:this.TOUCH_QUADRANT_TOPRIGHT;
            }
            else {
                quadrant=(x<this.canvasMidX)?this.TOUCH_QUADRANT_BOTTOMLEFT:this.TOUCH_QUADRANT_BOTTOMRIGHT;
            }

                // check sticks

            if (y>this.canvasMidY) {
                if (x<this.canvasMidX) {
                    if (!iface.touchStickLeft.show) iface.touchStickLeft.touchDown(touch.identifier,x,y);
                }
                else {
                    if (!iface.touchStickRight.show) iface.touchStickRight.touchDown(touch.identifier,x,y);
                }
            }
            
                // check buttons
                
            if (iface.touchButtonMenu!==null) {
                if (iface.touchButtonMenu.isTouchInButton(x,y)) {
                    if (iface.touchButtonMenu.id!==touch.identifier) {
                        iface.touchButtonMenu.touchDown(touch.identifier);
                        this.touchMenuTrigger=true;
                    }
                }
            }
        }
    }
    
    touchEnd(event)
    {
        let touch;
        let iface=this.core.interface;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            
                // release on either stick?
                
            if (iface.touchStickLeft.id===touch.identifier) {
                this.touchStickLeftClick=iface.touchStickLeft.touchUp();
                break;
            }
            
            if (iface.touchStickRight.id===touch.identifier) {
                this.touchStickRightClick=iface.touchStickRight.touchUp();
                break;
            }
            
                // release on buttons
                
            if (iface.touchButtonMenu!==null) {
                if (iface.touchButtonMenu.id===touch.identifier) {
                    iface.touchButtonMenu.touchUp();
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
        let touch,x,y;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            
            x=(touch.clientX-this.canvasLeft);
            y=(touch.clientY-this.canvasTop);
            
                // check the sticks
                
            if (this.core.interface.touchStickLeft.id===touch.identifier) {
                this.core.interface.touchStickLeft.touchMove(x,y);
                break;
            }
            
            if (this.core.interface.touchStickRight.id===touch.identifier) {
                this.core.interface.touchStickRight.touchMove(x,y);
                break;
            }
        }
    }

}
