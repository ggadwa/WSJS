import ColorClass from '../utility/color.js';
import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';
import InterfaceButtonClass from '../interface/interface_button.js';

export default class TitleClass
{
    constructor(core,data)
    {
        this.core=core;
        this.data=data;
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.clickDown=false;
        
        this.playButton=null;
        this.multiplayerButton=null;
        this.setupButton=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    async initialize()
    {
        this.playButton=new InterfaceButtonClass(this.core,this.core.game.json.title.playButton.x,this.core.game.json.title.playButton.y,this.core.game.json.title.playButton.width,this.core.game.json.title.playButton.height,this.core.game.json.title.playButton.title);
        if (!this.playButton.initialize()) return(false);
        
        if (this.core,this.core.game.json.title.multiplayerButton.show) {
            this.multiplayerButton=new InterfaceButtonClass(this.core,this.core.game.json.title.multiplayerButton.x,this.core.game.json.title.multiplayerButton.y,this.core.game.json.title.multiplayerButton.width,this.core.game.json.title.multiplayerButton.height,this.core.game.json.title.multiplayerButton.title);
            if (!this.multiplayerButton.initialize()) return(false);
        }
        else {
            this.multiplayerButton=null;
        }
        
        if (this.core,this.core.game.json.title.setupButton.show) {
            this.setupButton=new InterfaceButtonClass(this.core,this.core.game.json.title.setupButton.x,this.core.game.json.title.setupButton.y,this.core.game.json.title.setupButton.width,this.core.game.json.title.setupButton.height,this.core.game.json.title.setupButton.title);
            if (!this.setupButton.initialize()) return(false);
        }
        else {
            this.setupButton=null;
        }
        
        return(true);
    }
    
    release()
    {
        this.playButton.release();
        if (this.mulmultiplayerButton!==null) this.multiplayerButton.release();
        if (this.setupButton!==null) this.setupButton.release();
    }
    
        //
        // running
        //
        
    run()
    {
        let cursor=this.core.interface.cursor;
        
            // mouse move cursor
            
        if (cursor.run()) {
            this.clickDown=true;
        }
        else {
            if (this.clickDown) {
                this.clickDown=false;
                
                if (this.playButton.cursorInButton()) {
                    window.main.core.switchLoop(this.core.LOOP_GAME,0,false);
                    return(false);
                }
                
                if (this.multiplayerButton!==null) {
                    if (this.multiplayerButton.cursorInButton()) {
                        window.main.core.switchLoop(this.core.LOOP_DIALOG,this.core.dialog.DIALOG_MODE_MULTIPLAYER,false);
                        return(false);
                    }
                }
                
                if (this.setupButton!==null) {
                    if (this.setupButton.cursorInButton()) {
                        window.main.core.switchLoop(this.core.LOOP_DIALOG,this.core.dialog.DIALOG_MODE_SETTINGS,false);
                        return(false);
                    }
                }
            }
        }
        
        return(true);
    }
    
        //
        // drawing
        //
        
    draw()
    {
        let gl=this.core.gl;
        
        this.core.orthoMatrix.setOrthoMatrix(this.core.wid,this.core.high,-1.0,1.0);
        
        gl.disable(gl.DEPTH_TEST);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
            // NOTE: These set shaders on each draw because
            // we don't need the speed boost here and UI has
            // multiple different shaders
        
            // background
         
        this.core.interface.background.draw(false);
                    
            // buttons
            
        this.playButton.draw();
        if (this.multiplayerButton!==null) this.multiplayerButton.draw();
        if (this.setupButton!==null) this.setupButton.draw();
        
            // cursor
        
        if (!this.core.input.hasTouch) this.core.interface.cursor.draw();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
    
        //
        // title loop
        //
        
    startLoop()
    {
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.core.interface.cursor.center();
        
        this.clickDown=false;
    }
    
    resumeLoop()
    {
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.lastRunTimestamp=this.timestamp;
        this.lastDrawTimestamp=this.timestamp;
        
        this.clickDown=false;
    }
        
    loop()
    {
        const RUN_MILLISECONDS=32;
        const DRAW_MILLISECONDS=32;
        const BAIL_MILLISECONDS=5000;

        let systemTick;
        let runTick;

            // loop uses it's own tick (so it
            // can be paused, etc) and calculates
            // it from the system tick

        systemTick=Math.trunc(window.performance.now());
        this.timestamp+=(systemTick-this.lastSystemTimestamp);
        this.lastSystemTimestamp=systemTick;

            // cursor movement

        runTick=this.timestamp-this.lastRunTimestamp;

        if (runTick>RUN_MILLISECONDS) {

            if (runTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

                while (runTick>RUN_MILLISECONDS) {
                    runTick-=RUN_MILLISECONDS;
                    this.lastRunTimestamp+=RUN_MILLISECONDS;

                    if (!this.run()) return;        // returns false if we are changing loop
                }
            }
            else {
                this.lastRunTimestamp=this.timestamp;
            }
        }

            // drawing

        if ((this.timestamp-this.lastDrawTimestamp)>DRAW_MILLISECONDS) {
            this.lastDrawTimestamp=this.timestamp; 

            this.draw();
        }
    }
    
}
