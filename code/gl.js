"use strict";

//
// the main GL object
//

var gl;

//
// intialize GL
//

function initGL(canvas)
{
    try {
        gl=canvas.getContext("experimental-webgl");
    }
    catch (e) {
        alert(e);
        return(false);
    }
    
        // some initial setups
        
    gl.viewport(0,0,canvas.width,canvas.height);
    
    gl.clearColor(0.0,0.0,0.0,1.0);
    gl.enable(gl.DEPTH_TEST);
    
        // cache some values
        
    view.aspect=canvas.width/canvas.height;
    
    return(true);
}
