import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import PlaneClass from '../utility/plane.js';
import Matrix4Class from '../utility/matrix4.js';
import MapClass from '../map/map.js';
import CameraClass from '../main/camera.js';
import ShadowmapLoadClass from '../light/shadowmap_load.js';
import SequenceClass from '../sequence/sequence.js';
import EntityFPSPlayerClass from '../project/entity_fps_player.js';
import EntityFPSBotClass from '../project/entity_fps_bot.js';

export default class GameClass
{
    constructor(core,data)
    {
        this.MAX_SCORE_COUNT=10;
        
        this.core=core;
        this.data=data;
        
        this.map=null;
        
        this.MULTIPLAYER_MODE_NONE=0;
        this.MULTIPLAYER_MODE_LOCAL=1;
        this.MULTIPLAYER_MODE_JOIN=2;
        
        this.multiplayerMode=this.MULTIPLAYER_MODE_NONE;
        
        this.jsonEntityCache=new Map();
        this.jsonEffectCache=new Map();
        this.jsonSequenceCache=new Map();
        
        this.scores=null;
        this.scoreShow=false;
        this.scoreLastItemCount=0;
        this.scoreColor=new ColorClass(0,1,0.2);
        
            // camera
            
        this.cameraShakeStartTick=-1;
        this.cameraShakeTick=0;
        this.cameraShakeShift=0;
        
        this.camera=null;
        
            // sequences
            
        this.currentSequence=null;
        
        this.freezePlayer=false;
        this.freezeAI=false;
        this.hideUI=false;
 
            // triggers
            
        this.triggers=new Map();
        
            // stats
            
        this.fps=0.0;
        this.fpsTotal=0;
        this.fpsCount=0;
        this.fpsStartTimestamp=0;
        
            // loading screen

        this.loadingStrings=[];
        this.loadingLastAddMsec=0;
        
            // loop
            
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.inLoading=false;
        this.exitGame=false;
        
            // eye
            
        this.lookAtUpVector=new PointClass(0.0,-1.0,0.0);
        this.eyePos=new PointClass(0.0,0.0,0.0);
        
        this.cameraSpaceEyePos=new PointClass(0,0,0);
        this.cameraSpacePos=new PointClass(0,0,0);
        this.cameraSpaceViewMatrix=new Matrix4Class();

        this.eyeRotMatrix=new Matrix4Class();
        this.eyeRotMatrix2=new Matrix4Class();
        this.billboardMatrix=new Matrix4Class();

            // view lighting

        this.lights=[];

            // frustum planes

        this.clipPlane=new Float32Array(16);            // global to avoid GCd

        this.frustumLeftPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumRightPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumTopPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumBottomPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumNearPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        this.frustumFarPlane=new PlaneClass(0.0,0.0,0.0,0.0);
        
        Object.seal(this);
    }
    
        //
        // initialize and release
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
        let n;
        let promises,name,success;
        
            // cache all the entity json
            
        promises=[];
        
        for (name of this.core.json.entities) {
            promises.push(this.fetchJson('entities/'+name));
        }
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    values=>{
                        for (n=0;n<values.length;n++) {
                            this.jsonEntityCache.set(this.core.json.entities[n],values[n]);
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
        
        for (name of this.core.json.effects) {
            promises.push(this.fetchJson('effects/'+name));
        }
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    values=>{
                        for (n=0;n<values.length;n++) {
                            this.jsonEffectCache.set(this.core.json.effects[n],values[n]);
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
        
        for (name of this.core.json.sequences) {
            promises.push(this.fetchJson('sequences/'+name));
        }
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    values=>{
                        for (n=0;n<values.length;n++) {
                            this.jsonSequenceCache.set(this.core.json.sequences[n],values[n]);
                        }
                    },
                    reason=>{
                        console.log(reason);
                        success=false;
                    }
                );
        
        if (!success) return(false);
        
            // the camera
            
        this.camera=new CameraClass(this.core);
        if (!this.camera.initialize()) return;

        return(true);
    }
    
    release()
    {
        this.camera.release();
        this.map.release();
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
        if (this.core.json.config.sequenceWon!==null) this.startSequence(this.core.json.config.sequenceWon);
    }
    
    lost()
    {
        console.info('lost');
        if (this.core.json.config.sequenceLost!==null) this.startSequence(this.core.json.config.sequenceLost);
    }
    
        //
        // sequences
        //
        
    runStartSequence()
    {
        if (this.core.json.config.sequenceStart!==null) this.startSequence(this.core.json.config.sequenceStart);
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
        
        if (this.multiplayerMode===this.MULTIPLAYER_MODE_NONE) return;
        
            // any messages
            
        points=0;
            
        if ((fromEntity!==null) && ((fromEntity instanceof EntityFPSPlayerClass) || (fromEntity instanceof EntityFPSBotClass))) {
            if (isTelefrag) {
                scoreEntity=fromEntity;
                points=1;
                if (this.core.json.config.multiplayerMessageText!==null) this.core.interface.updateTemporaryText(this.core.json.config.multiplayerMessageText,(fromEntity.name+' telefragged '+killedEntity.name),this.core.json.config.multiplayerMessageWaitTick);
            }
            else {
                if (fromEntity!==killedEntity) {
                    scoreEntity=fromEntity;
                    points=1;
                    if (this.core.json.config.multiplayerMessageText!==null) this.core.interface.updateTemporaryText(this.core.json.config.multiplayerMessageText,(fromEntity.name+' killed '+killedEntity.name),this.core.json.config.multiplayerMessageWaitTick);
                }
                else {
                    scoreEntity=killedEntity;
                    points=-1;
                    if (this.core.json.config.multiplayerMessageText!==null) this.core.interface.updateTemporaryText(this.core.json.config.multiplayerMessageText,(killedEntity.name+' committed suicide'),this.core.json.config.multiplayerMessageWaitTick);
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
        
        if (this.multiplayerMode===this.MULTIPLAYER_MODE_NONE) return;
        
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
        if (this.core.json.config.multiplayerMessageText!==null) this.core.interface.updateTemporaryText(this.core.json.config.multiplayerMessageText,(name+' has joined'),5000);
    }
    
    remoteLeaving(name)
    {
        this.scores.delete(name);
        if (this.core.json.config.multiplayerMessageText!==null) this.core.interface.updateTemporaryText(this.core.json.config.multiplayerMessageText,(name+' has left'),5000);
    }
    
        //
        // game loop
        //
        
    startLoop()
    {
        let startMap;
        
            // need to pause loop if in loading
            
        this.inLoading=true;
        
        this.loadingScreenClear();
        
          // initialize the map
          
        if (this.multiplayerMode===this.MULTIPLAYER_MODE_NONE) {
            startMap=this.core.game.lookupValue(this.core.json.startMap,this.data);
        }
        else {
            startMap=this.core.json.multiplayerMaps[this.core.setup.localMap];
        }
        
        this.map=new MapClass(this.core,startMap);
        if (!this.map.initialize()) return;

            // next step

        //if (!this.multiplayer) {
            this.loadingScreenUpdate();
            this.loadingScreenAddString('Loading Map');
            this.loadingScreenDraw();

            setTimeout(this.initLoadMap.bind(this),1);
            /*
        }
        else {
            this.loadingScreenUpdate();
            this.loadingScreenAddString('Waiting for Setup');
            this.loadingScreenDraw();
            
            setTimeout(this.runMultiplayerDialog.bind(this),1);
        }

             */
    }
    
    resumeLoop()
    {
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.lastRunTimestamp=this.timestamp;
        this.lastDrawTimestamp=this.timestamp;
        
        this.exitGame=false;
        
        this.core.audio.musicStart(this.map.music);
    }
    
    setMultiplayerMode(multiplayerMode)
    {
        this.multiplayerMode=multiplayerMode;
    }
    
        //
        // game startup
        //
    
    
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
            
        this.loadingScreenUpdate();
        this.loadingScreenAddString('Connecting to Server');
        this.loadingScreenDraw();
        
        this.core.network.connect(this.runMultiplayerConnectedOK.bind(this),this.runMultiplayerConnectedError.bind(this));     // return here, callback from connection or error
    }
    
    runMultiplayerConnectedOK()
    {
        this.loadingScreenUpdate();
        this.loadingScreenAddString('Loading Map');
        this.loadingScreenDraw();
        
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
        if (!(await this.map.loadMap())) return;
        
        this.loadingScreenUpdate();
        this.loadingScreenAddString('Building Collision Geometry');
        this.loadingScreenDraw();
        
        setTimeout(this.initCollisionGeometry.bind(this),1);
    }
    
    initCollisionGeometry()
    {
        this.map.meshList.buildCollisionGeometry();
        
        this.loadingScreenUpdate();

        this.loadingScreenAddString('Loading Shadowmap');
        this.loadingScreenDraw();

        setTimeout(this.initLoadShadowmap.bind(this),1);
    }
    
    async initLoadShadowmap()
    {
        let shadowmapLoad=new ShadowmapLoadClass(this.core);
        
        if (!(await shadowmapLoad.load())) return;
        
        this.loadingScreenUpdate();
        this.loadingScreenAddString('Loading Models');
        this.loadingScreenDraw();
       
        setTimeout(this.initLoadModels.bind(this),1);    
    }
    
    async initLoadModels()
    {
        if (!(await this.map.modelList.loadAllModels())) return;
        
        this.loadingScreenUpdate();
        this.loadingScreenAddString('Loading Sounds');
        this.loadingScreenDraw();
        
        setTimeout(this.initLoadSounds.bind(this),1);
    }
    
    async initLoadSounds()
    {
        if (!(await this.map.soundList.loadAllSounds())) return;
        if (!(await this.map.music.load())) return;
    
        this.loadingScreenUpdate();
        this.loadingScreenAddString('Loading Images');
        this.loadingScreenDraw();

        setTimeout(this.initLoadImages.bind(this),1);
    }
    
    async initLoadImages()
    {
        if (!(await this.core.bitmapList.loadAllBitmaps())) return;
        
        this.loadingScreenUpdate();
        this.loadingScreenAddString('Initializing Entities and Effects');
        this.loadingScreenDraw();
        
        setTimeout(this.initLoadEntities.bind(this),1);
    }
    
    initLoadEntities()
    {
            // call the map ready
        
        this.map.ready();
        
            // initialize any map effects
            
        if (!this.map.effectList.initializeMapEffects()) return;        // halt on bad effect start

            // initialize any map entities
            
        if (!this.map.entityList.initializeMapEntities()) return;    // halt on bad entity start
        
        this.loadingScreenUpdate();
        this.loadingScreenAddString('Finalizing');
        this.loadingScreenDraw();
        this.core.canvas.style.display='';
        
        setTimeout(this.initFinalSetup.bind(this),1);
    }
    
    initFinalSetup()
    {
        let n,y;
        let entity;
        
        this.triggers.clear();
        
            // json interface
            
        if (!this.core.interface.addFromJson(this.core.json.interface)) return(false);
        
            // multiplayer scores
            
        if (this.multiplayerMode!==this.MULTIPLAYER_MODE_NONE) {
            
                // current scores
                
            this.scores=new Map();

            for (entity of this.map.entityList.entities) {
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
        
            // setup draw buffers

        this.map.setupBuffers();
        
            // set the listener to this entity
            
        this.core.audio.setListenerToEntity(this.map.entityList.getPlayer());

            // start the input

        this.core.input.initialize(this.map.entityList.getPlayer());
        
            // ready all the entities
            
        this.map.entityList.ready();
        
            // no sequences
            
        this.currentSequence=null;
        
        this.freezePlayer=false;
        this.freezeAI=false;
        this.hideUI=false;
        
            // if we are in a non-local networked game, last thing to
            // do is request a map_sync to get the map in the right time
            
            /*
        if (this.multiplayer) {
            this.loadingScreenUpdate();
            this.loadingScreenAddString('Connecting to Server');
            this.loadingScreenDraw();
        
            this.core.network.sync(this.runMultiplayerSyncOK.bind(this),this.runMultiplayerSyncError.bind(this));     // return here, callback from connection or error
            return;
        }
        */
       
            // start the main loop
            
        this.initDone();
    }
    
    runMultiplayerSyncOK()
    {
        initDone();
    }
    
    runMultiplayerSyncError()
    {
        alert(this.core.network.lastErrorMessage);  // this all needs to be redone
        this.network.disconnect();
    }
       
    initDone()
    {
            // start the main loop
            
        this.core.currentLoop=this.core.LOOP_GAME;
        
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.inLoading=false;
        this.exitGame=false;
        
            // start any music
            
        this.core.audio.musicStart(this.map.music);
        
            // start any sequence
            
        this.runStartSequence();
    }
    
        //
        // camera shaking
        //
        
    startCameraShake(shakeTick,shakeShift)
    {
        this.cameraShakeStartTick=this.timestamp;
        this.cameraShakeTick=shakeTick;
        this.cameraShakeShift=shakeShift;
    }
    
    runCameraShake()
    {
        let tick,shakeSize;
        
        if (this.cameraShakeStartTick===-1) return;
        
            // time to end shake?
            
        tick=this.timestamp-this.cameraShakeStartTick;
        if (tick>this.cameraShakeTick) {
            this.cameraShakeStartTick=-1;
            return;
        }
        
            // shake camera
         
        shakeSize=this.cameraShakeShift*(1.0-(tick/this.cameraShakeTick));
        this.eyePos.x+=Math.trunc(Math.random()*shakeSize);
        this.eyePos.y+=Math.trunc(Math.random()*shakeSize);
        this.eyePos.z+=Math.trunc(Math.random()*shakeSize);
    }
    
        //
        // sequences
        //
        
    startSequence(jsonName)
    {
        this.currentSequence=new SequenceClass(this.core,jsonName);
        
        if (!this.currentSequence.initialize()) {
            console.log(`unable to start sequence: ${jsonName}`);
            this.currentSequence=null;
        }
    }
    
        //
        // coordinate and frustums
        //
    
    convertToEyeCoordinates(pnt,eyePnt)
    {
        let viewMatrix=this.core.viewMatrix;
        
        eyePnt.x=(pnt.x*viewMatrix.data[0])+(pnt.y*viewMatrix.data[4])+(pnt.z*viewMatrix.data[8])+viewMatrix.data[12];
        eyePnt.y=(pnt.x*viewMatrix.data[1])+(pnt.y*viewMatrix.data[5])+(pnt.z*viewMatrix.data[9])+viewMatrix.data[13];
        eyePnt.z=(pnt.x*viewMatrix.data[2])+(pnt.y*viewMatrix.data[6])+(pnt.z*viewMatrix.data[10])+viewMatrix.data[14];
    }

    buildCullingFrustum()
    {
        let viewMatrix=this.core.viewMatrix;
        let perspectiveMatrix=this.core.perspectiveMatrix;
        
            // combine the matrixes
            // to build the frustum
            // ABCD planes equations

        this.clipPlane[0]=(viewMatrix.data[0]*perspectiveMatrix.data[0])+(viewMatrix.data[1]*perspectiveMatrix.data[4])+(viewMatrix.data[2]*perspectiveMatrix.data[8])+(viewMatrix.data[3]*perspectiveMatrix.data[12]);
        this.clipPlane[1]=(viewMatrix.data[0]*perspectiveMatrix.data[1])+(viewMatrix.data[1]*perspectiveMatrix.data[5])+(viewMatrix.data[2]*perspectiveMatrix.data[9])+(viewMatrix.data[3]*perspectiveMatrix.data[13]);
        this.clipPlane[2]=(viewMatrix.data[0]*perspectiveMatrix.data[2])+(viewMatrix.data[1]*perspectiveMatrix.data[6])+(viewMatrix.data[2]*perspectiveMatrix.data[10])+(viewMatrix.data[3]*perspectiveMatrix.data[14]);
        this.clipPlane[3]=(viewMatrix.data[0]*perspectiveMatrix.data[3])+(viewMatrix.data[1]*perspectiveMatrix.data[7])+(viewMatrix.data[2]*perspectiveMatrix.data[11])+(viewMatrix.data[3]*perspectiveMatrix.data[15]);

        this.clipPlane[4]=(viewMatrix.data[4]*perspectiveMatrix.data[0])+(viewMatrix.data[5]*perspectiveMatrix.data[4])+(viewMatrix.data[6]*perspectiveMatrix.data[8])+(viewMatrix.data[7]*perspectiveMatrix.data[12]);
        this.clipPlane[5]=(viewMatrix.data[4]*perspectiveMatrix.data[1])+(viewMatrix.data[5]*perspectiveMatrix.data[5])+(viewMatrix.data[6]*perspectiveMatrix.data[9])+(viewMatrix.data[7]*perspectiveMatrix.data[13]);
        this.clipPlane[6]=(viewMatrix.data[4]*perspectiveMatrix.data[2])+(viewMatrix.data[5]*perspectiveMatrix.data[6])+(viewMatrix.data[6]*perspectiveMatrix.data[10])+(viewMatrix.data[7]*perspectiveMatrix.data[14]);
        this.clipPlane[7]=(viewMatrix.data[4]*perspectiveMatrix.data[3])+(viewMatrix.data[5]*perspectiveMatrix.data[7])+(viewMatrix.data[6]*perspectiveMatrix.data[11])+(viewMatrix.data[7]*perspectiveMatrix.data[15]);

        this.clipPlane[8]=(viewMatrix.data[8]*perspectiveMatrix.data[0])+(viewMatrix.data[9]*perspectiveMatrix.data[4])+(viewMatrix.data[10]*perspectiveMatrix.data[8])+(viewMatrix.data[11]*perspectiveMatrix.data[12]);
        this.clipPlane[9]=(viewMatrix.data[8]*perspectiveMatrix.data[1])+(viewMatrix.data[9]*perspectiveMatrix.data[5])+(viewMatrix.data[10]*perspectiveMatrix.data[9])+(viewMatrix.data[11]*perspectiveMatrix.data[13]);
        this.clipPlane[10]=(viewMatrix.data[8]*perspectiveMatrix.data[2])+(viewMatrix.data[9]*perspectiveMatrix.data[6])+(viewMatrix.data[10]*perspectiveMatrix.data[10])+(viewMatrix.data[11]*perspectiveMatrix.data[14]);
        this.clipPlane[11]=(viewMatrix.data[8]*perspectiveMatrix.data[3])+(viewMatrix.data[9]*perspectiveMatrix.data[7])+(viewMatrix.data[10]*perspectiveMatrix.data[11])+(viewMatrix.data[11]*perspectiveMatrix.data[15]);

        this.clipPlane[12]=(viewMatrix.data[12]*perspectiveMatrix.data[0])+(viewMatrix.data[13]*perspectiveMatrix.data[4])+(viewMatrix.data[14]*perspectiveMatrix.data[8])+(viewMatrix.data[15]*perspectiveMatrix.data[12]);
        this.clipPlane[13]=(viewMatrix.data[12]*perspectiveMatrix.data[1])+(viewMatrix.data[13]*perspectiveMatrix.data[5])+(viewMatrix.data[14]*perspectiveMatrix.data[9])+(viewMatrix.data[15]*perspectiveMatrix.data[13]);
        this.clipPlane[14]=(viewMatrix.data[12]*perspectiveMatrix.data[2])+(viewMatrix.data[13]*perspectiveMatrix.data[6])+(viewMatrix.data[14]*perspectiveMatrix.data[10])+(viewMatrix.data[15]*perspectiveMatrix.data[14]);
        this.clipPlane[15]=(viewMatrix.data[12]*perspectiveMatrix.data[3])+(viewMatrix.data[13]*perspectiveMatrix.data[7])+(viewMatrix.data[14]*perspectiveMatrix.data[11])+(viewMatrix.data[15]*perspectiveMatrix.data[15]);

                // left plane

        this.frustumLeftPlane.a=this.clipPlane[3]+this.clipPlane[0];
        this.frustumLeftPlane.b=this.clipPlane[7]+this.clipPlane[4];
        this.frustumLeftPlane.c=this.clipPlane[11]+this.clipPlane[8];
        this.frustumLeftPlane.d=this.clipPlane[15]+this.clipPlane[12];
        this.frustumLeftPlane.normalize();

                // right plane

        this.frustumRightPlane.a=this.clipPlane[3]-this.clipPlane[0];
        this.frustumRightPlane.b=this.clipPlane[7]-this.clipPlane[4];
        this.frustumRightPlane.c=this.clipPlane[11]-this.clipPlane[8];
        this.frustumRightPlane.d=this.clipPlane[15]-this.clipPlane[12];
        this.frustumRightPlane.normalize();

                // top plane

        this.frustumTopPlane.a=this.clipPlane[3]-this.clipPlane[1];
        this.frustumTopPlane.b=this.clipPlane[7]-this.clipPlane[5];
        this.frustumTopPlane.c=this.clipPlane[11]-this.clipPlane[9];
        this.frustumTopPlane.d=this.clipPlane[15]-this.clipPlane[13];
        this.frustumTopPlane.normalize();

                // bottom plane

        this.frustumBottomPlane.a=this.clipPlane[3]+this.clipPlane[1];
        this.frustumBottomPlane.b=this.clipPlane[7]+this.clipPlane[5];
        this.frustumBottomPlane.c=this.clipPlane[11]+this.clipPlane[9];
        this.frustumBottomPlane.d=this.clipPlane[15]+this.clipPlane[13];
        this.frustumBottomPlane.normalize();

                // near plane

        this.frustumNearPlane.a=this.clipPlane[3]+this.clipPlane[2];
        this.frustumNearPlane.b=this.clipPlane[7]+this.clipPlane[6];
        this.frustumNearPlane.c=this.clipPlane[11]+this.clipPlane[10];
        this.frustumNearPlane.d=this.clipPlane[15]+this.clipPlane[14];
        this.frustumNearPlane.normalize();

                // far plane

        this.frustumFarPlane.a=this.clipPlane[3]-this.clipPlane[2];
        this.frustumFarPlane.b=this.clipPlane[7]-this.clipPlane[6];
        this.frustumFarPlane.c=this.clipPlane[11]-this.clipPlane[10];
        this.frustumFarPlane.d=this.clipPlane[15]-this.clipPlane[14];
        this.frustumFarPlane.normalize();
    }

    boundBoxInFrustum(xBound,yBound,zBound)
    {
            // check if outside the plane, if it is,
            // then it's considered outside the bounds

        if (!this.frustumLeftPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);
        if (!this.frustumRightPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);
        if (!this.frustumTopPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);
        if (!this.frustumBottomPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);
        if (!this.frustumNearPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);
        if (!this.frustumFarPlane.boundBoxOutsidePlane(xBound,yBound,zBound)) return(false);

            // otherwise considered within the frustum planes

        return(true);
    }
    
        //
        // 3d setup
        //
        
    calc3dSetup()
    {
            // create the perspective matrix
            // note this function has a translate in it for NEAR_Z

        this.core.perspectiveMatrix.setPerspectiveMatrix(this.camera.glFOV,this.core.aspect,this.camera.glNearZ,this.camera.glFarZ);

            // the eye point is -this.camera.glNearZ behind
            // the player

        this.eyePos.setFromValues(0,0,-this.camera.glNearZ);
        this.eyeRotMatrix.setTranslationFromPoint(this.camera.position);
        this.eyeRotMatrix2.setRotationFromYAngle(this.camera.angle.y);
        this.eyeRotMatrix.multiply(this.eyeRotMatrix2);
        this.eyeRotMatrix2.setRotationFromXAngle(this.camera.angle.x);
        this.eyeRotMatrix.multiply(this.eyeRotMatrix2);
        this.eyePos.matrixMultiply(this.eyeRotMatrix);
        
        this.runCameraShake();

            // setup the look at

        this.core.viewMatrix.setLookAtMatrix(this.eyePos,this.camera.position,this.lookAtUpVector);
        
            // camera space view matrix
            // (for things like weapons)
            
        this.cameraSpaceEyePos=new PointClass(0,0,-this.camera.glNearZ);
        this.cameraSpacePos=new PointClass(0,0,0);
        this.cameraSpaceViewMatrix.setLookAtMatrix(this.cameraSpaceEyePos,this.cameraSpacePos,this.lookAtUpVector);

            // the 2D ortho matrix (at the core level)

        this.core.orthoMatrix.setOrthoMatrix(this.core.wid,this.core.high,-1.0,1.0);
        
            // build the billboarding matrixes
            // mostly used for particles
            
        this.billboardMatrix.setRotationFromYAngle(this.camera.angle.y);
        this.eyeRotMatrix.setRotationFromXAngle(this.camera.angle.x);
        this.billboardMatrix.multiply(this.eyeRotMatrix);

            // build the culling frustum

        this.buildCullingFrustum();
    }
    
        //
        // game run
        //
        
    run()
    {
            // special keys
            
        if ((this.core.input.isKeyDownAndClear('pageup')) && (this.core.json.developer)) {
            this.core.switchLoop(this.core.LOOP_DEVELOPER);
            return(false);
        }

        if (this.core.input.isKeyDownAndClear('backspace')) {
            this.core.switchLoop(this.core.LOOP_DIALOG_SETTING);
            return(false);
        }

            // score functions

        if (this.multiplayerMode!==this.MULTIPLAYER_MODE_NONE) {
            if (this.core.input.isKeyDownAndClear('`')) this.showScoreDisplay(!this.scoreShow);
        }

            // sequences
            
        if (this.currentSequence!==null) {
            if (this.currentSequence.isFinished()) {
                this.currentSequence.release();
                this.currentSequence=null;
            }
            else {  
                this.currentSequence.run();
            }
        }
        
        return(true);
    }
    
        //
        // draw view
        //

    draw()
    {
        let n;
        let light;
        let player=this.map.entityList.getPlayer();
        let gl=this.core.gl;
         
            // everything overdraws except
            // clear the depth buffer
            
        gl.clear(gl.DEPTH_BUFFER_BIT);
        
            // setup the view camera based on
            // the camera settings and the camera entity
            
        this.camera.setup(player);
        this.calc3dSetup();
        
            // run the effect draw setups first
            // so lighting positions are set
            
        this.map.effectList.drawSetup();
        
            // convert view lights to shader lights
            // all lights need a eye coordinate, so calc
            // that here
            
        this.lights=[];

        this.map.lightList.addLightsToViewLights();
        this.map.effectList.addLightsToViewLights();
        this.map.lightList.addLightsToViewLightsAmbients();     // there is a special ambient flag, which always gets into the list
        
            // fill in any missing lights with NULL

        while (this.lights.length<this.core.MAX_LIGHT_COUNT) {
            this.lights.push(null);
        }
        
            // and create light eye cordinates

        for (n=0;n!==this.core.MAX_LIGHT_COUNT;n++) {
            light=this.lights[n];
            if (light!==null) this.convertToEyeCoordinates(light.position,light.eyePosition);
        }
        
            // draw the map
            
        this.map.background.draw();
        this.map.sky.draw();
        this.map.meshList.drawMap();
        if (this.map.hasShadowmap) this.map.meshList.drawMapShadow();
        
            // draw any non held entities
            
        this.map.entityList.draw(null);
        
            // liquids
            
        this.map.liquidList.draw();
        
            // effects
            
        this.map.effectList.draw();
        
            // and finally held entities,
            // clearing the z buffer first
            
        gl.clear(gl.DEPTH_BUFFER_BIT);
        this.map.entityList.draw(player);
        
            // interface
            
        if (!this.hideUI) this.core.interface.drawGame();
        
            // sequences
            
        if (this.currentSequence!==null) this.currentSequence.draw();
    }
    
        //
        // loading screen
        //
    
    loadingScreenClear()
    {
        this.loadingStrings=[];
    }
    
    loadingScreenAddString(str)
    {
        this.loadingStrings.push(str);
        
        this.loadingLastAddMsec=Date.now();
    }
    
    loadingScreenUpdate()
    {
        let msec;
        let idx=this.loadingStrings.length-1;
        if (idx<0) return;
        
        msec=Date.now()-this.loadingLastAddMsec;
        
        this.loadingStrings[idx]+=(' ['+msec+'ms]');
        
        console.info(this.loadingStrings[idx]);      // supergumba -- temporary for optimization testing
    }
    
    loadingScreenDraw()
    {
        let gl=this.core.gl;
        
            // the 2D ortho matrix

        this.core.orthoMatrix.setOrthoMatrix(this.core.wid,this.core.high,-1.0,1.0);
        
            // clear to black
            
        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT,gl.DEPTH_BUFFER_BIT);
        
            // debug console
            
        this.core.interface.drawDebugConsole(this.loadingStrings);
    }
    
        //
        // loop
        //
        
    loop()
    {
        const PHYSICS_MILLISECONDS=16;
        const DRAW_MILLISECONDS=16;
        const BAIL_MILLISECONDS=5000;

        let systemTick,runTick,drawTick;
        let fpsTime;

            // loop uses it's own tick (so it
            // can be paused, etc) and calculates
            // it from the system tick

        systemTick=Math.trunc(window.performance.now());
        this.timestamp+=(systemTick-this.lastSystemTimestamp);
        this.lastSystemTimestamp=systemTick;

            // map movement, entities, and
            // other physics, we only do this if we've
            // moved unto another physics tick

            // this timing needs to be precise so
            // physics remains constants

        runTick=this.timestamp-this.lastRunTimestamp;

        if (runTick>PHYSICS_MILLISECONDS) {

            if (runTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

                while (runTick>PHYSICS_MILLISECONDS) {
                    runTick-=PHYSICS_MILLISECONDS;
                    this.lastRunTimestamp+=PHYSICS_MILLISECONDS;

                    this.map.meshList.run();
                    if (!this.run()) return;            // returns false if loop is changing
                    this.map.entityList.run();
                }
            }
            else {
                this.lastRunTimestamp=this.timestamp;
            }

                // update the listener and all current
                // playing sound positions

            this.core.audio.updateListener();

                // if multiplayer, handle all
                // the network updates and messages

            if (this.multiplayerMode===this.MULTIPLAYER_MODE_JOIN) this.core.network.run();
        }

            // clean up deleted entities
            // and effects

        this.map.entityList.cleanUpMarkedAsDeleted();
        this.map.effectList.cleanUpMarkedAsDeleted();

            // exit game trigger
            
        if (this.exitGame) {
            this.release();
            this.core.switchLoop(this.core.LOOP_TITLE);
            return;
        }

            // drawing

            // this timing is loose, as it's only there to
            // draw frames

        drawTick=this.timestamp-this.lastDrawTimestamp;
        
        if (drawTick>DRAW_MILLISECONDS) {
            this.lastDrawTimestamp=this.timestamp; 

            this.draw();

            this.fpsTotal+=drawTick;
            this.fpsCount++;
        }

            // the fps

        if (this.fpsStartTimestamp===-1) this.fpsStartTimestamp=this.timestamp; // a reset from paused state

        fpsTime=this.timestamp-this.fpsStartTimestamp;
        if (fpsTime>=1000) {
            this.fps=(this.fpsCount*1000.0)/this.fpsTotal;
            this.fpsStartTimestamp=this.timestamp;

            this.fpsTotal=0;
            this.fpsCount=0;
        }

            // special check for touch controls
            // pausing the game

        //if (this.core.input.touchMenuTrigger) this.core.setPauseState(true,false);
    }

}

