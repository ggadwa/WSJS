import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';
import genRandom from '../../generate/utility/random.js';
import fileCache from '../../code/main/filecache.js';
import view from '../../code/main/view.js';
import map from '../../code/map/map.js';
import sound from '../../code/sound/sound.js';
import input from '../../code/main/input.js';


// supergumba -- testing

class MainClass
{
    constructor()
    {
    }
    
    run()
    {
        console.log('HERE');
    }
}


/*





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

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Player Model');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildPlayerModel.bind(this,new GenBitmapSkinClass()),1);
    }
    
    initBuildPlayerModel(genBitmapSkin)
    {
        let model,modelBitmap;
        let genModel=new GenModelClass();

            // build the player model
        
        modelBitmap=genBitmapSkin.generateRandom(false);
        
        model=new ModelClass('player',modelConstants.TYPE_CREATURE);
        genModel.build(model,modelBitmap,1.0,false);

        modelList.addModel(model);

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Monster Models');
        view.loadingScreenDraw(null);
        
        setTimeout(this.initBuildMonsterModels.bind(this,0,genModel,genBitmapSkin),1);
    }

    initBuildMonsterModels(idx,genModel,genBitmapSkin)
    {
        let model,modelBitmap;

            // build the model
        
        modelBitmap=genBitmapSkin.generateRandom(false);

        model=new ModelClass(('monster_'+idx),modelConstants.TYPE_CREATURE);
        genModel.build(model,modelBitmap,1.0,false);

        modelList.addModel(model);

            // if more models, then loop back around

        idx++;
        if (idx<config.MONSTER_TYPE_COUNT) {
            view.loadingScreenDraw((idx+1)/(config.MONSTER_TYPE_COUNT+1));
            setTimeout(this.initBuildMonsterModels.bind(this,idx,genModel,genBitmapSkin),1);
            return;
        }

            // next step

        if (config.MONSTER_BOSS) {
            view.loadingScreenUpdate();
            view.loadingScreenAddString('Generating Boss Model');
            view.loadingScreenDraw(null);

            setTimeout(this.initBuildBossModel.bind(this,genModel,genBitmapSkin),1);
        }
        else {
            view.loadingScreenUpdate();
            view.loadingScreenAddString('Generating Weapons');
            view.loadingScreenDraw(null);

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

        modelList.addModel(model);

            // next step

        view.loadingScreenUpdate();
        view.loadingScreenAddString('Generating Weapons');
        view.loadingScreenDraw(null);

        setTimeout(this.initBuildWeapons.bind(this,genModel,null),1);
    }

    initBuildWeapons(genModel,genBitmapItem)
    {
        let model,modelBitmap;
        
            // supergumba -- right now this is bad, it'll leak and get closed more than once,
            // deal with this when we have real weapon routines
        
        if (genBitmapItem===null) genBitmapItem=new GenBitmapItemClass();
        modelBitmap=genBitmapItem.generate(0,false);

            // weapon

        model=new ModelClass('weapon_0',modelConstants.TYPE_WEAPON);
        genModel.build(model,modelBitmap,1.0,false);

        modelList.addModel(model);

            // projectile

        model=new ModelClass('projectile_0',modelConstants.TYPE_PROJECTILE);
        genModel.build(model,modelBitmap,1.0,false);

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

        playerEntity=new EntityPlayerClass('player',pos,new PointClass(0.0,0.0,0.0),200,modelList.getModel('player'));
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
            pos=map.findRandomMonsterPosition();
            if (pos===null) continue;
            
            monsterType=n%config.MONSTER_TYPE_COUNT;            // same number of each type
            model=modelList.cloneModel('monster_'+monsterType);
            entityList.addEntity(new EntityMonsterClass(('monster_'+n),pos,new PointClass(0.0,(genRandom.random()*360.0),0.0),100,model,monsterAIs[monsterType]));
        }
        
            // boss monster
            
        if (config.MONSTER_BOSS) {
            pos=map.findRandomBossPosition();
            model=modelList.cloneModel('boss');
            if (pos!==null) entityList.addEntity(new EntityMonsterClass('boss',pos,new PointClass(0.0,(genRandom.random()*360.0),0.0),500,model,genAI.generate(true)));
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
*/

//
// single global object is the main class
//

let main=new MainClass();

export default main;
