import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import SequenceBitmapClass from '../sequence/sequence_bitmap.js';
import SequenceEntityClass from '../sequence/sequence_entity.js';
import SequenceSoundClass from '../sequence/sequence_sound.js';

export default class SequenceClass
{
    constructor(core,jsonName)
    {
        this.POSITION_MODE_TOP_LEFT=0;
        this.POSITION_MODE_TOP_RIGHT=1;
        this.POSITION_MODE_BOTTOM_LEFT=2;
        this.POSITION_MODE_BOTTOM_RIGHT=3;
        this.POSITION_MODE_MIDDLE=4;
        
        this.POSITION_MODE_LIST=['topLeft','topRight','bottomLeft','bottomRight','middle'];

        this.DRAW_MODE_OPAQUE=0;
        this.DRAW_MODE_TRANSPARENT=1;
        this.DRAW_MODE_ADDITIVE=2;
        
        this.DRAW_MODE_LIST=['opaque','transparent','additive'];
        
        this.core=core;
        
        this.jsonName=jsonName;
        this.json=null;
        
        this.startTimestamp=0;
        this.lastSoundPlayIdx=0;
        
        this.bitmaps=[];
        this.entities=[];
        this.sounds=[];
        
        Object.seal(this);
    }
    
    async initialize()
    {
        let resp,url;
        let bitmapDef,bitmap;
        let entityDef,entity;
        let soundDef,sound;
        let name,colorURL,mode,drawMode,positionMode;
        
            // get the json
            
        url='../sequences/'+this.jsonName+'.json';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) { 
                console.info(`Unable to load ${url}; ${resp.statusText}`);
                return(false);
            }
            
            this.json=await resp.json();
        }
        catch (e) {
            console.info(`Unable to load ${url}; ${e.message}`);
            return(false);
        }
        
            // load any bitmaps
            
        this.bitmaps=[];
        
        if (this.json.bitmaps!==undefined) {
            
            for (bitmapDef of this.json.bitmaps) {
                
                    // setup the bitmap

                mode=this.core.game.lookupValue(bitmapDef.drawMode,this.data);
                drawMode=this.DRAW_MODE_LIST.indexOf(mode);
                if (drawMode===-1) {
                    console.log('Unknown sequence bitmap draw mode: '+mode);
                    return(false);
                }
                
                mode=this.core.game.lookupValue(bitmapDef.positionMode,this.data);
                positionMode=this.POSITION_MODE_LIST.indexOf(mode);
                if (positionMode===-1) {
                    console.log('Unknown sequence bitmap position mode: '+mode);
                    return(false);
                }
                
                colorURL=this.core.game.lookupValue(bitmapDef.bitmap,this.data);
                
                bitmap=new SequenceBitmapClass(this.core,this,colorURL,positionMode,drawMode,bitmapDef.frames);
                if (!(await bitmap.initialize())) return(false);
                
                this.bitmaps.push(bitmap);
            }
        }
        
            // load any entities
            
        this.entities=[];
        
        if (this.json.entities!==undefined) {
            
            for (entityDef of this.json.entities) {
                
                name=this.core.game.lookupValue(entityDef.entity,this.data);
                entity=new SequenceEntityClass(this.core,this,name,entityDef.frames);
                if (!entity.initialize()) return(false);
                
                this.entities.push(entity);
            }
        }
        
            // load any sounds
            
        this.sounds=[];
        
        if (this.json.sounds!==undefined) {
            
            for (soundDef of this.json.sounds) {
                
                name=this.core.game.lookupValue(soundDef.name,this.data);
                sound=new SequenceSoundClass(this.core,this,name,soundDef);
                if (!sound.initialize()) return(false);
                
                this.sounds.push(sound);
            }
        }
        
        return(true);
    }

    release()
    {
        let bitmap,entity,sound;
        
            // release any bitmaps/entities
            
        for (bitmap of this.bitmaps) {
            bitmap.release();
        }
        
        for (entity of this.entities) {
            entity.release();
        }
        
        for (sound of this.sounds) {
            sound.release();
        }
    }
    
        //
        // start and stop
        //
        
    start()
    {
        let entity;
        
        this.startTimestamp=this.core.game.timestamp;
        
            // stop any music
            
        this.core.audio.musicStop();
        
            // no sounds played yet
            
        this.lastSoundPlayIdx=0;
        
            // setup the entities
            
        for (entity of this.entities) {
            entity.start();
        }
    }
    
    stop()
    {
        let entity;
        
            // all freezes end
         
        this.core.game.freezePlayer=false;
        this.core.game.freezeAI=false;
        this.core.game.hideUI=false;
        
            // get entities back to original position
            
        for (entity of this.entities) {
            entity.stop();
        }
        
            // the exit flag
            
        if (this.json.exitLevel) {
            this.core.game.exitGame=true;
            return;
        }
        
            // restart any music
            
        this.core.audio.musicStart(this.core.game.map.music);
    }
    
    isFinished()
    {
        return(this.core.game.timestamp>(this.startTimestamp+this.json.lifeTick));
    }
    
        //
        // mainline run
        //
        
    run()
    {
        let n,tick,entity,sound;
        let game=this.core.game;
        
        tick=game.timestamp-this.startTimestamp;
        
            // freezes
         
        if (this.json.freezePlayer!==null) {
            game.freezePlayer=((tick>=this.json.freezePlayer[0])&&(tick<this.json.freezePlayer[1]));
        }
        if (this.json.freezeAI!==null) {
            game.freezeAI=((tick>=this.json.freezeAI[0])&&(tick<this.json.freezeAI[1]));
        }
        if (this.json.hideUI!==null) {
            game.hideUI=((tick>=this.json.hideUI[0])&&(tick<this.json.hideUI[1]));
        }
        
            // entities
            
        for (entity of this.entities) {
            entity.run(tick);
        }

            // sound effects
        
        for (n=this.lastSoundPlayIdx;n<this.sounds.length;n++) {
            sound=this.sounds[n];
            if (tick>=sound.json.tick) {
                this.lastSoundPlayIdx=n+1;
                this.core.audio.soundStartGame2(sound.sound,null,sound.json);
            }
        }
    }
    
        //
        // mainline draw
        //
        
    draw()
    {
        let bitmap;
        let gl=this.core.gl;
        let shader=this.core.shaderList.interfaceShader;
        
            // bitmaps have an interface draw
        
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);

        shader.drawStart();
        
            // run through the bitmaps
            
        for (bitmap of this.bitmaps) {
            bitmap.draw(shader,this.startTimestamp);
        }
        
        shader.drawEnd();
        
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }

}
