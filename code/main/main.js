"use strict";

//
// main class
//

class MainClass
{
    constructor()
    {
        this.genBitmapSkin=null;
        this.genBitmapItem=null;
        this.genSound=null;

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
        if (!sound.initialize()) return;
        if (!map.initialize()) return;
        if (!modelList.initialize()) return;
        if (!sky.initialize()) return(false);
        if (!entityList.initialize()) return;
        if (!particleList.initialize()) return(false);
        if (!debug.initialize()) return;

            // dynamic creation classes

        this.genBitmapSkin=new GenBitmapSkinClass();
        this.genBitmapItem=new GenBitmapItemClass();
        this.genSound=new GenSoundClass(sound.getAudioContext());

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Map');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildMap.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initBuildMap()
    {
        var genMap=new GenMapClass(this.initBuildMapFinish.bind(this));
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
        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Models');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildModelsMesh.bind(this,-1),PROCESS_TIMEOUT_MSEC);
    }

    initBuildModelsMesh(idx)
    {
        var model,genSkeleton,genModelMesh;
        var monsterType;

            // build a bitmap
            
        var modelBitmap=this.genBitmapSkin.generateRandom(false);

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

        genSkeleton=new GenModelOrganicSkeletonClass(model);
        genSkeleton.build();

        genModelMesh=new GenModelOrganicMeshClass(model,modelBitmap);
        genModelMesh.build();

        modelList.addModel(model);

            // if more models, then loop back around

        idx++;
        if (idx<config.MONSTER_TYPE_COUNT) {
            view.loadingScreenDraw((idx+1)/(config.MONSTER_TYPE_COUNT+1));
            setTimeout(this.initBuildModelsMesh.bind(this,idx),PROCESS_TIMEOUT_MSEC);
            return;
        }

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Weapons');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildWeapons.bind(this),PROCESS_TIMEOUT_MSEC);
    }

    initBuildWeapons()
    {
            // supergumba -- right now this is bad, it'll leak and get closed more than once,
            // deal with this when we have real weapon routines
        
        var modelBitmap=this.genBitmapItem.generate(0,false);

            // weapon

        var model=new ModelClass('weapon_0',MODEL_TYPE_WEAPON);

        var genModelWeaponMesh=new GenModelWeaponMeshClass(model,modelBitmap);
        genModelWeaponMesh.build();

        modelList.addModel(model);

            // projectile

        var model=new ModelClass('projectile_0',MODEL_TYPE_PROJECTILE);

        var genModelProjectileMesh=new GenModelProjectileMeshClass(model,modelBitmap);
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

        var genProjectile=new GenProjectileClass(this.genSound);
        var genWeapon=new GenWeaponClass();
        var genAI=new GenAIClass(genProjectile);

            // make player entity

        pos=map.findRandomPlayerPosition();
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
            pos=map.findRandomEntityPosition();
            if (pos===null) continue;
            
            monsterType=n%config.MONSTER_TYPE_COUNT;            // same number of each type
            //monsterType=MODEL_TYPE_ANIMAL;      // testing
            model=modelList.cloneModel('monster_'+monsterType);
            entityList.addEntity(new EntityMonsterClass(('monster_'+n),pos,new wsPoint(0.0,(genRandom.random()*360.0),0.0),100,model,monsterAIs[monsterType]));
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
        
            // set the listener to this entity
            
        sound.setListenerToEntity(entityList.getPlayer());

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

                // update the listener and all current
                // playing sound positions
                
            sound.update();
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
