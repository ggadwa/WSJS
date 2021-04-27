import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';
import MapClass from '../map/map.js';
import ShadowmapLoadClass from '../light/shadowmap_load.js';

export default class GameLoadClass
{
    constructor(core,data)
    {
        this.core=core;
        this.data=data;
        
        this.LOAD_STAGE_AWAIT=-1;       // special loop when we are in an await, which branches execution
        this.LOAD_STAGE_ERROR=-2;       // special loop when an await eventually throws an error
        this.LOAD_STAGE_INIT=0;
        this.LOAD_STAGE_MAP=1;
        this.LOAD_STAGE_MAP_BITMAP=2;
        this.LOAD_STAGE_MAP_PATH=3;
        this.LOAD_STAGE_MAP_COLLISION_GEOMETRY=4;
        this.LOAD_STAGE_MAP_SHADOWMAP=5;
        this.LOAD_STAGE_MAP_SHADOWMAP_BITMAP=6;
        this.LOAD_STAGE_MODEL=7;
        this.LOAD_STAGE_SOUND=8;
        this.LOAD_STAGE_MUSIC=9;
        this.LOAD_STAGE_ENTITIES=10;
        this.LOAD_STAGE_FINALIZE=11;
        
        this.loadStage=0;
        this.loadStageIndex=0;
        this.loadStageBitmapList=null;
        this.loadStageModelList=null;
        this.loadStageSoundList=null;
        this.loadStageMusicList=null;
        this.statusStr='';
        
        this.inError=false;
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.lastDrawTimestamp=0;
        
        Object.seal(this);
    }
    
    initialize()
    {
    }
    
    release()
    {
    }
    
        //
        // start and resume loading loop
        //
        
    startLoop()
    {
        this.loadStage=this.LOAD_STAGE_INIT;
        this.loadStageIndex=0;
        
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        this.lastDrawTimestamp=0;
        
        this.inError=false;
    }
    
    resumeLoop()
    {
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        this.lastDrawTimestamp=this.timestamp;
    }
    
        //
        // status
        //
       
    setLoadStatus(str)
    {
        this.statusStr=str;
        console.info(str);
    }
    
        //
        // game loading stages
        //
    
    stageInit()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Initializing');
        
            // this needs to be set now because
            // when animations are loaded in they get
            // set to this timestamp, we reset it again
            // when the game officially starts, otherwise
            // the animations are all messed up
            
        game.timestamp=0;
        
            // regular game, move on to loading map
        
        if (game.multiplayerMode!==game.MULTIPLAYER_MODE_JOIN) {
            this.loadStage=this.LOAD_STAGE_MAP;
            this.loadStageIndex=0;
            return;
        }
        
            // if a joined multiplayer, connect to network
            // this is done on a callback basis so we need to
            // use the await to freeze the tick calls
            
        this.setLoadStatus('Connecting to Host');
        
        this.loadStage=this.LOAD_STAGE_AWAIT;
        game.network.connect(this.stageNetworkConnectOK.bind(this),this.stageNetworkConnectError.bind(this));     // return here, callback from connection or error
    }
    
    stageNetworkConnectOK()
    {
        this.loadStage=this.LOAD_STAGE_AWAIT;
        thia.core.game.network.sync(this.runMultiplayerSyncOK.bind(this),this.runMultiplayerSyncError.bind(this));     // return here, callback from connection or error
    }
    
    stageNetworkConnectError(errStr)
    {
        this.core.dialogError.setup('Network error: '+this.core.setup.multiplayerServerURL,errStr);
        this.core.switchLoop(this.core.LOOP_DIALOG_ERROR);
    }
    
    runMultiplayerSyncOK()
    {
        this.loadStage=this.LOAD_STAGE_MAP;
        this.loadStageIndex=0;
    }
    
    runMultiplayerSyncError(errStr)
    {
        this.core.dialogError.setup('Network error: '+this.core.setup.multiplayerServerURL,errStr);
        this.core.switchLoop(this.core.LOOP_DIALOG_ERROR);
    }
    
    async stageMap()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Loading Map');
        
        console.log(game.currentMapName);
        game.map=new MapClass(this.core,game.currentMapName);
        if (!game.map.initialize()) return;
        
        this.loadStageBitmapList=[];
        
        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        if (!(await game.map.loadMap(this.loadStageBitmapList))) {
            this.inError=true;
            return;
        }
        
        if (!game.map.entityList.addDynamicMultiplayerEntities()) { // multiplayer maps have dynamic entities not in the glTF file, need to add them here
            this.inError=true;
            return;
        }
        
        game.map.effectList.addSharedBitmapToLoadList(this.loadStageBitmapList);    // effect bitmaps
        
        this.loadStage=this.LOAD_STAGE_MAP_BITMAP;
        this.loadStageIndex=0;
    }
    
    async stageMapBitmap()
    {
        let bitmap;
        
            // done with bitmaps?
            
        if (this.loadStageIndex>=this.loadStageBitmapList.length) {
            this.loadStage=this.LOAD_STAGE_MAP_PATH;
            this.loadStageIndex=0;
            return;
        }
        
            // next bitmap

        bitmap=this.loadStageBitmapList[this.loadStageIndex];
        this.setLoadStatus('Loading Bitmap: '+bitmap.colorURL);
        
        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        if (!(await bitmap.load())) {
            this.inError=true;
            return;
        }
        
        this.loadStage=this.LOAD_STAGE_MAP_BITMAP;
        this.loadStageIndex++;
    }
    
    async stageMapPath()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Loading Map Paths');
        
        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        await game.map.path.load();
        
        this.loadStage=this.LOAD_STAGE_MAP_COLLISION_GEOMETRY;
        this.loadStageIndex=0;
    }
    
    stageMapCollisionGeometry()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Creating Collision Geometry');
        
        game.map.meshList.buildCollisionGeometry();

        this.loadStage=this.LOAD_STAGE_MAP_SHADOWMAP;
        this.loadStageIndex=0;
    }
    
    async stageMapShadowmap()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Loading Shadowmaps');
        
        let shadowmapLoad=new ShadowmapLoadClass(this.core);
        
        this.loadStageBitmapList=[];
        
        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        if (!(await shadowmapLoad.load(this.loadStageBitmapList))) {
            this.inError=true;
            return;
        }

            // if we have a shadowmap, load the bitmaps
            // else go directly to the models
            
        this.loadStage=(game.map.hasShadowmap)?this.LOAD_STAGE_MAP_SHADOWMAP_BITMAP:this.LOAD_STAGE_MODEL;
        this.loadStageIndex=0;
    }
    
    async stageMapShadowmapBitmap()
    {
        let bitmap;
        
            // done with bitmaps?
            
        if (this.loadStageIndex>=this.loadStageBitmapList.length) {
            this.loadStage=this.LOAD_STAGE_MODEL;
            this.loadStageIndex=0;
            return;
        }
        
            // next bitmap

        bitmap=this.loadStageBitmapList[this.loadStageIndex];
        this.setLoadStatus('Loading Bitmap: '+bitmap.colorURL);
        
        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        if (!(await bitmap.load())) {
            this.inError=true;
            return;
        }
        
        this.loadStage=this.LOAD_STAGE_MAP_SHADOWMAP_BITMAP;
        this.loadStageIndex++;
    }
    
    async stageModel()
    {
        let name,model;
        let game=this.core.game;
        
            // if this is the first model we hit,
            // then we need to construct the list first
            
        if (this.loadStageIndex===0) {
            game.map.modelList.buildModelList();
            this.loadStageModelList=Array.from(game.map.modelList.models.keys());
        }
        
            // are we out of models?
            
        if (this.loadStageIndex>=this.loadStageModelList.length) {
            this.loadStage=this.LOAD_STAGE_SOUND;
            this.loadStageIndex=0;
            return;
        }
        
            // load a model
            
        name=this.loadStageModelList[this.loadStageIndex];
        model=game.map.modelList.models.get(name);
        
        this.setLoadStatus('Loading Model: '+name);

        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        if (!(await model.load())) {
            this.inError=true;
            return;
        }
        
        this.loadStage=this.LOAD_STAGE_MODEL;
        this.loadStageIndex++;
    }
    
    async stageSound()
    {
        let name,sound;
        let game=this.core.game;
        
            // if this is the first sound we hit,
            // then we need to construct the list first
            
        if (this.loadStageIndex===0) {
            game.map.soundList.buildSoundList();
            this.loadStageSoundList=Array.from(game.map.soundList.sounds.keys());
        }
        
            // are we out of sounds?
            
        if (this.loadStageIndex>=this.loadStageSoundList.length) {
            this.loadStage=this.LOAD_STAGE_MUSIC;
            this.loadStageIndex=0;
            return;
        }
        
            // load a sound
            
        name=this.loadStageSoundList[this.loadStageIndex];
        sound=game.map.soundList.sounds.get(name);

        this.setLoadStatus('Loading Sound: '+name);

        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        if (!(await sound.load())) {
            this.inError=true;
            return;
        }
        
        this.loadStage=this.LOAD_STAGE_SOUND;
        this.loadStageIndex++;
    }
    
    async stageMusic()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Loading Music');

        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        if (!(await game.map.music.load()))  {
            this.inError=true;
            return;
        }
    
        this.loadStage=this.LOAD_STAGE_ENTITIES;
        this.loadStageIndex=0;
    }
    
    stageEntities()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Setting up Entities');
        
            // call the map ready
        
        game.map.ready();
        
            // initialize any map effects
            
        if (!game.map.effectList.initializeMapEffects()) return(false);        // halt on bad effect start

            // initialize any map entities
            
        if (!game.map.entityList.initializeMapEntities()) return(false);    // halt on bad entity start
        
        this.loadStage=this.LOAD_STAGE_FINALIZE;
        this.loadStageIndex=0;
        
        return(true);
    }
    
    stageFinalize()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Finalizing');
        
        game.triggers.clear();
        
            // multiplayer scores
            
        game.overlay.multiplayerInitScores();
        
            // setup draw buffers

        game.map.setupBuffers();
        
            // set the listener to this entity
            
        game.core.audio.setListenerToEntity(game.map.entityList.getPlayer());
        
            // ready all the entities
        
        game.map.effectList.ready();    
        game.map.entityList.ready();
       
            // start the main loop
            
        this.core.switchLoop(this.core.LOOP_GAME);
    }
    
        //
        // drawing
        //
    
    draw()
    {
        let col,text;
        let gl=this.core.gl;
        
        this.core.orthoMatrix.setOrthoMatrix(this.core.canvas.width,this.core.canvas.height,-1.0,1.0);
            
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
        this.core.background.draw(true);

        this.core.shaderList.textShader.drawStart();
        
        col=new ColorClass(1.0,1.0,0.0);
        
        text=new TextClass(this.core,this.statusStr,5,(this.core.canvas.height-5),20,this.core.TEXT_ALIGN_LEFT,col,1);
        text.initialize();
        text.draw();
        text.release();
        
        this.core.shaderList.textShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }

        //
        // main loop
        //
        
    async loop()
    {
        const DRAW_MILLISECONDS=64;

        let systemTick;
        
        try {
            switch (this.loadStage) {

                case this.LOAD_STAGE_AWAIT:
                    // this is a special stage that does nothing because we are using an await which will branch
                    // the execution, we need to do nothing until the original await resets the stage
                    return;

                case this.LOAD_STAGE_INIT:
                    this.stageInit();
                    break;
                case this.LOAD_STAGE_MAP:
                    await this.stageMap();
                    break;
                case this.LOAD_STAGE_MAP_BITMAP:
                    await this.stageMapBitmap();
                    break;
                case this.LOAD_STAGE_MAP_PATH:
                    await this.stageMapPath();
                    break;
                case this.LOAD_STAGE_MAP_COLLISION_GEOMETRY:
                    this.stageMapCollisionGeometry();
                    break;
                case this.LOAD_STAGE_MAP_SHADOWMAP:
                    await this.stageMapShadowmap();
                    break;
                case this.LOAD_STAGE_MAP_SHADOWMAP_BITMAP:
                    await this.stageMapShadowmapBitmap();
                    break;
                case this.LOAD_STAGE_MODEL:
                    await this.stageModel();
                    break;
                case this.LOAD_STAGE_SOUND:
                    await this.stageSound();
                    break;
                case this.LOAD_STAGE_MUSIC:
                    await this.stageMusic();
                    break;
                case this.LOAD_STAGE_ENTITIES:
                    if (!this.stageEntities()) {        // failure on entities to start halts game
                        this.inError=true;
                        return;
                    }
                    break;
                case this.LOAD_STAGE_FINALIZE:
                    this.stageFinalize();
                    break;
            }
        }
        catch (ex)
        {
            console.info(ex);       // any and all errors automatically halt execution when loading a game
            this.inError=true;
            return;
        }
        
            // loop uses it's own tick (so it
            // can be paused, etc) and calculates
            // it from the system tick

        systemTick=Math.trunc(window.performance.now());
        this.timestamp+=(systemTick-this.lastSystemTimestamp);
        this.lastSystemTimestamp=systemTick;

            // drawing

        if ((this.timestamp-this.lastDrawTimestamp)>DRAW_MILLISECONDS) {
            this.lastDrawTimestamp=this.timestamp; 
            this.draw();
        }
    }
}
