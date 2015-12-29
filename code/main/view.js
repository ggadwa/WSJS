"use strict";

//
// view camera class
//

function ViewCameraObject()
{
    this.position=new wsPoint(0.0,0.0,0.0);
    this.angle=new wsAngle(0.0,0.0,0.0);
    
        //
        // set camera to entity
        //
        
    this.setToEntity=function(entity,eyeHigh)
    {
        this.position.setFromPoint(entity.position);
        this.position.y-=eyeHigh;
        this.angle.setFromAngle(entity.angle);
    };
    
}

//
// view class
//

function ViewObject()
{
        // the opengl context

    this.gl=null;
    this.canvas=null;
    this.canvasTopLeft=new ws2DPoint(0,0);
    
        // the view setup
        
    this.OPENGL_FOV=55.0;
    this.OPENGL_NEAR_Z=500;
    this.OPENGL_FAR_Z=300000;
    
    this.VIEW_NORMAL_CULL_LIMIT=0.3;
    
    this.wid=0;
    this.high=0;
    this.aspect=0.0;
    this.lookAtUpVector=new wsPoint(0.0,1.0,0.0);

        // the gl matrixes
        
    this.perspectiveMatrix=null;
    this.modelMatrix=null;
    this.normalMatrix=null;
    this.orthoMatrix=null;
    
        // billboarding matrixes
        
    this.billboardXMatrix=null;
    this.billboardYMatrix=null;
    
        // in game random
        
    this.genRandom=new GenRandomObject(Date.now());
    
        // view lighting
        
    this.LIGHT_COUNT=4;
        
    this.ambient=new wsColor(0.0,0.0,0.0);
    
    this.lights=[];
    for (var n=0;n!==this.LIGHT_COUNT;n++) {
        this.lights.push(null);
    }
    
        // camera setup
        
    this.CAMERA_EYE_HEIGHT=3000;
    
        // frustum planes
        
    this.frustumLeftPlane=new wsPlane(0.0,0.0,0.0,0.0);
    this.frustumRightPlane=new wsPlane(0.0,0.0,0.0,0.0);
    this.frustumTopPlane=new wsPlane(0.0,0.0,0.0,0.0);
    this.frustumBottomPlane=new wsPlane(0.0,0.0,0.0,0.0);
    this.frustumNearPlane=new wsPlane(0.0,0.0,0.0,0.0);
    this.frustumFarPlane=new wsPlane(0.0,0.0,0.0,0.0);
    
        // additional drawing objects
        
    this.particle=new ParticleObject();
    this.text=new TextObject();
    this.interface=new InterfaceObject();
    
        // the camera object
        
    this.camera=new ViewCameraObject();
    
        // main loop
        
    this.timeStamp=0;
        
    this.loopCancel=false;
    this.loopLastPhysicTimeStamp=0;
    this.loopLastDrawTimeStamp=0;
    
        // stats
        
    this.fpsTotal=0;
    this.fpsCount=0;
    this.fpsStartTimeStamp=0;
    
    this.drawMeshCount=0;
    this.drawMeshTrigCount=0;
    this.drawModelCount=0;
    this.drawModelTrigCount=0;
    
        // loading screen
        
    this.loadingStrings=[];
    this.loadingLastAddMsec=0;
    
        //
        // initialize and release
        //

    this.initialize=function(canvasId)
    {
            // get the canvas

        this.canvas=document.getElementById(canvasId);
        if (this.canvas===null) {
            alert('missing canvas id');
            return(false);
        }

        this.canvasTopLeft.x=parseInt(this.canvas.style.left);
        this.canvasTopLeft.y=parseInt(this.canvas.style.top);

            // get the gl context

        try {
            this.gl=this.canvas.getContext("experimental-webgl");
        }
        catch (e) {
            alert(e);
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

            // initialize other drawing objects

        if (!this.particle.initialize(this)) return(false);
        if (!this.text.initialize(this)) return(false);
        if (!this.interface.initialize(this)) return(false);

        return(true);
    };

    this.release=function()
    {
        this.particle.release();
        this.text.release();
        this.interface.release();
    };
    
        //
        // convert coordinate to eye coordinates
        //
    
    this.convertToEyeCoordinates=function(pt)
    {
        var x=(pt.x*this.modelMatrix[0])+(pt.y*this.modelMatrix[4])+(pt.z*this.modelMatrix[8])+this.modelMatrix[12];
        var y=(pt.x*this.modelMatrix[1])+(pt.y*this.modelMatrix[5])+(pt.z*this.modelMatrix[9])+this.modelMatrix[13];
        var z=(pt.x*this.modelMatrix[2])+(pt.y*this.modelMatrix[6])+(pt.z*this.modelMatrix[10])+this.modelMatrix[14];
        
        return(new wsPoint(x,y,z));
    };
    
        //
        // build perspective and ortho matrix
        //

    this.buildPerspectiveMatrix=function()
    {
        var fov=1.0/Math.tan(this.OPENGL_FOV*0.5);
        var dist=1.0/(this.OPENGL_NEAR_Z-this.OPENGL_FAR_Z);
        
            // create the perspective matrix
            
        var mat=new Float32Array(16);
        
        mat[0]=fov/this.aspect;
        mat[1]=0.0;
        mat[2]=0.0;
        mat[3]=0.0;
        mat[4]=0.0;
        mat[5]=fov;
        mat[6]=0.0;
        mat[7]=0.0;
        mat[8]=0.0;
        mat[9]=0.0;
        mat[10]=(this.OPENGL_FAR_Z+this.OPENGL_NEAR_Z)*dist;
        mat[11]=-1.0;
        mat[12]=0.0;
        mat[13]=0.0;
        mat[14]=((this.OPENGL_FAR_Z*this.OPENGL_NEAR_Z)*2.0)*dist;
        mat[15]=0.0;
        
            // now translate it for the near_z
                     
        mat[12]+=(mat[8]*this.OPENGL_NEAR_Z);
        mat[13]+=(mat[9]*this.OPENGL_NEAR_Z);
        mat[14]+=(mat[10]*this.OPENGL_NEAR_Z);
        mat[15]+=(mat[11]*this.OPENGL_NEAR_Z);
    
        return(mat);
    };
    
    this.buildOrthoMatrix=function(nearZ,farZ)
    {
        var horz=1.0/this.wid;
        var vert=1.0/this.high;
        var dist=1.0/(nearZ-farZ);

        var mat=new Float32Array(16);

        mat[0]=horz*2.0;
        mat[1]=0.0;
        mat[2]=0.0;
        mat[3]=0.0;
        mat[4]=0.0;
        mat[5]=vert*-2.0;
        mat[6]=0.0;
        mat[7]=0.0;
        mat[8]=0.0;
        mat[9]=0.0;
        mat[10]=dist*2.0;
        mat[11]=0.0;
        mat[12]=-1.0; // this.wid*-horz;      // these will always equal these numbers,
        mat[13]=1.0; // this.high*vert;     // but leave in the code for readability
        mat[14]=(farZ+nearZ)*dist;
        mat[15]=1.0;

        return(mat);
    };
    
        //
        // build look at matrix
        //
     
    this.buildLookAtMatrix=function(eyePos,centerPos)
    {
        var x0,x1,x2,y0,y1,y2,z0,z1,z2;
        var f;

        z0=eyePos.x-centerPos.x;
        z1=eyePos.y-centerPos.y;
        z2=eyePos.z-centerPos.z;

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

        var mat=new Float32Array(16);

        mat[0]=x0;
        mat[1]=y0;
        mat[2]=z0;
        mat[3]=0.0;
        mat[4]=x1;
        mat[5]=y1;
        mat[6]=z1;
        mat[7]=0.0;
        mat[8]=x2;
        mat[9]=y2;
        mat[10]=z2;
        mat[11]=0.0;
        mat[12]=-((x0*eyePos.x)+(x1*eyePos.y)+(x2*eyePos.z));
        mat[13]=-((y0*eyePos.x)+(y1*eyePos.y)+(y2*eyePos.z));
        mat[14]=-((z0*eyePos.x)+(z1*eyePos.y)+(z2*eyePos.z));
        mat[15]=1.0;

        return(mat);
    };
    
        //
        // create the normal matrix
        //
        
    this.buildNormalMatrix=function()
    {
            // the normal is the invert-transpose of the
            // model matrix put into a 3x3 matrix
        
            // create the inversion
            
        var normalMat=new Float32Array(16);
            
        var m00=(this.modelMatrix[0]*this.modelMatrix[5])-(this.modelMatrix[1]*this.modelMatrix[4]);
        var m01=(this.modelMatrix[0]*this.modelMatrix[6])-(this.modelMatrix[2]*this.modelMatrix[4]);
        var m02=(this.modelMatrix[0]*this.modelMatrix[7])-(this.modelMatrix[3]*this.modelMatrix[4]);
        var m03=(this.modelMatrix[1]*this.modelMatrix[6])-(this.modelMatrix[2]*this.modelMatrix[5]);
        var m04=(this.modelMatrix[1]*this.modelMatrix[7])-(this.modelMatrix[3]*this.modelMatrix[5]);
        var m05=(this.modelMatrix[2]*this.modelMatrix[7])-(this.modelMatrix[3]*this.modelMatrix[6]);
        var m06=(this.modelMatrix[8]*this.modelMatrix[13])-(this.modelMatrix[9]*this.modelMatrix[12]);
        var m07=(this.modelMatrix[8]*this.modelMatrix[14])-(this.modelMatrix[10]*this.modelMatrix[12]);
        var m08=(this.modelMatrix[8]*this.modelMatrix[15])-(this.modelMatrix[11]*this.modelMatrix[12]);
        var m09=(this.modelMatrix[9]*this.modelMatrix[14])-(this.modelMatrix[10]*this.modelMatrix[13]);
        var m10=(this.modelMatrix[9]*this.modelMatrix[15])-(this.modelMatrix[11]*this.modelMatrix[13]);
        var m11=(this.modelMatrix[10]*this.modelMatrix[15])-(this.modelMatrix[11]*this.modelMatrix[14]);

        var det=(m00*m11)-(m01*m10)+(m02*m09)+(m03*m08)-(m04*m07)+(m05*m06);
        if (det!==0.0) det=1.0/det;

        normalMat[0]=((this.modelMatrix[5]*m11)-(this.modelMatrix[6]*m10)+(this.modelMatrix[7]*m09))*det;
        normalMat[1]=((this.modelMatrix[2]*m10)-(this.modelMatrix[1]*m11)-(this.modelMatrix[3]*m09))*det;
        normalMat[2]=((this.modelMatrix[13]*m05)-(this.modelMatrix[14]*m04)+(this.modelMatrix[15]*m03))*det;
        normalMat[3]=((this.modelMatrix[10]*m04)-(this.modelMatrix[9]*m05)-(this.modelMatrix[11]*m03))*det;
        normalMat[4]=((this.modelMatrix[6]*m08)-(this.modelMatrix[4]*m11)-(this.modelMatrix[7]*m07))*det;
        normalMat[5]=((this.modelMatrix[0]*m11)-(this.modelMatrix[2]*m08)+(this.modelMatrix[3]*m07))*det;
        normalMat[6]=((this.modelMatrix[14]*m02)-(this.modelMatrix[12]*m05)-(this.modelMatrix[15]*m01))*det;
        normalMat[7]=((this.modelMatrix[8]*m05)-(this.modelMatrix[10]*m02)+(this.modelMatrix[11]*m01))*det;
        normalMat[8]=((this.modelMatrix[4]*m10)-(this.modelMatrix[5]*m08)+(this.modelMatrix[7]*m06))*det;
        normalMat[9]=((this.modelMatrix[1]*m08)-(this.modelMatrix[0]*m10)-(this.modelMatrix[3]*m06))*det;
        normalMat[10]=((this.modelMatrix[12]*m04)-(this.modelMatrix[13]*m02)+(this.modelMatrix[15]*m00))*det;
        normalMat[11]=((this.modelMatrix[9]*m02)-(this.modelMatrix[8]*m04)-(this.modelMatrix[11]*m00))*det;
        normalMat[12]=((this.modelMatrix[5]*m07)-(this.modelMatrix[4]*m09)-(this.modelMatrix[6]*m06))*det;
        normalMat[13]=((this.modelMatrix[0]*m09)-(this.modelMatrix[1]*m07)+(this.modelMatrix[2]*m06))*det;
        normalMat[14]=((this.modelMatrix[13]*m01)-(this.modelMatrix[12]*m03)-(this.modelMatrix[14]*m00))*det;
        normalMat[15]=((this.modelMatrix[8]*m03)-(this.modelMatrix[9]*m01)+(this.modelMatrix[10]*m00))*det;
        
            // put int 3x3 matrix
            // we transpose this at the same time
            
        var mat33=new Float32Array(9);
        
        mat33[0]=normalMat[0];          // non-transposed these would be 0,1,2,4,5,6,8,9,10
        mat33[1]=normalMat[4];
        mat33[2]=normalMat[8];
        mat33[3]=normalMat[1];
        mat33[4]=normalMat[5];
        mat33[5]=normalMat[9];
        mat33[6]=normalMat[2];
        mat33[7]=normalMat[6];
        mat33[8]=normalMat[10];

        return(mat33);
    };
    
        //
        // billboarding matrixes
        //
        
    this.buildBillboardXMatrix=function(ang)
    {
        var mat=new Float32Array(16);
        
            // identity
            
        mat[0]=mat[5]=mat[10]=mat[15]=1.0;

            // rotation
            
        var rad=ang*DEGREE_TO_RAD;
        
        mat[5]=mat[10]=Math.cos(rad);
        mat[6]=Math.sin(rad);
        mat[9]=-mat[6];
        
        return(mat);
    };
    
    this.buildBillboardYMatrix=function(ang)
    {
        var mat=new Float32Array(16);
        
            // identity
            
        mat[0]=mat[5]=mat[10]=mat[15]=1.0;

            // rotation
            
        var rad=ang*DEGREE_TO_RAD;
        
        mat[0]=mat[10]=Math.cos(rad);
        mat[8]=Math.sin(rad);
        mat[2]=-mat[8];
        
        return(mat);
    };
    
        //
        // draw view
        //

    this.draw=function(map,entityList)
    {
        var n,nEntity,entity;
        var light;
         
            // everything overdraws except
            // clear the depth buffer
            
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        
            // setup the view camera to be
            // equal to player object
            
        this.camera.setToEntity(entityList.getPlayer(),this.CAMERA_EYE_HEIGHT);

            // create the perspective matrix
            // note this function has a translate in it for NEAR_Z

        this.perspectiveMatrix=this.buildPerspectiveMatrix();

            // get the eye point and rotate it
            // around the view position

        var eyePos=new wsPoint(this.camera.position.x,this.camera.position.y,(this.camera.position.z-this.OPENGL_NEAR_Z));
        eyePos.rotateX(this.camera.position,this.camera.angle.x);
        eyePos.rotateY(this.camera.position,this.camera.angle.y);

            // setup the look at

        this.modelMatrix=this.buildLookAtMatrix(eyePos,this.camera.position);

            // create the 3x3 normal matrix
            // the normal is the invert-transpose of the model matrix
            
        this.normalMatrix=this.buildNormalMatrix();

            // the 2D ortho matrix

        this.orthoMatrix=this.buildOrthoMatrix(-1.0,1.0);
        
            // build the billboarding matrixes
            // mostly used for particles
            
        this.billboardXMatrix=this.buildBillboardXMatrix(this.camera.angle.x);
        this.billboardYMatrix=this.buildBillboardYMatrix(this.camera.angle.y);
        
            // convert view lights to shader lights
            // all lights need a eye coordinate, so calc
            // that here

        map.createViewLightsFromMapLights(this);
        
        for (n=0;n!==this.LIGHT_COUNT;n++) {
            light=this.lights[n];
            if (light!==null) light.eyePosition=this.convertToEyeCoordinates(light.position);
        }

            // build the culling frustum

        this.buildCullingFrustum();
        
            // draw the map
       
        this.drawMeshCount=0;
        this.drawMeshTrigCount=0;

        map.drawStart(this);
        map.draw(this);
        map.drawEnd(this);

            // draw the entities
            
        this.drawModelCount=0;
        this.drawModelTrigCount=0;

        nEntity=entityList.count();

        for (n=0;n!==nEntity;n++) {
            entity=entityList.get(n);
            if (entity.isPlayer) continue;

            if (entity.inFrustum(view)) {
                entity.drawStart(this);
                entity.draw(this);
                entity.drawEnd(this);

                if (settings.debugDrawModelSkeleton) debug.drawModelSkeleton(this,entity.model,entity.position);
                if (settings.debugDrawModelMeshLines) debug.drawModelMeshLines(this,entity.model);
                if (settings.debugDrawModelMeshNormals) debug.drawModelMeshNormals(this,entity.model);
                if (settings.debugDrawModelMeshTangents) debug.drawModelMeshTangents(this,entity.model);
            }
        }
        
            // map overlay
            
        map.overlayDraw(this);
        
            // text overlays

        var fpsStr=this.fps.toString();
        var idx=fpsStr.indexOf('.');
        if (idx===-1) {
            fpsStr+='.0';
        }
        else {
            fpsStr=fpsStr.substring(0,(idx+3));
        }

        var mapCountStr=this.drawMeshCount.toString()+"/"+this.drawMeshTrigCount.toString();
        var modelCountStr=this.drawModelCount.toString()+"/"+this.drawModelTrigCount.toString();

        var posStr=Math.floor(this.camera.position.x)+','+Math.floor(this.camera.position.y)+','+Math.floor(this.camera.position.z)+':'+Math.floor(this.camera.angle.y);

        this.text.drawStart(this);
        this.text.drawWithShadow(this,(this.wid-5),23,20,18,fpsStr,this.text.TEXT_ALIGN_RIGHT,new wsColor(1.0,1.0,0.0));
        this.text.drawWithShadow(this,(this.wid-5),45,20,18,mapCountStr,this.text.TEXT_ALIGN_RIGHT,new wsColor(1.0,1.0,0.0));
        this.text.drawWithShadow(this,(this.wid-5),67,20,18,modelCountStr,this.text.TEXT_ALIGN_RIGHT,new wsColor(1.0,1.0,0.0));
        this.text.drawWithShadow(this,(this.wid-5),(this.high-5),20,18,posStr,this.text.TEXT_ALIGN_RIGHT,new wsColor(1.0,1.0,0.0));
        this.text.drawEnd(this);
    };
    
        //
        // loading screen
        //
    
    this.loadingScreenClear=function()
    {
        this.loadingStrings=[];
    };
    
    this.loadingScreenAddString=function(str)
    {
        this.loadingStrings.push(str);
        
        this.loadingLastAddMsec=Date.now();
    };
    
    this.loadingScreenUpdate=function()
    {
        var idx=this.loadingStrings.length-1;
        if (idx<0) return;
        
        var msec=Date.now()-this.loadingLastAddMsec;
        
        this.loadingStrings[idx]+=(' ['+msec+'ms]');
        
        console.log(this.loadingStrings[idx]);      // supergumba -- temporary for optimization testing
    };
    
    this.loadingScreenDraw=function(progress)
    {
        var n;
        
            // the 2D ortho matrix

        this.orthoMatrix=this.buildOrthoMatrix(-1.0,1.0);
        
            // clear to black
            
        this.gl.clearColor(0.0,0.0,0.0,1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT,this.gl.DEPTH_BUFFER_BIT);
        
            // lines
            
        var nLine=this.loadingStrings.length;

        this.text.drawStart(this);
        
        var y=(this.high-30)-((nLine-1)*22);
        var col=new wsColor(1.0,1.0,1.0);
        
        for (n=0;n!==nLine;n++) {
            if (n===(nLine-1)) col=new wsColor(1.0,0.3,0.3);
            this.text.draw(this,5,y,20,18,this.loadingStrings[n],this.text.TEXT_ALIGN_LEFT,col);
            y+=22;
        }
        
        this.text.drawEnd(this);

            // progress
        
        if (progress!==null) {
            var lft=5;
            var rgt=lft+Math.floor((this.wid-10)*progress);
        }

        this.interface.drawStart(this);
        if (progress!==null) this.interface.drawRect(this,new wsRect(lft,(this.high-25),rgt,(this.high-5)),new wsColor(0.3,0.1,1.0));
        this.interface.drawFrameRect(this,new wsRect(5,(this.high-25),(this.wid-5),(this.high-5)),new wsColor(1.0,1.0,1.0));
        this.interface.drawEnd(this);
    };
    
        //
        // view frustum culling
        //

    this.buildCullingFrustum=function()
    {
        var clip=new Float32Array(16);

            // combine the matrixes
            // to build the frustum
            // ABCD planes equations

        clip[0]=(this.modelMatrix[0]*this.perspectiveMatrix[0])+(this.modelMatrix[1]*this.perspectiveMatrix[4])+(this.modelMatrix[2]*this.perspectiveMatrix[8])+(this.modelMatrix[3]*this.perspectiveMatrix[12]);
        clip[1]=(this.modelMatrix[0]*this.perspectiveMatrix[1])+(this.modelMatrix[1]*this.perspectiveMatrix[5])+(this.modelMatrix[2]*this.perspectiveMatrix[9])+(this.modelMatrix[3]*this.perspectiveMatrix[13]);
        clip[2]=(this.modelMatrix[0]*this.perspectiveMatrix[2])+(this.modelMatrix[1]*this.perspectiveMatrix[6])+(this.modelMatrix[2]*this.perspectiveMatrix[10])+(this.modelMatrix[3]*this.perspectiveMatrix[14]);
        clip[3]=(this.modelMatrix[0]*this.perspectiveMatrix[3])+(this.modelMatrix[1]*this.perspectiveMatrix[7])+(this.modelMatrix[2]*this.perspectiveMatrix[11])+(this.modelMatrix[3]*this.perspectiveMatrix[15]);

        clip[4]=(this.modelMatrix[4]*this.perspectiveMatrix[0])+(this.modelMatrix[5]*this.perspectiveMatrix[4])+(this.modelMatrix[6]*this.perspectiveMatrix[8])+(this.modelMatrix[7]*this.perspectiveMatrix[12]);
        clip[5]=(this.modelMatrix[4]*this.perspectiveMatrix[1])+(this.modelMatrix[5]*this.perspectiveMatrix[5])+(this.modelMatrix[6]*this.perspectiveMatrix[9])+(this.modelMatrix[7]*this.perspectiveMatrix[13]);
        clip[6]=(this.modelMatrix[4]*this.perspectiveMatrix[2])+(this.modelMatrix[5]*this.perspectiveMatrix[6])+(this.modelMatrix[6]*this.perspectiveMatrix[10])+(this.modelMatrix[7]*this.perspectiveMatrix[14]);
        clip[7]=(this.modelMatrix[4]*this.perspectiveMatrix[3])+(this.modelMatrix[5]*this.perspectiveMatrix[7])+(this.modelMatrix[6]*this.perspectiveMatrix[11])+(this.modelMatrix[7]*this.perspectiveMatrix[15]);

        clip[8]=(this.modelMatrix[8]*this.perspectiveMatrix[0])+(this.modelMatrix[9]*this.perspectiveMatrix[4])+(this.modelMatrix[10]*this.perspectiveMatrix[8])+(this.modelMatrix[11]*this.perspectiveMatrix[12]);
        clip[9]=(this.modelMatrix[8]*this.perspectiveMatrix[1])+(this.modelMatrix[9]*this.perspectiveMatrix[5])+(this.modelMatrix[10]*this.perspectiveMatrix[9])+(this.modelMatrix[11]*this.perspectiveMatrix[13]);
        clip[10]=(this.modelMatrix[8]*this.perspectiveMatrix[2])+(this.modelMatrix[9]*this.perspectiveMatrix[6])+(this.modelMatrix[10]*this.perspectiveMatrix[10])+(this.modelMatrix[11]*this.perspectiveMatrix[14]);
        clip[11]=(this.modelMatrix[8]*this.perspectiveMatrix[3])+(this.modelMatrix[9]*this.perspectiveMatrix[7])+(this.modelMatrix[10]*this.perspectiveMatrix[11])+(this.modelMatrix[11]*this.perspectiveMatrix[15]);

        clip[12]=(this.modelMatrix[12]*this.perspectiveMatrix[0])+(this.modelMatrix[13]*this.perspectiveMatrix[4])+(this.modelMatrix[14]*this.perspectiveMatrix[8])+(this.modelMatrix[15]*this.perspectiveMatrix[12]);
        clip[13]=(this.modelMatrix[12]*this.perspectiveMatrix[1])+(this.modelMatrix[13]*this.perspectiveMatrix[5])+(this.modelMatrix[14]*this.perspectiveMatrix[9])+(this.modelMatrix[15]*this.perspectiveMatrix[13]);
        clip[14]=(this.modelMatrix[12]*this.perspectiveMatrix[2])+(this.modelMatrix[13]*this.perspectiveMatrix[6])+(this.modelMatrix[14]*this.perspectiveMatrix[10])+(this.modelMatrix[15]*this.perspectiveMatrix[14]);
        clip[15]=(this.modelMatrix[12]*this.perspectiveMatrix[3])+(this.modelMatrix[13]*this.perspectiveMatrix[7])+(this.modelMatrix[14]*this.perspectiveMatrix[11])+(this.modelMatrix[15]*this.perspectiveMatrix[15]);

                // left plane

        this.frustumLeftPlane.a=clip[3]+clip[0];
        this.frustumLeftPlane.b=clip[7]+clip[4];
        this.frustumLeftPlane.c=clip[11]+clip[8];
        this.frustumLeftPlane.d=clip[15]+clip[12];
        this.frustumLeftPlane.normalize();

                // right plane

        this.frustumRightPlane.a=clip[3]-clip[0];
        this.frustumRightPlane.b=clip[7]-clip[4];
        this.frustumRightPlane.c=clip[11]-clip[8];
        this.frustumRightPlane.d=clip[15]-clip[12];
        this.frustumRightPlane.normalize();

                // top plane

        this.frustumTopPlane.a=clip[3]-clip[1];
        this.frustumTopPlane.b=clip[7]-clip[5];
        this.frustumTopPlane.c=clip[11]-clip[9];
        this.frustumTopPlane.d=clip[15]-clip[13];
        this.frustumTopPlane.normalize();

                // bottom plane

        this.frustumBottomPlane.a=clip[3]+clip[1];
        this.frustumBottomPlane.b=clip[7]+clip[5];
        this.frustumBottomPlane.c=clip[11]+clip[9];
        this.frustumBottomPlane.d=clip[15]+clip[13];
        this.frustumBottomPlane.normalize();

                // near plane

        this.frustumNearPlane.a=clip[3]+clip[2];
        this.frustumNearPlane.b=clip[7]+clip[6];
        this.frustumNearPlane.c=clip[11]+clip[10];
        this.frustumNearPlane.d=clip[15]+clip[14];
        this.frustumNearPlane.normalize();

                // far plane

        this.frustumFarPlane.a=clip[3]-clip[2];
        this.frustumFarPlane.b=clip[7]-clip[6];
        this.frustumFarPlane.c=clip[11]-clip[10];
        this.frustumFarPlane.d=clip[15]-clip[14];
        this.frustumFarPlane.normalize();
    };

    this.boundBoxInFrustum=function(xBound,yBound,zBound)
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
    };
    
}
    
