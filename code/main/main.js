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

var MONSTER_MODEL_COUNT=5;
var MONSTER_ENTITY_COUNT=5;

//
// debugging and quick start up flags
//

var MAX_ROOM=1;
var SIMPLE_LIGHTMAP=true;

//
// textures to build
//

var wsTextureBuildList=
    [
        [BITMAP_BRICK_STACK,GEN_BITMAP_TYPE_BRICK_STACK],
        [BITMAP_BRICK_RANDOM,GEN_BITMAP_TYPE_BRICK_RANDOM],
        [BITMAP_STONE,GEN_BITMAP_TYPE_STONE],
        [BITMAP_TILE,GEN_BITMAP_TYPE_TILE_SIMPLE],
        [BITMAP_TILE_2,GEN_BITMAP_TYPE_TILE_COMPLEX],
        [BITMAP_STAIR_TILE,GEN_BITMAP_TYPE_TILE_SMALL],
        [BITMAP_METAL,GEN_BITMAP_TYPE_METAL],
        [BITMAP_CONCRETE,GEN_BITMAP_TYPE_CONCRETE],
        [BITMAP_WOOD_PLANK,GEN_BITMAP_TYPE_WOOD_PLANK],
        [BITMAP_WOOD_BOX,GEN_BITMAP_TYPE_WOOD_BOX],
    ];

//
// global objects
//

var view=new viewObject();
var map=new mapObject();
var modelList=new modelListObject();
var entityList=new entityListObject();
var input=new inputObject();
var debug=new debugObject();

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
        
        input.run(view.camera);
    }
    
        // drawing
        
    var drawTick=ts-view.loopLastDrawTimeStamp;
    
    if (drawTick>WS_DRAW_MSECS) {
        view.loopLastDrawTimeStamp=ts; 

        view.draw(map,entityList);
        
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
        
    map.clear(view);
    
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
    document.getElementById('wsModelRandom').value=Math.floor(Math.random()*0xFFFFFFFF);
    document.getElementById('wsEntityRandom').value=Math.floor(Math.random()*0xFFFFFFFF);
    //document.getElementById('wsBitmapRandom').value=123456789; // supergumba -- a version to create the same map everytime for speed testing
    //document.getElementById('wsMapRandom').value=123456789;
    //document.getElementById('wsModelRandom').value=123456789;
    //document.getElementById('wsEntityRandom').value=123456789;
    
        // start the initialization
        
    wsStageStatus('Initializing WebGL');
    setTimeout(wsInitWebGL,10);
}
    
function wsInitWebGL()
{
        // init view
        // webgl and canvas stuff
    
    if (!view.initialize("wsCanvas")) return;
    
        // next step
    
    wsUpdateStatus();
    wsStageStatus('Initializing Internal Structures');
    setTimeout(wsInitInternal,10);
}
    
function wsInitInternal()
{
    if (!map.initialize(view)) return;
    if (!modelList.initialize(view)) return;
    if (!entityList.initialize(view)) return;
    if (!debug.initialize(view)) return;
    
        // next step
        
    var textureGenRandom=new genRandomObject(parseInt(document.getElementById('wsBitmapRandom').value));
    
    wsUpdateStatus();
    wsStageStatus('Generating Dynamic Textures');
    setTimeout(function() { wsInitBuildTextures(0,textureGenRandom); },10);
}

function wsInitBuildTextures(idx,textureGenRandom)
{
    var bitmapCount=wsTextureBuildList.length;
    
        // random seed

    if (idx===0) wsStartStatusBar(bitmapCount);
    
        // generate the bitmap
    
    var setup=wsTextureBuildList[idx];
    var genBitmap=new genBitmapObject(textureGenRandom);
    
    map.addBitmap(genBitmap.generate(view,setup[0],setup[1],debug));
    wsNextStatusBar();
    
        // if more textures, then loop back around
        
    idx++;
    if (idx<wsTextureBuildList.length) {
        setTimeout(function() { wsInitBuildTextures(idx,textureGenRandom); },10);
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

    var mapGenRandom=new genRandomObject(parseInt(document.getElementById('wsMapRandom').value));

        // build the map
   
    var setup=new buildMapSetupObject(this.MAX_ROOM,3,[18000,5000,18000],3,0.25,0.8);
    var genMap=new genMapObject(view,map,setup,mapGenRandom);
    genMap.build();
    
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
    
    var genLightmap=new genLightmapObject(view,map,this.SIMPLE_LIGHTMAP,wsInitBuildLightmapFinish);
    genLightmap.create();
}

function wsInitBuildLightmapFinish()
{
    wsUpdateStatus();
    wsStageStatus('Building Models');
    setTimeout(wsInitBuildModels,10);
}

function wsInitBuildModels()
{
    var n;
    var model,genSkeleton;
    
    var modelGenRandom=new genRandomObject(parseInt(document.getElementById('wsModelRandom').value));
    
        // supergumba -- temporary
        // do this all by callback alter
        
    var genBitmap=new genBitmapObject(modelGenRandom);    
    genBitmap.generate(view,0,GEN_BITMAP_TYPE_SKIN,debug);
    
        // player model

    model=new modelObject('player');
    genSkeleton=new genSkeletonObject(model,modelGenRandom);
    genSkeleton.build();
    
    modelList.add(model);
    
        // monster models
    
    for (n=0;n!==MONSTER_MODEL_COUNT;n++) {
        model=new modelObject('monster_'+n);
        genSkeleton=new genSkeletonObject(model,modelGenRandom);
        genSkeleton.build();
        
        modelList.add(model);
    }
    
        // next step
    
    wsUpdateStatus();
    wsStageStatus('Building Entities');
    setTimeout(wsInitBuildEntities,10);
}

function wsInitBuildEntities()
{
    var n,monsterModelName;
    
    var entityGenRandom=new genRandomObject(parseInt(document.getElementById('wsEntityRandom').value));
    
        // make player entity
        
    var mapMid=view.OPENGL_FAR_Z/2;
    entityList.addPlayer(new entityObject(new wsPoint(mapMid,mapMid,mapMid),new wsAngle(0.0,0.0,0.0),modelList.get('player'),true));
    
        // make monster entities
        
    for (n=0;n!==MONSTER_ENTITY_COUNT;n++) {
        monsterModelName='monster_'+entityGenRandom.randomInt(0,MONSTER_MODEL_COUNT);
        entityList.add(new entityObject(map.findRandomPosition(entityGenRandom),new wsAngle(0.0,0.0,0.0),modelList.get(monsterModelName),false));
    }
    
        // add entities to map
        
    wsUpdateStatus();
    wsStageStatus('Running');
    setTimeout(wsInitFinish,10);    
}

function wsInitFinish()
{
        // finish by setting up all the mesh
        // buffers and indexes
        
    map.setupBuffers(view);
    
        // the initial camera position
        
    var mapMid=view.OPENGL_FAR_Z/2;

    view.camera.position.set(mapMid,mapMid,mapMid);
    view.camera.angle.set(0.0,0.0,0.0);
    
        // ambient
        
    view.ambient.set(AMBIENT_R,AMBIENT_G,AMBIENT_B);
    
        // start the input
        
    input.initialize(view);

        // start the main loop
    
    wsLoopStart();
}


