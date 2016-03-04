"use strict";

//
// textures to build
//

var textureBuildList=
    [
        ['Map Wall',[GEN_BITMAP_TYPE_BRICK_STACK,GEN_BITMAP_TYPE_BRICK_RANDOM,GEN_BITMAP_TYPE_STONE,GEN_BITMAP_TYPE_PLASTER]],
        ['Map Floor',[GEN_BITMAP_TYPE_TILE_SIMPLE,GEN_BITMAP_TYPE_TILE_COMPLEX,GEN_BITMAP_TYPE_TILE_SMALL,GEN_BITMAP_TYPE_MOSAIC]],
        ['Map Ceiling',[GEN_BITMAP_TYPE_METAL,GEN_BITMAP_TYPE_METAL_BAR,GEN_BITMAP_TYPE_CONCRETE,GEN_BITMAP_TYPE_WOOD_PLANK]],
        ['Map Stairs',[GEN_BITMAP_TYPE_TILE_SIMPLE,GEN_BITMAP_TYPE_TILE_SMALL,GEN_BITMAP_TYPE_CONCRETE]],
        ['Map Platform',[GEN_BITMAP_TYPE_METAL,GEN_BITMAP_TYPE_METAL_CORRUGATED,GEN_BITMAP_TYPE_WOOD_PLANK]],
        ['Map Ledge',[GEN_BITMAP_TYPE_TILE_SIMPLE,GEN_BITMAP_TYPE_TILE_COMPLEX,GEN_BITMAP_TYPE_TILE_SMALL,GEN_BITMAP_TYPE_MOSAIC]],
        ['Map Metal',[GEN_BITMAP_TYPE_METAL]],
        ['Map Box',[GEN_BITMAP_TYPE_WOOD_BOX,GEN_BITMAP_TYPE_METAL,GEN_BITMAP_TYPE_METAL_BAR]],
        ['Map Pillar',[GEN_BITMAP_TYPE_TILE_SMALL,GEN_BITMAP_TYPE_CONCRETE,GEN_BITMAP_TYPE_PLASTER]],
        ['Map Closet',[GEN_BITMAP_TYPE_BRICK_STACK,GEN_BITMAP_TYPE_BRICK_RANDOM,GEN_BITMAP_TYPE_STONE,GEN_BITMAP_TYPE_PLASTER]],
        ['Map Machine',[GEN_BITMAP_TYPE_MACHINE]],
        ['Skin Scale',[GEN_BITMAP_TYPE_SKIN_SCALE]],
        ['Skin Leather',[GEN_BITMAP_TYPE_SKIN_LEATHER]],
        ['Skin Fur',[GEN_BITMAP_TYPE_SKIN_FUR]]
    ];
    
var soundBuildList=
    [
        ['fire',GEN_SOUND_GUN_FIRE],
        ['explosion',GEN_SOUND_EXPLOSION],
        ['monster scream',GEN_SOUND_MONSTER_SCREAM]
    ];

//
// global objects
//

var view=new ViewObject();
var bitmapList=new BitmapListObject(view);
var soundList=new SoundListObject();
var map=new MapObject();
var modelList=new ModelListObject();
var entityList=new EntityListObject();
var input=new InputObject(view,entityList);
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
    
    view.timeStamp=Math.trunc(timeStamp);
    
        // run the input
        
    input.run();
    
        // entities and physics
    
    var physicsTick=view.timeStamp-view.loopLastPhysicTimeStamp;
    view.loopLastPhysicTimeStamp=view.timeStamp;
    
    if (physicsTick>BAIL_MILLISECONDS) return;
    
    while (physicsTick>PHYSICS_MILLISECONDS) {
        physicsTick-=PHYSICS_MILLISECONDS;
        
        entityList.run(view,soundList,map);
    }
    
        // update the listener
    
    soundList.setListenerToEntity(entityList.getPlayer());
    
        // drawing
        
    var drawTick=view.timeStamp-view.loopLastDrawTimeStamp;
    
    if (drawTick>DRAW_MILLISECONDS) {
        view.loopLastDrawTimeStamp=view.timeStamp; 

        view.draw(map,entityList);
        
        view.fpsTotal+=drawTick;
        view.fpsCount++;
    }
    
        // the fps
    
    var fpsTime=view.timeStamp-view.fpsStartTimeStamp;
    if (fpsTime>=1000) {
        view.fps=(view.fpsCount*1000.0)/view.fpsTotal;
        view.fpsStartTimeStamp=view.timeStamp;
        
        view.fpsTotal=0;
        view.fpsCount=0;
    }
}

function wsLoopStart()
{
    var timeStamp=window.performance.now();
    
    view.timeStamp=Math.trunc(timeStamp);
    
    view.loopLastPhysicTimeStamp=view.timeStamp;
    view.loopLastDrawTimeStamp=view.timeStamp;
    
    view.fps=0.0;
    view.fpsTotal=0;
    view.fpsCount=0;
    view.fpsStartTimeStamp=view.timeStamp;

    view.loopCancel=false;
    
    wsLoopRun(timeStamp);    
}

//
// initialize web-shooter
//
// we do this in a couple timeout steps so
// browser doesn't halt a long running script
//

function wsInit()
{
    fileCacheStart(wsInitGL);       // this contains all the shaders, needs to be loaded first
}

function wsInitGL()
{
        // init view
        // webgl and canvas stuff
    
    if (!view.initialize("wsCanvas")) return;
    
        // next step
        
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Initialized WebGL');
    view.loadingScreenAddString('Initializing Internal Structures');
    view.loadingScreenDraw(null);
    
    setTimeout(wsInitInternal,PROCESS_TIMEOUT_MSEC);
}
    
function wsInitInternal()
{
    if (!bitmapList.initialize()) return;
    if (!soundList.initialize()) return;
    if (!map.initialize(view)) return;
    if (!modelList.initialize(view)) return;
    if (!entityList.initialize(view)) return;
    if (!debug.initialize(view)) return;
    
        // create list of dynamic textures
        
    var textureGenRandom=new GenRandomObject(SEED_MAP_BITMAP);
    
        // next step
    
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Generating Dynamic Textures');
    view.loadingScreenDraw(null);
    
    setTimeout(function() { wsInitBuildTextures(0,textureGenRandom); },PROCESS_TIMEOUT_MSEC);
}

function wsInitBuildTextures(idx,textureGenRandom)
{
    var bitmapCount=textureBuildList.length;
    
        // bitmap name
        
    var name=textureBuildList[idx][0];
    
        // pick a random texture type
    
    var bitmapTypeList=textureBuildList[idx][1];
    var k=textureGenRandom.randomIndex(bitmapTypeList.length);
    var bitmapType=bitmapTypeList[k];
    
        // generate bitmap
    
    var genBitmap=new GenBitmapObject(textureGenRandom);
    bitmapList.add(genBitmap.generate(view,name,bitmapType,debug));
    
        // if more textures, then loop back around
        
    idx++;
    if (idx<bitmapCount) {
        view.loadingScreenDraw(idx/bitmapCount);
        setTimeout(function() { wsInitBuildTextures(idx,textureGenRandom); },PROCESS_TIMEOUT_MSEC);
        return;
    }
    
        // next step
        
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Generating Dynamic Sounds');
    view.loadingScreenDraw(null);

    setTimeout(function() { wsInitBuildSounds(0,new GenRandomObject(SEED_ENTITY)); },PROCESS_TIMEOUT_MSEC);
}

function wsInitBuildSounds(idx,soundGenRandom)
{
    var soundCount=soundBuildList.length;
    
        // name and type
        
    var name=soundBuildList[idx][0];
    var generateType=soundBuildList[idx][1];
    
         // generate sound
    
    var genSound=new GenSoundObject(soundList.getAudioContext(),soundGenRandom);
    soundList.add(genSound.generate(name,generateType,debug));
    
        // if more textures, then loop back around
        
    idx++;
    if (idx<soundCount) {
        view.loadingScreenDraw(idx/soundCount);
        setTimeout(function() { wsInitBuildSounds(idx,soundGenRandom); },PROCESS_TIMEOUT_MSEC);
        return;
    }
    
            // next step
        
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Generating Dynamic Map');
    view.loadingScreenDraw(null);

    setTimeout(wsInitBuildMap,PROCESS_TIMEOUT_MSEC);
}

function wsInitBuildMap()
{
        // random seed

    var mapGenRandom=new GenRandomObject(SEED_MAP);

        // build the map
        
    var genMap=new GenMapObject(view,bitmapList,map,mapGenRandom,wsInitBuildMapFinish);
    genMap.build();
}

function wsInitBuildMapFinish()
{
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Building Collision Geometry');
    view.loadingScreenDraw(null);

    setTimeout(wsInitBuildCollisionGeometry,PROCESS_TIMEOUT_MSEC);
}

function wsInitBuildCollisionGeometry()
{
        // build the collision geometry

    map.buildCollisionGeometry();

        // build the light/mesh intersection lists

    map.buildLightMeshIntersectLists();
    
        // next step
    
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Building Light Map');
    view.loadingScreenDraw(null);

    setTimeout(wsInitBuildLightmap,PROCESS_TIMEOUT_MSEC);
}

function wsInitBuildLightmap()
{
        // build the light map
        // light maps are a long running
        // process so we need a callback

    var genLightmap=new GenLightmapObject(view,bitmapList,map,debug,MAP_GENERATE_LIGHTMAP,wsInitBuildLightmapFinish);
    genLightmap.create();
}

function wsInitBuildLightmapFinish()
{
    var modelGenRandom=new GenRandomObject(SEED_MODEL);
    
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Generating Dynamic Models');
    view.loadingScreenDraw(null);

    setTimeout(function() { wsInitBuildModelsMesh(0,modelGenRandom); },PROCESS_TIMEOUT_MSEC);
}

function wsInitBuildModelsMesh(idx,modelGenRandom)
{
    var model,genSkeleton,genModelMesh;
    
        // get bitmap
        
    var skinTypes=['Skin Scale','Skin Leather','Skin Fur'];
    var modelBitmap=bitmapList.get(skinTypes[idx%3]);
    
        // player model if 0
        // else a monster
        
    if (idx===0) {
        model=new ModelObject('player',MODEL_TYPE_HUMANOID);
    }
    else {
        model=new ModelObject(('monster_'+(idx-1)),((idx-1)%3));        // supergumba -- TESTING -- always make at least one of each type
    //    model=new ModelObject(('monster_'+(idx-1)),MODEL_TYPE_HUMANOID);
    }
    
        // build the skeleton and mesh
    
    genSkeleton=new GenModelOrganicSkeletonObject(model,modelGenRandom);
    genSkeleton.build();
    
    genModelMesh=new GenModelOrganicMeshObject(model,modelBitmap,modelGenRandom);
    genModelMesh.build(view);
    
    modelList.add(model);
    
        // if more models, then loop back around
    
    view.loadingScreenDraw(idx/MONSTER_MODEL_COUNT);    
        
    idx++;
    if (idx<(MONSTER_MODEL_COUNT+1)) {
        setTimeout(function() { wsInitBuildModelsMesh(idx,modelGenRandom); },PROCESS_TIMEOUT_MSEC);
        return;
    }
    
        // next step
        
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Generating Dynamic Weapons');
    view.loadingScreenDraw(null);
    
    setTimeout(function() { wsInitBuildWeapons(modelGenRandom); },PROCESS_TIMEOUT_MSEC);
}

function wsInitBuildWeapons(modelGenRandom)
{
    var modelBitmap=bitmapList.get('Map Metal');        // for now just use map metal
    
        // weapon
        
    var model=new ModelObject('weapon_0',MODEL_TYPE_WEAPON);
    
    var genModelWeaponMesh=new GenModelWeaponMeshObject(model,modelBitmap,modelGenRandom);
    genModelWeaponMesh.build(view);
    
    modelList.add(model);
    
        // projectile
        
    var model=new ModelObject('projectile_0',MODEL_TYPE_PROJECTILE);
    
    var genModelProjectileMesh=new GenModelProjectileMeshObject(model,modelBitmap,modelGenRandom);
    genModelProjectileMesh.build(view);
    
    modelList.add(model);

        // next step
        
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Generating Dynamic Entities');
    view.loadingScreenDraw(null);
    
    setTimeout(wsInitBuildEntities,PROCESS_TIMEOUT_MSEC);
}

function wsInitBuildEntities()
{
    var n,monsterModelName;
    var model,pos;
    
    var entityGenRandom=new GenRandomObject(SEED_ENTITY);
    
        // make player entity
    
    pos=map.findRandomEntityPosition(entityGenRandom);
    if (pos===null) {
        alert('Couldn\'t find a place to spawn player!');
        return;
    }

    var playerEntity=new EntityPlayerObject('Player',pos,new wsPoint(0.0,0.0,0.0),2000,5000,modelList.get('player'));
    playerEntity.addWeapon(new WeaponObject(modelList.get('weapon_0'),modelList.get('projectile_0'),soundList.get('fire'),soundList.get('explosion')));
    playerEntity.setCurrentWeaponIndex(0);
    
    entityList.setPlayer(playerEntity);
    
        // make monster entities
        // we clone their models in the list so each entity gets
        // it's own model
        
    for (n=0;n!==MONSTER_ENTITY_COUNT;n++) {
        pos=map.findRandomEntityPosition(entityGenRandom);
        if (pos===null) continue;
        
        monsterModelName='monster_'+(n%3); // entityGenRandom.randomInt(0,MONSTER_MODEL_COUNT);     // supergumba -- testing -- to get all monster types
        model=modelList.clone(view,monsterModelName);
        
        entityList.add(new EntityMonsterObject(('Monster'+n),pos,new wsPoint(0.0,(entityGenRandom.random()*360.0),0.0),2000,5000,model));
    }
    
        // finished
        
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Running');
    view.loadingScreenDraw(null);
        
    setTimeout(wsInitFinish,PROCESS_TIMEOUT_MSEC);    
}

function wsInitFinish()
{
        // finish by setting up all the mesh
        // buffers and indexes
        
    map.setupBuffers(view);
    
        // ambient
        
    view.ambient.set(MAP_LIGHT_AMBIENT[0],MAP_LIGHT_AMBIENT[1],MAP_LIGHT_AMBIENT[2]);
    
        // start the input
        
    input.initialize(entityList.getPlayer());

        // start the main loop
    
    wsLoopStart();
}


