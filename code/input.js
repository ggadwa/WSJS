"use strict";

//
// input variables
//

var keyFlags=new Uint16Array(255);

var mouseFirstMove=true;
var mouseLastPos=[0,0];

//
// move camera
//

function inputMoveCamera(dist,extraAngle)
{
    var mov=vec3.fromValues(0.0,0.0,dist);
    vec3.rotateY(mov,mov,[0.0,0.0,0.0],glMatrix.toRadian(camera.angle.y+extraAngle));
    camera.position.move(mov[0],mov[1],mov[2]);
}

function inputTurnCamera(addAngle)
{
    camera.angle.y+=addAngle;
    if (camera.angle.y<0.0) camera.angle.y+=360.0;
    if (camera.angle.y>=360.00) camera.angle.y-=360.0;
}

//
// input startup
//

function inputStart()
{
    var n;
    
    for (n=0;n!==255;n++) keyFlags[n]=0;
    
    mouseFirstMove=true;
    mouseLastPos=[0,0];
}

//
// run input from main loop
//

function inputRun()
{
        // left arrow and right arrow
        // turning
        
    if (keyFlags[37]) inputTurnCamera(-3.0);
    if (keyFlags[39]) inputTurnCamera(3.0);
            
        // up arrow or W
        // down arrow or S
        // forward and backwards
            
    if ((keyFlags[38]) || (keyFlags[87])) inputMoveCamera(125.0,0.0);
    if ((keyFlags[40]) || (keyFlags[83])) inputMoveCamera(-125.0,0.0);
            
        // A and D
        // sidestep
            
    if (keyFlags[65]) inputMoveCamera(75.0,-90.0);
    if (keyFlags[68]) inputMoveCamera(75.0,90.0);
    
        // insert/home, delete/end
        // up or down
        
    if ((keyFlags[45]) || (keyFlags[36])) camera.position.move(0.0,-125.0,0.0);
    if ((keyFlags[46]) || (keyFlags[35])) camera.position.move(0.0,125.0,0.0);
    
        // page up, page down
        // look up or down
        
    if (keyFlags[33]) camera.angle.x+=1.5;
    if (keyFlags[34]) camera.angle.x-=1.5; 
}

//
// canvas key events
//

function inputKeyDownEvent(event)
{
    keyFlags[event.keyCode]=1;
    return(false);
}

function inputKeyUpEvent(event)
{
    keyFlags[event.keyCode]=0;
    return(false);
}

//
// canvas mouse events
//

function inputMouseMoveEvent(event)
{
        // get mouse movement in
        // canvas
        
    var x=event.clientX-canvasTopLeft[0];
    var y=event.clientY-canvasTopLeft[1];
    
        // first event?
        
    if (mouseFirstMove) {
        mouseFirstMove=false;
        mouseLastPos=[x,y];
        return;
    }
    
        // get relative movement
        
    var rx=x-mouseLastPos[0];
    var ry=y-mouseLastPos[1];
    mouseLastPos=[x,y];
    
        // handle the movement
        
    camera.angle.y+=(rx/10.0);
    camera.angle.x+=(ry/10.0);
    if (camera.angle.x<-15.0) camera.angle.x=-15.0;
    if (camera.angle.x>15.0) camera.angle.x=15.0;
}

