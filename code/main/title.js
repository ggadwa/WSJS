import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';
import MenuClass from '../main/menu.js';
import SoundClass from '../sound/sound.js';
import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';
import DialogButtonClass from '../dialog/dialog_button.js';

export default class TitleClass
{
    constructor(core,data)
    {
        this.core=core;
        this.data=data;
        
        this.PLAY_MENU_ID=0;
        this.MULTIPLAYER_MENU_ID=1;
        this.SETUP_MENU_ID=2;
        this.QUIT_MENU_ID=3;
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.clickDown=false;
        this.clickSound=null;
        this.selectSound=null;
        
        this.menu=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    async initialize()
    {
        let items=[];
        
            // audio
            // will share with dialogs
            
        this.clickSound=new SoundClass(this.core,this.core.json.title.clickSound);
        this.clickSound.initialize();
        if (!(await this.clickSound.load())) return(false);
        
        this.selectSound=new SoundClass(this.core,this.core.json.title.selectSound);
        this.selectSound.initialize();
        if (!(await this.selectSound.load())) return(false);
        
            // the menu
        
        if (this.core.json.title.playButton.show) items.push([this.PLAY_MENU_ID,this.core.json.title.playButton.title]);
        if (this.core.json.title.multiplayerButton.show) items.push([this.MULTIPLAYER_MENU_ID,this.core.json.title.multiplayerButton.title]);
        if (this.core.json.title.setupButton.show) items.push([this.SETUP_MENU_ID,this.core.json.title.setupButton.title]);
        if (this.core.json.title.quitButton.show) items.push([this.QUIT_MENU_ID,this.core.json.title.quitButton.title]);
        
        this.menu=new MenuClass(this.core,items);
        if (!this.menu.initialize()) return(false);
        
        return(true);
    }
    
    release()
    {
        this.clickSound.release();
        this.selectSound.release();
        this.menu.release();
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
                
                if (this.menu.cursorInItem(this.PLAY_MENU_ID)) {
                    this.core.audio.soundStartUI(this.clickSound);
                    this.core.game.setMultiplayerMode(this.core.game.MULTIPLAYER_MODE_NONE);
                    this.core.switchLoop(this.core.LOOP_GAME_LOAD);
                    return(false);
                }
                if (this.menu.cursorInItem(this.MULTIPLAYER_MENU_ID)) {
                    this.core.audio.soundStartUI(this.clickSound);
                    this.core.switchLoop(this.core.LOOP_DIALOG_MULTIPLAYER);
                    return(false);
                }
                if (this.menu.cursorInItem(this.SETUP_MENU_ID)) {
                    this.core.audio.soundStartUI(this.clickSound);
                    this.core.switchLoop(this.core.LOOP_DIALOG_SETTING);
                    return(false);
                }
                if (this.menu.cursorInItem(this.QUIT_MENU_ID)) {
                    this.core.release();
                    window.location.assign(window.location.href);       // easiest way to quit
                    return(false);
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
                    
            // menu
        
        this.menu.draw();
        
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
