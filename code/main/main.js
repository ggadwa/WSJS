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
        
        this.genBitmapMap=null;
        this.genBitmapModel=null;
        this.genSound=null;
        
            // texture list for the map
            
        this.mapTextureBuildList=
            [
                ['Map Wall',[GEN_BITMAP_MAP_TYPE_BRICK_STACK,GEN_BITMAP_MAP_TYPE_BRICK_RANDOM,GEN_BITMAP_MAP_TYPE_STONE,GEN_BITMAP_MAP_TYPE_BLOCK,GEN_BITMAP_MAP_TYPE_PLASTER,GEN_BITMAP_MAP_TYPE_TILE_SIMPLE,GEN_BITMAP_MAP_TYPE_METAL_SHUTTER]],
                ['Map Floor',[GEN_BITMAP_MAP_TYPE_TILE_SIMPLE,GEN_BITMAP_MAP_TYPE_TILE_COMPLEX,GEN_BITMAP_MAP_TYPE_TILE_SMALL,GEN_BITMAP_MAP_TYPE_HEXAGONAL,GEN_BITMAP_MAP_TYPE_CONCRETE,GEN_BITMAP_MAP_TYPE_CEMENT,GEN_BITMAP_MAP_TYPE_MOSAIC]],
                ['Map Ceiling',[GEN_BITMAP_MAP_TYPE_METAL,GEN_BITMAP_MAP_TYPE_METAL_BAR,GEN_BITMAP_MAP_TYPE_HEXAGONAL,GEN_BITMAP_MAP_TYPE_CONCRETE,GEN_BITMAP_MAP_TYPE_CEMENT,GEN_BITMAP_MAP_TYPE_WOOD_PLANK]],
                ['Map Stairs',[GEN_BITMAP_MAP_TYPE_TILE_SIMPLE,GEN_BITMAP_MAP_TYPE_TILE_SMALL,GEN_BITMAP_MAP_TYPE_CONCRETE,GEN_BITMAP_MAP_TYPE_METAL]],
                ['Map Platform',[GEN_BITMAP_MAP_TYPE_METAL,GEN_BITMAP_MAP_TYPE_METAL_CORRUGATED,GEN_BITMAP_MAP_TYPE_HEXAGONAL,GEN_BITMAP_MAP_TYPE_WOOD_PLANK]],
                ['Map Ledge',[GEN_BITMAP_MAP_TYPE_TILE_SIMPLE,GEN_BITMAP_MAP_TYPE_TILE_COMPLEX,GEN_BITMAP_MAP_TYPE_TILE_SMALL,GEN_BITMAP_MAP_TYPE_HEXAGONAL,GEN_BITMAP_MAP_TYPE_CONCRETE,GEN_BITMAP_MAP_TYPE_CEMENT,GEN_BITMAP_MAP_TYPE_MOSAIC]],
                ['Map Metal',[GEN_BITMAP_MAP_TYPE_METAL]],
                ['Map Box',[GEN_BITMAP_MAP_TYPE_WOOD_BOX,GEN_BITMAP_MAP_TYPE_METAL,GEN_BITMAP_MAP_TYPE_METAL_BAR,GEN_BITMAP_MAP_TYPE_METAL_SHUTTER]],
                ['Map Pillar',[GEN_BITMAP_MAP_TYPE_BLOCK,GEN_BITMAP_MAP_TYPE_TILE_SMALL,GEN_BITMAP_MAP_TYPE_CONCRETE,GEN_BITMAP_MAP_TYPE_CEMENT,GEN_BITMAP_MAP_TYPE_PLASTER]],
                ['Map Closet',[GEN_BITMAP_MAP_TYPE_BRICK_STACK,GEN_BITMAP_MAP_TYPE_BRICK_RANDOM,GEN_BITMAP_MAP_TYPE_STONE,GEN_BITMAP_MAP_TYPE_BLOCK,GEN_BITMAP_MAP_TYPE_PLASTER,GEN_BITMAP_MAP_TYPE_TILE_SIMPLE,GEN_BITMAP_MAP_TYPE_METAL_SHUTTER]],
                ['Map Machine',[GEN_BITMAP_MAP_TYPE_MACHINE]],
            ];
            
        this.mapTextureUsedList=[];
            
            // texture types for models
            
        this.modelTextureTypes=[GEN_BITMAP_MODEL_TYPE_SKIN_SCALE,GEN_BITMAP_MODEL_TYPE_SKIN_LEATHER,GEN_BITMAP_MODEL_TYPE_SKIN_FUR];

            // sound list for the game
            
        this.soundBuildList=
            [
                ['fire',GEN_SOUND_TYPE_GUN_FIRE],
                ['explosion',GEN_SOUND_TYPE_EXPLOSION],
                ['monster scream',config.GEN_SOUND_TYPE_MONSTER_SCREAM]
            ];
            
        Object.seal(this);
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

        this.genBitmapMap=new GenBitmapMapClass(new GenRandomClass(config.SEED_BITMAP_MAP));
        this.genBitmapModel=new GenBitmapModelClass(new GenRandomClass(config.SEED_BITMAP_MODEL));
        this.genSound=new GenSoundClass(this.soundList.getAudioContext(),new GenRandomClass(config.SEED_SOUND));

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Map Textures');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildMapTextures.bind(this,0),PROCESS_TIMEOUT_MSEC);
    }

    initBuildMapTextures(idx)
    {
        var bitmapCount=this.mapTextureBuildList.length;

            // bitmap name

        var name=this.mapTextureBuildList[idx][0];

            // pick a random texture type
            // we borrow the current random generator from the gen bitmap
            // and never pick the same texture twice

        var bitmapTypeList=this.mapTextureBuildList[idx][1];
        
        var tryCount=bitmapTypeList.length;
        var textureIdx=this.genBitmapMap.genRandom.randomIndex(bitmapTypeList.length);
        
        var bitmapType=bitmapTypeList[textureIdx];
        
        if (bitmapTypeList.length===0) {
            this.mapTextureUsedList.push(bitmapType);
        }
        else {
            while (tryCount>0) {
                bitmapType=bitmapTypeList[textureIdx];
                
                if (this.mapTextureUsedList.indexOf(bitmapType)===-1) {
                    this.mapTextureUsedList.push(bitmapType);
                    break;
                }

                textureIdx++;
                if (textureIdx>=bitmapTypeList.length) textureIdx=0;

                tryCount--;
            }
        }

            // generate bitmap

        this.bitmapList.addBitmap(this.genBitmapMap.generate(this.view,name,bitmapType));

            // if more textures, then loop back around

        idx++;
        if (idx<bitmapCount) {
            this.view.loadingScreenDraw(idx/bitmapCount);
            setTimeout(this.initBuildMapTextures.bind(this,idx),PROCESS_TIMEOUT_MSEC);
            return;
        }

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Model Textures');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildModelTextures.bind(this,0),PROCESS_TIMEOUT_MSEC);
    }
    
    initBuildModelTextures(idx)
    {
            // pick a random model texture type

        var bitmapType=this.modelTextureTypes[this.genBitmapModel.genRandom.randomIndex(this.modelTextureTypes.length)];

            // generate bitmap

        this.bitmapList.addBitmap(this.genBitmapModel.generate(this.view,('Monster '+idx),bitmapType));

            // if more textures, then loop back around

        idx++;
        if (idx<config.MONSTER_TYPE_COUNT) {
            this.view.loadingScreenDraw(idx/config.MONSTER_TYPE_COUNT);
            setTimeout(this.initBuildModelTextures.bind(this,idx),PROCESS_TIMEOUT_MSEC);
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
        var genMap=new GenMapClass(this.view,this.bitmapList,this.map,new GenRandomClass(config.SEED_MAP),this.initBuildMapFinish.bind(this));
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

        var genLightmap=new GenLightmapClass(this.view,this.bitmapList,this.map,this.debug,config.MAP_GENERATE_LIGHTMAP,this.initBuildLightmapFinish.bind(this));
        genLightmap.create();
    }

    initBuildLightmapFinish()
    {
        var modelGenRandom=new GenRandomClass(config.SEED_MODEL);

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Models');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildModelsMesh.bind(this,0,modelGenRandom),PROCESS_TIMEOUT_MSEC);
    }

    initBuildModelsMesh(idx,modelGenRandom)
    {
        var model,genSkeleton,genModelMesh;

            // get bitmap

        var modelBitmap=this.bitmapList.getBitmap('Monster '+(idx%3));

            // player model if 0
            // else a monster

        if (idx===0) {
            model=new ModelClass('player',MODEL_TYPE_HUMANOID);
        }
        else {
            model=new ModelClass(('monster_'+(idx-1)),((idx-1)%3));        // supergumba -- TESTING -- always make at least one of each type
        //    model=new ModelClass(('monster_'+(idx-1)),MODEL_TYPE_ANIMAL);
        }

            // build the skeleton and mesh

        genSkeleton=new GenModelOrganicSkeletonClass(model,modelGenRandom);
        genSkeleton.build();

        genModelMesh=new GenModelOrganicMeshClass(model,modelBitmap,modelGenRandom);
        genModelMesh.build(this.view);

        this.modelList.addModel(model);

            // if more models, then loop back around

        this.view.loadingScreenDraw(idx/config.MONSTER_TYPE_COUNT);    

        idx++;
        if (idx<(config.MONSTER_TYPE_COUNT+1)) {
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
        var n,monsterType;
        var model,pos;

        var entityGenRandom=new GenRandomClass(config.SEED_ENTITY);
        var genProjectile=new GenProjectileClass(this.modelList,this.soundList,new GenRandomClass(config.SEED_PROJECTILE));
        var genWeapon=new GenWeaponClass(this.modelList,this.soundList,new GenRandomClass(config.SEED_WEAPON));

            // make player entity

        pos=this.map.findRandomEntityPosition(entityGenRandom);
        if (pos===null) {
            alert('Couldn\'t find a place to spawn player!');
            return;
        }

        var playerEntity=new EntityPlayerClass('Player',pos,new wsPoint(0.0,0.0,0.0),200,this.modelList.getModel('player'));
        playerEntity.overrideRadiusHeight(2000,5500);       // lock player into a certain radius/height for viewport clipping
        var playerWeapon=genWeapon.generate();
        playerWeapon.addProjectile(genProjectile.generate());
        playerEntity.addWeapon(playerWeapon);
        playerEntity.setCurrentWeaponIndex(0);

        this.entityList.setPlayer(playerEntity);
        
            // create AI type for each monster
        
        var monsterAIs=[];
        
        for (n=0;n!==config.MONSTER_TYPE_COUNT;n++) {
            monsterAIs.push(new MonsterAIClass(genProjectile.generate()));
        }

            // make monster entities
            // we clone their models in the list so each entity gets
            // it's own model

        for (n=0;n!==config.MONSTER_ENTITY_COUNT;n++) {
            pos=this.map.findRandomEntityPosition(entityGenRandom);
            if (pos===null) continue;
            
            monsterType=entityGenRandom.randomInt(0,config.MONSTER_TYPE_COUNT);
            model=this.modelList.cloneModel(this.view,('monster_'+monsterType));

            this.entityList.addEntity(new EntityMonsterClass(('Monster '+n),pos,new wsPoint(0.0,(entityGenRandom.random()*360.0),0.0),100,model,monsterAIs[monsterType]));
        }

            // finished

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Running');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initFinish.bind(this),PROCESS_TIMEOUT_MSEC);    
    }

    initFinish()
    {
            // finish by setting up all the mesh
            // buffers and indexes

        this.map.setupBuffers(this.view);

            // ambient

        this.view.ambient.setFromValues(config.MAP_LIGHT_AMBIENT[0],config.MAP_LIGHT_AMBIENT[1],config.MAP_LIGHT_AMBIENT[2]);
        
            // make sure there's an initial sound position
            
        this.soundList.setListenerToEntity(this.entityList.getPlayer());

            // start the input

        this.input.initialize(this.entityList.getPlayer());
        
            // the cancel loop flag
            
        this.view.loopCancel=false;
        
            // start the main loop in paused mode

        this.view.setPauseState(this.input,true,true);
        
            // and now start the loop
            
        window.requestAnimationFrame(mainLoop);
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
        
    if (!view.paused) main.input.run();
    
        // map movement, entities, and
        // other physics, we only do this if we've
        // moved unto another physics tick
        
        // this timing needs to be precise so
        // physics remains constants
    
    if (!view.paused) {
        view.physicsTick=view.timeStamp-view.lastPhysicTimeStamp;

        if (view.physicsTick>PHYSICS_MILLISECONDS) {
            map.runMovements(view,entityList);

            if (view.physicsTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

                while (view.physicsTick>PHYSICS_MILLISECONDS) {
                    view.physicsTick-=PHYSICS_MILLISECONDS;
                    view.lastPhysicTimeStamp+=PHYSICS_MILLISECONDS;

                    entityList.run(view,map);
                }
            }
            else {
                view.lastPhysicTimeStamp=view.timeStamp;
            }

            soundList.setListenerToEntity(entityList.getPlayer());
        }
    }
    
        // drawing
        
        // this timing is loose, as it's only there to
        // draw frames
        
    view.drawTick=view.timeStamp-view.lastDrawTimeStamp;
    
    if (view.drawTick>DRAW_MILLISECONDS) {
        view.lastDrawTimeStamp=view.timeStamp; 

        view.draw(map,entityList,debug);
        
        view.fpsTotal+=view.drawTick;
        view.fpsCount++;
    }
    
        // the fps
    
    if (!view.paused) {
        var fpsTime=view.timeStamp-view.fpsStartTimeStamp;
        if (fpsTime>=1000) {
            view.fps=(view.fpsCount*1000.0)/view.fpsTotal;
            view.fpsStartTimeStamp=view.timeStamp;

            view.fpsTotal=0;
            view.fpsCount=0;
        }
    }
}

function mainRun()
{
    main.run();
}
