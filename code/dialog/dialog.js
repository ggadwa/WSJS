import SetupClass from '../main/setup.js';

export default class DialogClass
{
    constructor(core)
    {
        this.core=core;
        
        this.MODE_OPTIONS=0;
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.runTick=0;
        this.drawTick=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.mode=0;
        this.inGame=false;
        this.exitDialog=false;
        
        //Object.seal(this);
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
        // start and stop dialog loop
        //
        
    startLoop(mode,inGame)
    {
        this.core.currentLoop=this.core.DIALOG_LOOP;
        
        this.mode=mode;
        this.inGame=inGame;
        
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.runTick=0;
        this.drawTick=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.core.interface.loadDialogControls();
        this.core.interface.cursor.center();
        
        this.exitDialog=false;
        
        window.requestAnimationFrame(dialogMainLoop);
    }
    
    endLoopToTitle()
    {
        setTimeout(this.core.title.startLoop.bind(this.core.title),1);
    }
    
    endLoopToGame()
    {
        setTimeout(this.core.game.resumeLoopFromDialog.bind(this.core.game),1);
    }
    
        //
        // running
        //
        
    run()
    {
        let cursor=this.core.interface.cursor;
        
            // keyboard
            
        this.core.interface.keyUI();
        
            // mouse clicking
            
        if (cursor.run()) {
            this.clickDown=true;
        }
        else {
            if (this.clickDown) {
                this.clickDown=false;
                
                if (this.core.interface.clickUI()) return;

                if (this.core.interface.cancelButton.cursorInButton(cursor.x,cursor.y)) {
                    this.exitDialog=true;
                    return;
                }
                if (this.core.interface.okButton.cursorInButton(cursor.x,cursor.y)) {
                    this.core.interface.saveDialogControls();
                    this.exitDialog=true;
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
        this.core.interface.drawUI(true);
        if (this.core.input.paused) this.core.interface.drawPauseMessage();
    }
    
}

//
// dialog main loop
//

const RUN_MILLISECONDS=32;
const DRAW_MILLISECONDS=32;
const BAIL_MILLISECONDS=5000;

function dialogMainLoop(timestamp)
{
    let systemTick;
    let core=window.main.core;
    let dialog=core.dialog;
    
        // loop uses it's own tick (so it
        // can be paused, etc) and calculates
        // it from the system tick
        
    systemTick=Math.trunc(window.performance.now());
    dialog.timestamp+=(systemTick-dialog.lastSystemTimestamp);
    dialog.lastSystemTimestamp=systemTick;
    
        // cursor movement
    
    dialog.runTick=dialog.timestamp-dialog.lastRunTimestamp;

    if (dialog.runTick>RUN_MILLISECONDS) {

        if (dialog.runTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

            while (dialog.runTick>RUN_MILLISECONDS) {
                dialog.runTick-=RUN_MILLISECONDS;
                dialog.lastRunTimestamp+=RUN_MILLISECONDS;

                dialog.run();
            }
        }
        else {
            dialog.lastRunTimestamp=dialog.timestamp;
        }
    }
    
        // exiting dialog
        
    if (dialog.exitDialog) {
        if (dialog.inGame) {
            setTimeout(dialog.endLoopToGame.bind(dialog),1);
        }
        else {
            setTimeout(dialog.endLoopToTitle.bind(dialog),1);
        }
        return;
    }
    
        // drawing
        
    dialog.drawTick=dialog.timestamp-dialog.lastDrawTimestamp;
    
    if (dialog.drawTick>DRAW_MILLISECONDS) {
        dialog.lastDrawTimestamp=dialog.timestamp; 

        dialog.draw();
    }
    
        // next frame
        
    window.requestAnimationFrame(dialogMainLoop);
}

