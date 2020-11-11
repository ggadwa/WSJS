import SetupClass from '../main/setup.js';

export default class DialogClass
{
    constructor(core)
    {
        this.core=core;
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
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
        
    startLoop(mode)
    {
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.core.interface.loadDialogControls(mode);
        this.core.interface.cursor.center();
        
        this.exitDialog=false;
    }
    
    resumeLoop()
    {
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.lastRunTimestamp=this.timestamp;
        this.lastDrawTimestamp=this.timestamp;
        
        this.exitDialog=false;
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
                
                if (this.core.game.developer.on) {
                    if (this.core.interface.developBuildPathHintsButton.cursorInButton(cursor.x,cursor.y)) {
                        this.core.interface.saveDialogControls();
                        this.core.game.developer.developerBuilders.buildPathHints();
                        this.exitDialog=true;
                        return;
                    }
                    
                    if (this.core.interface.developBuildShadowMapsButton.cursorInButton(cursor.x,cursor.y)) {
                        this.core.interface.saveDialogControls();
                        this.core.game.developer.developerBuilders.buildShadowmap(this.core.setup.skipShadowMapNormals);
                        this.exitDialog=true;
                        return;
                    }
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
    }
    
        //
        // loop
        //
        
    loop()
    {
        const RUN_MILLISECONDS=32;
        const DRAW_MILLISECONDS=32;
        const BAIL_MILLISECONDS=5000;

        let systemTick,runTick;

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

            // exiting dialog

        if (this.exitDialog) {
            window.main.core.switchLoop(window.main.core.previousLoop,0);
            return;
        }

            // drawing

        if ((this.timestamp-this.lastDrawTimestamp)>DRAW_MILLISECONDS) {
            this.lastDrawTimestamp=this.timestamp; 
            this.draw();
        }
    }

    
}
