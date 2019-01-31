import * as constants from '../../code/main/constants.js';
import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';
import ViewClass from '../../code/main/view.js';
import MapClass from '../../code/map/map.js';
import genRandom from '../../code/utility/random.js';
import GameClass from '../../data/scripts/game.js';

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
        
        this.game=null;
        this.projectMap=null;

        Object.seal(this);
    }
    
    run()
    {
        this.view.createCanvas();
        
        setTimeout(this.initView.bind(this),1);
    }

    async initView()
    {
            // print out the key incase we have
            // trouble so we don't lose it
            
        console.log('Seed:'+config.SEED);
        
            // the project objects
            
        this.game=new GameClass(this.view,this.map);
        this.projectMap=this.game.getStartMap();
         
           // init view
        
        this.view.initialize();
        if (!(await this.view.loadShaders())) return;

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Initializing Internal Structures');
        this.view.loadingScreenDraw(0.25);

        setTimeout(this.initInternal.bind(this),1);
    }

    initInternal()
    {
        if (!this.map.initialize()) return;

            // next step

        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Loading Map');
        this.view.loadingScreenDraw(0.1);

        setTimeout(this.initLoadMap.bind(this),1);
    }
    
    async initLoadMap()
    {
        this.projectMap.initialize();
        if (!(await this.projectMap.loadMap())) return;
        
        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Building Collision Geomtry');
        this.view.loadingScreenDraw(0.2);
        
        setTimeout(this.initCollisionGeomtry.bind(this),1);
    }
    
    initCollisionGeomtry()
    {
        this.map.meshList.buildCollisionGeometry();
        
        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Loading Entities');
        this.view.loadingScreenDraw(0.3);
        
        setTimeout(this.initLoadEntities.bind(this),1);
    }

    initLoadEntities()
    {
        if (!this.projectMap.loadEntities()) return;
        
        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Loading Models');
        this.view.loadingScreenDraw(0.4);
        
        setTimeout(this.initLoadEntityModels.bind(this),1);
    }
    
    async initLoadEntityModels()
    {
        if (!(await this.map.entityList.loadAllModels())) return;
        
        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Loading Images');
        this.view.loadingScreenDraw(0.4);
        
        setTimeout(this.initLoadImages.bind(this),1);
    }
    
    async initLoadImages()
    {
        if (!(await this.view.bitmapList.loadAllBitmaps())) return;
        
        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Loading Sounds');
        this.view.loadingScreenDraw(0.9);

        setTimeout(this.initLoadSounds.bind(this),1);
    }
    
    async initLoadSounds()
    {
        if (!(await this.view.soundList.loadAllSounds())) return;
        
        this.view.loadingScreenUpdate();
        this.view.loadingScreenAddString('Preparing to Run');
        this.view.loadingScreenDraw(0.9);

        setTimeout(this.initFinish.bind(this),1);
    }
    
    initFinish()
    {
            // finish by setting up all the mesh
            // buffers and indexes

        this.map.setupBuffers();
        
            // set the listener to this entity
            
        this.view.soundList.setListenerToEntity(this.map.entityList.getPlayer());

            // start the input

        this.view.input.initialize(this.map.entityList.getPlayer());
        
            // the cancel loop flag
            
        this.view.loopCancel=false;
        
            // start the main loop in paused mode

        this.view.setPauseState(true,true);
        this.view.input.setPauseState(true);
        
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
    let view=main.view;
    let map=main.map;
    
        // next frame
        
    if (view.loopCancel) return;
    window.requestAnimationFrame(mainLoop);
    
        // get integer msec timestamp
    
    view.timestamp=Math.trunc(timestamp);
    
        // map movement, entities, and
        // other physics, we only do this if we've
        // moved unto another physics tick
        
        // this timing needs to be precise so
        // physics remains constants
    
    if (!view.paused) {
        view.physicsTick=view.timestamp-view.lastPhysicTimestamp;

        if (view.physicsTick>constants.PHYSICS_MILLISECONDS) {
            map.movementList.run(view,map);

            if (view.physicsTick<constants.BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

                while (view.physicsTick>constants.PHYSICS_MILLISECONDS) {
                    view.physicsTick-=constants.PHYSICS_MILLISECONDS;
                    view.lastPhysicTimestamp+=constants.PHYSICS_MILLISECONDS;

                    map.entityList.run();
                }
            }
            else {
                view.lastPhysicTimestamp=view.timestamp;
            }

                // update the listener and all current
                // playing sound positions
                
            view.soundList.updateListener();
        }
    }
    
        // drawing
        
        // this timing is loose, as it's only there to
        // draw frames
        
    view.drawTick=view.timestamp-view.lastDrawTimestamp;
    
    if (view.drawTick>constants.DRAW_MILLISECONDS) {
        view.lastDrawTimestamp=view.timestamp; 

        view.draw(map);
        
        view.fpsTotal+=view.drawTick;
        view.fpsCount++;
    }
    
        // the fps
    
    if (!view.paused) {
        fpsTime=view.timestamp-view.fpsStartTimestamp;
        if (fpsTime>=1000) {
            view.fps=(view.fpsCount*1000.0)/view.fpsTotal;
            view.fpsStartTimestamp=view.timestamp;

            view.fpsTotal=0;
            view.fpsCount=0;
        }
    }
}

//
// export the global main
//

export default main;
