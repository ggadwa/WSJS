import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';
import SoundClass from '../sound/sound.js';
import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';
import DialogButtonClass from '../dialog/dialog_button.js';

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
        
        this.clickSound=null;
        
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
            // click audio
            // will share with dialogs
            
        this.clickSound=new SoundClass(this.core,this.core.json.title.clickSound);
        this.clickSound.initialize();
        if (!(await this.clickSound.load())) return(false);
        
            // buttons
            
        this.playButton=new DialogButtonClass(this.core,this.core.json.title.playButton.x,this.core.json.title.playButton.y,this.core.json.title.playButton.width,this.core.json.title.playButton.height,this.core.json.title.playButton.title);
        if (!this.playButton.initialize()) return(false);
        
        if (this.core,this.core.json.title.multiplayerButton.show) {
            this.multiplayerButton=new DialogButtonClass(this.core,this.core.json.title.multiplayerButton.x,this.core.json.title.multiplayerButton.y,this.core.json.title.multiplayerButton.width,this.core.json.title.multiplayerButton.height,this.core.json.title.multiplayerButton.title);
            if (!this.multiplayerButton.initialize()) return(false);
        }
        else {
            this.multiplayerButton=null;
        }
        
        if (this.core,this.core.json.title.setupButton.show) {
            this.setupButton=new DialogButtonClass(this.core,this.core.json.title.setupButton.x,this.core.json.title.setupButton.y,this.core.json.title.setupButton.width,this.core.json.title.setupButton.height,this.core.json.title.setupButton.title);
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
            // mouse move cursor
            
        if (this.core.cursor.run()) {
            this.clickDown=true;
        }
        else {
            if (this.clickDown) {
                this.clickDown=false;
                
                if (this.playButton.cursorInButton()) {
                    this.core.audio.soundStartUI(this.clickSound);
                    this.core.game.setMultiplayerMode(this.core.game.MULTIPLAYER_MODE_NONE);
                    this.core.switchLoop(this.core.LOOP_GAME_LOAD);
                    return(false);
                }
                
                if (this.multiplayerButton!==null) {
                    if (this.multiplayerButton.cursorInButton()) {
                        this.core.audio.soundStartUI(this.clickSound);
                        this.core.switchLoop(this.core.LOOP_DIALOG_MULTIPLAYER);
                        return(false);
                    }
                }
                
                if (this.setupButton!==null) {
                    if (this.setupButton.cursorInButton()) {
                        this.core.audio.soundStartUI(this.clickSound);
                        this.core.switchLoop(this.core.LOOP_DIALOG_SETTING);
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
        
        this.core.orthoMatrix.setOrthoMatrix(this.core.canvas.width,this.core.canvas.height,-1.0,1.0);
        
        gl.disable(gl.DEPTH_TEST);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
            // NOTE: These set shaders on each draw because
            // we don't need the speed boost here and UI has
            // multiple different shaders
        
            // background
         
        this.core.background.draw(false);
                    
            // buttons
            
        this.playButton.draw();
        if (this.multiplayerButton!==null) this.multiplayerButton.draw();
        if (this.setupButton!==null) this.setupButton.draw();
        
            // cursor
        
        if (!this.core.input.hasTouch) this.core.cursor.draw();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
    
    drawPause()
    {
        let col,text;
        let gl=this.core.gl;
        
        this.core.orthoMatrix.setOrthoMatrix(this.core.canvas.width,this.core.canvas.height,-1.0,1.0);
        
        gl.disable(gl.DEPTH_TEST);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
            // background
         
        this.core.background.draw(true);
        
            // the pause text
            // this can be slow, it's only drawn once before the pause takes effect
            
        this.core.shaderList.textShader.drawStart();
        
        col=new ColorClass(1.0,1.0,0.0);
        text=new TextClass(this.core,'Paused - Click To Continue',Math.trunc(this.core.canvas.width*0.5),Math.trunc(this.core.canvas.height*0.5),40,this.core.TEXT_ALIGN_CENTER,col,1,false);
        text.initialize();
        text.draw();
        text.release();
        
        this.core.shaderList.textShader.drawEnd();

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
        
        this.core.cursor.center();
        
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
