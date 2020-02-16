import PointClass from '../utility/point.js';
import BlockClass from '../project/block.js';

export default class BlockContainerClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.opened=true;
        this.pauseTick=0;
    }
    
    initialize(entity)
    {
        this.opened=this.block.startOpened;
        this.pauseTick=0;
        
        return(true);
    }
    
    ready(entity)
    {
        if (this.opened) {
            entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.block.openAnimation[0],this.block.openAnimation[1]);
        }
        else {
            entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.block.closedAnimation[0],this.block.closedAnimation[1]);
        }
    }
    
    run(entity)
    {
        let player,goOpen,triggers;
        
            // in a pause tick means no changes
            
        if (this.pauseTick>this.core.timestamp) return;
        
            // nothing to do if opened
            // and can only open once
            
        if ((this.opened) && (this.block.openOnce)) return;
        
            // check for open/close conditions
            
        if (this.block.openOnActionKey) {
            if (!this.core.input.isKeyDown('e')) return;
        }
        
        player=this.core.map.entityList.getPlayer();
        goOpen=(entity.position.distance(player.position)<this.block.openDistance);
        
        triggers=null;
        
            // need to open?
            
        if ((goOpen) && (!this.opened)) {
            this.opened=true;
            this.pauseTick=this.core.timestamp+this.block.openPause;
            
            this.core.soundList.play(entity,null,'chime',1.0,false);
            entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.block.openingAnimation[0],this.block.openingAnimation[1]);
            entity.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.block.openAnimation[0],this.block.openAnimation[1]);
            
            this.runActions(entity,this.block.openActions);
            return;
        }
        
            // need to close?
        
        if ((!goOpen) && (this.opened)) {
            this.opened=false;
            this.pauseTick=this.core.timestamp+this.block.openPause;
            
            this.core.soundList.play(entity,null,'chime',1.0,false);
            entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.block.closingAnimation[0],this.block.closingAnimation[1]);
            entity.modelEntityAlter.queueAnimationChunkInFrames(null,30,this.block.closedAnimation[0],this.block.closedAnimation[1]);
            
            this.runActions(entity,this.block.closeActions);
            return;
        }
    }
    
    drawSetup(entity)
    {
        if (entity.model===null) return(false);
        
        entity.modelEntityAlter.position.setFromPoint(entity.position);
        entity.modelEntityAlter.angle.setFromPoint(entity.angle);
        entity.modelEntityAlter.scale.setFromPoint(entity.scale);
        entity.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

