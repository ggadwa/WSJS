"use strict";

//
// run input from main loop
//

function inputRun(camera)
{
        // left arrow and right arrow
        // turning
        
    if (this.keyFlags[37]) camera.turn(-3.0);
    if (this.keyFlags[39]) camera.turn(3.0);
            
        // up arrow or W
        // down arrow or S
        // forward and backwards
            
    if ((this.keyFlags[38]) || (this.keyFlags[87])) camera.forward(125.0,0.0);
    if ((this.keyFlags[40]) || (this.keyFlags[83])) camera.forward(-125.0,0.0);
            
        // A and D
        // sidestep
            
    if (this.keyFlags[65]) camera.forward(75.0,-90.0);
    if (this.keyFlags[68]) camera.forward(75.0,90.0);
    
        // insert/home, delete/end
        // up or down
        
    if ((this.keyFlags[45]) || (this.keyFlags[36])) camera.move(0.0,-125.0,0.0);
    if ((this.keyFlags[46]) || (this.keyFlags[35])) camera.move(0.0,125.0,0.0);
    
        // page up, page down
        // look up or down
        
    if (this.keyFlags[33]) camera.look(1.5);
    if (this.keyFlags[34]) camera.look(-1.5); 
}

//
// canvas key events
//

function inputKeyDownEvent(event)
{
    this.keyFlags[event.keyCode]=1;
    return(false);
}

function inputKeyUpEvent(event)
{
    this.keyFlags[event.keyCode]=0;
    return(false);
}

//
// canvas mouse events
//

function inputMouseMoveEvent(event)
{
    /* supergumba -- work on this


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
    
        // handle the movement -- supergumba -- move to inputrun
        
    camera.angle.y+=(rx/10.0);
    camera.angle.x+=(ry/10.0);
    if (camera.angle.x<-15.0) camera.angle.x=-15.0;
    if (camera.angle.x>15.0) camera.angle.x=15.0;
    
    */
}

//
// initialize/release input
//

function inputInitialize(view)
{
    var n;
    
        // clear the run input flags
    
    for (n=0;n!==255;n++) {
        this.keyFlags[n]=0;
    }
    
    this.mouseFirstMove=true;
    this.mouseLastPos=new ws2DPoint(0,0);
    
        // add the listeners

    document.addEventListener("keydown",this.keyDownEvent.bind(this),true);
    document.addEventListener("keyup",this.keyUpEvent.bind(this),true);
//    document.addEventListener("mousemove",inputMouseMoveEvent,true);   // TODO - use pointerlock here

}

function inputRelease()
{ 
}

//
// input object
//

function inputObject()
{
        // input flags
        
    this.keyFlags=new Uint16Array(255);

    this.mouseFirstMove=true;
    this.mouseLastPos=new ws2DPoint(0,0);

        // input functions
        
    this.initialize=inputInitialize;
    this.release=inputRelease;
    
    this.keyDownEvent=inputKeyDownEvent;
    this.keyUpEvent=inputKeyUpEvent;
    
    this.run=inputRun;
}
