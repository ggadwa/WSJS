import PointClass from '../utility/point.js';
import EntityClass from '../project/entity.js';

export default class EntityContainerClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.openAnimation=null;
        this.openingAnimation=null;
        this.closedAnimation=null;
        this.closingAnimation=null;
        
        this.openOnce=false;
        this.openOnActionKey=false;
        this.openDistance=0;
        this.openPause=0;
        
        this.openSound=null;
        this.closeSound=null;
        
        this.opened=false;
        this.pauseTick=0;
        
        Object.seal(this);
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.openAnimation=this.core.game.lookupAnimationValue(this.json.animations.openAnimation);
        this.openingAnimation=this.core.game.lookupAnimationValue(this.json.animations.openingAnimation);
        this.closedAnimation=this.core.game.lookupAnimationValue(this.json.animations.closedAnimation);
        this.closingAnimation=this.core.game.lookupAnimationValue(this.json.animations.closingAnimation);
        
        this.opened=this.core.game.lookupValue(this.json.config.startOpened,this.data,false);
        this.openOnce=this.core.game.lookupValue(this.json.config.openOnce,this.data,false);
        this.openOnActionKey=this.core.game.lookupValue(this.json.config.openOnActionKey,this.data,'');
        this.openDistance=this.core.game.lookupValue(this.json.config.openDistance,this.data,0);
        this.openPause=this.core.game.lookupValue(this.json.config.openPause,this.data,false);
        
        this.openSound=this.core.game.lookupSoundValue(this.json.sounds.openSound);
        this.closeSound=this.core.game.lookupSoundValue(this.json.sounds.closeSound);
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        if (this.opened) {
            this.modelEntityAlter.startAnimationChunkInFrames(this.openAnimation);
        }
        else {
            this.modelEntityAlter.startAnimationChunkInFrames(this.closedAnimation);
        }
    }
        
    run()
    {
        super.run();
        
        let player,actionKeyDown,triggers;
        
            // in a pause tick means no changes
            
        if (this.pauseTick>this.core.game.timestamp) return;
        
            // nothing to do if opened
            // and can only open once
            
        if ((this.opened) && (this.openOnce)) return;
        
            // check for open/close conditions
            
        if (this.openOnActionKey) {
            if ((!this.core.input.isKeyDown('e')) && (!this.core.input.isTouchStickLeftClick())) return;
        }
        
        player=this.core.map.entityList.getPlayer();
        actionKeyDown=(this.position.distance(player.position)<this.openDistance);
        
        triggers=null;
        
            // need to open?
            
        if ((actionKeyDown) && (!this.opened)) {
            this.opened=true;
            this.pauseTick=this.core.game.timestamp+this.openPause;
            
            if (this.openSound!==null) this.core.soundList.playJson(this.position,this.openSound);
            this.modelEntityAlter.startAnimationChunkInFrames(this.openingAnimation);
            this.modelEntityAlter.queueAnimationChunkInFrames(this.openAnimation);
            
            this.runActions(player,this.json.config.openActions);
            return;
        }
        
            // need to close?
        
        if ((actionKeyDown) && (this.opened)) {
            this.opened=false;
            this.pauseTick=this.core.game.timestamp+this.openPause;
            
            if (this.closeSound!==null) this.core.soundList.playJson(this.position,this.closeSound);
            this.modelEntityAlter.startAnimationChunkInFrames(this.closingAnimation);
            this.modelEntityAlter.queueAnimationChunkInFrames(this.closedAnimation);
            
            this.runActions(player,this.json.config.closeActions);
            return;
        }
    }
    
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromPoint(this.angle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

