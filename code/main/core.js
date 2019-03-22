import * as constants from '../main/constants.js';
import config from '../main/config.js';
import MapClass from '../map/map.js';
import BitmapListClass from '../bitmap/bitmap_list.js';
import SoundListClass from '../sound/sound_list.js';
import ShaderListClass from '../shader/shader_list.js';
import ModelListClass from '../model/model_list.js';
import PointClass from '../utility/point.js';
import RectClass from '../utility/rect.js';
import PlaneClass from '../utility/plane.js';
import ColorClass from '../utility/color.js';
import QuaternionClass from '../../code/utility/quaternion.js';
import Matrix4Class from '../utility/matrix4.js';
import Matrix3Class from '../utility/matrix3.js';
import InputClass from '../main/input.js';
import CameraClass from '../main/camera.js';
import InterfaceClass from '../interface/interface.js';

//
// core class
//

export default class CoreClass
{
    static MAX_LIGHT_COUNT=24;
   
    constructor()
    {
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
        
            // the current map
            
        this.map=new MapClass(this);
        
            // the project game and map
            
        this.projectGame=null;
        this.projectMap=null;
        
            // input
            
        this.input=new InputClass(this);
        
            // pause flag
            
        this.paused=true;
        
            // the core setup

        this.OPENGL_FOV=55.0;
        this.OPENGL_NEAR_Z=500;
        this.OPENGL_FAR_Z=300000;

        this.wid=0;
        this.high=0;
        this.aspect=0.0;
        this.lookAtUpVector=new PointClass(0.0,-1.0,0.0);

        this.eyePos=new PointClass(0.0,0.0,0.0);

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

        this.ambient={"r":1.0,"g":1.0,"b":1.0};
        
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

            // main loop

        this.timestamp=0;
        this.physicsTick=0;
        this.drawTick=0;

        this.loopCancel=false;
        
        this.lastPhysicTimestamp=0;
        this.lastPhysicTimestampPauseOffset=0;
        this.lastDrawTimestamp=0;
        this.lastDrawTimestampPauseOffset=0;

            // stats

        this.fps=0.0;
        this.fpsTotal=0;
        this.fpsCount=0;
        this.fpsStartTimestamp=0;

        this.drawMeshCount=0;
        this.drawTrigCount=0;
        this.drawModelCount=0;
        
            // tinting
            
        this.uiTintRect=new RectClass(0,0,0,0);
        this.uiTintColor=new ColorClass(1.0,0.0,0.0);

            // loading screen

        this.loadingStrings=[];
        this.loadingLastAddMsec=0;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
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
        this.canvas.width=wid;
        this.canvas.height=high;
        
        document.body.appendChild(this.canvas);
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
            // get the gl context

        this.gl=this.canvas.getContext("webgl2",constants.GL_OPTIONS);
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
        
            // create needed objects
            
        this.interface=new InterfaceClass(this);
        this.camera=new CameraClass();

            // interface object

        if (!this.interface.initialize()) return;
        
            // setup some interface positions
        
        this.uiTintRect.setFromValues(0,0,this.wid,this.high);
    }

    release()
    {
        this.interface.release();
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
        // pause state
        //
    
    setPauseState(pause,initState)
    {
        let timestamp;
        
            // set the state

        this.paused=pause;
        
            // current timestamp
            
        timestamp=Math.trunc(window.performance.now());
        
            // if going into pause, we need
            // to remember the time stamp offsets
            // so they can be restored
        
        if (initState) {
            this.lastPhysicTimestampPauseOffset=0;
            this.lastDrawTimestampPauseOffset=0;
        }
        else {
            if (pause) {
                this.lastPhysicTimestampPauseOffset=timestamp-this.lastPhysicTimestamp;
                this.lastDrawTimestampPauseOffset=timestamp-this.lastDrawTimestamp;
            }
        }
        
            // reset the timing to this timestamp
            
        this.timestamp=timestamp;

        this.lastPhysicTimestamp=timestamp+this.lastPhysicTimestampPauseOffset;
        this.lastDrawTimestamp=timestamp+this.lastDrawTimestampPauseOffset;

            // start the fps over again
            
        this.fps=0.0;
        this.fpsTotal=0;
        this.fpsCount=0;
        this.fpsStartTimestamp=timestamp;
    }
    
        //
        // convert coordinate to eye coordinates
        //
    
    convertToEyeCoordinates(pt,eyePt)
    {
        eyePt.x=(pt.x*this.viewMatrix.data[0])+(pt.y*this.viewMatrix.data[4])+(pt.z*this.viewMatrix.data[8])+this.viewMatrix.data[12];
        eyePt.y=(pt.x*this.viewMatrix.data[1])+(pt.y*this.viewMatrix.data[5])+(pt.z*this.viewMatrix.data[9])+this.viewMatrix.data[13];
        eyePt.z=(pt.x*this.viewMatrix.data[2])+(pt.y*this.viewMatrix.data[6])+(pt.z*this.viewMatrix.data[10])+this.viewMatrix.data[14];
    }
    
        //
        // draw view
        //

    draw()
    {
        let n;
        let light,tintOn,tintAtt,liquidIdx,liquid;
        let fpsStr,idx;
        let player=this.map.entityList.getPlayer();
         
            // everything overdraws except
            // clear the depth buffer
            
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        
            // setup the view camera to be
            // equal to player object
            
        this.camera.setToEntity(player,player.eyeOffset);

            // create the perspective matrix
            // note this function has a translate in it for NEAR_Z

        this.perspectiveMatrix.setPerspectiveMatrix(this.OPENGL_FOV,this.aspect,this.OPENGL_NEAR_Z,this.OPENGL_FAR_Z);

            // the eye point is -this.OPENGL_NEAR_Z behind
            // the player

        this.eyePos.setFromValues(0,0,-this.OPENGL_NEAR_Z);
        this.eyeRotMatrix.setTranslationFromPoint(this.camera.position);
        this.eyeRotMatrix2.setRotationFromYAngle(this.camera.angle.y);
        this.eyeRotMatrix.multiply(this.eyeRotMatrix2);
        this.eyeRotMatrix2.setRotationFromXAngle(this.camera.angle.x);
        this.eyeRotMatrix.multiply(this.eyeRotMatrix2);
        this.eyePos.matrixMultiply(this.eyeRotMatrix);

            // setup the look at

        this.viewMatrix.setLookAtMatrix(this.eyePos,this.camera.position,this.lookAtUpVector);
        
            // camera space view matrix
            // (for things like weapons)
            
        this.cameraSpaceEyePos=new PointClass(0,0,-this.OPENGL_NEAR_Z);
        this.cameraSpacePos=new PointClass(0,0,0);
        this.cameraSpaceViewMatrix.setLookAtMatrix(this.cameraSpaceEyePos,this.cameraSpacePos,this.lookAtUpVector);

            // the 2D ortho matrix

        this.orthoMatrix.setOrthoMatrix(this.wid,this.high,-1.0,1.0);
        
            // build the billboarding matrixes
            // mostly used for particles
            
        this.billboardMatrix.setRotationFromYAngle(this.camera.angle.y);
        this.eyeRotMatrix.setRotationFromXAngle(this.camera.angle.x);
        this.billboardMatrix.multiply(this.eyeRotMatrix);
        
            // convert view lights to shader lights
            // all lights need a eye coordinate, so calc
            // that here
            
        this.lights=[];

        this.map.lightList.addLightsToViewLights();
        this.map.effectList.addLightsToViewLights();
        
            // fill in any missing lights with NULL

        while (this.lights.length<CoreClass.MAX_LIGHT_COUNT) {
            this.lights.push(null);
        }
        
            // and finally do any light running
            // and make the eye coordinate

        for (n=0;n!==CoreClass.MAX_LIGHT_COUNT;n++) {
            light=this.lights[n];
            if (light!==null) {
                light.run(this.timestamp);
                this.convertToEyeCoordinates(light.position,light.eyePosition);
            }
        }

            // build the culling frustum

        this.buildCullingFrustum();
        
            // reset some stats
            
        this.drawMeshCount=0;
        this.drawTrigCount=0;
        this.drawModelCount=0;
        
            // draw the sky and map
            
        this.map.sky.draw();
        if (!config.DRAW_COLLISION_PLANES) {
            this.map.meshList.draw(null);
        }
        else {
            this.map.meshList.debugDrawCollisionSurfaces();
        }
        
            // path debugging
            
        if (config.DRAW_PATHS) this.map.path.debugDrawPath();
        
            // draw any non held entities
            
        this.map.entityList.draw(null);
        
            // any liquids
            
        if (!config.DRAW_COLLISION_PLANES) this.map.liquidList.draw();
        
            // any effects
            
        this.map.effectList.draw();
        
            // and finally held entities,
            // clearing the z buffer first
            
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        this.map.entityList.draw(player);

            // setup any tinting
        
        tintOn=false;
        this.uiTintColor.setFromValues(0.0,0.0,0.0);
        
        tintAtt=player.getDamageTintAttenuation();
        if (tintAtt!==0.0) {
            tintOn=true;
            this.uiTintColor.addFromValues(tintAtt,0.0,0.0);
        }
        liquidIdx=player.getUnderLiquidIndex();
        if (liquidIdx!==-1) {
            tintOn=true;
            liquid=this.map.liquidList.liquids[liquidIdx];
            this.uiTintColor.addFromValues(liquid.tint.r,liquid.tint.g,liquid.tint.b);
        }
        
            // any tints
            
        if (tintOn) {
            this.uiTintColor.fixOverflow();
            //this.interface.drawRect(this.uiTintRect,this.uiTintColor,0.5);
        }
        
            // interface
            
        this.interface.draw();
        if (this.paused) this.interface.drawPauseMessage();
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
        
        console.log(this.loadingStrings[idx]);      // supergumba -- temporary for optimization testing
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
    
}
