"use strict";

//
// main class
//

class MainClass
{
    constructor()
    {
        this.fileCache=new FileCacheClass();
        this.view=new ViewClass();
        this.bitmapList=new BitmapListClass(this.view);
        this.soundList=new SoundListClass();
        this.map=new MapClass();
        this.modelList=new ModelListClass();
        this.entityList=new EntityListClass();
        this.input=new InputClass(this.view,this.entityList);
        this.debug=new DebugClass();
        
        this.genBitmap=null;
        this.genSound=null;
        
            // texture list for the map
            
        this.textureBuildList=
            [
                ['Map Wall',[GEN_BITMAP_TYPE_BRICK_STACK,GEN_BITMAP_TYPE_BRICK_RANDOM,GEN_BITMAP_TYPE_STONE,GEN_BITMAP_TYPE_PLASTER]],
                ['Map Floor',[GEN_BITMAP_TYPE_TILE_SIMPLE,GEN_BITMAP_TYPE_TILE_COMPLEX,GEN_BITMAP_TYPE_TILE_SMALL,GEN_BITMAP_TYPE_MOSAIC]],
                ['Map Ceiling',[GEN_BITMAP_TYPE_METAL,GEN_BITMAP_TYPE_METAL_BAR,GEN_BITMAP_TYPE_CONCRETE,GEN_BITMAP_TYPE_WOOD_PLANK]],
                ['Map Stairs',[GEN_BITMAP_TYPE_TILE_SIMPLE,GEN_BITMAP_TYPE_TILE_SMALL,GEN_BITMAP_TYPE_CONCRETE]],
                ['Map Platform',[GEN_BITMAP_TYPE_METAL,GEN_BITMAP_TYPE_METAL_CORRUGATED,GEN_BITMAP_TYPE_WOOD_PLANK]],
                ['Map Ledge',[GEN_BITMAP_TYPE_TILE_SIMPLE,GEN_BITMAP_TYPE_TILE_COMPLEX,GEN_BITMAP_TYPE_TILE_SMALL,GEN_BITMAP_TYPE_MOSAIC]],
                ['Map Metal',[GEN_BITMAP_TYPE_METAL]],
                ['Map Box',[GEN_BITMAP_TYPE_WOOD_BOX,GEN_BITMAP_TYPE_METAL,GEN_BITMAP_TYPE_METAL_BAR]],
                ['Map Pillar',[GEN_BITMAP_TYPE_TILE_SMALL /*,GEN_BITMAP_TYPE_CONCRETE,GEN_BITMAP_TYPE_PLASTER */]],
                ['Map Closet',[GEN_BITMAP_TYPE_BRICK_STACK,GEN_BITMAP_TYPE_BRICK_RANDOM,GEN_BITMAP_TYPE_STONE,GEN_BITMAP_TYPE_PLASTER]],
                ['Map Machine',[GEN_BITMAP_TYPE_MACHINE]],
                ['Skin Scale',[GEN_BITMAP_TYPE_SKIN_SCALE]],
                ['Skin Leather',[GEN_BITMAP_TYPE_SKIN_LEATHER]],
                ['Skin Fur',[GEN_BITMAP_TYPE_SKIN_FUR]]
            ];

            // sound list for the game
            
        this.soundBuildList=
            [
                ['fire',GEN_SOUND_TYPE_GUN_FIRE],
                ['explosion',GEN_SOUND_TYPE_EXPLOSION],
                ['monster scream',GEN_SOUND_TYPE_MONSTER_SCREAM]
            ];
    }

    run()
    {
        this.fileCache.fillCache(this.initGL.bind(this));       // this contains all the shader code, needs to be loaded first
    }

    initGL()
    {
            // init view
            // webgl and canvas stuff

        if (!this.view.initialize(this.fileCache,"wsCanvas")) return;

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Initialized WebGL');
        this.view.loadingScreenAddString('Initializing Internal Structures');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initInternal.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initInternal()
    {
        if (!this.bitmapList.initialize()) return;
        if (!this.soundList.initialize()) return;
        if (!this.map.initialize(this.view,this.fileCache)) return;
        if (!this.modelList.initialize(this.view,this.fileCache)) return;
        if (!this.entityList.initialize(this.view)) return;
        if (!this.debug.initialize(this.view,this.fileCache)) return;

            // dynamic creation classes

        this.genBitmap=new GenBitmapClass(new GenRandomClass(SEED_MAP_BITMAP));
        this.genSound=new GenSoundClass(this.soundList.getAudioContext(),new GenRandomClass(SEED_SOUND));

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Textures');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildTextures.bind(this,0),PROCESS_TIMEOUT_MSEC);
    }

    initBuildTextures(idx)
    {
        var bitmapCount=this.textureBuildList.length;

            // bitmap name

        var name=this.textureBuildList[idx][0];

            // pick a random texture type
            // we borrow the current random generator from the gen bitmap

        var bitmapTypeList=this.textureBuildList[idx][1];
        var k=this.genBitmap.genRandom.randomIndex(bitmapTypeList.length);
        var bitmapType=bitmapTypeList[k];

            // generate bitmap

        this.bitmapList.addBitmap(this.genBitmap.generate(this.view,name,bitmapType));

            // if more textures, then loop back around

        idx++;
        if (idx<bitmapCount) {
            this.view.loadingScreenDraw(idx/bitmapCount);
            setTimeout(this.initBuildTextures.bind(this,idx),PROCESS_TIMEOUT_MSEC);
            return;
        }

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Sounds');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildSounds.bind(this,0),PROCESS_TIMEOUT_MSEC);
    }

    initBuildSounds(idx)
    {
        var soundCount=this.soundBuildList.length;

            // name and type

        var name=this.soundBuildList[idx][0];
        var generateType=this.soundBuildList[idx][1];

             // generate sound

        this.soundList.addSound(this.genSound.generate(name,generateType));

            // if more textures, then loop back around

        idx++;
        if (idx<soundCount) {
            this.view.loadingScreenDraw(idx/soundCount);
            setTimeout(this.initBuildSounds.bind(this,idx),PROCESS_TIMEOUT_MSEC);
            return;
        }

                // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Map');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildMap.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initBuildMap()
    {
        var genMap=new GenMapClass(this.view,this.bitmapList,this.map,new GenRandomClass(SEED_MAP),this.initBuildMapFinish.bind(this));
        genMap.build();
    }

    initBuildMapFinish()
    {
        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Building Collision Geometry');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildCollisionGeometry.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initBuildCollisionGeometry()
    {
            // build the collision geometry

        this.map.buildCollisionGeometry(this.view);

            // build the light/mesh intersection lists

        this.map.buildLightMeshIntersectLists();

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Building Light Map');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildLightmap.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initBuildLightmap()
    {
            // build the light map
            // light maps are a long running
            // process so we need a callback

        var genLightmap=new GenLightmapClass(this.view,this.bitmapList,this.map,this.debug,MAP_GENERATE_LIGHTMAP,this.initBuildLightmapFinish.bind(this));
        genLightmap.create();
    }

    initBuildLightmapFinish()
    {
        var modelGenRandom=new GenRandomClass(SEED_MODEL);

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Models');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildModelsMesh.bind(this,0,modelGenRandom),PROCESS_TIMEOUT_MSEC);
    }

    initBuildModelsMesh(idx,modelGenRandom)
    {
        var model,genSkeleton,genModelMesh;

            // get bitmap

        var skinTypes=['Skin Scale','Skin Leather','Skin Fur'];
        var modelBitmap=this.bitmapList.getBitmap(skinTypes[idx%3]);

            // player model if 0
            // else a monster

        if (idx===0) {
            model=new ModelClass('player',MODEL_TYPE_HUMANOID);
        }
        else {
            model=new ModelClass(('monster_'+(idx-1)),((idx-1)%3));        // supergumba -- TESTING -- always make at least one of each type
        //    model=new ModelClass(('monster_'+(idx-1)),MODEL_TYPE_HUMANOID);
        }

            // build the skeleton and mesh

        genSkeleton=new GenModelOrganicSkeletonClass(model,modelGenRandom);
        genSkeleton.build();

        genModelMesh=new GenModelOrganicMeshClass(model,modelBitmap,modelGenRandom);
        genModelMesh.build(this.view);

        this.modelList.addModel(model);

            // if more models, then loop back around

        this.view.loadingScreenDraw(idx/MONSTER_MODEL_COUNT);    

        idx++;
        if (idx<(MONSTER_MODEL_COUNT+1)) {
            setTimeout(this.initBuildModelsMesh.bind(this,idx,modelGenRandom),PROCESS_TIMEOUT_MSEC);
            return;
        }

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Weapons');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildWeapons.bind(this,modelGenRandom),PROCESS_TIMEOUT_MSEC);
    }

    initBuildWeapons(modelGenRandom)
    {
        var modelBitmap=this.bitmapList.getBitmap('Map Metal');        // for now just use map metal

            // weapon

        var model=new ModelClass('weapon_0',MODEL_TYPE_WEAPON);

        var genModelWeaponMesh=new GenModelWeaponMeshClass(model,modelBitmap,modelGenRandom);
        genModelWeaponMesh.build(this.view);

        this.modelList.addModel(model);

            // projectile

        var model=new ModelClass('projectile_0',MODEL_TYPE_PROJECTILE);

        var genModelProjectileMesh=new GenModelProjectileMeshClass(model,modelBitmap,modelGenRandom);
        genModelProjectileMesh.build(this.view);

        this.modelList.addModel(model);

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Entities');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildEntities.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initBuildEntities()
    {
        var n,monsterModelName;
        var model,pos;

        var entityGenRandom=new GenRandomClass(SEED_ENTITY);

            // make player entity

        pos=this.map.findRandomEntityPosition(entityGenRandom);
        if (pos===null) {
            alert('Couldn\'t find a place to spawn player!');
            return;
        }

        var playerEntity=new EntityPlayerClass('Player',pos,new wsPoint(0.0,0.0,0.0),2000,5000,this.modelList.getModel('player'));
        playerEntity.addWeapon(new WeaponClass(this.modelList.getModel('weapon_0'),this.modelList.getModel('projectile_0'),this.soundList.getSound('fire'),this.soundList.getSound('explosion')));
        playerEntity.setCurrentWeaponIndex(0);

        this.entityList.setPlayer(playerEntity);

            // make monster entities
            // we clone their models in the list so each entity gets
            // it's own model

        for (n=0;n!==MONSTER_ENTITY_COUNT;n++) {
            pos=this.map.findRandomEntityPosition(entityGenRandom);
            if (pos===null) continue;

            monsterModelName='monster_'+(n%3); // entityGenRandom.randomInt(0,MONSTER_MODEL_COUNT);     // supergumba -- testing -- to get all monster types
            model=this.modelList.cloneModel(this.view,monsterModelName);

            this.entityList.addEntity(new EntityMonsterClass(('Monster'+n),pos,new wsPoint(0.0,(entityGenRandom.random()*360.0),0.0),2000,5000,model));
        }

            // finished

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Running');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initFinish.bind(this),PROCESS_TIMEOUT_MSEC);    
    }

    initFinish()
    {
        var timeStamp;
        
            // finish by setting up all the mesh
            // buffers and indexes

        this.map.setupBuffers(this.view);

            // ambient

        this.view.ambient.setFromValues(MAP_LIGHT_AMBIENT[0],MAP_LIGHT_AMBIENT[1],MAP_LIGHT_AMBIENT[2]);

            // start the input

        this.input.initialize(this.entityList.getPlayer());

            // start the main loop

        timeStamp=Math.trunc(window.performance.now());
        this.view.timeStamp=timeStamp;

        this.view.loopLastPhysicTimeStamp=timeStamp;
        this.view.loopLastDrawTimeStamp=timeStamp;

        this.view.fps=0.0;
        this.view.fpsTotal=0;
        this.view.fpsCount=0;
        this.view.fpsStartTimeStamp=timeStamp;

        this.view.loopCancel=false;

        mainLoop(timeStamp);    
    }
}

//
// single global object is the main class
//

var main=new MainClass();


//
// main loop
//

function mainLoop(timeStamp)
{
    var view=main.view;
    var map=main.map;
    var entityList=main.entityList;
    var soundList=main.soundList;
    var debug=main.debug;
    
        // next frame
        
    if (view.loopCancel) return;
    window.requestAnimationFrame(mainLoop);
    
        // get integer msec timestamp
    
    view.timeStamp=Math.trunc(timeStamp);
    
        // run the input
        
    main.input.run();
    
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

        view.draw(map,entityList,debug);
        
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


function mainRun()
{
    main.run();
}
