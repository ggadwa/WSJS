import * as constants from '../../code/main/constants.js';
import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';
import ViewClass from '../../code/main/view.js';
import MapClass from '../../code/map/map.js';
import InputClass from '../../code/main/input.js';
import SoundClass from '../../code/sound/sound.js';
import genRandom from '../../code/utility/random.js';
import GameClass from '../../data/scripts/game.js';
import PlayerClass from '../../data/scripts/player.js';
import CyborgClass from '../../data/scripts/cyborg.js';
import BarrelClass from '../../data/scripts/barrel.js';

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
        
        this.game=new GameClass(this.view,this.map);
        this.projectMap=this.game.getStartMap();

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
        this.view.loadingScreenAddString('Importing Map');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initLoadMap.bind(this),1);
    }

    async initLoadMap()
    {
        this.projectMap.initialize();
        if (!(await this.projectMap.loadMap())) return;
        
        setTimeout(this.initBuildMapFinish.bind(this),1);
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

        //this.map.meshList.buildCollisionGeometry();

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Generating Player');
        this.view.loadingScreenDraw(null);

        setTimeout(this.initBuildEntities.bind(this),1);
    }

    async initBuildEntities()
    {
        let entity;
        
            // the player entity
            
        entity=new PlayerClass(this.view,this.map,'player',2000,5000);
        entity.initialize();
        if (!(await entity.loadModel())) return;
        this.projectMap.setupPlayer(entity);
        entity.setCurrentWeaponIndex(0);
        this.map.entityList.setPlayer(entity);
        
            // test entity 1
           
        entity=new CyborgClass(this.view,this.map,'monster',2000,5000);
        entity.initialize();
        if (!(await entity.loadModel())) return;
        entity.position.setFromValues(0,-17200,19000)
        this.map.entityList.add(entity);
        
            // test entity 2
            
        entity=new BarrelClass(this.view,this.map,'barrel',1000,2000);
        entity.initialize();
        if (!(await entity.loadModel())) return;
        entity.position.setFromValues(8000,-17200,19000)
        this.map.entityList.add(entity);
        
        this.initFinish();
    }
    
    initFinish()
    {
            // finish by setting up all the mesh
            // buffers and indexes

        this.map.setupBuffers();
        
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
