"use strict";

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
    
    this.wid=0;
    this.high=0;
    this.aspect=0.0;
    this.lookAtUpVector=new wsPoint(0.0,1.0,0.0);

        // the gl matrixes
        
    this.perspectiveMatrix=mat4.create();
    this.modelMatrix=mat4.create();
    this.normalMatrix=mat3.create();
    this.orthoMatrix=mat4.create();
    
        // view lighting
        
    this.LIGHT_COUNT=4;
        
    this.ambient=new wsColor(0.0,0.0,0.0);
    
    this.lights=[];
    for (var n=0;n!==this.LIGHT_COUNT;n++) {
        this.lights.push(null);
    }
    
        // frustum planes
        
    this.frustumLeftPlane=new wsPlane(0.0,0.0,0.0,0.0);
	this.frustumRightPlane=new wsPlane(0.0,0.0,0.0,0.0);
	this.frustumTopPlane=new wsPlane(0.0,0.0,0.0,0.0);
	this.frustumBottomPlane=new wsPlane(0.0,0.0,0.0,0.0);
	this.frustumNearPlane=new wsPlane(0.0,0.0,0.0,0.0);
	this.frustumFarPlane=new wsPlane(0.0,0.0,0.0,0.0);
    
        // text drawing
        
    this.text=new TextObject();
    
        // the camera object
        
    this.camera=new CameraObject();
    
        // main loop
        
    this.loopCancel=false;
    this.loopLastPhysicTimeStamp=0;
    this.loopLastDrawTimeStamp=0;
    
    this.fpsTotal=0;
    this.fpsCount=0;
    this.fpsStartTimeStamp=0;
    
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

            // initialize text

        if (!this.text.initialize(this)) return(false);

        return(true);
    };

    this.release=function()
    {
        this.text.release();
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
        // build look at matrix
        //
     
    this.buildLookAt=function(eyePos,centerPos,up)
    {
        var x0, x1, x2, y0, y1, y2, z0, z1, z2, f;

        z0=eyePos.x-centerPos.x;
        z1=eyePos.y-centerPos.y;
        z2=eyePos.z-centerPos.z;

        f=Math.sqrt((z0*z0)+(z1*z1)+(z2*z2));
        f=1.0/f;
        z0*=f;
        z1*=f;
        z2*=f;

        x0=(up.y*z2)-(up.z*z1);
        x1=(up.z*z0)-(up.x*z2);
        x2=(up.x*z1)-(up.y*z0);
        
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
        // draw view
        //

    this.draw=function(map,entityList)
    {
        var n,nEntity,entity;
        var light;
        var drawMeshCount=0;
        var drawModelCount=0;
        var camera=this.camera;

            // create the perspective matrix

        mat4.perspective(this.perspectiveMatrix,this.OPENGL_FOV,this.aspect,this.OPENGL_NEAR_Z,this.OPENGL_FAR_Z);
        mat4.translate(this.perspectiveMatrix,this.perspectiveMatrix,vec3.fromValues(0,0,this.OPENGL_NEAR_Z));

            // get the eye point and rotate it
            // around the view position

        var eyePos=new wsPoint(camera.position.x,camera.position.y,(camera.position.z-this.OPENGL_NEAR_Z));
        eyePos.rotateX(camera.position,camera.angle.x);
        eyePos.rotateY(camera.position,camera.angle.y);

            // setup the look at

        this.modelMatrix=this.buildLookAt(eyePos,camera.position,this.lookAtUpVector);

            // create the 3x3 normal matrix
            // the normal is the invert-transpose of the model matrix

        var normal4x4Mat=mat4.create();
        mat4.invert(normal4x4Mat,this.modelMatrix);
        mat4.transpose(normal4x4Mat,normal4x4Mat);

        mat3.fromMat4(this.normalMatrix,normal4x4Mat);

            // the 2D ortho matrix

        mat4.ortho(this.orthoMatrix,0.0,this.wid,this.high,0.0,-1.0,1.0);
        
            // convert view lights to shader lights
            // all lights need a eye coordinate, so calc
            // that here

        map.createViewLightsFromMapLights(this,camera);
        
        for (n=0;n!==this.LIGHT_COUNT;n++) {
            light=this.lights[n];
            if (light!==null) light.eyePosition=this.convertToEyeCoordinates(light.position);
        }

            // build the culling frustum

        this.buildCullingFrustum();

            // draw the map

        map.drawStart(this);
        drawMeshCount+=map.draw(this);
        map.drawEnd(this);

            // draw the entities

        nEntity=entityList.count();

        for (n=0;n!==nEntity;n++) {
            entity=entityList.get(n);
            if (entity.isPlayer) continue;

            entity.drawStart(this);
            entity.draw(this);
            entity.drawEnd(this);
            
            debug.drawModelSkeleton(this,entity.model,entity.position);
            drawModelCount++;
        }

            // overlays

        var fpsStr=this.fps.toString();
        var idx=fpsStr.indexOf('.');
        if (idx===-1) {
            fpsStr+='.0';
        }
        else {
            fpsStr=fpsStr.substring(0,(idx+3));
        }

        var countStr=drawMeshCount.toString()+"/"+drawModelCount.toString();

        var posStr=Math.floor(camera.position.x)+','+Math.floor(camera.position.y)+','+Math.floor(camera.position.z)+':'+Math.floor(camera.angle.y);

        this.text.drawStart(this);
        this.text.draw(this,(this.wid-5),23,20,18,fpsStr,this.text.TEXT_ALIGN_RIGHT,new wsColor(1.0,1.0,0.0));
        this.text.draw(this,(this.wid-5),45,20,18,countStr,this.text.TEXT_ALIGN_RIGHT,new wsColor(1.0,1.0,0.0));
        this.text.draw(this,(this.wid-5),494,20,18,posStr,this.text.TEXT_ALIGN_RIGHT,new wsColor(1.0,1.0,0.0));
        this.text.drawEnd(this);
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
    
