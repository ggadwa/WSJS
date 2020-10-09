import ColorClass from '../utility/color.js';
import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';
import DialogButtonClass from '../interface/interface_button.js';

export default class TitleClass
{
    constructor(core,data)
    {
        this.core=core;
        this.data=data;
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.runTick=0;
        this.drawTick=0;
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
        // start and stop title loop
        //
        
    startLoop()
    {
        this.core.currentLoop=this.core.TITLE_LOOP;
        
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.runTick=0;
        this.drawTick=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.core.interface.cursor.center();
        
        this.clickDown=false;
        
        this.runDialog=false;
        this.runGame=false;
        
        window.requestAnimationFrame(titleMainLoop);
    }
    
    endLoopToDialog()
    {
        setTimeout(this.core.dialog.startLoop.bind(this.core.dialog,this.core.dialog.MODE_OPTIONS),1);
    }
    
    endLoopToGame()
    {
        setTimeout(this.core.game.startLoop.bind(this.core.game),1);
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
        if (this.core.input.paused) this.core.interface.drawPauseMessage();
    }
    
}

//
// title main loop
//

const RUN_MILLISECONDS=32;
const DRAW_MILLISECONDS=32;
const BAIL_MILLISECONDS=5000;

function titleMainLoop(timestamp)
{
    let systemTick;
    let core=window.main.core;
    let title=core.title;
    
        // loop uses it's own tick (so it
        // can be paused, etc) and calculates
        // it from the system tick
        
    systemTick=Math.trunc(window.performance.now());
    title.timestamp+=(systemTick-title.lastSystemTimestamp);
    title.lastSystemTimestamp=systemTick;
    
        // cursor movement
    
    title.runTick=title.timestamp-title.lastRunTimestamp;

    if (title.runTick>RUN_MILLISECONDS) {

        if (title.runTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

            while (title.runTick>RUN_MILLISECONDS) {
                title.runTick-=RUN_MILLISECONDS;
                title.lastRunTimestamp+=RUN_MILLISECONDS;

                title.run();
            }
        }
        else {
            title.lastRunTimestamp=title.timestamp;
        }
    }
    
        // exiting this loop
        // always force it to start on next go around
        
    if (title.runDialog) {
        setTimeout(title.endLoopToDialog.bind(title),1);
        return;
    }
        
    if (title.runGame) {
        setTimeout(title.endLoopToGame.bind(title),1);
        return;
    }
    
        // drawing
        
    title.drawTick=title.timestamp-title.lastDrawTimestamp;
    
    if (title.drawTick>DRAW_MILLISECONDS) {
        title.lastDrawTimestamp=title.timestamp; 

        title.draw();
    }
    
        // next frame
        
    window.requestAnimationFrame(titleMainLoop);
}
