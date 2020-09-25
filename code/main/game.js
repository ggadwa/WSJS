import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import MapClass from '../map/map.js';
import ShadowmapLoadClass from '../light/shadowmap_load.js';
import EntityFPSPlayerClass from '../project/entity_fps_player.js';
import EntityFPSBotClass from '../project/entity_fps_bot.js';
import DeveloperClass from '../developer/developer.js';

export default class GameClass
{
    constructor(core,data)
    {
        this.MAX_SCORE_COUNT=10;
        
        this.core=core;
        this.data=data;
        
        this.developer=new DeveloperClass(core);
        
        this.json=null;
        this.jsonEntityCache=new Map();
        this.jsonEffectCache=new Map();
        this.jsonSequenceCache=new Map();
        
        this.scores=null;
        this.scoreShow=false;
        this.scoreLastItemCount=0;
        this.scoreColor=new ColorClass(0,1,0.2);
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.physicsTick=0;
        this.drawTick=0;
        this.lastPhysicTimestamp=0;
        this.lastDrawTimestamp=0;
            
        this.triggers=new Map();
        
        this.exitGame=false;
        
        Object.seal(this);
    }
 
        //
        // json lookup/load utilities
        //
        
    lookupValue(value,data,valueDefault)
    {
        if ((data===undefined) || (data===null)) return(value);
        if (value===undefined) return(valueDefault);
        if (value===null) return(value);
        if (typeof(value)!=='string') return(value);
        if (value.length<2) return(value);
        if (value.charAt(0)!=='@') return(value);
        
        return(data[value.substring(1)]);
    }
    
    lookupAnimationValue(value)
    {
        if ((value===undefined) || (value===null)) return(null);
        return(value);
    }
    
    lookupSoundValue(value)
    {
        if ((value==undefined) || (value===null)) return(null);
        return(value);
    }
    
    lookupPointValue(value,valueDefaultX,valueDefaultY,valueDefaultZ)
    {
        if ((value==undefined) || (value===null)) return(new PointClass(valueDefaultX,valueDefaultY,valueDefaultZ));
        return(new PointClass(value[0],value[1],value[2]));
    }
    
    addJsonObjectToLoadSet(loadSet,data,requiredParentObjectKey,inParentObject,keyNames,obj)
    {
        let key,item,jsonEntity;
        let recurseInParentObject;
        
        for (key in obj) {
            
                // recursal keys
                
            if (typeof(obj[key])==='object') {
                
                    // some properties are required to be within
                    // a named parent object, check that here
                
                recurseInParentObject=inParentObject;
                if (requiredParentObjectKey!==null) recurseInParentObject|=(key===requiredParentObjectKey);
                
                this.addJsonObjectToLoadSet(loadSet,data,requiredParentObjectKey,recurseInParentObject,keyNames,obj[key]);
                continue;
            }
            
            if (typeof(obj[key])==='array') {
                for (item of obj[key]) {
                    if (typeof(item)==='object') this.addJsonObjectToLoadSet(loadSet,data,requiredParentObjectKey,false,keyNames,item);
                }
                continue;
            }
                
                // recurse into other entities
                
            if (key==='weaponJson') {
                jsonEntity=this.jsonEntityCache.get(obj[key]);
                if (jsonEntity!==null) this.addJsonObjectToLoadSet(loadSet,obj['weaponData'],requiredParentObjectKey,false,keyNames,jsonEntity);
                continue;
            }
            
            if (key==='projectileJson') {
                jsonEntity=this.jsonEntityCache.get(obj[key]);
                if (jsonEntity!==null) this.addJsonObjectToLoadSet(loadSet,obj['projectileData'],requiredParentObjectKey,false,keyNames,jsonEntity);
                continue;
            }
            
                // effect keys
                
            if (!keyNames.includes(key)) continue;
            if ((requiredParentObjectKey!==null) && (!inParentObject)) continue;
            
            loadSet.add(this.lookupValue(obj[key],data,null));
        }
    }

        //
        // game initialize/release
        //
        
    async fetchJson(name)
    {
        let resp;
        let url='../'+name+'.json';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.json());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
        
    async initialize()
    {
        let n,data;
        let promises,name,success;
        
            // get the main game json
            // this is the only hard coded json file
        
        data=null;
        
        await this.fetchJson('game/game')
            .then
                (
                    value=>{
                        data=value;
                    },
                    reason=>{
                        console.log(reason);
                    }
                );
        
        if (data===null) return(false);
           
        this.json=data;
        
            // cache all the entity json
            
        promises=[];
        
        for (name of this.json.entities) {
            promises.push(this.fetchJson('entities/'+name));
        }
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    values=>{
                        for (n=0;n<values.length;n++) {
                            this.jsonEntityCache.set(this.json.entities[n],values[n]);
                        }
                    },
                    reason=>{
                        console.log(reason);
                        success=false;
                    }
                );
        
        if (!success) return(false);
        
            // cache all the effect json
            
        promises=[];
        
        for (name of this.json.effects) {
            promises.push(this.fetchJson('effects/'+name));
        }
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    values=>{
                        for (n=0;n<values.length;n++) {
                            this.jsonEffectCache.set(this.json.effects[n],values[n]);
                        }
                    },
                    reason=>{
                        console.log(reason);
                        success=false;
                    }
                );
        
        if (!success) return(false);
        
            // cache all the sequence json
            
        promises=[];
        
        for (name of this.json.sequences) {
            promises.push(this.fetchJson('sequences/'+name));
        }
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    values=>{
                        for (n=0;n<values.length;n++) {
                            this.jsonSequenceCache.set(this.json.sequences[n],values[n]);
                        }
                    },
                    reason=>{
                        console.log(reason);
                        success=false;
                    }
                );

        return(success);
    }
    
    release()
    {
        if (this.json.developer) this.developer.release();
    }

        //
        // game ready
        //
        
    ready()
    {
        let n,y;
        let entity;
        
        this.triggers.clear();
        
            // json interface
            
        if (!this.core.interface.addFromJson(this.json.interface)) return(false);
        
            // multiplayer scores
            
        if (this.core.isMultiplayer) {
            
                // current scores
                
            this.scores=new Map();

            for (entity of this.core.map.entityList.entities) {
                if ((entity instanceof EntityFPSPlayerClass) ||
                    (entity instanceof EntityFPSBotClass)) this.scores.set(entity.name,0);
            }
            
                // max number of scores to display
                
            y=-Math.trunc((35*(this.MAX_SCORE_COUNT-1))*0.5);
            
            for (n=0;n!==this.MAX_SCORE_COUNT;n++) {
                this.core.interface.addText(('score_name_'+n),'',this.core.interface.POSITION_MODE_MIDDLE,{"x":0,"y":y},30,this.core.interface.TEXT_ALIGN_RIGHT,this.scoreColor,1,false);
                this.core.interface.addText(('score_point_'+n),'',this.core.interface.POSITION_MODE_MIDDLE,{"x":10,"y":y},30,this.core.interface.TEXT_ALIGN_LEFT,this.scoreColor,1,false);
                y+=35;
            }
            
                // no scores yet
                
            this.scoreShow=false;
            this.scoreLastItemCount=0;
        }
                
            // developer mode initialization
        
        if (this.json.developer) {
            if (!this.developer.initialize()) return(false);
        }
        
        return(true);
    }
    
        //
        // timing utilities
        //
        
    getPeriodicCos(millisecondPeriod,amplitude)
    {
        let freq=((this.timestamp%millisecondPeriod)/millisecondPeriod)*(Math.PI*2);
        return(Math.trunc(Math.cos(freq)*amplitude));
    }
    
    getPeriodicSin(millisecondPeriod,amplitude)
    {
        let freq=((this.timestamp%millisecondPeriod)/millisecondPeriod)*(Math.PI*2);
        return(Math.trunc(Math.sin(freq)*amplitude));
    }
    
    getPeriodicLinear(millisecondPeriod,amplitude)
    {
        return(((this.timestamp%millisecondPeriod)/millisecondPeriod)*amplitude);
    }
    
        //
        // triggers
        //
        
    setTrigger(triggerName)
    {
        if (triggerName!==null) this.triggers.set(triggerName,true);
    }
    
    clearTrigger(triggerName)
    {
        if (triggerName!==null) this.triggers.set(triggerName,false);
    }
    
    checkTrigger(triggerName)
    {
        let value=this.triggers.get(triggerName);
        return((value===null)?false:value);
    }
    
        //
        // won-lost
        //
        
    won()
    {
        console.info('win');
        if (this.json.config.sequenceWon!==null) this.core.startSequence(this.json.config.sequenceWon);
    }
    
    lost()
    {
        console.info('lost');
        if (this.json.config.sequenceLost!==null) this.core.startSequence(this.json.config.sequenceLost);
    }
    
        //
        // sequences
        //
        
    runStartSequence()
    {
        if (this.json.config.sequenceStart!==null) this.core.startSequence(this.json.config.sequenceStart);
    }
    
        //
        // multiplayer/networking
        //
        
    multiplayerAddScore(fromEntity,killedEntity,isTelefrag)
    {
        let n;
        let score,points;
        let scoreEntity=null;
        let iter,rtn,name,insertIdx;
        let sortedNames=[];
        
        if (!this.core.isMultiplayer) return;
        
            // any messages
            
        points=0;
            
        if ((fromEntity!==null) && ((fromEntity instanceof EntityFPSPlayerClass) || (fromEntity instanceof EntityFPSBotClass))) {
            if (isTelefrag) {
                scoreEntity=fromEntity;
                points=1;
                if (this.json.config.multiplayerMessageText!==null) this.core.interface.updateTemporaryText(this.json.config.multiplayerMessageText,(fromEntity.name+' telefragged '+killedEntity.name),this.json.config.multiplayerMessageWaitTick);
            }
            else {
                if (fromEntity!==killedEntity) {
                    scoreEntity=fromEntity;
                    points=1;
                    if (this.json.config.multiplayerMessageText!==null) this.core.interface.updateTemporaryText(this.json.config.multiplayerMessageText,(fromEntity.name+' killed '+killedEntity.name),this.json.config.multiplayerMessageWaitTick);
                }
                else {
                    scoreEntity=killedEntity;
                    points=-1;
                    if (this.json.config.multiplayerMessageText!==null) this.core.interface.updateTemporaryText(this.json.config.multiplayerMessageText,(killedEntity.name+' committed suicide'),this.json.config.multiplayerMessageWaitTick);
                }
            }
        }
        
            // add the points
            
        if (scoreEntity!==null) {
            score=this.scores.get(scoreEntity.name);
            if (score===undefined) score=0;

            this.scores.set(scoreEntity.name,(score+points));
        }
        
            // update scores
             
        iter=this.scores.keys();
        
        while (true) {
            rtn=iter.next();
            if (rtn.done) break;
            
            name=rtn.value;
            points=this.scores.get(name);
            
            if (sortedNames.length===0) {
                sortedNames.push(name);
            }
            else {
                insertIdx=0;

                for (n=(sortedNames.length-1);n>=0;n--) {
                    if (points<this.scores.get(sortedNames[n])) {
                        insertIdx=n+1;
                        break;
                    }
                }

                sortedNames.splice(insertIdx,0,name);
            }
        }
        
        this.scoreLastItemCount=sortedNames.length;
        
        for (n=0;n!=this.MAX_SCORE_COUNT;n++) {
            if (n<this.scoreLastItemCount) {
                this.core.interface.updateText(('score_name_'+n),sortedNames[n]);
                this.core.interface.showText(('score_name_'+n),this.scoreShow);
                
                this.core.interface.updateText(('score_point_'+n),this.scores.get(sortedNames[n]));
                this.core.interface.showText(('score_point_'+n),this.scoreShow);
            }
            else {
                this.core.interface.showText(('score_name_'+n),false);
                this.core.interface.showText(('score_point_'+n),false);
            }
        }
    }
    
    showScoreDisplay(show)
    {
        let n;
        
        if (!this.core.isMultiplayer) return;
        
        this.scoreShow=show;
        
        for (n=0;n!=this.MAX_SCORE_COUNT;n++) {
            if (n<this.scoreLastItemCount) {
                this.core.interface.showText(('score_name_'+n),this.scoreShow);
                this.core.interface.showText(('score_point_'+n),this.scoreShow);
            }
            else {
                this.core.interface.showText(('score_name_'+n),false);
                this.core.interface.showText(('score_point_'+n),false);
            }
        }
    }
    
        //
        // remote changes
        //
        
    remoteEntering(name)
    {
        this.scores.set(name,0);
        if (this.json.config.multiplayerMessageText!==null) this.core.interface.updateTemporaryText(this.json.config.multiplayerMessageText,(name+' has joined'),5000);
    }
    
    remoteLeaving(name)
    {
        this.scores.delete(name);
        if (this.json.config.multiplayerMessageText!==null) this.core.interface.updateTemporaryText(this.json.config.multiplayerMessageText,(name+' has left'),5000);
    }
    
        //
        // start the game
        //
        
    startGameLoop()
    {
        let startMap;
        
          // initialize the map
          
        startMap=this.core.game.lookupValue(this.core.game.json.startMap,this.data);
        
        this.core.map=new MapClass(this.core,startMap,this.core.game.autoGenerate);
        if (!this.core.map.initialize()) return;

            // next step

        //if (!this.core.isMultiplayer) {
            this.core.loadingScreenUpdate();
            this.core.loadingScreenAddString('Loading Map');
            this.core.loadingScreenDraw();

            setTimeout(this.initLoadMap.bind(this),1);
            /*
        }
        else {
            this.core.loadingScreenUpdate();
            this.core.loadingScreenAddString('Waiting for Setup');
            this.core.loadingScreenDraw();
            
            setTimeout(this.runMultiplayerDialog.bind(this),1);
        }

             */
    }
    /*
    runMultiplayerDialog()
    {
        this.core.connectDialog.open(this.runMultiplayerDialogContinueLoad.bind(this));     // return here, exit of this dialog will continue on to runMultiplayerDialogContinueLoad()
    }
        
    runMultiplayerDialogContinueLoad()
    {
        this.core.connectDialog.close();
        
            // local games don't connect
            
        if (this.core.setup.localGame) {
            this.runMultiplayerConnectedOK();
            return;
        }
        
            // connect to server
            
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Connecting to Server');
        this.core.loadingScreenDraw();
        
        this.core.network.connect(this.runMultiplayerConnectedOK.bind(this),this.runMultiplayerConnectedError.bind(this));     // return here, callback from connection or error
    }
    
    runMultiplayerConnectedOK()
    {
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Loading Map');
        this.core.loadingScreenDraw();
        
        setTimeout(this.initLoadMap.bind(this),1);
    }
    
    runMultiplayerConnectedError()
    {
        alert(this.core.network.lastErrorMessage);
        this.runMultiplayerDialog();
    }
    */
    async initLoadMap()
    {
        if (!(await this.core.map.loadMap())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Building Collision Geometry');
        this.core.loadingScreenDraw();
        
        setTimeout(this.initCollisionGeometry.bind(this),1);
    }
    
    initCollisionGeometry()
    {
        this.core.map.meshList.buildCollisionGeometry();
        
        this.core.loadingScreenUpdate();

        this.core.loadingScreenAddString('Loading Shadowmap');
        this.core.loadingScreenDraw();

        setTimeout(this.initLoadShadowmap.bind(this),1);
    }
    
    async initLoadShadowmap()
    {
        let shadowmapLoad=new ShadowmapLoadClass(this.core);
        
        if (!(await shadowmapLoad.load())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Load Models');
        this.core.loadingScreenDraw();
       
        setTimeout(this.initLoadModels.bind(this),1);    
    }
    
    async initLoadModels()
    {
        if (!(await this.core.modelList.loadAllModels())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Load Sounds');
        this.core.loadingScreenDraw();
        
        setTimeout(this.initLoadSounds.bind(this),1);
    }
    
    async initLoadSounds()
    {
        if (!(await this.core.soundList.loadAllSounds())) return;
        if (!(await this.core.music.load())) return;
    
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Load Images');
        this.core.loadingScreenDraw();

        setTimeout(this.initLoadImages.bind(this),1);
    }
    
    async initLoadImages()
    {
        if (!(await this.core.bitmapList.loadAllBitmaps())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Initializing Entities and Effects');
        this.core.loadingScreenDraw();
        
        setTimeout(this.initLoadEntities.bind(this),1);
    }
    
    initLoadEntities()
    {
            // call the map ready
        
        this.core.map.ready();
        
            // initialize any map effects
            
        if (!this.core.map.effectList.initializeMapEffects()) return;        // halt on bad effect start

            // initialize any map entities
            
        if (!this.core.map.entityList.initializeMapEntities()) return;    // halt on bad entity start
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('CLICK TO START');
        this.core.loadingScreenDraw();
        this.core.canvas.style.display='';
        
        setTimeout(this.initFinalSetup.bind(this),1);
    }
    
    initFinalSetup()
    {
            // setup the interface

        if (!this.core.game.ready()) return;       // halt on bad ready
        
            // setup draw buffers

        this.core.map.setupBuffers();
        
            // set the listener to this entity
            
        this.core.soundList.setListenerToEntity(this.core.map.entityList.getPlayer());

            // start the input

        this.core.input.initialize(this.core.map.entityList.getPlayer());
        
            // ready all the entities
            
        this.core.map.entityList.ready();
        
            // start the music
            
        this.core.music.start();
        
            // start any sequence
            
        this.core.game.runStartSequence();
        
            // start the main loop in paused mode
            // we have to do this because without a click we can't capture screen

        //this.core.setPauseState(false,true);
        
            // if we are in a networked game, last thing to
            // do is request a map_sync to get the map in the right time
            
            /*
        if (this.core.isMultiplayer) {
            this.core.loadingScreenUpdate();
            this.core.loadingScreenAddString('Connecting to Server');
            this.core.loadingScreenDraw();
        
            this.core.network.sync(this.runMultiplayerSyncOK.bind(this),this.runMultiplayerSyncError.bind(this));     // return here, callback from connection or error
            return;
        }
        */
       
            // start the main loop
        
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.physicsTick=0;
        this.drawTick=0;
        this.lastPhysicTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.exitGame=false;

        window.requestAnimationFrame(gameMainLoop);
    }
    
    runMultiplayerSyncOK()
    {
        this.core.game.startGameLoop();
    }
    
    runMultiplayerSyncError()
    {
        alert(this.core.network.lastErrorMessage);
        this.network.disconnect();
    }
    
        //
        // game run
        //
        
    run()
    {
            // score functions

        if (this.core.isMultiplayer) {
            if (this.core.input.isKeyDownAndClear('`')) this.showScoreDisplay(!this.scoreShow);
        }
        
            // developer functions
            
        if (this.json.developer) this.developer.run();
    }
}

//
// game main loop
//

const PHYSICS_MILLISECONDS=16;
const DRAW_MILLISECONDS=16;
const BAIL_MILLISECONDS=5000;

function gameMainLoop(timestamp)
{
    let fpsTime,systemTick,isNetworkGame;
    let core=window.main.core;
    let game=core.game;
    let map=core.map;
    
        // if paused, and not in a network
        // game than nothing to do
        
    isNetworkGame=(core.isMultiplayer) && (!core.setup.localGame);
    //if ((core.paused) && (!isNetworkGame)) return;
    
        // loop uses it's own tick (so it
        // can be paused, etc) and calculates
        // it from the system tick
        
    systemTick=Math.trunc(window.performance.now());
    game.timestamp+=(systemTick-game.lastSystemTimestamp);
    game.lastSystemTimestamp=systemTick;
    
        // map movement, entities, and
        // other physics, we only do this if we've
        // moved unto another physics tick
        
        // this timing needs to be precise so
        // physics remains constants
        
    game.physicsTick=game.timestamp-game.lastPhysicTimestamp;

    if (game.physicsTick>PHYSICS_MILLISECONDS) {

        if (game.physicsTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

            while (game.physicsTick>PHYSICS_MILLISECONDS) {
                game.physicsTick-=PHYSICS_MILLISECONDS;
                game.lastPhysicTimestamp+=PHYSICS_MILLISECONDS;

                map.meshList.run();
                core.run();
                core.game.run();
                map.entityList.run();
            }
        }
        else {
            game.lastPhysicTimestamp=game.timestamp;
        }

            // update the listener and all current
            // playing sound positions

        core.soundList.updateListener();
    
            // if multiplayer, handle all
            // the network updates and messages
        
        if (isNetworkGame) core.network.run();
    }
    
        // clean up deleted entities
        // and effects
        
    map.entityList.cleanUpMarkedAsDeleted();
    map.effectList.cleanUpMarkedAsDeleted();
    
        // time to exit loop?
        
    if (game.exitGame) {
        setTimeout(window.main.core.title.startTitleLoop.bind(window.main.core.title),1);  // always force it to start on next go around
        return;
    }
    
        // drawing
        
        // this timing is loose, as it's only there to
        // draw frames
        
    game.drawTick=game.timestamp-game.lastDrawTimestamp;
    
    if (game.drawTick>DRAW_MILLISECONDS) {
        game.lastDrawTimestamp=game.timestamp; 

        core.draw();
        
        core.fpsTotal+=game.drawTick;
        core.fpsCount++;
    }
    
        // the fps
        
    if (core.fpsStartTimestamp===-1) core.fpsStartTimestamp=game.timestamp; // a reset from paused state
    
    fpsTime=game.timestamp-core.fpsStartTimestamp;
    if (fpsTime>=1000) {
        core.fps=(core.fpsCount*1000.0)/core.fpsTotal;
        core.fpsStartTimestamp=game.timestamp;

        core.fpsTotal=0;
        core.fpsCount=0;
    }
    
        // special check for touch controls
        // pausing the game

    if (core.input.touchMenuTrigger) core.setPauseState(true,false);
    
        // next frame
        
    window.requestAnimationFrame(gameMainLoop);
}
