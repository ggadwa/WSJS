"use strict";

//
// view frustum culling
//

function viewBuildCullingFrustum()
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
}

function viewBoundBoxInFrustum(xBound,yBound,zBound)
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
// draw view
//

function viewDraw(map,text,camera)
{
    var startMillisec=Date.now();
    var drawMeshCount=0;
    
        // convert view lights to shader lights
        
    map.createViewLightsFromMapLights(this,camera);
    
        // create the perspective matrix
        
    mat4.perspective(this.perspectiveMatrix,this.OPENGL_FOV,this.aspect,this.OPENGL_NEAR_Z,this.OPENGL_FAR_Z);
    mat4.translate(this.perspectiveMatrix,this.perspectiveMatrix,vec3.fromValues(0,0,this.OPENGL_NEAR_Z));

        // get the eye point and rotate it
        // around the view position

    var eye=vec3.create();
    var pos=camera.position.toVec3();
    vec3.add(eye,pos,vec3.fromValues(0.0,0.0,-this.OPENGL_NEAR_Z));
    vec3.rotateX(eye,eye,pos,glMatrix.toRadian(camera.angle.x));
    vec3.rotateY(eye,eye,pos,glMatrix.toRadian(camera.angle.y));

        // setup the look at

    mat4.lookAt(this.modelMatrix,eye,pos,this.lookAtUpVector);
    
        // create the 3x3 normal matrix
        // the normal is the invert-transpose of the model matrix
    
    var normal4x4Mat=mat4.create();
    mat4.invert(normal4x4Mat,this.modelMatrix);
    mat4.transpose(normal4x4Mat,normal4x4Mat);
    
    mat3.fromMat4(this.normalMatrix,normal4x4Mat);
    
        // the 2D ortho matrix
        
    mat4.ortho(this.orthoMatrix,0.0,this.wid,this.high,0.0,-1.0,1.0);
    
        // build the culling frustum
        
    this.buildCullingFrustum();
    
        // draw the map
    
    map.drawStart(this);
    drawMeshCount+=map.draw(this);
    map.drawEnd();
    
        // overlays
        
    var drawMillisec=Date.now()-startMillisec;
    
    text.drawStart(this);
    text.draw((this.wid-5),23,20,18,(drawMillisec.toString()+"ms"),text.ALIGN_RIGHT,new wsColor(1.0,1.0,0.0));
    text.draw((this.wid-5),45,20,18,drawMeshCount.toString(),text.ALIGN_RIGHT,new wsColor(1.0,1.0,0.0));
    text.drawEnd();
}

//
// view object
//

function viewObject()
{
        // the view setup
        
    this.OPENGL_FOV=55.0;
    this.OPENGL_NEAR_Z=500;
    this.OPENGL_FAR_Z=300000;
    
    this.wid=0;
    this.high=0;
    this.aspect=0.0;
    this.lookAtUpVector=vec3.fromValues(0.0,1.0,0.0);

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

        // view functions
        
    this.buildCullingFrustum=viewBuildCullingFrustum;
    this.boundBoxInFrustum=viewBoundBoxInFrustum;
    this.draw=viewDraw;
}
    
