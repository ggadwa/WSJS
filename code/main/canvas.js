"use strict";

var canvas=null;
var canvasTopLeft=[0,0];

//
// setup canvas
//
function canvasSetup()
{
        // get the canvas
        
    canvas=document.getElementById("wsCanvas");
    
    canvasTopLeft[0]=parseInt(canvas.style.left);
    canvasTopLeft[1]=parseInt(canvas.style.top);
        
        // setup the events
        
    document.addEventListener("keydown",inputKeyDownEvent,false);
    document.addEventListener("keyup",inputKeyUpEvent,false);
//    document.addEventListener("mousemove",inputMouseMoveEvent,false);   // TODO - use pointerlock here
    
    return(canvas);
}