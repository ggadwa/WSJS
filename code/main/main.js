/* global fileCache, view, sound, map, modelList, sky, entityList, particleList, debug, config, genRandom, input, modelConstants */

"use strict";

//
// main class
//

class MainClass
{
    constructor()
    {
        Object.seal(this);
    }

    run()
    {
        fileCache.fillCache(this.initCanvas.bind(this));       // this contains all the shader code, needs to be loaded first
    }
    
    initCanvas()
    {
        view.createCanvas();
        
        setTimeout(this.initGL.bind(this),1);
    }

    initGL()
    {
            // init view ang webgl
        
        if (!view.initialize()) return;

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Initialized WebGL2');
        view.loadingScreenAddString('Initializing Internal Structures');
        view.loadingScreenDraw(null);

        setTimeout(this.initInternal.bind(this),1);
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

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Map');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildMap.bind(this),1);
    }

    initBuildMap()
    {
        let genMap=new GenMapClass(this.initBuildMapFinish.bind(this));
        genMap.build();
    }

    initBuildMapFinish()
    {
        view.loadingScreenUpdate();
        view.loadingScreenAddString('Building Collision Geometry');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildCollisionGeometry.bind(this),1);
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

        setTimeout(this.initBuildLightmap.bind(this),1);
    }

    initBuildLightmap()
    {
            // build the light map
            // light maps are a long running
            // process so we need a callback

        let genLightmap=new GenLightmapClass(this.initBuildLightmapFinish.bind(this));
        
        if (config.MAP_GENERATE_LIGHTMAP) {
            genLightmap.create();
        }
        else {
            genLightmap.createNone();
        }
    }

    initBuildLightmapFinish()
    {
        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Models');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildModelsMesh.bind(this,-1,null),1);
    }

    initBuildModelsMesh(idx,genBitmapSkin)
    {
        let model,genSkeleton,genModelMesh,modelBitmap;
        let monsterType;
        let modelMonsterTypes=[modelConstants.MODEL_TYPE_HUMANOID,modelConstants.MODEL_TYPE_ANIMAL,modelConstants.MODEL_TYPE_BLOB];

            // build a bitmap
        
        if (genBitmapSkin===null) genBitmapSkin=new GenBitmapSkinClass();
        modelBitmap=genBitmapSkin.generateRandom(false);

            // player is -1
            // else a monster

        if (idx===-1) {
            model=new ModelClass('player',modelConstants.MODEL_TYPE_HUMANOID);
        }
        else {
            monsterType=modelMonsterTypes[idx%(modelMonsterTypes.length)];        // supergumba -- TESTING -- always make at least one of each type
            //monsterType=modelConstants.MODEL_TYPE_BLOB;      // supergumba -- testing
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
            setTimeout(this.initBuildModelsMesh.bind(this,idx,genBitmapSkin),1);
            return;
        }

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Weapons');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildWeapons.bind(this,null),1);
    }

    initBuildWeapons(genBitmapItem)
    {
        let model,modelBitmap,genModelWeaponMesh,genModelProjectileMesh;
        
            // supergumba -- right now this is bad, it'll leak and get closed more than once,
            // deal with this when we have real weapon routines
        
        if (genBitmapItem===null) genBitmapItem=new GenBitmapItemClass();
        modelBitmap=genBitmapItem.generate(0,false);

            // weapon

        model=new ModelClass('weapon_0',modelConstants.MODEL_TYPE_WEAPON);

        genModelWeaponMesh=new GenModelWeaponMeshClass(model,modelBitmap);
        genModelWeaponMesh.build();

        modelList.addModel(model);

            // projectile

        model=new ModelClass('projectile_0',modelConstants.MODEL_TYPE_PROJECTILE);

        genModelProjectileMesh=new GenModelProjectileMeshClass(model,modelBitmap);
        genModelProjectileMesh.build();

        modelList.addModel(model);

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Dynamic Entities');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildEntities.bind(this),1);
    }

    initBuildEntities()
    {
        let n,monsterType;
        let model,pos,playerEntity,playerWeapon;
        let monsterAIs;
        
        let genSound=new GenSoundClass(sound.getAudioContext());
        let genProjectile=new GenProjectileClass(genSound);
        let genWeapon=new GenWeaponClass();
        let genAI=new GenAIClass(genProjectile,genSound);

            // make player entity

        pos=map.findRandomPlayerPosition();
        if (pos===null) {
            alert('Couldn\'t find a place to spawn player!');
            return;
        }

        playerEntity=new EntityPlayerClass('player',pos,new wsPoint(0.0,0.0,0.0),200,modelList.getModel('player'));
        playerEntity.overrideRadiusHeight(2000,5000);       // lock player into a certain radius/height for viewport clipping
        
        playerWeapon=genWeapon.generate();
        playerWeapon.addProjectile(genProjectile.generate(true));
        playerEntity.addWeapon(playerWeapon);
        playerEntity.setCurrentWeaponIndex(0);

        entityList.setPlayer(playerEntity);
        
            // create AI type for each monster
        
        monsterAIs=[];
        
        for (n=0;n!==config.MONSTER_TYPE_COUNT;n++) {
            monsterAIs.push(genAI.generate());
        }

            // make monster entities
            // we clone their models in the list so each entity gets
            // it's own model

        for (n=0;n!==config.MONSTER_ENTITY_COUNT;n++) {
            pos=map.findRandomMonsterPosition();
            if (pos===null) continue;
            
            monsterType=n%config.MONSTER_TYPE_COUNT;            // same number of each type
            model=modelList.cloneModel('monster_'+monsterType);
            entityList.addEntity(new EntityMonsterClass(('monster_'+n),pos,new wsPoint(0.0,(genRandom.random()*360.0),0.0),100,model,monsterAIs[monsterType]));
        }

            // finished

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Running');
        view.loadingScreenDraw(null);

        setTimeout(this.initFinish.bind(this),1);    
    }

    initFinish()
    {
            // finish by setting up all the mesh
            // buffers and indexes

        map.setupBuffers();

            // ambient

        view.ambient.setFromValues(config.MAP_LIGHT_AMBIENT,config.MAP_LIGHT_AMBIENT,config.MAP_LIGHT_AMBIENT);
        
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

let main=new MainClass();

//
// main loop
//

const PHYSICS_MILLISECONDS=16;
const DRAW_MILLISECONDS=16;
const BAIL_MILLISECONDS=5000;

function mainLoop(timeStamp)
{
    let fpsTime;
    
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
        fpsTime=view.timeStamp-view.fpsStartTimeStamp;
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
