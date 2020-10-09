import PointClass from '../utility/point.js';

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
        
        this.mouseChangeX=0;
        this.mouseChangeY=0;
        
        this.mouseButtonFlags=new Uint8Array(8);
        this.mouseWheelClick=0;
        this.mouseWheelClickRefreshTick=0;
        
        this.canvasLeft=0;
        this.canvasTop=0;
        this.canvasMidX=0;
        this.canvasMidY=0;
        
        this.paused=false;
        
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
        
        this.touchLeftSwipeId=null;
        this.touchLeftSwipePosition=new PointClass(0,0,0);
        this.touchLeftSwipeMovement=new PointClass(0,0,0);
        
        this.touchRightSwipeId=null;
        this.touchRightSwipePosition=new PointClass(0,0,0);
        this.touchRightSwipeMovement=new PointClass(0,0,0);
            
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
        this.core.canvas.onclick=null;

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
    }

    keyDownEvent(event)
    {
        this.keyFlags.set(event.key.toLowerCase(),true);
    }
     
    keyUpEvent(event)
    {
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
    
        //
        // pointer lock
        //
        
    pointerLockStart()
    {
        let rect;

        this.keyClear();
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
            this.paused=false;
            
            document.addEventListener('mousedown',this.mouseDownListener,false);
            document.addEventListener('mouseup',this.mouseUpListener,false);
            document.addEventListener('wheel',this.mouseWheelListener,false);
            document.addEventListener('mousemove',this.mouseMovedListener,false);
            document.addEventListener('keydown',this.keyDownListener,true);
            document.addEventListener('keyup',this.keyUpListener.bind(this),true);

            this.core.canvas.onclick=null;
        }
        else {
            this.paused=true;
            
            document.removeEventListener('mousedown',this.mouseDownListener,false);
            document.removeEventListener('mouseup',this.mouseUpListener,false);
            document.removeEventListener('wheel',this.mouseWheelListener,false);
            document.removeEventListener('mousemove',this.mouseMovedListener,false);
            document.removeEventListener('keydown',this.keyDownListener,true);
            document.removeEventListener('keyup',this.keyUpListener,true);

            this.core.canvas.onclick=this.pointerLockClickResume.bind(this);
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
        let click=this.touchStickLeftClick;
        this.touchStickLeftClick=false;
        
        return(click);
    }
    
    getTouchStickLeftX(deadZone,acceleration)
    {
        let x=this.core.interface.touchStickLeft.getX();
        
        if (Math.abs(x)<deadZone) return(0);
        return(x*acceleration);
    }
    
    getTouchStickLeftY(deadZone,acceleration)
    {
        let y=this.core.interface.touchStickLeft.getY();
        
        if (Math.abs(y)<deadZone) return(0);
        return(y*acceleration);
    }
    
    isTouchStickRightClick()
    {
        let click=this.touchStickRightClick;
        this.touchStickRightClick=false;
        
        return(click);
    }
    
    getTouchStickRightX(deadZone,acceleration)
    {
        let x=this.core.interface.touchStickRight.getX();
        
        if (Math.abs(x)<deadZone) return(0);
        return(x*acceleration);
    }
    
    getTouchStickRightY(deadZone,acceleration)
    {
        let y=this.core.interface.touchStickRight.getY();
        
        if (Math.abs(y)<deadZone) return(0);
        return(y*acceleration);
    }
    
    getTouchSwipeLeftX()
    {
        let x;
        
        if (this.touchLeftSwipeMovement.x===0) return(0);
        
        x=this.touchLeftSwipeMovement.x;
        this.touchLeftSwipeMovement.x=0;
        return(x);
    }
    
    getTouchSwipeLeftY()
    {
        let y;
        
        if (this.touchLeftSwipeMovement.y===0) return(0);
        
        y=this.touchLeftSwipeMovement.y;
        this.touchLeftSwipeMovement.y=0;
        return(y);
    }
    
    getTouchSwipeRightX()
    {
        let x;
        
        if (this.touchRightSwipeMovement.x===0) return(0);
        
        x=this.touchRightSwipeMovement.x;
        this.touchRightSwipeMovement.x=0;
        return(x);
    }
    
    getTouchSwipeRightY()
    {
        let y;
        
        if (this.touchRightSwipeMovement.y===0) return(0);
        
        y=this.touchRightSwipeMovement.y;
        this.touchRightSwipeMovement.y=0;
        return(y);
    }
    
    touchClear()
    {
        this.core.interface.touchStickLeft.show=false;
        this.core.interface.touchStickRight.show=false;
        
        this.touchStickLeftClick=false;
        this.touchStickRightClick=false;
        
        this.touchLeftSwipeId=null;
        this.touchLeftSwipeMovement.setFromValues(0,0,0);
        
        this.touchRightSwipeId=null;
        this.touchRightSwipeMovement.setFromValues(0,0,0);
    }
    
    touchStart(event)
    {
        let touch,x,y;
        let iface=this.core.interface;
        
        event.preventDefault();
        
        for (touch of event.changedTouches) {
            x=(touch.clientX-this.canvasLeft);
            y=(touch.clientY-this.canvasTop);

                // check sticks

            if (y>this.canvasMidY) {
                if (x<this.canvasMidX) {
                    if (!iface.touchStickLeft.show) iface.touchStickLeft.touchUp();
                    iface.touchStickLeft.touchDown(touch.identifier,x,y);
                }
                else {
                    if (iface.touchStickRight.show) iface.touchStickRight.touchUp();
                    iface.touchStickRight.touchDown(touch.identifier,x,y);
                }
            }
            
                // check swipes
                
            else {
                if (x<this.canvasMidX) {
                    this.touchLeftSwipeId=touch.identifier;
                    this.touchLeftSwipePosition.setFromValues(x,y,0);
                }
                else {
                    this.touchRightSwipeId=touch.identifier;
                    this.touchRightSwipePosition.setFromValues(x,y,0);
                }
            }
            
                // check menu button
                
            if (iface.touchButtonMenu.isTouchInButton(x,y)) {
                if (iface.touchButtonMenu.id!==touch.identifier) {
                    iface.touchButtonMenu.touchDown(touch.identifier);
                    this.touchMenuTrigger=true;
                }
            }
        }
    }
    
    touchEnd(event)
    {
        let touch,x,y,ax,ay;
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
            
                // release either swipe
                
            x=(touch.clientX-this.canvasLeft);
            y=(touch.clientY-this.canvasTop);
                
            if (this.touchLeftSwipeId===touch.identifier) {
                this.touchLeftSwipeId=null;
                x-=this.touchLeftSwipePosition.x;
                y-=this.touchLeftSwipePosition.y;
                ax=Math.abs(x);
                ay=Math.abs(y);
                if ((ax>this.TOUCH_SWIPE_DEAD_ZONE) && (ax>ay)) {
                    this.touchLeftSwipeMovement.setFromValues(x,0,0);
                }
                else {
                    if (ay>this.TOUCH_SWIPE_DEAD_ZONE) {
                        this.touchLeftSwipeMovement.setFromValues(0,y,0);
                    }
                }
                
                break;
            }
            
            if (this.touchRightSwipeId===touch.identifier) {
                this.touchRightSwipeId=null;
                x-=this.touchRightSwipePosition.x;
                y-=this.touchRightSwipePosition.y;
                ax=Math.abs(x);
                ay=Math.abs(y);
                if ((ax>this.TOUCH_SWIPE_DEAD_ZONE) && (ax>ay)) {
                    this.touchRightSwipeMovement.setFromValues(x,0,0);
                }
                else {
                    if (ay>this.TOUCH_SWIPE_DEAD_ZONE) {
                        this.touchRightSwipeMovement.setFromValues(0,y,0);
                    }
                }
                
                break;
            }
            
                // release on menu button
                
            if (iface.touchButtonMenu.id===touch.identifier) {
                iface.touchButtonMenu.touchUp();
                break;
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
