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
        
        Object.seal(this);
    }
    
        //
        // initialize/release input
        //

    initialize()
    {
        this.keyClear();
        this.mouseButtonClear();
    }

    release()
    {
        if (this.eventsAttached) {
            this.keyEnd();
            this.mouseEnd();
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
        this.mouseStart();
        this.eventsAttached=true;
    }
        
    stopInput()
    {
        if (this.eventsAttached) {
            this.keyEnd();
            this.mouseEnd();
            this.eventsAttached=false;
        }
    }
    
        //
        // start/stop key events
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
   
    keyDownEvent(event)
    {
        this.keyFlags[event.keyCode]=1;
    }
    
    keyClear()
    {
        let n;
            
        for (n=0;n!==255;n++) {
            this.keyFlags[n]=0;
        }
    }
    
        //
        // key event callbacks
        //
        
    keyUpEvent(event)
    {
        this.keyFlags[event.keyCode]=0;
    }
    
        // start/stop mouse events
    
    mouseStart()
    {
        this.mouseButtonClear();
        
            // request the pointer lock
            
        document.addEventListener('pointerlockchange',this.pointerLockChangeListener,false);
        document.addEventListener('pointerlockerror',this.pointerLockErrorListener,false);
        this.core.canvas.requestPointerLock();
    }
    
    mouseEnd()
    {
            // stop pointer lock
            
        document.exitPointerLock();
        document.addEventListener('pointerlockchange',this.pointerLockChangeListener,false);
        document.addEventListener('pointerlockerror',this.pointerLockErrorListener,false);
    }
    
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
    
        // mouse event callbacks
    
    pointerLockChange(event)
    {
        if (document.pointerLockElement===this.core.canvas) {
            document.addEventListener('mousedown',this.mouseDownListener,false);
            document.addEventListener('mouseup',this.mouseUpListener,false);
            document.addEventListener('wheel',this.mouseWheelListener,{passive:false});     // stop it from scrolling the page
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
        
        event.preventDefault();
        event.stopPropagation();
        
            // for OS X, don't register if we aren't at least
            // at 4 clicks because of the smooth scrolling
            
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

}
