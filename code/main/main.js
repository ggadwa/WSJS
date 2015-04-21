"use strict";

//
// resource IDs
//

var BITMAP_BRICK_STACK=0;
var BITMAP_BRICK_RANDOM=1;
var BITMAP_STONE=2;
var BITMAP_TILE=3;
var BITMAP_TILE_2=4;
var BITMAP_STAIR_TILE=5;
var BITMAP_METAL=6;
var BITMAP_CONCRETE=7;
var BITMAP_WOOD_PLANK=8;
var BITMAP_WOOD_BOX=9;

//
// constants
//

var WS_PHYSICS_MSECS=16;
var WS_DRAW_MSECS=16;
var WS_BAIL_MSECS=5000;

var AMBIENT_R=0.35;
var AMBIENT_G=0.35;
var AMBIENT_B=0.35;

var MAX_ROOM=5;
var SIMPLE_LIGHTMAP=true;

//
// textures to build
//

var wsTextureBuildList=
    [
        [BITMAP_BRICK_STACK,genBitmap.TYPE_BRICK_STACK],
        [BITMAP_BRICK_RANDOM,genBitmap.TYPE_BRICK_RANDOM],
        [BITMAP_STONE,genBitmap.TYPE_STONE],
        [BITMAP_TILE,genBitmap.TYPE_TILE_SIMPLE],
        [BITMAP_TILE_2,genBitmap.TYPE_TILE_COMPLEX],
        [BITMAP_STAIR_TILE,genBitmap.TYPE_TILE_SMALL],
        [BITMAP_METAL,genBitmap.TYPE_METAL],
        [BITMAP_CONCRETE,genBitmap.TYPE_CONCRETE],
        [BITMAP_WOOD_PLANK,genBitmap.TYPE_WOOD_PLANK],
        [BITMAP_WOOD_BOX,genBitmap.TYPE_WOOD_BOX]
    ];

//
// global objects
//

var gl=null;        // supergumba -- delete!
var view=new viewObject();
var camera=new cameraObject();
var map=new mapObject();
var modelList=new modelListObject();
var text=new textObject();
var input=new inputObject();
var debug=new debugObject();

var testModel=new modelObject(null,new modelSkeletonObject());

//
// main loop
//

function wsLoopRun(timeStamp)
{
        // next frame
        
    if (view.loopCancel) return;
    window.requestAnimationFrame(wsLoopRun);
    
        // get integer msec timestamp
    
    var ts=Math.floor(timeStamp);
   
        // physics and input
    
    var physicsTick=ts-view.loopLastPhysicTimeStamp;
    view.loopLastPhysicTimeStamp=ts;
    
    if (physicsTick>WS_BAIL_MSECS) return;
    
    while (physicsTick>WS_PHYSICS_MSECS) {
        physicsTick-=WS_PHYSICS_MSECS;
        
        input.run(camera);
    }
    
        // drawing
        
    var drawTick=ts-view.loopLastDrawTimeStamp;
    
    if (drawTick>WS_DRAW_MSECS) {
        view.loopLastDrawTimeStamp=ts; 

        view.draw(map,text,camera);
        
        view.fpsTotal+=drawTick;
        view.fpsCount++;
    }
    
        // the fps
    
    var fpsTime=ts-view.fpsStartTimeStamp;
    if (fpsTime>=1000) {
        view.fps=((view.fpsTotal/view.fpsCount)*1000.0)/fpsTime;
        view.fpsStartTimeStamp=ts;
        
        view.fpsTotal=0;
        view.fpsCount=0;
    }
}

function wsLoopStart()
{
    var timeStamp=window.performance.now();
    var ts=Math.floor(timeStamp);
    
    view.loopLastPhysicTimeStamp=ts;
    view.loopLastDrawTimeStamp=ts;
    
    view.fps=0.0;
    view.fpsTotal=0;
    view.fpsCount=0;
    view.fpsStartTimeStamp=ts;

    view.loopCancel=false;
    
    wsLoopRun(timeStamp);    
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
        // cancel the loop
        
    view.loopCancel=true;
    
        // close old map
        
    map.clear();
    
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
    
        // start the initialization
        
    wsStageStatus('Initializing WebGL');
    setTimeout(wsInitWebGL,10);
}
    
function wsInitWebGL()
{
        // the drawing canvas
        
    //var canvas=canvasSetup();

        // init opengl
    
    if (!view.initialize("wsCanvas")) return;
    gl=view.gl;
        
    //if (!initGL(view,canvas)) return;
    
        // next step
    
    wsUpdateStatus();
    wsStageStatus('Initializing Internal Structures');
    setTimeout(wsInitInternal,10);
}
    
function wsInitInternal()
{
    if (!map.initialize(view)) return;
    if (!modelList.initialize(view)) return;
    if (!text.initialize()) return;
    if (!debug.initialize()) return;
    
        // next step
    
    wsUpdateStatus();
    wsStageStatus('Generating Dynamic Textures');
    setTimeout(function() { wsInitBuildTextures(0); },10);
}

function wsInitBuildTextures(idx)
{
    var bitmapCount=wsTextureBuildList.length;
    
        // random seed

    if (idx===0) {
        wsStartStatusBar(bitmapCount);
        genRandom.setSeed(parseInt(document.getElementById('wsBitmapRandom').value));
    }
    
        // generate the bitmap
    
    var setup=wsTextureBuildList[idx];
    
    map.addBitmap(genBitmap.generate(setup[0],setup[1],debug));
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
        
    input.initialize(view);

        // start the main loop
    
    wsLoopStart();
}


