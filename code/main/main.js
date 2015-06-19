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

var AMBIENT_R=0.25;
var AMBIENT_G=0.25;
var AMBIENT_B=0.25;

var MAP_MAX_ROOM_DIMENSIONS=[35000,7000,35000];

var MONSTER_MODEL_COUNT=1;
var MONSTER_ENTITY_COUNT=8;

//
// debugging and quick start up flags
//

var MAX_ROOM=10;
var SIMPLE_LIGHTMAP=true;

var RANDOM_MAP_BITMAP=Math.floor(Math.random()*0xFFFFFFFF);
var RANDOM_MAP=Math.floor(Math.random()*0xFFFFFFFF);
var RANDOM_MODEL_BITMAP=Math.floor(Math.random()*0xFFFFFFFF);
var RANDOM_MODEL=Math.floor(Math.random()*0xFFFFFFFF);
var RANDOM_ENTITY=Math.floor(Math.random()*0xFFFFFFFF);

//RANDOM_MAP=1984704624;    // testing

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

var view=new ViewObject();
var map=new MapObject();
var modelList=new ModelListObject();
var entityList=new EntityListObject();
var input=new InputObject();
var debug=new DebugObject();

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
    
        // run the input
        
    input.run();
   
        // entities and physics
    
    var physicsTick=ts-view.loopLastPhysicTimeStamp;
    view.loopLastPhysicTimeStamp=ts;
    
    if (physicsTick>WS_BAIL_MSECS) return;
    
    while (physicsTick>WS_PHYSICS_MSECS) {
        physicsTick-=WS_PHYSICS_MSECS;
        
        entityList.run(map);
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
    
    document.getElementById('wsMapBitmapRandom').value=RANDOM_MAP_BITMAP;
    document.getElementById('wsMapRandom').value=RANDOM_MAP;
    document.getElementById('wsModelBitmapRandom').value=RANDOM_MODEL_BITMAP;
    document.getElementById('wsModelRandom').value=RANDOM_MODEL;
    document.getElementById('wsEntityRandom').value=RANDOM_ENTITY;

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
        
    var textureGenRandom=new GenRandomObject(parseInt(document.getElementById('wsMapBitmapRandom').value));
    
    wsUpdateStatus();
    wsStageStatus('Generating Dynamic Textures');
    setTimeout(function() { wsInitBuildTextures(0,textureGenRandom); },10);
}

function wsInitBuildTextures(idx,textureGenRandom)
{
    var bitmapCount=wsTextureBuildList.length;
    
        // start status
        
    if (idx===0) wsStartStatusBar(bitmapCount);
    
        // generate the bitmap
    
    var setup=wsTextureBuildList[idx];
    var genBitmap=new GenBitmapObject(textureGenRandom);
    
    map.addBitmap(genBitmap.generate(view,setup[0],setup[1],debug));
    wsNextStatusBar();
    
        // if more textures, then loop back around
        
    idx++;
    if (idx<bitmapCount) {
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

    var mapGenRandom=new GenRandomObject(parseInt(document.getElementById('wsMapRandom').value));

        // build the map
   
    var setup=new BuildMapSetupObject(this.MAX_ROOM,3,MAP_MAX_ROOM_DIMENSIONS,3,0.25,0.8);
    var genMap=new GenMapObject(view,map,setup,mapGenRandom,wsInitBuildMapFinish);
    genMap.build();
}

function wsInitBuildMapFinish()
{
    wsUpdateStatus();
    wsStageStatus('Building Collision Geometry');
    setTimeout(wsInitBuildCollisionGeometry,10);
}

function wsInitBuildCollisionGeometry()
{
        // build the collision geometry

    map.buildCollisionGeometry();

        // build the light/mesh intersection lists

    map.buildLightMeshIntersectLists();
    
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
    
    var genLightmap=new GenLightmapObject(view,map,debug,this.SIMPLE_LIGHTMAP,wsInitBuildLightmapFinish);
    genLightmap.create();
}

function wsInitBuildLightmapFinish()
{
    var textureGenRandom=new GenRandomObject(parseInt(document.getElementById('wsModelBitmapRandom').value));
    var modelGenRandom=new GenRandomObject(parseInt(document.getElementById('wsModelRandom').value));

    wsUpdateStatus();
    wsStageStatus('Building Models');
    setTimeout(function() { wsInitBuildModels(0,textureGenRandom,modelGenRandom); },10);
}

function wsInitBuildModels(idx,textureGenRandom,modelGenRandom)
{
    var n;
    var model,genSkeleton,genModelMesh;
    
        // start status
        
    if (idx===0) wsStartStatusBar(MONSTER_MODEL_COUNT+1);
    
        // get a model texture
        
    var genBitmap=new GenBitmapObject(textureGenRandom);    
    var modelBitmap=genBitmap.generate(view,0,GEN_BITMAP_TYPE_SKIN,debug);
    
    wsNextStatusBar();
    
        // player model if 0
        // else a monster
        
    if (idx===0) {
        model=new ModelObject('player');
    }
    else {
        model=new ModelObject('monster_'+(idx-1));
    }
    
        // build the skeleton and mesh
        
    genSkeleton=new GenSkeletonObject(model,modelGenRandom);
    genSkeleton.build();
    
    genModelMesh=new GenModelMeshObject(model,modelBitmap,modelGenRandom);
    genModelMesh.build(view);
    
    modelList.add(model);
    
        // if more models, then loop back around
        
    idx++;
    if (idx<(MONSTER_MODEL_COUNT+1)) {
        setTimeout(function() { wsInitBuildModels(idx,textureGenRandom,modelGenRandom); },10);
        return;
    }
    
        // next step
    
    wsUpdateStatus();
    wsStageStatus('Building Entities');
    setTimeout(wsInitBuildEntities,10);
}

function wsInitBuildEntities()
{
    var n,monsterModelName;
    
    var entityGenRandom=new GenRandomObject(parseInt(document.getElementById('wsEntityRandom').value));
    
        // make player entity
        
    entityList.addPlayer(new EntityObject(map.findPlayerStartPosition(),new wsAngle(0.0,0.0,0.0),800,modelList.get('player'),true));
    
        // make monster entities
        
    for (n=0;n!==MONSTER_ENTITY_COUNT;n++) {
        monsterModelName='monster_'+entityGenRandom.randomInt(0,MONSTER_MODEL_COUNT);
        entityList.add(new EntityObject(map.findRandomPosition(entityGenRandom),new wsAngle(0.0,0.0,0.0),800,modelList.get(monsterModelName),false));
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
    
        // ambient
        
    view.ambient.set(AMBIENT_R,AMBIENT_G,AMBIENT_B);
    
        // start the input
        
    input.initialize(view,entityList.getPlayer());

        // start the main loop
    
    wsLoopStart();
}


