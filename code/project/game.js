import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
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
        
        this.scores=null;
        this.scoreShow=false;
        this.scoreLastItemCount=0;
        this.scoreColor=new ColorClass(0,1,0.2);
        
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
