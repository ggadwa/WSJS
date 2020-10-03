import TitleClass from '../main/title.js';
import DialogClass from '../dialog/dialog.js';
import MapClass from '../map/map.js';
import BitmapListClass from '../bitmap/bitmap_list.js';
import SoundListClass from '../sound/sound_list.js';
import ShaderListClass from '../shader/shader_list.js';
import ModelListClass from '../model/model_list.js';
import MusicClass from '../sound/music.js';
import PointClass from '../utility/point.js';
import RectClass from '../utility/rect.js';
import PlaneClass from '../utility/plane.js';
import ColorClass from '../utility/color.js';
import Matrix4Class from '../utility/matrix4.js';
import GameClass from '../main/game.js';
import InterfaceClass from '../interface/interface.js';
import InputClass from '../main/input.js';
import NetworkClass from '../main/network.js';
import SetupClass from '../main/setup.js';
import DialogSettingsClass from '../dialog/dialog_settings.js';
import DialogConnectClass from '../dialog/dialog_connect.js';
import DialogDeveloperClass from '../dialog/dialog_developer.js';

//
// core class
//

export default class CoreClass
{
    constructor()
    {
        this.MAX_LIGHT_COUNT=24;        // max lights in scene, needs to be the same as lights[x] in shaders
        this.MAX_SKELETON_JOINT=64;    // max joints in a skeleton, needs to be the same as jointMatrix[x] in shaders
        
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
        
            // current loop
            
        this.currentLoop=this.NO_LOOP;

            // the opengl context

        this.gl=null;
        this.canvas=null;
        
            // the audio context
            
        this.audioCTX=null;
        
            // the cached objects
            // list, these are usually created by
            // name and loaded after all the imports
            
        this.bitmapList=null;
        this.soundList=null;
        this.shaderList=null;
        this.modelList=null;
        
            // the game and map
            
        this.title=null;
        this.dialog=null;
        this.game=null;
        this.map=null;
        this.music=null;
        
            // input
            
        this.input=new InputClass(this);
        this.input.initialize();
        
            // networking
            
        this.isMultiplayer=false;
        this.network=new NetworkClass(this);
        
            // the core setup

        this.wid=0;
        this.high=0;
        this.aspect=0;
        
            // gl matrixes
            
        this.orthoMatrix=new Matrix4Class();
        this.perspectiveMatrix=new Matrix4Class();
        this.viewMatrix=new Matrix4Class();
        
            // additional core classes

        this.text=null;
        this.interface=null;

        this.setup=null;
        this.settingsDialog=null;
        this.connectDialog=null;
        this.developerDialog=null;
        
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
        let initAudioContext=window.AudioContext||window.webkitAudioContext;
        
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
            
        this.audioCTX=new initAudioContext();
        
        if (this.audioCTX===null) {
            alert('Could not initialize audio context');
            return(false);
        }
        
            // bitmap, sound, shader, and model list
            // a lot of these are deffered load or
            // versions that cache objects
            
        this.bitmapList=new BitmapListClass(this);
        this.bitmapList.initialize();
        
        this.soundList=new SoundListClass(this);
        this.soundList.initialize();
        
        this.shaderList=new ShaderListClass(this);
        this.shaderList.initialize();
            
        this.modelList=new ModelListClass(this);
        this.modelList.initialize();
        
            // title/dialogs (non game interface)
            
        this.title=new TitleClass(this,data);
        if (!(await this.title.initialize())) return;
        
        this.dialog=new DialogClass(this,data);
        if (!(await this.dialog.initialize())) return;
        
            // game and interface
            
        this.game=new GameClass(this,data);
        if (!(await this.game.initialize())) return;
        
        this.interface=new InterfaceClass(this);
        if (!(await this.interface.initialize())) return;
        
        this.music=new MusicClass(this);
        if (!this.music.initialize()) return;
        
            // create misc objects
            
        this.setup=new SetupClass();
        this.setup.load(this);      // requires game to be initialized, so we do this later
        
        this.settingsDialog=new DialogSettingsClass(this);
        this.connectDialog=new DialogConnectClass(this);
        this.developerDialog=new DialogDeveloperClass(this);
        
            // finally start the input
            
        this.input.startInput();
        
        return(true);
    }

    release()
    {
        this.music.release();
        this.interface.release();
        this.game.release();
        this.title.release();
        this.dialog.release();
        this.modelList.release();
        this.shaderList.release();
        this.soundList.release();
        this.bitmapList.release();
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
    
}
