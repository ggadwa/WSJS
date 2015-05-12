"use strict";

//
// camera class
//

function CameraObject()
{
    this.position=new wsPoint(0.0,0.0,0.0);
    this.angle=new wsAngle(0.0,0.0,0.0);
    
        //
        // move forward with camera
        //
    
    this.forward=function(dist,extraAngle)
    {
        var pt=new wsPoint(0.0,0.0,dist);        
        pt.rotateY(null,(this.angle.y+extraAngle));
        this.position.addPoint(pt);
    };
    
        //
        // move directly
        //

    this.move=function(x,y,z)
    {
        this.position.move(x,y,z);
    };
    
        //
        // turn camera (y angle)
        //

    this.turn=function(addAngle)
    {
        this.angle.y+=addAngle;
        if (this.angle.y<0.0) this.angle.y+=360.0;
        if (this.angle.y>=360.00) this.angle.y-=360.0;
    };
    
        //
        // look camera (x angle)
        //

    this.look=function(addAngle)
    {
        this.angle.x+=addAngle;
        if (this.angle.x<-80.0) this.angle.x=-80.0;
        if (this.angle.x>=80.0) this.angle.x=80.0;
    };
}

