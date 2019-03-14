import * as constants from '../main/constants.js';
import config from '../main/config.js';
import PointClass from '../utility/point.js';
import CoreClass from '../main/core.js';
import genRandom from '../utility/random.js';

//
// main class
//

class MainClass
{
    constructor()
    {
            // core is the global root
            // object for all game objects

        this.core=new CoreClass();

        Object.seal(this);
    }
    
    run(gameClass)
    {
        this.core.createCanvas();
        
            // the project objects
            
        this.core.projectGame=new gameClass(this.core);
        this.core.projectMap=this.core.projectGame.getStartProjectMap();
        
        setTimeout(this.initCore.bind(this),1);
    }

    async initCore()
    {
        this.core.initialize();
        if (!(await this.core.loadShaders())) return;

        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Initializing Internal Structures');
        this.core.loadingScreenDraw(0.25);

        setTimeout(this.initInternal.bind(this),1);
    }

    initInternal()
    {
        if (!this.core.map.initialize()) return;

            // next step

        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Loading Map');
        this.core.loadingScreenDraw(0.1);

        setTimeout(this.initLoadMap.bind(this),1);
    }
    
    async initLoadMap()
    {
        this.core.projectMap.initialize();
        if (!(await this.core.projectMap.loadMap())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Building Collision Geometry');
        this.core.loadingScreenDraw(0.2);
        
        setTimeout(this.initCollisionGeomtry.bind(this),1);
    }
    
    initCollisionGeomtry()
    {
        this.core.map.meshList.buildCollisionGeometry();
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Loading Entities');
        this.core.loadingScreenDraw(0.3);
        
        setTimeout(this.initLoadEntities.bind(this),1);
    }

    initLoadEntities()
    {
        if (!this.core.projectMap.loadEntities()) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Loading Models');
        this.core.loadingScreenDraw(0.4);
        
        setTimeout(this.initLoadEntityModels.bind(this),1);
    }
    
    async initLoadEntityModels()
    {
        if (!(await this.core.modelList.loadAllModels())) return;
        
        this.core.map.entityList.setupModelEntityAlters();
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Loading Images');
        this.core.loadingScreenDraw(0.4);
        
        setTimeout(this.initLoadImages.bind(this),1);
    }
    
    async initLoadImages()
    {
        if (!(await this.core.bitmapList.loadAllBitmaps())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Loading Sounds');
        this.core.loadingScreenDraw(0.9);

        setTimeout(this.initLoadSounds.bind(this),1);
    }
    
    async initLoadSounds()
    {
        if (!(await this.core.soundList.loadAllSounds())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Preparing to Run');
        this.core.loadingScreenDraw(0.9);

        setTimeout(this.initFinish.bind(this),1);
    }
    
    initFinish()
    {
            // finish by setting up all the mesh
            // buffers and indexes

        this.core.map.setupBuffers();
        
            // set the listener to this entity
            
        this.core.soundList.setListenerToEntity(this.core.map.entityList.getPlayer());

            // start the input

        this.core.input.initialize(this.core.map.entityList.getPlayer());
        
            // ready all the entities
            
        this.core.map.entityList.ready();
        
            // the cancel loop flag
            
        this.core.loopCancel=false;
        
            // start the main loop in paused mode

        this.core.setPauseState(true,true);
        this.core.input.setPauseState(true);
        
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

function mainLoop(timestamp)
{
    let fpsTime;
    let core=main.core;
    let map=core.map;
    
        // next frame
        
    if (core.loopCancel) return;
    window.requestAnimationFrame(mainLoop);
    
        // get integer msec timestamp
    
    core.timestamp=Math.trunc(timestamp);
    
        // map movement, entities, and
        // other physics, we only do this if we've
        // moved unto another physics tick
        
        // this timing needs to be precise so
        // physics remains constants
    
    if (!core.paused) {
        core.physicsTick=core.timestamp-core.lastPhysicTimestamp;

        if (core.physicsTick>constants.PHYSICS_MILLISECONDS) {
            map.movementList.run(core,map);

            if (core.physicsTick<constants.BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

                while (core.physicsTick>constants.PHYSICS_MILLISECONDS) {
                    core.physicsTick-=constants.PHYSICS_MILLISECONDS;
                    core.lastPhysicTimestamp+=constants.PHYSICS_MILLISECONDS;

                    map.entityList.run();
                }
            }
            else {
                core.lastPhysicTimestamp=core.timestamp;
            }

                // update the listener and all current
                // playing sound positions
                
            core.soundList.updateListener();
        }
    }
    
        // drawing
        
        // this timing is loose, as it's only there to
        // draw frames
        
    core.drawTick=core.timestamp-core.lastDrawTimestamp;
    
    if (core.drawTick>constants.DRAW_MILLISECONDS) {
        core.lastDrawTimestamp=core.timestamp; 

        core.draw();
        
        core.fpsTotal+=core.drawTick;
        core.fpsCount++;
    }
    
        // the fps
    
    if (!core.paused) {
        fpsTime=core.timestamp-core.fpsStartTimestamp;
        if (fpsTime>=1000) {
            core.fps=(core.fpsCount*1000.0)/core.fpsTotal;
            core.fpsStartTimestamp=core.timestamp;

            core.fpsTotal=0;
            core.fpsCount=0;
        }
    }
}

//
// export the global main
//

export default main;
