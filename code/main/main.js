import * as constants from '../../code/main/constants.js';
import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';
import ViewClass from '../../code/main/view.js';
import MapClass from '../../code/map/map.js';
import InputClass from '../../code/main/input.js';
import SoundClass from '../../code/sound/sound.js';
import GenMapIndoorClass from '../../generate/map/gen_map_indoor.js';
import GenMapOutdoorClass from '../../generate/map/gen_map_outdoor.js';
import GenMapSpaceClass from '../../generate/map/gen_map_space.js';
import GenModelHumanClass from '../../generate/model/gen_model_human.js';
import GenModelWeaponClass from '../../generate/model/gen_model_weapon.js';
import GenModelProjectileClass from '../../generate/model/gen_model_projectile.js';
import GenWeaponClass from '../../generate/thing/gen_weapon.js';
import GenSoundClass from '../../generate/sound/gen_sound.js';
import GenAIClass from '../../generate/thing/gen_ai.js';
import EntityPlayerClass from '../../code/entities/entity_player.js';
import EntityMonsterClass from '../../code/entities/entity_monster.js';
import genRandom from '../../generate/utility/random.js';

//
// main class
//

class MainClass
{
    constructor()
    {
            // game globals

        this.view=new ViewClass();
        this.map=new MapClass(this.view);
        this.input=new InputClass(this.view);
        this.sound=new SoundClass();

        Object.seal(this);
    }

    run()
    {
        this.view.createCanvas();
        
        setTimeout(this.initView.bind(this),1);
    }

    initView()
    {
            // print out the key incase we have
            // trouble so we don't lose it
            
        console.log('Seed:'+config.SEED);
         
           // init view ang webgl
        
        this.view.initialize(this.initViewFinish.bind(this));
    }
    
    initViewFinish()
    {
        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Initializing Internal Structures');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initInternal.bind(this),1);
    }

    initInternal()
    {
        if (!this.sound.initialize()) return;
        if (!this.map.initialize()) return;

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Dynamic Map');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildMap.bind(this),1);
    }

    initBuildMap()
    {
        let genMap;
        
        switch (config.MAP_STYLE_TYPE) {
            case this.map.STYLE_INDOOR:
                genMap=new GenMapIndoorClass(this.view,this.map,this.initBuildMapFinish.bind(this));
                break;
            case this.map.STYLE_OUTDOOR:
                genMap=new GenMapOutdoorClass(this.view,this.map,this.initBuildMapFinish.bind(this));
                break;
            case this.map.STYLE_SPACE:
                genMap=new GenMapSpaceClass(this.view,this.map,this.initBuildMapFinish.bind(this));
                break;
        }

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
        this.view.loadingScreenAddString('Generating Player');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildPlayer.bind(this),1);
    }
    
    initBuildPlayer()
    {
        let model,pos,playerEntity;
        let genModel=new GenModelHumanClass(this.view);
        let genWeapon=new GenWeaponClass(this.view,this.map,this.sound);

            // build the player model
        
        model=genModel.generate('player',1.0,false);
        
            // find place for player
        
        pos=this.map.roomList.findRandomPlayerPosition();
        if (pos===null) {
            alert('Couldn\'t find a place to spawn player!');
            return;
        }

        playerEntity=new EntityPlayerClass(this.view,this.map,this.sound,'player',pos,new PointClass(0.0,0.0,0.0),200,model);
        playerEntity.overrideRadiusHeight(2000,5000);       // lock player into a certain radius/height for viewport clipping
        
            // todo -- all this is hard coded
            
        playerEntity.addWeapon(genWeapon.generate('Pistol'));
        playerEntity.addWeapon(genWeapon.generate('Rocket Launcher'));
        playerEntity.addWeapon(genWeapon.generate('Grenade Launcher'));
        playerEntity.addWeapon(genWeapon.generate('Laser Gun'));
        
        playerEntity.setCurrentWeaponIndex(0);

        this.map.entityList.setPlayer(playerEntity);

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Monsters');
        this.view.loadingScreenDraw(null);
        
        setTimeout(this.initBuildMonsters.bind(this,0),1);
    }

    initBuildMonsters(idx)
    {
        let n,pos,ai;
        let genAI=new GenAIClass(this.view,this.map,this.sound);

            // create AI type for each monster
            // AI create all weapons and models
        
        ai=genAI.generate(('monster_'+idx),genAI.AI_TYPE_STALKING_MONSTER);

            // make monster entities

        for (n=0;n!==config.MONSTER_PER_TYPE_COUNT;n++) {
            pos=this.map.roomList.findRandomMonsterPosition();
            if (pos!==null) this.map.entityList.add(new EntityMonsterClass(this.view,this.map,this.sound,('monster_'+n),pos,new PointClass(0.0,(genRandom.random()*360.0),0.0),100,ai));
        }

            // if more monster types, then loop back around

        idx++;
        if (idx<config.MONSTER_TYPE_COUNT) {
            this.view.loadingScreenDraw((idx+1)/(config.MONSTER_TYPE_COUNT+1));
            setTimeout(this.initBuildMonsters.bind(this,idx),1);
            return;
        }

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Boss');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildBoss.bind(this),1);
    }
    
    initBuildBoss()
    {
        let pos,ai;
        let genAI=new GenAIClass(this.view,this.map,this.sound);
        
        if (config.MONSTER_BOSS) {

                // create AI type for each monster
                // AI create all weapons and models

            ai=genAI.generate('boss',genAI.AI_TYPE_BOSS);
            
                // place the boss at end of map
                
            pos=this.map.roomList.findRandomBossPosition();
            if (pos!==null) this.map.entityList.add(new EntityMonsterClass(this.view,this.map,this.sound,'boss',pos,new PointClass(0.0,(genRandom.random()*360.0),0.0),500,ai));
        }
        
            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Finishing');
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
