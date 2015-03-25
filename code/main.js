"use strict";

//
// resource IDs
//

var SHADER_DEBUG=0;
var SHADER_NORMAL=1;

var BITMAP_BRICK_STACK=0;
var BITMAP_BRICK_RANDOM=1;
var BITMAP_TILE=2;
var BITMAP_METAL=3;
var BITMAP_CONCRETE=4;
var BITMAP_WOOD_PLANK=5;
var BITMAP_WOOD_BOX=6;

//
// constants
//

var AMBIENT_R=0.3;
var AMBIENT_G=0.3;
var AMBIENT_B=0.3;

var MAX_ROOM=15;
var SIMPLE_LIGHTMAP=true;

//
// textures to build
//

var wsTextureBuildList=
    [
        [BITMAP_BRICK_STACK,genBitmap.TYPE_BRICK_STACK],
        [BITMAP_BRICK_RANDOM,genBitmap.TYPE_BRICK_RANDOM],
        [BITMAP_TILE,genBitmap.TYPE_TILE],
        [BITMAP_METAL,genBitmap.TYPE_METAL],
        [BITMAP_CONCRETE,genBitmap.TYPE_CONCRETE],
        [BITMAP_WOOD_PLANK,genBitmap.TYPE_WOOD_PLANK],
        [BITMAP_WOOD_BOX,genBitmap.TYPE_WOOD_BOX]
    ];

//
// global objects
//

var view=new wsViewObject();
var camera=new wsCameraObject();
var map=new mapObject();

var timer=null;

//
// mainline draw
//

function drawView()
{
    //gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    
        // convert view lights to shader lights
        
    map.createViewLightsFromMapLights(view,camera);
    
        // create the perspective matrix
        
    mat4.perspective(view.perspectiveMatrix,view.OPENGL_FOV,view.aspect,view.OPENGL_NEAR_Z,view.OPENGL_FAR_Z);
    mat4.translate(view.perspectiveMatrix,view.perspectiveMatrix,vec3.fromValues(0,0,view.OPENGL_NEAR_Z));

        // get the eye point and rotate it
        // around the view position

    var eye=vec3.create();
    var pos=camera.position.toVec3();
    vec3.add(eye,pos,vec3.fromValues(0.0,0.0,-view.OPENGL_NEAR_Z));
    vec3.rotateX(eye,eye,pos,glMatrix.toRadian(camera.angle.x));
    vec3.rotateY(eye,eye,pos,glMatrix.toRadian(camera.angle.y));

        // setup the look at

    mat4.lookAt(view.modelMatrix,eye,pos,view.lookAtUpVector);
    
        // create the 3x3 normal matrix
        // the normal is the invert-transpose of the model matrix
    
    var normal4x4Mat=mat4.create();
    mat4.invert(normal4x4Mat,view.modelMatrix);
    mat4.transpose(normal4x4Mat,normal4x4Mat);
    
    mat3.fromMat4(view.normalMatrix,normal4x4Mat);
    
        // start the shaders
        // and bitmaps
        
    shader.drawStart(view);
    bitmap.drawStart();
    lightmap.drawStart();

        // draw the map
        
    map.draw();

        // unbind the shaders
        // and bitmaps
    
    lightmap.drawEnd();
    bitmap.drawEnd();
    shader.drawEnd();
}

//
// main loop
//

function wsLoop()
{
    inputRun();
    drawView();
}

//
// status print out
//

var oldStatusStr;
var statusStartMS;

function wsStageStatus(status)
{
    var elem=document.getElementById('wsStatusText');
    
    oldStatusStr=elem.innerHTML;
    oldStatusStr+=status;
    
    elem.innerHTML=(oldStatusStr+'...');
    
    statusStartMS=Date.now();
}

function wsClearStatus()
{
    document.getElementById('wsStatusText').innerHTML='';
}

function wsUpdateStatus()
{
    var elem=document.getElementById('wsStatusText');

    var completeMS=Date.now()-statusStartMS;
    
    elem.innerHTML=(oldStatusStr+' '+completeMS+'ms<br>');
}

var wsStatusBarCount;
var wsStatusBarMaxCount;

function wsStartStatusBar(maxCount)
{
    wsStatusBarCount=-1;
    wsStatusBarMaxCount=maxCount;
    wsNextStatusBar();
}

function wsNextStatusBar()
{
    wsStatusBarCount++;
    if (wsStatusBarCount>wsStatusBarMaxCount) wsStatusBarCount=wsStatusBarMaxCount;
    document.getElementById('wsStatusBarFill').style.width=((wsStatusBarCount/wsStatusBarMaxCount)*100.0)+'%';
}

//
// Refresh
//

function wsRefresh()
{
        // close old map
        
    map.close();
    lightmap.close();
    bitmap.close();
    
        // start at the texture generating step
    
    wsClearStatus();
    wsStageStatus('Generating Dynamic Textures');
    setTimeout(function() { wsInitBuildTextures(0); },10);
}

//
// initialize web-shooter
//
// we do this in a couple timeout steps so
// browser doesn't halt a long running script
//

function wsInit()
{
        // setup the random numbers
    
    document.getElementById('wsBitmapRandom').value=Math.floor(Math.random()*0xFFFFFFFF);
    document.getElementById('wsMapRandom').value=Math.floor(Math.random()*0xFFFFFFFF);
    //document.getElementById('wsBitmapRandom').value=123456789; // supergumba -- a version to create the same map everytime for speed testing
    //document.getElementById('wsMapRandom').value=123456789;
    
        // no timer yet
        
    timer=null;

        // start the initialization
        
    wsStageStatus('Initializing WebGL');
    setTimeout(wsInitWebGL,10);
}
    
function wsInitWebGL()
{
        // the drawing canvas
        
    var canvas=canvasSetup();

        // init opengl
        
    if (!initGL(canvas)) return;
    
        // next step
    
    wsUpdateStatus();
    wsStageStatus('Loading Shaders');
    setTimeout(wsInitLoadShaders,10);
}
    
function wsInitLoadShaders()
{
        // load the shaders
        
    if (!shader.load(SHADER_DEBUG,'wsVertDebugShader','wsFragDebugShader')) return;
    if (!shader.load(SHADER_NORMAL,'wsVertTextureShader','wsFragTextureShader')) return;
    
        // next step
    
    wsUpdateStatus();
    wsStageStatus('Generating Dynamic Textures');
    setTimeout(function() { wsInitBuildTextures(0); },10);
}

function wsInitBuildTextures(idx)
{
    var bitmapCount=wsTextureBuildList.length;
    
        // random seed

    if (idx==0) {
        wsStartStatusBar(bitmapCount);
        genRandom.setSeed(parseInt(document.getElementById('wsBitmapRandom').value));
    }
    
        // generate the bitmap
    
    var setup=wsTextureBuildList[idx];
    
    genBitmap.generate(setup[0],setup[1],null);
    wsNextStatusBar();
    
        // if more textures, then loop back around
        
    idx++;
    if (idx<wsTextureBuildList.length) {
        setTimeout(function() { wsInitBuildTextures(idx); },10);
        return;
    }
    
        // next step
    
    wsUpdateStatus();
    wsStageStatus('Generating Dynamic Map');
    setTimeout(wsInitBuildMap,10);
}

function wsInitBuildMap()
{
        // random seed

    genRandom.setSeed(parseInt(document.getElementById('wsMapRandom').value));

        // build the map
        
    genMap.build(map,new buildMapSetupObject(this.MAX_ROOM,3,[18000,5000,18000],3,0.25,0.8));
    
        // next step
    
    wsUpdateStatus();
    wsStageStatus('Building Light Map');
    setTimeout(wsInitBuildLightmap,10);
}

function wsInitBuildLightmap()
{
        // build the light map
        // light maps are a long running
        // process so we need a callback
        
    genLightmap.create(map,this.SIMPLE_LIGHTMAP,wsInitBuildLightmapFinish);
}

function wsInitBuildLightmapFinish()
{
    wsUpdateStatus();
    wsStageStatus('Running');
    setTimeout(wsInitFinish,10);
}

function wsInitFinish()
{
        // finish by setting up all the mesh
        // buffers and indexes
        
    map.setupBuffers();
    
        // the initial camera position
        
    var mapMid=view.OPENGL_FAR_Z/2;

    camera.position.set(mapMid,mapMid,mapMid);
    camera.angle.set(0.0,0.0,0.0);
    
        // ambient
        
    view.ambient.set(AMBIENT_R,AMBIENT_G,AMBIENT_B);
    
        // start the input
        
    inputStart();

        // run the main interval
        // do set this up if we already have one
        
    if (timer===null) timer=setInterval(wsLoop,WS_FPS_TIMER_MSECS);
}


