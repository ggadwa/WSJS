import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';
import FileCacheClass from '../../code/main/filecache.js';
import ViewClass from '../../code/main/view.js';
import MapClass from '../../code/map/map.js';
import ModelListClass from '../../code/model/model_list.js';
import SkyClass from '../../code/sky/sky.js';
import EntityListClass from '../../code/entities/entity_list.js';
import ParticleListClass from '../../code/particle/particle_list.js';
import DebugClass from '../../code/debug/debug.js';
import InputClass from '../../code/main/input.js';
import SoundClass from '../../code/sound/sound.js';
import GenWeaponClass from '../../generate/thing/gen_weapon.js';
import GenProjectileClass from '../../generate/thing/gen_projectile.js';
import genRandom from '../../generate/utility/random.js';

//
// main class
//

class MainClass
{
    constructor()
    {
            // game globals
            
        this.fileCache=new FileCacheClass();
        this.view=new ViewClass(this.fileCache);
        this.map=new MapClass(this.view,this.fileCache);
        this.modelList=new ModelListClass(this.view,this.fileCache);
        this.sky=new SkyClass(this.view,this.fileCache);
        this.entityList=new EntityListClass();
        this.particleList=new ParticleListClass(this.view,this.fileCache);
        this.debug=new DebugClass(this.view,this.fileCache);
        this.input=new InputClass(this.view);
        this.sound=new SoundClass();
        
        Object.seal(this);
    }

    run()
    {
        this.fileCache.fillCache(this.initCanvas.bind(this));       // this contains all the shader code, needs to be loaded first
    }
    
    initCanvas()
    {
        this.view.createCanvas();
        
        setTimeout(this.initGL.bind(this),1);
    }

    initGL()
    {
            // init view ang webgl
        
        if (!this.view.initialize()) return;

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Initialized WebGL2');
        this.view.loadingScreenAddString('Initializing Internal Structures');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initInternal.bind(this),1);
    }

    initInternal()
    {
        if (!this.sound.initialize()) return;
        if (!this.map.initialize()) return;
        if (!this.modelList.initialize()) return;
        if (!this.sky.initialize()) return(false);
        if (!entityList.initialize()) return;
        if (!particleList.initialize()) return(false);
        if (!debug.initialize()) return;

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Map');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildMap.bind(this),1);
    }

    initBuildMap()
    {
        let genMap=new GenMapClass(this.initBuildMapFinish.bind(this));
        genMap.build();
    }

    initBuildMapFinish()
    {
        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Building Collision Geometry');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildCollisionGeometry.bind(this),1);
    }

    initBuildCollisionGeometry()
    {
            // build the collision geometry

        this.map.buildCollisionGeometry();

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Player Model');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildPlayerModel.bind(this,new GenBitmapSkinClass(this.view)),1);
    }
    
    initBuildPlayerModel(genBitmapSkin)
    {
        let model,modelBitmap;
        let genModel=new GenModelClass();

            // build the player model
        
        modelBitmap=genBitmapSkin.generateRandom(false);
        
        model=new ModelClass('player',modelConstants.TYPE_CREATURE);
        genModel.build(model,modelBitmap,1.0,false);

        this.modelList.addModel(model);

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Monster Models');
        this.view.loadingScreenDraw(null);
        
        setTimeout(this.initBuildMonsterModels.bind(this,0,genModel,genBitmapSkin),1);
    }

    initBuildMonsterModels(idx,genModel,genBitmapSkin)
    {
        let model,modelBitmap;

            // build the model
        
        modelBitmap=genBitmapSkin.generateRandom(false);

        model=new ModelClass(('monster_'+idx),modelConstants.TYPE_CREATURE);
        genModel.build(model,modelBitmap,1.0,false);

        this.modelList.addModel(model);

            // if more models, then loop back around

        idx++;
        if (idx<config.MONSTER_TYPE_COUNT) {
            this.view.loadingScreenDraw((idx+1)/(config.MONSTER_TYPE_COUNT+1));
            setTimeout(this.initBuildMonsterModels.bind(this,idx,genModel,genBitmapSkin),1);
            return;
        }

            // next step

        if (config.MONSTER_BOSS) {
            this.view.loadingScreenUpdate();
            this.view.loadingScreenAddString('Generating Boss Model');
            this.view.loadingScreenDraw(null);

            setTimeout(this.initBuildBossModel.bind(this,genModel,genBitmapSkin),1);
        }
        else {
            this.view.loadingScreenUpdate();
            this.view.loadingScreenAddString('Generating Weapons');
            this.view.loadingScreenDraw(null);

            setTimeout(this.initBuildWeapons.bind(this,genModel,null),1);
        }
    }
    
    initBuildBossModel(genModel,genBitmapSkin)
    {
        let model,modelBitmap;

            // build monster
        
        modelBitmap=genBitmapSkin.generateRandom(false);

        model=new ModelClass('boss',modelConstants.TYPE_CREATURE);
        genModel.build(model,modelBitmap,genRandom.randomFloat(2.5,3.0),false);

        this.modelList.addModel(model);

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Weapons');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildWeapons.bind(this,genModel,null),1);
    }

    initBuildWeapons(genModel,genBitmapItem)
    {
        let model,modelBitmap;
        
            // supergumba -- right now this is bad, it'll leak and get closed more than once,
            // deal with this when we have real weapon routines
        
        if (genBitmapItem===null) genBitmapItem=new GenBitmapItemClass(this.view);
        modelBitmap=genBitmapItem.generate(0,false);

            // weapon

        model=new ModelClass('weapon_0',modelConstants.TYPE_WEAPON);
        genModel.build(model,modelBitmap,1.0,false);

        this.modelList.addModel(model);

            // projectile

        model=new ModelClass('projectile_0',modelConstants.TYPE_PROJECTILE);
        genModel.build(model,modelBitmap,1.0,false);

        this.modelList.addModel(model);

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Entities');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildEntities.bind(this),1);
    }

    initBuildEntities()
    {
        let n,monsterType;
        let model,pos,playerEntity,playerWeapon;
        let monsterAIs;
        
        let genSound=new GenSoundClass(this.sound.getAudioContext());
        let genProjectile=new GenProjectileClass(this.modelList,genSound);
        let genWeapon=new GenWeaponClass(this.modelList,genSound);
        let genAI=new GenAIClass(genProjectile,genSound);

            // make player entity

        pos=this.map.findRandomPlayerPosition();
        if (pos===null) {
            alert('Couldn\'t find a place to spawn player!');
            return;
        }

        playerEntity=new EntityPlayerClass('player',pos,new PointClass(0.0,0.0,0.0),200,this.modelList.getModel('player'));
        playerEntity.overrideRadiusHeight(2000,5000);       // lock player into a certain radius/height for viewport clipping
        
        playerWeapon=genWeapon.generate();
        playerWeapon.addProjectile(genProjectile.generate(true));
        playerEntity.addWeapon(playerWeapon);
        playerEntity.setCurrentWeaponIndex(0);

        entityList.setPlayer(playerEntity);
        
            // create AI type for each monster
        
        monsterAIs=[];
        
        for (n=0;n!==config.MONSTER_TYPE_COUNT;n++) {
            monsterAIs.push(genAI.generate(false));
        }

            // make monster entities
            // we clone their models in the list so each entity gets
            // it's own model

        for (n=0;n!==config.MONSTER_ENTITY_COUNT;n++) {
            pos=this.map.findRandomMonsterPosition();
            if (pos===null) continue;
            
            monsterType=n%config.MONSTER_TYPE_COUNT;            // same number of each type
            model=this.modelList.cloneModel('monster_'+monsterType);
            entityList.addEntity(new EntityMonsterClass(('monster_'+n),pos,new PointClass(0.0,(genRandom.random()*360.0),0.0),100,model,monsterAIs[monsterType]));
        }
        
            // boss monster
            
        if (config.MONSTER_BOSS) {
            pos=this.map.findRandomBossPosition();
            model=this.modelList.cloneModel('boss');
            if (pos!==null) entityList.addEntity(new EntityMonsterClass('boss',pos,new PointClass(0.0,(genRandom.random()*360.0),0.0),500,model,genAI.generate(true)));
        }

            // finished

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Running');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initFinish.bind(this),1);    
    }

    initFinish()
    {
            // finish by setting up all the mesh
            // buffers and indexes

        this.map.setupBuffers();

            // ambient

        this.view.ambient.setFromValues(config.MAP_LIGHT_AMBIENT,config.MAP_LIGHT_AMBIENT,config.MAP_LIGHT_AMBIENT);
        
            // set the listener to this entity
            
        this.sound.setListenerToEntity(entityList.getPlayer());

            // start the input

        this.input.initialize(entityList.getPlayer());
        
            // the cancel loop flag
            
        this.view.loopCancel=false;
        
            // start the main loop in paused mode

        this.view.setPauseState(true,true);
        this.input.setPauseState(true);
        
            // and now start the loop
            
        window.requestAnimationFrame(mainLoop);
    }
}

//
// single global object is the main class
// and contains all other global objects
// (this elimates a bunch of circular logic
// and simplifies imports)
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
    let view=main.view;
    
        // next frame
        
    if (view.loopCancel) return;
    window.requestAnimationFrame(mainLoop);
    
        // get integer msec timestamp
    
    view.timeStamp=Math.trunc(timeStamp);
    
        // run the input
        
    if (!view.paused) this.input.run();
    
        // map movement, entities, and
        // other physics, we only do this if we've
        // moved unto another physics tick
        
        // this timing needs to be precise so
        // physics remains constants
    
    if (!view.paused) {
        view.physicsTick=view.timeStamp-view.lastPhysicTimeStamp;

        if (view.physicsTick>PHYSICS_MILLISECONDS) {
            this.map.runMovements();

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
                
            this.sound.update();
        }
    }
    
        // drawing
        
        // this timing is loose, as it's only there to
        // draw frames
        
    view.drawTick=view.timeStamp-view.lastDrawTimeStamp;
    
    if (view.drawTick>DRAW_MILLISECONDS) {
        view.lastDrawTimeStamp=view.timeStamp; 

        view.draw(map,sky);
        
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

//
// export the global main
//

export default main;
