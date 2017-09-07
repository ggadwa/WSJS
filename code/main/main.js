import * as constants from '../../code/main/constants.js';
import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';
import FileCacheClass from '../../code/main/filecache.js';
import ViewClass from '../../code/main/view.js';
import MapClass from '../../code/map/map.js';
import ModelListClass from '../../code/model/model_list.js';
import InputClass from '../../code/main/input.js';
import SoundClass from '../../code/sound/sound.js';
import GenMapClass from '../../generate/map/gen_map.js';
import GenModelHumanClass from '../../generate/model/gen_model_human.js';
import GenModelMonsterClass from '../../generate/model/gen_model_monster.js';
import GenModelWeaponClass from '../../generate/model/gen_model_weapon.js';
import GenModelProjectileClass from '../../generate/model/gen_model_projectile.js';
import GenWeaponClass from '../../generate/thing/gen_weapon.js';
import GenProjectileClass from '../../generate/thing/gen_projectile.js';
import GenSoundClass from '../../generate/sound/gen_sound.js';
import GenAIClass from '../../generate/thing/gen_ai.js';
import EntityPlayerClass from '../../code/entities/entity_player.js';
import EntityMonsterClass from '../../code/entities/entity_monster.js';
import GenBitmapClass from '../../generate/bitmap/gen_bitmap.js';
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

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Map');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildMap.bind(this),1);
    }

    initBuildMap()
    {
        let genMap=new GenMapClass(this.view,this.map,this.initBuildMapFinish.bind(this));
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

        this.map.meshList.buildCollisionGeometry();

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Player Model');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildPlayerModel.bind(this),1);
    }
    
    initBuildPlayerModel()
    {
        let model;
        let genModel=new GenModelHumanClass(this.view);

            // build the player model
        
        model=genModel.generate('player',1.0,false);
        this.modelList.addModel(model);

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Monster Models');
        this.view.loadingScreenDraw(null);
        
        setTimeout(this.initBuildMonsterModels.bind(this,0),1);
    }

    initBuildMonsterModels(idx)
    {
        let model;
        let genModel=new GenModelMonsterClass(this.view);

            // build the model
        
        model=genModel.generate(('monster_'+idx),1.0,false);
        this.modelList.addModel(model);

            // if more models, then loop back around

        idx++;
        if (idx<config.MONSTER_TYPE_COUNT) {
            this.view.loadingScreenDraw((idx+1)/(config.MONSTER_TYPE_COUNT+1));
            setTimeout(this.initBuildMonsterModels.bind(this,idx),1);
            return;
        }

            // next step

        if (config.MONSTER_BOSS) {
            this.view.loadingScreenUpdate();
            this.view.loadingScreenAddString('Generating Boss Model');
            this.view.loadingScreenDraw(null);

            setTimeout(this.initBuildBossModel.bind(this),1);
        }
        else {
            this.view.loadingScreenUpdate();
            this.view.loadingScreenAddString('Generating Weapons');
            this.view.loadingScreenDraw(null);

            setTimeout(this.initBuildWeapons.bind(this),1);
        }
    }
    
    initBuildBossModel()
    {
        let model;
        let genModel=new GenModelMonsterClass(this.view);

            // build monster
        
        model=genModel.generate('boss',genRandom.randomFloat(2.5,3.0),false);
        this.modelList.addModel(model);

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Weapons');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildWeapons.bind(this),1);
    }

    initBuildWeapons()
    {
        let model;
        let genModel;

            // weapon

        genModel=new GenModelWeaponClass(this.view);
        model=genModel.generate('weapon_0',1.0,false);
        this.modelList.addModel(model);

            // projectile

        genModel=new GenModelProjectileClass(this.view);
        model=genModel.generate('projectile_0',1.0,false);
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
        let genProjectile=new GenProjectileClass(this.view,this.map,this.sound,this.modelList,genSound);
        let genWeapon=new GenWeaponClass(this.view,this.modelList,genSound);
        let genAI=new GenAIClass(genProjectile,genSound);

            // make player entity

        pos=this.map.roomList.findRandomPlayerPosition();
        if (pos===null) {
            alert('Couldn\'t find a place to spawn player!');
            return;
        }

        playerEntity=new EntityPlayerClass(this.map,this.map,this.sound,'player',pos,new PointClass(0.0,0.0,0.0),200,this.modelList.getModel('player'));
        playerEntity.overrideRadiusHeight(2000,5000);       // lock player into a certain radius/height for viewport clipping
        
        playerWeapon=genWeapon.generate();
        playerWeapon.addProjectile(genProjectile.generate(true));
        playerEntity.addWeapon(playerWeapon);
        playerEntity.setCurrentWeaponIndex(0);

        this.map.entityList.setPlayer(playerEntity);
        
            // create AI type for each monster
        
        monsterAIs=[];
        
        for (n=0;n!==config.MONSTER_TYPE_COUNT;n++) {
            monsterAIs.push(genAI.generate(false));
        }

            // make monster entities
            // we clone their models in the list so each entity gets
            // it's own model

        for (n=0;n!==config.MONSTER_ENTITY_COUNT;n++) {
            pos=this.map.roomList.findRandomMonsterPosition();
            if (pos===null) continue;
            
            monsterType=n%config.MONSTER_TYPE_COUNT;            // same number of each type
            model=this.modelList.cloneModel('monster_'+monsterType);
            this.map.entityList.add(new EntityMonsterClass(this.view,this.map,this.sound,('monster_'+n),pos,new PointClass(0.0,(genRandom.random()*360.0),0.0),100,model,monsterAIs[monsterType]));
        }
        
            // boss monster
            
        if (config.MONSTER_BOSS) {
            pos=this.map.roomList.findRandomBossPosition();
            model=this.modelList.cloneModel('boss');
            if (pos!==null) this.map.entityList.add(new EntityMonsterClass(this.view,this.map,this.sound,'boss',pos,new PointClass(0.0,(genRandom.random()*360.0),0.0),500,model,genAI.generate(true)));
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
            
        this.sound.setListenerToEntity(this.map.entityList.getPlayer());

            // start the input

        this.input.initialize(this.map.entityList.getPlayer());
        
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

function mainLoop(timeStamp)
{
    let fpsTime;
    let view=main.view;
    let map=main.map;
    let sound=main.sound;
    
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

        if (view.physicsTick>constants.PHYSICS_MILLISECONDS) {
            map.movementList.run(view,map);

            if (view.physicsTick<constants.BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

                while (view.physicsTick>constants.PHYSICS_MILLISECONDS) {
                    view.physicsTick-=constants.PHYSICS_MILLISECONDS;
                    view.lastPhysicTimeStamp+=constants.PHYSICS_MILLISECONDS;

                    map.entityList.run();
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
    
    if (view.drawTick>constants.DRAW_MILLISECONDS) {
        view.lastDrawTimeStamp=view.timeStamp; 

        view.draw(map);
        
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
