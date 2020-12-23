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
        this.LOAD_STAGE_MODEL=6;
        this.LOAD_STAGE_SOUND=7;
        this.LOAD_STAGE_MUSIC=8;
        this.LOAD_STAGE_ENTITIES=9;
        this.LOAD_STAGE_FINALIZE=10;
        
        this.loadStage=0;
        this.loadStageIndex=0;
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
            // when the game officially starts
            
        game.timestamp=0;
            
            // initialize the map
          
        game.map=new MapClass(this.core,game.currentMapName);
        if (!game.map.initialize()) return;
        
        this.loadStage=this.LOAD_STAGE_MAP;
        this.loadStageIndex=0;
    }
    
    async stageMap()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Loading Map');
        
        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        if (!(await game.map.loadMap())) {
            this.inError=true;
            return;
        }
        
        //this.loadStage=this.LOAD_STAGE_MAP_BITMAP;
        this.loadStage=this.LOAD_STAGE_MAP_PATH;
        this.loadStageIndex=0;
    }
    
    async stageMapPath()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Loading Map Paths');
        
        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        await game.map.path.load();
        
        //this.loadStage=this.LOAD_STAGE_MAP_BITMAP;
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
        this.setLoadStatus('Loading Shadowmaps');
        
        let shadowmapLoad=new ShadowmapLoadClass(this.core);
        
        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        if (!(await shadowmapLoad.load())) {
            this.inError=true;
            return;
        }

        this.loadStage=this.LOAD_STAGE_MODEL;
        this.loadStageIndex=0;
    }
    
    async stageModel()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Loading Models');

        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        if (!(await game.map.modelList.loadAllModels())) {
            this.inError=true;
            return;
        }
        
        this.loadStage=this.LOAD_STAGE_SOUND;
        this.loadStageIndex=0;
    }
    
    async stageSound()
    {
        let game=this.core.game;
        
        this.setLoadStatus('Loading Sound');

        this.loadStage=this.LOAD_STAGE_AWAIT;           // we are awaiting this, so we need to pause the loop until the await returns
        if (!(await game.map.soundList.loadAllSounds()))  {
            this.inError=true;
            return;
        }
    
        this.loadStage=this.LOAD_STAGE_MUSIC;
        this.loadStageIndex=0;
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

            // start the input

        game.core.input.initialize(game.map.entityList.getPlayer());
        
            // ready all the entities
            
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
        const DRAW_MILLISECONDS=32;

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

/* SUPERGUMBA -- old multiplayer
 * 

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
            
        this.draw('Connecting to Server');
        
        this.network.connect(this.runMultiplayerConnectedOK.bind(this),this.runMultiplayerConnectedError.bind(this));     // return here, callback from connection or error
    }
    
    runMultiplayerConnectedOK()
    {
        this.draw('Loading Map');
        
        setTimeout(this.initLoadMap.bind(this),1);
    }
    
    runMultiplayerConnectedError()
    {
        alert(this.network.lastErrorMessage);
        this.runMultiplayerDialog();
    }

        
            // if we are in a non-local networked game, last thing to
            // do is request a map_sync to get the map in the right time
            

        if (this.multiplayer) {
            this.draw('Connecting to Server');
        
            this.network.sync(this.runMultiplayerSyncOK.bind(this),this.runMultiplayerSyncError.bind(this));     // return here, callback from connection or error
            return;
        }


    
    runMultiplayerSyncOK()
    {
        initDone();
    }
    
    runMultiplayerSyncError()
    {
        alert(this.network.lastErrorMessage);  // this all needs to be redone
        this.network.disconnect();
    }

 */