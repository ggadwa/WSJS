import PointClass from '../utility/point.js';
import ProjectEntityClass from '../project/project_entity.js';

export default class EntityContainerClass extends ProjectEntityClass
{
    constructor(core,name,json,position,angle,data)
    {
        super(core,name,json,position,angle,data);
        
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
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.openAnimation=this.json.config.openAnimation;
        this.openingAnimation=this.json.config.openingAnimation;
        this.closedAnimation=this.json.config.closedAnimation;
        this.closingAnimation=this.json.config.closingAnimation;
        
        this.opened=this.core.game.lookupValue(this.json.config.startOpened,this.data);
        this.openOnce=this.core.game.lookupValue(this.json.config.openOnce,this.data);
        this.openOnActionKey=this.core.game.lookupValue(this.json.config.openOnActionKey,this.data);
        this.openDistance=this.core.game.lookupValue(this.json.config.openDistance,this.data);
        this.openPause=this.core.game.lookupValue(this.json.config.openPause,this.data);
        
        this.openSound=this.json.config.openSound;
        this.closeSound=this.json.config.closeSound;
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        if (this.opened) {
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.openAnimation[0],this.openAnimation[1]);
        }
        else {
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.closedAnimation[0],this.closedAnimation[1]);
        }
    }
        
    run()
    {
        super.run();
        
        let player,actionKeyDown,triggers;
        
            // in a pause tick means no changes
            
        if (this.pauseTick>this.core.timestamp) return;
        
            // nothing to do if opened
            // and can only open once
            
        if ((this.opened) && (this.openOnce)) return;
        
            // check for open/close conditions
            
        if (this.openOnActionKey) {
            if (!this.core.input.isKeyDown('e')) return;
        }
        
        player=this.core.map.entityList.getPlayer();
        actionKeyDown=(this.position.distance(player.position)<this.openDistance);
        
        triggers=null;
        
            // need to open?
            
        if ((actionKeyDown) && (!this.opened)) {
            this.opened=true;
            this.pauseTick=this.core.timestamp+this.openPause;
            
            this.core.soundList.playJson(this,null,this.openSound);
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.openingAnimation[0],this.openingAnimation[1]);
            this.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.openAnimation[0],this.openAnimation[1]);
            
            this.runActions(player,this.json.config.openActions);
            return;
        }
        
            // need to close?
        
        if ((actionKeyDown) && (this.opened)) {
            this.opened=false;
            this.pauseTick=this.core.timestamp+this.openPause;
            
            this.core.soundList.playJson(this,null,this.closeSound);
            this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.closingAnimation[0],this.closingAnimation[1]);
            this.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.closedAnimation[0],this.closedAnimation[1]);
            
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

