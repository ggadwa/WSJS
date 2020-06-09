import MapClass from '../map/map.js';
import BitmapListClass from '../bitmap/bitmap_list.js';
import SoundListClass from '../sound/sound_list.js';
import ShaderListClass from '../shader/shader_list.js';
import ModelListClass from '../model/model_list.js';
import PointClass from '../utility/point.js';
import RectClass from '../utility/rect.js';
import PlaneClass from '../utility/plane.js';
import ColorClass from '../utility/color.js';
import QuaternionClass from '../utility/quaternion.js';
import Matrix4Class from '../utility/matrix4.js';
import Matrix3Class from '../utility/matrix3.js';
import GameClass from '../project/game.js';
import InterfaceClass from '../interface/interface.js';
import InputClass from '../main/input.js';
import CameraClass from '../main/camera.js';
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

            // the opengl context

        this.gl=null;
        this.canvas=null;
        
            // the cached objects
            // list, these are usually created by
            // name and loaded after all the imports
            
        this.bitmapList=null;
        this.soundList=null;
        this.shaderList=null;
        this.modelList=null;
        
            // the game and map
            
        this.game=null;
        this.map=null;
        
            // input
            
        this.input=new InputClass(this);
        this.input.initialize();
        
            // networking
            
        this.isMultiplayer=false;
        this.network=new NetworkClass(this);
        
            // pause flag
            
        this.paused=true;
        
            // the core setup

        this.wid=0;
        this.high=0;
        this.aspect=0.0;
        this.lookAtUpVector=new PointClass(0.0,-1.0,0.0);

        this.eyePos=new PointClass(0.0,0.0,0.0);
        
        this.cameraShakeStartTick=-1;
        this.cameraShakeTick=0;
        this.cameraShakeShift=0;

            // the gl matrixes

        this.perspectiveMatrix=new Matrix4Class();
        this.viewMatrix=new Matrix4Class();
        this.orthoMatrix=new Matrix4Class();
        
        this.cameraSpaceEyePos=new PointClass(0,0,0);
        this.cameraSpacePos=new PointClass(0,0,0);
        this.cameraSpaceViewMatrix=new Matrix4Class();

        this.eyeRotMatrix=new Matrix4Class();
        this.eyeRotMatrix2=new Matrix4Class();
        this.billboardMatrix=new Matrix4Class();

            // view lighting

        this.lights=[];

            // frustum planes

        this.clipPlane=new Float32Array(16);            // global to avoid GCd

        this.frustumLeftPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumRightPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumTopPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumBottomPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumNearPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumFarPlane=new PlaneClass(0.0,0.0,0.0,0.0);

            // additional core classes

        this.text=null;
        this.interface=null;
        this.camera=null;

        this.setup=null;
        this.settingsDialog=null;
        this.connectDialog=null;
        this.developerDialog=null;

            // main loop

        this.timestamp=0;
        this.lastTimestamp=Math.trunc(window.performance.now());

        this.loopCancel=false;
        
        this.physicsTick=0;
        this.lastPhysicTimestamp=0;
        this.drawTick=0;
        this.lastDrawTimestamp=0;
        
            // triggers
            
        this.triggers=new Map();
        
            // random numbers
            
        this.mwcW=0;
        this.mwcZ=0;

            // stats

        this.fps=0.0;
        this.fpsTotal=0;
        this.fpsCount=0;
        this.fpsStartTimestamp=0;

            // loading screen

        this.loadingStrings=[];
        this.loadingLastAddMsec=0;
        
        Object.seal(this);
    }
    
        //
        // canvas
        //

    createCanvas()
    {
        let lft,top,wid,high;
        let margin=0;
        
            // canvas position
            
        wid=window.innerWidth-margin;
        high=Math.trunc((wid*9)/16);
        
        if (high>(window.innerHeight-margin)) {
            high=window.innerHeight-margin;
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
    }
    
    canvasRightClickCancel(event)
    {
        event.preventDefault();
        return(false);
    }
    
        //
        // initialize and release
        //
    
    async initialize(data)
    {
        let glOptions={
            alpha:false,
            depth:true,
            stencil:false,
            antialias:false,
            premultipliedAlpha:false,
            desynchronized:true,
            preserveDrawingBuffer:true,
            failIfMajorPerformanceCaveat:false
        }; 

            // get the gl context

        this.gl=this.canvas.getContext("webgl2",glOptions);
        if (this.gl===null) {
            alert('WebGL2 not available, try a newer browser');
            return;
        }
        
            // some initial setups

        this.gl.viewport(0,0,this.canvas.width,this.canvas.height);

        this.gl.clearColor(0.0,0.0,0.0,1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
         
            // cache some values

        this.wid=this.canvas.width;
        this.high=this.canvas.height;
        this.aspect=this.canvas.width/this.canvas.height;
        
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
        
            // game and interface
            
        this.game=new GameClass(this,data);
        if (!(await this.game.initialize())) return;
        
        this.interface=new InterfaceClass(this);
        if (!this.interface.initialize()) return;
        
            // create misc objects
            
        this.camera=new CameraClass(this);
        
        this.setup=new SetupClass();
        this.setup.load(this);      // requires game to be initialized, so we do this later
        
        this.settingsDialog=new DialogSettingsClass(this);
        this.connectDialog=new DialogConnectClass(this);
        this.developerDialog=new DialogDeveloperClass(this);
    }

    release()
    {
        this.interface.release();
        this.game.release();
        this.modelList.release();
        this.shaderList.release();
        this.soundList.release();
        this.bitmapList.release();
    }
    
        //
        // load the shaders
        //
        
    async loadShaders(callback)
    {
        return(await this.shaderList.loadShaders(callback));
    }
    
        //
        // timing utilities
        //
        
    getPeriodicCos(millisecondPeriod,amplitude)
    {
        let freq=((this.timestamp%millisecondPeriod)/millisecondPeriod)*(Math.PI*2);
        return(Math.trunc(Math.cos(freq)*amplitude));
    }
    
    getPeriodicSin(millisecondPeriod,amplitude)
    {
        let freq=((this.timestamp%millisecondPeriod)/millisecondPeriod)*(Math.PI*2);
        return(Math.trunc(Math.sin(freq)*amplitude));
    }
    
    getPeriodicLinear(millisecondPeriod,amplitude)
    {
        return(((this.timestamp%millisecondPeriod)/millisecondPeriod)*amplitude);
    }
    
        //
        // triggers
        //
        
    setTrigger(triggerName)
    {
        if (triggerName!==null) this.triggers.set(triggerName,true);
    }
    
    clearTrigger(triggerName)
    {
        if (triggerName!==null) this.triggers.set(triggerName,false);
    }
    
    checkTrigger(triggerName)
    {
        let value=this.triggers.get(triggerName);
        return((value===null)?false:value);
    }
    
        //
        // pause state
        //
    
    setPauseState(pause,initState)
    {
        let isNetworkGame;
        
            // set the state

        this.paused=pause;
        
            // if unpausing, reset the last timestamp
         
        if (!pause) this.lastTimestamp=Math.trunc(window.performance.now());
        
            // if we are leaving pause, turn
            // off pause window
            
        if (!pause) {
            if (!this.game.developer.on) {
                this.settingsDialog.close();
            }
            else {
                this.developerDialog.close();
            }
        }
        
            // if this is the init state, then we
            // start the stamps at 0
        
        if (initState) {
            this.lastPhysicTimestamp=0;
            this.lastDrawTimestamp=0;
        }

            // start the fps over again
            
        this.fps=0.0;
        this.fpsTotal=0;
        this.fpsCount=0;
        this.fpsStartTimestamp=-1;
        
            // always draw once if we
            // are going into a pause
            // we don't need to do this if multiplayer because that
            // doesn't pause drawing
            
        isNetworkGame=(this.isMultiplayer) && (!this.setup.localGame);
        if ((pause) && (!isNetworkGame)) this.draw();
        
            // turn on/off the input
        
        if (pause) {    
            this.input.stopInput();
        }
        else {
            this.input.startInput();
        }
        
            // suspend/resume the sound
            
        if (pause) {
            if (isNetworkGame) this.soundList.stopAll();
            this.soundList.suspend();
        }
        else {
            this.soundList.resume();
        }
        
            // if going into pause, open the settings
            
        if (pause) {
            if (!this.game.developer.on) {
                this.settingsDialog.open();
            }
            else {
                this.developerDialog.open();
            }
        }
    }
    
        //
        // camera shaking
        //
        
    startCameraShake(shakeTick,shakeShift)
    {
        this.cameraShakeStartTick=this.timestamp;
        this.cameraShakeTick=shakeTick;
        this.cameraShakeShift=shakeShift;
    }
    
    runCameraShake()
    {
        let tick,shakeSize;
        
        if (this.cameraShakeStartTick===-1) return;
        
            // time to end shake?
            
        tick=this.timestamp-this.cameraShakeStartTick;
        if (tick>this.cameraShakeTick) {
            this.cameraShakeStartTick=-1;
            return;
        }
        
            // shake camera
         
        shakeSize=this.cameraShakeShift*(1.0-(tick/this.cameraShakeTick));
        this.eyePos.x+=Math.trunc(Math.random()*shakeSize);
        this.eyePos.y+=Math.trunc(Math.random()*shakeSize);
        this.eyePos.z+=Math.trunc(Math.random()*shakeSize);
    }
    
        //
        // convert coordinate to eye coordinates
        //
    
    convertToEyeCoordinates(pnt,eyePnt)
    {
        eyePnt.x=(pnt.x*this.viewMatrix.data[0])+(pnt.y*this.viewMatrix.data[4])+(pnt.z*this.viewMatrix.data[8])+this.viewMatrix.data[12];
        eyePnt.y=(pnt.x*this.viewMatrix.data[1])+(pnt.y*this.viewMatrix.data[5])+(pnt.z*this.viewMatrix.data[9])+this.viewMatrix.data[13];
        eyePnt.z=(pnt.x*this.viewMatrix.data[2])+(pnt.y*this.viewMatrix.data[6])+(pnt.z*this.viewMatrix.data[10])+this.viewMatrix.data[14];
    }
    
        //
        // draw view
        //

    draw()
    {
        let n;
        let light;
        let player=this.map.entityList.getPlayer();
        let developerOn=this.game.developer.on;
         
            // everything overdraws except
            // clear the depth buffer
            
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        
            // if in developer, clear the background
            // because we can float outside maps without
            // skies
          
        if (developerOn) {
            this.gl.clearColor(0.5,0.5,1,0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }
        
            // setup the view camera based on
            // the camera settings and the camera entity
            
        if (!developerOn) {
            this.camera.setup(player);
        }
        else {
            this.camera.setupDeveloper();
        }
        
            // create the perspective matrix
            // note this function has a translate in it for NEAR_Z

        this.perspectiveMatrix.setPerspectiveMatrix(this.camera.glFOV,this.aspect,this.camera.glNearZ,this.camera.glFarZ);

            // the eye point is -this.camera.glNearZ behind
            // the player

        this.eyePos.setFromValues(0,0,-this.camera.glNearZ);
        this.eyeRotMatrix.setTranslationFromPoint(this.camera.position);
        this.eyeRotMatrix2.setRotationFromYAngle(this.camera.angle.y);
        this.eyeRotMatrix.multiply(this.eyeRotMatrix2);
        this.eyeRotMatrix2.setRotationFromXAngle(this.camera.angle.x);
        this.eyeRotMatrix.multiply(this.eyeRotMatrix2);
        this.eyePos.matrixMultiply(this.eyeRotMatrix);
        
        this.runCameraShake();

            // setup the look at

        this.viewMatrix.setLookAtMatrix(this.eyePos,this.camera.position,this.lookAtUpVector);
        
            // camera space view matrix
            // (for things like weapons)
            
        this.cameraSpaceEyePos=new PointClass(0,0,-this.camera.glNearZ);
        this.cameraSpacePos=new PointClass(0,0,0);
        this.cameraSpaceViewMatrix.setLookAtMatrix(this.cameraSpaceEyePos,this.cameraSpacePos,this.lookAtUpVector);

            // the 2D ortho matrix

        this.orthoMatrix.setOrthoMatrix(this.wid,this.high,-1.0,1.0);
        
            // build the billboarding matrixes
            // mostly used for particles
            
        this.billboardMatrix.setRotationFromYAngle(this.camera.angle.y);
        this.eyeRotMatrix.setRotationFromXAngle(this.camera.angle.x);
        this.billboardMatrix.multiply(this.eyeRotMatrix);

            // build the culling frustum

        this.buildCullingFrustum();
        
            // run the effect draw setups first
            // so lighting positions are set
            
        this.map.effectList.drawSetup();
        
            // convert view lights to shader lights
            // all lights need a eye coordinate, so calc
            // that here
            
        this.lights=[];

        this.map.lightList.addLightsToViewLights();
        this.map.effectList.addLightsToViewLights();
        this.map.lightList.addLightsToViewLightsAmbients();     // there is a special ambient flag, which always gets into the list
        
            // fill in any missing lights with NULL

        while (this.lights.length<this.MAX_LIGHT_COUNT) {
            this.lights.push(null);
        }
        
            // and create light eye cordinates

        for (n=0;n!==this.MAX_LIGHT_COUNT;n++) {
            light=this.lights[n];
            if (light!==null) this.convertToEyeCoordinates(light.position,light.eyePosition);
        }
        
            // draw the map
            
        if (!developerOn) {
            this.map.background.draw();
            this.map.sky.draw();
            this.map.meshList.drawMap();
            if (this.map.hasShadowmap) this.map.meshList.drawMapShadow();
        }
        else {
            switch (this.game.developer.drawMode) {
                case this.game.developer.DRAW_MODE_NORMAL:
                    this.map.meshList.drawMap();
                    break;
                case this.game.developer.DRAW_MODE_SHADOW:
                    this.map.meshList.drawMapShadow();
                    break;
                case this.game.developer.DRAW_MODE_COLLISION:
                    this.map.meshList.drawCollisionSurfaces();
                    break;
            }
        }
        
            // draw any non held entities
            
        this.map.entityList.draw(null);
        
            // liquids
            
        this.map.liquidList.draw();
        
            // effects
            
        this.map.effectList.draw();
        if (developerOn) this.map.lightList.draw();
        
            // and finally held entities,
            // clearing the z buffer first
            // (skip this if in developer)
            
        if (!developerOn) {
            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
            this.map.entityList.draw(player);
        }
        
            // path and ray developer
            
        if (developerOn) {
            this.map.path.drawPath();
            this.game.developer.developerRay.draw();
        }
        
            // interface
            
        this.interface.draw();
    }
    
        //
        // loading screen
        //
    
    loadingScreenClear()
    {
        this.loadingStrings=[];
    }
    
    loadingScreenAddString(str)
    {
        this.loadingStrings.push(str);
        
        this.loadingLastAddMsec=Date.now();
    }
    
    loadingScreenUpdate()
    {
        let msec;
        let idx=this.loadingStrings.length-1;
        if (idx<0) return;
        
        msec=Date.now()-this.loadingLastAddMsec;
        
        this.loadingStrings[idx]+=(' ['+msec+'ms]');
        
        console.info(this.loadingStrings[idx]);      // supergumba -- temporary for optimization testing
    }
    
    loadingScreenDraw()
    {
            // the 2D ortho matrix

        this.orthoMatrix.setOrthoMatrix(this.wid,this.high,-1.0,1.0);
        
            // clear to black
            
        this.gl.clearColor(0.0,0.0,0.0,1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT,this.gl.DEPTH_BUFFER_BIT);
        
            // debug console
            
        this.interface.drawDebugConsole(this.loadingStrings);
    }
    
        //
        // view frustum culling
        //

    buildCullingFrustum()
    {
            // combine the matrixes
            // to build the frustum
            // ABCD planes equations

        this.clipPlane[0]=(this.viewMatrix.data[0]*this.perspectiveMatrix.data[0])+(this.viewMatrix.data[1]*this.perspectiveMatrix.data[4])+(this.viewMatrix.data[2]*this.perspectiveMatrix.data[8])+(this.viewMatrix.data[3]*this.perspectiveMatrix.data[12]);
        this.clipPlane[1]=(this.viewMatrix.data[0]*this.perspectiveMatrix.data[1])+(this.viewMatrix.data[1]*this.perspectiveMatrix.data[5])+(this.viewMatrix.data[2]*this.perspectiveMatrix.data[9])+(this.viewMatrix.data[3]*this.perspectiveMatrix.data[13]);
        this.clipPlane[2]=(this.viewMatrix.data[0]*this.perspectiveMatrix.data[2])+(this.viewMatrix.data[1]*this.perspectiveMatrix.data[6])+(this.viewMatrix.data[2]*this.perspectiveMatrix.data[10])+(this.viewMatrix.data[3]*this.perspectiveMatrix.data[14]);
        this.clipPlane[3]=(this.viewMatrix.data[0]*this.perspectiveMatrix.data[3])+(this.viewMatrix.data[1]*this.perspectiveMatrix.data[7])+(this.viewMatrix.data[2]*this.perspectiveMatrix.data[11])+(this.viewMatrix.data[3]*this.perspectiveMatrix.data[15]);

        this.clipPlane[4]=(this.viewMatrix.data[4]*this.perspectiveMatrix.data[0])+(this.viewMatrix.data[5]*this.perspectiveMatrix.data[4])+(this.viewMatrix.data[6]*this.perspectiveMatrix.data[8])+(this.viewMatrix.data[7]*this.perspectiveMatrix.data[12]);
        this.clipPlane[5]=(this.viewMatrix.data[4]*this.perspectiveMatrix.data[1])+(this.viewMatrix.data[5]*this.perspectiveMatrix.data[5])+(this.viewMatrix.data[6]*this.perspectiveMatrix.data[9])+(this.viewMatrix.data[7]*this.perspectiveMatrix.data[13]);
        this.clipPlane[6]=(this.viewMatrix.data[4]*this.perspectiveMatrix.data[2])+(this.viewMatrix.data[5]*this.perspectiveMatrix.data[6])+(this.viewMatrix.data[6]*this.perspectiveMatrix.data[10])+(this.viewMatrix.data[7]*this.perspectiveMatrix.data[14]);
        this.clipPlane[7]=(this.viewMatrix.data[4]*this.perspectiveMatrix.data[3])+(this.viewMatrix.data[5]*this.perspectiveMatrix.data[7])+(this.viewMatrix.data[6]*this.perspectiveMatrix.data[11])+(this.viewMatrix.data[7]*this.perspectiveMatrix.data[15]);

        this.clipPlane[8]=(this.viewMatrix.data[8]*this.perspectiveMatrix.data[0])+(this.viewMatrix.data[9]*this.perspectiveMatrix.data[4])+(this.viewMatrix.data[10]*this.perspectiveMatrix.data[8])+(this.viewMatrix.data[11]*this.perspectiveMatrix.data[12]);
        this.clipPlane[9]=(this.viewMatrix.data[8]*this.perspectiveMatrix.data[1])+(this.viewMatrix.data[9]*this.perspectiveMatrix.data[5])+(this.viewMatrix.data[10]*this.perspectiveMatrix.data[9])+(this.viewMatrix.data[11]*this.perspectiveMatrix.data[13]);
        this.clipPlane[10]=(this.viewMatrix.data[8]*this.perspectiveMatrix.data[2])+(this.viewMatrix.data[9]*this.perspectiveMatrix.data[6])+(this.viewMatrix.data[10]*this.perspectiveMatrix.data[10])+(this.viewMatrix.data[11]*this.perspectiveMatrix.data[14]);
        this.clipPlane[11]=(this.viewMatrix.data[8]*this.perspectiveMatrix.data[3])+(this.viewMatrix.data[9]*this.perspectiveMatrix.data[7])+(this.viewMatrix.data[10]*this.perspectiveMatrix.data[11])+(this.viewMatrix.data[11]*this.perspectiveMatrix.data[15]);

        this.clipPlane[12]=(this.viewMatrix.data[12]*this.perspectiveMatrix.data[0])+(this.viewMatrix.data[13]*this.perspectiveMatrix.data[4])+(this.viewMatrix.data[14]*this.perspectiveMatrix.data[8])+(this.viewMatrix.data[15]*this.perspectiveMatrix.data[12]);
        this.clipPlane[13]=(this.viewMatrix.data[12]*this.perspectiveMatrix.data[1])+(this.viewMatrix.data[13]*this.perspectiveMatrix.data[5])+(this.viewMatrix.data[14]*this.perspectiveMatrix.data[9])+(this.viewMatrix.data[15]*this.perspectiveMatrix.data[13]);
        this.clipPlane[14]=(this.viewMatrix.data[12]*this.perspectiveMatrix.data[2])+(this.viewMatrix.data[13]*this.perspectiveMatrix.data[6])+(this.viewMatrix.data[14]*this.perspectiveMatrix.data[10])+(this.viewMatrix.data[15]*this.perspectiveMatrix.data[14]);
        this.clipPlane[15]=(this.viewMatrix.data[12]*this.perspectiveMatrix.data[3])+(this.viewMatrix.data[13]*this.perspectiveMatrix.data[7])+(this.viewMatrix.data[14]*this.perspectiveMatrix.data[11])+(this.viewMatrix.data[15]*this.perspectiveMatrix.data[15]);

                // left plane

        this.frustumLeftPlane.a=this.clipPlane[3]+this.clipPlane[0];
        this.frustumLeftPlane.b=this.clipPlane[7]+this.clipPlane[4];
        this.frustumLeftPlane.c=this.clipPlane[11]+this.clipPlane[8];
        this.frustumLeftPlane.d=this.clipPlane[15]+this.clipPlane[12];
        this.frustumLeftPlane.normalize();

                // right plane

        this.frustumRightPlane.a=this.clipPlane[3]-this.clipPlane[0];
        this.frustumRightPlane.b=this.clipPlane[7]-this.clipPlane[4];
        this.frustumRightPlane.c=this.clipPlane[11]-this.clipPlane[8];
        this.frustumRightPlane.d=this.clipPlane[15]-this.clipPlane[12];
        this.frustumRightPlane.normalize();

                // top plane

        this.frustumTopPlane.a=this.clipPlane[3]-this.clipPlane[1];
        this.frustumTopPlane.b=this.clipPlane[7]-this.clipPlane[5];
        this.frustumTopPlane.c=this.clipPlane[11]-this.clipPlane[9];
        this.frustumTopPlane.d=this.clipPlane[15]-this.clipPlane[13];
        this.frustumTopPlane.normalize();

                // bottom plane

        this.frustumBottomPlane.a=this.clipPlane[3]+this.clipPlane[1];
        this.frustumBottomPlane.b=this.clipPlane[7]+this.clipPlane[5];
        this.frustumBottomPlane.c=this.clipPlane[11]+this.clipPlane[9];
        this.frustumBottomPlane.d=this.clipPlane[15]+this.clipPlane[13];
        this.frustumBottomPlane.normalize();

                // near plane

        this.frustumNearPlane.a=this.clipPlane[3]+this.clipPlane[2];
        this.frustumNearPlane.b=this.clipPlane[7]+this.clipPlane[6];
        this.frustumNearPlane.c=this.clipPlane[11]+this.clipPlane[10];
        this.frustumNearPlane.d=this.clipPlane[15]+this.clipPlane[14];
        this.frustumNearPlane.normalize();

                // far plane

        this.frustumFarPlane.a=this.clipPlane[3]-this.clipPlane[2];
        this.frustumFarPlane.b=this.clipPlane[7]-this.clipPlane[6];
        this.frustumFarPlane.c=this.clipPlane[11]-this.clipPlane[10];
        this.frustumFarPlane.d=this.clipPlane[15]-this.clipPlane[14];
        this.frustumFarPlane.normalize();
    }

    boundBoxInFrustum(xBound,yBound,zBound)
    {
            // check if outside the plane, if it is,
            // then it's considered outside the bounds

        if (!this.frustumLeftPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);
        if (!this.frustumRightPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);
        if (!this.frustumTopPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);
        if (!this.frustumBottomPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);
        if (!this.frustumNearPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);
        if (!this.frustumFarPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);

            // otherwise considered within the frustum planes

        return(true);
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
