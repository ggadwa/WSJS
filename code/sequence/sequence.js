import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import SequenceBitmapClass from '../sequence/sequence_bitmap.js';
import SequenceEntityClass from '../sequence/sequence_entity.js';

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
        
        Object.seal(this);
    }
    
    isFinished()
    {
        return(this.core.game.timestamp>(this.startTimestamp+this.json.lifeTick));
    }
    
    lookupValue(value)
    {
        return(this.core.game.lookupValue(value,this.data));
    }
    
    initialize()
    {
        let bitmapDef,sequenceBitmap,bitmap;
        let entityDef,sequenceEntity;
        let name,mode,drawMode,positionMode;
        
        this.startTimestamp=this.core.game.timestamp;
        
            // get the named json
            
        this.json=this.core.game.jsonSequenceCache.get(this.jsonName);
        if (this.json===undefined) return(false);
        
            // stop any music
            
        this.core.audio.musicStop();
        
            // setup the bitmaps
            
        this.bitmaps=[];
        
        if (this.json.bitmaps!==undefined) {
            
            for (bitmapDef of this.json.bitmaps) {
                
                    // setup the bitmap

                mode=this.lookupValue(bitmapDef.drawMode);
                drawMode=this.DRAW_MODE_LIST.indexOf(mode);
                if (drawMode===-1) {
                    console.log('Unknown sequence bitmap draw mode: '+mode);
                    return(false);
                }
                
                mode=this.lookupValue(bitmapDef.positionMode);
                positionMode=this.POSITION_MODE_LIST.indexOf(mode);
                if (positionMode===-1) {
                    console.log('Unknown sequence bitmap position mode: '+mode);
                    return(false);
                }
                
                name=this.lookupValue(bitmapDef.bitmap);
                bitmap=this.core.bitmapList.get(name);
                if (bitmap===undefined) {
                    console.log('Unknown sequence bitmap: '+name);
                    return(false);
                }
                
                sequenceBitmap=new SequenceBitmapClass(this.core,this,bitmap,positionMode,drawMode,bitmapDef.frames);
                if (!sequenceBitmap.initialize()) return(false);
                
                this.bitmaps.push(sequenceBitmap);
            }
        }
        
            // setup entities
            
        this.entities=[];
        
        if (this.json.entities!==undefined) {
            
            for (entityDef of this.json.entities) {
                
                name=this.lookupValue(entityDef.entity);
                sequenceEntity=new SequenceEntityClass(this.core,this,name,entityDef.frames);
                if (!sequenceEntity.initialize()) return(false);
                
                this.entities.push(sequenceEntity);
            }
        }
        
            // no sounds played yet
            
        this.lastSoundPlayIdx=0;
        
        return(true);
    }

    release()
    {
        let sequenceBitmap,sequenceEntity;

            // all freezes end
         
        this.core.game.freezePlayer=false;
        this.core.game.freezeAI=false;
        this.core.game.hideUI=false;
        
            // release any bitmaps/entities
            
        for (sequenceBitmap of this.bitmaps) {
            sequenceBitmap.release();
        }
        
        for (sequenceEntity of this.entities) {
            sequenceEntity.release();
        }
        
            // the exit flag
            
        if (this.json.exitLevel) {
            this.core.game.exitGame=true;
            return;
        }
        
            // restart any music
            
        this.core.audio.musicStart(this.core.game.map.music);
    }
    
        //
        // mainline run
        //
        
    run()
    {
        let n,tick,sequenceEntity;
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
            
        for (sequenceEntity of this.entities) {
            sequenceEntity.run(tick);
        }

            // sound effects
        
        if (this.json.sounds!==undefined) {
            for (n=this.lastSoundPlayIdx;n<this.json.sounds.length;n++) {
                if (tick>=this.json.sounds[n].tick) {
                    this.lastSoundPlayIdx=n+1;
                    this.core.audio.soundStartGame(this.core.game.map.soundList,null,this.json.sounds[n]);
                }
            }
        }
    }
    
        //
        // mainline draw
        //
        
    draw()
    {
        let sequenceBitmap;
        let gl=this.core.gl;
        let shader=this.core.shaderList.interfaceShader;
        
            // bitmaps have an interface draw
        
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);

        shader.drawStart();
        
            // run through the bitmaps
            
        for (sequenceBitmap of this.bitmaps) {
            sequenceBitmap.draw(shader,this.startTimestamp);
        }
        
        shader.drawEnd();
        
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }

}
