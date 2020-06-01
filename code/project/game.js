import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
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
        
        this.jsonEffectCache=[];
        this.jsonEntityCache=[];
        
        this.scores=null;
        this.scoreShow=false;
        this.scoreLastItemCount=0;
        this.scoreColor=new ColorClass(0,1,0.2);
    }
    
        //
        // load json from network
        //
        
    async fetchJson(name)
    {
        let resp;
        let url='../json/'+name+'.json';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.json());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
 
        //
        // json caches and utilities
        //
        
    getCachedJsonEffect(name)
    {
        let n;
        
        for (n=0;n!==this.jsonEffectCache.length;n++) {
            if (this.jsonEffectCache[n].name===name) return(this.jsonEffectCache[n]);
        }
        
        console.log('Unknown effect: '+name);
        return(null);
    }
    
    getCachedJsonEntity(name)
    {
        let n;
        
        for (n=0;n!==this.jsonEntityCache.length;n++) {
            if (this.jsonEntityCache[n].name===name) return(this.jsonEntityCache[n]);
        }
        
        console.log('Unknown entity: '+name);
        return(null);
    }
    
    lookupValue(value,data,valueDefault)
    {
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

        //
        // game initialize/release
        //
        
    async initialize()
    {
        let data;
        
            // get the main game json
            // this is the only hard coded json file
        
        data=null;
        
        await this.fetchJson('game')
            .then
                (
                    value=>{
                        data=value;
                    },
                    value=>{
                        console.log(value);
                    }
                );
        
        if (data===null) return(false);
           
        this.json=data;
        
            // effects
            
        data=null;
        
        await this.fetchJson('effect')
            .then
                (
                    value=>{
                        data=value;
                    },
                    value=>{
                        console.log(value);
                    }
                );
        
        if (data===null) return(false);
        
        this.jsonEffectCache=data;
        
            // entities
            
        data=null;
        
        await this.fetchJson('entity')
            .then
                (
                    value=>{
                        data=value;
                    },
                    value=>{
                        console.log(value);
                    }
                );
        
        if (data===null) return(false);
        
        this.jsonEntityCache=data;
            
        return(true);
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
                if (entity.fighter) this.scores.set(entity.name,0);
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
            
        if ((fromEntity!==null) && (fromEntity.fighter)) {
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
            if (this.core.input.isKeyDownAndClear('/')) this.showScoreDisplay(!this.scoreShow);
        }
        
            // developer functions
            
        if (this.json.developer) this.developer.run();
    }
}
