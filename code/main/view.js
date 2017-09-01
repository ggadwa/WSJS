import * as constants from '../../code/main/constants.js';
import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';
import RectClass from '../../code/utility/rect.js';
import PlaneClass from '../../code/utility/plane.js';
import ColorClass from '../../code/utility/color.js';
import ViewCameraClass from '../../code/main/view_camera.js';
import TextClass from '../../code/text/text.js';
import InterfaceClass from '../../code/interface/interface.js';

//
// view class
//

export default class ViewClass
{
    constructor(fileCache)
    {
        this.fileCache=fileCache;
        
            // the opengl context

        this.gl=null;
        this.canvas=null;
        
            // pause flag
            
        this.paused=true;
        
            // the view setup

        this.OPENGL_FOV=55.0;
        this.OPENGL_NEAR_Z=500;
        this.OPENGL_FAR_Z=300000;

        this.VIEW_NORMAL_CULL_LIMIT=0.3;

        this.wid=0;
        this.high=0;
        this.aspect=0.0;
        this.lookAtUpVector=new PointClass(0.0,1.0,0.0);

        this.eyePos=new PointClass(0.0,0.0,0.0);

            // the gl matrixes

        this.perspectiveMatrix=new Float32Array(16);
        this.modelMatrix=new Float32Array(16);
        this.normalMatrixTemp=new Float32Array(16);         // global to eliminate GCd
        this.normalMatrix=new Float32Array(9);
        this.orthoMatrix=new Float32Array(16);

            // billboarding matrixes

        this.billboardXMatrix=new Float32Array(16);
        this.billboardYMatrix=new Float32Array(16);

            // overlay drawing

        this.drawOverlay=config.SHOW_OVERLAY_MAP;

            // view lighting

        this.ambient=new ColorClass(0.0,0.0,0.0);

        this.MAX_LIGHT_COUNT=24;
        this.lights=[];
        
        this.glowFactor=0.0;

            // frustum planes

        this.clipPlane=new Float32Array(16);            // global to avoid GCd

        this.frustumLeftPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumRightPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumTopPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumBottomPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumNearPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumFarPlane=new PlaneClass(0.0,0.0,0.0,0.0);

            // additional view classes

        this.text=null;
        this.interface=null;
        this.camera=null;

            // main loop

        this.timeStamp=0;
        this.physicsTick=0;
        this.drawTick=0;

        this.loopCancel=false;
        
        this.lastPhysicTimeStamp=0;
        this.lastPhysicTimeStampPauseOffset=0;
        this.lastDrawTimeStamp=0;
        this.lastDrawTimeStampPauseOffset=0;

            // stats

        this.fps=0.0;
        this.fpsTotal=0;
        this.fpsCount=0;
        this.fpsStartTimeStamp=0;

        this.drawMeshCount=0;
        this.drawMeshTrigCount=0;
        this.drawModelCount=0;
        this.drawModelTrigCount=0;
        
            // health
        
        this.uiHealthHigh=0;
        this.uiHealthRect=new RectClass(0,0,0,0);
        this.uiHealthColor=new ColorClass(1.0,0.0,0.0);
        this.uiHealthFrameRect=new RectClass(0,0,0,0);
        this.uiHealthFrameColor=new ColorClass(1.0,1.0,1.0);
        this.uiHealthAlpha=0.7;
        
            // tinting
            
        this.uiTintRect=new RectClass(0,0,0,0);
        this.uiTintColor=new ColorClass(1.0,0.0,0.0);

            // loading screen

        this.loadingStrings=[];
        this.loadingLastAddMsec=0;
        this.loadingBarRect=new RectClass(0,0,0,0);
        this.loadingBarColor=new ColorClass(0.3,0.1,1.0);
        this.loadingBarFrameRect=new RectClass(0,0,0,0);
        this.loadingBarFrameColor=new ColorClass(1.0,1.0,1.0);
        
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
        let glOptions={
            alpha:false,
            depth:true,
            stencil:false,
            antialias:false,
            premultipliedAlpha:false,
            preserveDrawingBuffer:true,
            failIfMajorPerformanceCaveat:false
        };
        
            // get the gl context

        this.gl=this.canvas.getContext("webgl2",glOptions);
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
        
            // create needed objects
            
        this.text=new TextClass(this,this.fileCache);
        this.interface=new InterfaceClass(this,this.fileCache);
        this.camera=new ViewCameraClass();

            // initialize other drawing objects

        if (!this.text.initialize()) return(false);
        if (!this.interface.initialize()) return(false);
        
            // setup some interface positions
        
        this.loadingBarRect.setFromValues(5,(this.high-25),5,(this.high-5));
        this.loadingBarFrameRect.setFromValues(5,(this.high-25),(this.wid-5),(this.high-5));
        
        this.uiHealthHigh=Math.trunc(this.high*0.5)-10;
        this.uiHealthRect.setFromValues(5,(this.high-this.uiHealthHigh),25,(this.high-5));
        this.uiHealthFrameRect.setFromValues(5,((this.high-5)-this.uiHealthHigh),25,(this.high-5));
        
        this.uiTintRect.setFromValues(0,0,this.wid,this.high);

        return(true);
    }

    release()
    {
        this.text.release();
        this.interface.release();
    }
    
        //
        // pause state
        //
    
    setPauseState(pause,initState)
    {
        let timeStamp;
        
            // set the state

        this.paused=pause;
        
            // current timestamp
            
        timeStamp=Math.trunc(window.performance.now());
        
            // if going into pause, we need
            // to remember the time stamp offsets
            // so they can be restored
        
        if (initState) {
            this.lastPhysicTimeStampPauseOffset=0;
            this.lastDrawTimeStampPauseOffset=0;
        }
        else {
            if (pause) {
                this.lastPhysicTimeStampPauseOffset=timeStamp-this.lastPhysicTimeStamp;
                this.lastDrawTimeStampPauseOffset=timeStamp-this.lastDrawTimeStamp;
            }
        }
        
            // reset the timing to this timestamp
            
        this.timeStamp=timeStamp;

        this.lastPhysicTimeStamp=timeStamp+this.lastPhysicTimeStampPauseOffset;
        this.lastDrawTimeStamp=timeStamp+this.lastDrawTimeStampPauseOffset;

            // start the fps over again
            
        this.fps=0.0;
        this.fpsTotal=0;
        this.fpsCount=0;
        this.fpsStartTimeStamp=timeStamp;
    }
    
        //
        // interface controls
        //
        
    mapOverlayStateFlip()
    {
        this.drawOverlay=!this.drawOverlay;
    }
    
        //
        // convert coordinate to eye coordinates
        //
    
    convertToEyeCoordinates(pt,eyePt)
    {
        eyePt.x=(pt.x*this.modelMatrix[0])+(pt.y*this.modelMatrix[4])+(pt.z*this.modelMatrix[8])+this.modelMatrix[12];
        eyePt.y=(pt.x*this.modelMatrix[1])+(pt.y*this.modelMatrix[5])+(pt.z*this.modelMatrix[9])+this.modelMatrix[13];
        eyePt.z=(pt.x*this.modelMatrix[2])+(pt.y*this.modelMatrix[6])+(pt.z*this.modelMatrix[10])+this.modelMatrix[14];
    }
    
        //
        // build perspective and ortho matrix
        //

    buildPerspectiveMatrix()
    {
        let fov=1.0/Math.tan(this.OPENGL_FOV*0.5);
        let dist=1.0/(this.OPENGL_NEAR_Z-this.OPENGL_FAR_Z);
        
            // create the perspective matrix
            
        this.perspectiveMatrix[0]=fov/this.aspect;
        this.perspectiveMatrix[1]=0.0;
        this.perspectiveMatrix[2]=0.0;
        this.perspectiveMatrix[3]=0.0;
        this.perspectiveMatrix[4]=0.0;
        this.perspectiveMatrix[5]=fov;
        this.perspectiveMatrix[6]=0.0;
        this.perspectiveMatrix[7]=0.0;
        this.perspectiveMatrix[8]=0.0;
        this.perspectiveMatrix[9]=0.0;
        this.perspectiveMatrix[10]=(this.OPENGL_FAR_Z+this.OPENGL_NEAR_Z)*dist;
        this.perspectiveMatrix[11]=-1.0;
        this.perspectiveMatrix[12]=0.0;
        this.perspectiveMatrix[13]=0.0;
        this.perspectiveMatrix[14]=((this.OPENGL_FAR_Z*this.OPENGL_NEAR_Z)*2.0)*dist;
        this.perspectiveMatrix[15]=0.0;
        
            // now translate it for the near_z
                     
        this.perspectiveMatrix[12]+=(this.perspectiveMatrix[8]*this.OPENGL_NEAR_Z);
        this.perspectiveMatrix[13]+=(this.perspectiveMatrix[9]*this.OPENGL_NEAR_Z);
        this.perspectiveMatrix[14]+=(this.perspectiveMatrix[10]*this.OPENGL_NEAR_Z);
        this.perspectiveMatrix[15]+=(this.perspectiveMatrix[11]*this.OPENGL_NEAR_Z);
    }
    
    buildOrthoMatrix(nearZ,farZ)
    {
        let horz=1.0/this.wid;
        let vert=1.0/this.high;
        let dist=1.0/(nearZ-farZ);

        this.orthoMatrix[0]=horz*2.0;
        this.orthoMatrix[1]=0.0;
        this.orthoMatrix[2]=0.0;
        this.orthoMatrix[3]=0.0;
        this.orthoMatrix[4]=0.0;
        this.orthoMatrix[5]=vert*-2.0;
        this.orthoMatrix[6]=0.0;
        this.orthoMatrix[7]=0.0;
        this.orthoMatrix[8]=0.0;
        this.orthoMatrix[9]=0.0;
        this.orthoMatrix[10]=dist*2.0;
        this.orthoMatrix[11]=0.0;
        this.orthoMatrix[12]=-1.0; // this.wid*-horz;      // these will always equal these numbers,
        this.orthoMatrix[13]=1.0; // this.high*vert;     // but leave in the code for readability
        this.orthoMatrix[14]=(farZ+nearZ)*dist;
        this.orthoMatrix[15]=1.0;
    }
    
        //
        // build look at matrix
        //
     
    buildLookAtMatrix(centerPos)
    {
        let x0,x1,x2,y0,y1,y2,z0,z1,z2;
        let f;

        z0=this.eyePos.x-centerPos.x;
        z1=this.eyePos.y-centerPos.y;
        z2=this.eyePos.z-centerPos.z;

        f=Math.sqrt((z0*z0)+(z1*z1)+(z2*z2));
        f=1.0/f;
        z0*=f;
        z1*=f;
        z2*=f;

        x0=(this.lookAtUpVector.y*z2)-(this.lookAtUpVector.z*z1);
        x1=(this.lookAtUpVector.z*z0)-(this.lookAtUpVector.x*z2);
        x2=(this.lookAtUpVector.x*z1)-(this.lookAtUpVector.y*z0);
        
        f=Math.sqrt((x0*x0)+(x1*x1)+(x2*x2));
        if (f!==0.0) f=1.0/f;
        x0*=f;
        x1*=f;
        x2*=f;

        y0=(z1*x2)-(z2*x1);
        y1=(z2*x0)-(z0*x2);
        y2=(z0*x1)-(z1*x0);

        f=Math.sqrt((y0*y0)+(y1*y1)+(y2*y2));
        if (f!==0.0) f=1.0/f;
        y0*=f;
        y1*=f;
        y2*=f;

        this.modelMatrix[0]=x0;
        this.modelMatrix[1]=y0;
        this.modelMatrix[2]=z0;
        this.modelMatrix[3]=0.0;
        this.modelMatrix[4]=x1;
        this.modelMatrix[5]=y1;
        this.modelMatrix[6]=z1;
        this.modelMatrix[7]=0.0;
        this.modelMatrix[8]=x2;
        this.modelMatrix[9]=y2;
        this.modelMatrix[10]=z2;
        this.modelMatrix[11]=0.0;
        this.modelMatrix[12]=-((x0*this.eyePos.x)+(x1*this.eyePos.y)+(x2*this.eyePos.z));
        this.modelMatrix[13]=-((y0*this.eyePos.x)+(y1*this.eyePos.y)+(y2*this.eyePos.z));
        this.modelMatrix[14]=-((z0*this.eyePos.x)+(z1*this.eyePos.y)+(z2*this.eyePos.z));
        this.modelMatrix[15]=1.0;
    }
    
        //
        // create the normal matrix
        //
        
    buildNormalMatrix()
    {
            // the normal is the invert-transpose of the
            // model matrix put into a 3x3 matrix
        
            // create the inversion
            
        let m00=(this.modelMatrix[0]*this.modelMatrix[5])-(this.modelMatrix[1]*this.modelMatrix[4]);
        let m01=(this.modelMatrix[0]*this.modelMatrix[6])-(this.modelMatrix[2]*this.modelMatrix[4]);
        let m02=(this.modelMatrix[0]*this.modelMatrix[7])-(this.modelMatrix[3]*this.modelMatrix[4]);
        let m03=(this.modelMatrix[1]*this.modelMatrix[6])-(this.modelMatrix[2]*this.modelMatrix[5]);
        let m04=(this.modelMatrix[1]*this.modelMatrix[7])-(this.modelMatrix[3]*this.modelMatrix[5]);
        let m05=(this.modelMatrix[2]*this.modelMatrix[7])-(this.modelMatrix[3]*this.modelMatrix[6]);
        let m06=(this.modelMatrix[8]*this.modelMatrix[13])-(this.modelMatrix[9]*this.modelMatrix[12]);
        let m07=(this.modelMatrix[8]*this.modelMatrix[14])-(this.modelMatrix[10]*this.modelMatrix[12]);
        let m08=(this.modelMatrix[8]*this.modelMatrix[15])-(this.modelMatrix[11]*this.modelMatrix[12]);
        let m09=(this.modelMatrix[9]*this.modelMatrix[14])-(this.modelMatrix[10]*this.modelMatrix[13]);
        let m10=(this.modelMatrix[9]*this.modelMatrix[15])-(this.modelMatrix[11]*this.modelMatrix[13]);
        let m11=(this.modelMatrix[10]*this.modelMatrix[15])-(this.modelMatrix[11]*this.modelMatrix[14]);

        let det=(m00*m11)-(m01*m10)+(m02*m09)+(m03*m08)-(m04*m07)+(m05*m06);
        if (det!==0.0) det=1.0/det;

        this.normalMatrixTemp[0]=((this.modelMatrix[5]*m11)-(this.modelMatrix[6]*m10)+(this.modelMatrix[7]*m09))*det;
        this.normalMatrixTemp[1]=((this.modelMatrix[2]*m10)-(this.modelMatrix[1]*m11)-(this.modelMatrix[3]*m09))*det;
        this.normalMatrixTemp[2]=((this.modelMatrix[13]*m05)-(this.modelMatrix[14]*m04)+(this.modelMatrix[15]*m03))*det;
        this.normalMatrixTemp[3]=((this.modelMatrix[10]*m04)-(this.modelMatrix[9]*m05)-(this.modelMatrix[11]*m03))*det;
        this.normalMatrixTemp[4]=((this.modelMatrix[6]*m08)-(this.modelMatrix[4]*m11)-(this.modelMatrix[7]*m07))*det;
        this.normalMatrixTemp[5]=((this.modelMatrix[0]*m11)-(this.modelMatrix[2]*m08)+(this.modelMatrix[3]*m07))*det;
        this.normalMatrixTemp[6]=((this.modelMatrix[14]*m02)-(this.modelMatrix[12]*m05)-(this.modelMatrix[15]*m01))*det;
        this.normalMatrixTemp[7]=((this.modelMatrix[8]*m05)-(this.modelMatrix[10]*m02)+(this.modelMatrix[11]*m01))*det;
        this.normalMatrixTemp[8]=((this.modelMatrix[4]*m10)-(this.modelMatrix[5]*m08)+(this.modelMatrix[7]*m06))*det;
        this.normalMatrixTemp[9]=((this.modelMatrix[1]*m08)-(this.modelMatrix[0]*m10)-(this.modelMatrix[3]*m06))*det;
        this.normalMatrixTemp[10]=((this.modelMatrix[12]*m04)-(this.modelMatrix[13]*m02)+(this.modelMatrix[15]*m00))*det;
        this.normalMatrixTemp[11]=((this.modelMatrix[9]*m02)-(this.modelMatrix[8]*m04)-(this.modelMatrix[11]*m00))*det;
        this.normalMatrixTemp[12]=((this.modelMatrix[5]*m07)-(this.modelMatrix[4]*m09)-(this.modelMatrix[6]*m06))*det;
        this.normalMatrixTemp[13]=((this.modelMatrix[0]*m09)-(this.modelMatrix[1]*m07)+(this.modelMatrix[2]*m06))*det;
        this.normalMatrixTemp[14]=((this.modelMatrix[13]*m01)-(this.modelMatrix[12]*m03)-(this.modelMatrix[14]*m00))*det;
        this.normalMatrixTemp[15]=((this.modelMatrix[8]*m03)-(this.modelMatrix[9]*m01)+(this.modelMatrix[10]*m00))*det;
        
            // put int 3x3 matrix
            // we transpose this at the same time
            
        this.normalMatrix[0]=this.normalMatrixTemp[0];          // non-transposed these would be 0,1,2,4,5,6,8,9,10
        this.normalMatrix[1]=this.normalMatrixTemp[4];
        this.normalMatrix[2]=this.normalMatrixTemp[8];
        this.normalMatrix[3]=this.normalMatrixTemp[1];
        this.normalMatrix[4]=this.normalMatrixTemp[5];
        this.normalMatrix[5]=this.normalMatrixTemp[9];
        this.normalMatrix[6]=this.normalMatrixTemp[2];
        this.normalMatrix[7]=this.normalMatrixTemp[6];
        this.normalMatrix[8]=this.normalMatrixTemp[10];
    }
    
        //
        // billboarding matrixes
        //
        
    buildBillboardXMatrix(ang)
    {
        let rad;
        
            // identity
            // we can assume non-touched cells will always be 0
            
        this.billboardXMatrix[0]=1.0;
        this.billboardXMatrix[5]=1.0;
        this.billboardXMatrix[10]=1.0;
        this.billboardXMatrix[15]=1.0;

            // rotation
            
        rad=ang*constants.DEGREE_TO_RAD;
        
        this.billboardXMatrix[5]=this.billboardXMatrix[10]=Math.cos(rad);
        this.billboardXMatrix[6]=Math.sin(rad);
        this.billboardXMatrix[9]=-this.billboardXMatrix[6];
    }
    
    buildBillboardYMatrix(ang)
    {
        let rad;
        
            // identity
            // we can assume non-touched cells will always be 0
            
        this.billboardYMatrix[0]=1.0;
        this.billboardYMatrix[5]=1.0;
        this.billboardYMatrix[10]=1.0;
        this.billboardYMatrix[15]=1.0;

            // rotation
            
        rad=ang*constants.DEGREE_TO_RAD;
        
        this.billboardYMatrix[0]=this.billboardYMatrix[10]=Math.cos(rad);
        this.billboardYMatrix[8]=Math.sin(rad);
        this.billboardYMatrix[2]=-this.billboardYMatrix[8];
    }
    
        //
        // draw view
        //

    draw(map)
    {
        let n,nEntity,entity;
        let light,tintOn,tintAtt;
        let weapon;
        let fpsStr,idx;
        let player=map.entityList.getPlayer();
         
            // everything overdraws except
            // clear the depth buffer
            
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        
            // setup the view camera to be
            // equal to player object
            
        this.camera.setToEntity(player,player.eyeOffset);

            // create the perspective matrix
            // note this function has a translate in it for NEAR_Z

        this.buildPerspectiveMatrix();

            // get the eye point and rotate it
            // around the view position

        this.eyePos.setFromValues(this.camera.position.x,this.camera.position.y,(this.camera.position.z-this.OPENGL_NEAR_Z));
        this.eyePos.rotateX(this.camera.position,this.camera.angle.x);
        this.eyePos.rotateY(this.camera.position,this.camera.angle.y);

            // setup the look at

        this.buildLookAtMatrix(this.camera.position);

            // create the 3x3 normal matrix
            // the normal is the invert-transpose of the model matrix
            
        this.buildNormalMatrix();

            // the 2D ortho matrix

        this.buildOrthoMatrix(-1.0,1.0);
        
            // build the billboarding matrixes
            // mostly used for particles
            
        this.buildBillboardXMatrix(this.camera.angle.x);
        this.buildBillboardYMatrix(this.camera.angle.y);
        
            // convert view lights to shader lights
            // all lights need a eye coordinate, so calc
            // that here
            
        this.lights=[];

        map.lightList.addLightsToViewLights();
        map.particleList.addLightsToViewLights();
        
            // fill in any missing lights with NULL

        while (this.lights.length<this.MAX_LIGHT_COUNT) {
            this.lights.push(null);
        }
        
            // and finally make the eye coordinate

        for (n=0;n!==this.MAX_LIGHT_COUNT;n++) {
            light=this.lights[n];
            if (light!==null) this.convertToEyeCoordinates(light.position,light.eyePosition);
        }

            // build the culling frustum

        this.buildCullingFrustum();
        
            // the glow
            
        this.glowFactor=Math.abs(Math.cos(this.timeStamp/500.0));
        
            // reset some stats
            
        this.drawMeshCount=0;
        this.drawMeshTrigCount=0;
        this.drawModelCount=0;
        this.drawModelTrigCount=0;
        
            // draw the map
            
        map.sky.draw();
        map.meshList.drawOpaque();
        map.entityList.draw();
        map.meshList.drawTransparent();
        map.liquidList.draw();
        map.particleList.draw();
      
            // player weapon
         
        weapon=player.getCurrentWeapon();
        if (weapon!==null) {
            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
            weapon.draw(player);
        }
        
            // setup any tinting
        
        tintOn=false;
        this.uiTintColor.setFromValues(0.0,0.0,0.0);
        
        tintAtt=player.getDamageTintAttenuation();
        if (tintAtt!==0.0) {
            tintOn=true;
            this.uiTintColor.addFromValues(tintAtt,0.0,0.0);
        }
        if (player.isInLiquid()) {
            tintOn=true;
            player.getCurrentRoom().addTintFromLiquidColor(this.uiTintColor);
        }
        
            // interface drawing
            
        this.interface.drawStart();
        
            // any tints
            
        if (tintOn) {
            this.uiTintColor.fixOverflow();
            this.interface.drawRect(this.uiTintRect,this.uiTintColor,0.5);
        }
        
            // health
        
        this.uiHealthRect.top=this.uiHealthRect.bot-Math.trunc(this.uiHealthHigh*player.getPercentageHealth());
        this.interface.drawRect(this.uiHealthRect,this.uiHealthColor,this.uiHealthAlpha);
        this.interface.drawFrameRect(this.uiHealthFrameRect,this.uiHealthFrameColor,1.0);
        
            // finish interface drawing
            
        this.interface.drawEnd();

            // map overlay
            
        if (this.drawOverlay) map.overlay.draw(map);
        
            // text overlays

        fpsStr=this.fps.toString();
        idx=fpsStr.indexOf('.');
        if (idx===-1) {
            fpsStr+='.0';
        }
        else {
            fpsStr=fpsStr.substring(0,(idx+3));
        }
        
        this.text.drawStart();
        this.text.drawWithShadow((this.wid-5),23,20,18,fpsStr,this.text.TEXT_ALIGN_RIGHT,new ColorClass(1.0,1.0,0.0));
        if (this.paused) {
            this.text.drawWithShadow(Math.trunc(this.wid*0.5),(Math.trunc(this.high*0.5)-20),48,45,'Paused',this.text.TEXT_ALIGN_CENTER,new ColorClass(1.0,1.0,0.0));
            this.text.drawWithShadow(Math.trunc(this.wid*0.5),(Math.trunc(this.high*0.5)+20),36,32,'click to start - esc to pause',this.text.TEXT_ALIGN_CENTER,new ColorClass(1.0,1.0,0.0));
        }
        this.text.drawEnd();
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
    
    loadingScreenDraw(progress)
    {
        let n,nLine;
        let y,col;
        
            // the 2D ortho matrix

        this.buildOrthoMatrix(-1.0,1.0);
        
            // clear to black
            
        this.gl.clearColor(0.0,0.0,0.0,1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT,this.gl.DEPTH_BUFFER_BIT);
        
            // lines
            
        nLine=this.loadingStrings.length;

        this.text.drawStart();
        
        y=(this.high-30)-((nLine-1)*22);
        col=new ColorClass(1.0,1.0,1.0);
        
        for (n=0;n!==nLine;n++) {
            if (n===(nLine-1)) col=new ColorClass(1.0,0.3,0.3);
            this.text.draw(5,y,20,18,this.loadingStrings[n],this.text.TEXT_ALIGN_LEFT,col);
            y+=22;
        }
        
        this.text.drawEnd();

            // progress
        
        this.interface.drawStart();
        if (progress!==null) {
            this.loadingBarRect.rgt=5+Math.trunc((this.wid-10)*progress);
            this.interface.drawRect(this.loadingBarRect,this.loadingBarColor,1.0);
        }
        this.interface.drawFrameRect(this.loadingBarFrameRect,this.loadingBarFrameColor,1.0);
        this.interface.drawEnd();
    }
    
        //
        // view frustum culling
        //

    buildCullingFrustum()
    {
            // combine the matrixes
            // to build the frustum
            // ABCD planes equations

        this.clipPlane[0]=(this.modelMatrix[0]*this.perspectiveMatrix[0])+(this.modelMatrix[1]*this.perspectiveMatrix[4])+(this.modelMatrix[2]*this.perspectiveMatrix[8])+(this.modelMatrix[3]*this.perspectiveMatrix[12]);
        this.clipPlane[1]=(this.modelMatrix[0]*this.perspectiveMatrix[1])+(this.modelMatrix[1]*this.perspectiveMatrix[5])+(this.modelMatrix[2]*this.perspectiveMatrix[9])+(this.modelMatrix[3]*this.perspectiveMatrix[13]);
        this.clipPlane[2]=(this.modelMatrix[0]*this.perspectiveMatrix[2])+(this.modelMatrix[1]*this.perspectiveMatrix[6])+(this.modelMatrix[2]*this.perspectiveMatrix[10])+(this.modelMatrix[3]*this.perspectiveMatrix[14]);
        this.clipPlane[3]=(this.modelMatrix[0]*this.perspectiveMatrix[3])+(this.modelMatrix[1]*this.perspectiveMatrix[7])+(this.modelMatrix[2]*this.perspectiveMatrix[11])+(this.modelMatrix[3]*this.perspectiveMatrix[15]);

        this.clipPlane[4]=(this.modelMatrix[4]*this.perspectiveMatrix[0])+(this.modelMatrix[5]*this.perspectiveMatrix[4])+(this.modelMatrix[6]*this.perspectiveMatrix[8])+(this.modelMatrix[7]*this.perspectiveMatrix[12]);
        this.clipPlane[5]=(this.modelMatrix[4]*this.perspectiveMatrix[1])+(this.modelMatrix[5]*this.perspectiveMatrix[5])+(this.modelMatrix[6]*this.perspectiveMatrix[9])+(this.modelMatrix[7]*this.perspectiveMatrix[13]);
        this.clipPlane[6]=(this.modelMatrix[4]*this.perspectiveMatrix[2])+(this.modelMatrix[5]*this.perspectiveMatrix[6])+(this.modelMatrix[6]*this.perspectiveMatrix[10])+(this.modelMatrix[7]*this.perspectiveMatrix[14]);
        this.clipPlane[7]=(this.modelMatrix[4]*this.perspectiveMatrix[3])+(this.modelMatrix[5]*this.perspectiveMatrix[7])+(this.modelMatrix[6]*this.perspectiveMatrix[11])+(this.modelMatrix[7]*this.perspectiveMatrix[15]);

        this.clipPlane[8]=(this.modelMatrix[8]*this.perspectiveMatrix[0])+(this.modelMatrix[9]*this.perspectiveMatrix[4])+(this.modelMatrix[10]*this.perspectiveMatrix[8])+(this.modelMatrix[11]*this.perspectiveMatrix[12]);
        this.clipPlane[9]=(this.modelMatrix[8]*this.perspectiveMatrix[1])+(this.modelMatrix[9]*this.perspectiveMatrix[5])+(this.modelMatrix[10]*this.perspectiveMatrix[9])+(this.modelMatrix[11]*this.perspectiveMatrix[13]);
        this.clipPlane[10]=(this.modelMatrix[8]*this.perspectiveMatrix[2])+(this.modelMatrix[9]*this.perspectiveMatrix[6])+(this.modelMatrix[10]*this.perspectiveMatrix[10])+(this.modelMatrix[11]*this.perspectiveMatrix[14]);
        this.clipPlane[11]=(this.modelMatrix[8]*this.perspectiveMatrix[3])+(this.modelMatrix[9]*this.perspectiveMatrix[7])+(this.modelMatrix[10]*this.perspectiveMatrix[11])+(this.modelMatrix[11]*this.perspectiveMatrix[15]);

        this.clipPlane[12]=(this.modelMatrix[12]*this.perspectiveMatrix[0])+(this.modelMatrix[13]*this.perspectiveMatrix[4])+(this.modelMatrix[14]*this.perspectiveMatrix[8])+(this.modelMatrix[15]*this.perspectiveMatrix[12]);
        this.clipPlane[13]=(this.modelMatrix[12]*this.perspectiveMatrix[1])+(this.modelMatrix[13]*this.perspectiveMatrix[5])+(this.modelMatrix[14]*this.perspectiveMatrix[9])+(this.modelMatrix[15]*this.perspectiveMatrix[13]);
        this.clipPlane[14]=(this.modelMatrix[12]*this.perspectiveMatrix[2])+(this.modelMatrix[13]*this.perspectiveMatrix[6])+(this.modelMatrix[14]*this.perspectiveMatrix[10])+(this.modelMatrix[15]*this.perspectiveMatrix[14]);
        this.clipPlane[15]=(this.modelMatrix[12]*this.perspectiveMatrix[3])+(this.modelMatrix[13]*this.perspectiveMatrix[7])+(this.modelMatrix[14]*this.perspectiveMatrix[11])+(this.modelMatrix[15]*this.perspectiveMatrix[15]);

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
