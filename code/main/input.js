import * as constants from '../../code/main/constants.js';

//
// input class
//

export default class InputClass
{
    constructor(view)
    {
        this.view=view;

            // the single player entity
            
        this.playerEntity=null;

            // input flags

        this.eventsAttached=false;
        
        this.keyFlags=new Uint8Array(255);
        
        this.mouseChangeX=0;
        this.mouseChangeY=0;
        
        this.mouseButtonFlags=new Uint8Array(8);
        this.mouseWheelClick=0;
        this.mouseWheelClickRefreshTick=view.timestamp;
        
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

    initialize(playerEntity)
    {
            // set to player entity
            
        this.playerEntity=playerEntity;

            // clear any flags

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
        // pause state
        //
        
    clickResume()
    {
        this.view.setPauseState(false,false);
        this.setPauseState(false);
    }
        
    setPauseState(pause)
    {
        if (pause) {
            
                // unattach any events
                
            if (this.eventsAttached) {
                this.keyEnd();
                this.mouseEnd();
                this.eventsAttached=false;
            }
            
                // and make sure a click
                // unpaused
                
            this.view.canvas.onclick=this.clickResume.bind(this);
        }
        else {
            
                // clear the unpause click
                
            this.view.canvas.onclick=null;
            
                // attach events
                
            this.keyStart();
            this.mouseStart();
            this.eventsAttached=true;
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
            
        if (this.view.canvas.requestPointerLock) {
            document.addEventListener('pointerlockchange',this.pointerLockChangeListener,false);
            document.addEventListener('pointerlockerror',this.pointerLockErrorListener,false);
            this.view.canvas.requestPointerLock();
        }
        else {
            console.log('Pointer lock not supported, no mouse control');
            return;
        }
    }
    
    mouseEnd()
    {
            // stop pointer lock
            
        if (document.exitPointerLock) {
            document.exitPointerLock();
            document.addEventListener('pointerlockchange',this.pointerLockChangeListener,false);
            document.addEventListener('pointerlockerror',this.pointerLockErrorListener,false);
        }
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
        this.mouseWheelClickRefreshTick=this.view.timestamp;
    }
    
    mouseWheelRead()
    {
        let     click;
        
        if (this.mouseWheelClick===0) return(0);

        click=this.mouseWheelClick;
        
        this.mouseWheelClick=0;
        this.mouseWheelClickRefreshTick=this.view.timestamp+constants.INPUT_WHEEL_REFRESH_TICK;
        
        return(click);
    }
    
        // mouse event callbacks
    
    pointerLockChange(event)
    {
        let elem=null;
        if (document.pointerLockElement) elem=document.pointerLockElement;
        if (document.mozPointerLockElement) elem=document.mozPointerLockElement;
        if (document.webkitPointerLockElement) elem=document.webkitPointerLockElement;
        
        if (elem===this.view.canvas) {
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
            this.view.setPauseState(true,false);       // go into pause
            this.setPauseState(true);
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
        if (this.view.timestamp<this.mouseWheelClickRefreshTick) return;
        
        this.mouseWheelClick=Math.sign(event.deltaY);
    }
    
    mouseMove(event)
    {
        this.mouseChangeX+=event.movementX;
        this.mouseChangeY+=event.movementY;
    }

}
