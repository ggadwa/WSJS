import BackgroundClass from '../main/background.js';
import CursorClass from '../main/cursor.js';
import TitleClass from '../main/title.js';
import DialogSettingClass from '../dialog/dialog_setting.js';
import DialogMultiplayerClass from '../dialog/dialog_multiplayer.js';
import DialogDeveloperClass from '../dialog/dialog_developer.js';
import DialogNodeClass from '../dialog/dialog_node.js';
import DialogErrorClass from '../dialog/dialog_error.js';
import MapClass from '../map/map.js';
import ShaderListClass from '../shader/shader_list.js';
import AudioClass from '../sound/audio.js';
import PointClass from '../utility/point.js';
import RectClass from '../utility/rect.js';
import PlaneClass from '../utility/plane.js';
import ColorClass from '../utility/color.js';
import Matrix4Class from '../utility/matrix4.js';
import GameLoadClass from '../game/game_load.js';
import GameClass from '../game/game.js';
import DeveloperClass from '../developer/developer.js';
import InputClass from '../main/input.js';
import SetupClass from '../main/setup.js';

//
// core class
//

export default class CoreClass
{
    constructor(project)
    {
            // loop types
            
        this.LOOP_TITLE=0;
        this.LOOP_DIALOG_SETTING=1;
        this.LOOP_DIALOG_MULTIPLAYER=2;
        this.LOOP_DIALOG_DEVELOPER=3;
        this.LOOP_DIALOG_NODE=4;
        this.LOOP_DIALOG_ERROR=5;
        this.LOOP_GAME_LOAD=6;
        this.LOOP_GAME=7;
        this.LOOP_DEVELOPER=8;
        
            // gl options
            
        this.GL_OPTIONS={
            alpha:false,
            depth:true,
            stencil:false,
            antialias:false,
            premultipliedAlpha:false,
            desynchronized:true,
            preserveDrawingBuffer:true,
            failIfMajorPerformanceCaveat:false
        };
        
            // text statics
        
        this.TEXT_TEXTURE_WIDTH=1024;
        this.TEXT_TEXTURE_HEIGHT=1024;
        this.TEXT_CHAR_PER_ROW=10;
        this.TEXT_CHAR_WIDTH=100;
        this.TEXT_CHAR_HEIGHT=100;
        this.TEXT_FONT_SIZE=96;
        
        this.TEXT_ALIGN_LEFT=0;
        this.TEXT_ALIGN_CENTER=1;
        this.TEXT_ALIGN_RIGHT=2;
        
            // element positions
            
        this.POSITION_TOP_LEFT=0;
        this.POSITION_TOP_RIGHT=1;
        this.POSITION_BOTTOM_LEFT=2;
        this.POSITION_BOTTOM_RIGHT=3;
        this.POSITION_MIDDLE=4;
        
            // menu positions
            
        this.MENU_X_ALIGN_LEFT=-1;
        this.MENU_X_ALIGN_CENTER=0;
        this.MENU_X_ALIGN_RIGHT=1;
        
        this.MENU_Y_ALIGN_TOP=-1;
        this.MENU_Y_ALIGN_CENTER=0;
        this.MENU_Y_ALIGN_BOTTOM=1;
        
            // misc statics
            
        this.MAX_LIGHT_COUNT=24;        // max lights in scene, needs to be the same as lights[x] in shaders
        this.MAX_SKELETON_JOINT=64;    // max joints in a skeleton, needs to be the same as jointMatrix[x] in shaders

            // the project

        this.project=new project(this);
        
            // current loop
            
        this.currentLoop=this.LOOP_TITLE;
        this.previousLoop=this.LOOP_TITLE;
        this.paused=true;

            // the opengl context

        this.canvas=null;
        this.gl=null;
        
        this.canvasClick=null;
        this.sessionFullScreen=false;
        
            // the audio and input
            
        this.audio=new AudioClass(this);
        this.input=new InputClass(this);
        
            // fonts
            
        this.fontTexture=null;
        this.fontCharWidths=new Float32Array(128);
        
            // title/dialog common interfaces
            
        this.background=null;
        this.cursor=null;
        
            // the shader list
            
        this.shaderList=null;
        
            // loops
            
        this.title=null;
        this.dialogSetting=null;
        this.dialogMultiplayer=null;
        this.dialogDeveloper=null;
        this.dialogNode=null;
        this.dialogError=null;
        this.gameLoad=null;
        this.game=null;
        this.developer=null;
        
            // gl matrixes
          
        this.orthoMatrix=new Matrix4Class();
        this.perspectiveMatrix=new Matrix4Class();
        this.viewMatrix=new Matrix4Class();
        
            // setup (preferences)

        this.setup=null;
        
            // random numbers
            
        this.mwcW=0;
        this.mwcZ=0;

        Object.seal(this);
    }
    
        //
        // main run
        // 
        // this is the main run for the entire application.  We
        // need to do some important things, like create the canvas,
        // go to full screen, start the audio and start the input
        // because all of this is locked out without user input
        //
        
    async run(data)
    {
            // the user settings
            
        this.setup=new SetupClass();
        this.setup.load();
        
            // clear html
            
        document.body.innerHTML='';
        
            // the canvas
            
        this.canvas=document.createElement('canvas');
        this.canvas.style.position='absolute';
        this.canvas.style.left='0px';
        this.canvas.style.top='0px';
        this.canvas.style.touchAction='none';
        this.canvas.style.userSelect='none';
        this.canvas.style.userDrag='none';
        this.canvas.width=window.innerWidth;
        this.canvas.height=window.innerHeight;
        
        this.canvas.addEventListener('click',function(event) { event.preventDefault(); });
        this.canvas.addEventListener('dblclick',function(event) { event.preventDefault(); });
        this.canvas.addEventListener('contextmenu',function(event) { event.preventDefault(); });
        
        document.body.appendChild(this.canvas);
        
            // remember the full screen setting
            // because of the complications in changing this,
            // we require a restart so the startup setting
            // is used regardless of changes
            
        this.sessionFullScreen=this.setup.fullScreen;
        
            // we go into full screen and/or
            // get the input here because it needs to
            // happen after an interactive click
            
        if (this.sessionFullScreen) {
            if (this.canvas.requestFullscreen===undefined) {
                this.canvas.webkitRequestFullscreen();
            }
            else {
                this.canvas.requestFullscreen();
            }
        }
        
        document.addEventListener('fullscreenchange',this.fullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange',this.fullscreenChange.bind(this));      // iOS
        
            // capture the input
            
        this.input.initialize();
        
            // initialize the core and
            // go into the title run
        
        if (!(await this.initialize(data))) return;
        if (!(await this.loadShaders())) return;
        
            // start the title loop
            
        this.paused=false;
        this.title.startLoop();
            
        window.requestAnimationFrame(mainLoop);
    }
    
        //
        // initialize and release
        //
    
    async initialize(data)
    {
            // get the gl context

        this.gl=this.canvas.getContext("webgl2",this.GL_OPTIONS);
        if (this.gl===null) {
            alert('WebGL2 not available, try a newer browser');
            return(false);
        }
        
            // some initial setups

        this.gl.viewport(0,0,this.canvas.width,this.canvas.height);

        this.gl.clearColor(0.0,0.0,0.0,1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        
            // the audio context
            
        if (!this.audio.initialize()) return(false);
        
            // the font texture
            
        this.createFontTexture();
        
            // project initialization
            
        this.project.initialize();
        
            // title/dialog common interfaces
            
        this.background=new BackgroundClass(this);
        if (!(await this.background.initialize())) return(false);
            
        this.cursor=new CursorClass(this);
        if (!(await this.cursor.initialize())) return(false);
        
            // shader list
        
        this.shaderList=new ShaderListClass(this);
        this.shaderList.initialize();
        
            // initialize characters
         
        if (!this.project.initializeCharacters()) return;
        
            // main game class
            
        this.gameLoad=new GameLoadClass(this,data);
        this.gameLoad.initialize();
            
        this.game=new GameClass(this,data);
        if (!(await this.game.initialize())) return;
        
            // title/dialogs (non game interface)
            
        this.title=new TitleClass(this,data);
        if (!(await this.title.initialize())) return;
        
        this.dialogSetting=new DialogSettingClass(this,data);
        if (!this.dialogSetting.initialize()) return;
        
        this.dialogMultiplayer=new DialogMultiplayerClass(this,data);
        if (!this.dialogMultiplayer.initialize()) return;
        
        this.dialogDeveloper=new DialogDeveloperClass(this,data);
        if (!this.dialogDeveloper.initialize()) return;
        
        this.dialogNode=new DialogNodeClass(this,data);
        if (!this.dialogNode.initialize()) return;
        
        this.dialogError=new DialogErrorClass(this,data);
        if (!this.dialogError.initialize()) return;
        
            // developer
            
        this.developer=new DeveloperClass(this);
        if (!(await this.developer.initialize())) return(false);
        
        return(true);
    }

    release()
    {
        this.project.release();
        this.developer.release();
        this.game.release();
        this.gameLoad.release();
        this.title.release();
        this.dialogSetting.release();
        this.dialogMultiplayer.release();
        this.dialogDeveloper.release();
        this.dialogNode.release();
        this.dialogError.release();
        this.shaderList.release();
        this.cursor.release();
        this.background.release();
        this.deleteFontTexture();
        this.audio.release();
        this.input.release();
        
        if (this.sessionFullScreen) {
            if (this.canvas.exitFullscreen===undefined) {
                this.canvas.webkitExitFullscreen();
            }
            else {
                this.canvas.exitFullscreen();
            }
        }
    }
    
        //
        // fonts
        //
        
    createFontTexture()
    {
        let x,y,xAdd,yAdd,cIdx,charStr,ch;
        let fontCanvas,ctx;
        let gl=this.gl;
        
            // create a canvas to draw the
            // font into

        fontCanvas=document.createElement('canvas');
        fontCanvas.width=this.TEXT_TEXTURE_WIDTH;
        fontCanvas.height=this.TEXT_TEXTURE_HEIGHT;
        ctx=fontCanvas.getContext('2d');
        
            // background is black, text is white
            // so it can be colored
            
        ctx.fillStyle='#000000';
        ctx.fillRect(0,0,this.TEXT_TEXTURE_WIDTH,this.TEXT_TEXTURE_HEIGHT);

            // draw the text

        ctx.font=(this.TEXT_FONT_SIZE+'px ')+this.project.fontName;
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillStyle='#FFFFFF';

        xAdd=Math.trunc((this.TEXT_CHAR_WIDTH-this.TEXT_FONT_SIZE)*0.5);
        yAdd=Math.trunc(this.TEXT_CHAR_HEIGHT*0.5);

        for (ch=32;ch!==127;ch++) {
            cIdx=ch-32;
            x=(cIdx%this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_WIDTH;
            y=Math.trunc(cIdx/this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_HEIGHT;

            charStr=String.fromCharCode(ch);
            this.fontCharWidths[cIdx]=((ctx.measureText(charStr).width+4)/this.TEXT_CHAR_WIDTH);
            if (this.fontCharWidths[cIdx]>1.0) this.fontCharWidths[cIdx]=1.0;
            
            ctx.save();
            
            ctx.beginPath();                // we clip so crazy characters don't put little bits into other character boxes
            ctx.rect(x,y,this.TEXT_CHAR_WIDTH,this.TEXT_CHAR_HEIGHT);
            ctx.clip();

            ctx.fillText(charStr,(x+xAdd),(y+yAdd));
            
            ctx.restore();

            x+=this.TEXT_CHAR_WIDTH;
        }

            // finally load into webGL
            
        this.fontTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.fontTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,fontCanvas);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
    }
    
    deleteFontTexture()
    {
        this.gl.deleteTexture(this.fontTexture);
    }        
    
        //
        // load the shaders
        //
        
    async loadShaders(callback)
    {
        return(await this.shaderList.loadShaders(callback));
    }
    
        //
        // random numbers
        //
        
    setRandomSeed(seed)
    {
        this.mwcW=(seed<<16)&0xFFFF;
        this.mwcZ=seed&0xFFFF;
    }

    random()
    {
        let r;

        this.mwcZ=(36969*(this.mwcZ&0xFFFF)+(this.mwcZ>>16))&0xFFFFFFFF;
        this.mwcW=(18000*(this.mwcW&0xFFFF)+(this.mwcW>>16))&0xFFFFFFFF;
        r=((this.mwcZ<<16)+this.mwcW)&0xFFFFFFFF;

        return((r/=0xFFFFFFFF)+0.5);
    }
    
    randomInt(startInt,extraInt)
    {
        return(startInt+Math.trunc(this.random()*extraInt));
    }
    
    randomFloat(startFloat,extraFloat)
    {
        return(startFloat+(this.random()*extraFloat));
    }
    
    randomIndex(maxIndex)
    {
            // always returns 0...(maxIndex-1)
            
        let idx=Math.trunc(this.random()*maxIndex);
        if (idx===maxIndex) idx=0;
        
        return(idx);
    }
    
    randomPercentage(percentage)
    {
        return(this.random()<percentage);
    }
    
    randomInBetween(startInt,endInt)
    {
        return(this.randomInt(startInt,(endInt-startInt)));
    }
    
    randomSign()
    {
        return((this.random()<0.5)?-1:1);
    }
    
    randomNegativeOneToOne()
    {
        return((this.random()*2.0)-1.0);
    }
    
        //
        // full screen change event
        // this can trigger going into pause mode
        //
        
    fullscreenChange(event)
    {
        if ((document.fullscreenElement===null) || (document.webkitFullscreenElement===null)) this.pauseLoop();
    }
    
        //
        // main loop
        //
        
    switchLoop(gotoLoop)
    {
        this.previousLoop=this.currentLoop;
        this.currentLoop=gotoLoop;
        
        switch (this.currentLoop) {
            
            case this.LOOP_TITLE:
                this.title.startLoop();
                break;
                
            case this.LOOP_DIALOG_SETTING:
                this.dialogSetting.startLoop();
                break;
                
            case this.LOOP_DIALOG_MULTIPLAYER:
                this.dialogMultiplayer.startLoop();
                break;
                
            case this.LOOP_DIALOG_DEVELOPER:
                this.dialogDeveloper.startLoop();
                break;
                
            case this.LOOP_DIALOG_NODE:
                this.dialogNode.startLoop();
                break;
                
            case this.LOOP_DIALOG_ERROR:
                this.dialogError.startLoop();
                break;
                
            case this.LOOP_GAME_LOAD:
                this.game.gameSetup(null,null);
                this.gameLoad.startLoop();
                break;
                
            case this.LOOP_GAME:
                if (this.previousLoop===this.LOOP_GAME_LOAD) {
                    this.game.startLoop();
                }
                else {
                    this.game.resumeLoop();
                }
                break;
                
            case this.LOOP_DEVELOPER:
                if ((this.previousLoop===this.LOOP_DIALOG_DEVELOPER) || (this.previousLoop===this.LOOP_DIALOG_NODE)) {    // if this is coming from developer dialog to developer, then it's a resume instead of a start
                    this.developer.resumeLoop();
                }
                else {
                    this.developer.startLoop();
                }
                break;
        }
    }
    
    pauseLoop()
    {
            // both full screen and pointer lock can
            // force us into a pause state, so ignore one or the other
            // this should automatically force us out of fullscreen
            
        if (this.paused) return;
        
        this.paused=true;
        
            // suspend the sound
            
        this.audio.suspend();

            // draw the title in pause state
            
        this.title.drawPause();
        
            // click to resume
            
        this.canvasClick=this.resumeLoop.bind(this);
        this.canvas.addEventListener('click',this.canvasClick);
        this.canvas.style.cursor='pointer';
    }
    
    resumeLoop()
    {
        this.paused=false;
        
            // turn off any click
         
        this.canvas.removeEventListener('click',this.canvasClick);
        this.canvas.style.cursor='auto';
        
            // resume the proper loop
            
        switch (this.currentLoop) {
            case this.LOOP_TITLE:
                this.title.resumeLoop();
                break;
            case this.LOOP_DIALOG_SETTING:
                this.dialogSetting.resumeLoop();
                break;
            case this.LOOP_DIALOG_MULTIPLAYER:
                this.dialogMultiplayer.resumeLoop();
                break;
            case this.LOOP_DIALOG_DEVELOPER:
                this.dialogDeveloper.resumeLoop();
                break;
            case this.LOOP_DIALOG_NODE:
                this.dialogNode.resumeLoop();
                break;
            case this.LOOP_DIALOG_ERROR:
                this.dialogError.resumeLoop();
                break;
            case this.LOOP_GAME_LOAD:
                this.gameLoad.resumeLoop();
                break;
            case this.LOOP_GAME:
                this.game.resumeLoop();
                break;
            case this.LOOP_DEVELOPER:
                this.developer.resumeLoop();
                break;
        }
        
            // resume the sound (if not in developer)
            
        if (this.currentLoop!==this.LOOP_DEVELOPER) this.audio.resume();
        
            // enter full screen and pointer lock
            
        if (this.sessionFullScreen) {
            if (this.canvas.requestFullscreen===undefined) {
                this.canvas.webkitRequestFullscreen();
            }
            else {
                this.canvas.requestFullscreen();
            }
        }

        if (!this.input.hasTouch) this.canvas.requestPointerLock();
        
            // and restart the loop
        
        window.requestAnimationFrame(mainLoop);
    }

}

//
// main game loop
//

function mainLoop(timestamp)
{
    let core=window.core;
    
        // skip right out if paused
        // so we no longer have any callbacks
        
    if (core.paused) return;
    
        // run the current loop
        
    switch (core.currentLoop) {
        case core.LOOP_TITLE:
            core.title.loop();
            break;
        case core.LOOP_DIALOG_SETTING:
            core.dialogSetting.loop();
            break;
        case core.LOOP_DIALOG_MULTIPLAYER:
            core.dialogMultiplayer.loop();
            break;
        case core.LOOP_DIALOG_DEVELOPER:
            core.dialogDeveloper.loop();
            break;
        case core.LOOP_DIALOG_NODE:
            core.dialogNode.loop();
            break;
        case core.LOOP_DIALOG_ERROR:
            core.dialogError.loop();
            break;
        case core.LOOP_GAME_LOAD:
            core.gameLoad.loop();
            if (core.gameLoad.inError) {      // game load has lots of awaits some errors can come in anywhere, this flags them and we break out
                if (core.fullScreen) {
                    if (core.canvas.exitFullscreen===undefined) {
                        core.canvas.webkitExitFullscreen();
                    }
                    else {
                        core.canvas.exitFullscreen();
                    }
                }
                core.input.release();
                return;
            }
            break;
        case core.LOOP_GAME:
            core.game.loop();
            break;
        case core.LOOP_DEVELOPER:
            core.developer.loop();
            break;
    }
    
        // next animation request
        
    window.requestAnimationFrame(mainLoop);
}
