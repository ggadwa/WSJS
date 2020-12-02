import BackgroundClass from '../main/background.js';
import CursorClass from '../main/cursor.js';
import TitleClass from '../main/title.js';
import DialogSettingClass from '../dialog/dialog_setting.js';
import DialogMultiplayerClass from '../dialog/dialog_multiplayer.js';
import DialogDeveloperClass from '../dialog/dialog_developer.js';
import DialogPromptClass from '../dialog/dialog_prompt.js';
import MapClass from '../map/map.js';
import ShaderListClass from '../shader/shader_list.js';
import AudioClass from '../sound/audio.js';
import PointClass from '../utility/point.js';
import RectClass from '../utility/rect.js';
import PlaneClass from '../utility/plane.js';
import ColorClass from '../utility/color.js';
import Matrix4Class from '../utility/matrix4.js';
import GameClass from '../game/game.js';
import DeveloperClass from '../developer/developer.js';
import InputClass from '../main/input.js';
import SetupClass from '../main/setup.js';

//
// core class
//

export default class CoreClass
{
    constructor()
    {
            // loop types
            
        this.LOOP_TITLE=0;
        this.LOOP_DIALOG_SETTING=1;
        this.LOOP_DIALOG_MULTIPLAYER=2;
        this.LOOP_DIALOG_DEVELOPER=3;
        this.LOOP_DIALOG_PROMPT=4;
        this.LOOP_GAME=5;
        this.LOOP_DEVELOPER=6;
        
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
            
        this.TEXT_TEXTURE_WIDTH=512;
        this.TEXT_TEXTURE_HEIGHT=512;
        this.TEXT_CHAR_PER_ROW=10;
        this.TEXT_CHAR_WIDTH=50;
        this.TEXT_CHAR_HEIGHT=50;
        this.TEXT_FONT_NAME='Arial';
        this.TEXT_FONT_SIZE=48;
        
        this.TEXT_ALIGN_LEFT=0;
        this.TEXT_ALIGN_CENTER=1;
        this.TEXT_ALIGN_RIGHT=2;
        
        this.TEXT_ALIGN_LIST=['left','center','right'];
        
            // misc statics
            
        this.MAX_LIGHT_COUNT=24;        // max lights in scene, needs to be the same as lights[x] in shaders
        this.MAX_SKELETON_JOINT=64;    // max joints in a skeleton, needs to be the same as jointMatrix[x] in shaders
        
            // current loop
            
        this.currentLoop=this.LOOP_TITLE;
        this.previousLoop=this.LOOP_TITLE;
        this.paused=true;

            // the opengl context

        this.gl=null;
        this.canvas=null;
        
            // the audio
            
        this.audio=new AudioClass(this);
        
            // fonts
            
        this.fontTexture=null;
        this.fontCharWidths=new Float32Array(128);
        
            // the core.json
            
        this.json=null;
        
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
        this.dialogPrompt=null;
        this.game=null;
        this.developer=null;
        
            // input
            
        this.input=new InputClass(this);
        this.input.initialize();
        
            // the core setup

        this.wid=0;
        this.high=0;
        this.aspect=0;
        
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
        // initialize and release
        //
    
    async initialize(data)
    {
        let lft,top,wid,high;
        let resp;
        
            // get the core json
            
        try {
            resp=await fetch('../html/core.json');
            if (!resp.ok) {
                alert(`Unable to load core.json: ${resp.statusText}`);
                return(false);
            }
            
            this.json=await resp.json();
        }
        catch (e) {
            alert(`Unable to load core.json: ${e.message}`);
            return(false);
        }
        
            // canvas position
            
        wid=window.innerWidth;
        high=Math.trunc((wid*9)/16);
        
        if (high>window.innerHeight) {
            high=window.innerHeight;
            wid=Math.trunc((high*16)/9);
        }
        
        lft=Math.trunc((window.innerWidth-wid)/2);
        top=Math.trunc((window.innerHeight-high)/2);
        
            // create the canvas
            
        this.canvas=document.createElement('canvas');
        this.canvas.style.position='absolute';
        this.canvas.style.left=lft+'px';
        this.canvas.style.top=top+'px';
        this.canvas.style.touchAction='none';
        this.canvas.width=wid;
        this.canvas.height=high;
        
        this.canvas.oncontextmenu=this.canvasRightClickCancel.bind(this);
        
        document.body.appendChild(this.canvas);
        
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
         
            // cache some values

        this.wid=this.canvas.width;
        this.high=this.canvas.height;
        this.aspect=this.canvas.width/this.canvas.height;
        
            // the audio context
            
        if (!this.audio.initialize()) return(false);
        
            // the font texture
            
        this.createFontTexture();
        
            // title/dialog common interfaces
            
        this.background=new BackgroundClass(this);
        if (!(await this.background.initialize())) return(false);
            
        this.cursor=new CursorClass(this);
        if (!(await this.cursor.initialize())) return(false);
        
            // shader list
        
        this.shaderList=new ShaderListClass(this);
        this.shaderList.initialize();
        
            // main game class
            
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
        
        this.dialogPrompt=new DialogPromptClass(this,data);
        if (!this.dialogPrompt.initialize()) return;
        
            // developer
            
        this.developer=new DeveloperClass(this);
        if (!(await this.developer.initialize())) return(false);
        
            // the project user setup
            
        this.setup=new SetupClass();
        this.setup.load(this);      // requires game to be initialized, so we do this later
        
        return(true);
    }

    release()
    {
        this.developer.release();
        this.game.release();
        this.title.release();
        this.dialogSetting.release();
        this.dialogMultiplayer.release();
        this.dialogDeveloper.release();
        this.dialogPrompt.release();
        this.shaderList.release();
        this.audio.release();
        this.cursor.release();
        this.background.release();
        this.deleteFontTexture();
    }
    
        //
        // fonts
        //
        
    createFontTexture()
    {
        let x,y,yAdd,cIdx,charStr,ch;
        let fontCanvas,ctx;
        let gl=this.gl;
        
            // create the text bitmap

        fontCanvas=document.createElement('canvas');
        fontCanvas.width=this.TEXT_TEXTURE_WIDTH;
        fontCanvas.height=this.TEXT_TEXTURE_HEIGHT;
        ctx=fontCanvas.getContext('2d');
        
            // background is black, text is white
            // so it can be colored
            
        ctx.fillStyle='#000000';
        ctx.fillRect(0,0,this.TEXT_TEXTURE_WIDTH,this.TEXT_TEXTURE_HEIGHT);

            // draw the text

        ctx.font=(this.TEXT_FONT_SIZE+'px ')+this.TEXT_FONT_NAME;
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillStyle='#FFFFFF';

        yAdd=Math.trunc(this.TEXT_CHAR_HEIGHT/2);

        for (ch=32;ch!==127;ch++) {
            cIdx=ch-32;
            x=(cIdx%this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_WIDTH;
            y=Math.trunc(cIdx/this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_HEIGHT;
            y+=yAdd;

            charStr=String.fromCharCode(ch);
            this.fontCharWidths[cIdx]=((ctx.measureText(charStr).width+4)/this.TEXT_CHAR_WIDTH);
            if (this.fontCharWidths[cIdx]>1.0) this.fontCharWidths[cIdx]=1.0;

            ctx.fillText(charStr,(x+2),(y-1));

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
        // canvas right click, always disabled
        //
        
    canvasRightClickCancel(event)
    {
        event.preventDefault();
        return(false);
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
        // main loop
        //
        
    startLoop()
    {
        this.currentLoop=this.LOOP_TITLE;
        
            // always start the game paused
            // when the input gets started, it'll
            // resume it
            
        this.paused=true;
        
            // start the title loop
            
        this.title.startLoop();
                
            // finally start the input
            // this starts a pointerlock which
            // unpauses the game and starts the loop
            
        this.input.startInput();
    }
    
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
                
            case this.LOOP_DIALOG_PROMPT:
                this.dialogPrompt.startLoop();
                break;
                
            case this.LOOP_GAME:
                if ((this.previousLoop===this.LOOP_DIALOG_SETTING) || (this.previousLoop===this.LOOP_DEVELOPER)) {         // if this is coming from setting dialog or developer to game, then it's a resume instead of a start
                    this.game.resumeLoop();
                }
                else {
                    this.game.setMapName(null);
                    this.game.startLoop();
                }
                break;
                
            case this.LOOP_DEVELOPER:
                if ((this.previousLoop===this.LOOP_DIALOG_DEVELOPER) || (this.previousLoop===this.LOOP_DIALOG_PROMPT)) {    // if this is coming from developer dialog to developer, then it's a resume instead of a start
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
        let div,y;
        
        this.paused=true;
        
            // suspend the sound
            
        this.audio.suspend();
        
            // the pause click

        y=parseInt(this.canvas.style.top)+Math.trunc(this.canvas.height*0.5);
        
        div=document.createElement('div');
        div.id='pauseDiv';
        div.style.position='absolute';
        div.style.left=(parseInt(this.canvas.style.left)+50)+'px';
        div.style.top=(y-25)+'px';
        div.style.width=(this.canvas.width-100)+'px';
        div.style.height='50px';
        div.style.border='2px solid black';
        div.style.backgroundColor='#EEEE00';
        div.style.boxShadow='2px 2px 2px #AAAAAA';
        div.style.fontFamily='Arial';
        div.style.fontSize='36pt';
        div.style.textAlign='center';
        div.style.cursor='pointer';
        div.appendChild(document.createTextNode("Paused - Click To Continue"));
        
        div.addEventListener('mouseover',function(){this.style.backgroundColor='#FFFF00'});
        div.addEventListener('mouseout',function(){this.style.backgroundColor='#EEEE00'});
        div.addEventListener("click",this.input.pointerLockClickResume.bind(this.input));
        
        document.body.appendChild(div);
    }
    
    resumeLoop()
    {
        let div;
        
        this.paused=false;
        
            // remove the pause click
            
        div=document.getElementById('pauseDiv');
        if (div!==null) document.body.removeChild(div);
        
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
            case this.LOOP_DIALOG_PROMPT:
                this.dialogPrompt.resumeLoop();
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
        
            // and restart the loop
        
        window.requestAnimationFrame(mainLoop);
    }

}

//
// main game loop
//

function mainLoop(timestamp)
{
    let core=window.main.core;
    
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
        case core.LOOP_DIALOG_PROMPT:
            core.dialogPrompt.loop();
            break;
        case core.LOOP_GAME:
            if (!core.game.inLoading) core.game.loop();
            break;
        case core.LOOP_DEVELOPER:
            core.developer.loop();
            break;
    }
    
        // next animation request
        
    window.requestAnimationFrame(mainLoop);
}

