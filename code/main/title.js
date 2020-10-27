import ColorClass from '../utility/color.js';
import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';

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
        
        this.runDialog=false;
        this.runGame=false;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    async initialize()
    {
        return(true);
    }
    
    release()
    {
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
                
                if (this.core.interface.optionButton.cursorInButton(cursor.x,cursor.y)) {
                    this.runDialog=true;
                    return;
                }
                if (this.core.interface.playButton.cursorInButton(cursor.x,cursor.y)) {
                    this.runGame=true;
                    return;
                }
            }
        }
    }
    
        //
        // drawing
        //
        
    draw()
    {
        this.core.orthoMatrix.setOrthoMatrix(this.core.wid,this.core.high,-1.0,1.0);
        this.core.interface.drawUI(false);
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
        
        this.runDialog=false;
        this.runGame=false;
    }
    
    resumeLoop()
    {
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.lastRunTimestamp=this.timestamp;
        this.lastDrawTimestamp=this.timestamp;
        
        this.clickDown=false;
        
        this.runDialog=false;
        this.runGame=false;
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

                    this.run();
                }
            }
            else {
                this.lastRunTimestamp=this.timestamp;
            }
        }

            // exiting this loop

        if (this.runDialog) {
            window.main.core.switchLoop(window.main.core.LOOP_DIALOG);
            return;
        }

        if (this.runGame) {
            window.main.core.switchLoop(window.main.core.LOOP_GAME);
            return;
        }

            // drawing

        if ((this.timestamp-this.lastDrawTimestamp)>DRAW_MILLISECONDS) {
            this.lastDrawTimestamp=this.timestamp; 

            this.draw();
        }
    }
    
}
