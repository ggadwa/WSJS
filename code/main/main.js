"use strict";

//
// main class
//

class MainClass
{
    constructor()
    {
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
                ['Map Box',[GEN_BITMAP_MAP_TYPE_WOOD_BOX,GEN_BITMAP_MAP_TYPE_METAL,GEN_BITMAP_MAP_TYPE_METAL_BAR]],
                ['Map Pillar',[GEN_BITMAP_MAP_TYPE_BLOCK,GEN_BITMAP_MAP_TYPE_TILE_SMALL,GEN_BITMAP_MAP_TYPE_CONCRETE,GEN_BITMAP_MAP_TYPE_CEMENT,GEN_BITMAP_MAP_TYPE_PLASTER]],
                ['Map Closet',[GEN_BITMAP_MAP_TYPE_BRICK_STACK,GEN_BITMAP_MAP_TYPE_BRICK_RANDOM,GEN_BITMAP_MAP_TYPE_STONE,GEN_BITMAP_MAP_TYPE_BLOCK,GEN_BITMAP_MAP_TYPE_PLASTER,GEN_BITMAP_MAP_TYPE_TILE_SIMPLE,GEN_BITMAP_MAP_TYPE_METAL_SHUTTER]],
                ['Map Machine',[GEN_BITMAP_MAP_TYPE_MACHINE]],
                ['Map Liquid',[GEN_BITMAP_MAP_TYPE_LIQUID]]
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
        fileCache.fillCache(this.initCanvas.bind(this));       // this contains all the shader code, needs to be loaded first
    }
    
    initCanvas()
    {
        view.createCanvas();
        
        setTimeout(this.initGL.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initGL()
    {
            // init view ang webgl
        
        if (!view.initialize()) return;

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Initialized WebGL');
        view.loadingScreenAddString('Initializing Internal Structures');
        view.loadingScreenDraw(null);

        setTimeout(this.initInternal.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initInternal()
    {
        if (!bitmapList.initialize()) return;
        if (!soundList.initialize()) return;
        if (!map.initialize()) return;
        if (!modelList.initialize()) return;
        if (!sky.initialize()) return(false);
        if (!entityList.initialize()) return;
        if (!particleList.initialize()) return(false);
        if (!debug.initialize()) return;

            // dynamic creation classes

        this.genBitmapMap=new GenBitmapMapClass(new GenRandomClass(config.SEED_BITMAP_MAP));
        this.genBitmapModel=new GenBitmapModelClass(new GenRandomClass(config.SEED_BITMAP_MODEL));
        this.genSound=new GenSoundClass(soundList.getAudioContext(),new GenRandomClass(config.SEED_SOUND));

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Map Textures');
        view.loadingScreenDraw(null);

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

        bitmapList.addBitmap(this.genBitmapMap.generate(name,bitmapType,false));

            // if more textures, then loop back around

        idx++;
        if (idx<bitmapCount) {
            view.loadingScreenDraw(idx/bitmapCount);
            setTimeout(this.initBuildMapTextures.bind(this,idx),PROCESS_TIMEOUT_MSEC);
            return;
        }

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Sounds');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildSounds.bind(this,0),PROCESS_TIMEOUT_MSEC);
    }

    initBuildSounds(idx)
    {
        var soundCount=this.soundBuildList.length;

            // name and type

        var name=this.soundBuildList[idx][0];
        var generateType=this.soundBuildList[idx][1];

             // generate sound

        soundList.addSound(this.genSound.generate(name,generateType,false));

            // if more textures, then loop back around

        idx++;
        if (idx<soundCount) {
            view.loadingScreenDraw(idx/soundCount);
            setTimeout(this.initBuildSounds.bind(this,idx),PROCESS_TIMEOUT_MSEC);
            return;
        }

                // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Map');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildMap.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initBuildMap()
    {
        var genMap=new GenMapClass(new GenRandomClass(config.SEED_MAP),this.initBuildMapFinish.bind(this));
        genMap.build();
    }

    initBuildMapFinish()
    {
        view.loadingScreenUpdate();
        view.loadingScreenAddString('Building Collision Geometry');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildCollisionGeometry.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initBuildCollisionGeometry()
    {
            // build the collision geometry

        map.buildCollisionGeometry();

            // build the light/mesh intersection lists

        map.buildLightMeshIntersectLists();

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Building Light Map');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildLightmap.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initBuildLightmap()
    {
            // build the light map
            // light maps are a long running
            // process so we need a callback

        var genLightmap=new GenLightmapClass(config.MAP_GENERATE_LIGHTMAP,this.initBuildLightmapFinish.bind(this));
        genLightmap.create();
    }

    initBuildLightmapFinish()
    {
        var modelGenRandom=new GenRandomClass(config.SEED_MODEL);

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Models');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildModelsMesh.bind(this,-1,modelGenRandom),PROCESS_TIMEOUT_MSEC);
    }

    initBuildModelsMesh(idx,modelGenRandom)
    {
        var model,genSkeleton,genModelMesh;
        var monsterType;

            // build a bitmap
            
        var bitmapName=(idx===-1)?'player':('monster_'+idx);
        var bitmapType=this.modelTextureTypes[this.genBitmapModel.genRandom.randomIndex(this.modelTextureTypes.length)];
        var modelBitmap=this.genBitmapModel.generate(bitmapName,bitmapType,false);
        bitmapList.addBitmap(modelBitmap);

            // player is -1
            // else a monster

        if (idx===-1) {
            model=new ModelClass('player',MODEL_TYPE_HUMANOID);
        }
        else {
            monsterType=MODEL_MONSTER_TYPES[idx%(MODEL_MONSTER_TYPES.length)];        // supergumba -- TESTING -- always make at least one of each type
            //monsterType=MODEL_TYPE_ANIMAL;      // supergumba -- testing
            model=new ModelClass(('monster_'+idx),monsterType);
        }

            // build the skeleton and mesh

        genSkeleton=new GenModelOrganicSkeletonClass(model,modelGenRandom);
        genSkeleton.build();

        genModelMesh=new GenModelOrganicMeshClass(model,modelBitmap,modelGenRandom);
        genModelMesh.build();

        modelList.addModel(model);

            // if more models, then loop back around

        idx++;
        if (idx<config.MONSTER_TYPE_COUNT) {
            view.loadingScreenDraw((idx+1)/(config.MONSTER_TYPE_COUNT+1));
            setTimeout(this.initBuildModelsMesh.bind(this,idx,modelGenRandom),PROCESS_TIMEOUT_MSEC);
            return;
        }

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Weapons');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildWeapons.bind(this,modelGenRandom),PROCESS_TIMEOUT_MSEC);
    }

    initBuildWeapons(modelGenRandom)
    {
        var modelBitmap=bitmapList.getBitmap('Map Metal');        // for now just use map metal

            // weapon

        var model=new ModelClass('weapon_0',MODEL_TYPE_WEAPON);

        var genModelWeaponMesh=new GenModelWeaponMeshClass(model,modelBitmap,modelGenRandom);
        genModelWeaponMesh.build();

        modelList.addModel(model);

            // projectile

        var model=new ModelClass('projectile_0',MODEL_TYPE_PROJECTILE);

        var genModelProjectileMesh=new GenModelProjectileMeshClass(model,modelBitmap,modelGenRandom);
        genModelProjectileMesh.build();

        modelList.addModel(model);

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Entities');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildEntities.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initBuildEntities()
    {
        var n,monsterType;
        var model,pos,proj;

        var entityGenRandom=new GenRandomClass(config.SEED_ENTITY);
        var genProjectile=new GenProjectileClass(new GenRandomClass(config.SEED_PROJECTILE));
        var genWeapon=new GenWeaponClass(new GenRandomClass(config.SEED_WEAPON));
        var genAI=new GenAIClass(genProjectile,new GenRandomClass(config.SEED_PROJECTILE));

            // make player entity

        pos=map.findRandomEntityPosition(entityGenRandom);
        if (pos===null) {
            alert('Couldn\'t find a place to spawn player!');
            return;
        }

        var playerEntity=new EntityPlayerClass('player',pos,new wsPoint(0.0,0.0,0.0),200,modelList.getModel('player'));
        playerEntity.overrideRadiusHeight(2000,5000);       // lock player into a certain radius/height for viewport clipping
        var playerWeapon=genWeapon.generate();
        playerWeapon.addProjectile(genProjectile.generate(true));
        playerEntity.addWeapon(playerWeapon);
        playerEntity.setCurrentWeaponIndex(0);

        entityList.setPlayer(playerEntity);
        
            // create AI type for each monster
        
        var monsterAIs=[];
        
        for (n=0;n!==config.MONSTER_TYPE_COUNT;n++) {
            monsterAIs.push(genAI.generate());
        }

            // make monster entities
            // we clone their models in the list so each entity gets
            // it's own model

        for (n=0;n!==config.MONSTER_ENTITY_COUNT;n++) {
            pos=map.findRandomEntityPosition(entityGenRandom);
            if (pos===null) continue;
            
            monsterType=n%config.MONSTER_TYPE_COUNT;            // same number of each type
            //monsterType=MODEL_TYPE_ANIMAL;      // testing
            model=modelList.cloneModel('monster_'+monsterType);
            entityList.addEntity(new EntityMonsterClass(('monster_'+n),pos,new wsPoint(0.0,(entityGenRandom.random()*360.0),0.0),100,model,monsterAIs[monsterType]));
        }

            // finished

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Running');
        view.loadingScreenDraw(null);

        setTimeout(this.initFinish.bind(this),PROCESS_TIMEOUT_MSEC);    
    }

    initFinish()
    {
            // finish by setting up all the mesh
            // buffers and indexes

        map.setupBuffers();

            // ambient

        view.ambient.setFromValues(config.MAP_LIGHT_AMBIENT_R,config.MAP_LIGHT_AMBIENT_G,config.MAP_LIGHT_AMBIENT_B);
        
            // make sure there's an initial sound position
            
        soundList.setListenerToEntity(entityList.getPlayer());

            // start the input

        input.initialize(entityList.getPlayer());
        
            // the cancel loop flag
            
        view.loopCancel=false;
        
            // start the main loop in paused mode

        view.setPauseState(true,true);
        
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
        // next frame
        
    if (view.loopCancel) return;
    window.requestAnimationFrame(mainLoop);
    
        // get integer msec timestamp
    
    view.timeStamp=Math.trunc(timeStamp);
    
        // run the input
        
    if (!view.paused) input.run();
    
        // map movement, entities, and
        // other physics, we only do this if we've
        // moved unto another physics tick
        
        // this timing needs to be precise so
        // physics remains constants
    
    if (!view.paused) {
        view.physicsTick=view.timeStamp-view.lastPhysicTimeStamp;

        if (view.physicsTick>PHYSICS_MILLISECONDS) {
            map.runMovements();

            if (view.physicsTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

                while (view.physicsTick>PHYSICS_MILLISECONDS) {
                    view.physicsTick-=PHYSICS_MILLISECONDS;
                    view.lastPhysicTimeStamp+=PHYSICS_MILLISECONDS;

                    entityList.run();
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

        view.draw();
        
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
