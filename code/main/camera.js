"use strict";

//
// camera movement
//

function cameraForward(dist,extraAngle)
{
    var mov=vec3.fromValues(0.0,0.0,dist);
    vec3.rotateY(mov,mov,[0.0,0.0,0.0],glMatrix.toRadian(this.angle.y+extraAngle));
    this.position.move(mov[0],mov[1],mov[2]);
}

function cameraMove(x,y,z)
{
    this.position.move(x,y,z);
}

function cameraTurn(addAngle)
{
    this.angle.y+=addAngle;
    if (this.angle.y<0.0) this.angle.y+=360.0;
    if (this.angle.y>=360.00) this.angle.y-=360.0;
}

function cameraLook(addAngle)
{
    this.angle.x+=addAngle;
    if (this.angle.x<-80.0) this.angle.x=-80.0;
    if (this.angle.x>=80.0) this.angle.x=80.0;
}

//
// camera object
//

function cameraObject()
{
    this.position=new wsPoint(0.0,0.0,0.0);
    this.angle=new wsAngle(0.0,0.0,0.0);
    
    this.forward=cameraForward;
    this.move=cameraMove;
    this.turn=cameraTurn;
    this.look=cameraLook;
}

